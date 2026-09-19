"use client";

import { useState } from "react";

export default function TokyoTripCost() {
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState("Mid-range");

  const dailyCost =
    style === "Budget"
      ? 85
      : style === "Luxury"
      ? 300
      : 160;

  const hotel = dailyCost * 0.45 * days * travelers;
  const food = dailyCost * 0.25 * days * travelers;
  const transport = dailyCost * 0.15 * days * travelers;
  const activities = dailyCost * 0.15 * days * travelers;

  const total = Math.round(
    hotel + food + transport + activities
  );

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
          your trip length, number of travelers and travel style.
        </p>
      </section>

      <section className="card planner-card">

        <div className="section-title">
          <h2>Tokyo trip cost calculator</h2>
          <p>
            Adjust your trip details to see an estimated budget.
          </p>
        </div>

        <div className="grid">

          <div>
            <label>Number of days</label>

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
            <label>Travelers</label>

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

        <label>Travel style</label>

        <div className="style-options">

          {["Budget", "Mid-range", "Luxury"].map(
            (option) => (

              <button
                key={option}
                type="button"
                className={`style-button ${
                  style === option ? "active" : ""
                }`}
                onClick={() => setStyle(option)}
              >

                {option === "Budget" && "💰"}
                {option === "Mid-range" && "✨"}
                {option === "Luxury" && "💎"}

                <span>{option}</span>

              </button>

            )
          )}

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

            <span>Estimated total</span>

            <strong>
              ${total.toLocaleString()}
            </strong>

          </div>

        </div>

        <div className="breakdown-grid">

          <div className="breakdown-item">
            <span>🏨</span>

            <div>
              <small>Hotels</small>
              <strong>
                ${Math.round(hotel).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="breakdown-item">
            <span>🍜</span>

            <div>
              <small>Food</small>
              <strong>
                ${Math.round(food).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="breakdown-item">
            <span>🚆</span>

            <div>
              <small>Transport</small>
              <strong>
                ${Math.round(transport).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="breakdown-item">
            <span>🎟️</span>

            <div>
              <small>Activities</small>
              <strong>
                ${Math.round(activities).toLocaleString()}
              </strong>
            </div>
          </div>

        </div>

        <div className="itinerary">

          <div className="itinerary-heading">

            <div className="result-label">
              SAMPLE ITINERARY
            </div>

            <h3>
              Suggested Tokyo itinerary
            </h3>

          </div>

          <div className="day">
            <strong>Day 1</strong>
            <p>
              Arrival, Shibuya and Shibuya Crossing
            </p>
          </div>

          <div className="day">
            <strong>Day 2</strong>
            <p>
              Asakusa, Senso-ji and Tokyo Skytree
            </p>
          </div>

          <div className="day">
            <strong>Day 3</strong>
            <p>
              Harajuku, Meiji Shrine and Shinjuku
            </p>
          </div>

          {days >= 4 && (
            <div className="day">
              <strong>Day 4</strong>
              <p>
                Tsukiji, Ginza and Tokyo neighborhoods
              </p>
            </div>
          )}

          {days >= 5 && (
            <div className="day">
              <strong>Day 5+</strong>
              <p>
                Day trip, shopping or additional Tokyo experiences
              </p>
            </div>
          )}

        </div>

      </section>

      <section className="card" style={{ marginTop: "30px" }}>

        <div className="section-title">

          <h2>What does a Tokyo trip include?</h2>

          <p>
            Your travel budget usually depends on several
            major expenses.
          </p>

        </div>

        <div className="day">
          <strong>Hotels</strong>
          <p>
            Your accommodation is usually one of the
            largest parts of a Tokyo travel budget.
          </p>
        </div>

        <div className="day">
          <strong>Food</strong>
          <p>
            Tokyo offers options ranging from inexpensive
            local meals to high-end restaurants.
          </p>
        </div>

        <div className="day">
          <strong>Transport</strong>
          <p>
            Trains, subway and local transportation are
            important parts of planning a Tokyo trip.
          </p>
        </div>

        <div className="day">
          <strong>Activities</strong>
          <p>
            Attractions, museums, tours and experiences
            can change your overall budget.
          </p>
        </div>

      </section>

    </main>
  );
}
