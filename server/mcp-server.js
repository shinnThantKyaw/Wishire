import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getBirthdayFlair } from "./lib/flair.js";

const server = new Server(
  { name: "birthday-facts", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_birthday_flair",
      description:
        "Look up zodiac sign, birthstone, and birth flower for a given birth month and day. Use this to add a real, specific detail into a generated birthday wish instead of inventing one.",
      inputSchema: {
        type: "object",
        properties: {
          month: { type: "number", description: "Birth month, 1-12" },
          day: { type: "number", description: "Birth day, 1-31" },
        },
        required: ["month", "day"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "get_birthday_flair") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
  const { month, day } = request.params.arguments;
  const flair = getBirthdayFlair(month, day);
  return {
    content: [{ type: "text", text: JSON.stringify(flair) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
