const ollama = require("ollama").default;
const express = require("express");

const PORT = 3000;
const app = express();

// Function to simulate fetching current weather data for a city
const getCurrentWeather = async ({ city }) => {
  if (!city) return null;

  // Simulate a 50% chance of successfully fetching weather data
  const isSuccess = Math.random() < 0.5;
  if (isSuccess) {
    return {
      status: "success",
      data: {
        city,
        temp: `${Math.floor(Math.random() * 35) - 5}°C`,
        condition: ["sunny", "cloudy", "rainy", "snowy"][
          Math.floor(Math.random() * 4)
        ],
      },
    };
  } else {
    return {
      status: "error",
      message: "Unable to fetch weather data. Please try again later.",
    };
  }
};

// Map of available tools with their corresponding functions
const tools = {
  getCurrentWeather,
};

// Tool declarations for model integration
const toolDeclarations = [
  {
    type: "function",
    function: {
      name: "getCurrentWeather",
      description: "Retrieve the current weather for a specified city",
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

// Function to send a message to the chat model and get a response
const chat = async (messages) => {
  return ollama.chat({
    messages,
    stream: false,
    model: "llama3.1", // Use the chat model to generate responses
  });
};

// Function to send a user query to the tools model and get context information
const generateContextResponse = async (userQuery) => {
  return ollama.chat({
    messages: [{ role: "user", content: userQuery }],
    stream: false,
    model: "tools", // Use the tools model to generate context
    tools: toolDeclarations, // Provide tool declarations for context generation
  });
};

// Function to process tool calls from the context response
const processToolCalls = async (toolCalls) => {
  if (!toolCalls) return [];

  // Execute each tool call and collect the results
  return Promise.all(
    toolCalls.map(async (call) => {
      const toolFunction = tools[call.function.name];
      if (!toolFunction) return null; // Skip unknown tools
      return {
        [call.function.name]: await toolFunction(call.function.arguments),
      };
    })
  );
};

// Function to handle a user's query: get context, process it, and generate a response
const processUserQuery = async (userQuery) => {
  // Step 1: Generate context based on user query using the tools model
  const contextResponse = await generateContextResponse(userQuery);

  // Step 2: Process the tool calls from the context response to get additional information
  const toolResults = await processToolCalls(
    contextResponse.message.tool_calls
  );

  // Step 3: Create an enriched message combining the user query and context results
  const enrichedUserMessage = `
    User query: ${userQuery}
    Context from tools: ${JSON.stringify(toolResults)}
    Please answer the user's query using the provided context if relevant, otherwise use your own knowledge.
    Respond without mentioning tools or context.
  `;

  // Step 4: Send the enriched message to the chat model to get the final response
  const chatResponse = await chat([
    { role: "user", content: enrichedUserMessage },
  ]);

  // Return the final response content
  return { content: chatResponse.message.content };
};

// Define API route for handling user queries
app.get("/", async (req, res) => {
  try {
    const userQuery = req.query.content; // Extract user query from request
    const result = await processUserQuery(userQuery); // Process the query and get response
    res.json(result); // Send the response back to the user
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." }); // Handle errors
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
