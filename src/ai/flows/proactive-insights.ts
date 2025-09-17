"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

/* ---------- Schemas ---------- */
const ArticleSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});

const SuggestionSchema = z.object({
  type: z.enum(["Dining", "Movie", "Concert", "Event"]),
  name: z.string(),
  description: z.string(),
});

const ProactiveInsightsInputSchema = z.object({
  currentMonthTransactions: z.string(),
  currentMonthCategories: z.string(),
  lastMonthTransactions: z.string(),
});
export type ProactiveInsightsInput = z.infer<typeof ProactiveInsightsInputSchema>;

const SpendingSummaryOutputSchema = z.object({
  spendingSummary: z.string(),
});
const ArticlesOutputSchema = z.object({
  articles: z.array(ArticleSchema),
});
const SuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema),
});

/* ---------- Prompts ---------- */

// 1️⃣ Spending Summary
const summaryPrompt = ai.definePrompt({
  name: "proactiveInsightsSummaryPrompt",
  input: { schema: ProactiveInsightsInputSchema },
  output: { schema: SpendingSummaryOutputSchema },
  prompt: `You are a friendly financial assistant.
Analyze these transactions and provide a 2–3 sentence conversational spending summary.

Transactions:
{{{currentMonthTransactions}}}
Categories:
{{{currentMonthCategories}}}
Last Month:
{{{lastMonthTransactions}}}
`,
});

// 2️⃣ Articles
const articlesPrompt = ai.definePrompt({
  name: "proactiveInsightsArticlesPrompt",
  input: { schema: ProactiveInsightsInputSchema },
  output: { schema: ArticlesOutputSchema },
  prompt: `You are a financial assistant.
Suggest 2-3 helpful and relevant finance articles for the user based on their spending history.
Provide real articles with title and valid URL.

Transactions:
{{{currentMonthTransactions}}}
Categories:
{{{currentMonthCategories}}}
Last Month:
{{{lastMonthTransactions}}}
`,
});

// 3️⃣ Suggestions
const suggestionsPrompt = ai.definePrompt({
  name: "proactiveInsightsSuggestionsPrompt",
  input: { schema: ProactiveInsightsInputSchema },
  output: { schema: SuggestionsOutputSchema },
  prompt: `You are a financial assistant.
Based on the user's entertainment and dining transactions, suggest 2-3 specific things they might enjoy (Movie, Dining, Concert, Event) in Pune, Maharashtra.
Provide name, type, and brief reason for each suggestion.

Transactions:
{{{currentMonthTransactions}}}
Categories:
{{{currentMonthCategories}}}
Last Month:
{{{lastMonthTransactions}}}
`,
});

/* ---------- API Functions ---------- */

// 1️⃣ Spending Summary
export async function getSpendingSummary(input: ProactiveInsightsInput) {
  const { output } = await summaryPrompt(input);
  return output!;
}

export async function streamSpendingSummary(input: ProactiveInsightsInput) {
  return summaryPrompt.stream(input);
}

// 2️⃣ Articles
export async function getArticles(input: ProactiveInsightsInput) {
  const { output } = await articlesPrompt(input);
  return output!;
}

export async function streamArticles(input: ProactiveInsightsInput) {
  return articlesPrompt.stream(input);
}

// 3️⃣ Suggestions
export async function getSuggestions(input: ProactiveInsightsInput) {
  const { output } = await suggestionsPrompt(input);
  return output!;
}

export async function streamSuggestions(input: ProactiveInsightsInput) {
  return suggestionsPrompt.stream(input);
}
