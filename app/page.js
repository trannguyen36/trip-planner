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

    setResult({
      total,
      hotel: Math.round(hotel * travelers),
      food: Math.round(food * travelers),
      transport: Math.round(transport * travelers),
      activities: Math.round(activities * travelers),
    });
  }

  return (
    <main className="container">
      <section className="hero">
        <p className="tag">AI TRIP PLANNER</p>
        <h1>Plan your next trip.</h1>
        <p className="subtitle">
          Estimate your travel budget and build a simple itinerary.
        </p>
      </section>

      <section className="card">
        <label>Where do you want to go?</label>
        <input
          type="text"
          placeholder="e.g. Tokyo"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <div className="grid">
          <div>
            <label>Number of days</label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Travelers</label>
            <input
              type="number"
              min="1"
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
            />
          </div>
        </div>

        <label>Travel style</label>
        <select value={style} onChange={(e) => setStyle(e.target.value)}>
          <option>Budget</option>
          <option>Mid-range</option>
          <option>Luxury</option>
        </select>

        <label>Maximum budget (optional)</label>
        <input
          type="number"
          placeholder="e.g. 2000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <button onClick={createTrip}>Create My Trip</button>
      </section>

      {result && (
        <section className="result card">
          <p className="tag">YOUR ESTIMATE</p>
          <h2>
            {destination} — {days} days
          </h2>

          <div className="total">
            ${result.total.toLocaleString()}
          </div>

          <div className="breakdown">
            <p>🏨 Hotel: ${result.hotel.toLocaleString()}</p>
            <p>🍜 Food: ${result.food.toLocaleString()}</p>
            <p>🚆 Transport: ${result.transport.toLocaleString()}</p>
            <p>🎟️ Activities: ${result.activities.toLocaleString()}</p>
          </div>

          <h3>Suggested itinerary</h3>
          <ul>
            <li>Day 1 — Arrival and explore the city center</li>
            <li>Day 2 — Major attractions and local food</li>
            <li>Day 3 — Culture, shopping and neighborhoods</li>
            <li>Day 4 — Day trip or special activity</li>
            <li>Day 5 — Relax and departure</li>
          </ul>
        </section>
      )}
    </main>
  );
}
