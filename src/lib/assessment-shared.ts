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
      ny: ["U.S. Mission to the UN", "State Dept. (NY liaison offices)", "Peace Corps Response", "Foreign Commercial Service"],
      abroad: ["U.S. Embassies (worldwide)", "State Dept. political sections", "USAID missions", "Foreign Commercial Service"],
      default: ["U.S. Department of State", "USAID", "Foreign Commercial Service", "Peace Corps"],
    },
  },
  multilateral: {
    key: "multilateral",
    title: "Multilateral Institutions",
    category: "Employers",
    subsection: "Multilateral & International Organization",
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
    title: "International Development",
    category: "Employers",
    subsection: "Development Implementer & Contractor",
    roles: ["Program Officer", "Field Coordinator", "M&E Analyst"],
    employers: {
      dc: ["Chemonics", "DAI", "Mercy Corps", "Palladium"],
      ny: ["Rockefeller Foundation", "Ford Foundation", "Mastercard Foundation", "FHI 360"],
      abroad: ["IRC field offices", "Save the Children", "Chemonics country offices", "DAI field projects"],
      default: ["Mercy Corps", "IRC", "Save the Children", "Chemonics"],
    },
  },
  policy_research: {
    key: "policy_research",
    title: "Policy & Research",
    category: "Employers",
    subsection: "Think Tank — US",
    roles: ["Research Associate", "Program Coordinator", "Policy Analyst"],
    employers: {
      dc: ["CSIS", "Brookings", "Atlantic Council", "CFR"],
      ny: ["Council on Foreign Relations", "Carnegie Endowment", "Human Rights Watch", "International Peace Institute"],
      abroad: ["Chatham House", "IISS", "Carnegie Europe", "European Council on Foreign Relations"],
      default: ["CSIS", "Brookings", "Atlantic Council", "RAND"],
    },
  },
  security_defense: {
    key: "security_defense",
    title: "Security & Defense",
    category: "Employers",
    subsection: "Intelligence, Analysis & Media",
    requiresCitizenship: true,
    roles: ["Intelligence Analyst", "Defense Policy Analyst", "National Security Program Officer"],
    employers: {
      dc: ["RAND", "Center for a New American Security", "CNA", "Department of Defense"],
      ny: ["The Soufan Center", "International Peace Institute", "Council on Foreign Relations — Security Studies", "NYU CIC"],
      abroad: ["NATO (Brussels)", "IISS (London)", "GCSP (Geneva)", "RAND Europe"],
      default: ["RAND", "Center for a New American Security", "CNA", "Department of Defense"],
    },
  },
  international_law: {
    key: "international_law",
    title: "International Law & Justice",
    category: "NGO/IGO/Think Tank",
    subsection: "Human Rights",
    roles: ["Legal Officer", "War Crimes Analyst", "Human Rights Advocate"],
    employers: {
      dc: ["American Society of International Law", "Center for Justice & Accountability", "Human Rights Watch", "State Dept. Office of the Legal Adviser"],
      ny: ["UN Office of Legal Affairs", "Human Rights Watch", "Global Rights Compliance", "Open Society Foundations"],
      abroad: ["International Criminal Court (The Hague)", "International Court of Justice", "ECtHR (Strasbourg)", "UN Human Rights (Geneva)"],
      default: ["International Criminal Court", "Human Rights Watch", "UN Office of Legal Affairs", "American Society of International Law"],
    },
  },
  global_business: {
    key: "global_business",
    title: "Global Business & Risk",
    category: "Employers",
    subsection: "Political Risk & Geopolitical Advisory",
    roles: ["Geopolitical Risk Analyst", "Public Sector Consultant", "Country Risk Associate"],
    employers: {
      dc: ["McKinsey Public Sector", "EY-Parthenon", "Eurasia Group", "Albright Stonebridge"],
      ny: ["Eurasia Group", "BlackRock Geopolitics", "Goldman Sachs Public Sector", "Kroll"],
      abroad: ["Control Risks", "Oxford Analytica", "Eurasia Group (London)", "S&P Global"],
      default: ["Eurasia Group", "McKinsey Public Sector", "Control Risks", "Kroll"],
    },
  },
  humanitarian: {
    key: "humanitarian",
    title: "Humanitarian & Crisis Response",
    category: "Employers",
    subsection: "NGO / Humanitarian / Democracy",
    roles: ["Emergency Response Coordinator", "Humanitarian Affairs Officer", "Field Logistics Coordinator"],
    employers: {
      dc: ["USAID Bureau for Humanitarian Assistance", "IRC", "CARE", "Relief International"],
      ny: ["UN OCHA", "UNICEF Emergency Programmes", "IRC headquarters", "CARE USA"],
      abroad: ["UN OCHA field offices", "Médecins Sans Frontières", "Norwegian Refugee Council", "World Food Programme"],
      default: ["UN OCHA", "IRC", "Médecins Sans Frontières", "World Food Programme"],
    },
  },
  academia: {
    key: "academia",
    title: "Academia & Scholarship",
    category: "Graduate Programs",
    roles: ["Doctoral Researcher", "Lecturer in International Relations", "Postdoctoral Fellow"],
    employers: {
      dc: ["Georgetown SFS", "Johns Hopkins SAIS", "Wilson Center", "GW Elliott School"],
      ny: ["Columbia SIPA", "NYU Center for Global Affairs", "CFR Fellowship Programs", "Ford Foundation"],
      abroad: ["Oxford DPIR", "LSE IDEAS", "Sciences Po (Paris)", "Graduate Institute Geneva"],
      default: ["Georgetown SFS", "Johns Hopkins SAIS", "Princeton SPIA", "Fletcher School"],
    },
  },
};

// ---------------------------------------------------------------------------
// Track scoring — every answer nudges one or more tracks; the ranked output
// drives BOTH the primary pick and the two alternates (always #2 and #3,
// never duplicates, never a citizenship-gated track for non-citizens).
// ---------------------------------------------------------------------------

export const TRACK_ORDER = [
  "foreign_service",
  "policy_research",
  "multilateral",
  "development",
  "security_defense",
  "international_law",
  "global_business",
  "humanitarian",
  "academia",
] as const;

const Q1_WEIGHTS: Record<string, Record<string, number>> = {
  "Undergrad (1st–2nd year)": { academia: 1 },
  "Grad student": { academia: 2 },
};

const Q2_WEIGHTS: Record<string, Record<string, number>> = {
  "Representing my country (diplomacy & foreign service)": { foreign_service: 4, security_defense: 1 },
  "Shaping policy ideas (think tanks & research)": { policy_research: 4, academia: 1 },
  "Global institutions (UN & multilaterals)": { multilateral: 4, international_law: 1 },
  "Mission-driven fieldwork (NGOs & development)": { development: 4, humanitarian: 1 },
  "Global business & risk (private sector)": { global_business: 4 },
};

const Q3_WEIGHTS: Record<string, Record<string, number>> = {
  "Researching & writing": { policy_research: 2, academia: 2 },
  "Building relationships & persuading": { foreign_service: 2, international_law: 2 },
  "Running projects & operations": { development: 2, humanitarian: 1 },
  "Data & analysis": { global_business: 2, security_defense: 1 },
  "Communicating to audiences": { academia: 1, policy_research: 1, foreign_service: 1 },
};

const Q4_WEIGHTS: Record<string, Record<string, number>> = {
  "Security & defense": { security_defense: 3, foreign_service: 1 },
  "Trade & economics": { global_business: 2, multilateral: 1 },
  "Climate & energy": { development: 1, multilateral: 1, policy_research: 1 },
  "Tech policy": { policy_research: 2, global_business: 1 },
  "Human rights & humanitarian": { humanitarian: 4, international_law: 3, development: 1 },
};

const Q6_WEIGHTS: Record<string, Record<string, number>> = {
  "Prestige track, slower advancement": { foreign_service: 2, academia: 2 },
  "Small org, big responsibility now": { development: 2, policy_research: 1 },
  "Stability & clear structure": { multilateral: 2, security_defense: 1, international_law: 1 },
  "Highest-impact work, even if unglamorous": { humanitarian: 3, development: 1 },
  "Best compensation available": { global_business: 2 },
};

const Q7_WEIGHTS: Record<string, Record<string, number>> = {
  "Next year": { academia: 1 },
  "Exploring, no rush": { academia: 2 },
};

const Q8_WEIGHTS: Record<string, Record<string, number>> = {
  "Second language (professional)": { foreign_service: 2, multilateral: 1 },
  "Quant or data skills": { global_business: 2, security_defense: 1 },
  "Published or professional writing": { policy_research: 2, academia: 2 },
  "International living or work experience": { development: 1, multilateral: 1, humanitarian: 1 },
  "Still building": {},
};

/** Returns all reachable track keys, best fit first. */
export function rankTracks(ans: AssessmentAnswers): string[] {
  const scores: Record<string, number> = {};
  for (const k of TRACK_ORDER) scores[k] = 0;
  const add = (w?: Record<string, number>) => {
    if (!w) return;
    for (const [k, v] of Object.entries(w)) scores[k] += v;
  };
  add(Q1_WEIGHTS[ans.q1_stage]);
  add(Q2_WEIGHTS[ans.q2_sector]);
  add(Q3_WEIGHTS[ans.q3_function]);
  for (const issue of ans.q4_issues ?? []) add(Q4_WEIGHTS[issue]);
  add(Q6_WEIGHTS[ans.q6_tradeoff]);
  add(Q7_WEIGHTS[ans.q7_timeline]);
  for (const s of ans.q8_skills ?? []) add(Q8_WEIGHTS[s]);
  // Q9 gate: no citizenship → citizenship-required tracks are unreachable.
  const citizen = ans.q9_work_auth === "U.S. citizen";
  return [...TRACK_ORDER]
    .filter((k) => citizen || !ARCHETYPES[k].requiresCitizenship)
    .sort(
      (a, b) =>
        scores[b] - scores[a] || TRACK_ORDER.indexOf(a) - TRACK_ORDER.indexOf(b),
    );
}

function locationBucket(q5: string): "dc" | "ny" | "abroad" | "default" {
  if (q5.startsWith("Washington")) return "dc";
  if (q5.startsWith("New York")) return "ny";
  if (q5.startsWith("Abroad")) return "abroad";
  return "default";
}

export function computeArchetypeKey(ans: AssessmentAnswers): string {
  return rankTracks(ans)[0];
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
  development:
    "long-horizon institution building matters more to you than emergency response or policy papers",
  security_defense:
    "the mission of protecting outweighs the pull of negotiating — and you're comfortable in cleared, structured worlds",
  international_law:
    "you'd rather build cases than campaigns — treaties, precedent, and courts over policy papers",
  global_business: "compensation and pace win out over mission-first work",
  humanitarian:
    "you want to be where the crisis is — speed and field presence over institutional scale",
  academia:
    "you want depth over pace — the long game of research, teaching, and scholarship",
};

function locationSentence(q5: string, primaryTitle: string): string {
  const t = primaryTitle.toLowerCase();
  if (q5.startsWith("Washington"))
    return `And since you'd move to Washington DC, you're aiming at the one city where the ${t} world actually hires — your target list and your zip code finally match.`;
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
    // Was this track the direct anchor of the q2 answer, or did secondary
    // signals (issues, work style, trade-off) push it past that anchor?
    const q2w = Q2_WEIGHTS[ans.q2_sector] ?? {};
    const anchorKey = Object.keys(q2w).sort((x, y) => q2w[y] - q2w[x])[0];
    if (!anchorKey || anchorKey === a.key) {
      why =
        `This ranked first because it answers your pull toward ${sectorPull} directly — and the day-to-day work is ${workStyle}, the thing you said makes you lose track of time. Given your trade-off ("${tradeoff}"), it beats the two paths below. ` +
        locationSentence(ans.q5_location, a.title);
    } else {
      const anchorTitle = ARCHETYPES[anchorKey]?.title ?? sectorPull;
      why =
        `This ranked first even though it wasn't your stated pull — your interest in ${issue}, the fact that ${workStyle} is where you lose track of time, and your trade-off ("${tradeoff}") pushed it past the ${anchorTitle} track. ` +
        locationSentence(ans.q5_location, a.title);
    }
  } else {
    const hook = INSTEAD_HOOKS[a.key] ?? "your priorities shift";
    why = `Choose this instead if ${hook}. Right now your answers — the trade-off you picked and the work you actually enjoy — keep the ${primaryTitle} track in front, though your interest in ${issue} fits here too. If that trade-off ever flips, this is the first path to revisit.`;
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
  // Ranked scoring drives everything: primary is #1, alternates are always
  // the next two best fits — never duplicates, never citizenship-gated.
  const ranked = rankTracks(ans);
  const primaryKey = ranked[0];
  const adj = ranked.slice(1, 3);
  const primary = ARCHETYPES[primaryKey];

  const summary = `You told me three things that matter: you're pulled toward ${ans.q2_sector.split(" (")[0].toLowerCase()}, you're ${ans.q1_stage.toLowerCase()}, and the biggest gap is "${ans.q10_obstacle.toLowerCase()}." This plan is built around exactly that.`;

  const urgent = ans.q7_timeline === "Applying right now";
  const days0to30: string[] = [];
  const days30to60: string[] = [];
  const days60to90: string[] = [];

  switch (ans.q10_obstacle) {
    case "I don't know what roles exist":
      days0to30.push(`Browse the directory filtered to the ${primary.title} track and save 10 roles that make you curious.`);
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
    days0to30.push(`Apply to 3 live openings on the ${primary.title} track from the directory this month.`);
  } else {
    days0to30.push(`Pick 2 ${primary.title.toLowerCase()} organizations and read their last 3 published pieces.`);
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
