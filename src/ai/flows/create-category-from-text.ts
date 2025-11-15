"use server";
/**
 * @fileOverview This file defines a Genkit tool for creating a category from a text string.
 *
 * - `createCategoryFromTextTool`:  A Genkit tool that extracts category details from a string.
 */
import { ai } from "@/ai/genkit";
import { z } from "zod";

const CreateCategoryFromTextInputSchema = z.object({
  text: z
    .string()
    .describe(
      'The user\'s text asking to create a new category (e.g., "create a new category for Pets").'
    ),
});

const CreateCategoryFromTextOutputSchema = z.object({
  name: z.string().describe("The name of the new category."),
  icon: z
    .string()
    .describe("A suggested icon name from the available lucide-react icons."),
  // Fields that map to the Category form and submission payload
  budget: z
    .number()
    .optional()
    .describe("A suggested numeric budget for this category (monthly)."),
  periodType: z
    .enum(["once", "monthly", "quarterly", "half-yearly"]) // align with PeriodType
    .optional()
    .describe(
      "Suggested period type for the category. One of: once, monthly, quarterly, half-yearly."
    ),
  startMonth: z
    .number()
    .optional()
    .describe("If periodic, the suggested start month as a number (1-12)."),
  creationDuration: z
    .enum(["next12Months", "yearEnd"])
    .optional()
    .describe(
      "Suggested creation duration (if periodic). One of: next12Months, yearEnd."
    ),
});

export const createCategoryFromTextTool = ai.defineTool(
  {
    name: "createCategoryFromTextTool",
    description:
      "Extracts category details from a natural language string. Use this when the user wants to add, create, or make a new category.",
    inputSchema: z.object({
      text: z
        .string()
        .describe("The user's raw text input about creating a category."),

      availableCategories: z
        .array(z.string())
        .describe("A list of valid category names to choose from."),

      availablePaymentSources: z
        .array(z.string())
        .describe("A list of available payment methods to choose from."),
    }),
    outputSchema: CreateCategoryFromTextOutputSchema,
  },
  async (input) => {
    // A nested prompt to perform the actual extraction and suggestion logic.
    const extractionPrompt = ai.definePrompt({
      name: "categoryExtractionPrompt",
      input: { schema: CreateCategoryFromTextInputSchema },
      output: { schema: CreateCategoryFromTextOutputSchema },
      prompt: `Extract category details and auto-fill intelligently:

**Required:**
- Name: Category name in Title Case

**Auto-assign:**
- Icon: Choose best-matching emoji based on category name
  Examples: Gym→🏋️, Food→🍔, Travel→✈️, Shopping→🛍️, Bills→📄, Entertainment→🎬, Health→💊, Pets→🐾
- Budget: Suggest reasonable monthly budget (e.g., ₹5000 for Food, ₹3000 for Entertainment, ₹0 if unsure)
- periodType: Default to "monthly"

**Smart Defaults:**
- If "Gym/Fitness" → icon: 🏋️, budget: ₹2000-3000
- If "Food/Groceries" → icon: 🍔, budget: ₹5000-8000  
- If "Transport" → icon: 🚗, budget: ₹2000-4000
- If "Entertainment" → icon: 🎬, budget: ₹2000-3000
- If unclear → icon: 📁, budget: ₹0

**Examples:**
- "create pets category" → name: "Pets", icon: 🐾, budget: 2000
- "add gym" → name: "Gym", icon: 🏋️, budget: 3000
- "new shopping category" → name: "Shopping", icon: 🛍️, budget: 5000

User's text: "{{{text}}}"
        `,
    });

    const { output } = await extractionPrompt(input);
    return output!;
  }
);
