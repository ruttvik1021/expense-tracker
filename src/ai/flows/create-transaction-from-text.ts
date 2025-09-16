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
});

const CreateTransactionFromTextOutputSchema = z.object({
  description: z.string().describe("A concise description of the transaction."),
  amount: z.number().describe("The transaction amount."),
  category: z
    .string()
    .describe(
      "The suggested category for the transaction. If a suitable one exists in the available categories, use it. Otherwise, suggest a new, appropriate category name."
    ),
  date: z
    .string()
    .describe(
      "The date of the transaction in ISO 8601 format (e.g., YYYY-MM-DD). Default to today if not specified."
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
        - Category (which of the available categories fits best? If none fit, suggest a new, sensible one.)
        - Date (in YYYY-MM-DD format, default to today if not specified)

        Available Categories:
        {{#each availableCategories}}
        - {{{this}}}
        {{/each}}
        
        If a transaction fits well into one of the available categories, use that category name exactly. Otherwise, suggest a new, appropriate category.

        User's text: "{{{text}}}"
        `,
    });

    const { output } = await extractionPrompt(input);
    return output!;
  }
);
