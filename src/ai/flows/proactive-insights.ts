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
    .describe("Transaction records."),
  currentMonthCategories: z
    .string()
    .describe("All categories"),
  lastMonthTransactions: z
    .string()
    .describe("A summary of transactions from the last month."),
});
export type ProactiveInsightsInput = z.infer<typeof ProactiveInsightsInputSchema>;

const ProactiveInsightsOutputSchema = z.object({
  spendingSummary: z
    .string()
    .describe(
      "A brief, conversational summary of this month's spending."
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
const summaryPrompt = ai.definePrompt({
  name: "proactiveInsightsSummaryPrompt",
  input: { schema: ProactiveInsightsInputSchema },
  output: {
  schema: z.object({
    spendingSummary: z.string(),
  }),
},
  prompt: `You are a financial expert.
Analyze the user's spending records and give conversational summary based on the records in 2-3 lines.

All Transactions (amount|item|date):
{{{currentMonthTransactions}}}

All Categories (category|budget):
{{{currentMonthCategories}}}

Last Month Transactions:
{{{lastMonthTransactions}}}
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
