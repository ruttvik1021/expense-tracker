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
You are a **personal finance assistant**. Help users track expenses, manage budgets, and get financial insights.

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

**Transaction Creation:** - Handoff to "createTransactionFromTextTool"

**Category Creation:** - Handoff to "createCategoryFromTextTool"

**Financial Advice:**
- Use actual data from their transactions and categories
- Provide calculations, insights, and recommendations
- Share budgeting tips and best practices when asked
- Keep it practical and relevant to their situation
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
    const avgTransactionAmount = transactions?.length
      ? totalSpent / transactions.length
      : 0;
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

        // Only ask if amount is missing (critical field)
        if (!txn?.amount) {
          return {
            response: "How much was it?",
            transactionData: txn,
          };
        }

        // Return transaction data for auto-save
        const desc = txn.description || txn.spentOn || "Transaction";
        return {
          response: `Added ₹${txn.amount} for ${desc}${
            txn.category ? " (" + txn.category + ")" : ""
          }`,
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
            response: "What should I name the category?",
          };
        }

        // Return category data for auto-save
        return {
          response: `Created ${cat.name} category${
            cat.icon ? " " + cat.icon : ""
          }${cat.budget ? " (₹" + cat.budget + " budget)" : ""}`,
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
