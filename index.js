const ollama = require("ollama").default;
const express = require("express");

const PORT = 3000;

const messages = [];
const app = express();

app.get("/", async (req, res) => {
  messages.push({ role: "user", content: req.query.content });

  const response = await chat(messages);
  const { content, role, tool_calls } = response.message;

  if (!tool_calls) {
    messages.push({ role, content });
    res.json({ content });
    return;
  }

  const calls = await Promise.all(
    tool_calls.map(async (call) => {
      const fn = tools[call.function.name];
      if (!fn) return null;
      return fn(call.function.arguments);
    })
  );

  messages.push({ role: "tool", content: calls.toString() });

  const r = await chat(messages);
  res.json(r);
});

const get_current_weather = async ({ city }) => {
  if (!city) return null;
  return "rain";
};
const tools = { get_current_weather };
const tools_declaration = [
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "Get the current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The name of the city",
          },
        },
        required: ["city"],
      },
    },
  },
];

const chat = async (messages) => {
  return ollama.chat({
    messages,
    stream: false,
    model: "llama3.1",
    tools: tools_declaration,
  });
};

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
