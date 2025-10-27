"use server";
/**
 * @fileOverview
 * Conversational AI agent that autonomously manages financial conversations,
 * including creating transactions and categories, with all validation and
 * decision-making handled by the Agent itself.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { createTransactionFromTextTool } from "./create-transaction-from-text";
import { createCategoryFromTextTool } from "./create-category-from-text";

/* --------------------------- Schema Definitions --------------------------- */

const ChatInputSchema = z.object({
  prompt: z.string().describe("The full prompt for the AI model."),
});

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's natural language response."),
  history: z.array(z.any()),
  transactionData: z
    .object({
      description: z.string().optional(),
      amount: z.number().optional(),
      category: z.string().optional(),
      date: z.string().optional(),
      type: z.enum(["income", "expense"]).optional(),
      spentOn: z.string().optional(),
      source: z.string().optional(),
    })
    .optional(),
  categoryData: z
    .object({
      name: z.string(),
      icon: z.string(),
      budget: z.number().optional(),
      periodType: z
        .enum(["once", "monthly", "quarterly", "half-yearly"])
        .optional(),
      startMonth: z.number().optional(),
      creationDuration: z.enum(["next12Months", "yearEnd"]).optional(),
    })
    .optional(),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

/* ----------------------------- Prompt Definition ----------------------------- */

const chatPrompt = ai.definePrompt({
  name: "chatAgentPrompt",
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  tools: [createTransactionFromTextTool, createCategoryFromTextTool],
  returnToolRequests: true,
  prompt: `
You are a friendly, empathetic, and smart **personal financial assistant**.
Your job is to help the user manage finances by conversing naturally, collecting data,
and calling tools to create structured data when needed.

### 🧠 Behavior Rules
- You can autonomously call tools such as:
  - \`createTransactionFromTextTool\` — to extract and build a transaction object.
  - \`createCategoryFromTextTool\` — to extract and build a category object.
- You decide **when** to call a tool.
- If a tool response is incomplete (e.g. missing amount, category, or source), **ask the user** politely for just the missing info.
- Once you have all required details, confirm with the user in natural language before saving.
- Do not ask for confirmation more than once unless the user changes details.
- Use markdown formatting and include emojis naturally.
- Currency is always **Rupee (₹)**.

### 🎯 Example Flows
**Transaction example:**
User: "Add 100 for groceries."
→ (Call \`createTransactionFromTextTool\`)
→ If missing category/source, ask: "Which category or payment source should I use?"
→ Once all fields known: "✅ Added **₹100 groceries** under **Food** (via **Credit Card**). Save it?"

**Category example:**
User: "Make a new category for Pets."
→ (Call \`createCategoryFromTextTool\`)
→ Ask for missing icon or budget if needed.
→ Once ready: "✅ Created **Pets 🐾** category. Want to set a monthly budget?"

### General Guidelines
- Be conversational and kind.
- Never output JSON directly — use natural text and include structured data in the schema output.
- Handle *all* logic and validations by yourself — backend should not intervene.

---

{{{prompt}}}
`,
});

/* --------------------------- Main Chat Function --------------------------- */

export async function chat(input: {
  history: { role: "user" | "model"; parts: { text: string }[] }[];
  message: string;
  transactionContext: string;
  availableCategories: string;
  availablePaymentMethods: string;
}): Promise<ChatOutput> {
  // 1. Build formatted history (for better context)
  const formattedHistory = input.history
    .map((msg) => {
      const prefix = msg.role === "user" ? "User:" : "AI:";
      return `${prefix} ${msg.parts[0]?.text ?? ""}`;
    })
    .join("\n");

  // 2. Construct the final system prompt for the Agent
  const systemPrompt = `
Here's the user's available data:
- **Categories:** ${input.availableCategories || "None yet"}
- **Payment Sources:** ${input.availablePaymentMethods || "None yet"}
- **Recent Transactions:** ${
    input.transactionContext || "No recent transactions"
  }

Conversation so far:
${formattedHistory}

User's new message:
${input.message}
`;

  // 3. Run the AI prompt — the agent will handle all logic itself
  const llmResponse = await chatPrompt({
    prompt: systemPrompt,
  });

  const output = llmResponse?.output ? llmResponse?.output : null;

  // 4. Fallback safety response
  if (!output?.response) {
    return {
      response:
        "Sorry, I couldn't process that. Could you please rephrase or try again?",
      history: [],
    };
  }

  // 5. Return the AI-managed structured response
  return {
    response: output.response,
    history: llmResponse.messages ?? [],
    transactionData: output.transactionData,
    categoryData: output.categoryData,
  };
}
