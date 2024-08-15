Integrating tools with Ollama models can be tricky because the documentation isn’t clear on how to make it work properly. This solution involves using the tools model to generate context based on the user’s query, processing that context, and then combining it with the user’s query to get a final response from the chat model. The provided JavaScript code shows how to do this step-by-step.

# Setup and Installation

## Prerequisites

Before running the server, ensure you have the [Ollama CLI](https://ollama.com) installed.

## Prepare Models

To set up the necessary models for the server, run the following commands:

1. **Download the Chat Model:**
```sh
ollama pull llama3.1
```

2. **Create Tools Model:**
   Ensure you have a `tools.modelfile` configured with the necessary tool definitions, then run:
```sh
ollama create tools -f tools.modelfile
```

## Starting the Server

### Install Dependencies

You can use either `pnpm` or `npm` to install the required dependencies. Choose one of the following methods:

- **Using pnpm:**
```sh
pnpm install
pnpm start
```

- **Using npm:**
```sh
npm install
npm start
```


### Example Requests

Once the server is running, you can test it with the following example requests:

1. **Request without Tool Call or Extra Context:**
   This query does not use any additional context or tool calls.
```sh
curl "http://localhost:3000/?content=Tell+me+about+solar+system"
```


2. **Weather Call:**
   This query requests weather information. Note that the tool simulates a 50% chance of error, so you may need to retry the request.
```sh
curl "http://localhost:3000/?content=Tell+me+about+weather+in+Berlin"
```


## Documentation

### API Endpoint

**GET** `/`

- **Query Parameter:**
  - `content` (string): The user’s query or request.

- **Response:**
  - `content` (string): The response from the chat model based on the user's query and any generated context.

### Error Handling

If there is an issue processing the request, the server will return a `500 Internal Server Error` with a message indicating that an error occurred.