"use server";
/**
 * @fileOverview
 * Conversational AI (Agent) for answering financial questions,
 * creating transactions, and managing categories interactively.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { createTransactionFromTextTool } from "./create-transaction-from-text";
import { createCategoryFromTextTool } from "./create-category-from-text";

/* --------------------------- Schema Definitions --------------------------- */

const ChatInputSchema = z.object({
  history: z.array(z.any()), // Full Genkit-compatible history
  message: z.string(),
  transactionContext: z.string(),
  availableCategories: z.string(),
  availablePaymentMethods: z.string(),
});

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
Currency is always **Rupee (₹)**.

Your task:
- Help the user manage transactions and categories.
- Use tools to extract structured data.
- Always confirm missing fields by asking questions.
`;

/* ----------------------------- Genkit Flow ----------------------------- */

const chatFlow = ai.defineFlow(
  {
    name: "chatAgentFlow",
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input): Promise<ChatOutput> => {
    const contextBlock = `
### User Context
Available Categories:
${input.availableCategories || "No categories yet."}

Available Payment Sources:
${input.availablePaymentMethods || "No payment sources yet."}

Recent Transaction Data:
${input.transactionContext || "No transactions yet."}
`;

    // 👇 Attach tools INSIDE ai.generate() (correct usage)
    const llmResponse = await ai.generate({
      model: ai, // Use your configured default model (e.g. GPT-4, Gemini, etc.)
      history: [
        ...input.history,
        { role: "user", content: [{ text: input.message }] },
      ],
      prompt: `${systemPrompt}\n${contextBlock}`,
      tools: [createTransactionFromTextTool, createCategoryFromTextTool],
      output: {
        schema: ChatOutputSchema,
      },
    });

    const output = llmResponse.output();
    if (!output) {
      return { response: "Sorry, I couldn't generate a response." };
    }

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
  }[];
  message: string;
  transactionContext: string;
  availableCategories: string;
  availablePaymentMethods: string;
}): Promise<ChatOutput> {
  const genkitHistory = input.history.map((msg) => ({
    role: msg.role,
    content: msg.parts.map((part) => ({ text: part.text })),
  }));

  // ✅ Use ai.runFlow() properly
  return await ai.runFlow(chatFlow, {
    history: genkitHistory,
    message: input.message,
    transactionContext: input.transactionContext,
    availableCategories: input.availableCategories,
    availablePaymentMethods: input.availablePaymentMethods,
  });
}
