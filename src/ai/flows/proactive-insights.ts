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
  prompt: `You are a friendly and professional financial assistant.

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

### Monthly Budget
{{{budget}}}

---

Please provide the following in **one JSON field named 'spendingSummary'**,  
and **use ONLY pure Markdown syntax** (headings, lists, bold, italics).  
**Output must be valid **Markdown only**—no HTML tags.**

1. **Summary**
   - Total income (if provided), total expenses, and net savings  
   - Highest spending category '
   - Comparison to last month (increase/decrease in total spending)



2. **Category Breakdown** (Only include Not-so-healthy & Watchful)
   - **Spending health** for each category: 'Not-so-healthy', 'Watchful', 'On-track', or 'Excellent'
   - **Why**: short reason (e.g., "20% over budget", "weekly spikes")
   - **Action**: brief suggestion (e.g., "reduce dine-out meals", "track groceries")

   **Classification rules**  
   - 'Not-so-healthy': >20 % over budget OR more than 2 unusually large transactions this month  
   - 'Watchful': 5-20 % over budget OR rising month-over-month trend  
   - 'On-track': within ±5 % of budget and stable  
   - 'Excellent': ≥10 % under budget and declining trend



3. **Spending Trends**
   - Weekly or daily spending patterns  
   - Notable spikes or unusual transactions



4. **Recommendations**
   - Short suggestions to stay within budget  
   - Opportunities to optimize spending or increase savings
   
   

5. **Investment Ideas** *(include this section only if total expenses are **significantly below** total budget)*  
   - Suggest ideas based on the categories like If user is already investing then expert level strategies else simple, beginner-friendly investment or savings strategies  
   - Include ideas such as:  
     - **Stocks**: diversified index funds or blue-chip equities  
     - **Mutual Funds (MF)**: low-cost diversified equity or balanced funds  
     - **Bonds**: government or high-quality corporate bonds for stability  
   - Provide 2-3 **reputable article links** for each asset type (stocks, mutual funds, bonds) to help the user learn more.
     - Use well-known financial education or major investment sites (e.g., Investopedia, Morningstar, government financial portals, moneycontrol, etmoney, cnbc, yahoo finance).
---

**Formatting requirements**  
- Output must be valid **Markdown only**—no HTML tags.
- Add 2 new line between main points
- Make the numbered points bold
- Use **clear bullet points** and friendly, concise language.
- If budget is not updated, ask user to update the budget from the profile section.
- Keep the total length between **200 words**.
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
