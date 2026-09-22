"use client";

import { useState } from "react";
import { destinations } from "./data/destinations";

export default function Home() {
  const countries = [
    ...new Set(destinations.map((item) => item.country)),
  ];

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState("Mid-range");
  const [budget, setBudget] = useState("");

  const [dateMode, setDateMode] = useState("flexible");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flexibleMonth, setFlexibleMonth] = useState("");

  const [result, setResult] = useState(null);

  const cities = destinations.filter(
    (item) => item.country === country
  );

  function handleCountryChange(value) {
    setCountry(value);
    setCity("");
    setResult(null);
  }

  function createTrip() {
    if (!country) {
      alert("Please select a country.");
      return;
    }

    if (!city) {
      alert("Please select a city.");
      return;
    }

    if (dateMode === "specific") {
      if (!startDate || !endDate) {
        alert("Please select both departure and return dates.");
        return;
      }

      if (endDate < startDate) {
        alert("Return date must be after departure date.");
        return;
      }
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

    const costs = destination.costs[style];

    const hotel =
      costs.hotel * days * travelers;

    const food =
      costs.food * days * travelers;

    const transport =
      costs.transport * days * travelers;

    const activities =
      costs.activities * days * travelers;

    const total = Math.round(
      hotel +
        food +
        transport +
        activities
    );

    const maxBudget = budget
      ? Number(budget)
      : null;

    const difference = maxBudget
      ? total - maxBudget
      : null;

    setResult({
      city: destination.city,
      country: destination.country,
      currency: destination.currency,
      airport: destination.airport,
      bestMonths: destination.bestMonths,
      total,
      hotel: Math.round(hotel),
      food: Math.round(food),
      transport: Math.round(transport),
      activities: Math.round(activities),
      maxBudget,
      difference,
      itinerary: destination.itinerary,
    });
  }

  function resetTrip() {
    setResult(null);
    setCountry("");
    setCity("");
    setBudget("");
    setDateMode("flexible");
    setStartDate("");
    setEndDate("");
    setFlexibleMonth("");
  }

  return (
    <main className="container">

      <section className="hero">

        <div className="hero-badge">
          ✈️ SMART TRIP PLANNER
        </div>

        <h1>
          Plan your trip.
          <br />
          <span>Know your budget.</span>
        </h1>

        <p className="subtitle">
          Estimate your travel cost based on your
          destination, trip length, travelers and
          travel style.
        </p>

      </section>

      <section className="card planner-card">

        <div className="section-title">

          <h2>
            Start planning
          </h2>

          <p>
            Tell us about your trip.
          </p>

        </div>

        <label>
          Country
        </label>

        <select
          value={country}
          onChange={(e) =>
            handleCountryChange(e.target.value)
          }
        >

          <option value="">
            Select a country
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

        <label>
          City
        </label>

        <select
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
          disabled={!country}
        >

          <option value="">
            {country
              ? "Select a city"
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

        <label>
          When are you traveling?
        </label>

        <div className="style-options">

          <button
            type="button"
            className={
              dateMode === "specific"
                ? "style-button active"
                : "style-button"
            }
            onClick={() => setDateMode("specific")}
          >
            📅 <span>Specific dates</span>
          </button>

          <button
            type="button"
            className={
              dateMode === "flexible"
                ? "style-button active"
                : "style-button"
            }
            onClick={() => setDateMode("flexible")}
          >
            ✨ <span>Flexible dates</span>
          </button>

        </div>

        {dateMode === "specific" ? (

          <div className="grid">

            <div>

              <label>
                Departure date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
              />

            </div>

            <div>

              <label>
                Return date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
              />

            </div>

          </div>

        ) : (

          <div>

            <label>
              Preferred travel month
            </label>

            <select
              value={flexibleMonth}
              onChange={(e) =>
                setFlexibleMonth(e.target.value)
              }
            >

              <option value="">
                Any month
              </option>

              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>

            </select>

          </div>

        )}

        <div className="grid">

          <div>

            <label>
              Number of days
            </label>

            <input
              type="number"
              min="1"
              max="60"
              value={days}
              onChange={(e) =>
                setDays(Number(e.target.value))
              }
            />

          </div>

          <div>

            <label>
              Travelers
            </label>

            <input
              type="number"
              min="1"
              max="20"
              value={travelers}
              onChange={(e) =>
                setTravelers(Number(e.target.value))
              }
            />

          </div>

        </div>

        <label>
          Travel style
        </label>

        <div className="style-options">

          <button
            type="button"
            className={
              style === "Budget"
                ? "style-button active"
                : "style-button"
            }
            onClick={() =>
              setStyle("Budget")
            }
          >
            💰 <span>Budget</span>
          </button>

          <button
            type="button"
            className={
              style === "Mid-range"
                ? "style-button active"
                : "style-button"
            }
            onClick={() =>
              setStyle("Mid-range")
            }
          >
            ✨ <span>Mid-range</span>
          </button>

          <button
            type="button"
            className={
              style === "Luxury"
                ? "style-button active"
                : "style-button"
            }
            onClick={() =>
              setStyle("Luxury")
            }
          >
            💎 <span>Luxury</span>
          </button>

        </div>

        <label>
          Maximum budget
        </label>

        <div className="budget-input">

          <span>
            $
          </span>

          <input
            type="number"
            min="0"
            placeholder="Optional"
            value={budget}
            onChange={(e) =>
              setBudget(e.target.value)
            }
          />

        </div>

        <button
          className="primary-button"
          onClick={createTrip}
        >
          Calculate My Trip →
        </button>

        <p className="privacy-note">
          Free to use · No account required
        </p>

      </section>

      {result && (

        <section className="result-card">

          <div className="result-header">

            <div>

              <div className="result-label">
                ESTIMATED TRIP COST
              </div>

              <h2>
                {result.city}
              </h2>

              <p>
                {result.country} · {days} days ·{" "}
                {dateMode === "specific"
                  ? `${startDate} → ${endDate}`
                  : flexibleMonth
                  ? `Flexible · ${flexibleMonth}`
                  : "Flexible dates"}{" "}
                · {travelers}{" "}
                {travelers === 1
                  ? "traveler"
                  : "travelers"}{" "}
                · {style}
              </p>

            </div>

            <div className="total-box">

              <span>
                Estimated total
              </span>

              <strong>
                ${result.total.toLocaleString()}
              </strong>

            </div>

          </div>

          {result.maxBudget && (

            <div
              className={
                result.difference > 0
                  ? "budget-status over"
                  : "budget-status under"
              }
            >

              {result.difference > 0 ? (
                <>
                  ⚠️ This trip is approximately{" "}
                  <strong>
                    $
                    {result.difference.toLocaleString()}
                  </strong>{" "}
                  over your budget.
                </>
              ) : (
                <>
                  ✓ You are approximately{" "}
                  <strong>
                    $
                    {Math.abs(
                      result.difference
                    ).toLocaleString()}
                  </strong>{" "}
                  under your budget.
                </>
              )}

            </div>

          )}

          <div className="breakdown-grid">

            <div className="breakdown-item">

              <span>🏨</span>

              <div>

                <small>
                  Hotels
                </small>

                <strong>
                  ${result.hotel.toLocaleString()}
                </strong>

              </div>

            </div>

            <div className="breakdown-item">

              <span>🍜</span>

              <div>

                <small>
                  Food
                </small>

                <strong>
                  ${result.food.toLocaleString()}
                </strong>

              </div>

            </div>

            <div className="breakdown-item">

              <span>🚆</span>

              <div>

                <small>
                  Transport
                </small>

                <strong>
                  ${result.transport.toLocaleString()}
                </strong>

              </div>

            </div>

            <div className="breakdown-item">

              <span>🎟️</span>

              <div>

                <small>
                  Activities
                </small>

                <strong>
                  ${result.activities.toLocaleString()}
                </strong>

              </div>

            </div>

          </div>

          <div className="itinerary">

            <div className="result-label">
              SAMPLE ITINERARY
            </div>

            <h3>
              Suggested {days}-day trip
            </h3>

            {result.itinerary
              .slice(0, Math.min(days, result.itinerary.length))
              .map((item) => (

                <div
                  className="day"
                  key={item.day}
                >

                  <strong>
                    Day {item.day}
                  </strong>

                  <h4>
                    {item.title}
                  </h4>

                  <p>
                    {item.description}
                  </p>

                </div>

              ))}

            {days > result.itinerary.length && (

              <div className="day">

                <strong>
                  Day {result.itinerary.length + 1}+
                </strong>

                <p>
                  Continue exploring the destination,
                  enjoy local experiences and keep some
                  free time before departure.
                </p>

              </div>

            )}

          </div>

          <div className="destination-info">

            <div>

              <small>
                Main airport
              </small>

              <strong>
                {result.airport}
              </strong>

            </div>

            <div>

              <small>
                Currency
              </small>

              <strong>
                {result.currency}
              </strong>

            </div>

            <div>

              <small>
                Recommended months
              </small>

              <strong>
                {result.bestMonths.join(", ")}
              </strong>

            </div>

          </div>

          <div className="future-note">

            🚀 Soon: flight prices, hotels,
            activities, eSIMs and travel insurance.

          </div>

          <button
            className="secondary-button"
            onClick={resetTrip}
          >
            ← Plan another trip
          </button>

        </section>

      )}

    </main>
  );
}
