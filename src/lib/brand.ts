// Single source of truth for pricing, traction, and shared brand copy.
// If you find yourself hardcoding any of these elsewhere, import from here instead.
// See BRAND.md for the full brand reference.

export const BRAND = {
  name: "Discover Diplomacy",
  oneLiner:
    "Discover the opportunities. Prepare the materials. Open the doors. Get hired.",
  positioning:
    "The talent infrastructure layer for internationally-focused careers — combining a curated opportunity directory, instant expert-designed application help, vetted insider coaches, and direct access to employers.",
  email: "hello@discoverdiplomacy.org",
  location: "Washington, DC",
} as const;

export const PILLARS = [
  {
    key: "clarity",
    label: "Clarity",
    line: "Figure out what you actually want to do in a vast field.",
  },
  {
    key: "preparation",
    label: "Preparation",
    line: "Instant, expert-designed help — plus vetted coaches when you need a human.",
  },
  {
    key: "access",
    label: "Access",
    line: "Get surfaced to employers and connected to insiders. No network required.",
  },
] as const;

export const TRACTION = {
  peopleReached: "25,000+",
  directoryViews: "125,000+",
  weeklyOpportunities: "~50",
} as const;

// Pricing — DO NOT hardcode prices on individual pages.
// Annual = ~20% off monthly (2.4 months free).
export const PRICING = {
  explorer: {
    name: "Explorer",
    price: 0,
    priceLabel: "Free",
    cadence: "forever",
    tagline:
      "Create a free account and start booking Diplomat-level coaches today.",
  },
  compass: {
    name: "Compass",
    price: 20,
    priceLabel: "$20",
    cadence: "/ month",
    annualPrice: 192,
    annualLabel: "$192",
    annualCadence: "/ year",
    annualEquivalent: "$16/mo billed annually",
    annualSavings: "Save $48",
    tagline:
      "For students and early-career people getting oriented and job-hunting on their own.",
  },
  envoy: {
    name: "Envoy",
    price: 150,
    priceLabel: "$150",
    cadence: "/ month",
    annualPrice: 1440,
    annualLabel: "$1,440",
    annualCadence: "/ year",
    annualEquivalent: "$120/mo billed annually",
    annualSavings: "Save $360",
    tagline:
      "For people actively applying who want hands-on help with every step — plus two complimentary Diplomat sessions every month.",
  },
  resumeReview: {
    name: "Expert Resume Review",
    price: 25,
    priceLabel: "$25",
    cadence: "one-time",
    tagline:
      "A coach reviews your resume line by line, tailored to the role you're targeting. Returned in 3–5 days.",
  },
} as const;


export const TRUST_WALL =
  "Paid time is sold (coaching, review, expertise). Genuine vouches and referrals are earned, never bought.";
