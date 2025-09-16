// src/ai/flows/contextual-financial-tips.ts
"use server";

/**
 * @fileOverview Provides financial education tips based on user savings milestones.
 *
 * - `getContextualFinancialTip` -  A function that returns a financial education tip based on the user's savings.
 * - `ContextualFinancialTipInput` - The input type for the `getContextualFinancialTip` function.
 * - `ContextualFinancialTipOutput` - The return type for the `getContextualFinancialTip` function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ContextualFinancialTipInputSchema = z.object({
  savingsBalance: z.number().describe("The user's current savings balance."),
  income: z.number().describe("The user's monthly income."),
});

export type ContextualFinancialTipInput = z.infer<
  typeof ContextualFinancialTipInputSchema
>;

const ContextualFinancialTipOutputSchema = z.object({
  tip: z.string().describe("A financial education tip."),
});

export type ContextualFinancialTipOutput = z.infer<
  typeof ContextualFinancialTipOutputSchema
>;

export async function getContextualFinancialTip(
  input: ContextualFinancialTipInput
): Promise<ContextualFinancialTipOutput> {
  return contextualFinancialTipFlow(input);
}

const prompt = ai.definePrompt({
  name: "contextualFinancialTipPrompt",
  input: { schema: ContextualFinancialTipInputSchema },
  output: { schema: ContextualFinancialTipOutputSchema },
  prompt: `You are a financial advisor providing helpful financial tips.

  Based on the user's savings balance of {{{savingsBalance}}} and monthly income of {{{income}}}, provide a relevant financial education tip.  The tip should be concise and easy to understand.
  Consider the following scenarios:
  - Savings balance is low (less than one month's income): Encourage building an emergency fund.
  - Savings balance is moderate (one to three months' income): Suggest exploring low-risk investment options.
  - Savings balance is high (more than three months' income): Recommend consulting a financial advisor for long-term investment strategies.
  `,
});

const contextualFinancialTipFlow = ai.defineFlow(
  {
    name: "contextualFinancialTipFlow",
    inputSchema: ContextualFinancialTipInputSchema,
    outputSchema: ContextualFinancialTipOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
