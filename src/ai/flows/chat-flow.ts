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
  returnToolRequests: true,
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
  - If any field is missing (amount, description, category, or source), ask for it:
    - e.g. "What category does this belong to?" or "How did you pay?"
  - Once all info is available, confirm clearly:
    > "Got it — ₹50 for coffee in the 'Food' category via Credit Card. Should I save it?"

---

### Category Handling
- If the user says *"Create a new category for Pets"*:
  - Use **createCategoryFromTextTool**.
  - If any field is missing (icon, budget, etc.), ask follow-up questions like:
    > "What icon should we use for this category?" or "Would you like to set a budget?"
  - After creation, confirm:
    > "New category 'Pets' 🐾 created. Would you like to add a budget for it?"

---

### General Guidelines
- Be conversational and encouraging.
- Never guess — always ask politely for missing details.
- Resume any pending transaction/category flow when new info arrives.
- End responses naturally, e.g. "Would you like to do anything else?"
`;

    const contextBlock = input.transactionContext
      ? `Here's the user's transaction data:\n${input.transactionContext}\n
Here are the user's categories:\n${input.availableCategories}\n
Here are the payment sources:\n${input.availablePaymentMethods}\n`
      : "";

    const historyBlock = formattedHistory
      ? `Chat History:\n${formattedHistory}\n`
      : "";

    const finalPrompt = `${systemMessage}\n\n${contextBlock}${historyBlock}User's new message:\n${input.message}\n\nYour response:`;

    /* ----------------------------- 3. LLM Response ----------------------------- */
    const llmResponse = await chatPrompt({
      prompt: finalPrompt,
    });

    const modelMessage = llmResponse?.messages?.find(
      (m: any) => m.role === "model"
    );

    if (!modelMessage) {
      return {
        response:
          "Sorry, I couldn't generate a response. Could you try again?",
        history: [],
      };
    }

    const responseText =
      llmResponse?.output?.response ||
      modelMessage?.content?.find((c: any) => c.text)?.text;
    const toolRequest = modelMessage?.content?.find(
      (c: any) => c.toolRequest
    )?.toolRequest;

    /* ----------------------------- 4. Handle Tools ----------------------------- */

    // 🧰 Handle Transaction Tool
    if (toolRequest?.name === "createTransactionFromTextTool") {
      try {
        const transactionResult = await createTransactionFromTextTool.run({
          text: input.message,
          availableCategories:
            input.availableCategories
              ?.split("\n")
              .map((line) => line.split("|")[1]?.trim())
              .filter(Boolean) ?? [],
          availablePaymentSources:
            input.availablePaymentMethods?.split("\n").filter(Boolean) ?? [],
        });

        const txn = transactionResult?.result;

        if (!txn) {
          return {
            response:
              "I had trouble processing that transaction. Could you rephrase it? For example: 'Add 50 rupees for coffee'",
          };
        }

        // Ask for missing fields instead of erroring
        const missing: string[] = [];
        if (!txn?.description && !txn?.spentOn) missing.push("description");
        if (!txn?.amount) missing.push("amount");
        if (!txn?.category) missing.push("category");
        if (!txn?.source) missing.push("payment source");

        if (missing.length > 0) {
          return {
            response: `I'm almost ready to add that transaction! Could you tell me ${missing
              .map((m) => `the **${m}**`)
              .join(" and ")}?`,
            transactionData: txn,
          };
        }

        // Everything is present
        return {
          response: `✅ Got it — **${txn.description || txn.spentOn}** for **₹${txn.amount}** in **${txn.category}** (via **${txn.source}**).  
Should I go ahead and save this transaction?`,
          transactionData: txn,
        };
      } catch (error) {
        console.error("Transaction tool error:", error);
        return {
          response:
            "I had trouble processing that transaction. Could you try rephrasing? For example: 'Add 50 rupees for coffee in Food category'",
        };
      }
    }

    // 🧰 Handle Category Tool
    if (toolRequest?.name === "createCategoryFromTextTool") {
      try {
        const categoryResult = await createCategoryFromTextTool.run({
          text: input.message,
          availableCategories:
            input.availableCategories
              ?.split("\n")
              .map((line) => line.split("|")[1]?.trim())
              .filter(Boolean) ?? [],
          availablePaymentSources:
            input.availablePaymentMethods?.split("\n").filter(Boolean) ?? [],
        });

        const cat = categoryResult?.result;

        if (!cat?.name) {
          return {
            response:
              "Hmm, I couldn't catch the category name. Could you please tell me what category you'd like to create?",
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
          response: `✅ New category **"${cat.name}"** created with icon **${cat.icon}** — ${budgetMessage}`,
          categoryData: cat,
        };
      } catch (error) {
        console.error("Category tool error:", error);
        return {
          response:
            "I had trouble creating that category. Could you try again? For example: 'Create a new category for Pets'",
        };
      }
    }

    /* ----------------------------- 5. Default Response ----------------------------- */
    return {
      response:
        responseText ??
        "I'm not sure how to help with that just yet — could you clarify what you'd like to do?",
    };
  } catch (error) {
    console.error("Chat error:", error);
    return {
      response:
        "Oops! Something went wrong. Please try again or rephrase your question.",
    };
  }
}
