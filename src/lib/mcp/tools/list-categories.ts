import { defineTool } from "@lovable.dev/mcp-js";
import directory from "@/data/directory.json";

type Entry = { category: string };
const entries = directory as Entry[];

export default defineTool({
  name: "list_directory_categories",
  title: "List directory categories",
  description:
    "List all categories available in the Discover Diplomacy opportunity directory, with counts.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const counts = new Map<string, number>();
    for (const e of entries) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    const rows = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
    return {
      content: [
        {
          type: "text",
          text: rows.map((r) => `${r.category} — ${r.count}`).join("\n"),
        },
      ],
      structuredContent: { categories: rows },
    };
  },
});
