"use client";

import { useState } from "react";

const destinations = {
  Tokyo: {
    country: "Japan",
    daily: {
      Budget: 85,
      "Mid-range": 160,
      Luxury: 300,
    },
  },

  Seoul: {
    country: "South Korea",
    daily: {
      Budget: 70,
      "Mid-range": 130,
      Luxury: 260,
    },
  },

  Bangkok: {
    country: "Thailand",
    daily: {
      Budget: 45,
      "Mid-range": 90,
      Luxury: 200,
    },
  },

  Singapore: {
    country: "Singapore",
    daily: {
      Budget: 90,
      "Mid-range": 170,
      Luxury: 350,
    },
  },

  Paris: {
    country: "France",
    daily: {
      Budget: 100,
      "Mid-range": 190,
      Luxury: 380,
    },
  },

  London: {
    country: "United Kingdom",
    daily: {
      Budget: 110,
      "Mid-range": 210,
      Luxury: 420,
    },
  },

  Sydney: {
    country: "Australia",
    daily: {
      Budget: 100,
      "Mid-range": 190,
      Luxury: 380,
    },
  },

  Vancouver: {
    country: "Canada",
    daily: {
      Budget: 95,
      "Mid-range": 180,
      Luxury: 360,
    },
  },

  Toronto: {
    country: "Canada",
    daily: {
      Budget: 95,
      "Mid-range": 180,
      Luxury: 350,
    },
  },
};

export default function Home() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState("Mid-range");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState(null);

  function createTrip() {
    if (!destination) {
      alert("Please select a destination.");
      return;
    }

    const destinationData = destinations[destination];

    const dailyCost = destinationData.daily[style];

    const hotel = dailyCost * 0.45 * days * travelers;
    const food = dailyCost * 0.25 * days * travelers;
    const transport = dailyCost * 0.15 * days * travelers;
    const activities = dailyCost * 0.15 * days * travelers;

    const total = Math.round(
      hotel + food + transport + activities
    );

    const maxBudget = budget
      ? Number(budget)
      : null;

    const difference = maxBudget
      ? total - maxBudget
      : null;

    setResult({
      total,
      hotel: Math.round(hotel),
      food: Math.round(food),
      transport: Math.round(transport),
      activities: Math.round(activities),
      difference,
      maxBudget,
      country: destinationData.country,
    });
  }

  function resetTrip() {
    setResult(null);
    setDestination("");
    setBudget("");
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


        {/* DESTINATION */}

        <label>
          Where are you going?
        </label>

        <select
          value={destination}
          onChange={(e) =>
            setDestination(e.target.value)
          }
        >

          <option value="">
            Select a destination
          </option>

          {Object.keys(destinations).map(
            (city) => (
              <option
                key={city}
                value={city}
              >
                {city}, {destinations[city].country}
              </option>
            )
          )}

        </select>


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


        {/* BUTTON */}

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
                {destination}
              </h2>

              <p>
                {result.country} · {days} days ·{" "}
                {travelers}{" "}
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


          {/* FUTURE */}

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
