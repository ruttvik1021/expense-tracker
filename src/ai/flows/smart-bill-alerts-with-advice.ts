"use server";
/**
 * @fileOverview This file implements the Genkit flow for generating smart alerts about upcoming bills with friendly advice.
 *
 * - generateBillAlertWithAdvice - A function that generates personalized bill alerts with advice.
 * - GenerateBillAlertWithAdviceInput - The input type for the generateBillAlertWithAdvice function.
 * - GenerateBillAlertWithAdviceOutput - The return type for the generateBillAlertWithAdvice function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateBillAlertWithAdviceInputSchema = z.object({
  billName: z
    .string()
    .describe("The name of the upcoming bill (e.g., Electricity Bill)."),
  billAmount: z.number().describe("The amount of the upcoming bill."),
  dueDate: z
    .string()
    .describe("The due date of the bill (e.g., September 13th)."),
  averageWeeklySpending: z
    .number()
    .describe("The user's average weekly spending."),
});
export type GenerateBillAlertWithAdviceInput = z.infer<
  typeof GenerateBillAlertWithAdviceInputSchema
>;

const GenerateBillAlertWithAdviceOutputSchema = z.object({
  alertMessage: z
    .string()
    .describe(
      "A personalized, friendly alert message for the upcoming bill with a brief tip."
    ),
});
export type GenerateBillAlertWithAdviceOutput = z.infer<
  typeof GenerateBillAlertWithAdviceOutputSchema
>;

export async function generateBillAlertWithAdvice(
  input: GenerateBillAlertWithAdviceInput
): Promise<GenerateBillAlertWithAdviceOutput> {
  return generateBillAlertWithAdviceFlow(input);
}

const generateBillAlertWithAdvicePrompt = ai.definePrompt({
  name: "generateBillAlertWithAdvicePrompt",
  input: { schema: GenerateBillAlertWithAdviceInputSchema },
  output: { schema: GenerateBillAlertWithAdviceOutputSchema },
  prompt: `You are a helpful financial advisor. Generate a friendly, non-alarming reminder for an upcoming bill, and include a brief, friendly tip to manage weekly spending.

Bill Name: {{{billName}}}
Bill Amount: {{{billAmount}}}
Due Date: {{{dueDate}}}
Average Weekly Spending: {{{averageWeeklySpending}}}
`,
});

const generateBillAlertWithAdviceFlow = ai.defineFlow(
  {
    name: "generateBillAlertWithAdviceFlow",
    inputSchema: GenerateBillAlertWithAdviceInputSchema,
    outputSchema: GenerateBillAlertWithAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await generateBillAlertWithAdvicePrompt(input);
    return output!;
  }
);
