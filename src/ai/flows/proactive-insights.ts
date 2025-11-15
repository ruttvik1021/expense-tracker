"use server";

/**
 * @fileOverview A flow for providing proactive, personalized financial insights based on spending history.
 *
 * - getProactiveInsights - A comprehensive financial analysis function that generates
 *   spending summaries, actionable recommendations, and financial health metrics.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ProactiveInsightsInputSchema = z.object({
  currentMonthTransactions: z
    .string()
    .describe("A record of transactions from the current month."),
  currentMonthCategories: z
    .string()
    .describe("A record of categories with budgets from the current month."),
  lastMonthTransactions: z
    .string()
    .describe("A record of transactions from the last month."),
  budget: z.string().describe("Total monthly budget allocated."),
});
export type ProactiveInsightsInput = z.infer<
  typeof ProactiveInsightsInputSchema
>;

const ProactiveInsightsOutputSchema = z.object({
  spendingSummary: z
    .string()
    .describe(
      "A comprehensive, actionable financial analysis comparing spending patterns and providing personalized recommendations."
    ),
});
export type ProactiveInsightsOutput = z.infer<
  typeof ProactiveInsightsOutputSchema
>;

/* ---------- Public API ---------- */

export async function getProactiveInsights(
  input: ProactiveInsightsInput
): Promise<ProactiveInsightsOutput> {
  return proactiveInsightsFlow(input);
}

/* ---------- Internal prompt & flow ---------- */

const summaryPrompt = ai.definePrompt({
  name: "proactiveInsightsSummaryPrompt",
  input: { schema: ProactiveInsightsInputSchema },
  output: {
    schema: z.object({
      spendingSummary: z.string(),
    }),
  },
  //   prompt: `You are an expert financial advisor analyzing a user's spending patterns. Generate a comprehensive, personalized financial insights report in pure Markdown format.

  // ---
  // ### 💰 Financial Data

  // **Current Month Transactions:**
  // (Format: amount | description | date)
  // {{{currentMonthTransactions}}}

  // **Category Budgets:**
  // (Format: categoryId | categoryName | budget)
  // {{{currentMonthCategories}}}

  // **Last Month Transactions:**
  // (Format: amount | description | date)
  // {{{lastMonthTransactions}}}

  // **Monthly Budget:**
  // {{{budget}}}

  // ---

  // ### 📋 Report Structure

  // Generate a well-formatted Markdown report with the following sections:

  // #### 1. 📊 **Executive Summary**
  // - Total spending this month (₹)
  // - Comparison with last month (% increase/decrease)
  // - Budget utilization percentage
  // - Net position (under/over budget)
  // - Quick verdict: "Excellent", "Good", "Needs Attention", or "Critical"

  // #### 2. 💸 **Top Insights** (3-4 key findings)
  // Identify the most important patterns:
  // - Highest spending category
  // - Biggest increase/decrease compared to last month
  // - Any concerning trends
  // - Positive improvements if any

  // #### 3. 📂 **Category Health Analysis**
  // For each category, provide:
  // - **Healthy** 🟢: Spending is within budget (<95%)
  // - **Watchful** 🟡: Spending is 95-110% of budget OR showing upward trend
  // - **Not-so-healthy** 🔴: Spending is >110% of budget OR has unusual large transactions

  // For Watchful and Not-so-healthy categories:
  // - Current spending vs. budget
  // - Reason for the status
  // - **Actionable tip** (1-2 sentences)

  // #### 4. 📈 **Spending Trends & Patterns**
  // - Weekly/daily spending patterns
  // - Unusual transactions or spikes
  // - Recurring expenses identified
  // - Comparison with previous month trends

  // #### 5. 💡 **Smart Recommendations** (4-5 actionable tips)
  // Provide specific, personalized suggestions:
  // - Budget adjustments
  // - Money-saving opportunities
  // - Spending habit improvements
  // - Emergency fund guidance
  // - Investment/savings suggestions

  // #### 6. 🎯 **Action Items for Next Week**
  // List 3-4 immediate, specific actions the user can take.

  // ---

  // ### ✅ Quality Guidelines

  // **DO:**
  // - Use **bold** for important numbers and terms
  // - Add ₹ symbol for all amounts
  // - Be specific with percentages and amounts
  // - Use emojis sparingly (max 1 per section header)
  // - Keep tone friendly but professional
  // - Provide data-driven insights, not generic advice
  // - Calculate accurate percentages and comparisons
  // - Format numbers clearly (e.g., ₹15,430.50)

  // **DON'T:**
  // - Use code blocks or JSON
  // - Give generic advice without data backing
  // - Be judgmental or negative
  // - Exceed 400 words total
  // - Include external links or references
  // - Use complex financial jargon without explanation

  // **Special Cases:**
  // - If no budget is set: Strongly recommend setting one and explain why
  // - If no transactions: Encourage starting to track expenses
  // - If over budget significantly (>120%): Provide urgent tips with empathy
  // - If under budget: Congratulate but suggest savings/investment options

  // **Format:**
  // - Use ## for main section headers
  // - Use **bold** for emphasis
  // - Use bullet points (•) for lists
  // - Use > for important callouts or quotes
  // - Keep paragraphs short (2-3 lines max)

  // Generate a report that feels like advice from a caring financial advisor who knows the user's specific situation.`,
  prompt: `You are conducting a financial audit for a user. Prepare a structured, objective Markdown report.

Data:
- Current Transactions: {{{currentMonthTransactions}}}
- Budgets: {{{currentMonthCategories}}}
- Last Month: {{{lastMonthTransactions}}}
- Monthly Budget: {{{budget}}}

Sections:
1. Executive Summary  
2. Key Financial Observations  
3. Category Performance Review only for categories with more than 75% spent
4. Spending Variance & Trend Analysis  
5. Recommendations for Optimization  
6. Action Points

Follow these rules:
- Only Markdown, no code blocks
- Keep language factual and precise
- Use ₹ for all amounts
- Use bullets, short paragraphs, and bold data points
- Use icons only in section headers
- Max 400 words
- Add extra line breaks between sections
`,
});

// Flow: use the summary prompt with enhanced error handling
const proactiveInsightsFlow = ai.defineFlow(
  {
    name: "proactiveInsightsFlow",
    inputSchema: ProactiveInsightsInputSchema,
    outputSchema: ProactiveInsightsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await summaryPrompt(input);

      // Fallback if output is empty or invalid
      if (
        !output ||
        !output.spendingSummary ||
        output.spendingSummary.trim().length < 50
      ) {
        return {
          spendingSummary: generateFallbackSummary(input),
        };
      }

      return {
        spendingSummary: output.spendingSummary,
      };
    } catch (error) {
      console.error("Error generating proactive insights:", error);
      return {
        spendingSummary: generateFallbackSummary(input),
      };
    }
  }
);

// Fallback summary generator
function generateFallbackSummary(input: ProactiveInsightsInput): string {
  const hasTransactions =
    input.currentMonthTransactions &&
    input.currentMonthTransactions.trim().length > 0;
  const hasBudget =
    input.budget && input.budget.trim().length > 0 && input.budget !== "0";

  if (!hasTransactions) {
    return `## 📊 Welcome to Your Financial Dashboard!

### Getting Started
You haven't recorded any transactions yet. Start tracking your expenses to get personalized insights!

**Quick Actions:**
• Add your first transaction to see where your money goes
• Set up categories for better organization
• Configure your monthly budget
• Track both income and expenses

> 💡 **Tip:** Regular tracking leads to better financial decisions!`;
  }

  if (!hasBudget) {
    return `## 📊 Financial Insights

### ⚠️ Set Your Budget
You have transactions recorded, but no monthly budget set. Setting a budget helps you:
• Track spending limits
• Identify overspending early
• Plan savings better
• Make informed financial decisions

**Action Required:** Update your budget from your profile settings to get detailed insights!

> 💡 **Recommendation:** A good starting point is the 50/30/20 rule - 50% needs, 30% wants, 20% savings.`;
  }

  return `## 📊 Financial Insights

### Summary
Your spending data is being analyzed. Here are some general recommendations:

**Best Practices:**
• Review your transactions weekly
• Set realistic category budgets
• Track both fixed and variable expenses
• Build an emergency fund (3-6 months expenses)
• Consider the 50/30/20 budgeting rule

**Next Steps:**
• Categorize all transactions
• Set monthly budget targets
• Review spending patterns regularly
• Identify areas to reduce costs

> 💡 Keep tracking consistently for more personalized insights!`;
}
