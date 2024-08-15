const ollama = require("ollama").default;
const express = require("express");

const PORT = 3000;

const app = express();

const tools = [
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

app.get("/", async (req, res) => {
  const response = await ollama.chat({
    tools,

    messages: [{ role: "user", content: req.query.content }],
    model: "llama3.1",
    stream: false,
  });

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
