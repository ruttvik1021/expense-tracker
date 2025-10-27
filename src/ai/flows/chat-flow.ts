// "use server";
// /**
//  * @fileOverview A conversational AI flow for answering financial questions and creating transactions or categories.
//  *
//  * - chat - A function that handles the conversational chat logic.
//  * - ChatOutput - The return type for the chat function.
//  */

// import { ai } from "@/ai/genkit";
// import { z } from "genkit";
// import { createTransactionFromTextTool } from "./create-transaction-from-text";
// import { createCategoryFromTextTool } from "./create-category-from-text";

// const ChatInputSchema = z.object({
//   prompt: z.string().describe("The full prompt for the AI model."),
// });

// const HistoryPartSchema = z.object({
//   text: z.string().optional(),
//   // When the model wants to call a tool
//   toolRequest: z
//     .object({
//       name: z.string(),
//       arguments: z.record(z.any()).optional(),
//     })
//     .optional(),
//   // When a tool returns output
//   toolResponse: z
//     .object({
//       output: z.any().optional(),
//     })
//     .optional(),
// });

// const HistoryMessageSchema = z.object({
//   role: z.enum(["user", "model", "tool"]),
//   parts: z.array(HistoryPartSchema),
// });

// const ChatOutputSchema = z.object({
//   response: z.string().describe("The AI's response message."),
//   history: z.array(HistoryMessageSchema).optional(),
//   transactionData: z
//     .object({
//       description: z.string().optional(),
//       amount: z.number().optional(),
//       category: z.string().optional(),
//       date: z.string().optional(),
//       type: z.enum(["income", "expense"]).optional(),
//       spentOn: z.string().optional(),
//       source: z.string().optional(),
//     })
//     .optional(),
//   categoryData: z
//     .object({
//       name: z.string(),
//       icon: z.string(),
//       budget: z.number().optional(),
//       periodType: z
//         .enum(["once", "monthly", "quarterly", "half-yearly"])
//         .optional(),
//       startMonth: z.number().optional(),
//       creationDuration: z.enum(["next12Months", "yearEnd"]).optional(),
//     })
//     .optional(),
// });

// export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// const chatPrompt = ai.definePrompt({
//   name: "chatPrompt",
//   input: { schema: ChatInputSchema },
//   output: { schema: ChatOutputSchema },
//   tools: [createTransactionFromTextTool, createCategoryFromTextTool],
//   returnToolRequests: true,
//   prompt: `{{{prompt}}}`,
// });

// export async function chat(input: {
//   history: { role: "user" | "model"; parts: { text: string }[] }[];
//   message: string;
//   transactionContext: string;
//   availableCategories: string;
//   availablePaymentMethods: string;
// }): Promise<ChatOutput> {
//   // 1. Format the raw chat history into a simple string.
//   const formattedHistory = input.history
//     .map((msg) => {
//       const prefix = msg.role === "user" ? "User:" : "AI:";
//       return `${prefix} ${msg.parts[0].text}`;
//     })
//     .join("\n");

//   // 2. Construct the full prompt string.
//   const systemMessage = `You are a friendly and helpful finance expert and financial advisor.  
// Your goals:
// • Answer the user's questions about their finances based on their chat history and the provided data.  
// • Provide smart financial tips, budgeting advice, and spending insights whenever relevant.  
// • The currency is Rupee (₹).
// • If confused ask user the tool to be used.

// Transaction Handling:
// 1. If the user asks you to add, create, or record a transaction (e.g., "add a 5 coffee" or "spent 50 on groceries"):
//    • Use the 'createTransactionFromTextTool' to extract the details.
//    • Ask user about the source, if user denies then proceed with ''.
//    • The tool must return: description, amount, category, date, and where possible spentOn and source.
//    • If the returned transaction is missing a category, politely ask the user to create a category first.  
//      → Guide them to create it by invoking 'createCategoryFromTextTool' and confirming the details.  
//      → After the category is created, automatically continue with the transaction creation flow using the original transaction details provided by the user.  
//      → Do not wait for the user to retype the transaction. Instead, intelligently resume the flow and ask for any remaining missing details if needed.  
//      → For example, if the user previously tried to add a ₹300 transaction to a category that didn't exist (e.g., "pets"), and then confirms or says "Category added successfully", you should treat this as a signal to retry creating the transaction now that the category exists.

//    • Once all details are ready, confirm to the user:  
//      “Sure, I can add a transaction for [description] for ₹[amount] in the [category] category (for [spentOn]) (with [source]). Does this look right?”
//    → After confirming the transaction, follow up by asking: “Is there anything else I can help you with?”

// Category Handling:
// 2. If the user asks you to create a new category (e.g., "create a new category for Pets"):
//    • Use the 'createCategoryFromTextTool' to extract: name, icon, color.
//    • Ask user about the budget, periodType, startMonth, creationDuration, if user denies then proceed with 0 budget and periodType as 'ONCE'.
//    • Confirm back:  
//      “Sure, I can create a new category called “[name]” with the [icon] icon and a [color] color. Suggested budget: ₹[budget] (if provided). Does this look right?”
//    → After confirming the category, if any previous task (e.g., a transaction creation) was interrupted due to missing category, resume that task automatically. Otherwise, follow up by asking: “Is there anything else I can help you with?”

// General Advice:
// • Act as a personal financial advisor: offer insights on saving, budgeting, spending patterns, and financial planning whenever useful.
// • Keep answers concise and easy to understand.
// • Show the Rupee symbol (₹) wherever you mention currency.

// Always remember:
// - Resume any previously paused flows (like transaction creation) if a dependency (e.g. category or source) is now resolved.
// - Otherwise, politely ask “Is there anything else I can help you with?” to keep the conversation going.

// Note: Strictly return message as a formatted markdown directly.
// `;

//   const contextBlock = input.transactionContext
//     ? `Here is the user's transaction data for context:\n${input.transactionContext}\n
//        Here is the user created categories for expenses: \n${input.availableCategories}\n
//        Here is the user created sources for expenses: \n${input.availablePaymentMethods}\n`
//     : "";

//   const historyBlock = formattedHistory
//     ? `Chat History:\n${formattedHistory}\n`
//     : "";

//   const finalPrompt = `${systemMessage}\n\n${contextBlock}${historyBlock}User's new message:\n${input.message}\n\nYour response:`;

//   // 3. Call the prompt.
//   const llmResponse = await chatPrompt({
//     prompt: finalPrompt,
//   });

//   // 🧠 Extract model message
//   const modelMessage = llmResponse?.messages?.find(
//     (m: any) => m.role === "model"
//   );

//   if (!modelMessage) {
//     return {
//       response: "Sorry, I couldn't generate a response.",
//       history: [],
//     };
//   }

//   // 🔍 Find text and tool request
//   const responseText =
//     llmResponse?.output?.response ||
//     modelMessage?.content?.find((c: any) => c.text)?.text;
//   const toolRequest = modelMessage.content.find(
//     (c: any) => c.toolRequest
//   )?.toolRequest;

//   if (!responseText && !toolRequest) {
//     return {
//       response: "I'm not sure how to help with that.",
//       history: [],
//     };
//   }

//   // 🧰 Handle tool requests
//   if (toolRequest?.name === "createTransactionFromTextTool") {
//     const transactionResult = await createTransactionFromTextTool.run({
//       text: input.message, // or another parsed value from history
//       availableCategories:
//         input.availableCategories
//           ?.split("\n")
//           .map((line) => line.split("|")[1] || "") ?? [],
//       availablePaymentSources: input.availablePaymentMethods?.split("\n") ?? [],
//     });

//     const txn = transactionResult?.result;

//     if (!txn?.amount || !txn?.category || !txn?.description || !txn?.source) {
//       return {
//         response: `I need more info to complete this transaction.\n
//         ${!txn?.amount ? "- What's the amount?\n" : ""}
//         ${!txn?.category ? "- What category does it fall under?\n" : ""}
//         ${!txn?.description ? "- What was the transaction for?\n" : ""}
//         ${!txn?.source ? "- Where was the money spent from?\n" : ""}
//       `,
//       };
//     }

//     return {
//       response: `Sure, I can add a transaction for ${txn.description} for ₹${
//         txn.amount
//       } in the ${txn.category} ${
//         txn.source ? `with ${txn.source}` : ""
//       }. Does this look right?`,
//       transactionData: txn,
//     };
//   }

//   if (toolRequest?.name === "createCategoryFromTextTool") {
//     const categoryResult = await createCategoryFromTextTool.run({
//       text: input.message,
//       availableCategories:
//         input.availableCategories
//           ?.split("\n")
//           .map((line) => line.split("|")[1] || "") ?? [],
//       availablePaymentSources: input.availablePaymentMethods?.split("\n") ?? [],
//     });

//     return {
//       response: `Sure, I can create a new category called “${
//         categoryResult.result.name
//       }” with the ${categoryResult.result.icon} icon ${
//         categoryResult.result?.budget
//           ? `. Suggested budget: ₹${categoryResult.result?.budget}`
//           : ""
//       }. Does this look right?`,
//       categoryData: categoryResult.result,
//     };
//   }

//   // ✅ Default: just return model text
//   return {
//     response: responseText ?? "Here's something to help you get started.",
//   };
// }


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
  // =================================================================
  // ===           IMPROVED SYSTEM PROMPT (Section 1/2)            ===
  // =================================================================
  // This prompt is clearer, stronger, and more realistic for your
  // application's code structure.
  //
  const systemMessage = `You are a professional, empathetic, and trustworthy financial advisor.
Your primary goal is to help the user manage their finances by providing insightful advice and accurately structuring their data.
The currency is always Rupee (₹).

Your Tasks:

1.  **Answer Financial Questions (Text Response):**
    * If the user asks for advice, insights, or a summary of their spending, use the provided 'Transaction Data' and 'Available Categories' to give a clear, data-driven, and helpful text response.
    * Use this mode if the user is just chatting or asking a general question.

2.  **Detect Tool Use (Tool-Call Response):**
    * If the user's *new message* clearly indicates an intent to create a transaction (e.g., "add 50 for coffee," "spent 200 on groceries") or create a category (e.g., "make a 'Gifts' category"), your *only* action is to call the appropriate tool ('createTransactionFromTextTool' or 'createCategoryFromTextTool').
    * Do NOT chat about it (e.g., "Sure, I can do that..."). Just call the tool.

3.  **Handle Follow-up Information (Text Response):**
    * If the user's *new message* appears to be an answer to a question you asked previously (e.g., history shows you asked "What category?" and the new message is "Groceries"), DO NOT call a tool.
    * Instead, provide a helpful text response that incorporates the new information and asks for any *other* missing pieces (e.g., "Great, got 'Groceries'. What payment source did you use?").

4.  **General Rules:**
    * NEVER invent or guess data (e.g., amounts, category names).
    * Always format your text-only responses using clear markdown.
    * Keep answers concise and easy to understand.
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
  const llmResponse = await chatPrompt({
    prompt: finalPrompt,
  });

  // 🧠 Extract model message
  const modelMessage = llmResponse?.messages?.find(
    (m: any) => m.role === "model"
  );

  if (!modelMessage) {
    return {
      response: "Sorry, I couldn't generate a response.",
      history: [],
    };
  }

  // 🔍 Find text and tool request
  const responseText =
    llmResponse?.output?.response ||
    modelMessage?.content?.find((c: any) => c.text)?.text;
  const toolRequest = modelMessage.content.find(
    (c: any) => c.toolRequest
  )?.toolRequest;

  if (!responseText && !toolRequest) {
    return {
      response: "I'm not sure how to help with that.",
      history: [],
    };
  }

  // =================================================================
  // ===           IMPROVED TOOL LOGIC (Section 2/2)               ===
  // =================================================================
  // This logic is now much more robust. Instead of one generic failure
  // message, it intelligently asks for the *specific* missing piece
  // of information, creating a much better user experience.

  // 🧰 Handle Transaction Tool
  if (toolRequest?.name === "createTransactionFromTextTool") {
    const transactionResult = await createTransactionFromTextTool.run({
      text: input.message, // The tool should be smart enough to use context if needed
      availableCategories:
        input.availableCategories
          ?.split("\n")
          .map((line) => line.split("|")[1] || "") ?? [],
      availablePaymentSources: input.availablePaymentMethods?.split("\n") ?? [],
    });

    const txn = transactionResult?.result;

    // 1. Handle critical missing info
    if (!txn?.amount || !txn?.description) {
      let missingParts = [];
      if (!txn?.amount) missingParts.push("the amount");
      if (!txn?.description) missingParts.push("a description");

      return {
        response: `I'm ready to add that transaction, but I'm missing ${missingParts.join(
          " and "
        )}. Can you provide that?`,
      };
    }

    // 2. Handle missing category
    if (!txn?.category) {
      return {
        response: `Got it: ${txn.description} for ₹${txn.amount}. What category should this go into?`,
        // We return partial data so the client can "hold" it
        transactionData: txn,
      };
    }

    // 3. Handle missing source
    if (!txn?.source) {
      return {
        response: `Okay, I have ${txn.description} for ₹${txn.amount} in the ${txn.category} category. What payment source did you use (e.g., 'Credit Card', 'Cash')?`,
        // Return partial data
        transactionData: txn,
      };
    }

    // 4. Success! All data is present.
    return {
      response: `Sure, I can add a transaction for **${txn.description}** for **₹${
        txn.amount
      }** in the **${txn.category}** category, paid with **${
        txn.source
      }**. Does this look right?`,
      transactionData: txn,
    };
  }

  // 🧰 Handle Category Tool
  if (toolRequest?.name === "createCategoryFromTextTool") {
    const categoryResult = await createCategoryFromTextTool.run({
      text: input.message,
      availableCategories:
        input.availableCategories
          ?.split("\n")
          .map((line) => line.split("|")[1] || "") ?? [],
      availablePaymentSources: input.availablePaymentMethods?.split("\n") ?? [],
    });

    const cat = categoryResult.result;

    // 1. Handle tool failure
    if (!cat?.name || !cat?.icon) {
      return {
        response:
          "Sorry, I wasn't able to extract the details for that category. Could you please try again, for example: 'Create a new category for Groceries with a 🍎 icon'?",
      };
    }

    // 2. Success! Ask for optional budget.
    // The prompt now tells the model to ask this *after* creation,
    // so we bundle it into the confirmation message.
    const budgetMessage = cat.budget
      ? `with a suggested budget of ₹${cat.budget}`
      : "Would you like to set a budget for this category?";

    return {
      response: `Sure, I can create a new category called **“${cat.name}”** with the **${cat.icon}** icon. ${budgetMessage}. Does this look right?`,
      categoryData: cat,
    };
  }

  // ✅ Default: just return model text
  return {
    response:
      responseText ?? "I'm not sure how to help with that, please try again.",
  };
}
