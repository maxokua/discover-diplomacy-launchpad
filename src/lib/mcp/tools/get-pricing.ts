import { defineTool } from "@lovable.dev/mcp-js";

const PRICING = {
  candidates: {
    free: "Account + profile, limited features.",
    compass: "$35/mo — self-directed tools: resume help, job board, digest, community, Resume Drop opt-in.",
    envoy: "$150/mo — everything in Compass plus unlimited coaching, mock interviews, priority matching.",
    resume_review: "$25 one-time expert-designed resume review.",
  },
  employers: {
    free: "Browse only, no unlocks.",
    starter: "$30/mo — 10 credits/mo.",
    professional: "$100/mo — 50 credits/mo.",
    a_la_carte: "$18/credit, or 20 credits for $300. Credits roll over and never expire.",
    placement_fees: "À la carte $1,200 / Starter $700 / Professional $500 per hire.",
  },
  universities: "$20/student/mo in bulk (minimum 50 students, annual commitment).",
};

export default defineTool({
  name: "get_pricing",
  title: "Get Discover Diplomacy pricing",
  description:
    "Return current pricing tiers for candidates, employers, and universities on Discover Diplomacy.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(PRICING, null, 2) }],
    structuredContent: PRICING,
  }),
});
