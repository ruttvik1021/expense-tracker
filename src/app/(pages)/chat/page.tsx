"use client";

import { chat } from "@/ai/flows/chat-flow";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2, PlusCircle, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { categoryFormInitialValues } from "@/components/category/categoryForm";
import { useCategoryMutation } from "@/components/category/hooks/useCategoryMutation";
import { useCategories } from "@/components/category/hooks/useCategoryQuery";
import { useSources } from "@/components/paymentSources/hooks/useSourcesQuery";
import { useTransactionMutation } from "@/components/transactions/hooks/useTransactionMutation";
import { useTransactions } from "@/components/transactions/hooks/useTransactionQuery";
import { transactionFormInitialValues } from "@/components/transactions/transactionForm";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
  // AI can return various shapes; keep permissive and cast where needed
  transactionData?: any | null;
  categoryData?: any | null;
};

export const maxDuration = 60; // Timeout in seconds

export default function ChatPage() {
  const { user } = useAuthContext();
  const userName = user?.data?.name || "";
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  // const [contextRange, setContextRange] = useState("current-month");
  const [isPending, startTransition] = useTransition();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: sources, isLoading: isSourcesLoading } = useSources();
  const { data: transactions, isLoading: isTransactionsLoading } =
    useTransactions();
  const allTransactions = transactions?.transactions || [];
  const allCategories = categories?.categories || [];

  const { addTransaction } = useTransactionMutation();
  const { addCategory } = useCategoryMutation();

  const currentMonthTransactionData = allTransactions
    .slice() // clone the array to avoid mutating original
    .sort((a, b) => a.spentOn.localeCompare(b.spentOn)) // sort by `spentOn` (name)
    .map((t) => `${t.amount}|${t.spentOn}|${t.date.split("T")[0]}`)
    .join("\n");

  const currentMonthCategoryData = allCategories
    .slice()
    .sort((a, b) => a.category.localeCompare(b.category)) // sort by `category` (name)
    .map((t) => `${t._id}|${t.category}|${t.budget}`)
    .join("\n");

  const paymentSources = sources?.map((item) => item.source).join("\n");

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = (newMessage?: string) => {
    if (!message.trim() && !newMessage) return;

    const userMessage: ChatMessage = {
      role: "user",
      parts: [{ text: newMessage ? newMessage : message }],
    };

    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setMessage("");

    startTransition(async () => {
      const aiResponse = await chat({
        history: newHistory.slice(0, -1), // Pass history without the latest user message
        message,
        transactionContext: String(currentMonthTransactionData),
        availableCategories: String(currentMonthCategoryData),
        availablePaymentMethods: String(paymentSources),
      });

      setHistory((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: aiResponse.response }],
          transactionData: aiResponse.transactionData,
          categoryData: aiResponse.categoryData,
        },
      ]);
    });
  };

  const handleCreateTransaction = async (
    transactionData: NonNullable<ChatMessage["transactionData"]>
  ) => {
    startTransition(async () => {
      const categoryMap = new Map(
        categories?.categories.map((c) => [
          c.category.toLowerCase(),
          (c as any).id || (c as any)._id || c.category,
        ])
      );
      const sourceMap = new Map(
        sources?.map((c) => [
          c.source.toLowerCase(),
          (c as any).id || (c as any)._id || c.source,
        ])
      );

      const { category, description, source, amount } = transactionData;
      const categoryId = categoryMap.get(category.toLowerCase());
      const sourceId = sourceMap.get(source.toLowerCase());

      if (categoryId) {
        try {
          await addTransaction.mutateAsync({
            ...transactionFormInitialValues,
            category: categoryId,
            spentOn: description,
            source: sourceId,
            amount: Number(amount),
          });

          handleSendMessage("Transaction added successfully");
        } catch (error) {
          toast.error("Failed to add transaction.");
        }
      } else {
        toast.error(
          `The category "${category}" doesn't exist. Please create it before adding the transaction.`
        );
      }
    });
  };

  const handleCreateCategory = async (
    categoryData: NonNullable<ChatMessage["categoryData"]>
  ) => {
    startTransition(async () => {
      try {
        await addCategory.mutateAsync({
          budget: categoryFormInitialValues.budget,
          creationDuration: categoryFormInitialValues.creationDuration,
          periodType: categoryFormInitialValues.periodType,
          startMonth: categoryFormInitialValues.startMonth,
          icon: categoryData.icon,
          category: categoryData.name,
        });

        handleSendMessage("Category added successfully");
      } catch (error) {
        toast.error("Failed to add category.");
      }
    });
  };

  return (
    <>
      <div className="flex flex-col h-[80vh]">
        {/* Scrollable chat messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="h-16 w-16" />
              <p className="mt-4 text-lg">No messages yet.</p>
              <p className="text-sm">
                Start the conversation by asking something like:
                <br />
                <em className="mt-2 block">
                  &quot;How much did I spend on dining out this month?&quot;
                </em>
                <em className="mt-2 block">
                  &quot;Ask questions, add transactions, or create
                  categories.&quot;
                </em>
                {(isTransactionsLoading ||
                  isCategoriesLoading ||
                  isSourcesLoading) && (
                  <em className="mt-2 block">
                    Getting your transactional and category context...
                  </em>
                )}
              </p>
            </div>
          ) : (
            history.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-4",
                  msg.role === "user" ? "justify-end" : ""
                )}
              >
                {msg.role === "model" && (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      <Sparkles className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-md rounded-lg px-4 py-3",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                  {msg.transactionData && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() =>
                        handleCreateTransaction(msg.transactionData!)
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Confirm Transaction
                    </Button>
                  )}
                  {msg.categoryData && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleCreateCategory(msg.categoryData!)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Confirm Category
                    </Button>
                  )}
                </div>
                {msg.role === "user" && (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{userName.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}

          {isPending && (
            <div className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  <Sparkles className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-md rounded-lg bg-muted px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed input bar at the bottom */}
        <div className="border-t p-4 flex flex-col sm:flex-row gap-3">
          <Input
            className="w-full sm:flex-[4_1_0%]"
            type="text"
            placeholder="Ask a question or add a transaction..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !isPending && handleSendMessage()
            }
            disabled={isPending}
          />
          <Button
            size="icon"
            className="w-full sm:flex-[1_1_0%]"
            onClick={() => handleSendMessage()}
            disabled={
              isPending ||
              !message.trim() ||
              isTransactionsLoading ||
              isCategoriesLoading
            }
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
