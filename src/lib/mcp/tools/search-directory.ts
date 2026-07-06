import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import directory from "@/data/directory.json";

type Entry = {
  category: string;
  name: string;
  location: string;
  interest: string;
  subsection: string;
  url: string;
  description: string;
  externalLink: string;
};

const entries = directory as Entry[];

export default defineTool({
  name: "search_directory",
  title: "Search opportunity directory",
  description:
    "Search Discover Diplomacy's directory of international affairs opportunities (NGOs, think tanks, government, multilaterals, fellowships, internships).",
  inputSchema: {
    query: z
      .string()
      .optional()
      .describe("Free-text query matched against name, description, and location."),
    category: z
      .string()
      .optional()
      .describe("Optional category filter, e.g. 'NGO/IGO/Think Tank', 'Government', 'Fellowship'."),
    location: z
      .string()
      .optional()
      .describe("Optional location substring, e.g. 'Washington DC', 'New York City', 'Online'."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, category, location, limit }) => {
    const q = query?.toLowerCase().trim();
    const cat = category?.toLowerCase().trim();
    const loc = location?.toLowerCase().trim();
    const results = entries
      .filter((e) => {
        if (cat && !e.category.toLowerCase().includes(cat)) return false;
        if (loc && !e.location.toLowerCase().includes(loc)) return false;
        if (q) {
          const hay = `${e.name} ${e.description} ${e.location} ${e.interest} ${e.subsection}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .slice(0, limit ?? 20)
      .map((e) => ({
        name: e.name,
        category: e.category,
        location: e.location,
        interest: e.interest,
        link: e.externalLink || e.url,
        summary: e.description.slice(0, 400),
      }));

    return {
      content: [
        {
          type: "text",
          text:
            results.length === 0
              ? "No matching opportunities found."
              : `Found ${results.length} opportunity(ies):\n\n` +
                results
                  .map(
                    (r, i) =>
                      `${i + 1}. ${r.name} — ${r.category} · ${r.location}\n   ${r.link}\n   ${r.summary}`,
                  )
                  .join("\n\n"),
        },
      ],
      structuredContent: { results, total: results.length },
    };
  },
});
