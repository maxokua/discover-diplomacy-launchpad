// Shared question data + archetype scoring model used by BOTH the public
// /assessment quiz and the authenticated /welcome onboarding flow.
// Do not duplicate this data — reuse this module.

export type QuestionKey =
  | "q1_stage"
  | "q2_sector"
  | "q3_function"
  | "q4_issues"
  | "q5_location"
  | "q6_tradeoff"
  | "q7_timeline"
  | "q8_skills"
  | "q9_work_auth"
  | "q10_obstacle";

export const QUESTION_KEYS: QuestionKey[] = [
  "q1_stage",
  "q2_sector",
  "q3_function",
  "q4_issues",
  "q5_location",
  "q6_tradeoff",
  "q7_timeline",
  "q8_skills",
  "q9_work_auth",
  "q10_obstacle",
];

export type Question = {
  key: QuestionKey;
  prompt: string;
  helper?: string;
  options: string[];
  multi?: { max: number };
  reactions?: Record<string, string>;
  defaultReaction: string;
};

export const QUESTIONS: Question[] = [
  {
    key: "q1_stage",
    prompt: "Where are you in your journey?",
    options: [
      "Undergrad (1st–2nd year)",
      "Undergrad (3rd–4th year)",
      "Grad student",
      "Working, early career",
      "Switching into this field",
    ],
    defaultReaction: "Got it — that shapes what I'd have you do first.",
  },
  {
    key: "q2_sector",
    prompt: "Which world pulls you the most?",
    options: [
      "Representing my country (diplomacy & foreign service)",
      "Shaping policy ideas (think tanks & research)",
      "Global institutions (UN & multilaterals)",
      "Mission-driven fieldwork (NGOs & development)",
      "Global business & risk (private sector)",
    ],
    defaultReaction: "That's the anchor for your primary path.",
  },
  {
    key: "q3_function",
    prompt: "What kind of work makes you lose track of time?",
    options: [
      "Researching & writing",
      "Building relationships & persuading",
      "Running projects & operations",
      "Data & analysis",
      "Communicating to audiences",
    ],
    defaultReaction: "Noted — I'll flavor your roles around that.",
  },
  {
    key: "q4_issues",
    prompt: "Which issues do you follow in your free time?",
    helper: "Pick up to 2.",
    options: [
      "Security & defense",
      "Trade & economics",
      "Climate & energy",
      "Tech policy",
      "Human rights & humanitarian",
    ],
    multi: { max: 2 },
    defaultReaction: "Those are useful signals for niching down.",
  },
  {
    key: "q5_location",
    prompt: "Where would you actually move for the right role?",
    options: [
      "Washington DC",
      "New York",
      "Anywhere in the US",
      "Abroad (Geneva, Brussels, field posts)",
      "I need remote-flexible",
    ],
    defaultReaction: "Location changes which employers are realistic. Good to know.",
  },
  {
    key: "q6_tradeoff",
    prompt: "Choose your trade-off:",
    options: [
      "Prestige track, slower advancement",
      "Small org, big responsibility now",
      "Stability & clear structure",
      "Highest-impact work, even if unglamorous",
      "Best compensation available",
    ],
    defaultReaction: "That helps me rank paths, not just list them.",
  },
  {
    key: "q7_timeline",
    prompt: "What's your timeline?",
    options: [
      "Applying right now",
      "This coming cycle (3–6 months)",
      "Next year",
      "Exploring, no rush",
    ],
    reactions: {
      "Applying right now": "Then we're compressing this. I'll put deadlines in phase 1.",
    },
    defaultReaction: "Good — that sets the pace of your plan.",
  },
  {
    key: "q8_skills",
    prompt: "Which of these do you already have?",
    helper: "Select all that apply.",
    options: [
      "Second language (professional)",
      "Quant or data skills",
      "Published or professional writing",
      "International living or work experience",
      "Still building",
    ],
    multi: { max: 5 },
    defaultReaction: "That changes what your resume should lead with.",
  },
  {
    key: "q9_work_auth",
    prompt: "Are you authorized to work in the U.S.?",
    helper: "Only used to match you to eligible roles — never shared.",
    options: [
      "U.S. citizen",
      "Green card or work-authorized",
      "International student (visa)",
      "Prefer not to say",
    ],
    reactions: {
      "International student (visa)":
        "Got it — I'll steer you away from anything that requires citizenship.",
    },
    defaultReaction: "Thanks — I'll filter for what's actually open to you.",
  },
  {
    key: "q10_obstacle",
    prompt: "What's the biggest thing standing between you and the job?",
    options: [
      "I don't know what roles exist",
      "My resume & materials",
      "No network in this field",
      "Interviews & assessments",
      "Getting seen by employers",
    ],
    defaultReaction: "That's the piece I'll build the plan around.",
  },
];

// ---------------------------------------------------------------------------
// Answer shape
// ---------------------------------------------------------------------------

export type AssessmentAnswers = {
  q1_stage: string;
  q2_sector: string;
  q3_function: string;
  q4_issues: string[];
  q5_location: string;
  q6_tradeoff: string;
  q7_timeline: string;
  q8_skills: string[];
  q9_work_auth: string;
  q10_obstacle: string;
};

export const EMPTY_ANSWERS: AssessmentAnswers = {
  q1_stage: "",
  q2_sector: "",
  q3_function: "",
  q4_issues: [],
  q5_location: "",
  q6_tradeoff: "",
  q7_timeline: "",
  q8_skills: [],
  q9_work_auth: "",
  q10_obstacle: "",
};

// ---------------------------------------------------------------------------
// Archetype scoring
// ---------------------------------------------------------------------------

export type Archetype = {
  key: string;
  title: string;
  category: string;
  subsection?: string;
  requiresCitizenship?: boolean;
  employers: Record<string, string[]>;
  roles: string[];
};

export const ARCHETYPES: Record<string, Archetype> = {
  foreign_service: {
    key: "foreign_service",
    title: "Foreign Service & Diplomacy",
    category: "Government",
    subsection: "Foreign Service",
    requiresCitizenship: true,
    roles: ["Foreign Service Officer", "Consular Officer", "Civil Service policy analyst"],
    employers: {
      dc: ["U.S. Department of State", "USAID", "Foreign Commercial Service", "Peace Corps"],
      abroad: ["U.S. Embassies (worldwide)", "State Dept. political sections", "USAID missions", "Foreign Commercial Service"],
      default: ["U.S. Department of State", "USAID", "Foreign Commercial Service", "Peace Corps"],
    },
  },
  policy_research: {
    key: "policy_research",
    title: "Policy & Research",
    category: "NGO/IGO/Think Tank",
    subsection: "Foreign Policy",
    roles: ["Research Associate", "Program Coordinator", "Policy Analyst"],
    employers: {
      dc: ["CSIS", "Brookings", "Atlantic Council", "CFR"],
      ny: ["Council on Foreign Relations", "Carnegie Endowment", "Human Rights Watch", "International Peace Institute"],
      abroad: ["Chatham House", "IISS", "Carnegie Europe", "European Council on Foreign Relations"],
      default: ["CSIS", "Brookings", "Atlantic Council", "RAND"],
    },
  },
  multilateral: {
    key: "multilateral",
    title: "Multilateral Institutions",
    category: "NGO/IGO/Think Tank",
    roles: ["Junior Professional Officer (JPO)", "Young Professional (YPP)", "Program Analyst"],
    employers: {
      dc: ["World Bank", "IMF", "IFC", "Inter-American Development Bank"],
      ny: ["UN Secretariat", "UNDP", "UNICEF", "UN Women"],
      abroad: ["UN Geneva", "WHO", "OECD (Paris)", "ILO"],
      default: ["World Bank", "IMF", "UN Secretariat", "OECD"],
    },
  },
  development: {
    key: "development",
    title: "Development & Humanitarian",
    category: "NGO/IGO/Think Tank",
    subsection: "International Development",
    roles: ["Program Officer", "Field Coordinator", "M&E Analyst"],
    employers: {
      dc: ["Mercy Corps", "IRC", "Chemonics", "DAI"],
      abroad: ["IRC field offices", "MSF", "Save the Children", "Norwegian Refugee Council"],
      default: ["Mercy Corps", "IRC", "Save the Children", "Chemonics"],
    },
  },
  global_business: {
    key: "global_business",
    title: "Global Business & Geoeconomics",
    category: "NGO/IGO/Think Tank",
    subsection: "International Economic Policy",
    roles: ["Geopolitical Risk Analyst", "Public Sector Consultant", "Country Risk Associate"],
    employers: {
      dc: ["McKinsey Public Sector", "EY-Parthenon", "Eurasia Group", "Albright Stonebridge"],
      ny: ["Eurasia Group", "BlackRock Geopolitics", "Goldman Sachs Public Sector", "Kroll"],
      abroad: ["Control Risks", "Oxford Analytica", "Eurasia Group (London)", "S&P Global"],
      default: ["Eurasia Group", "McKinsey Public Sector", "Control Risks", "Kroll"],
    },
  },
};

export const Q2_TO_ARCHETYPE: Record<string, string> = {
  "Representing my country (diplomacy & foreign service)": "foreign_service",
  "Shaping policy ideas (think tanks & research)": "policy_research",
  "Global institutions (UN & multilaterals)": "multilateral",
  "Mission-driven fieldwork (NGOs & development)": "development",
  "Global business & risk (private sector)": "global_business",
};

const ADJACENCY: Record<string, [string, string]> = {
  foreign_service: ["multilateral", "policy_research"],
  policy_research: ["multilateral", "global_business"],
  multilateral: ["development", "policy_research"],
  development: ["multilateral", "policy_research"],
  global_business: ["policy_research", "multilateral"],
};

function locationBucket(q5: string): "dc" | "ny" | "abroad" | "default" {
  if (q5.startsWith("Washington")) return "dc";
  if (q5.startsWith("New York")) return "ny";
  if (q5.startsWith("Abroad")) return "abroad";
  return "default";
}

export function computeArchetypeKey(ans: AssessmentAnswers): string {
  let key = Q2_TO_ARCHETYPE[ans.q2_sector] ?? "policy_research";
  // Q9 gate: no citizenship → never recommend Foreign Service as primary
  if (
    ARCHETYPES[key]?.requiresCitizenship &&
    ans.q9_work_auth !== "U.S. citizen"
  ) {
    key = ans.q6_tradeoff.includes("compensation") ? "global_business" : "multilateral";
  }
  return key;
}

export type PathCard = {
  title: string;
  archetypeKey: string;
  why: string;
  exampleRoles: string[];
  exampleEmployers: string[];
  directoryHref: string;
};

export type PlanOutput = {
  archetype: string;
  archetypeKey: string;
  summary: string;
  primary: PathCard;
  adjacent: [PathCard, PathCard];
  days0to30: string[];
  days30to60: string[];
  days60to90: string[];
};

function directoryHref(a: Archetype): string {
  const params = new URLSearchParams();
  params.set("category", a.category);
  if (a.subsection) params.set("subsection", a.subsection);
  return `/directory?${params.toString()}`;
}

// What would make someone pick each path INSTEAD of the primary — the real trade-off.
const INSTEAD_HOOKS: Record<string, string> = {
  foreign_service:
    "the prestige and structure of representing your country outweigh speed and flexibility",
  policy_research:
    "you'd rather shape the ideas than run the programs — writing and analysis over operations",
  multilateral:
    "you want the scale of the UN system and its structured early-career programs (JPO, YPP) over a scrappier, faster route",
  development: "field-level impact matters more to you than policy-level influence",
  global_business: "compensation and pace win out over mission-first work",
};

function locationSentence(q5: string, primaryTitle: string): string {
  const t = primaryTitle.toLowerCase();
  if (q5.startsWith("Washington"))
    return `And since you'd move to Washington DC, you're aiming at the one city where most ${t} employers actually hire — your target list and your zip code finally match.`;
  if (q5.startsWith("New York"))
    return `Since you'd move to New York, your target list is weighted toward the employers actually headquartered there — the UN corridor, the foundations, and the risk firms.`;
  if (q5.startsWith("Abroad"))
    return `Since you'd move abroad, the Geneva and Brussels postings aren't a dream scenario — they're a real application track, and your employer list is weighted toward them.`;
  if (q5.startsWith("I need remote"))
    return `One honest note: this field runs on proximity. Remote-flexible narrows the employer list, so I've kept only the ones where remote is realistic — each application has to count.`;
  return `Since you're open to anywhere in the US, don't default to the coasts — the densest ${t} market is still Washington DC, and being willing to move for it is an edge most candidates won't use.`;
}

function interviewTask(q5: string, networkHeavy: boolean): string {
  const base = networkHeavy
    ? "Book 5 informational interviews — target alumni and 2-years-ahead peers, not senior partners."
    : "Book 3 informational interviews with people in your primary path.";
  if (q5.startsWith("Washington"))
    return base + " In DC, ask for coffee, not a call — in this town, in-person is the whole game.";
  if (q5.startsWith("New York"))
    return base + " In New York, ask for coffee near their office — this corridor runs on short notice.";
  if (q5.startsWith("Abroad"))
    return base + " Prioritize people already posted abroad — ask how they got the posting, not just the job.";
  if (q5.startsWith("I need remote"))
    return base + " Remote-flexible means your network gets built on video calls — follow each one up in writing within 24 hours.";
  return base;
}

function pathFromArchetype(
  a: Archetype,
  ans: AssessmentAnswers,
  primaryTitle?: string,
): PathCard {
  const bucket = locationBucket(ans.q5_location);
  const employers = a.employers[bucket] ?? a.employers.default;
  const sectorPull = ans.q2_sector.split(" (")[0].toLowerCase();
  const workStyle = ans.q3_function.toLowerCase();
  const tradeoff = ans.q6_tradeoff.toLowerCase();
  const issue = (ans.q4_issues[0] || "policy").toLowerCase();
  let why: string;
  if (!primaryTitle || primaryTitle === a.title) {
    why =
      `This ranked first because it answers your pull toward ${sectorPull} directly — and the day-to-day work is ${workStyle}, the thing you said makes you lose track of time. Given your trade-off ("${tradeoff}"), it beats the two paths below. ` +
      locationSentence(ans.q5_location, a.title);
  } else {
    const hook = INSTEAD_HOOKS[a.key] ?? "your priorities shift";
    why = `Choose this instead if ${hook}. Right now your answers — the trade-off you picked and the work you actually enjoy — keep ${primaryTitle} in front, though your interest in ${issue} fits here too. If that trade-off ever flips, this is the first path to revisit.`;
  }
  return {
    title: a.title,
    archetypeKey: a.key,
    why,
    exampleRoles: a.roles.slice(0, 3),
    exampleEmployers: employers.slice(0, 4),
    directoryHref: directoryHref(a),
  };
}

export function computePlan(ans: AssessmentAnswers): PlanOutput {
  const primaryKey = computeArchetypeKey(ans);
  const primary = ARCHETYPES[primaryKey];
  let adj = ADJACENCY[primaryKey] ?? ["policy_research", "multilateral"];
  adj = adj.filter(
    (k) => !(ARCHETYPES[k]?.requiresCitizenship && ans.q9_work_auth !== "U.S. citizen"),
  ) as [string, string];
  const fallback = ["multilateral", "policy_research", "global_business", "development"].filter(
    (k) => k !== primaryKey && !adj.includes(k),
  );
  while (adj.length < 2) adj.push(fallback.shift()!);

  const summary = `You told me three things that matter: you're pulled toward ${ans.q2_sector.split(" (")[0].toLowerCase()}, you're ${ans.q1_stage.toLowerCase()}, and the biggest gap is "${ans.q10_obstacle.toLowerCase()}." This plan is built around exactly that.`;

  const urgent = ans.q7_timeline === "Applying right now";
  const days0to30: string[] = [];
  const days30to60: string[] = [];
  const days60to90: string[] = [];

  switch (ans.q10_obstacle) {
    case "I don't know what roles exist":
      days0to30.push(`Browse the directory filtered to ${primary.title} and save 10 roles that make you curious.`);
      break;
    case "My resume & materials":
      days0to30.push("Run your resume through the AI Resume Score and fix the top 3 flags this week.");
      break;
    case "No network in this field":
      days0to30.push("Join the members community and use the alumni-outreach script to send your first 5 messages.");
      break;
    case "Interviews & assessments":
      days0to30.push("Draft answers to the 10 most common cone/case questions for your path and record yourself once.");
      break;
    case "Getting seen by employers":
      days0to30.push("Set up your Discover Diplomacy profile so you're browsable — vetted candidates get surfaced to hiring employers.");
      break;
  }
  days0to30.push("Subscribe to the Wednesday digest so deadlines find you, not the other way around.");
  if (ans.q10_obstacle === "I don't know what roles exist") {
    days0to30.push(
      urgent
        ? "Even on an urgent timeline, hold applications for two weeks. Open your saved 10 roles and note the qualification that repeats most — applying blind wastes the urgency."
        : "Go one level deeper before you apply anywhere: open your saved 10 roles and note the qualification that repeats most — that gap is what phases 2 and 3 close.",
    );
  } else if (urgent) {
    days0to30.push(`Apply to 3 live ${primary.title} roles from the directory this month.`);
  } else {
    days0to30.push(`Pick 2 ${primary.title.toLowerCase()} employers and read their last 3 published pieces.`);
  }

  days30to60.push(interviewTask(ans.q5_location, ans.q10_obstacle === "No network in this field"));
  if (ans.q10_obstacle === "Getting seen by employers") {
    days30to60.push("Complete your Resume Drop profile — vetted candidates get surfaced directly to hiring employers.");
  } else {
    days30to60.push(`Ship one artifact — a short memo, brief, or analysis — on a ${(ans.q4_issues[0] || "policy").toLowerCase()} issue you care about.`);
  }
  days30to60.push("Apply to 2 stretch roles and 2 realistic roles — track outcomes, not just applications.");

  days60to90.push("Decide which of the three paths is your actual bet, and which two are backups.");
  days60to90.push("Bring your 90-day results to a single coaching session — refine, don't restart.");
  if (urgent) {
    days60to90.push("Close 2 offers to negotiation stage. If you have zero, we regroup on strategy, not effort.");
  } else {
    days60to90.push("Set your next 90-day cycle — same structure, tighter target list.");
  }

  return {
    archetype: primary.title,
    archetypeKey: primary.key,
    summary,
    primary: pathFromArchetype(primary, ans),
    adjacent: [
      pathFromArchetype(ARCHETYPES[adj[0]], ans, primary.title),
      pathFromArchetype(ARCHETYPES[adj[1]], ans, primary.title),
    ],
    days0to30,
    days30to60,
    days60to90,
  };
}

export function answersCompletion(ans: Partial<AssessmentAnswers> | null | undefined): number {
  if (!ans) return 0;
  const filled = QUESTION_KEYS.filter((k) => {
    const v = (ans as any)[k];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" && v.length > 0;
  }).length;
  return Math.round((filled / QUESTION_KEYS.length) * 100);
}
