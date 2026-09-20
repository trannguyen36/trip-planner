"use client";

import { useState } from "react";

export default function TokyoTripCost() {
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState("Mid-range");

  let dailyCost = 160;

  if (style === "Budget") {
    dailyCost = 85;
  }

  if (style === "Luxury") {
    dailyCost = 300;
  }

  const hotel = Math.round(
    dailyCost * 0.45 * days * travelers
  );

  const food = Math.round(
    dailyCost * 0.25 * days * travelers
  );

  const transport = Math.round(
    dailyCost * 0.15 * days * travelers
  );

  const activities = Math.round(
    dailyCost * 0.15 * days * travelers
  );

  const total =
    hotel +
    food +
    transport +
    activities;

  return (
    <main className="container">

      <section className="hero">

        <div className="hero-badge">
          🇯🇵 TOKYO TRIP PLANNER
        </div>

        <h1>
          How much does a trip to
          <br />
          <span>Tokyo cost?</span>
        </h1>

        <p className="subtitle">
          Estimate your Tokyo travel budget based on
          your trip length, number of travelers and
          travel style.
        </p>

      </section>


      <section className="card planner-card">

        <div className="section-title">

          <h2>
            Tokyo trip cost calculator
          </h2>

          <p>
            Adjust your trip details to see an
            estimated budget.
          </p>

        </div>


        <div className="grid">

          <div>

            <label>
              Number of days
            </label>

            <input
              type="number"
              min="1"
              max="30"
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
              max="10"
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
            onClick={() => setStyle("Budget")}
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
            onClick={() => setStyle("Mid-range")}
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
            onClick={() => setStyle("Luxury")}
          >
            💎 <span>Luxury</span>
          </button>

        </div>

      </section>


      <section className="result-card">

        <div className="result-header">

          <div>

            <div className="result-label">
              ESTIMATED TOKYO TRIP COST
            </div>

            <h2>
              {days} days in Tokyo
            </h2>

            <p>
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
              ${total.toLocaleString()}
            </strong>

          </div>

        </div>


        <div className="breakdown-grid">

          <div className="breakdown-item">

            <span>🏨</span>

            <div>

              <small>
                Hotels
              </small>

              <strong>
                ${hotel.toLocaleString()}
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
                ${food.toLocaleString()}
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
                ${transport.toLocaleString()}
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
                ${activities.toLocaleString()}
              </strong>

            </div>

          </div>

        </div>


        <div className="itinerary">

          <div className="result-label">
            SAMPLE ITINERARY
          </div>

          <h3>
            Suggested Tokyo itinerary
          </h3>


          <div className="day">

            <strong>
              Day 1
            </strong>

            <p>
              Arrival, Shibuya and
              Shibuya Crossing
            </p>

          </div>


          <div className="day">

            <strong>
              Day 2
            </strong>

            <p>
              Asakusa, Senso-ji and
              Tokyo Skytree
            </p>

          </div>


          <div className="day">

            <strong>
              Day 3
            </strong>

            <p>
              Harajuku, Meiji Shrine
              and Shinjuku
            </p>

          </div>


          {days >= 4 && (

            <div className="day">

              <strong>
                Day 4
              </strong>

              <p>
                Tsukiji, Ginza and
                Tokyo neighborhoods
              </p>

            </div>

          )}


          {days >= 5 && (

            <div className="day">

              <strong>
                Day 5+
              </strong>

              <p>
                Day trip, shopping and
                local experiences
              </p>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}
