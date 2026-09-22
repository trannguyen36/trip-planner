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
      total,
      hotel: Math.round(hotel),
      food: Math.round(food),
      transport: Math.round(transport),
      activities: Math.round(activities),
      maxBudget,
      difference,
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

      {/* HERO */}

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


      {/* CALCULATOR */}

      <section className="card planner-card">

        <div className="section-title">

          <h2>
            Start planning
          </h2>

          <p>
            Tell us about your trip.
          </p>

        </div>


        {/* COUNTRY */}

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


        {/* CITY */}

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


        {/* TRAVEL DATES */}

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

              <option value="January">
                January
              </option>

              <option value="February">
                February
              </option>

              <option value="March">
                March
              </option>

              <option value="April">
                April
              </option>

              <option value="May">
                May
              </option>

              <option value="June">
                June
              </option>

              <option value="July">
                July
              </option>

              <option value="August">
                August
              </option>

              <option value="September">
                September
              </option>

              <option value="October">
                October
              </option>

              <option value="November">
                November
              </option>

              <option value="December">
                December
              </option>

            </select>

          </div>

        )}


        {/* DAYS + TRAVELERS */}

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


        {/* TRAVEL STYLE */}

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


        {/* BUDGET */}

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


        {/* CALCULATE */}

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


      {/* RESULT */}

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


          {/* BUDGET STATUS */}

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


          {/* BREAKDOWN */}

          <div className="breakdown-grid">

            <div className="breakdown-item">

              <span>
                🏨
              </span>

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

              <span>
                🍜
              </span>

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

              <span>
                🚆
              </span>

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

              <span>
                🎟️
              </span>

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


          {/* ITINERARY */}

          <div className="itinerary">

            <div className="result-label">
              SAMPLE ITINERARY
            </div>

            <h3>
              Suggested {days}-day trip
            </h3>


            <div className="day">

              <strong>
                Day 1
              </strong>

              <p>
                Arrival and explore the city center
              </p>

            </div>


            <div className="day">

              <strong>
                Day 2
              </strong>

              <p>
                Major attractions and local food
              </p>

            </div>


            <div className="day">

              <strong>
                Day 3
              </strong>

              <p>
                Culture, shopping and neighborhoods
              </p>

            </div>


            {days >= 4 && (

              <div className="day">

                <strong>
                  Day 4
                </strong>

                <p>
                  Day trip or special local experience
                </p>

              </div>

            )}


            {days >= 5 && (

              <div className="day">

                <strong>
                  Day 5+
                </strong>

                <p>
                  Relax, explore more and prepare
                  for departure
                </p>

              </div>

            )}

          </div>


          {/* FUTURE FEATURES */}

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
