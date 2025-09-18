"use server";

/**
 * @fileOverview A flow for providing proactive, personalized insights based on spending history.
 *
 * - getProactiveInsights - A function that generates only a spending summary
 *   and returns empty arrays for articles and suggestions.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ProactiveInsightsInputSchema = z.object({
  currentMonthTransactions: z
    .string()
    .describe("A record of transactions from the current month."),
  currentMonthCategories: z
    .string()
    .describe("A record of categories from the current month."),
  lastMonthTransactions: z
    .string()
    .describe("A record of transactions from the last month."),
});
export type ProactiveInsightsInput = z.infer<
  typeof ProactiveInsightsInputSchema
>;

const ProactiveInsightsOutputSchema = z.object({
  spendingSummary: z
    .string()
    .describe(
      "A brief, conversational summary comparing last month's and this month's spending."
    ),
});
export type ProactiveInsightsOutput = z.infer<
  typeof ProactiveInsightsOutputSchema
>;

/* ---------- Public API ---------- */

export async function getProactiveInsights(
  input: ProactiveInsightsInput
): Promise<ProactiveInsightsOutput> {
  return proactiveInsightsFlow(input);
}

/* ---------- Internal prompt & flow ---------- */

const summaryPrompt = ai.definePrompt({
  name: "proactiveInsightsSummaryPrompt",
  input: { schema: ProactiveInsightsInputSchema },
  output: {
    schema: z.object({
      spendingSummary: z.string(),
    }),
  },
  prompt: `You are a friendly and professional financial expert, skilled in helping to take wise decisions, suggest investment ideas and pointing the scope of improvement in spending pattern.

Analyze the user's spending records for the current month and provide a **clear, concise summary** with actionable insights.

---

### Transactions
(amount | item | date)  
{{{currentMonthTransactions}}}

### Category Budgets
(category | budget)  
{{{currentMonthCategories}}}

### Last Month Transactions
(amount | item | date)  
{{{lastMonthTransactions}}}

---

Please provide the following in a single field **'spendingSummary'**:

1. **Summary**
   - Total income (if provided), total expenses, and net savings (if provided)
   - Highest spending category  
   - Comparison to last month (increase/decrease in total spending)

2. **Category Breakdown**
   - Highlight categories with *not-so-healthy* spending patterns  
   - Recognize categories showing balanced or improving habits
   - Highlight categories over or under budget

3. **Spending Trends**
   - Notable spikes or unusual transactions

4. **Recommendations** (Optional)
   - Short suggestions to stay within budget  
   - Opportunities to optimize spending or increase savings

---

Format the output with **clear bullets**, keep it readable, and maintain a **friendly tone**.  
Avoid unnecessary narration, but include enough detail for meaningful insights.  
Aim for **200 words**.
`,
});

// Flow: use the summary prompt, then return empty arrays for other fields
const proactiveInsightsFlow = ai.defineFlow(
  {
    name: "proactiveInsightsFlow",
    inputSchema: ProactiveInsightsInputSchema,
    outputSchema: ProactiveInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await summaryPrompt(input);
    return {
      spendingSummary: output!.spendingSummary,
    };
  }
);
