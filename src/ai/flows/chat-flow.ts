"use server";
/**
 * @fileOverview A conversational AI flow for answering financial questions and creating transactions or categories.
 *
 * - chat - A function that handles the conversational chat logic.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { createTransactionFromTextTool } from "./create-transaction-from-text";
import { createCategoryFromTextTool } from "./create-category-from-text";

const ChatInputSchema = z.object({
  prompt: z.string().describe("The full prompt for the AI model.")
});

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response message."),
  transactionData: z
    .object({
      description: z.string(),
      amount: z.number(),
      category: z.string(),
      type: z.enum(["income", "expense"]),
      date: z.string(),
      spentOn: z.string().optional(),
      source: z.string().optional(),
    })
    .optional()
    .describe(
      "Structured data for a new transaction, if the user requested to create one."
    ),
  categoryData: z
    .object({
      name: z.string(),
      icon: z.string(),
      color: z.string(),
      budget: z.number().optional(),
      periodType: z
        .enum(["once", "monthly", "quarterly", "half-yearly"]) // align with form
        .optional(),
      startMonth: z.number().optional(),
      creationDuration: z.enum(["next12Months", "yearEnd"]).optional(),
    })
    .optional()
    .describe(
      "Structured data for a new category, if the user requested to create one."
    ),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
  name: "chatPrompt",
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  tools: [createTransactionFromTextTool, createCategoryFromTextTool],
  prompt: `{{{prompt}}}`,
  returnToolRequests: true,
});

export async function chat(input: {
  history: { role: "user" | "model"; parts: { text: string }[] }[];
  message: string;
  transactionContext: string;
  availableCategories: string;
}): Promise<ChatOutput> {
  // 1. Format the raw chat history into a simple string.
  const formattedHistory = input.history
    .map((msg) => {
      const prefix = msg.role === "user" ? "User:" : "AI:";
      return `${prefix} ${msg.parts[0].text}`;
    })
    .join("\n");

  // 2. Construct the full prompt string.
  const systemMessage = `You are a friendly and helpful financial assistant. Your goal is to answer the user's questions about their finances based on their chat history and the provided transaction data.

  The currency is Rupee.

If the user asks you to add, create, or record a transaction (e.g., "add a 5 coffee" or "spent 50 on groceries"), you MUST use the \`createTransactionFromTextTool\` to extract the details. Make sure the tool returns or includes values for 'description', 'amount', 'category', 'date', and where possible 'spentOn' and 'source'. After the tool returns the transaction details, your final response should be a confirmation to the user that includes the category and spentOn (if present), like "Sure, I can add a transaction for [description] for [amount] in the [category] category (for [spentOn]). Does this look right?".

If the user asks you to create a new category (e.g., "create a new category for Pets"), you MUST use the \`createCategoryFromTextTool\` to extract the details. The category tool should return 'name', 'icon', 'color' and may optionally include 'budget', 'periodType', 'startMonth', and 'creationDuration'. After the tool returns the category details, your final response should be a confirmation to the user that includes the suggested details, like "Sure, I can create a new category called '[name]' with the [icon] icon and a [color] color. Suggested budget: [budget] (if provided). Does this look right?".

Keep your answers concise and easy to understand.`;

  const contextBlock = input.transactionContext
    ? `Here is the user's transaction data for context:\n${input.transactionContext}\n
       Here is the user created categories for expenses: \n${input.availableCategories}\n`
    : "";

  const historyBlock = formattedHistory
    ? `Chat History:\n${formattedHistory}\n`
    : "";

  const finalPrompt = `${systemMessage}\n\n${contextBlock}${historyBlock}User's new message:\n${input.message}\n\nYour response:`;

  // 3. Call the prompt.
  const llmResponse = await chatPrompt({
    prompt: finalPrompt,
  });

  const output = llmResponse.output!;

  console.log("llmResponse", llmResponse);

  // 4. Check if a tool was called and handle the response.
  //   const toolRequest = llmResponse.history?.find(
  //     (m) => m.role === "model" && m.parts.some((p) => p.toolRequest)
  //   );

  //   if (toolRequest) {
  //     const toolResponsePart = llmResponse
  //       ?.toHistory()
  //       .history?.find(
  //         (m) => m.role === "tool" && m.parts.some((p) => p.toolResponse)
  //       )
  //       ?.parts.find((p) => p.toolResponse);
  //     if (toolResponsePart && toolResponsePart.toolResponse) {
  //       const toolName = toolRequest.parts.find((p) => p.toolRequest)?.toolRequest
  //         ?.name;

  //       if (toolName === "createTransactionFromTextTool") {
  //         return {
  //           response: output.response,
  //           transactionData: toolResponsePart.toolResponse.output as any,
  //         };
  //       } else if (toolName === "createCategoryFromTextTool") {
  //         return {
  //           response: output.response,
  //           categoryData: toolResponsePart.toolResponse.output as any,
  //         };
  //       }
  //     }
  //   }

  return {
    response: output.response || "",
  };
}
