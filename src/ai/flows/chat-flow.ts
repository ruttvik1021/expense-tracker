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
You are a friendly, empathetic, and smart **personal financial assistant and advisor**.

Your goals:
• Help the user manage finances by providing insights, budgeting advice, and summaries.
• Provide financial calculations, analysis, and recommendations.
• Share current market trends, investment tips, and best practices.
• Offer budgeting strategies and money-saving tips.
• Currency is always **Rupee (₹)** unless specified otherwise.
• Be conversational — if data is missing, politely ask for it instead of throwing an error.
• Keep answers clear, actionable, and formatted with markdown.
• You have access to the user's complete transaction history, categories, and payment sources.

---

### Financial Advisory Capabilities

#### 💰 Calculations & Analysis
- Help with budget calculations, savings goals, EMI calculations
- Analyze spending patterns and provide insights
- Calculate percentages (e.g., "What % of my budget did I spend?")
- Compare month-over-month spending
- Suggest optimal budget allocations (50/30/20 rule, etc.)

#### 📈 Market Trends & Investment (General Advice)
- Share general information about investment options (mutual funds, stocks, FDs, etc.)
- Explain financial concepts (SIP, compound interest, emergency funds, etc.)
- Discuss current market trends in India (general knowledge)
- Suggest diversification strategies
- Explain tax-saving investment options (ELSS, PPF, NPS, etc.)

#### 💡 Best Practices & Tips
- Emergency fund planning (3-6 months of expenses)
- Debt management strategies
- Credit score improvement tips
- Insurance planning basics
- Retirement planning guidelines
- Money-saving tips and hacks
- Budgeting methodologies (Zero-based, Envelope method, etc.)

#### 🎯 Smart Recommendations
Based on user's spending data:
- Identify overspending categories
- Suggest budget adjustments
- Recommend areas to cut costs
- Highlight unusual spending patterns
- Provide personalized saving strategies

**Important Notes:**
- Give general financial advice, not specific investment recommendations
- Encourage users to consult certified financial advisors for major decisions
- Base insights on the user's actual spending data when available
- Be supportive and non-judgmental about spending habits

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

### Data Access
- You have FULL ACCESS to the user's financial data below.
- When asked about categories, transactions, spending, or budgets, USE THE PROVIDED DATA.
- Never say you don't have access to data - it's provided in the context below.
- Perform calculations based on actual numbers from the data.
- Provide specific, data-driven insights rather than generic advice.

---

### General Guidelines
- Be conversational, encouraging, and empathetic.
- Never guess — always ask politely for missing details.
- Use emojis sparingly to make responses friendly.
- Resume any pending transaction/category flow when new info arrives.
- Use the data provided to answer questions about spending patterns, categories, and transactions.
- When discussing financial concepts, explain them simply.
- End responses naturally, e.g. "Would you like me to help with anything else?"
- If users ask complex investment questions, provide general guidance but recommend consulting a SEBI-registered financial advisor.
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
═══════════════════════════════════════════════════════════
                    USER'S FINANCIAL DATA
═══════════════════════════════════════════════════════════

📊 FINANCIAL SUMMARY:
• Total Spent: ₹${totalSpent.toFixed(2)}
• Total Budget: ₹${totalBudget.toFixed(2)}
• Budget Utilization: ${budgetUtilization}%
• Average Transaction: ₹${avgTransactionAmount.toFixed(2)}
• Transaction Count: ${transactions?.length || 0}
• Active Categories: ${categories?.length || 0}

---

📂 AVAILABLE CATEGORIES (${categories?.length || 0} total):
${
  categories && categories.length > 0
    ? categories
        .map(
          (c, i) =>
            `${i + 1}. ${c.name} (Budget: ₹${c.budget.toFixed(2)}) [ID: ${
              c.id
            }]`
        )
        .join("\n")
    : "No categories yet. Suggest creating categories for better tracking!"
}

💳 PAYMENT SOURCES (${paymentMethods?.length || 0} available):
${
  paymentMethods && paymentMethods.length > 0
    ? paymentMethods.map((s, i) => `${i + 1}. ${s}`).join("\n")
    : "No payment sources configured."
}

💰 RECENT TRANSACTIONS (${transactions?.length || 0} total):
${
  transactions && transactions.length > 0
    ? transactions
        .slice(0, 50)
        .map(
          (t, i) =>
            `${i + 1}. ₹${t.amount.toFixed(2)} - ${t.description} (Date: ${
              t.date
            })`
        )
        .join("\n")
    : "No transactions yet. Start adding transactions to track spending!"
}
${transactions && transactions.length > 50 ? "\n... and more transactions" : ""}

═══════════════════════════════════════════════════════════

💡 YOU CAN HELP WITH:
• Spending analysis and insights
• Budget recommendations based on actual data
• Financial calculations (savings goals, EMI, etc.)
• Best practices for budgeting and saving
• General investment and tax-saving guidance
• Identifying spending patterns and anomalies

═══════════════════════════════════════════════════════════
`;

    const historyBlock = formattedHistory
      ? `\n📝 CONVERSATION HISTORY:\n${formattedHistory}\n`
      : "";

    const finalPrompt = `${systemMessage}\n${contextBlock}${historyBlock}\n🗣️ USER'S NEW MESSAGE:\n${input.message}\n\n💬 YOUR RESPONSE:`;

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
          response: `✅ Got it — **${txn.description || txn.spentOn}** for **₹${
            txn.amount
          }** in **${txn.category}** (via **${txn.source}**).  
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
