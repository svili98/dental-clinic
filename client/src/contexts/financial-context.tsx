import { createContext, useContext, useReducer, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Currency } from '@/lib/currency';

// Financial transaction types
export type TransactionType = 'payment' | 'charge' | 'refund' | 'adjustment';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'refunded';

export interface FinancialTransaction {
  id: number;
  patientId: number;
  type: TransactionType;
  amount: number; // in smallest currency unit
  currency: Currency;
  description: string;
  category?: string;
  paymentMethod?: string;
  transactionReference?: string;
  appointmentId?: number;
  treatmentId?: number;
  recordedBy: number;
  authorizedBy?: number;
  status: TransactionStatus;
  notes?: string;
  processedAt: string;
  createdAt: string;
}

export interface PatientBalance {
  patientId: number;
  totalCharges: Record<Currency, number>;
  totalPayments: Record<Currency, number>;
  balance: Record<Currency, number>;
  lastUpdated: string;
}

interface FinancialState {
  transactions: FinancialTransaction[];
  balances: Record<number, PatientBalance>;
  isLoading: boolean;
  error: string | null;
}

type FinancialAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRANSACTIONS'; payload: FinancialTransaction[] }
  | { type: 'ADD_TRANSACTION'; payload: FinancialTransaction }
  | { type: 'UPDATE_TRANSACTION'; payload: FinancialTransaction }
  | { type: 'SET_PATIENT_BALANCE'; payload: PatientBalance }
  | { type: 'CLEAR_DATA' };

const initialState: FinancialState = {
  transactions: [],
  balances: {},
  isLoading: false,
  error: null,
};

function financialReducer(state: FinancialState, action: FinancialAction): FinancialState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, isLoading: false };
    case 'ADD_TRANSACTION':
      return { 
        ...state, 
        transactions: [...state.transactions, action.payload],
        isLoading: false 
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
        isLoading: false
      };
    case 'SET_PATIENT_BALANCE':
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.payload.patientId]: action.payload
        }
      };
    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
}

interface FinancialContextType {
  state: FinancialState;
  
  // Transaction management
  createTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'recordedBy' | 'processedAt' | 'createdAt'>) => Promise<FinancialTransaction>;
  updateTransaction: (id: number, updates: Partial<FinancialTransaction>) => Promise<FinancialTransaction>;
  getPatientTransactions: (patientId: number) => FinancialTransaction[];
  
  // Balance management
  getPatientBalance: (patientId: number) => PatientBalance | null;
  refreshPatientBalance: (patientId: number) => Promise<void>;
  
  // Quick actions
  recordPayment: (patientId: number, amount: number, currency: Currency, paymentMethod: string, description: string) => Promise<FinancialTransaction>;
  recordCharge: (patientId: number, amount: number, currency: Currency, description: string, category?: string) => Promise<FinancialTransaction>;
  recordRefund: (patientId: number, amount: number, currency: Currency, originalTransactionId: number, reason: string) => Promise<FinancialTransaction>;
  
  // Utilities
  calculateBalance: (patientId: number) => Record<Currency, number>;
  clearError: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financialReducer, initialState);
  const { employee } = useAuth();

  const createTransaction = async (transactionData: Omit<FinancialTransaction, 'id' | 'recordedBy' | 'processedAt' | 'createdAt'>): Promise<FinancialTransaction> => {
    if (!employee) throw new Error('User not authenticated');
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch('/api/financial-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionData,
          recordedBy: employee.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const transaction = await response.json();
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      
      // Refresh patient balance
      await refreshPatientBalance(transaction.patientId);
      
      return transaction;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const updateTransaction = async (id: number, updates: Partial<FinancialTransaction>): Promise<FinancialTransaction> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch(`/api/financial-transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      const transaction = await response.json();
      dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
      
      return transaction;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const getPatientTransactions = (patientId: number): FinancialTransaction[] => {
    return state.transactions.filter(t => t.patientId === patientId);
  };

  const getPatientBalance = (patientId: number): PatientBalance | null => {
    return state.balances[patientId] || null;
  };

  const refreshPatientBalance = async (patientId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/patients/${patientId}/balance`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      
      const balance = await response.json();
      dispatch({ type: 'SET_PATIENT_BALANCE', payload: balance });
    } catch (error) {
      console.error('Failed to refresh patient balance:', error);
    }
  };

  const recordPayment = async (patientId: number, amount: number, currency: Currency, paymentMethod: string, description: string): Promise<FinancialTransaction> => {
    return createTransaction({
      patientId,
      type: 'payment',
      amount: -Math.abs(amount), // Payments are negative
      currency,
      paymentMethod,
      description,
      status: 'completed',
    });
  };

  const recordCharge = async (patientId: number, amount: number, currency: Currency, description: string, category?: string): Promise<FinancialTransaction> => {
    return createTransaction({
      patientId,
      type: 'charge',
      amount: Math.abs(amount), // Charges are positive
      currency,
      description,
      category,
      status: 'completed',
    });
  };

  const recordRefund = async (patientId: number, amount: number, currency: Currency, originalTransactionId: number, reason: string): Promise<FinancialTransaction> => {
    return createTransaction({
      patientId,
      type: 'refund',
      amount: Math.abs(amount), // Refunds are positive (money back to patient)
      currency,
      description: `Refund: ${reason}`,
      notes: `Original transaction ID: ${originalTransactionId}`,
      status: 'completed',
    });
  };

  const calculateBalance = (patientId: number): Record<Currency, number> => {
    const transactions = getPatientTransactions(patientId);
    const balance: Record<Currency, number> = {} as Record<Currency, number>;

    transactions.forEach(transaction => {
      if (transaction.status === 'completed') {
        if (!balance[transaction.currency]) {
          balance[transaction.currency] = 0;
        }
        balance[transaction.currency] += transaction.amount;
      }
    });

    return balance;
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: FinancialContextType = {
    state,
    createTransaction,
    updateTransaction,
    getPatientTransactions,
    getPatientBalance,
    refreshPatientBalance,
    recordPayment,
    recordCharge,
    recordRefund,
    calculateBalance,
    clearError,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}