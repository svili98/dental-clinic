import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, type Currency } from "@/lib/currency";
import { usePatientTransactions } from "@/hooks/use-financial";
import { 
  Receipt, 
  CreditCard, 
  RefreshCw, 
  TrendingUp, 
  Clock,
  User,
  FileText
} from "lucide-react";

interface TransactionHistoryProps {
  patientId: number;
}

export function TransactionHistory({ patientId }: TransactionHistoryProps) {
  const { data: transactions, isLoading, refetch } = usePatientTransactions(patientId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="button-refresh-transactions"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions recorded</p>
            <p className="text-sm text-gray-400 mt-1">
              Financial transactions will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'charge':
        return <Receipt className="h-4 w-4 text-blue-600" />;
      case 'refund':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case 'payment':
        return 'default' as const;
      case 'charge':
        return 'secondary' as const;
      case 'refund':
        return 'destructive' as const;
      case 'adjustment':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const getAmountColor = (type: string, amount: number) => {
    if (type === 'payment') {
      return 'text-green-600 dark:text-green-400';
    } else if (type === 'refund') {
      return 'text-red-600 dark:text-red-400';
    } else {
      return amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          data-testid="button-refresh-transactions"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.isArray(transactions) && transactions.map((transaction: any) => (
            <div
              key={transaction.id}
              className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              data-testid={`transaction-${transaction.id}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getTransactionIcon(transaction.type)}
              </div>
              
              <div className="flex-grow space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    {transaction.category && (
                      <Badge 
                        variant={getTransactionBadgeVariant(transaction.type)}
                        className="text-xs"
                      >
                        {transaction.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p 
                      className={`font-semibold ${getAmountColor(transaction.type, transaction.amount)}`}
                      data-testid={`amount-${transaction.id}`}
                    >
                      {transaction.type === 'payment' && '+'}
                      {formatCurrency(Math.abs(transaction.amount), transaction.currency as Currency)}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(transaction.processedAt).toLocaleDateString()} at{' '}
                    {new Date(transaction.processedAt).toLocaleTimeString()}
                  </div>
                  
                  {transaction.recordedByName && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {transaction.recordedByName}
                    </div>
                  )}

                  {transaction.paymentMethod && (
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {transaction.paymentMethod}
                    </div>
                  )}
                </div>

                {transaction.notes && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {transaction.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {Array.isArray(transactions) && transactions.length > 5 && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              Load More Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}