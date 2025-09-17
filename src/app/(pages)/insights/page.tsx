"use client";

import PageHeader from "@/components/common/Pageheader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState, useTransition } from "react";
import {
  Loader2,
  Sparkles,
  Newspaper,
  Film,
  Utensils,
  CalendarSearch,
  Link as LinkIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTransactions } from "@/components/transactions/hooks/useTransactionQuery";
import { useCategories } from "@/components/category/hooks/useCategoryQuery";
import {
  getArticles,
  getSuggestions,
  streamSpendingSummary,
} from "@/ai/flows/proactive-insights";

const suggestionIcons = {
  Dining: <Utensils className="h-4 w-4" />,
  Movie: <Film className="h-4 w-4" />,
  Concert: <CalendarSearch className="h-4 w-4" />,
  Event: <CalendarSearch className="h-4 w-4" />,
};

export default function InsightsPage() {
  const [summary, setSummary] = useState("");
  const [articles, setArticles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isPending, startTransition] = useTransition();

  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (!transactions || !categories) return;

    const allTransactions = transactions.transactions || [];
    const allCategories = categories.categories || [];

    const currentMonthTransactionData = allTransactions
      .map((t) => `${t.amount}|${t.spentOn}|${t.date.split("T")[0]}`)
      .join("\n");

    const currentMonthCategoryData = allCategories
      .map((c) => `${c.category}|${c.budget}`)
      .join("\n");

    const input = {
      currentMonthTransactions: JSON.stringify(currentMonthTransactionData),
      currentMonthCategories: JSON.stringify(currentMonthCategoryData),
      lastMonthTransactions: "",
    };

    startTransition(async () => {
      // 1️⃣ Stream summary
      setSummary("");
      const stream = await streamSpendingSummary(input);
      for await (const chunk of stream) {
        setSummary((prev) => prev + (chunk.text ?? ""));
      }

      // 2️⃣ Fetch articles
      const articlesOutput = await getArticles(input);
      setArticles(articlesOutput.articles);

      // 3️⃣ Fetch suggestions
      const suggestionsOutput = await getSuggestions(input);
      setSuggestions(suggestionsOutput.suggestions);
    });
  }, [transactions, categories]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader title="AI Insights" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle>Your Proactive Financial Insights</CardTitle>
            </div>
            <CardDescription>
              AI-powered analysis of your recent spending habits.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isPending ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">
                  Analyzing your financial data...
                </p>
              </div>
            ) : (<>
              {/* Spending Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Spending Summary</h3>
                {summary ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>
                ) : (
                  <div className="flex items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-muted-foreground">Analyzing your spending...</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Articles */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Newspaper /> Helpful Articles
                </h3>
                {articles.length > 0 ? (
                  <div className="space-y-3">
                    {articles.map((article) => (
                      <a
                        href={article.url}
                        key={article.title}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg hover:bg-muted/50 transition-colors border"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{article.title}</p>
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading articles...</p>
                )}
              </div>

              <Separator />

              {/* Suggestions */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Utensils /> Personalized Suggestions
                </h3>
                {suggestions.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {suggestions.map((suggestion) => (
                      <a
                        key={suggestion.name}
                        href={`https://www.google.com/search?q=${encodeURIComponent(
                          suggestion.type + " " + suggestion.name
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:bg-muted/50 transition-colors rounded-lg border"
                      >
                        <Card className="h-full">
                          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                            {suggestionIcons[suggestion.type]}
                            <CardTitle className="text-base">{suggestion.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.description}
                            </p>
                          </CardContent>
                        </Card>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading suggestions...</p>
                )}
              </div>
            </>)}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
