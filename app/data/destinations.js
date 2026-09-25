export const destinations = [
  {
    country: "Japan",
    city: "Tokyo",
    currency: "JPY",
    airport: "NRT",

    bestMonths: ["March", "April", "October", "November"],

    flightFromHCMC: 650,

    costs: {
      Budget: {
        hotel: 45,
        food: 25,
        transport: 10,
        activities: 10,
      },

      "Mid-range": {
        hotel: 100,
        food: 45,
        transport: 15,
        activities: 25,
      },

      Luxury: {
        hotel: 250,
        food: 100,
        transport: 30,
        activities: 80,
      },
    },

    itinerary: [
      {
        day: 1,
        title: "Arrival & Tokyo Center",
        description:
          "Arrive in Tokyo, check in and explore the city center.",
      },
      {
        day: 2,
        title: "Traditional Tokyo",
        description:
          "Visit Asakusa, Senso-ji Temple and explore traditional neighborhoods.",
      },
      {
        day: 3,
        title: "Modern Tokyo",
        description:
          "Explore Shibuya, Harajuku and Shinjuku.",
      },
      {
        day: 4,
        title: "Culture & Shopping",
        description:
          "Discover museums, local neighborhoods and shopping districts.",
      },
      {
        day: 5,
        title: "Tokyo Experience",
        description:
          "Enjoy local food, entertainment and free time before departure.",
      },
    ],
  },

  {
    country: "France",
    city: "Paris",
    currency: "EUR",
    airport: "CDG",

    bestMonths: ["April", "May", "June", "September", "October"],

    flightFromHCMC: 750,

    costs: {
      Budget: {
        hotel: 55,
        food: 30,
        transport: 10,
        activities: 10,
      },

      "Mid-range": {
        hotel: 120,
        food: 55,
        transport: 15,
        activities: 30,
      },

      Luxury: {
        hotel: 300,
        food: 120,
        transport: 35,
        activities: 100,
      },
    },

    itinerary: [
      {
        day: 1,
        title: "Arrival & Central Paris",
        description:
          "Arrive in Paris, check in and explore the city center.",
      },
      {
        day: 2,
        title: "Eiffel Tower & Seine",
        description:
          "Visit the Eiffel Tower and enjoy a walk along the Seine.",
      },
      {
        day: 3,
        title: "Louvre & Historic Paris",
        description:
          "Explore the Louvre and historic neighborhoods.",
      },
      {
        day: 4,
        title: "Montmartre",
        description:
          "Discover Montmartre, Sacré-Cœur and local cafés.",
      },
      {
        day: 5,
        title: "Paris Lifestyle",
        description:
          "Enjoy shopping, French cuisine and free time.",
      },
    ],
  },

  {
    country: "South Korea",
    city: "Seoul",
    currency: "KRW",
    airport: "ICN",

    bestMonths: ["April", "May", "September", "October"],

    flightFromHCMC: 420,

    costs: {
      Budget: {
        hotel: 40,
        food: 25,
        transport: 8,
        activities: 8,
      },

      "Mid-range": {
        hotel: 90,
        food: 45,
        transport: 12,
        activities: 25,
      },

      Luxury: {
        hotel: 220,
        food: 100,
        transport: 30,
        activities: 70,
      },
    },

    itinerary: [
      {
        day: 1,
        title: "Arrival & Myeongdong",
        description:
          "Arrive in Seoul, check in and explore Myeongdong.",
      },
      {
        day: 2,
        title: "Historic Seoul",
        description:
          "Visit Gyeongbokgung Palace and Bukchon Hanok Village.",
      },
      {
        day: 3,
        title: "Modern Seoul",
        description:
          "Explore Gangnam, COEX and the Han River.",
      },
      {
        day: 4,
        title: "Food & Culture",
        description:
          "Discover local markets, cafés and Korean cuisine.",
      },
      {
        day: 5,
        title: "Seoul Experience",
        description:
          "Enjoy shopping, entertainment and free time.",
      },
    ],
  },

  {
    country: "Thailand",
    city: "Bangkok",
    currency: "THB",
    airport: "BKK",

    bestMonths: ["November", "December", "January", "February"],

    flightFromHCMC: 250,

    costs: {
      Budget: {
        hotel: 25,
        food: 15,
        transport: 5,
        activities: 8,
      },

      "Mid-range": {
        hotel: 65,
        food: 30,
        transport: 8,
        activities: 20,
      },

      Luxury: {
        hotel: 180,
        food: 80,
        transport: 20,
        activities: 60,
      },
    },

    itinerary: [
      {
        day: 1,
        title: "Arrival & Bangkok",
        description:
          "Arrive in Bangkok and explore the city center.",
      },
      {
        day: 2,
        title: "Temples & Old Bangkok",
        description:
          "Visit the Grand Palace, Wat Pho and Wat Arun.",
      },
      {
        day: 3,
        title: "Markets & Local Food",
        description:
          "Explore local markets and experience Thai cuisine.",
      },
      {
        day: 4,
        title: "Modern Bangkok",
        description:
          "Discover shopping malls, cafés and modern neighborhoods.",
      },
      {
        day: 5,
        title: "Relax & Explore",
        description:
          "Enjoy a relaxed day before departure.",
      },
    ],
  },
];
