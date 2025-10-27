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
import { createTransactionFromTextTool } from "./create-transaction-from-text";
import { createCategoryFromTextTool } from "./create-category-from-text";

/* --------------------------- Schema Definitions --------------------------- */

const ChatInputSchema = z.object({
  prompt: z.string().describe("The full prompt for the AI model."),
});

const HistoryPartSchema = z.object({
  text: z.string().optional(),
  toolRequest: z
    .object({
      name: z.string(),
      arguments: z.record(z.any()).optional(),
    })
    .optional(),
  toolResponse: z
    .object({
      output: z.any().optional(),
    })
    .optional(),
});

const HistoryMessageSchema = z.object({
  role: z.enum(["user", "model", "tool"]),
  parts: z.array(HistoryPartSchema),
});

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response message."),
  history: z.array(HistoryMessageSchema).optional(),
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
  name: "chatPrompt",
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  tools: [createTransactionFromTextTool, createCategoryFromTextTool],
  prompt: `{{{prompt}}}`,
});

/* --------------------------- Main Chat Function --------------------------- */

export async function chat(input: {
  history: { role: "user" | "model"; parts: { text: string }[]; transactionData?: any; categoryData?: any }[];
  message: string;
  transactionContext: string;
  availableCategories: string;
  availablePaymentMethods: string;
}): Promise<ChatOutput> {
  /* ----------------------------- 1. Format History ----------------------------- */
  const formattedHistory = input.history
    .map((msg) => {
      const prefix = msg.role === "user" ? "User:" : "AI:";
      return `${prefix} ${msg.parts[0]?.text ?? ""}`;
    })
    .join("\n");

  /* ----------------------------- 2. Detect Pending Context ----------------------------- */
  const lastMessage = input.history[input.history.length - 1];
  let pendingContext = "";

  if (lastMessage && (lastMessage as any).transactionData) {
    pendingContext = `\n\nThe user is currently creating a transaction. 
Here’s what’s known so far:
${JSON.stringify((lastMessage as any).transactionData, null, 2)}
If the user's next message provides missing details (like source, category, or amount), 
please continue completing this transaction instead of starting a new one.`;
  }

  if (lastMessage && (lastMessage as any).categoryData) {
    pendingContext = `\n\nThe user is currently creating a category. 
Here’s what’s known so far:
${JSON.stringify((lastMessage as any).categoryData, null, 2)}
If the user's next message provides missing details (like icon, budget, or name), 
please continue completing this category instead of starting a new one.`;
  }

  /* ----------------------------- 3. Build Prompt ----------------------------- */
  const systemMessage = `
You are a friendly, empathetic, and smart **personal financial assistant**.

Your goals:
• Help the user manage finances by providing insights, budgeting advice, and summaries.
• Currency is always **Rupee (₹)**.
• Be conversational — if data is missing, politely ask for it instead of throwing an error.
• Keep answers short, clear, and formatted with markdown.

---

### Transaction Handling
- When a user says something like *"Add 50 for coffee"* or *"Spent 200 on groceries"*:
  - Use **createTransactionFromTextTool**.
  - If any field is missing (amount, description, category, or source), ask for it.
  - If a pending transaction exists, resume filling in missing fields.

---

### Category Handling
- If a user says *"Create a new category for Pets"*:
  - Use **createCategoryFromTextTool**.
  - If any field is missing, ask follow-up questions.
  - If a pending category exists, resume filling in missing fields.

---

### General Guidelines
- Be conversational and encouraging.
- Never guess — always ask politely for missing details.
- Resume any pending transaction/category flow when new info arrives.
- End responses naturally, e.g. “Would you like to do anything else?”
`;

  const contextBlock = input.transactionContext
    ? `Here’s the user's transaction data:\n${input.transactionContext}\n
Here are the user’s categories:\n${input.availableCategories}\n
Here are the payment sources:\n${input.availablePaymentMethods}\n`
    : "";

  const historyBlock = formattedHistory
    ? `Chat History:\n${formattedHistory}\n`
    : "";

  const finalPrompt = `${systemMessage}\n${pendingContext}\n\n${contextBlock}${historyBlock}User's new message:\n${input.message}\n\nYour response:`;

  /* ----------------------------- 4. LLM Response ----------------------------- */
  const llmResponse = await chatPrompt({
    prompt: finalPrompt,
  });

  const modelMessage = llmResponse?.messages?.find(
    (m: any) => m.role === "model"
  );

  if (!modelMessage) {
    return {
      response: "Sorry, I couldn’t generate a response. Could you try again?",
      history: [],
    };
  }

  const responseText =
    llmResponse?.output?.response ||
    modelMessage?.content?.find((c: any) => c.text)?.text;
  const toolRequest = modelMessage?.content?.find(
    (c: any) => c.toolRequest
  )?.toolRequest;

  /* ----------------------------- 5. Handle Tools ----------------------------- */

  // 🧰 Handle Transaction Tool
  if (toolRequest?.name === "createTransactionFromTextTool") {
    const transactionResult = await createTransactionFromTextTool.run({
      text: input.message,
      availableCategories:
        input.availableCategories
          ?.split("\n")
          .map((line) => line.split("|")[1] || "") ?? [],
      availablePaymentSources: input.availablePaymentMethods?.split("\n") ?? [],
    });

    // Merge with any pending transaction data (if continuing a flow)
    const previousTxn = (lastMessage as any)?.transactionData || {};
    const txn = { ...previousTxn, ...(transactionResult?.result || {}) };

    // Ask for missing fields
    const missing: string[] = [];
    if (!txn?.description) missing.push("description");
    if (!txn?.amount) missing.push("amount");
    if (!txn?.category) missing.push("category");
    if (!txn?.source) missing.push("payment source");

    if (missing.length > 0) {
      return {
        response: `I’m almost ready to add that transaction! Could you tell me ${missing
          .map((m) => `the **${m}**`)
          .join(" and ")}?`,
        transactionData: txn,
      };
    }

    // Everything is present
    return {
      response: `✅ Got it — **${txn.description}** for **₹${txn.amount}** in **${txn.category}** (via **${txn.source}**).  
Should I go ahead and save this transaction?`,
      transactionData: txn,
    };
  }

  // 🧰 Handle Category Tool
  if (toolRequest?.name === "createCategoryFromTextTool") {
    const categoryResult = await createCategoryFromTextTool.run({
      text: input.message,
      availableCategories:
        input.availableCategories
          ?.split("\n")
          .map((line) => line.split("|")[1] || "") ?? [],
      availablePaymentSources: input.availablePaymentMethods?.split("\n") ?? [],
    });

    // Merge with any pending category data (if continuing a flow)
    const previousCat = (lastMessage as any)?.categoryData || {};
    const cat = { ...previousCat, ...(categoryResult?.result || {}) };

    if (!cat?.name) {
      return {
        response:
          "Hmm, I couldn’t catch the category name. Could you please tell me what category you’d like to create?",
      };
    }

    if (!cat?.icon) {
      return {
        response: `What icon should we use for the **${cat.name}** category? (e.g., 🐾, 🍔, 💰)`,
        categoryData: cat,
      };
    }

    const budgetMessage = cat.budget
      ? `with a suggested budget of ₹${cat.budget}.`
      : "Would you like to set a budget for it?";

    return {
      response: `✅ New category **“${cat.name}”** created with icon **${cat.icon}** — ${budgetMessage}`,
      categoryData: cat,
    };
  }

  /* ----------------------------- 6. Default Response ----------------------------- */
  return {
    response:
      responseText ??
      "I'm not sure how to help with that just yet — could you clarify what you'd like to do?",
  };
}
