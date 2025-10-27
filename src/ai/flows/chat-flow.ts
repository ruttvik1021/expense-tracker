"use server";
/**
 * @fileOverview
 * Conversational AI (Agent) for answering financial questions,
 * creating transactions, and managing categories interactively.
 *
 * Works inside a Next.js App Router server action.
 */

import { ai } from "@/ai/genkit";
import { z, defineFlow, runFlow } from "genkit";
import { createTransactionFromTextTool } from "./create-transaction-from-text";
import { createCategoryFromTextTool } from "./create-category-from-text";

/* --------------------------- Schema Definitions --------------------------- */

// Input from the client
const ChatInputSchema = z.object({
  history: z.array(z.any()), // Full Genkit-compatible history
  message: z.string(),
  transactionContext: z.string(),
  availableCategories: z.string(),
  availablePaymentMethods: z.string(),
});

// Output to the client
const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response message."),
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

/* ----------------------------- System Prompt ----------------------------- */

const systemPrompt = `
You are a friendly, empathetic, and smart **personal financial assistant**.
Your goal is to help the user manage their finances.
Currency is always **Rupee (₹)**.

### Your Core Task: Agent-based Data Collection
You have tools to create transactions and categories. Your primary job is to ask follow-up questions until you have ALL the required information.

---

### Transaction Handling
- **Tool:** \`createTransactionFromTextTool\`
- **Required Fields:** \`description\`, \`amount\`, \`category\`, \`source\`
- **Your Logic:**
  1.  When the user wants to add a transaction, call \`createTransactionFromTextTool\` with the user's text.
  2.  The tool will return a JSON object with any fields it could extract.
  3.  You **MUST** inspect this JSON.
  4.  If **any** required fields are missing, your *only* job is to ask a polite, conversational question to get the *next* missing piece of information.
  5.  Repeat this process, accumulating the data in the conversation.
  6.  **FINAL STEP (Once ALL fields are present):**
     - Call \`createTransactionFromTextTool\` ONE LAST TIME with all the information to get the final, complete JSON object.
     - Your response to the user MUST be a confirmation message, e.g., "✅ Got it — **[Desc]** for **₹[Amount]** in **[Category]** (via **[Source]**). Should I go ahead and save this transaction?"
     - You **MUST** output the complete \`transactionData\` object along with this final message.

**Example Flow:**
- User: "Add 50 for coffee"
- AI: (Calls tool) -> Tool returns: { "amount": 50, "description": "coffee" }
- AI: (Sees 'category' and 'source' are missing) -> "Got it, 50 for coffee. What category should I put this under?"
- User: "Food"
- AI: (Calls tool with "Food") -> Tool returns: { "category": "Food" }
- AI: (Sees 'source' is still missing) -> "Thanks. And which payment source did you use?"
- User: "Credit Card"
- AI: (Calls tool with "Credit Card") -> Tool returns: { "source": "Credit Card" }
- AI: (SeES ALL fields are now known: {50, coffee, Food, Credit Card})
- AI: (Calls tool *one last time* to get complete object) -> Tool returns: { "amount": 50, "description": "coffee", "category": "Food", "source": "Credit Card" }
- AI: "✅ Got it — **coffee** for **₹50** in **Food** (via **Credit Card**). Should I go ahead and save this transaction?" (and attaches the complete \`transactionData\` object to its response)

---

### Category Handling
- **Tool:** \`createCategoryFromTextTool\`
- **Required Fields:** \`name\`, \`icon\`
- **Your Logic:**
  - Same as transactions. Ask for missing \`name\` or \`icon\`.
  - Once both are present, call the tool one last time to get the complete JSON and ask for confirmation, e.g., "✅ New category **“[Name]”** with icon **[Icon]**. Would you like to save this?"
  - Attach the complete \`categoryData\` object to this final response.

---

### General Guidelines
- Be conversational.
- Never guess — always ask.
- Use the context below for available categories and sources.
`;

/* ----------------------------- Genkit Flow ----------------------------- */

const chatFlow = defineFlow(
  {
    name: "chatAgentFlow",
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
    tools: [createTransactionFromTextTool, createCategoryFromTextTool],
  },
  async (input): Promise<ChatOutput> => {
    // 1. Build the context block
    const contextBlock = `
---
### User Context
Available Categories:
${input.availableCategories || "No categories yet."}

Available Payment Sources:
${input.availablePaymentMethods || "No payment sources yet."}

Recent Transaction Data:
${input.transactionContext || "No transactions yet."}
---
`;

    // 2. Run the AI generation
    // Genkit will automatically handle the tool-use loop based on the system prompt.
    const llmResponse = await ai.generate({
      model: ai, // Use your configured Genkit AI model
      history: [
        ...input.history,
        { role: "user", content: [{ text: input.message }] },
      ],
      prompt: `${systemPrompt}\n${contextBlock}`,
      tools: [createTransactionFromTextTool, createCategoryFromTextTool],
      output: {
        schema: z.object({
          response: z.string(),
          transactionData: z.any().optional(),
          categoryData: z.any().optional(),
        }),
      },
    });

    const output = llmResponse.output();
    if (!output) {
      return {
        response:
          "Sorry, I couldn't generate a response. Please try again.",
      };
    }

    // 3. Return the final response
    // The AI's prompt instructs it to attach transactionData/categoryData
    // only on the *final* confirmation step.
    return {
      response: output.response,
      transactionData: output.transactionData,
      categoryData: output.categoryData,
    };
  }
);

/* --------------------------- Main Chat Function --------------------------- */

export async function chat(input: {
  history: {
    role: "user" | "model";
    parts: { text: string }[];
    // Client no longer needs to send pending data
  }[];
  message: string;
  transactionContext: string;
  availableCategories: string;
  availablePaymentMethods: string;
}): Promise<ChatOutput> {
  // Format the client-side history into Genkit-compatible history
  const genkitHistory = input.history.map((msg) => ({
    role: msg.role,
    content: msg.parts.map((part) => ({ text: part.text })),
  }));

  // Run the Genkit flow
  return await runFlow(chatFlow, {
    history: genkitHistory,
    message: input.message,
    transactionContext: input.transactionContext,
    availableCategories: input.availableCategories,
    availablePaymentMethods: input.availablePaymentMethods,
  });
}
