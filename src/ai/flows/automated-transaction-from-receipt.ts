// src/ai/flows/automated-transaction-from-receipt.ts
"use server";
/**
 * @fileOverview This file defines a Genkit flow for creating a transaction from a receipt image.
 *
 * - `createTransactionFromReceipt`:  A function that handles the transaction creation from receipt image process.
 * - `CreateTransactionFromReceiptInput`: The input type for the `createTransactionFromReceipt` function.
 * - `CreateTransactionFromReceiptOutput`: The return type for the `createTransactionFromReceipt` function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const CreateTransactionFromReceiptInputSchema = z.object({
  receiptImage: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  availableCategories: z
    .array(z.string())
    .describe("A list of available transaction categories."),
});
export type CreateTransactionFromReceiptInput = z.infer<
  typeof CreateTransactionFromReceiptInputSchema
>;

const CreateTransactionFromReceiptOutputSchema = z.object({
  merchantName: z.string().describe("The name of the merchant on the receipt."),
  totalAmount: z.number().describe("The total amount on the receipt."),
  date: z.string().describe("The date on the receipt (ISO 8601 format)."),
  category: z
    .string()
    .describe(
      "The suggested category for the transaction. This should be one of the available categories if a suitable one is found."
    ),
});
export type CreateTransactionFromReceiptOutput = z.infer<
  typeof CreateTransactionFromReceiptOutputSchema
>;

export async function createTransactionFromReceipt(
  input: CreateTransactionFromReceiptInput
): Promise<CreateTransactionFromReceiptOutput> {
  return createTransactionFromReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: "extractReceiptData",
  input: { schema: CreateTransactionFromReceiptInputSchema },
  output: { schema: CreateTransactionFromReceiptOutputSchema },
  prompt: `Extract the following details from this image of a receipt: merchant name, total amount, and date (ISO 8601 format).

Then, suggest a category for this transaction.
Here is a list of available categories:
{{#each availableCategories}}
- {{{this}}}
{{/each}}

If the transaction fits well into one of the available categories, use that category name exactly. Otherwise, suggest a new, appropriate category.

Receipt Image: {{media url=receiptImage}}`,
});

const createTransactionFromReceiptFlow = ai.defineFlow(
  {
    name: "createTransactionFromReceiptFlow",
    inputSchema: CreateTransactionFromReceiptInputSchema,
    outputSchema: CreateTransactionFromReceiptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
