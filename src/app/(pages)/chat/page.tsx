"use client";

import { chat } from "@/ai/flows/chat-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Menu, PlusCircle, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { categoryFormInitialValues } from "@/components/category/categoryForm";
import { useCategoryMutation } from "@/components/category/hooks/useCategoryMutation";
import { useCategories } from "@/components/category/hooks/useCategoryQuery";
import { ConversationsSidebar } from "@/components/conversations/sidebar";
import Loader from "@/components/loader/loader";
import { useSources } from "@/components/paymentSources/hooks/useSourcesQuery";
import { useTransactionMutation } from "@/components/transactions/hooks/useTransactionMutation";
import { useTransactions } from "@/components/transactions/hooks/useTransactionQuery";
import { transactionFormInitialValues } from "@/components/transactions/transactionForm";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useConversationMutation } from "./hooks/useConversationMutation";
import {
  useGetConversationById,
  useGetConversations,
} from "./hooks/useConversationQuery";

type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
  // AI can return these when a transaction/category is ready for confirmation
  transactionData?: any | null;
  categoryData?: any | null;
};

export const maxDuration = 60; // Timeout in seconds

export default function ChatPage() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  // const [contextRange, setContextRange] = useState("current-month");
  const [isPending, startTransition] = useTransition();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null); // saved conversation ID
  const [saveEnabled, setSaveEnabled] = useState(false);

  const { addTransaction } = useTransactionMutation();
  const { addCategory } = useCategoryMutation();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: sources, isLoading: isSourcesLoading } = useSources();
  const { data: transactions, isLoading: isTransactionsLoading } =
    useTransactions();
  const { data: conversations } = useGetConversations();
  const { data: conversationById, isLoading: isConversationByIdLoading } =
    useGetConversationById(conversationId);
  const {
    addSavedConversation,
    deleteSavedConversation,
    updateSavedConversationMutation,
  } = useConversationMutation();

  const allTransactions = transactions?.transactions || [];
  const allCategories = categories?.categories || [];
  const allSavedConversation = conversations || [];

  useEffect(() => {
    if (conversationById?.data) {
      setHistory(JSON.parse(conversationById.data?.history));
    }
  }, [conversationById]);

  const saveConversation = async (updatedHistory: ChatMessage[]) => {
    if (!saveEnabled || updatedHistory.length === 0) return;

    try {
      if (!conversationId) {
        const res = await addSavedConversation.mutateAsync({
          history: updatedHistory,
          title: updatedHistory[0]?.parts[0]?.text.slice(0, 50) || "New Chat",
        });
        if ("conversation" in res && res.conversation?._id) {
          setConversationId(res.conversation._id);
        }
      } else {
        await updateSavedConversationMutation.mutateAsync({
          conversationId,
          history: updatedHistory,
        });
      }
    } catch (err) {
      console.error("Failed to save conversation", err);
    }
  };

  useEffect(() => {
    const handleSaveToggle = async () => {
      if (saveEnabled) {
        await saveConversation(history);
      } else {
        if (conversationId) {
          await deleteSavedConversation.mutateAsync(conversationId);
        }
      }
    };

    handleSaveToggle();
  }, [saveEnabled]);

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
    const messageToSend = newMessage || message;
    if (!messageToSend.trim()) return;

    // 1. Create the new user message
    const userMessage: ChatMessage = {
      role: "user",
      parts: [{ text: messageToSend }],
    };

    // 2. Optimistically update the UI with the user's message
    const newHistoryForUI = [...history, userMessage];
    setHistory(newHistoryForUI);
    setMessage("");

    startTransition(async () => {
      // 3. Call the server action.
      // We pass the *original* history (before adding the new user message)
      // as this is what the AI agent expects.
      try {
        const aiResponse = await chat({
          history: history, // <-- Pass the original history
          message: messageToSend, // <-- Pass the new message
          transactionContext: String(currentMonthTransactionData),
          availableCategories: String(currentMonthCategoryData),
          availablePaymentMethods: String(paymentSources),
        });

        // 4. Create the final history with the AI's response
        const updatedHistory: ChatMessage[] = [
          ...newHistoryForUI, // This is the history with the user's new message
          {
            role: "model",
            parts: [{ text: aiResponse.response }],
            transactionData: aiResponse?.transactionData, // This will be populated by the agent when ready
            categoryData: aiResponse?.categoryData, // This will be populated by the agent when ready
          },
        ];

        // 5. Set the final state and save
        setHistory(updatedHistory);
        await saveConversation(updatedHistory);
      } catch (error) {
        console.error("Chat error:", error);
        toast.error("Failed to send message. Please try again.");
        // Revert the optimistic update
        setHistory(history);
      }
    });
  };

  const handleCreateTransaction = async (
    transactionData: NonNullable<ChatMessage["transactionData"]>,
    index: number
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

          removeDataFromMessage(index, "transaction");
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
    categoryData: NonNullable<ChatMessage["categoryData"]>,
    index: number
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

        removeDataFromMessage(index, "category");
        handleSendMessage("Category added successfully");
      } catch (error) {
        toast.error("Failed to add category.");
      }
    });
  };

  const removeDataFromMessage = (
    index: number,
    type: "transaction" | "category"
  ) => {
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const msg = { ...newHistory[index] };

      if (type === "transaction") {
        msg.transactionData = null;
      } else {
        msg.categoryData = null;
      }

      newHistory[index] = msg;
      return newHistory;
    });
  };

  const handleSelectSavedConversation = (
    hist: ChatMessage[],
    convId: string
  ) => {
    setHistory(hist);
    setConversationId(convId);
    setSaveEnabled(true);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteSavedConversation.mutateAsync(id);
    startNewChat();
  };

  const startNewChat = () => {
    setConversationId("");
    setHistory([]);
    setSaveEnabled(false);
  };

  const isNewFlowEnabled = true;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden sm:block">
        <ConversationsSidebar
          allSavedConversation={allSavedConversation}
          handleSelectSavedConversation={handleSelectSavedConversation}
          handleDeleteConversation={handleDeleteConversation}
          startNewChat={startNewChat}
          selectedConversationId={conversationId || undefined}
        />
      </div>
      <div className="flex flex-col flex-1 h-full">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile toggle is rendered inside ConversationsSidebar */}
            <div className="block sm:hidden">
              <ConversationsSidebar
                allSavedConversation={allSavedConversation}
                handleSelectSavedConversation={handleSelectSavedConversation}
                handleDeleteConversation={handleDeleteConversation}
                startNewChat={startNewChat}
                selectedConversationId={conversationId || undefined}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="save-toggle"
                checked={saveEnabled}
                onCheckedChange={setSaveEnabled}
              />
              <Label
                htmlFor="save-toggle"
                className="text-xs sm:text-sm font-medium"
              >
                Save
              </Label>
            </div>
          </div>
        </div>

        {/* Scrollable chat messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground px-4">
              <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-primary/70" />
              <p className="mt-4 text-base sm:text-lg font-semibold">
                No messages yet.
              </p>
              <p className="text-xs sm:text-sm max-w-md mx-auto mt-2">
                Start the conversation by asking something like:
                <br />
                <em className="mt-3 block text-muted-foreground/80">
                  &quot;How much did I spend on dining out this month?&quot;
                </em>
                <em className="mt-2 block text-muted-foreground/80">
                  &quot;Add 50 rupees for coffee&quot;
                </em>
                {(isTransactionsLoading ||
                  isCategoriesLoading ||
                  isSourcesLoading) && (
                  <em className="mt-3 block text-primary">
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
                  "flex items-start gap-2 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === "user" ? "justify-end" : ""
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-md rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                  </div>
                  {msg.transactionData && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 w-full sm:w-auto"
                      onClick={() =>
                        handleCreateTransaction(msg.transactionData!, index)
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
                      className="mt-3 w-full sm:w-auto"
                      onClick={() =>
                        handleCreateCategory(msg.categoryData!, index)
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Confirm Category
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {isPending && (
            <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="max-w-[85%] sm:max-w-md rounded-lg bg-muted px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 sm:p-6">
          <Input
            className="w-full"
            type="textarea"
            placeholder="Ask a question or add a transaction..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !isPending && handleSendMessage()
            }
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}
