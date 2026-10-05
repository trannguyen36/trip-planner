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

const ORIGINS = [
  {
    code: "SGN",
    city: "Ho Chi Minh City",
    country: "Vietnam",
  },
  {
    code: "HAN",
    city: "Hanoi",
    country: "Vietnam",
  },
  {
    code: "DAD",
    city: "Da Nang",
    country: "Vietnam",
  },
];

const INTERESTS = [
  { value: "Beach", label: "🏖️ Beach" },
  { value: "Nature", label: "⛰️ Nature" },
  { value: "Culture", label: "🏛️ Culture" },
  { value: "City break", label: "🏙️ City break" },
  { value: "Foodie", label: "🍜 Foodie" },
];

const DEFAULTS = {
  budget: 1500,
  mode: "flexible",
  country: "Japan",
  city: "Tokyo",
  origin: "SGN",
  month: "November",
  days: 7,
  travelers: 2,
  style: "Mid-range",
  interests: [],
  visaOnly: false,
};

function money(value) {
  return Math.round(Number(value) || 0).toLocaleString("en-US");
}

function calculateTrip(destination, days, travelers, style) {
  const rates = destination.costs?.[style];

  if (!rates) return null;

  const nights = Math.max(0, days - 1);
  const rooms = Math.max(1, Math.ceil(travelers / 2));

  // Current fallback estimate.
  // This will be replaced by the flight API once connected.
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
      total / Math.max(1, travelers) / Math.max(1, days),
  };
}

function getCheapestPlan(destination, days, travelers) {
  return calculateTrip(destination, days, travelers, "Budget");
}

function getBestStyleForBudget(
  destination,
  days,
  travelers,
  budget
) {
  const options = STYLES.map((style) => {
    const result = calculateTrip(
      destination,
      days,
      travelers,
      style
    );

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

function getMinimumDaysForBudget(
  destination,
  travelers,
  budget
) {
  for (let days = 1; days <= 30; days++) {
    const result = getCheapestPlan(
      destination,
      days,
      travelers
    );

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
  interests,
}) {
  const results = [];

  for (const destination of destinations) {
    const styleOrder = [
      preferredStyle,
      ...STYLES.filter(
        (style) => style !== preferredStyle
      ),
    ];

    let selected = null;

    for (const style of styleOrder) {
      const result = calculateTrip(
        destination,
        days,
        travelers,
        style
      );

      if (result && result.total <= budget) {
        selected = {
          style,
          ...result,
        };
        break;
      }
    }

    if (!selected) continue;

    const budgetUsage = selected.total / budget;
    const monthScore = getMonthScore(
      destination,
      month
    );

    let score = 0;

    // Prefer trips that use the available budget efficiently.
    score += Math.max(
      0,
      1 - Math.abs(0.75 - budgetUsage)
    );

    // Prefer destinations that are good for the selected month.
    score += monthScore * 0.35;

    // Prefer requested travel style.
    if (selected.style === preferredStyle) {
      score += 0.25;
    }

    // Small personalization layer.
    if (interests.length > 0) {
      const destinationText = `${destination.country} ${destination.city}`.toLowerCase();

      for (const interest of interests) {
        if (
          interest === "Beach" &&
          /thailand|bali|phuket|beach/.test(
            destinationText
          )
        ) {
          score += 0.15;
        }

        if (
          interest === "Culture" &&
          /japan|france|korea|paris|tokyo|seoul/.test(
            destinationText
          )
        ) {
          score += 0.1;
        }

        if (
          interest === "City break" &&
          /tokyo|paris|seoul|bangkok/.test(
            destinationText
          )
        ) {
          score += 0.1;
        }

        if (
          interest === "Foodie" &&
          /japan|thailand|korea|france/.test(
            destinationText
          )
        ) {
          score += 0.1;
        }
      }
    }

    results.push({
      destination,
      ...selected,
      score,
      remaining: budget - selected.total,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

function FieldLabel({ children, hint }) {
  return (
    <div className="field-label-row">
      <label className="field-label">
        {children}
      </label>

      {hint && (
        <span className="field-hint">
          {hint}
        </span>
      )}
    </div>
  );
}

function ResultStat({ label, value, muted }) {
  return (
    <div
      className={`result-stat ${
        muted ? "muted" : ""
      }`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TripSummary({
  budget,
  travelers,
  days,
  month,
  origin,
  destination,
  style,
  interests,
  visaOnly,
  step,
}) {
  const originName =
    ORIGINS.find((item) => item.code === origin)
      ?.city || "Ho Chi Minh City";

  const daily =
    Number(budget) /
    Math.max(1, Number(travelers)) /
    Math.max(1, Number(days));

  return (
    <aside className="trip-summary-card">
      <div className="summary-header">
        <span className="summary-icon">✦</span>

        <div>
          <strong>Trip Summary</strong>
          <small>
            {step === 2
              ? "Your starting plan"
              : "Updates as you plan"}
          </small>
        </div>
      </div>

      <div className="summary-divider" />

      <div className="summary-row">
        <span>Budget</span>
        <strong>${money(budget)}</strong>
      </div>

      <div className="summary-row">
        <span>Travelers</span>
        <strong>
          {travelers}{" "}
          {travelers === 1 ? "person" : "people"}
        </strong>
      </div>

      <div className="summary-row">
        <span>Duration</span>
        <strong>{days} days</strong>
      </div>

      <div className="summary-row">
        <span>Month</span>
        <strong>{month}</strong>
      </div>

      <div className="summary-row">
        <span>Departure</span>
        <strong>{origin}</strong>
      </div>

      {destination && (
        <div className="summary-row">
          <span>Destination</span>
          <strong>{destination}</strong>
        </div>
      )}

      {step === 3 && (
        <>
          <div className="summary-row">
            <span>Style</span>
            <strong>{style}</strong>
          </div>

          <div className="summary-row">
            <span>Daily budget</span>
            <strong>
              ${money(daily)}/person
            </strong>
          </div>
        </>
      )}

      <div className="summary-tip">
        <span>💡</span>

        <div>
          <strong>
            {step === 2
              ? "Start with your budget."
              : "More details = better matching."}
          </strong>

          <p>
            {step === 2
              ? "We'll only show trips that can fit your maximum budget."
              : "Your preferences help us build a more relevant trip plan."}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function HomePage() {
  const [budget, setBudget] = useState(
    DEFAULTS.budget
  );

  const [mode, setMode] = useState(
    DEFAULTS.mode
  );

  const [country, setCountry] = useState(
    DEFAULTS.country
  );

  const [city, setCity] = useState(
    DEFAULTS.city
  );

  const [origin, setOrigin] = useState(
    DEFAULTS.origin
  );

  const [month, setMonth] = useState(
    DEFAULTS.month
  );

  const [days, setDays] = useState(
    DEFAULTS.days
  );

  const [travelers, setTravelers] = useState(
    DEFAULTS.travelers
  );

  const [style, setStyle] = useState(
    DEFAULTS.style
  );

  const [interests, setInterests] = useState(
    DEFAULTS.interests
  );

  const [visaOnly, setVisaOnly] = useState(
    DEFAULTS.visaOnly
  );

  const [result, setResult] = useState(null);

  const countries = useMemo(
    () =>
      [
        ...new Set(
          destinations.map(
            (item) => item.country
          )
        ),
      ],
    []
  );

  const citiesForCountry = useMemo(
    () =>
      destinations
        .filter(
          (item) =>
            item.country === country
        )
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

    const firstCity =
      destinations.find(
        (item) =>
          item.country === value
      )?.city;

    if (firstCity) {
      setCity(firstCity);
    }
  }

  function toggleInterest(value) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter(
            (item) => item !== value
          )
        : [...current, value]
    );
  }

  function handleFindTrip() {
    const cleanBudget = Math.max(
      0,
      Number(budget) || 0
    );

    const cleanDays = Math.min(
      30,
      Math.max(1, Number(days) || 1)
    );

    const cleanTravelers = Math.min(
      12,
      Math.max(
        1,
        Number(travelers) || 1
      )
    );

    if (mode === "flexible") {
      const matches =
        getFlexibleDestinations({
          budget: cleanBudget,
          days: cleanDays,
          travelers: cleanTravelers,
          month,
          preferredStyle: style,
          interests,
        });

      setResult({
        type: "flexible",
        matches,
        budget: cleanBudget,
        days: cleanDays,
        travelers: cleanTravelers,
        origin,
        month,
        style,
        interests,
        visaOnly,
      });

      return;
    }

    if (!selectedDestination) return;

    const bestFit =
      getBestStyleForBudget(
        selectedDestination,
        cleanDays,
        cleanTravelers,
        cleanBudget
      );

    const requestedPlan =
      calculateTrip(
        selectedDestination,
        cleanDays,
        cleanTravelers,
        style
      );

    const cheapest =
      getCheapestPlan(
        selectedDestination,
        cleanDays,
        cleanTravelers
      );

    const minimumDays =
      getMinimumDaysForBudget(
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
      origin,
      interests,
      visaOnly,
    });
  }

  function resetPlanner() {
    setBudget(DEFAULTS.budget);
    setMode(DEFAULTS.mode);
    setCountry(DEFAULTS.country);
    setCity(DEFAULTS.city);
    setOrigin(DEFAULTS.origin);
    setMonth(DEFAULTS.month);
    setDays(DEFAULTS.days);
    setTravelers(DEFAULTS.travelers);
    setStyle(DEFAULTS.style);
    setInterests(DEFAULTS.interests);
    setVisaOnly(DEFAULTS.visaOnly);
    setResult(null);
  }

  const destinationLabel =
    mode === "specific"
      ? `${city}, ${country}`
      : null;

  const dailyBudget =
    Number(budget) /
    Math.max(1, Number(travelers)) /
    Math.max(1, Number(days));

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">✦</div>

          <div>
            <div className="brand-name">
              Trip Planner
            </div>

            <div className="brand-subtitle">
              Plan smarter. Spend better.
            </div>
          </div>
        </div>

        <button
          className="reset-button"
          onClick={resetPlanner}
        >
          Reset
        </button>
      </header>

      <section className="hero">
        <div className="eyebrow">
          SMART TRIP PLANNER
        </div>

        <h1>
          Plan your trip
          <br />
          <span>within your budget.</span>
        </h1>

        <p className="hero-copy">
          Tell us your budget and travel
          preferences. We&apos;ll find a trip
          that actually fits.
        </p>
      </section>

      <section className="planner-layout">
        <div className="planner-card">
          {/* STEP 1 */}
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                STEP 1
              </div>

              <h2>
                What&apos;s your maximum budget?
              </h2>
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
              onChange={(e) =>
                setBudget(e.target.value)
              }
              aria-label="Maximum budget"
            />
          </div>

          <p className="helper-text">
            We won&apos;t recommend a trip that
            costs more than this amount.
          </p>

          <div className="divider" />

          {/* STEP 2 */}
          <div className="section-heading compact">
            <div>
              <div className="section-kicker">
                STEP 2
              </div>

              <h2>
                Where do you want to go?
              </h2>

              <p className="section-description">
                Choose whether you already know
                your destination or want us to
                find one for you.
              </p>
            </div>
          </div>

          <div className="mode-switch">
            <button
              className={
                mode === "specific"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setMode("specific")
              }
            >
              <span className="mode-icon">
                ⌖
              </span>

              <span>
                <strong>
                  I have a destination
                </strong>

                <small>
                  Enter the place you want to
                  visit. We&apos;ll check whether
                  your budget is enough.
                </small>
              </span>
            </button>

            <button
              className={
                mode === "flexible"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setMode("flexible")
              }
            >
              <span className="mode-icon">
                ✦
              </span>

              <span>
                <strong>
                  Suggest destinations for me
                </strong>

                <small>
                  Not sure where to go? We&apos;ll
                  find destinations that best fit
                  your budget and preferences.
                </small>
              </span>
            </button>
          </div>

          {mode === "specific" ? (
            <div className="specific-destination">
              <div className="field-grid">
                <div className="field">
                  <FieldLabel>
                    Country
                  </FieldLabel>

                  <select
                    value={country}
                    onChange={(e) =>
                      handleCountryChange(
                        e.target.value
                      )
                    }
                  >
                    {countries.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="field">
                  <FieldLabel>
                    City
                  </FieldLabel>

                  <select
                    value={city}
                    onChange={(e) =>
                      setCity(e.target.value)
                    }
                  >
                    {citiesForCountry.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="flexible-message">
              <div className="flexible-icon">
                ✦
              </div>

              <div>
                <strong>
                  We&apos;ll choose the
                  destination.
                </strong>

                <p>
                  We&apos;ll scan the destinations
                  available to us and show only
                  options that fit your maximum
                  budget.
                </p>
              </div>
            </div>
          )}

          <div className="divider" />

          {/* STEP 3 */}
          <div className="section-heading compact">
            <div>
              <div className="section-kicker">
                STEP 3
              </div>

              <h2>
                Tell us more about your trip
              </h2>

              <p className="section-description">
                A few extra details help us
                calculate a more useful trip.
              </p>
            </div>
          </div>

          <div className="field-grid">
            {/* ORIGIN */}
            <div className="field">
              <FieldLabel>
                Flying from
              </FieldLabel>

              <select
                value={origin}
                onChange={(e) =>
                  setOrigin(e.target.value)
                }
              >
                {ORIGINS.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.city} ({item.code})
                  </option>
                ))}
              </select>

              <div className="field-note">
                Flight prices will use this
                airport when the flight API is
                connected.
              </div>
            </div>

            {/* MONTH */}
            <div className="field">
              <FieldLabel>
                Travel month
              </FieldLabel>

              <select
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value)
                }
              >
                {MONTHS.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* DAYS */}
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
                  onChange={(e) =>
                    setDays(e.target.value)
                  }
                />

                <span>days</span>
              </div>
            </div>

            {/* TRAVELERS */}
            <div className="field">
              <FieldLabel>
                Travelers
              </FieldLabel>

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

          {/* DAILY BUDGET */}
          <div className="daily-budget-card">
            <div className="daily-budget-icon">
              $
            </div>

            <div>
              <strong>
                ${money(budget)} for{" "}
                {travelers}{" "}
                {Number(travelers) === 1
                  ? "person"
                  : "people"}{" "}
                · {days} days
              </strong>

              <p>
                ≈ $
                {money(dailyBudget)}
                /person/day · including
                estimated flights
              </p>
            </div>
          </div>

          {/* STYLE */}
          <div className="field travel-style-field">
            <FieldLabel>
              Travel style
            </FieldLabel>

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
                  description:
                    "Comfortable",
                },
                {
                  value: "Luxury",
                  title: "Luxury",
                  description:
                    "Premium",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  className={
                    style === option.value
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setStyle(
                      option.value
                    )
                  }
                >
                  <strong>
                    {option.title}
                  </strong>

                  <span>
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* INTERESTS */}
          <div className="field interests-field">
            <FieldLabel hint="Choose any that apply">
              Interests / vibe
            </FieldLabel>

            <div className="interest-chips">
              {INTERESTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={
                    interests.includes(
                      item.value
                    )
                      ? "interest-chip selected"
                      : "interest-chip"
                  }
                  onClick={() =>
                    toggleInterest(
                      item.value
                    )
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* VISA */}
          <div className="visa-option">
            <div>
              <strong>
                🛂 Visa preference
              </strong>

              <small>
                Only suggest destinations
                that are visa-free or visa on
                arrival.
              </small>
            </div>

            <button
              type="button"
              className={
                visaOnly
                  ? "toggle active"
                  : "toggle"
              }
              onClick={() =>
                setVisaOnly(
                  !visaOnly
                )
              }
              aria-label="Visa preference"
            >
              <span />
            </button>
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
        </div>

        {/* ONE SUMMARY ONLY */}
        <div className="summary-column">
          <TripSummary
            budget={
              Number(budget) || 0
            }
            travelers={
              Number(travelers) || 1
            }
            days={
              Number(days) || 1
            }
            month={month}
            origin={origin}
            destination={
              destinationLabel
            }
            style={style}
            interests={interests}
            visaOnly={visaOnly}
            step={mode === "specific" ? 2 : 2}
          />
        </div>
      </section>

      {/* RESULTS */}
      {result && (
        <section className="results-section">
          <div className="results-heading">
            <div>
              <div className="section-kicker">
                YOUR RESULTS
              </div>

              <h2>
                {result.type ===
                "flexible"
                  ? "Trips that fit your budget"
                  : `${result.destination.city} trip budget`}
              </h2>
            </div>

            <div className="results-budget">
              Budget:{" "}
              <strong>
                ${money(result.budget)}
              </strong>
            </div>
          </div>

          {result.type ===
            "flexible" && (
            <>
              {result.matches.length >
              0 ? (
                <div className="result-grid">
                  {result.matches.map(
                    (
                      item,
                      index
                    ) => (
                      <article
                        className={`destination-card ${
                          index === 0
                            ? "featured"
                            : ""
                        }`}
                        key={`${item.destination.country}-${item.destination.city}`}
                      >
                        {index ===
                          0 && (
                          <div className="recommended-label">
                            BEST FIT
                          </div>
                        )}

                        <div className="destination-top">
                          <div>
                            <div className="destination-country">
                              {
                                item
                                  .destination
                                  .country
                              }
                            </div>

                            <h3>
                              {
                                item
                                  .destination
                                  .city
                              }
                            </h3>
                          </div>

                          <div className="fit-icon">
                            ✓
                          </div>
                        </div>

                        <div className="trip-meta">
                          <span>
                            {result.days}{" "}
                            days
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {
                              result.travelers
                            }{" "}
                            travelers
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {item.style}
                          </span>
                        </div>

                        <div className="destination-cost">
                          <span>
                            Estimated total
                          </span>

                          <strong>
                            $
                            {money(
                              item.total
                            )}
                          </strong>
                        </div>

                        <div className="remaining">
                          $
                          {money(
                            item.remaining
                          )}{" "}
                          left in your budget
                        </div>

                        <div className="cost-mini">
                          <div>
                            <span>
                              Flights
                            </span>

                            <strong>
                              $
                              {money(
                                item.flight
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Stay
                            </span>

                            <strong>
                              $
                              {money(
                                item.hotel
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Daily spending
                            </span>

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
                    )
                  )}
                </div>
              ) : (
                <div className="no-fit-card">
                  <div className="no-fit-icon">
                    !
                  </div>

                  <div>
                    <h3>
                      No destination fits
                      this budget yet.
                    </h3>

                    <p>
                      For{" "}
                      {
                        result.travelers
                      }{" "}
                      traveler
                      {result.travelers !==
                      1
                        ? "s"
                        : ""}{" "}
                      and{" "}
                      {result.days}{" "}
                      days, the available
                      options are above $
                      {money(
                        result.budget
                      )}
                      .
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {result.type ===
            "specific" && (
            <>
              {result.bestFit ? (
                <div className="specific-result">
                  <div className="success-banner">
                    <span>✓</span>

                    <div>
                      <strong>
                        {
                          result
                            .destination
                            .city
                        }{" "}
                        fits your
                        budget.
                      </strong>

                      {result
                        .bestFit
                        .style !==
                        result.requestedStyle && (
                        <p>
                          We switched from{" "}
                          <strong>
                            {
                              result.requestedStyle
                            }
                          </strong>{" "}
                          to{" "}
                          <strong>
                            {
                              result
                                .bestFit
                                .style
                            }
                          </strong>{" "}
                          to stay within
                          your budget.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="main-result-card">
                    <div className="main-result-left">
                      <div className="destination-country">
                        {
                          result
                            .destination
                            .country
                        }
                      </div>

                      <h3>
                        {
                          result
                            .destination
                            .city
                        }
                      </h3>

                      <div className="trip-meta">
                        <span>
                          {result.days}{" "}
                          days
                        </span>

                        <span>•</span>

                        <span>
                          {
                            result.travelers
                          }{" "}
                          travelers
                        </span>

                        <span>•</span>

                        <span>
                          {
                            result
                              .bestFit
                              .style
                          }
                        </span>
                      </div>
                    </div>

                    <div className="main-result-total">
                      <span>
                        Estimated total
                      </span>

                      <strong>
                        $
                        {money(
                          result
                            .bestFit
                            .total
                        )}
                      </strong>

                      <small>
                        $
                        {money(
                          result.budget -
                            result
                              .bestFit
                              .total
                        )}{" "}
                        left
                      </small>
                    </div>
                  </div>

                  <div className="cost-breakdown">
                    <ResultStat
                      label="Flights"
                      value={`$${money(
                        result
                          .bestFit
                          .flight
                      )}`}
                    />

                    <ResultStat
                      label={`Hotel · ${result.bestFit.nights} nights`}
                      value={`$${money(
                        result
                          .bestFit
                          .hotel
                      )}`}
                    />

                    <ResultStat
                      label="Food"
                      value={`$${money(
                        result
                          .bestFit
                          .food
                      )}`}
                    />

                    <ResultStat
                      label="Transport"
                      value={`$${money(
                        result
                          .bestFit
                          .transport
                      )}`}
                    />

                    <ResultStat
                      label="Activities"
                      value={`$${money(
                        result
                          .bestFit
                          .activities
                      )}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="over-budget-card">
                  <div className="over-budget-header">
                    <div className="warning-icon">
                      !
                    </div>

                    <div>
                      <div className="section-kicker">
                        BUDGET CHECK
                      </div>

                      <h3>
                        {
                          result
                            .destination
                            .city
                        }{" "}
                        doesn&apos;t fit
                        this budget for{" "}
                        {result.days}{" "}
                        days.
                      </h3>

                      <p>
                        We won&apos;t show
                        an over-budget
                        trip as a
                        recommendation.
                      </p>
                    </div>
                  </div>

                  <div className="comparison-row">
                    <div>
                      <span>
                        Your budget
                      </span>

                      <strong>
                        $
                        {money(
                          result.budget
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Cheapest realistic
                        option
                      </span>

                      <strong>
                        $
                        {money(
                          result
                            .cheapest
                            .total
                        )}
                      </strong>
                    </div>

                    <div className="negative">
                      <span>
                        Shortfall
                      </span>

                      <strong>
                        +$
                        {money(
                          result
                            .cheapest
                            .total -
                            result.budget
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="optimization-options">
                    <div className="optimization-title">
                      Ways to make this
                      trip work
                    </div>

                    <div className="optimization-list">
                      {result.minimumDays && (
                        <div className="optimization-item">
                          <div>
                            <strong>
                              Shorten the
                              trip
                            </strong>

                            <span>
                              A{" "}
                              {
                                result
                                  .minimumDays
                                  .days
                              }
                              -day trip
                              can fit your
                              budget.
                            </span>
                          </div>

                          <div className="optimization-price">
                            $
                            {money(
                              result
                                .minimumDays
                                .total
                            )}
                          </div>
                        </div>
                      )}

                      <div className="optimization-item">
                        <div>
                          <strong>
                            Increase your
                            budget
                          </strong>

                          <span>
                            Add enough
                            budget to cover
                            the cheapest
                            realistic plan.
                          </span>
                        </div>

                        <div className="optimization-price">
                          +$
                          {money(
                            result
                              .cheapest
                              .total -
                              result.budget
                          )}
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

      <style jsx global>{`
        .planner-layout {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 24px;
          align-items: start;
        }

        .planner-layout .planner-card {
          width: 100%;
          margin: 0;
        }

        .summary-column {
          position: sticky;
          top: 24px;
        }

        .trip-summary-card {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #dfe7f5;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 16px 40px rgba(33, 57, 96, 0.08);
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-icon {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 18px;
        }

        .summary-header strong {
          display: block;
          color: #172554;
          font-size: 15px;
        }

        .summary-header small {
          display: block;
          margin-top: 3px;
          color: #7b879f;
          font-size: 11px;
        }

        .summary-divider {
          height: 1px;
          background: #edf1f7;
          margin: 16px 0 6px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 9px 0;
          font-size: 13px;
        }

        .summary-row span {
          color: #748099;
        }

        .summary-row strong {
          color: #172554;
          text-align: right;
        }

        .summary-tip {
          display: flex;
          gap: 9px;
          margin-top: 12px;
          padding: 12px;
          border-radius: 13px;
          background: #effcf5;
          color: #166534;
        }

        .summary-tip > span {
          font-size: 15px;
        }

        .summary-tip strong {
          display: block;
          font-size: 11px;
        }

        .summary-tip p {
          margin: 4px 0 0;
          color: #4b7560;
          font-size: 10px;
          line-height: 1.45;
        }

        .section-description {
          margin: 7px 0 0;
          color: #748099;
          font-size: 13px;
          line-height: 1.5;
          max-width: 620px;
        }

        .daily-budget-card {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 18px;
          padding: 13px 15px;
          border: 1px solid #cfe3ff;
          border-radius: 14px;
          background: #f5f9ff;
        }

        .daily-budget-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #e0edff;
          color: #2563eb;
          font-weight: 800;
        }

        .daily-budget-card strong {
          display: block;
          color: #17366e;
          font-size: 13px;
        }

        .daily-budget-card p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .interest-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .interest-chip {
          border: 1px solid #dfe6f2;
          background: #fff;
          color: #536078;
          border-radius: 999px;
          padding: 9px 12px;
          cursor: pointer;
          font-size: 12px;
          transition: 0.15s ease;
        }

        .interest-chip:hover {
          border-color: #aebcf8;
          transform: translateY(-1px);
        }

        .interest-chip.selected {
          border-color: #5865f2;
          background: #eef1ff;
          color: #2937a7;
          font-weight: 600;
        }

        .visa-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 18px;
          padding: 14px 15px;
          border: 1px solid #e4e9f2;
          border-radius: 14px;
          background: #fbfcfe;
        }

        .visa-option strong {
          display: block;
          color: #24324d;
          font-size: 13px;
        }

        .visa-option small {
          display: block;
          margin-top: 4px;
          color: #7a869d;
          font-size: 11px;
        }

        .toggle {
          width: 43px;
          height: 24px;
          padding: 3px;
          border: 0;
          border-radius: 999px;
          background: #d8dee9;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .toggle span {
          display: block;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
          transition: transform 0.15s ease;
        }

        .toggle.active {
          background: #4f46e5;
        }

        .toggle.active span {
          transform: translateX(19px);
        }

        @media (max-width: 900px) {
          .planner-layout {
            width: min(100% - 24px, 760px);
            grid-template-columns: 1fr;
          }

          .summary-column {
            position: static;
            order: -1;
          }

          .trip-summary-card {
            position: static;
          }
        }

        @media (max-width: 600px) {
          .planner-layout {
            width: calc(100% - 16px);
          }

          .mode-switch {
            grid-template-columns: 1fr;
          }

          .interest-chip {
            padding: 8px 10px;
          }
        }
      `}</style>
    </main>
  );
}
