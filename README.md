# Pure Assistant-UI Chat Application

This is a pure frontend chat application built with [assistant-ui](https://www.assistant-ui.com/) and Next.js. It demonstrates how to create a beautiful chat interface with tool calling capabilities without requiring a separate backend service.

## Features

- 🤖 **AI Chat Interface** - Beautiful, responsive chat UI powered by assistant-ui
- 🔧 **Built-in Tools** - Calculator, weather info, web search, and random facts
- ⚡ **Real-time Streaming** - Streaming responses from OpenAI
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔍 **Tool Visualization** - Clear display of tool executions and results

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OpenAI API key:**
   
   Copy `.env.example` to `.env.local` and add your OpenAI API key:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Available Tools

The assistant has access to several built-in tools:

### 🧮 Calculator
Perform basic arithmetic operations (add, subtract, multiply, divide)

**Example:** "Calculate 25 * 4"

### 🌤️ Weather 
Get current weather information for any city (mock data)

**Example:** "What's the weather in Tokyo?"

### 🔍 Web Search
Search for information on the web (mock results)

**Example:** "Search for information about React"

### 🎲 Random Facts
Get interesting facts from various categories (science, history, nature, technology)

**Example:** "Tell me a random science fact"

## Project Structure

```
frontend/
├── app/
│   ├── api/chat/route.ts        # Chat API endpoint
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/
│   ├── assistant-ui/
│   │   ├── thread.tsx           # Main chat thread component
│   │   ├── tool-fallback.tsx    # Tool execution UI
│   │   └── markdown-text.tsx    # Markdown rendering
│   ├── ui/                      # shadcn/ui components
│   └── MyAssistant.tsx          # Main assistant component
├── lib/
│   ├── tools.ts                 # Tool definitions
│   └── utils.ts                 # Utility functions
└── .env.local                   # Environment variables
```

## Customization

### Adding New Tools

1. **Define your tool** in `lib/tools.ts`:
   ```typescript
   export const myCustomTool = tool({
     description: "Description of what the tool does",
     parameters: z.object({
       param1: z.string().describe("Parameter description"),
     }),
     execute: async ({ param1 }) => {
       // Your tool logic here
       return { result: "Tool output" };
     },
   });
   ```

2. **Add it to the API route** in `app/api/chat/route.ts`:
   ```typescript
   tools: {
     // ... existing tools
     myCustom: myCustomTool,
   },
   ```

### Styling the UI

The UI uses Tailwind CSS and can be customized by modifying the components in `components/assistant-ui/`. The design system follows shadcn/ui patterns.

### Changing the AI Model

Update the model in `app/api/chat/route.ts`:
```typescript
model: openai("gpt-4"), // or any other OpenAI model
```

## Deployment

This application can be deployed to any platform that supports Next.js:

- **Vercel**: `npx vercel deploy`
- **Netlify**: Connect your Git repository
- **Railway**: `railway login && railway deploy`

Don't forget to set your `OPENAI_API_KEY` environment variable in your deployment platform.

## Learn More

- [assistant-ui Documentation](https://www.assistant-ui.com/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT License - see [LICENSE](LICENSE) for details.
