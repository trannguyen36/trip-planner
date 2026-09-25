"use client";

import { useMemo, useState } from "react";
import { destinations } from "./data/destinations";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
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
  budget: 1500,
  mode: "flexible",
  country: "Japan",
  city: "Tokyo",
  month: "November",
  days: 7,
  travelers: 2,
  style: "Mid-range",
};

function money(value) {
  return Math.round(value).toLocaleString("en-US");
}

function calculateTrip(destination, days, travelers, style) {
  const rates = destination.costs[style];

  if (!rates) return null;

  const nights = Math.max(0, days - 1);
  const rooms = Math.max(1, Math.ceil(travelers / 2));

  const flight = destination.flightFromHCMC * travelers;
  const hotel = rates.hotel * nights * rooms;
  const food = rates.food * days * travelers;
  const transport = rates.transport * days * travelers;
  const activities = rates.activities * days * travelers;

  const total = flight + hotel + food + transport + activities;

  return {
    flight,
    hotel,
    food,
    transport,
    activities,
    total,
    nights,
    rooms,
    dailyPerPerson:
      rates.food + rates.transport + rates.activities,
  };
}

function getCheapestPlan(destination, days, travelers) {
  return calculateTrip(destination, days, travelers, "Budget");
}

function getBestStyleForBudget(destination, days, travelers, budget) {
  const options = STYLES.map((style) => {
    const result = calculateTrip(destination, days, travelers, style);

    return {
      style,
      ...result,
    };
  });

  const fitting = options
    .filter((option) => option.total <= budget)
    .sort((a, b) => b.total - a.total);

  return fitting[0] || null;
}

function getMinimumDaysForBudget(destination, travelers, budget) {
  for (let days = 1; days <= 30; days++) {
    const result = getCheapestPlan(destination, days, travelers);

    if (result && result.total <= budget) {
      return {
        days,
        ...result,
      };
    }
  }

  return null;
}

function getMonthScore(destination, month) {
  return destination.bestMonths?.includes(month) ? 1 : 0;
}

function getFlexibleDestinations({
  budget,
  days,
  travelers,
  month,
  preferredStyle,
}) {
  const results = [];

  for (const destination of destinations) {
    const styleOrder = [
      preferredStyle,
      ...STYLES.filter((style) => style !== preferredStyle),
    ];

    let selected = null;

    for (const style of styleOrder) {
      const result = calculateTrip(destination, days, travelers, style);

      if (result && result.total <= budget) {
        selected = {
          style,
          ...result,
        };
        break;
      }
    }

    if (selected) {
      const budgetUsage = selected.total / budget;
      const monthScore = getMonthScore(destination, month);

      let score = 0;

      // Prefer trips that use the budget efficiently.
      score += Math.max(0, 1 - Math.abs(0.75 - budgetUsage));

      // Prefer destinations that are good for the selected month.
      score += monthScore * 0.35;

      // Prefer the requested travel style.
      if (selected.style === preferredStyle) {
        score += 0.25;
      }

      results.push({
        destination,
        ...selected,
        score,
        remaining: budget - selected.total,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function getClosestDestinations({
  budget,
  days,
  travelers,
  month,
}) {
  return destinations
    .map((destination) => {
      const cheapest = getCheapestPlan(destination, days, travelers);

      const minimumDays = getMinimumDaysForBudget(
        destination,
        travelers,
        budget
      );

      return {
        destination,
        cheapest,
        minimumDays,
        gap: cheapest.total - budget,
        monthScore: getMonthScore(destination, month),
      };
    })
    .sort((a, b) => {
      if (a.monthScore !== b.monthScore) {
        return b.monthScore - a.monthScore;
      }

      return a.gap - b.gap;
    })
    .slice(0, 3);
}

function FieldLabel({ children, hint }) {
  return (
    <div className="field-label-row">
      <label className="field-label">{children}</label>
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

function ResultStat({ label, value, muted }) {
  return (
    <div className={`result-stat ${muted ? "muted" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function HomePage() {
  const [budget, setBudget] = useState(DEFAULTS.budget);
  const [mode, setMode] = useState(DEFAULTS.mode);

  const [country, setCountry] = useState(DEFAULTS.country);
  const [city, setCity] = useState(DEFAULTS.city);

  const [month, setMonth] = useState(DEFAULTS.month);
  const [days, setDays] = useState(DEFAULTS.days);
  const [travelers, setTravelers] = useState(DEFAULTS.travelers);
  const [style, setStyle] = useState(DEFAULTS.style);

  const [result, setResult] = useState(null);

  const countries = useMemo(
    () => [...new Set(destinations.map((item) => item.country))],
    []
  );

  const citiesForCountry = useMemo(
    () =>
      destinations
        .filter((item) => item.country === country)
        .map((item) => item.city),
    [country]
  );

  const selectedDestination = useMemo(
    () =>
      destinations.find(
        (item) =>
          item.country === country &&
          item.city === city
      ),
    [country, city]
  );

  function handleCountryChange(value) {
    setCountry(value);

    const firstCity = destinations.find(
      (item) => item.country === value
    )?.city;

    if (firstCity) {
      setCity(firstCity);
    }
  }

  function handleFindTrip() {
    const cleanBudget = Math.max(0, Number(budget) || 0);
    const cleanDays = Math.min(
      30,
      Math.max(1, Number(days) || 1)
    );
    const cleanTravelers = Math.min(
      12,
      Math.max(1, Number(travelers) || 1)
    );

    if (mode === "flexible") {
      const matches = getFlexibleDestinations({
        budget: cleanBudget,
        days: cleanDays,
        travelers: cleanTravelers,
        month,
        preferredStyle: style,
      });

      const closest = getClosestDestinations({
        budget: cleanBudget,
        days: cleanDays,
        travelers: cleanTravelers,
        month,
      });

      setResult({
        type: "flexible",
        matches,
        closest,
        budget: cleanBudget,
        days: cleanDays,
        travelers: cleanTravelers,
      });

      return;
    }

    if (!selectedDestination) return;

    const bestFit = getBestStyleForBudget(
      selectedDestination,
      cleanDays,
      cleanTravelers,
      cleanBudget
    );

    const requestedPlan = calculateTrip(
      selectedDestination,
      cleanDays,
      cleanTravelers,
      style
    );

    const cheapest = getCheapestPlan(
      selectedDestination,
      cleanDays,
      cleanTravelers
    );

    const minimumDays = getMinimumDaysForBudget(
      selectedDestination,
      cleanTravelers,
      cleanBudget
    );

    setResult({
      type: "specific",
      destination: selectedDestination,
      bestFit,
      requestedPlan,
      cheapest,
      minimumDays,
      budget: cleanBudget,
      days: cleanDays,
      travelers: cleanTravelers,
      requestedStyle: style,
      month,
    });
  }

  function resetPlanner() {
    setBudget(DEFAULTS.budget);
    setMode(DEFAULTS.mode);
    setCountry(DEFAULTS.country);
    setCity(DEFAULTS.city);
    setMonth(DEFAULTS.month);
    setDays(DEFAULTS.days);
    setTravelers(DEFAULTS.travelers);
    setStyle(DEFAULTS.style);
    setResult(null);
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">✦</div>
          <div>
            <div className="brand-name">Trip Planner</div>
            <div className="brand-subtitle">
              Plan smarter. Spend better.
            </div>
          </div>
        </div>

        <button className="reset-button" onClick={resetPlanner}>
          Reset
        </button>
      </header>

      <section className="hero">
        <div className="eyebrow">SMART TRIP PLANNER</div>

        <h1>
          Plan your trip
          <br />
          <span>within your budget.</span>
        </h1>

        <p className="hero-copy">
          Tell us your budget and travel preferences. We&apos;ll
          find a trip that actually fits.
        </p>
      </section>

      <section className="planner-card">
        <div className="section-heading">
          <div>
            <div className="section-kicker">STEP 1</div>
            <h2>What&apos;s your maximum budget?</h2>
          </div>

          <div className="budget-badge">
            ${money(Number(budget) || 0)}
          </div>
        </div>

        <div className="budget-input-wrap">
          <span>$</span>
          <input
            type="number"
            min="0"
            step="50"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            aria-label="Maximum budget"
          />
        </div>

        <p className="helper-text">
          We won&apos;t recommend a trip that costs more than this
          amount.
        </p>

        <div className="divider" />

        <div className="section-heading compact">
          <div>
            <div className="section-kicker">STEP 2</div>
            <h2>Where do you want to go?</h2>
          </div>
        </div>

        <div className="mode-switch">
          <button
            className={mode === "flexible" ? "active" : ""}
            onClick={() => setMode("flexible")}
          >
            <span className="mode-icon">✦</span>
            <span>
              <strong>Find destinations</strong>
              <small>Show me places that fit my budget</small>
            </span>
          </button>

          <button
            className={mode === "specific" ? "active" : ""}
            onClick={() => setMode("specific")}
          >
            <span className="mode-icon">⌖</span>
            <span>
              <strong>I have a destination</strong>
              <small>I already know where I want to go</small>
            </span>
          </button>
        </div>

        {mode === "specific" ? (
          <div className="specific-destination">
            <div className="field-grid">
              <div className="field">
                <FieldLabel>Country</FieldLabel>

                <select
                  value={country}
                  onChange={(e) =>
                    handleCountryChange(e.target.value)
                  }
                >
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <FieldLabel>City</FieldLabel>

                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {citiesForCountry.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="flexible-message">
            <div className="flexible-icon">✦</div>
            <div>
              <strong>We&apos;ll choose the destination.</strong>
              <p>
                Based on your budget, travel dates and travel
                style, we&apos;ll show destinations that fit.
              </p>
            </div>
          </div>
        )}

        <div className="divider" />

        <div className="section-heading compact">
          <div>
            <div className="section-kicker">STEP 3</div>
            <h2>Tell us about your trip</h2>
          </div>
        </div>

        <div className="field-grid">
          <div className="field">
            <FieldLabel hint="Current estimate">
              Flying from
            </FieldLabel>

            <div className="readonly-field">
              Ho Chi Minh City
              <span>↗</span>
            </div>

            <div className="field-note">
              Flight estimates currently use HCMC as the origin.
            </div>
          </div>

          <div className="field">
            <FieldLabel>Travel month</FieldLabel>

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <FieldLabel hint="Including arrival & departure">
              Trip length
            </FieldLabel>

            <div className="number-input">
              <input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
              <span>days</span>
            </div>
          </div>

          <div className="field">
            <FieldLabel>Travelers</FieldLabel>

            <div className="number-input">
              <input
                type="number"
                min="1"
                max="12"
                value={travelers}
                onChange={(e) =>
                  setTravelers(e.target.value)
                }
              />
              <span>people</span>
            </div>
          </div>
        </div>

        <div className="field travel-style-field">
          <FieldLabel>Travel style</FieldLabel>

          <div className="style-options">
            {[
              {
                value: "Budget",
                title: "Budget",
                description: "Save more",
              },
              {
                value: "Mid-range",
                title: "Mid-range",
                description: "Comfortable",
              },
              {
                value: "Luxury",
                title: "Luxury",
                description: "Premium",
              },
            ].map((option) => (
              <button
                key={option.value}
                className={
                  style === option.value ? "selected" : ""
                }
                onClick={() => setStyle(option.value)}
              >
                <strong>{option.title}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="find-button"
          onClick={handleFindTrip}
        >
          <span>
            {mode === "flexible"
              ? "Find trips that fit my budget"
              : "Check my trip budget"}
          </span>
          <span>→</span>
        </button>
      </section>

      {result && (
        <section className="results-section">
          <div className="results-heading">
            <div>
              <div className="section-kicker">YOUR RESULTS</div>
              <h2>
                {result.type === "flexible"
                  ? "Trips that fit your budget"
                  : `${result.destination.city} trip budget`}
              </h2>
            </div>

            <div className="results-budget">
              Budget: <strong>${money(result.budget)}</strong>
            </div>
          </div>

          {result.type === "flexible" && (
            <>
              {result.matches.length > 0 ? (
                <div className="result-grid">
                  {result.matches.map((item, index) => (
                    <article
                      className={`destination-card ${
                        index === 0 ? "featured" : ""
                      }`}
                      key={`${item.destination.country}-${item.destination.city}`}
                    >
                      {index === 0 && (
                        <div className="recommended-label">
                          BEST FIT
                        </div>
                      )}

                      <div className="destination-top">
                        <div>
                          <div className="destination-country">
                            {item.destination.country}
                          </div>

                          <h3>{item.destination.city}</h3>
                        </div>

                        <div className="fit-icon">✓</div>
                      </div>

                      <div className="trip-meta">
                        <span>{result.days} days</span>
                        <span>•</span>
                        <span>{result.travelers} travelers</span>
                        <span>•</span>
                        <span>{item.style}</span>
                      </div>

                      <div className="destination-cost">
                        <span>Estimated total</span>
                        <strong>${money(item.total)}</strong>
                      </div>

                      <div className="remaining">
                        ${money(item.remaining)} left in your budget
                      </div>

                      <div className="cost-mini">
                        <div>
                          <span>Flights</span>
                          <strong>${money(item.flight)}</strong>
                        </div>

                        <div>
                          <span>Stay</span>
                          <strong>${money(item.hotel)}</strong>
                        </div>

                        <div>
                          <span>Daily spending</span>
                          <strong>
                            $
                            {money(
                              item.food +
                                item.transport +
                                item.activities
                            )}
                          </strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="no-fit-card">
                  <div className="no-fit-icon">!</div>

                  <div>
                    <h3>
                      No destination fits this budget yet.
                    </h3>

                    <p>
                      For {result.travelers} traveler
                      {result.travelers !== 1 ? "s" : ""} and{" "}
                      {result.days} days, even the lowest-cost
                      options are above ${money(result.budget)}.
                    </p>
                  </div>
                </div>
              )}

              {result.matches.length === 0 &&
                result.closest.length > 0 && (
                  <div className="closest-section">
                    <div className="section-kicker">
                      CLOSEST OPTIONS
                    </div>

                    <h3>
                      Here&apos;s what is closest to your budget
                    </h3>

                    <div className="closest-list">
                      {result.closest.map((item) => (
                        <div
                          className="closest-item"
                          key={`${item.destination.country}-${item.destination.city}`}
                        >
                          <div>
                            <strong>
                              {item.destination.city},{" "}
                              {item.destination.country}
                            </strong>

                            <span>
                              Cheapest {result.days}-day plan:
                              {" "}
                              ${money(item.cheapest.total)}
                            </span>
                          </div>

                          <div className="closest-price">
                            +${money(item.gap)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}

          {result.type === "specific" && (
            <>
              {result.bestFit ? (
                <div className="specific-result">
                  <div className="success-banner">
                    <span>✓</span>
                    <div>
                      <strong>
                        {result.destination.city} fits your
                        budget.
                      </strong>

                      {result.bestFit.style !==
                        result.requestedStyle && (
                        <p>
                          We switched from{" "}
                          <strong>
                            {result.requestedStyle}
                          </strong>{" "}
                          to{" "}
                          <strong>
                            {result.bestFit.style}
                          </strong>{" "}
                          to stay within your budget.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="main-result-card">
                    <div className="main-result-left">
                      <div className="destination-country">
                        {result.destination.country}
                      </div>

                      <h3>{result.destination.city}</h3>

                      <div className="trip-meta">
                        <span>{result.days} days</span>
                        <span>•</span>
                        <span>
                          {result.travelers} travelers
                        </span>
                        <span>•</span>
                        <span>{result.bestFit.style}</span>
                      </div>
                    </div>

                    <div className="main-result-total">
                      <span>Estimated total</span>
                      <strong>
                        ${money(result.bestFit.total)}
                      </strong>

                      <small>
                        ${money(
                          result.budget -
                            result.bestFit.total
                        )}{" "}
                        left
                      </small>
                    </div>
                  </div>

                  <div className="cost-breakdown">
                    <ResultStat
                      label="Flights"
                      value={`$${money(result.bestFit.flight)}`}
                    />

                    <ResultStat
                      label={`Hotel · ${result.bestFit.nights} nights`}
                      value={`$${money(result.bestFit.hotel)}`}
                    />

                    <ResultStat
                      label="Food"
                      value={`$${money(result.bestFit.food)}`}
                    />

                    <ResultStat
                      label="Transport"
                      value={`$${money(
                        result.bestFit.transport
                      )}`}
                    />

                    <ResultStat
                      label="Activities"
                      value={`$${money(
                        result.bestFit.activities
                      )}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="over-budget-card">
                  <div className="over-budget-header">
                    <div className="warning-icon">!</div>

                    <div>
                      <div className="section-kicker">
                        BUDGET CHECK
                      </div>

                      <h3>
                        {result.destination.city} doesn&apos;t
                        fit this budget for {result.days} days.
                      </h3>

                      <p>
                        We won&apos;t show an over-budget trip
                        as a recommendation.
                      </p>
                    </div>
                  </div>

                  <div className="comparison-row">
                    <div>
                      <span>Your budget</span>
                      <strong>
                        ${money(result.budget)}
                      </strong>
                    </div>

                    <div>
                      <span>Cheapest realistic option</span>
                      <strong>
                        ${money(result.cheapest.total)}
                      </strong>
                    </div>

                    <div className="negative">
                      <span>Shortfall</span>
                      <strong>
                        +$
                        {money(
                          result.cheapest.total -
                            result.budget
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="optimization-options">
                    <div className="optimization-title">
                      Ways to make this trip work
                    </div>

                    <div className="optimization-list">
                      {result.minimumDays && (
                        <div className="optimization-item">
                          <span className="optimization-number">
                            01
                          </span>

                          <div>
                            <strong>
                              Shorten the trip
                            </strong>

                            <p>
                              A Budget-style trip could fit
                              in about{" "}
                              <strong>
                                {result.minimumDays.days} day
                                {result.minimumDays.days !== 1
                                  ? "s"
                                  : ""}
                              </strong>
                              .
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="optimization-item">
                        <span className="optimization-number">
                          02
                        </span>

                        <div>
                          <strong>
                            Increase your budget
                          </strong>

                          <p>
                            Add at least{" "}
                            <strong>
                              $
                              {money(
                                result.cheapest.total -
                                  result.budget
                              )}
                            </strong>{" "}
                            to keep the full {result.days}-day
                            trip.
                          </p>
                        </div>
                      </div>

                      <div className="optimization-item">
                        <span className="optimization-number">
                          03
                        </span>

                        <div>
                          <strong>
                            Choose another destination
                          </strong>

                          <p>
                            Switch to Flexible mode and we&apos;ll
                            find destinations that fit your
                            current budget.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      <footer className="site-footer">
        <span>Trip Planner</span>
        <span>
          Estimates are indicative and may vary by season,
          availability and booking time.
        </span>
      </footer>
    </main>
  );
}
