import { google } from "@ai-sdk/google";
import { streamText, convertToCoreMessages } from "ai";
import { sqlQueryTool } from "@/lib/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Filter out messages with unsupported roles for Gemini
  const filteredMessages = messages.filter((message: any) => {
    // Keep only user and assistant messages, filter out tool and other roles
    return message.role === 'user' || message.role === 'assistant';
  });

  const result = streamText({
    model: google("gemini-2.5-flash-preview-05-20"),
    messages: convertToCoreMessages(filteredMessages),
    tools: {
      sqlQuery: sqlQueryTool,
    },
    system: `You are a helpful AI assistant with access to a MySQL database tool for querying auto parts data.

**Database Information:**
- Database: ap_autopart
- Table: iLines (auto parts inventory)
- You can execute SELECT queries to retrieve information about auto parts

**Your capabilities:**
1. **SQL Database Queries** - Query the iLines table to find auto parts information
   - Use proper SQL syntax for SELECT statements
   - Help users find specific parts, filter by criteria, or get general information
   - Always explain what data you're retrieving and format results clearly

**Important guidelines:**
- Only SELECT queries are allowed for security reasons
- Focus on the iLines table as specified
- Provide helpful insights about the auto parts data
- Format query results in a user-friendly way
- Ask clarifying questions if the user's request is unclear

Feel free to help users explore the auto parts database and find the information they need!`,
  });

  return result.toDataStreamResponse();
} 