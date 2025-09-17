// "use server";

// /**
//  * @fileOverview A flow for providing proactive, personalized insights based on spending history.
//  *
//  * - getProactiveInsights - A function that generates a summary, articles, and suggestions.
//  * - ProactiveInsightsInput - The input type for the getProactiveInsights function.
//  * - ProactiveInsightsOutput - The return type for the getProactiveInsights function.
//  */

// import { ai } from "@/ai/genkit";
// import { z } from "genkit";

// const ArticleSchema = z.object({
//   title: z.string().describe("The title of the financial article."),
//   url: z.string().url().describe("The URL to the full article."),
// });

// const SuggestionSchema = z.object({
//   type: z
//     .enum(["Dining", "Movie", "Concert", "Event"])
//     .describe("The type of suggestion."),
//   name: z
//     .string()
//     .describe(
//       "The name of the suggested item (e.g., restaurant name, movie title)."
//     ),
//   description: z
//     .string()
//     .describe("A brief description of why this is being suggested."),
// });

// const ProactiveInsightsInputSchema = z.object({
//   currentMonthTransactions: z
//     .string()
//     .describe("A summary of transactions from the current month."),
//   lastMonthTransactions: z
//     .string()
//     .describe("A summary of transactions from the last month."),
// });
// export type ProactiveInsightsInput = z.infer<
//   typeof ProactiveInsightsInputSchema
// >;

// const ProactiveInsightsOutputSchema = z.object({
//   spendingSummary: z
//     .string()
//     .describe(
//       "A brief, conversational summary comparing last month's and this month's spending."
//     ),
//   articles: z
//     .array(ArticleSchema)
//     .describe(
//       "A list of 2-3 helpful financial articles with real, valid URLs."
//     ),
//   suggestions: z
//     .array(SuggestionSchema)
//     .describe(
//       "A list of 2-3 personalized suggestions for events, movies, or dining based on spending habits."
//     ),
// });
// export type ProactiveInsightsOutput = z.infer<
//   typeof ProactiveInsightsOutputSchema
// >;

// export async function getProactiveInsights(
//   input: ProactiveInsightsInput
// ): Promise<ProactiveInsightsOutput> {
//   return proactiveInsightsFlow(input);
// }

// const prompt = ai.definePrompt({
//   name: "proactiveInsightsPrompt",
//   input: { schema: ProactiveInsightsInputSchema },
//   output: { schema: ProactiveInsightsOutputSchema },
//   prompt: `You are a friendly and insightful financial assistant. Your goal is to provide proactive, helpful, and engaging insights based on a user's transaction history. Don't take time beyond 5 seconds for below tasks.

// Analyze the user's spending for the current and previous month and provide the following:
// 1.  **Spending Summary:** A short, conversational summary (2-3 sentences) comparing their spending trends.
// 2.  **Helpful Articles:** A list of 2-3 helpful and relevant financial articles. These should be real articles from reputable sources (e.g., Forbes, NerdWallet, Investopedia). Provide valid URLs.
// 3.  **Personalized Suggestions:** Based on their entertainment and dining transactions, suggest 2-3 specific things they might enjoy, like a movie currently in theaters, a type of restaurant, or a concert/event. Be creative and justify your suggestions briefly in Pune, Maharashtra location.

// **Current Month's Transactions:**
// {{{currentMonthTransactions}}}

// **Last Month's Transactions:**
// {{{lastMonthTransactions}}}
// `,
// });

// const proactiveInsightsFlow = ai.defineFlow(
//   {
//     name: "proactiveInsightsFlow",
//     inputSchema: ProactiveInsightsInputSchema,
//     outputSchema: ProactiveInsightsOutputSchema,
//   },
//   async (input) => {
//     const { output } = await prompt(input);
//     return output!;
//   }
// );


"use server";

/**
 * @fileOverview A flow for providing proactive, personalized insights based on spending history.
 *
 * - getProactiveInsights - A function that generates only a spending summary
 *   and returns empty arrays for articles and suggestions.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

/* ---------- Schemas ---------- */

const ArticleSchema = z.object({
  title: z.string().describe("The title of the financial article."),
  url: z.string().url().describe("The URL to the full article."),
});

const SuggestionSchema = z.object({
  type: z
    .enum(["Dining", "Movie", "Concert", "Event"])
    .describe("The type of suggestion."),
  name: z
    .string()
    .describe("The name of the suggested item (e.g., restaurant name, movie title)."),
  description: z
    .string()
    .describe("A brief description of why this is being suggested."),
});

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
export type ProactiveInsightsInput = z.infer<typeof ProactiveInsightsInputSchema>;

const ProactiveInsightsOutputSchema = z.object({
  spendingSummary: z
    .string()
    .describe(
      "A brief, conversational summary comparing last month's and this month's spending."
    ),
  articles: z
    .array(ArticleSchema)
    .describe("A list of 2-3 helpful financial articles with real, valid URLs."),
  suggestions: z
    .array(SuggestionSchema)
    .describe(
      "A list of 2-3 personalized suggestions for events, movies, or dining based on spending habits."
    ),
});
export type ProactiveInsightsOutput = z.infer<typeof ProactiveInsightsOutputSchema>;

/* ---------- Public API ---------- */

export async function getProactiveInsights(
  input: ProactiveInsightsInput
): Promise<ProactiveInsightsOutput> {
  return proactiveInsightsFlow(input);
}

/* ---------- Internal prompt & flow ---------- */

// Prompt only asks for the spending summary
// const summaryPrompt = ai.definePrompt({
//   name: "proactiveInsightsSummaryPrompt",
//   input: { schema: ProactiveInsightsInputSchema },
//   output: {
//     schema: z.object({
//       spendingSummary: z.string(),
//     }),
//   },
//   prompt: `
// You are a friendly and professional financial assistant.

// Analyze the user's spending records and provide a detailed report for the current month, including insights, comparisons, and recommendations.

// **Transactions (amount | item | date):**
// {{{currentMonthTransactions}}}

// **Category Allocations (category | budget):**
// {{{currentMonthCategories}}}

// **Last Month Transactions (amount | item | date):**
// {{{lastMonthTransactions}}}

// Please provide the following in your analysis (spendingSummary):

// 1. **Summary**
//    - Total income, total expenses, and net savings for the current month
//    - Highest spending category
//    - Comparison with last month (increase/decrease in total spending)

// 2. **Category Breakdown**
//    - Total spent per category
//    - Percentage of total expenses per category
//    - Comparison with planned budget allocation (over/under budget)
//    - Highlight categories significantly over or under budget

// 3. **Spending Trends**
//    - Weekly or daily spending patterns
//    - Notable spikes or unusual expenses compared to last month

// 4. **Recommendations**
//    - Suggested adjustments to stay within budget for the rest of the month
//    - Categories where spending could be optimized to increase savings

// 5. **Optional Visualization**
//    - You may include tables or bullet lists summarizing spending by category and trends

// Use a friendly tone, provide clear insights, and make the report actionable for the user.
// `,
// });

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

**Transactions (amount | item | date):**
{{{currentMonthTransactions}}}

**Category Budgets (category | budget):**
{{{currentMonthCategories}}}

**Last Month Transactions (amount | item | date):**
{{{lastMonthTransactions}}}

Please provide the following in a single field 'spendingSummary':

1. **Summary**
   - Total income (if provided), total expenses, and net savings  
   - Highest spending category  
   - Comparison to last month (increase/decrease in total spending)

2. **Category Breakdown**
   - Amount spent per category  
   - Percentage of total expenses per category  
   - Highlight categories over or under budget  

3. **Spending Trends**
   - Weekly or daily spending patterns  
   - Notable spikes or unusual transactions

4. **Recommendations**
   - Short suggestions to stay within budget  
   - Opportunities to optimize spending or increase savings  

Format your output with **clear bullets**, keep it readable, and maintain a **friendly tone**. Avoid unnecessary narration, but provide enough detail to give meaningful insights. Aim for **150–300 words**.
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
      articles: [],        // always empty
      suggestions: [],     // always empty
    };
  }
);
