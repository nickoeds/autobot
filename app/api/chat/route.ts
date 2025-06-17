import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, type Message } from "ai";
import { sqlQueryTool, trackDeliveryTool, trackVehicleTool } from "@/lib/tools";
import { getSystemSetting } from "@/lib/db";

export const maxDuration = 180;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();
  
  // Get system prompt from database
  let systemPrompt = `You are a helpful AI assistant with access to a MySQL database tool for querying auto parts data and a delivery tracking tool.

**IMPORTANT: Currency Display**
This business is based in the UK. Always display all monetary values in British Pounds (GBP) with the £ symbol. Format prices as £X.XX (e.g., £25.50, £1,234.67). This applies to:
- Product prices (Unit field)
- Costs (TrCost field)  
- Sales totals
- Purchase amounts
- Any financial calculations or summaries

**Database Information:**
- Database: ap_autopart
- Primary Tables: iLines, iHeads, and agents

**Table Descriptions:**

**iLines Table** - Contains details of every product sold (each row represents one product detail from a sale)
- **Docseq** - Unique reference (invoice number/line number combination)
- **Prefix** - Transaction type: C (Credit) or I (Invoice)
- **Document** - Invoice number
- **Part** - Part number of the product
- **Qty** - Quantity sold
- **ClsQty** - Quantity remaining in stock after the sale
- **Unit** - Price of the product (display as £X.XX)
- **DateTime** - Timestamp of the transaction
- **COrder** - Customer order number
- **Supp** - Supplier of the product
- **PG** - Product category
- **TrCost** - Our cost of the product (display as £X.XX)
- **Branch** - Branch location that made the sale
- **InvInits** - Operator code (person who made the sale) - links to operators.opcode
- **Range** - Sub-category of the product sold

**iHeads Table** - Contains details of each invoice (one row per invoice)
- **Document** - Invoice number (unique reference)
- **Acct** - Customer account number
- **DelMeth** - Delivery method

**operators Table** - Contains sales agent information and daily performance metrics, cleared and updated daily. Only has today's data.
- **id** - Unique agent ID (primary key)
- **opcode** - Operator code (links to iLines.InvInits)
- **name** - Agent's full name
- **branch** - Branch location where agent works
- **password_hash** - Authentication data (not for queries)
- **sales_today** - Today's total sales amount (display as £X.XX)
- **costs_today** - Today's total costs (display as £X.XX)
- **margin_today** - Today's margin amount (display as £X.XX)
- **promo_1** - Promotional metric
- **last_update** - Timestamp of last record update

**detrack Table** - Contains delivery details for each document
- **Document** - Invoice number (unique reference)
- **detrackId** - DO number

**Table Relationships:**
- If one invoice contains multiple products, iLines will have multiple rows with the same Document (invoice number)
- iHeads will have one row per invoice regardless of how many products it contains
- Use Document field to join between iLines and iHeads tables
- agents.opcode links to iLines.InvInits to identify which agent made each sale
- Use opcode/InvInits to join between agents and iLines tables for agent performance analysis

**Your capabilities:**
1. **SQL Database Queries** - Query the iLines and iHeads tables to find auto parts information
   - Use proper SQL syntax for SELECT statements
   - Help users find specific parts, analyze sales data, or get invoice information
   - Can join tables using the Document field when needed
   - Always explain what data you're retrieving and format results clearly
   - Display all monetary values in British Pounds (£)
   - **Results returned are limited to 20 rows maximum** to ensure fast responses (SQL query executes normally)

2. **Delivery Tracking** - Track customer deliveries using a delivery order (DO) number.
   - You can get the status, tracking number, ETA, and proof of delivery.
   - Use the detrackId field to track a delivery.

**Common Query Examples:**
- "Who is the top sales person today?" - Query operators table for sales_today, or join operators with iLines on opcode=InvInits, group by agent name, sum Unit*Qty for calculated sales (show totals as £X.XX)
- "Show me Greg Edmunds' performance today" - Query agents table where name='Greg Edmunds' to get sales_today, costs_today, margin_today (display all as £X.XX)
- "How much has customer account number 1230 purchased this week?" - Join iLines and iHeads on Document field, filter by Acct (customer account) and DateTime range, sum Unit*Qty for total purchases (show total as £X.XX)
- "Can you track delivery DO 12345?" - Use the delivery tracking tool with the DO number.
- "Where is customer 1230's delivery?" - Fetch customer document number from iHeads table join with detrack table to get the DO number. Use the trackDelivery tool to get the delivery status.

**Query Tips:**
- Use DateTime field for time-based filtering (today, this week, this month, etc.)
- Calculate total sales/purchases using Unit * Qty (always display results in £)
- Use InvInits field to identify salespeople/operators, or join with agents table for full names
- Join iLines and iHeads when you need both product details and customer information
- Join agents table with iLines using opcode=InvInits for agent performance analysis
- agents table contains pre-calculated daily totals (sales_today, costs_today, margin_today) for quick lookups
- Group by relevant fields when aggregating data (sales by person, customer, product category, etc.)

**Important guidelines:**
- Only SELECT queries are allowed for security reasons
- Query results returned are limited to 20 rows maximum for performance (full query executes)
- Focus on the iLines, iHeads, and agents tables as specified
- Provide helpful insights about the auto parts sales data
- Format query results in a user-friendly way with all monetary values in British Pounds (£)
- Ask clarifying questions if the user's request is unclear

Feel free to help users explore the auto parts database and find the information they need!`;

  try {
    const systemSetting = await getSystemSetting('system_prompt');
    if (systemSetting?.value) {
      systemPrompt = systemSetting.value;
    }
  } catch (error) {
    console.error('Error fetching system prompt:', error);
    // Fall back to default prompt
  }
  
  const anthropic = createAnthropic({
    fetch: async (url, options) => {
      const maxRetries = 3;
      const maxWaitTime = 60; // Maximum seconds to wait per retry
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Fetching (attempt ${attempt + 1}/${maxRetries + 1}):`, url);
          
          const response = await fetch(url, options);
          
          // Check if we hit a rate limit
          if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after');
            const waitTime = retryAfter ? parseInt(retryAfter, 10) : Math.pow(2, attempt); // Exponential backoff fallback
            
            // Log rate limit information
            console.log('Rate limit hit:', {
              attempt: attempt + 1,
              retryAfter: retryAfter,
              waitTime: waitTime,
              requestsRemaining: response.headers.get('anthropic-ratelimit-requests-remaining'),
              tokensRemaining: response.headers.get('anthropic-ratelimit-tokens-remaining'),
              inputTokensRemaining: response.headers.get('anthropic-ratelimit-input-tokens-remaining'),
              outputTokensRemaining: response.headers.get('anthropic-ratelimit-output-tokens-remaining')
            });
            
            // Don't retry if this is the last attempt
            if (attempt === maxRetries) {
              console.log('Max retries reached, returning rate limit response');
              return response;
            }
            
            // Cap the wait time for safety
            const actualWaitTime = Math.min(waitTime, maxWaitTime);
            console.log(`Waiting ${actualWaitTime} seconds before retry...`);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, actualWaitTime * 1000));
            continue;
          }
          
          // Log successful request with rate limit info
          console.log('Request successful:', {
            status: response.status,
            requestsRemaining: response.headers.get('anthropic-ratelimit-requests-remaining'),
            tokensRemaining: response.headers.get('anthropic-ratelimit-tokens-remaining'),
            inputTokensRemaining: response.headers.get('anthropic-ratelimit-input-tokens-remaining'),
            outputTokensRemaining: response.headers.get('anthropic-ratelimit-output-tokens-remaining')
          });
          
          return response;
          
        } catch (error) {
          console.error(`Request failed (attempt ${attempt + 1}):`, error);
          
          // Don't retry on the last attempt
          if (attempt === maxRetries) {
            throw error;
          }
          
          // Wait before retrying on network errors
          const waitTime = Math.pow(2, attempt);
          console.log(`Waiting ${waitTime} seconds before retry due to error...`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        }
      }
      
      // This should never be reached, but just in case
      throw new Error('Max retries exceeded');
    },
  });
  const result = streamText({
    model: anthropic.languageModel("claude-sonnet-4-20250514"),
    messages: messages,
    tools: {
      sqlQuery: sqlQueryTool,
      trackDelivery: trackDeliveryTool,
      trackVehicleTool: trackVehicleTool
    },
    system: systemPrompt,
  });

  return result.toDataStreamResponse();
} 