"use client";

import { useState } from "react";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState("");
  const [style, setStyle] = useState("Mid-range");
  const [result, setResult] = useState(null);

  function createTrip() {
    if (!destination) {
      alert("Please enter a destination.");
      return;
    }

    const dailyCost =
      style === "Budget" ? 80 : style === "Luxury" ? 300 : 150;

    const hotel = dailyCost * 0.45 * days;
    const food = dailyCost * 0.25 * days;
    const transport = dailyCost * 0.15 * days;
    const activities = dailyCost * 0.15 * days;

    const total = Math.round(
      (hotel + food + transport + activities) * travelers
    );

    const maxBudget = budget ? Number(budget) : null;
    const difference = maxBudget ? total - maxBudget : null;

    setResult({
      total,
      hotel: Math.round(hotel * travelers),
      food: Math.round(food * travelers),
      transport: Math.round(transport * travelers),
      activities: Math.round(activities * travelers),
      maxBudget,
      difference,
    });
  }

  function resetTrip() {
    setResult(null);
    setDestination("");
    setBudget("");
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-badge">✈️ SMART TRIP PLANNER</div>

        <h1>
          Plan your trip.
          <br />
          <span>Know your budget.</span>
        </h1>

        <p className="subtitle">
          Build a simple travel plan and estimate your trip cost in seconds.
        </p>
      </section>

      <section className="card planner-card">
        <div className="section-title">
          <div>
            <h2>Start planning</h2>
            <p>Tell us a little about your trip.</p>
          </div>
        </div>

        <label>Where do you want to go?</label>

        <input
          type="text"
          placeholder="e.g. Tokyo, Paris, Seoul..."
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <div className="grid">
          <div>
            <label>Number of days</label>
            <input
              type="number"
              min="1"
              max="60"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Travelers</label>
            <input
              type="number"
              min="1"
              max="20"
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
            />
          </div>
        </div>

        <label>Travel style</label>

        <div className="style-options">
          {["Budget", "Mid-range", "Luxury"].map((option) => (
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
          ))}
        </div>

        <label>Maximum budget</label>

        <div className="budget-input">
          <span>$</span>
          <input
            type="number"
            min="0"
            placeholder="Optional"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        <button className="primary-button" onClick={createTrip}>
          Create My Trip →
        </button>

        <p className="privacy-note">
          No account required · Free to use
        </p>
      </section>

      {result && (
        <section className="result-card">
          <div className="result-header">
            <div>
              <div className="result-label">YOUR TRIP ESTIMATE</div>

              <h2>
                {destination}
              </h2>

              <p>
                {days} days · {travelers}{" "}
                {travelers === 1 ? "traveler" : "travelers"} · {style}
              </p>
            </div>

            <div className="total-box">
              <span>Estimated total</span>
              <strong>${result.total.toLocaleString()}</strong>
            </div>
          </div>

          {result.maxBudget && (
            <div
              className={`budget-status ${
                result.difference > 0 ? "over" : "under"
              }`}
            >
              {result.difference > 0 ? (
                <>
                  ⚠️ This trip is about{" "}
                  <strong>
                    ${result.difference.toLocaleString()}
                  </strong>{" "}
                  over your budget.
                </>
              ) : (
                <>
                  ✓ You are about{" "}
                  <strong>
                    ${Math.abs(result.difference).toLocaleString()}
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
                <small>Hotels</small>
                <strong>${result.hotel.toLocaleString()}</strong>
              </div>
            </div>

            <div className="breakdown-item">
              <span>🍜</span>
              <div>
                <small>Food</small>
                <strong>${result.food.toLocaleString()}</strong>
              </div>
            </div>

            <div className="breakdown-item">
              <span>🚆</span>
              <div>
                <small>Transport</small>
                <strong>${result.transport.toLocaleString()}</strong>
              </div>
            </div>

            <div className="breakdown-item">
              <span>🎟️</span>
              <div>
                <small>Activities</small>
                <strong>${result.activities.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="itinerary">
            <div className="itinerary-heading">
              <div>
                <div className="result-label">SAMPLE ITINERARY</div>
                <h3>Your {days}-day trip</h3>
              </div>
            </div>

            <div className="day">
              <strong>Day 1</strong>
              <p>Arrival and explore the city center</p>
            </div>

            <div className="day">
              <strong>Day 2</strong>
              <p>Major attractions and local food</p>
            </div>

            <div className="day">
              <strong>Day 3</strong>
              <p>Culture, shopping and local neighborhoods</p>
            </div>

            {days >= 4 && (
              <div className="day">
                <strong>Day 4</strong>
                <p>Day trip or special local experience</p>
              </div>
            )}

            {days >= 5 && (
              <div className="day">
                <strong>Day 5+</strong>
                <p>Relax, explore more and prepare for departure</p>
              </div>
            )}
          </div>

          <div className="future-note">
            🚀 Soon: hotels, flights, activities, eSIMs and travel insurance.
          </div>

          <button className="secondary-button" onClick={resetTrip}>
            ← Plan another trip
          </button>
        </section>
      )}
    </main>
  );
}
