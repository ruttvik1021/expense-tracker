"use server";

/**
 * @fileOverview A flow for providing personalized spending insights to users.
 *
 * - getPersonalizedSpendingInsights - A function that generates personalized spending insights.
 * - PersonalizedSpendingInsightsInput - The input type for the getPersonalizedSpendingInsights function.
 * - PersonalizedSpendingInsightsOutput - The return type for the getPersonalizedSpendingInsights function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const PersonalizedSpendingInsightsInputSchema = z.object({
  averageWeeklySpending: z
    .number()
    .describe("The average weekly spending of the user."),
  thisWeekSpending: z.number().describe("The user's spending this week."),
  category: z.string().describe("The category of spending to analyze."),
  last30DaysTransactionData: z
    .string()
    .describe(
      "The user's transaction data from the last 30 days, including date, amount, and description."
    ),
});
export type PersonalizedSpendingInsightsInput = z.infer<
  typeof PersonalizedSpendingInsightsInputSchema
>;

const PersonalizedSpendingInsightsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      "A conversational summary of the spending trend, including potential reasons for the increase."
    ),
  actionableTip: z
    .string()
    .describe(
      "One actionable tip to help the user get back on track with their spending."
    ),
});
export type PersonalizedSpendingInsightsOutput = z.infer<
  typeof PersonalizedSpendingInsightsOutputSchema
>;

export async function getPersonalizedSpendingInsights(
  input: PersonalizedSpendingInsightsInput
): Promise<PersonalizedSpendingInsightsOutput> {
  return personalizedSpendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: "personalizedSpendingInsightsPrompt",
  input: { schema: PersonalizedSpendingInsightsInputSchema },
  output: { schema: PersonalizedSpendingInsightsOutputSchema },
  prompt: `Analyze the following user transaction data from the last 30 days related to the category "{{category}}". The user\'s average weekly spending in this category is {{averageWeeklySpending}}. This week\'s spending is {{thisWeekSpending}}. Provide a short, conversational summary of this spending trend, including potential reasons for the increase, and suggest one actionable tip to help the user get back on track.

Transaction Data:
{{last30DaysTransactionData}}`,
});

const personalizedSpendingInsightsFlow = ai.defineFlow(
  {
    name: "personalizedSpendingInsightsFlow",
    inputSchema: PersonalizedSpendingInsightsInputSchema,
    outputSchema: PersonalizedSpendingInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
