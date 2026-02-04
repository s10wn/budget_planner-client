export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  language: string;
  currencyCode: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isDefault: boolean;
  userId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  currency: string;
  description: string;
  date: string;
  createdAt: string;
  category: Category;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  category: Category;
}

export interface BudgetStatus {
  id: string;
  category: Category;
  budgetAmount: number;
  spentAmount: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  requestsCount: number;
  lastUsed: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expensesByCategory: { category: Category; total: number }[];
  incomeByCategory: { category: Category; total: number }[];
  transactionsCount: number;
}

export interface YearlyTrend {
  year: number;
  months: { month: number; income: number; expense: number }[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
