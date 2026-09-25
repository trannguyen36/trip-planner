"use client";

import { useState } from "react";
import { destinations } from "./data/destinations";

const flightEstimates = {
  Tokyo: 650,
  Seoul: 420,
  Bangkok: 250,
  Paris: 750,
};

export default function Home() {
  const countries = [
    ...new Set(destinations.map((item) => item.country)),
  ];

  const [from, setFrom] = useState("Ho Chi Minh City");
  const [budget, setBudget] = useState(1800);
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(7);
  const [month, setMonth] = useState("November");
  const [style, setStyle] = useState("Mid-range");

  const [destinationMode, setDestinationMode] =
    useState("flexible");

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const [result, setResult] = useState(null);

  const cities = destinations.filter(
    (item) => item.country === country
  );

  function changeBudget(amount) {
    setBudget((value) =>
      Math.max(100, value + amount)
    );
  }

  function getFlightCost(destination) {
    const base =
      flightEstimates[destination.city] || 500;

    return base * travelers;
  }

  function calculateTrip(
    destination,
    tripDays = days,
    tripStyle = style,
    tripBudget = budget
  ) {
    const costs = destination.costs[tripStyle];

    const hotel =
      costs.hotel * tripDays * travelers;

    const food =
      costs.food * tripDays * travelers;

    const transport =
      costs.transport * tripDays * travelers;

    const activities =
      costs.activities * tripDays * travelers;

    const flight = getFlightCost(destination);

    const total = Math.round(
      flight +
        hotel +
        food +
        transport +
        activities
    );

    return {
      city: destination.city,
      country: destination.country,
      currency: destination.currency,
      airport: destination.airport,
      bestMonths: destination.bestMonths,
      flight: Math.round(flight),
      hotel: Math.round(hotel),
      food: Math.round(food),
      transport: Math.round(transport),
      activities: Math.round(activities),
      total,
      difference: total - tripBudget,
      itinerary: destination.itinerary,
      destination,
    };
  }

  function handleCountryChange(value) {
    setCountry(value);
    setCity("");
  }

  function calculateFlexible() {
    const ranked = destinations
      .map((destination) => {
        const trip = calculateTrip(destination);

        const difference =
          trip.total - budget;

        const fits =
          difference <= 0;

        return {
          destination,
          trip,
          fits,
          difference,
        };
      })
      .sort((a, b) => {
        if (a.fits && !b.fits) return -1;
        if (!a.fits && b.fits) return 1;

        return (
          Math.abs(a.difference) -
          Math.abs(b.difference)
        );
      });

    setResult({
      mode: "flexible",
      recommendations: ranked.slice(0, 3),
      selected: ranked[0].trip,
    });
  }

  function calculateSpecific() {
    if (!country || !city) {
      alert("Please select a country and city.");
      return;
    }

    const destination = destinations.find(
      (item) =>
        item.country === country &&
        item.city === city
    );

    if (!destination) {
      alert("Destination not found.");
      return;
    }

    setResult({
      mode: "specific",
      selected: calculateTrip(destination),
      recommendations: [],
    });
  }

  function calculate() {
    if (destinationMode === "flexible") {
      calculateFlexible();
    } else {
      calculateSpecific();
    }
  }

  function applyDestination(destination) {
    setDestinationMode("specific");
    setCountry(destination.country);
    setCity(destination.city);

    const trip = calculateTrip(destination);

    setResult({
      mode: "specific",
      selected: trip,
      recommendations: [],
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function applyShorterTrip() {
    if (!result?.selected) return;

    const destination =
      result.selected.destination;

    if (days <= 1) return;

    const newDays = days - 1;

    setDays(newDays);

    const trip = calculateTrip(
      destination,
      newDays,
      style,
      budget
    );

    setResult({
      mode: "specific",
      selected: trip,
      recommendations: [],
    });
  }

  function applyBudgetStyle() {
    if (!result?.selected) return;

    const destination =
      result.selected.destination;

    setStyle("Budget");

    const trip = calculateTrip(
      destination,
      days,
      "Budget",
      budget
    );

    setResult({
      mode: "specific",
      selected: trip,
      recommendations: [],
    });
  }

  function resetTrip() {
    setResult(null);
    setDestinationMode("flexible");
    setCountry("");
    setCity("");
    setBudget(1800);
    setTravelers(2);
    setDays(7);
    setMonth("November");
    setStyle("Mid-range");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const selected = result?.selected;

  const isOverBudget =
    selected && selected.total > budget;

  const alternativeDestinations =
    selected
      ? destinations
          .filter(
            (item) =>
              !(
                item.city === selected.city &&
                item.country === selected.country
              )
          )
          .map((destination) => ({
            destination,
            trip: calculateTrip(
              destination,
              days,
              style,
              budget
            ),
          }))
          .sort((a, b) => {
            const aFits =
              a.trip.total <= budget;

            const bFits =
              b.trip.total <= budget;

            if (aFits && !bFits) return -1;
            if (!aFits && bFits) return 1;

            return (
              Math.abs(
                a.trip.total - budget
              ) -
              Math.abs(
                b.trip.total - budget
              )
            );
          })
          .slice(0, 3)
      : [];

  return (
    <main className="container">

      {/* HERO */}

      <section className="hero">

        <div className="hero-badge">
          ✈️ TRAVEL BUDGET ENGINE
        </div>

        <h1>
          Where can you
          <br />
          <span>actually go?</span>
        </h1>

        <p className="subtitle">
          Tell us your budget and trip preferences.
          We&apos;ll estimate the cost and find travel
          options that fit.
        </p>

      </section>


      {/* PLANNER */}

      <section className="planner-card">

        <div className="planner-heading">

          <div>

            <div className="eyebrow">
              PLAN YOUR TRIP
            </div>

            <h2>
              Tell us what you&apos;re looking for
            </h2>

          </div>

          <div className="free-pill">
            Free · No account
          </div>

        </div>


        <div className="form-grid">

          {/* FROM */}

          <div className="field">

            <label>
              From
            </label>

            <input
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
              placeholder="Your departure city"
            />

          </div>


          {/* BUDGET */}

          <div className="field">

            <label>
              Total budget
            </label>

            <div className="budget-control">

              <button
                type="button"
                onClick={() =>
                  changeBudget(-100)
                }
              >
                −
              </button>

              <div className="budget-value">

                <span>$</span>

                <input
                  type="number"
                  value={budget}
                  min="100"
                  onChange={(e) =>
                    setBudget(
                      Math.max(
                        100,
                        Number(e.target.value)
                      )
                    )
                  }
                />

                <small>
                  USD
                </small>

              </div>

              <button
                type="button"
                onClick={() =>
                  changeBudget(100)
                }
              >
                +
              </button>

            </div>

          </div>


          {/* TRAVELERS */}

          <div className="field">

            <label>
              Travelers
            </label>

            <select
              value={travelers}
              onChange={(e) =>
                setTravelers(
                  Number(e.target.value)
                )
              }
            >

              {[1, 2, 3, 4, 5, 6, 7, 8].map(
                (number) => (
                  <option
                    key={number}
                    value={number}
                  >
                    {number}{" "}
                    {number === 1
                      ? "traveler"
                      : "travelers"}
                  </option>
                )
              )}

            </select>

          </div>


          {/* DAYS */}

          <div className="field">

            <label>
              Trip length
            </label>

            <select
              value={days}
              onChange={(e) =>
                setDays(
                  Number(e.target.value)
                )
              }
            >

              {[3, 4, 5, 6, 7, 10, 14, 21].map(
                (number) => (
                  <option
                    key={number}
                    value={number}
                  >
                    {number} days
                  </option>
                )
              )}

            </select>

          </div>


          {/* MONTH */}

          <div className="field">

            <label>
              Preferred month
            </label>

            <select
              value={month}
              onChange={(e) =>
                setMonth(e.target.value)
              }
            >

              <option value="">
                Any month
              </option>

              {[
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
              ].map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}

            </select>

          </div>


          {/* STYLE */}

          <div className="field">

            <label>
              Travel style
            </label>

            <select
              value={style}
              onChange={(e) =>
                setStyle(e.target.value)
              }
            >

              <option value="Budget">
                Budget
              </option>

              <option value="Mid-range">
                Comfortable
              </option>

              <option value="Luxury">
                Luxury
              </option>

            </select>

          </div>

        </div>


        {/* DESTINATION */}

        <div className="destination-section">

          <label>
            Destination
          </label>

          <div className="destination-toggle">

            <button
              type="button"
              className={
                destinationMode === "flexible"
                  ? "toggle-option active"
                  : "toggle-option"
              }
              onClick={() =>
                setDestinationMode("flexible")
              }
            >
              <span className="toggle-icon">
                ✨
              </span>

              <span>
                <strong>
                  Flexible
                </strong>

                <small>
                  Find destinations for me
                </small>
              </span>

            </button>


            <button
              type="button"
              className={
                destinationMode === "specific"
                  ? "toggle-option active"
                  : "toggle-option"
              }
              onClick={() =>
                setDestinationMode("specific")
              }
            >
              <span className="toggle-icon">
                📍
              </span>

              <span>
                <strong>
                  I have a destination in mind
                </strong>

                <small>
                  Choose country and city
                </small>
              </span>

            </button>

          </div>


          {destinationMode === "specific" && (

            <div className="destination-fields">

              <div className="field">

                <label>
                  Country
                </label>

                <select
                  value={country}
                  onChange={(e) =>
                    handleCountryChange(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select country
                  </option>

                  {countries.map((item) => (
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
                  City
                </label>

                <select
                  value={city}
                  disabled={!country}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                >

                  <option value="">
                    {country
                      ? "Select city"
                      : "Select country first"}
                  </option>

                  {cities.map((item) => (
                    <option
                      key={item.city}
                      value={item.city}
                    >
                      {item.city}
                    </option>
                  ))}

                </select>

              </div>

            </div>

          )}

        </div>


        <button
          className="primary-button"
          onClick={calculate}
        >
          Calculate & Find Destinations
          <span>→</span>
        </button>

        <p className="form-note">
          Estimates are indicative and may vary
          depending on actual prices.
        </p>

      </section>


      {/* FLEXIBLE RESULTS */}

      {result?.mode === "flexible" && (

        <section className="results-section">

          <div className="section-heading">

            <div>

              <div className="eyebrow">
                DESTINATION DISCOVERY
              </div>

              <h2>
                Destinations your budget can handle
              </h2>

              <p>
                Based on {travelers}{" "}
                {travelers === 1
                  ? "traveler"
                  : "travelers"}, {days} days,
                a ${budget.toLocaleString()} budget
                and {style.toLowerCase()} travel.
              </p>

            </div>

          </div>


          <div className="destination-results">

            {result.recommendations.map(
              ({ destination, trip }) => {

                const fits =
                  trip.total <= budget;

                return (
                  <article
                    className="destination-result-card"
                    key={`${destination.country}-${destination.city}`}
                  >

                    <div className="destination-card-top">

                      <span className="destination-country">
                        {destination.country}
                      </span>

                      {fits && (
                        <span className="fit-badge">
                          Fits your budget
                        </span>
                      )}

                    </div>

                    <h3>
                      {destination.city}
                    </h3>

                    <p>
                      {days} days · {style}
                    </p>

                    <div className="destination-price">
                      <strong>
                        ${trip.total.toLocaleString()}
                      </strong>

                      <span>
                        estimated total
                      </span>
                    </div>

                    <div className="mini-breakdown">

                      <span>
                        ✈️ ${trip.flight.toLocaleString()}
                      </span>

                      <span>
                        🏨 ${trip.hotel.toLocaleString()}
                      </span>

                      <span>
                        🍜 ${trip.food.toLocaleString()}
                      </span>

                    </div>

                    <button
                      className="card-button"
                      onClick={() =>
                        applyDestination(
                          destination
                        )
                      }
                    >
                      Explore {destination.city}
                      <span>→</span>
                    </button>

                  </article>
                );
              }
            )}

          </div>

        </section>
      )}


      {/* SPECIFIC RESULT */}

      {result?.mode === "specific" && selected && (

        <section className="results-section">

          <div className="estimate-card">

            <div className="estimate-top">

              <div>

                <div className="eyebrow">
                  YOUR REQUEST
                </div>

                <h2>
                  {selected.city}
                </h2>

                <p>
                  {selected.country} · {days} days ·{" "}
                  {travelers}{" "}
                  {travelers === 1
                    ? "traveler"
                    : "travelers"}{" "}
                  · {style}
                </p>

              </div>

              <div
                className={
                  isOverBudget
                    ? "status-badge over"
                    : "status-badge under"
                }
              >
                {isOverBudget
                  ? `$${(
                      selected.total - budget
                    ).toLocaleString()} over budget`
                  : `$${(
                      budget - selected.total
                    ).toLocaleString()} remaining`}
              </div>

            </div>


            <div className="big-total">

              <span>
                Estimated total
              </span>

              <strong>
                ${selected.total.toLocaleString()}
              </strong>

            </div>


            <div className="cost-grid">

              <CostItem
                icon="✈️"
                label="Flight"
                value={selected.flight}
              />

              <CostItem
                icon="🏨"
                label="Hotel"
                value={selected.hotel}
              />

              <CostItem
                icon="🍜"
                label="Food"
                value={selected.food}
              />

              <CostItem
                icon="🚆"
                label="Transport"
                value={selected.transport}
              />

              <CostItem
                icon="🎟️"
                label="Activities"
                value={selected.activities}
              />

            </div>

          </div>


          {/* OVER BUDGET */}

          {isOverBudget && (

            <section className="optimize-card">

              <div className="optimize-heading">

                <div className="optimize-icon">
                  ↗
                </div>

                <div>

                  <div className="eyebrow">
                    IF YOUR CURRENT PLAN IS OVER BUDGET
                  </div>

                  <h2>
                    Ways to make the trip work
                  </h2>

                  <p>
                    We&apos;ll change one variable at
                    a time, so you can see exactly
                    what you save.
                  </p>

                </div>

              </div>


              {/* DESTINATION ALTERNATIVES */}

              <div className="optimization-group">

                <div className="optimization-title">

                  <span>
                    01
                  </span>

                  <div>
                    <h3>
                      Change destination
                    </h3>

                    <p>
                      Keep your trip length and style,
                      but spend less on the destination.
                    </p>
                  </div>

                </div>


                <div className="alternative-grid">

                  {alternativeDestinations.map(
                    ({ destination, trip }) => (

                      <div
                        className="alternative-card"
                        key={`${destination.country}-${destination.city}`}
                      >

                        <div>

                          <span className="destination-country">
                            {destination.country}
                          </span>

                          <h4>
                            {destination.city}
                          </h4>

                        </div>

                        <strong>
                          ${trip.total.toLocaleString()}
                        </strong>

                        <small>
                          {trip.total <= budget
                            ? `$${(
                                budget -
                                trip.total
                              ).toLocaleString()} under budget`
                            : `$${(
                                trip.total -
                                budget
                              ).toLocaleString()} over budget`}
                        </small>

                        <button
                          className="text-button"
                          onClick={() =>
                            applyDestination(
                              destination
                            )
                          }
                        >
                          Explore
                          <span>→</span>
                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* CHANGE PLAN */}

              <div className="optimization-group">

                <div className="optimization-title">

                  <span>
                    02
                  </span>

                  <div>
                    <h3>
                      Change your plan
                    </h3>

                    <p>
                      Keep your destination and
                      adjust one part of the trip.
                    </p>
                  </div>

                </div>


                <div className="alternative-grid">

                  {days > 1 && (

                    <div className="plan-card">

                      <span>
                        Shorter stay
                      </span>

                      <h4>
                        {days - 1} days
                      </h4>

                      <p>
                        Remove one day from the trip.
                      </p>

                      <button
                        className="text-button"
                        onClick={applyShorterTrip}
                      >
                        Try this option
                        <span>→</span>
                      </button>

                    </div>

                  )}


                  {style !== "Budget" && (

                    <div className="plan-card">

                      <span>
                        Cheaper stay
                      </span>

                      <h4>
                        Budget style
                      </h4>

                      <p>
                        Keep the destination but use
                        lower-cost accommodation and
                        spending assumptions.
                      </p>

                      <button
                        className="text-button"
                        onClick={applyBudgetStyle}
                      >
                        Try this option
                        <span>→</span>
                      </button>

                    </div>

                  )}


                  <div className="plan-card">

                    <span>
                      Adjust budget
                    </span>

                    <h4>
                      ${budget.toLocaleString()}
                    </h4>

                    <p>
                      Change your budget using the
                      controls at the top.
                    </p>

                    <button
                      className="text-button"
                      onClick={() =>
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        })
                      }
                    >
                      Adjust budget
                      <span>↑</span>
                    </button>

                  </div>

                </div>

              </div>

            </section>
          )}


          {/* ITINERARY */}

          <section className="itinerary-card">

            <div className="eyebrow">
              SAMPLE ITINERARY
            </div>

            <div className="itinerary-heading">

              <div>

                <h2>
                  A suggested {days}-day trip
                </h2>

                <p>
                  A starting point you can customize
                  later.
                </p>

              </div>

              <span className="airport-pill">
                ✈ {selected.airport}
              </span>

            </div>


            <div className="itinerary-list">

              {selected.itinerary
                .slice(
                  0,
                  Math.min(
                    days,
                    selected.itinerary.length
                  )
                )
                .map((item) => (

                  <div
                    className="itinerary-day"
                    key={item.day}
                  >

                    <div className="day-number">
                      {String(item.day).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div>

                      <h4>
                        {item.title}
                      </h4>

                      <p>
                        {item.description}
                      </p>

                    </div>

                  </div>

                ))}

            </div>

          </section>


          {/* DESTINATION INFO */}

          <section className="destination-meta">

            <div>

              <span>
                Currency
              </span>

              <strong>
                {selected.currency}
              </strong>

            </div>

            <div>

              <span>
                Best months
              </span>

              <strong>
                {selected.bestMonths.join(", ")}
              </strong>

            </div>

            <div>

              <span>
                Main airport
              </span>

              <strong>
                {selected.airport}
              </strong>

            </div>

          </section>


          <button
            className="reset-button"
            onClick={resetTrip}
          >
            ← Plan another trip
          </button>

        </section>
      )}

    </main>
  );
}


function CostItem({ icon, label, value }) {
  return (
    <div className="cost-item">

      <div className="cost-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          ${value.toLocaleString()}
        </strong>

      </div>

    </div>
  );
}
