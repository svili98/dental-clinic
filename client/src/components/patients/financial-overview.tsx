import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, type Currency } from "@/lib/currency";
import { usePatientFinancialSummary } from "@/hooks/use-financial";
import { Plus, CreditCard, Receipt, TrendingUp, AlertCircle } from "lucide-react";
import { useState } from "react";
import { TransactionModal } from "@/components/patients/transaction-modal";

interface FinancialOverviewProps {
  patientId: number;
}

export function FinancialOverview({ patientId }: FinancialOverviewProps) {
  const { data: summary, isLoading } = usePatientFinancialSummary(patientId);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<'payment' | 'charge' | 'refund'>('payment');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No financial data available</p>
        </CardContent>
      </Card>
    );
  }

  const currencies = Object.keys(summary?.balance || {}) as Currency[];
  const hasOutstandingBalances = currencies.some(currency => (summary?.balance?.[currency] || 0) > 0);

  const handleAddTransaction = (type: 'payment' | 'charge' | 'refund') => {
    setSelectedTransactionType(type);
    setShowTransactionModal(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Financial Overview
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAddTransaction('charge')}
              data-testid="button-add-charge"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Charge
            </Button>
            <Button 
              size="sm"
              onClick={() => handleAddTransaction('payment')}
              data-testid="button-add-payment"
            >
              <Plus className="h-4 w-4 mr-1" />
              Record Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Current Balance</h3>
              {hasOutstandingBalances && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Outstanding
                </Badge>
              )}
            </div>
            <div className="grid gap-2">
              {currencies.length === 0 ? (
                <p className="text-gray-500 text-sm">No transactions recorded</p>
              ) : (
                currencies.map(currency => (
                  <div key={currency} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium">{currency}</span>
                    <span 
                      className={`font-semibold ${
                        (summary?.balance?.[currency] || 0) > 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : (summary?.balance?.[currency] || 0) < 0 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                      }`}
                      data-testid={`balance-${currency.toLowerCase()}`}
                    >
                      {formatCurrency(summary?.balance?.[currency] || 0, currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Financial Summary */}
          {currencies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Charges */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <Receipt className="h-4 w-4" />
                  Total Charges
                </div>
                {currencies.map(currency => (
                  (summary?.totalCharges?.[currency] || 0) > 0 && (
                    <div key={currency} className="flex justify-between text-sm">
                      <span>{currency}</span>
                      <span className="font-medium" data-testid={`charges-${currency.toLowerCase()}`}>
                        {formatCurrency(summary?.totalCharges?.[currency] || 0, currency)}
                      </span>
                    </div>
                  )
                ))}
              </div>

              {/* Total Payments */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <CreditCard className="h-4 w-4" />
                  Total Payments
                </div>
                {currencies.map(currency => (
                  (summary?.totalPayments?.[currency] || 0) > 0 && (
                    <div key={currency} className="flex justify-between text-sm">
                      <span>{currency}</span>
                      <span className="font-medium text-green-600 dark:text-green-400" data-testid={`payments-${currency.toLowerCase()}`}>
                        {formatCurrency(summary?.totalPayments?.[currency] || 0, currency)}
                      </span>
                    </div>
                  )
                ))}
              </div>

              {/* Total Refunds */}
              {Object.values(summary?.totalRefunds || {}).some((amount: any) => (amount || 0) > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <TrendingUp className="h-4 w-4" />
                    Total Refunds
                  </div>
                  {currencies.map(currency => (
                    (summary?.totalRefunds?.[currency] || 0) > 0 && (
                      <div key={currency} className="flex justify-between text-sm">
                        <span>{currency}</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400" data-testid={`refunds-${currency.toLowerCase()}`}>
                          {formatCurrency(summary?.totalRefunds?.[currency] || 0, currency)}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary Stats */}
          {(summary?.transactionCount || 0) > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Total Transactions: {summary?.transactionCount || 0}</span>
                {summary?.lastTransactionDate && (
                  <span>
                    Last Transaction: {new Date(summary.lastTransactionDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          patientId={patientId}
          type={selectedTransactionType}
        />
      )}
    </>
  );
}