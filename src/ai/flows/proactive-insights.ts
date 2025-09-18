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
  budget: z
    .string()
    .describe("Total budget for the month."),
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
  prompt: `Analyze the provided financial data and generate a valid JSON object with a single key, 'spendingSummary'. The value of this key must be a pure Markdown string, containing only headings, lists, bold, and italics.

---
### Data
(amount | item | date) 
**Current Month Transactions:**
{{{currentMonthTransactions}}}

**Category Budgets:**
{{{currentMonthCategories}}}

**Last Month Transactions:**
{{{lastMonthTransactions}}}

**Monthly Budget:**
{{{budget}}}

---

### Instructions

1.  **Summary**
    * **Total spending:** Total expenses for the current month.
    * **Net savings:** Total income minus total expenses.
    * **Insights:**
        * Highlight the highest spending category.
        * Compare total spending to last month (increase/decrease).

2.  **Category Breakdown**
    * Provide a spending health status for categories flagged as 'Not-so-healthy' or 'Watchful'.
    * For each flagged category, provide a brief reason and a short, actionable suggestion.
    * **Status Rules:**
        * 'Not-so-healthy': Spending is >20% over budget OR there are 2+ unusually large transactions.
        * 'Watchful': Spending is between 5% and 20% over budget OR there's a rising month-over-month trend.

3.  **Spending Trends**
    * Identify notable weekly or daily spending patterns.
    * Highlight any unusual transactions or spending spikes.

4.  **Recommendations**
    * Provide 2-3 short, actionable suggestions to help the user stay on budget and optimize savings.

5.  **Formatting**
    * Use **bold** for key terms.
    * Ensure all output is valid Markdown.
    * Use clear bullet points and friendly, concise language.
    * Total length must be between around 200-300 words.
    * Add the Rupee symbol (₹) where appropriate.

If the monthly budget is not updated, advise the user to update it from their profile.`,
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
