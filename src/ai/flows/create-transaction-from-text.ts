"use server";
/**
 * @fileOverview This file defines a Genkit tool for creating a transaction from a text string.
 *
 * - `createTransactionFromTextTool`:  A Genkit tool that extracts transaction details from a string.
 */
import { ai } from "@/ai/genkit";
import { z } from "zod";

const CreateTransactionFromTextInputSchema = z.object({
  text: z
    .string()
    .describe(
      'The user\'s text describing a transaction (e.g., "spent 25 on lunch").'
    ),
  availableCategories: z
    .array(z.string())
    .describe("A list of available transaction categories to choose from."),
  availablePaymentSources: z
    .array(z.string())
    .describe("A list of available payment methods to choose from."),
});

const CreateTransactionFromTextOutputSchema = z.object({
  description: z
    .string()
    .optional()
    .describe("A concise description of the transaction."),
  amount: z.number().describe("The transaction amount."),
  category: z
    .string()
    .optional()
    .describe(
      "The suggested category for the transaction. If a suitable one exists in the available categories, use it. Otherwise, suggest a new, appropriate category name."
    ),
  date: z
    .string()
    .optional()
    .describe(
      "The date of the transaction format (e.g., 2025-09-19T00:30:27+05:30). Default to today if not specified."
    ),
  spentOn: z
    .string()
    .optional()
    .describe(
      "A short description of what the money was spent on (maps to 'spentOn' field)."
    ),
  source: z
    .string()
    .optional()
    .describe("Suggested payment source id or name (maps to 'source' field)."),
});

export const createTransactionFromTextTool = ai.defineTool(
  {
    name: "createTransactionFromTextTool",
    description:
      "Extracts transaction details from a natural language string. Use this when the user wants to add, create, or record a new transaction.",
    inputSchema: z.object({
      text: z
        .string()
        .describe("The user's raw text input about the transaction."),
      availableCategories: z
        .array(z.string())
        .describe("A list of valid category names to choose from."),
      availablePaymentSources: z
        .array(z.string())
        .describe("A list of available payment methods to choose from."),
    }),
    outputSchema: CreateTransactionFromTextOutputSchema,
  },
  async (input) => {
    // A nested prompt to perform the actual extraction logic.
    const extractionPrompt = ai.definePrompt({
      name: "extractionPrompt",
      input: { schema: CreateTransactionFromTextInputSchema },
      output: { schema: CreateTransactionFromTextOutputSchema },
      prompt: `You are an expert at extracting structured data from text.
        
        Analyze the user's request and extract the following details:
        - Description (what was the item/service?)
        - Amount (how much did it cost?)
        - Category: MUST be chosen from the availableCategories list below. 
          If the user's text implies a category not in this list, DO NOT create it automatically.
          Instead, ask the user: "Would you like to create a new category called 'X'?"
          Only proceed with category creation if the user confirms.

        - Date (in 2025-09-19T00:30:27+05:30 format)
        - Source (how was it paid)

        - If anything is missing ask the user for it.

        Available Categories:
        {{#each availableCategories}}
        - {{{this}}}
        {{/each}}

        Available Sources:
        {{#each availablePaymentSources}}
        - {{{this}}}
        {{/each}}

        If any confusion ask user for clarification.
        Note:
        - Never guess or create a new category without confirmation from the user.


        User's text: "{{{text}}}"
        `,
    });

    const { output } = await extractionPrompt(input);
    return output!;
  }
);
