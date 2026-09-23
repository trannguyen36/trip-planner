"use client";

import { useState } from "react";
import { destinations } from "./data/destinations";

export default function Home() {
  const countries = [
    ...new Set(destinations.map((item) => item.country)),
  ];

  const [from, setFrom] = useState("Ho Chi Minh City");

  const [budget, setBudget] = useState(1800);

  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(7);

  const [flexibleMonth, setFlexibleMonth] = useState("November");

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
    setBudget((current) =>
      Math.max(100, current + amount)
    );
  }

  function handleCountryChange(value) {
    setCountry(value);
    setCity("");
  }

  function calculateDestination(destination, tripDays = days, tripStyle = style) {
    const costs = destination.costs[tripStyle];

    const hotel =
      costs.hotel * tripDays * travelers;

    const food =
      costs.food * tripDays * travelers;

    const transport =
      costs.transport * tripDays * travelers;

    const activities =
      costs.activities * tripDays * travelers;

    const total = Math.round(
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
      total,
      hotel: Math.round(hotel),
      food: Math.round(food),
      transport: Math.round(transport),
      activities: Math.round(activities),
      difference: total - budget,
      itinerary: destination.itinerary,
    };
  }

  function createTrip() {
    if (
      destinationMode === "specific" &&
      (!country || !city)
    ) {
      alert("Please select a country and city.");
      return;
    }

    let destination;

    if (destinationMode === "specific") {
      destination = destinations.find(
        (item) =>
          item.country === country &&
          item.city === city
      );
    } else {
      destination = destinations[0];
    }

    if (!destination) {
      alert("Destination not found.");
      return;
    }

    const calculated = calculateDestination(
      destination
    );

    setResult({
      ...calculated,
      mode: destinationMode,
    });
  }

  function chooseDestination(destination) {
    setDestinationMode("specific");
    setCountry(destination.country);
    setCity(destination.city);

    const calculated =
      calculateDestination(destination);

    setResult({
      ...calculated,
      mode: "specific",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function chooseShorterTrip() {
    if (!result) return;

    const newDays = Math.max(1, days - 1);

    setDays(newDays);

    const destination = destinations.find(
      (item) =>
        item.country === result.country &&
        item.city === result.city
    );

    if (!destination) return;

    const calculated = calculateDestination(
      destination,
      newDays,
      style
    );

    setResult({
      ...calculated,
      mode: "specific",
    });
  }

  function chooseCheaperStyle() {
    if (!result) return;

    let newStyle = "Budget";

    if (style === "Budget") {
      return;
    }

    setStyle(newStyle);

    const destination = destinations.find(
      (item) =>
        item.country === result.country &&
        item.city === result.city
    );

    if (!destination) return;

    const calculated = calculateDestination(
      destination,
      days,
      newStyle
    );

    setResult({
      ...calculated,
      mode: "specific",
    });
  }

  function resetTrip() {
    setResult(null);
    setCountry("");
    setCity("");
    setDestinationMode("flexible");
    setBudget(1800);
    setDays(7);
    setTravelers(2);
    setStyle("Mid-range");
    setFlexibleMonth("November");
  }

  const alternativeDestinations =
    result
      ? destinations
          .filter(
            (item) =>
              !(
                item.country === result.country &&
                item.city === result.city
              )
          )
          .map((destination) => ({
            destination,
            estimate: calculateDestination(destination),
          }))
          .sort((a, b) => {
            const aUnder =
              a.estimate.total <= budget;

            const bUnder =
              b.estimate.total <= budget;

            if (aUnder && !bUnder) return -1;
            if (!aUnder && bUnder) return 1;

            return (
              Math.abs(a.estimate.total - budget) -
              Math.abs(b.estimate.total - budget)
            );
          })
          .slice(0, 3)
      : [];

  const isOverBudget =
    result && result.total > budget;

  return (
    <main className="container">

      {/* HERO */}

      <section className="hero">

        <div className="hero-badge">
          ✈️ TRAVEL BUDGET ENGINE
        </div>

        <h1>
          Where can you actually go?
        </h1>

        <p className="subtitle">
          Tell us your budget and trip preferences.
          We'll calculate the cost and find
          destinations and travel plans that fit.
        </p>

      </section>


      {/* PLANNER */}

      <section className="card planner-card">

        <div className="section-title">

          <h2>
            Plan your trip
          </h2>

          <p>
            Adjust your budget and preferences.
          </p>

        </div>


        {/* FROM + BUDGET */}

        <div className="grid">

          <div>

            <label>
              From
            </label>

            <input
              type="text"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
            />

          </div>


          <div>

            <label>
              Total budget (USD)
            </label>

            <div className="budget-input">

              <button
                type="button"
                className="budget-adjust"
                onClick={() =>
                  changeBudget(-100)
                }
              >
                −
              </button>

              <span>
                $
              </span>

              <input
                type="number"
                min="100"
                value={budget}
                onChange={(e) =>
                  setBudget(
                    Math.max(
                      100,
                      Number(e.target.value)
                    )
                  )
                }
              />

              <button
                type="button"
                className="budget-adjust"
                onClick={() =>
                  changeBudget(100)
                }
              >
                +
              </button>

            </div>

          </div>

        </div>


        {/* TRAVELERS + DAYS */}

        <div className="grid">

          <div>

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
                    {number}
                  </option>
                )
              )}

            </select>

          </div>


          <div>

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

        </div>


        {/* MONTH + STYLE */}

        <div className="grid">

          <div>

            <label>
              Preferred month
            </label>

            <select
              value={flexibleMonth}
              onChange={(e) =>
                setFlexibleMonth(
                  e.target.value
                )
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


          <div>

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

        <label>
          Destination
        </label>

        <div className="style-options">

          <button
            type="button"
            className={
              destinationMode === "flexible"
                ? "style-button active"
                : "style-button"
            }
            onClick={() =>
              setDestinationMode("flexible")
            }
          >
            ✨ Flexible
            <span>
              Find destinations for me
            </span>
          </button>


          <button
            type="button"
            className={
              destinationMode === "specific"
                ? "style-button active"
                : "style-button"
            }
            onClick={() =>
              setDestinationMode("specific")
            }
          >
            📍 I have a destination in mind
          </button>

        </div>


        {/* COUNTRY + CITY */}

        {destinationMode === "specific" && (

          <div className="grid">

            <div>

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

            </div>


            <div>

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

            </div>

          </div>

        )}


        {/* CALCULATE */}

        <button
          className="primary-button"
          onClick={createTrip}
        >
          Calculate & Find Destinations →
        </button>

        <p className="privacy-note">
          Free to use · No account required
        </p>

      </section>


      {/* RESULT */}

      {result && (

        <>

          <section className="result-card">

            <div className="result-header">

              <div>

                <div className="result-label">
                  YOUR REQUEST
                </div>

                <h2>
                  Current trip estimate
                </h2>

                <p>
                  {result.city},{" "}
                  {result.country} ·{" "}
                  {days} days ·{" "}
                  {travelers}{" "}
                  {travelers === 1
                    ? "traveler"
                    : "travelers"}
                </p>

              </div>


              <div className="total-box">

                <span>
                  {isOverBudget
                    ? "Over budget"
                    : "Within budget"}
                </span>

                <strong>
                  {isOverBudget
                    ? `+$${(
                        result.total -
                        budget
                      ).toLocaleString()}`
                    : `+$${(
                        budget -
                        result.total
                      ).toLocaleString()}`}
                </strong>

              </div>

            </div>


            {/* COST BREAKDOWN */}

            <div className="breakdown-grid">

              <div className="breakdown-item">

                <span>✈️</span>

                <div>

                  <small>
                    Flight
                  </small>

                  <strong>
                    ${Math.round(
                      result.total * 0.32
                    ).toLocaleString()}
                  </strong>

                </div>

              </div>


              <div className="breakdown-item">

                <span>🏨</span>

                <div>

                  <small>
                    Hotel
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


            <div className="result-total">

              <span>
                Estimated total
              </span>

              <strong>
                ${result.total.toLocaleString()}
              </strong>

            </div>

          </section>


          {/* OVER BUDGET */}

          {isOverBudget && (

            <section className="card">

              <div className="section-title">

                <div className="result-label">
                  IF YOUR CURRENT PLAN IS OVER BUDGET
                </div>

                <h2>
                  Ways to make the trip work
                </h2>

                <p>
                  We can change one variable at a
                  time instead of simply telling you
                  to spend more.
                </p>

              </div>


              {/* DESTINATION ALTERNATIVES */}

              <div className="alternative-section">

                <h3>
                  Change destination
                </h3>

                <p>
                  Keep your trip length and travel
                  style, but explore destinations that
                  may fit your budget better.
                </p>


                <div className="destination-grid">

                  {alternativeDestinations.map(
                    ({
                      destination,
                      estimate,
                    }) => (

                      <div
                        className="destination-card"
                        key={`${destination.country}-${destination.city}`}
                      >

                        <h3>
                          {destination.city}
                        </h3>

                        <p>
                          {destination.country}
                        </p>

                        <strong>
                          $
                          {estimate.total.toLocaleString()}
                          {" "}estimated
                        </strong>

                        <small>
                          {estimate.total <= budget
                            ? `$${(
                                budget -
                                estimate.total
                              ).toLocaleString()} possible remaining`
                            : `Still about $${(
                                estimate.total -
                                budget
                              ).toLocaleString()} over`}
                        </small>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            chooseDestination(
                              destination
                            )
                          }
                        >
                          Explore{" "}
                          {destination.city}
                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* PLAN ALTERNATIVES */}

              <div className="alternative-section">

                <h3>
                  Change your plan
                </h3>

                <p>
                  Keep the destination and adjust
                  the trip instead.
                </p>


                <div className="destination-grid">

                  {/* SHORTER TRIP */}

                  {days > 1 && (

                    <div className="destination-card">

                      <small>
                        Shorter trip
                      </small>

                      <h3>
                        {days - 1} days
                      </h3>

                      <p>
                        Reduce the trip by one day.
                      </p>

                      <strong>
                        New estimate
                      </strong>

                      <button
                        className="secondary-button"
                        onClick={
                          chooseShorterTrip
                        }
                      >
                        Try this option
                      </button>

                    </div>

                  )}


                  {/* CHEAPER STAY */}

                  {style !== "Budget" && (

                    <div className="destination-card">

                      <small>
                        Cheaper stay
                      </small>

                      <h3>
                        Budget travel
                      </h3>

                      <p>
                        Keep the same destination
                        and dates with a lower-cost
                        travel style.
                      </p>

                      <button
                        className="secondary-button"
                        onClick={
                          chooseCheaperStyle
                        }
                      >
                        Try this option
                      </button>

                    </div>

                  )}


                  {/* ADJUST BUDGET */}

                  <div className="destination-card">

                    <small>
                      Adjust budget
                    </small>

                    <h3>
                      ${budget.toLocaleString()}
                    </h3>

                    <p>
                      Increase or decrease your
                      budget using the controls above.
                    </p>

                    <button
                      className="secondary-button"
                      onClick={() =>
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        })
                      }
                    >
                      Adjust budget ↑
                    </button>

                  </div>

                </div>

              </div>

            </section>

          )}


          {/* ITINERARY */}

          <section className="result-card">

            <div className="result-label">
              SAMPLE ITINERARY
            </div>

            <h3>
              Suggested {days}-day trip
            </h3>

            {result.itinerary
              .slice(
                0,
                Math.min(
                  days,
                  result.itinerary.length
                )
              )
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
                  Continue exploring the
                  destination, enjoy local
                  experiences and keep some free
                  time before departure.
                </p>

              </div>

            )}

          </section>


          {/* DESTINATION INFO */}

          <section className="card">

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

          </section>


          <button
            className="secondary-button"
            onClick={resetTrip}
          >
            ← Plan another trip
          </button>

        </>

      )}

    </main>
  );
}
