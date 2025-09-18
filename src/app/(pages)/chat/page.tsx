"use client";

import { chat } from "@/ai/flows/chat-flow";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/common/Pageheader";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  Loader2,
  MessageCircle,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import type { ITransaction } from "@/utils/types/transactionTypes";
import type { ICategory } from "@/utils/types/categoryTypes";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCategories } from "@/components/category/hooks/useCategoryQuery";
import { useTransactions } from "@/components/transactions/hooks/useTransactionQuery";
import ResponsiveDialogAndDrawer from "@/components/responsiveDialogAndDrawer";
import TransactionForm from "@/components/transactions/transactionForm";
import ReactMarkdown from "react-markdown";

type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
  // AI can return various shapes; keep permissive and cast where needed
  transactionData?: any | null;
  categoryData?: any | null;
};

type PendingTransaction = any | null;

export const maxDuration = 60; // Timeout in seconds

export default function ChatPage() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  // const [contextRange, setContextRange] = useState("current-month");
  const [isPending, startTransition] = useTransition();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions();
  const allTransactions = transactions?.transactions || [];
  const allCategories = categories?.categories || [];
  const [isTransactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<ITransaction | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<ICategory> | null>(
    null
  );

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

  const [pendingTransaction, setPendingTransaction] =
    useState<PendingTransaction | null>(null);

  console.log("unused", {
    isCategoryDialogOpen,
    newCategory,
    pendingTransaction,
  });

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const formatTransactionsForContext = (
    transactions: ITransaction[]
  ): string => {
    return transactions
      .map((t) => {
        const desc = t.spentOn || t.category || "";
        return `${format(
          new Date(t.date),
          "yyyy-MM-dd"
        )}: ${desc} - $${t.amount.toFixed(2)}`;
      })
      .join("\n");
  };

  const getFilteredTransactions = async () => {
    const allTransactions = transactions?.transactions || [];
    const startDate = new Date();

    // if (contextRange === "current-month") {
    //   startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    // } else if (contextRange === "last-3-months") {
    //   startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    // } else if (contextRange === "last-6-months") {
    //   startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    // } else if (contextRange === "last-12-months") {
    //   startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    // }

    return allTransactions.filter((t) => new Date(t.date) >= startDate);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      parts: [{ text: message }],
    };

    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setMessage("");

    startTransition(async () => {
      const filteredTransactions = await getFilteredTransactions();
      const transactionContext =
        formatTransactionsForContext(filteredTransactions);

      console.log("transactionContext", transactionContext);

      const aiResponse = await chat({
        history: newHistory.slice(0, -1), // Pass history without the latest user message
        message,
        transactionContext: String(currentMonthTransactionData),
        availableCategories: String(currentMonthCategoryData),
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

  const handleCreateTransaction = (
    transactionData: NonNullable<ChatMessage["transactionData"]>
  ) => {
    const categoryMap = new Map(
      categories?.categories.map((c) => [
        c.category.toLowerCase(),
        (c as any).id || (c as any)._id || c.category,
      ])
    );
    const { category, ...rest } = transactionData;
    const categoryId = categoryMap.get(category.toLowerCase());

    if (categoryId) {
      setSelectedTransaction({ ...rest, category: category } as ITransaction);
      setTransactionDialogOpen(true);
    } else {
      // Category does not exist, so we need to create it first
      toast.success(
        `The category "${category}" doesn't exist. Please create it before adding the transaction.`
      );
      setPendingTransaction(transactionData as PendingTransaction);
      setNewCategory({ category }); // Prefill the dialog with the suggested name
      setCategoryDialogOpen(true);
    }
  };

  const handleCreateCategory = (
    categoryData: NonNullable<ChatMessage["categoryData"]>
  ) => {
    setNewCategory(categoryData);
    setCategoryDialogOpen(true);
  };

  //   const handleCategoryCreated = async () => {
  //     if (pendingTransaction) {
  //       const categoryMap = new Map(
  //         (categories?.categories as any[]).map((c) => [
  //           (c.category || (c as any).name).toLowerCase(),
  //           (c as any).id || (c as any)._id,
  //         ])
  //       );
  //       const { category, ...rest } = pendingTransaction;
  //       const newCategoryId = categoryMap.get(category.toLowerCase());

  //       if (newCategoryId) {
  //         setSelectedTransaction({
  //           ...rest,
  //           category: category,
  //         } as ITransaction);
  //         setTransactionDialogOpen(true);
  //       }
  //       setPendingTransaction(null);
  //     }
  //   };

  return (
    <>
      <div>
        <PageHeader title="Chat with AI" />
        <div className="flex-1 overflow-auto">
          {/* <div className="w-48 space-y-2 mb-3">
              <Label htmlFor="context-range">Transaction Context</Label>
              <Select value={contextRange} onValueChange={setContextRange}>
                <SelectTrigger id="context-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">This Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="last-12-months">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          {/* <Card className="flex flex-wrap h-full flex-col"> */}
          {/* <CardHeader className="flex flex-row items-start gap-4">
                
              </CardHeader> */}
          <div
            ref={chatContainerRef}
            className="flex-1 space-y-6 overflow-y-auto p-6 md:h-[80vh] h-[55vh]"
          >
            {history.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16" />
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
                      <AvatarFallback>U</AvatarFallback>
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
          <div className="flex flex-col sm:flex-row w-full border-t p-4 gap-3">
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
              onClick={handleSendMessage}
              disabled={isPending || !message.trim()}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <ResponsiveDialogAndDrawer
        open={isTransactionDialogOpen}
        handleClose={() => setTransactionDialogOpen(!isTransactionDialogOpen)}
        title={"ADD"}
        content={
          selectedTransaction && (
            <TransactionForm
              initialValues={selectedTransaction}
              onReset={() => setTransactionDialogOpen(!isTransactionDialogOpen)}
            />
          )
        }
      />
    </>
  );
}
