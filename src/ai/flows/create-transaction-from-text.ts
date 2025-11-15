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
      prompt: `Extract transaction details from the user's text. Be smart about defaults:

**Required:**
- Amount: Extract the number (REQUIRED - don't proceed without it)
- Description/spentOn: What was purchased

**Auto-fill when possible:**
- Category: Match to available categories OR suggest creating a new one if none fit
- Date: Use today's date (${new Date().toISOString()}) if not specified
- Source: Use the first available payment source if not specified

**Available Categories:**
{{#each availableCategories}}
- {{{this}}}
{{/each}}

**Available Payment Sources:**
{{#each availablePaymentSources}}
- {{{this}}}
{{/each}}

**Examples:**
- "spent 50 on coffee" → amount: 50, description: "coffee", category: match to Food/Beverages or suggest new
- "add 1000 for rent" → amount: 1000, description: "rent", category: match to Housing or suggest new
- "500 for gym" → amount: 500, description: "gym", category: match to Fitness or suggest new

**Rules:**
- ALWAYS extract amount if present
- Choose best matching category or suggest creating appropriate new one
- Auto-fill date and source with smart defaults
- Keep description short and clear

User's text: "{{{text}}}"
        `,
    });

    const { output } = await extractionPrompt(input);
    return output!;
  }
);
