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
  prompt: z.string().describe("The full prompt for the AI model."),
});

const HistoryPartSchema = z.object({
  text: z.string().optional(),
  // When the model wants to call a tool
  toolRequest: z
    .object({
      name: z.string(),
      arguments: z.record(z.any()).optional(),
    })
    .optional(),
  // When a tool returns output
  toolResponse: z
    .object({
      output: z.any().optional(),
    })
    .optional(),
});

const HistoryMessageSchema = z.object({
  role: z.enum(["user", "model", "tool"]),
  parts: z.array(HistoryPartSchema),
});

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response message."),
  history: z.array(HistoryMessageSchema).optional(),
  transactionData: z
    .object({
      description: z.string().optional(),
      amount: z.number().optional(),
      category: z.string().optional(),
      date: z.string().optional(),
      type: z.enum(["income", "expense"]).optional(),
      spentOn: z.string().optional(),
      source: z.string().optional(),
    })
    .optional(),
  categoryData: z
    .object({
      name: z.string(),
      icon: z.string(),
      budget: z.number().optional(),
      periodType: z
        .enum(["once", "monthly", "quarterly", "half-yearly"])
        .optional(),
      startMonth: z.number().optional(),
      creationDuration: z.enum(["next12Months", "yearEnd"]).optional(),
    })
    .optional(),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
  name: "chatPrompt",
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  tools: [createTransactionFromTextTool, createCategoryFromTextTool],
  returnToolRequests: true,
  prompt: `{{{prompt}}}`,
});

export async function chat(input: {
  history: { role: "user" | "model"; parts: { text: string }[] }[];
  message: string;
  transactionContext: string;
  availableCategories: string;
  availablePaymentMethods: string;
}): Promise<ChatOutput> {
  // 1. Format the raw chat history into a simple string.
  const formattedHistory = input.history
    .map((msg) => {
      const prefix = msg.role === "user" ? "User:" : "AI:";
      return `${prefix} ${msg.parts[0].text}`;
    })
    .join("\n");

  // 2. Construct the full prompt string.
  const systemMessage = `You are a friendly and helpful finance expert and financial advisor.  
Your goals:
• Answer the user's questions about their finances based on their chat history and the provided transaction data.  
• Provide smart financial tips, budgeting advice, and spending insights whenever relevant.  
• The currency is Rupee (₹).
• If confused ask user the tool to be used.

Transaction Handling:
1. If the user asks you to add, create, or record a transaction (e.g., "add a 5 coffee" or "spent 50 on groceries"):
   • Use the 'createTransactionFromTextTool' to extract the details.
   • Ask user about the source, if user denies then proceed with ''.
   • The tool must return: description, amount, category, date, and where possible spentOn and source.
   • If the returned transaction is missing a category, politely ask the user to create a category first.  
     → Guide them to create it by invoking 'createCategoryFromTextTool' and confirming the details.  
     → After the category is created, continue with the transaction creation flow.  
   • Once all details are ready, confirm to the user:  
     “Sure, I can add a transaction for [description] for ₹[amount] in the [category] category (for [spentOn]) (with [source]). Does this look right?”

Category Handling:
2. If the user asks you to create a new category (e.g., "create a new category for Pets"):
   • Use the 'createCategoryFromTextTool' to extract: name, icon, color.
   • Ask user about the budget, periodType, startMonth, creationDuration, if user denies then proceed with 0 budget and periodType as 'ONCE'.
   • Confirm back:  
     “Sure, I can create a new category called “[name]” with the [icon] icon and a [color] color. Suggested budget: ₹[budget] (if provided). Does this look right?”

General Advice:
• Act as a personal financial advisor: offer insights on saving, budgeting, spending patterns, and financial planning whenever useful.
• Keep answers concise and easy to understand.
• Show the Rupee symbol (₹) wherever you mention currency.
`;

  const contextBlock = input.transactionContext
    ? `Here is the user's transaction data for context:\n${input.transactionContext}\n
       Here is the user created categories for expenses: \n${input.availableCategories}\n
       Here is the user created sources for expenses: \n${input.availablePaymentMethods}\n`
    : "";

  const historyBlock = formattedHistory
    ? `Chat History:\n${formattedHistory}\n`
    : "";

  const finalPrompt = `${systemMessage}\n\n${contextBlock}${historyBlock}User's new message:\n${input.message}\n\nYour response:`;

  // 3. Call the prompt.
  const llmResponse: any = await chatPrompt({
    prompt: finalPrompt,
  });

  // 🧠 Extract model message
  const modelMessage = llmResponse.messages.find(
    (m: any) => m.role === "model"
  );

  if (!modelMessage) {
    return {
      response: "Sorry, I couldn't generate a response.",
      history: [],
    };
  }

  // 🔍 Find text and tool request
  const responseText = modelMessage.content.find((c: any) => c.text)?.text;
  const toolRequest = modelMessage.content.find(
    (c: any) => c.toolRequest
  )?.toolRequest;

  if (!responseText && !toolRequest) {
    return {
      response: "I'm not sure how to help with that.",
      history: [],
    };
  }

  // 🧰 Handle tool requests
  if (toolRequest?.name === "createTransactionFromTextTool") {
    const transactionResult = await createTransactionFromTextTool.run(
      toolRequest.input ?? {}
    );

    const txn = transactionResult?.result;

    if (!txn) {
      return {
        response: `It looks like the transaction is missing important imformation. Eg: I spent 100 on Pizza via UPI`,
      };
    }

    if (!txn?.amount) {
      return {
        response: `How much amount you want to add to this transaction?`,
      };
    }

    if (!txn?.category) {
      return {
        response: `What category should this ₹${txn?.amount} expense fall under? For example: ${input.availableCategories}.`,
      };
    }

    if (!txn?.description) {
      return {
        response: `What did you spend ₹${txn?.amount} on? Please give a short description.`,
      };
    }

    if (!txn?.source) {
      return {
        response: `Where did the money come from? E.g., ${input.availablePaymentMethods}.`,
      };
    }

    return {
      response: `Sure, I can add a transaction for ${txn.description} for ₹${
        txn.amount
      } in the ${txn.category} ${
        txn.source ? `with ${txn.source}` : ""
      }. Does this look right?`,
      transactionData: txn,
    };
  }

  if (toolRequest?.name === "createCategoryFromTextTool") {
    const categoryResult = await createCategoryFromTextTool.run(
      toolRequest.input ?? {}
    );

    return {
      response: `Sure, I can create a new category called “${
        categoryResult.result.name
      }” with the ${categoryResult.result.icon} icon ${
        categoryResult.result?.budget
          ? `. Suggested budget: ₹${categoryResult.result?.budget}`
          : ""
      }. Does this look right?`,
      categoryData: categoryResult.result,
    };
  }

  // ✅ Default: just return model text
  return {
    response: responseText ?? "Here's something to help you get started.",
  };
}
