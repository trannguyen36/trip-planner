"use client";

import { useMemo, useState } from "react";
import { destinations } from "./data/destinations";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  May,
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STYLES = ["Budget", "Mid-range", "Luxury"];

const DEFAULTS = {
  from: "Ho Chi Minh City",
  budget: 1500,
  travelers: 2,
  days: 7,
  month: "November",
  style: "Mid-range",
};

function money(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function calculateTrip(destination, days, travelers, style) {
  const costs = destination.costs[style];

  const hotel = costs.hotel * Math.max(days - 1, 1);
  const food = costs.food * days;
  const transport = costs.transport * days;
  const activities = costs.activities * days;

  const flight = destination.flightFromHCMC * travelers;

  const total =
    flight +
    (hotel + food + transport + activities) * travelers;

  return {
    flight,
    hotel: hotel * travelers,
    food: food * travelers,
    transport: transport * travelers,
    activities: activities * travelers,
    total,
  };
}

function monthScore(destination, month) {
  if (!month) return 0;

  if (destination.bestMonths.includes(month)) {
    return 1;
  }

  return 0;
}

function styleScore(destination, style) {
  if (destination.costs[style]) {
    return 1;
  }

  return 0;
}

function getDestinationScore({
  destination,
  total,
  budget,
  month,
  style,
}) {
  const budgetRatio = total / budget;

  let score = 0;

  // Strong preference for destinations that fit the budget.
  if (total <= budget) {
    score += 100;
  } else {
    // Penalize destinations increasingly as they exceed budget.
    score -= Math.min((budgetRatio - 1) * 100, 100);
  }

  // Good travel month.
  if (monthScore(destination, month)) {
    score += 30;
  } else {
    score -= 10;
  }

  // Requested style exists.
  score += styleScore(destination, style) * 10;

  // Prefer destinations that use a reasonable portion of the budget.
  // This prevents extremely cheap destinations always dominating.
  if (total <= budget) {
    const utilization = total / budget;

    if (utilization >= 0.65 && utilization <= 1) {
      score += 20;
    } else if (utilization >= 0.45) {
      score += 10;
    }
  }

  return score;
}

function getReason(destination, trip, budget, month) {
  const reasons = [];

  if (trip.total <= budget) {
    reasons.push("Fits your budget");
  } else {
    reasons.push(`${money(trip.total - budget)} over budget`);
  }

  if (destination.bestMonths.includes(month)) {
    reasons.push(`Good time to visit in ${month}`);
  } else {
    reasons.push(`${month} is outside the recommended months`);
  }

  return reasons;
}

export default function HomePage() {
  const [from, setFrom] = useState(DEFAULTS.from);
  const [budget, setBudget] = useState(DEFAULTS.budget);
  const [travelers, setTravelers] = useState(DEFAULTS.travelers);
  const [days, setDays] = useState(DEFAULTS.days);
  const [month, setMonth] = useState(DEFAULTS.month);
  const [style, setStyle] = useState(DEFAULTS.style);

  const [destinationMode, setDestinationMode] = useState("flexible");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const [result, setResult] = useState(null);

  const countries = useMemo(() => {
    return [...new Set(destinations.map((item) => item.country))];
  }, []);

  const availableCities = useMemo(() => {
    if (!country) return destinations;

    return destinations.filter(
      (item) => item.country === country
    );
  }, [country]);

  function calculateFlexible() {
    const ranked = destinations
      .map((destination) => {
        const trip = calculateTrip(
          destination,
          days,
          travelers,
          style
        );

        const score = getDestinationScore({
          destination,
          total: trip.total,
          budget,
          month,
          style,
        });

        return {
          destination,
          trip,
          score,
          reasons: getReason(
            destination,
            trip,
            budget,
            month
          ),
        };
      })
      .sort((a, b) => b.score - a.score);

    setResult({
      type: "flexible",
      recommendations: ranked.slice(0, 3),
    });
  }

  function calculateSpecific() {
    const destination = destinations.find(
      (item) =>
        item.country === country &&
        item.city === city
    );

    if (!destination) {
      return;
    }

    const trip = calculateTrip(
      destination,
      days,
      travelers,
      style
    );

    const reasons = getReason(
      destination,
      trip,
      budget,
      month
    );

    setResult({
      type: "specific",
      destination,
      trip,
      reasons,
    });
  }

  function handleCalculate() {
    if (destinationMode === "flexible") {
      calculateFlexible();
    } else {
      calculateSpecific();
    }

    window.setTimeout(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  function resetPlanner() {
    setFrom(DEFAULTS.from);
    setBudget(DEFAULTS.budget);
    setTravelers(DEFAULTS.travelers);
    setDays(DEFAULTS.days);
    setMonth(DEFAULTS.month);
    setStyle(DEFAULTS.style);
    setDestinationMode("flexible");
    setCountry("");
    setCity("");
    setResult(null);
  }

  function applyDestination(destination) {
    setDestinationMode("specific");
    setCountry(destination.country);
    setCity(destination.city);

    const trip = calculateTrip(
      destination,
      days,
      travelers,
      style
    );

    setResult({
      type: "specific",
      destination,
      trip,
      reasons: getReason(
        destination,
        trip,
        budget,
        month
      ),
    });
  }

  function applyShorterTrip(destination) {
    const newDays = Math.max(3, days - 2);

    setDays(newDays);

    const trip = calculateTrip(
      destination,
      newDays,
      travelers,
      style
    );

    setResult({
      type: "specific",
      destination,
      trip,
      reasons: getReason(
        destination,
        trip,
        budget,
        month
      ),
    });
  }

  function applyCheaperStyle(destination) {
    let cheaperStyle = style;

    if (style === "Luxury") {
      cheaperStyle = "Mid-range";
    } else if (style === "Mid-range") {
      cheaperStyle = "Budget";
    }

    setStyle(cheaperStyle);

    const trip = calculateTrip(
      destination,
      days,
      travelers,
      cheaperStyle
    );

    setResult({
      type: "specific",
      destination,
      trip,
      reasons: getReason(
        destination,
        trip,
        budget,
        month
      ),
    });
  }

  function adjustBudget(destination, trip) {
    setBudget(Math.ceil(trip.total / 50) * 50);
  }

  function renderBreakdown(trip) {
    return (
      <div className="breakdown">
        <div>
          <span>Flights</span>
          <strong>{money(trip.flight)}</strong>
        </div>

        <div>
          <span>Hotels</span>
          <strong>{money(trip.hotel)}</strong>
        </div>

        <div>
          <span>Food</span>
          <strong>{money(trip.food)}</strong>
        </div>

        <div>
          <span>Transport</span>
          <strong>{money(trip.transport)}</strong>
        </div>

        <div>
          <span>Activities</span>
          <strong>{money(trip.activities)}</strong>
        </div>
      </div>
    );
  }

  function renderOptimization(destination, trip) {
    if (trip.total <= budget) {
      return null;
    }

    const shorterDays = Math.max(3, days - 2);

    const shorterTrip = calculateTrip(
      destination,
      shorterDays,
      travelers,
      style
    );

    let cheaperStyle = style;

    if (style === "Luxury") {
      cheaperStyle = "Mid-range";
    } else if (style === "Mid-range") {
      cheaperStyle = "Budget";
    }

    const cheaperTrip = calculateTrip(
      destination,
      days,
      travelers,
      cheaperStyle
    );

    return (
      <div className="optimizer">
        <div className="optimizer-header">
          <div>
            <span className="eyebrow">
              MAKE IT WORK
            </span>

            <h3>
              This trip is above your budget
            </h3>
          </div>

          <div className="over-budget">
            +{money(trip.total - budget)}
          </div>
        </div>

        <p className="optimizer-text">
          You can reduce the cost without changing
          your destination.
        </p>

        <div className="optimization-options">
          <button
            className="optimization-option"
            onClick={() =>
              applyShorterTrip(destination)
            }
          >
            <span className="option-icon">↓</span>

            <span>
              <strong>
                Stay {shorterDays} days
              </strong>

              <small>
                Save approximately{" "}
                {money(
                  trip.total -
                    shorterTrip.total
                )}
              </small>
            </span>
          </button>

          <button
            className="optimization-option"
            onClick={() =>
              applyCheaperStyle(destination)
            }
          >
            <span className="option-icon">↓</span>

            <span>
              <strong>
                Switch to {cheaperStyle}
              </strong>

              <small>
                Save approximately{" "}
                {money(
                  trip.total -
                    cheaperTrip.total
                )}
              </small>
            </span>
          </button>

          <button
            className="optimization-option"
            onClick={() =>
              adjustBudget(
                destination,
                trip
              )
            }
          >
            <span className="option-icon">↑</span>

            <span>
              <strong>
                Adjust your budget
              </strong>

              <small>
                Set budget to{" "}
                {money(trip.total)}
              </small>
            </span>
          </button>
        </div>
      </div>
    );
  }

  function renderItinerary(destination) {
    return (
      <div className="itinerary">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              SAMPLE PLAN
            </span>

            <h3>
              {days}-day trip in{" "}
              {destination.city}
            </h3>
          </div>
        </div>

        <div className="itinerary-list">
          {destination.itinerary
            .slice(0, Math.min(days, 5))
            .map((item) => (
              <div
                className="itinerary-item"
                key={item.day}
              >
                <div className="day-number">
                  {item.day}
                </div>

                <div>
                  <strong>
                    {item.title}
                  </strong>

                  <p>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  function renderFlexibleResults() {
    if (!result?.recommendations) {
      return null;
    }

    return (
      <section
        id="results"
        className="results-section"
      >
        <div className="results-header">
          <div>
            <span className="eyebrow">
              YOUR OPTIONS
            </span>

            <h2>
              Destinations that match your trip
            </h2>

            <p>
              Based on your budget, travel style,
              trip length and travel month.
            </p>
          </div>
        </div>

        <div className="destination-grid">
          {result.recommendations.map(
            (item) => {
              const destination =
                item.destination;

              const isOverBudget =
                item.trip.total > budget;

              return (
                <div
                  className={`destination-card ${
                    isOverBudget
                      ? "destination-over"
                      : ""
                  }`}
                  key={destination.city}
                >
                  <div className="destination-top">
                    <div>
                      <span className="destination-country">
                        {destination.country}
                      </span>

                      <h3>
                        {destination.city}
                      </h3>
                    </div>

                    <span className="airport">
                      {destination.airport}
                    </span>
                  </div>

                  <div className="destination-price">
                    <span>
                      Estimated trip
                    </span>

                    <strong>
                      {money(
                        item.trip.total
                      )}
                    </strong>

                    <small>
                      for {travelers}{" "}
                      {travelers === 1
                        ? "traveler"
                        : "travelers"}
                    </small>
                  </div>

                  <div className="reason-list">
                    {item.reasons.map(
                      (reason) => (
                        <div
                          key={reason}
                          className={
                            reason.includes(
                              "over"
                            )
                              ? "reason negative"
                              : "reason"
                          }
                        >
                          {reason.includes(
                            "over"
                          )
                            ? "!"
                            : "✓"}{" "}
                          {reason}
                        </div>
                      )
                    )}
                  </div>

                  <button
                    className="primary-button full-width"
                    onClick={() =>
                      applyDestination(
                        destination
                      )
                    }
                  >
                    Plan this trip
                  </button>
                </div>
              );
            }
          )}
        </div>
      </section>
    );
  }

  function renderSpecificResult() {
    if (
      !result ||
      result.type !== "specific"
    ) {
      return null;
    }

    const destination =
      result.destination;

    const trip = result.trip;

    const isOverBudget =
      trip.total > budget;

    const remaining =
      budget - trip.total;

    return (
      <section
        id="results"
        className="results-section"
      >
        <div className="specific-result">
          <div className="specific-result-header">
            <div>
              <span className="eyebrow">
                YOUR TRIP
              </span>

              <h2>
                {destination.city},{" "}
                {destination.country}
              </h2>

              <p>
                {days} days · {travelers}{" "}
                {travelers === 1
                  ? "traveler"
                  : "travelers"}{" "}
                · {style}
              </p>
            </div>

            <div
              className={`budget-status ${
                isOverBudget
                  ? "status-over"
                  : "status-good"
              }`}
            >
              {isOverBudget
                ? "Over budget"
                : "Fits your budget"}
            </div>
          </div>

          <div className="estimate">
            <div className="estimate-main">
              <span>
                Estimated total
              </span>

              <strong>
                {money(trip.total)}
              </strong>

              <small>
                Estimated for {travelers}{" "}
                travelers
              </small>
            </div>

            <div className="estimate-budget">
              <span>Your budget</span>

              <strong>
                {money(budget)}
              </strong>

              {!isOverBudget && (
                <small className="remaining">
                  {money(remaining)} remaining
                </small>
              )}
            </div>
          </div>

          {renderBreakdown(trip)}

          {renderOptimization(
            destination,
            trip
          )}

          <div className="month-note">
            <span>
              {destination.bestMonths.includes(
                month
              )
                ? "✓"
                : "○"}
            </span>

            <div>
              <strong>
                {destination.bestMonths.includes(
                  month
                )
                  ? `Good time to visit in ${month}`
                  : `${month} is not among the recommended months`}
              </strong>

              <p>
                Recommended months:{" "}
                {destination.bestMonths.join(
                  ", "
                )}
              </p>
            </div>
          </div>

          {renderItinerary(destination)}
        </div>
      </section>
    );
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-badge">
          ✈️ SMART TRIP PLANNER
        </div>

        <h1>
          Plan your trip.
          <br />
          <span>Know your budget.</span>
        </h1>

        <p>
          Tell us where you want to go, how
          you like to travel and what you want
          to spend. We’ll help you find a trip
          that fits.
        </p>
      </section>

      <section className="planner-card">
        <div className="planner-top">
          <div>
            <span className="eyebrow">
              TRIP PLANNER
            </span>

            <h2>
              Build your trip
            </h2>
          </div>

          <button
            className="reset-button"
            onClick={resetPlanner}
          >
            Reset
          </button>
        </div>

        <div className="budget-first">
          <div>
            <span className="field-label">
              YOUR MAXIMUM BUDGET
            </span>

            <p>
              How much do you want to spend?
            </p>
          </div>

          <div className="budget-input">
            <span>$</span>

            <input
              type="number"
              min="100"
              value={budget}
              onChange={(e) =>
                setBudget(
                  Number(e.target.value)
                )
              }
            />
          </div>
        </div>

        <div className="destination-mode">
          <span className="field-label">
            DESTINATION
          </span>

          <div className="mode-buttons">
            <button
              className={
                destinationMode ===
                "flexible"
                  ? "mode-button active"
                  : "mode-button"
              }
              onClick={() => {
                setDestinationMode(
                  "flexible"
                );
                setCountry("");
                setCity("");
              }}
            >
              <strong>
                ✨ Flexible
              </strong>

              <small>
                Find destinations that fit
                my budget
              </small>
            </button>

            <button
              className={
                destinationMode ===
                "specific"
                  ? "mode-button active"
                  : "mode-button"
              }
              onClick={() =>
                setDestinationMode(
                  "specific"
                )
              }
            >
              <strong>
                📍 I have a destination
              </strong>

              <small>
                I already know where I want
                to go
              </small>
            </button>
          </div>
        </div>

        {destinationMode ===
          "specific" && (
          <div className="form-grid">
            <div className="field">
              <label>
                Country
              </label>

              <select
                value={country}
                onChange={(e) => {
                  setCountry(
                    e.target.value
                  );
                  setCity("");
                }}
              >
                <option value="">
                  Select country
                </option>

                {countries.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="field">
              <label>
                City
              </label>

              <select
                value={city}
                onChange={(e) =>
                  setCity(
                    e.target.value
                  )
                }
                disabled={!country}
              >
                <option value="">
                  Select city
                </option>

                {availableCities.map(
                  (item) => (
                    <option
                      key={item.city}
                      value={item.city}
                    >
                      {item.city}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}

        <div className="form-grid four">
          <div className="field">
            <label>
              Traveling from
            </label>

            <input
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>
              Travel month
            </label>

            <select
              value={month}
              onChange={(e) =>
                setMonth(e.target.value)
              }
            >
              {MONTHS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>
              Days
            </label>

            <input
              type="number"
              min="2"
              max="30"
              value={days}
              onChange={(e) =>
                setDays(
                  Math.max(
                    2,
                    Number(
                      e.target.value
                    )
                  )
                )
              }
            />
          </div>

          <div className="field">
            <label>
              Travelers
            </label>

            <input
              type="number"
              min="1"
              max="20"
              value={travelers}
              onChange={(e) =>
                setTravelers(
                  Math.max(
                    1,
                    Number(
                      e.target.value
                    )
                  )
                )
              }
            />
          </div>
        </div>

        <div className="style-section">
          <div>
            <span className="field-label">
              TRAVEL STYLE
            </span>

            <p>
              Choose how you want to travel.
            </p>
          </div>

          <div className="style-options">
            {STYLES.map((item) => (
              <button
                key={item}
                className={
                  style === item
                    ? "style-button active"
                    : "style-button"
                }
                onClick={() =>
                  setStyle(item)
                }
              >
                <strong>
                  {item}
                </strong>

                <span>
                  {item === "Budget"
                    ? "Save more"
                    : item === "Mid-range"
                    ? "Comfortable"
                    : "Premium"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="calculate-button"
          onClick={handleCalculate}
          disabled={
            destinationMode ===
              "specific" &&
            (!country || !city)
          }
        >
          Find my trip
          <span>→</span>
        </button>
      </section>

      {result?.type === "flexible" &&
        renderFlexibleResults()}

      {result?.type === "specific" &&
        renderSpecificResult()}

      <section className="trust-section">
        <div>
          <strong>
            Estimates, not live prices
          </strong>

          <p>
            Flight and travel costs are
            approximate estimates designed to
            help you plan your budget. Actual
            prices may vary.
          </p>
        </div>
      </section>
    </main>
  );
}
