import { defineMcp } from "@lovable.dev/mcp-js";
import searchDirectory from "./tools/search-directory";
import listCategories from "./tools/list-categories";
import getPricing from "./tools/get-pricing";

export default defineMcp({
  name: "discover-diplomacy-mcp",
  title: "Discover Diplomacy",
  version: "0.1.0",
  instructions:
    "Tools for exploring Discover Diplomacy, the talent infrastructure for internationally-focused careers. Use `search_directory` to find NGOs, think tanks, fellowships, and government opportunities; `list_directory_categories` to see what's available; `get_pricing` for current membership and employer pricing.",
  tools: [searchDirectory, listCategories, getPricing],
});
