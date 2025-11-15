"use server";
/**
 * @fileOverview
 * Conversational AI for answering financial questions,
 * creating transactions, and managing categories interactively.
 *
 * Works inside a Next.js App Router server action.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

/* --------------------------- Schema Definitions --------------------------- */

const ChatInputSchema = z.object({
  prompt: z.string().describe("The full prompt for the AI model."),
});

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response message."),
  transactionData: z
    .object({
      description: z.string(),
      amount: z.number(),
      category: z.string(),
      date: z.string(),
      spentOn: z.string(),
      source: z.string(),
    })
    .optional(),
  categoryData: z
    .object({
      name: z.string(),
      icon: z.string(),
      budget: z.number(),
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
  name: "chatPrompt",
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `{{{prompt}}}`,
});

/* --------------------------- Main Chat Function --------------------------- */

export async function chat(input: {
  history: { role: "user" | "model"; parts: { text: string }[] }[];
  message: string;
  transactionContext: string;
  availableCategories: string;
  availablePaymentMethods: string;
}): Promise<ChatOutput> {
  try {
    /* ----------------------------- 1. Format History ----------------------------- */
    const formattedHistory = input.history
      .map((msg) => {
        const prefix = msg.role === "user" ? "User:" : "AI:";
        return `${prefix} ${msg.parts[0]?.text ?? ""}`;
      })
      .join("\n");

    /* ----------------------------- 2. Build Prompt ----------------------------- */
    const systemMessage = `
You are a **personal finance assistant**. Help users track expenses, manage budgets, get financial insights also help in financial advice/planning and investment.

**Your Abilities:**
• Create transactions from natural text (e.g., "spent 500 on groceries")
• Create categories when needed (e.g., "create pets category")
• Answer financial questions using their actual data
• Provide spending insights, calculations, and advice
• Use ₹ (Rupee) as currency

**Guidelines:**
• **Be simple and direct** - avoid lengthy confirmations
• **Auto-fill missing details** intelligently when possible:
  - Use smart defaults (today's date, best-matching category, most-used payment source)
  - Choose appropriate icons for new categories automatically
  - Set reasonable budget suggestions based on similar categories
• **Only ask questions** when truly necessary (ambiguous amount, unclear category)
• Keep responses concise and actionable
• Use markdown formatting for clarity
• Be friendly but brief
• Check whether user is in category / transaction creation flow and handoff to specific tool.

**Transaction Creation:** -
- amount: REQUIRED, must be a positive number. If missing ask user.
- category: REQUIRED string. If missing ask user (should be from available categories only).
- spentOn: REQUIRED string. Ask user first if not provided, take the category name by default.
- date: REQUIRED, Ask user, default will be current date (format must be moment(value).format() STRICTLY)
- source: REQUIRED string. If missing ask user (should be from available payment methods only).
- If user provides a natural language date ("today", "yesterday", "last monday"), parse into ISO format. If cannot parse, ask user to clarify.
- If all the details are available tell the user the final transaction which will be created, and ask for confirmation to proceed
- On confirmation return {transactionData: {
  amount,
  category,
  spentOn,
  date,
  source,
}}

**Category Creation:** -
- icon: REQUIRED EMOJI. If user provides an emoji or named icon (if named icon provided, use appropriate emoji). If missing, ask user.
- category: REQUIRED string. If missing, ask user .
- budget: number. If user supplies a number, parse it. If they omit it, default to 0 (note: later validation expects >=1).
- periodType: one of ["once","monthly","quarterly","half-yearly"] STRICTLY. Default: "once". If user gives an unsupported value, ask user again.
- startMonth: integer 1..12. If periodType === "once" and user does not provide startMonth, default to the current month number: 1.
* If user specifies a month by name (e.g., "March") convert it to its month number (March -> 3). If user says "till which month" interpret as an endMonth: store as startMonth value using the same month-number format start month should be current or later month till the year end STRICTLY.
- creationDuration: string. Default: "YEAR_END". Accept common synonyms like "year end", "end of year", "yearly" and normalize to "YEAR_END". If the user explicitly requests a different enum, return that value.
- If all the details are available tell the user the final category which will be created, and ask for confirmation to proceed
- On confirmation return {categoryData: {
  icon,
  category,
  budget,
  periodType (if periodType not once),
  startMonth (if periodType not once),
  creationDuration (if periodType not once)
}}

**Financial Advice:**
- Use actual data from their transactions and categories
- Provide calculations, insights, and recommendations
- Share budgeting tips and best practices when asked
- Keep it practical and relevant to their situation
- Always return { response } STRICTLY
`;

    // Parse and format context more clearly
    const categories = input.availableCategories
      ?.split("\n")
      .filter(Boolean)
      .map((line) => {
        const [id, name, budget] = line.split("|");
        return {
          id: id?.trim(),
          name: name?.trim(),
          budget: parseFloat(budget?.trim() || "0"),
        };
      })
      .filter((c) => c.name);

    const transactions = input.transactionContext
      ?.split("\n")
      .filter(Boolean)
      .map((line) => {
        const [amount, description, date] = line.split("|");
        return {
          amount: parseFloat(amount?.trim() || "0"),
          description: description?.trim(),
          date: date?.trim(),
        };
      })
      .filter((t) => t.description);

    const paymentMethods = input.availablePaymentMethods
      ?.split("\n")
      .filter(Boolean)
      .map((s) => s.trim());

    // Calculate summary statistics
    const totalSpent = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalBudget = categories?.reduce((sum, c) => sum + c.budget, 0) || 0;
    const budgetUtilization =
      totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : "N/A";

    const contextBlock = `
**USER'S DATA:**

Summary: ₹${totalSpent.toFixed(0)} spent | ₹${totalBudget.toFixed(
      0
    )} budget | ${budgetUtilization}% used | ${
      transactions?.length || 0
    } transactions

Categories (${categories?.length || 0}):
${
  categories && categories.length > 0
    ? categories.map((c) => `• ${c.name} (₹${c.budget.toFixed(0)})`).join("\n")
    : "None yet"
}

Payment Sources (${paymentMethods?.length || 0}):
${
  paymentMethods && paymentMethods.length > 0
    ? paymentMethods.map((s) => `• ${s}`).join("\n")
    : "None configured"
}

Recent Transactions (${transactions?.length || 0}):
${
  transactions && transactions.length > 0
    ? transactions
        .slice(0, 20)
        .map(
          (t) =>
            `• ₹${t.amount.toFixed(0)} - ${t.description} (${
              t.date.split("T")[0]
            })`
        )
        .join("\n")
    : "No transactions yet"
}
${transactions && transactions.length > 20 ? "... and more" : ""}
`;

    const historyBlock = formattedHistory
      ? `\nConversation History:\n${formattedHistory}\n`
      : "";

    const finalPrompt = `${systemMessage}\n\n${contextBlock}${historyBlock}\n**User:** ${input.message}\n\n**Response:**`;

    /* ----------------------------- 3. LLM Response ----------------------------- */
    const llmResponse = await chatPrompt({
      prompt: finalPrompt,
    });

    const modelMessage = llmResponse?.messages?.find(
      (m: any) => m.role === "model"
    );

    if (!modelMessage) {
      return {
        response: "Sorry, I couldn't generate a response. Could you try again?",
      };
    }
    const responseText = llmResponse?.output?.response;
    const transactionData = llmResponse?.output?.transactionData;
    const categoryData = llmResponse?.output?.categoryData;

    /* ----------------------------- 5. Default Response ----------------------------- */
    return {
      response:
        responseText ??
        "I'm not sure how to help with that just yet — could you clarify what you'd like to do?",
      transactionData,
      categoryData,
    };
  } catch (error) {
    console.error("Chat error:", error);
    return {
      response:
        "Oops! Something went wrong. Please try again or rephrase your question.",
    };
  }
}
