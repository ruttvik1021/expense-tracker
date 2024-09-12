import AddTransaction from "../addTransactionButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Car } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TransactionsList = () => {
  const currentTransactions = [
    {
      id: 1,
      category: {
        id: 3,
        category: "Transportation",
        budget: 300,
        spending: 280,
        icon: Car,
      },
      amount: 50,
      date: "2023-06-01",
      description: "Weekly groceries Weekly groceries",
    },
  ];
  return (
    <div>
      <div className="flex justify-end"></div>
      <Card>
        <CardContent>
          <Table className="overflow-auto">
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={""} />
                              <AvatarFallback>
                                {transaction.category.category}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background">
                            <Label className="text-primary">
                              {transaction.category.category}
                            </Label>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Label className="text-wrap">
                        {transaction.description}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* <div className="flex justify-between items-center mt-4">
            Pagination
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsList;
