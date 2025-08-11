import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ExpenseRecord, Budget } from "@shared/schema";

interface ExpenseTrackingProps {
  onAddExpense: () => void;
}

export default function ExpenseTracking({ onAddExpense }: ExpenseTrackingProps) {
  const queryClient = useQueryClient();

  const { data: expenseRecords = [] } = useQuery<ExpenseRecord[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
  });

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      living: "生活費用",
      loan: "貸款支出",
      insurance: "保險費用",
      investment: "投資支出",
      entertainment: "娛樂支出",
      other: "其他支出"
    };
    return names[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      living: "fas fa-utensils",
      loan: "fas fa-home",
      insurance: "fas fa-shield-alt",
      investment: "fas fa-chart-line",
      entertainment: "fas fa-gamepad",
      other: "fas fa-ellipsis-h"
    };
    return icons[category] || "fas fa-circle";
  };

  // Group expenses by category
  const expensesByCategory = expenseRecords.reduce((acc, record) => {
    const category = record.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(record);
    return acc;
  }, {} as { [key: string]: ExpenseRecord[] });

  const categories = Object.keys(expensesByCategory);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryTotal = (category: string) => {
    return expensesByCategory[category]?.reduce((sum, record) => sum + parseFloat(record.amount), 0) || 0;
  };

  const getCategoryBudget = (category: string) => {
    const budget = budgets.find(b => b.category === category);
    return budget ? parseFloat(budget.amount) : 0;
  };

  const getProgressPercentage = (category: string) => {
    const total = getCategoryTotal(category);
    const budget = getCategoryBudget(category);
    return budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8" data-testid="section-expense-tracking">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">支出追蹤</h3>
        <button 
          className="bg-warning text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
          onClick={onAddExpense}
          data-testid="button-add-expense"
        >
          <i className="fas fa-plus mr-2"></i>新增支出記錄
        </button>
      </div>

      {/* Expense Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const total = getCategoryTotal(category);
          const budget = getCategoryBudget(category);
          const progress = getProgressPercentage(category);
          const remaining = budget - total;
          const transactionCount = expensesByCategory[category].length;

          return (
            <div 
              key={category} 
              className="p-4 border border-slate-200 rounded-lg"
              data-testid={`card-expense-${category}`}
            >
              <div className="flex items-center mb-3">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <i className={`${getCategoryIcon(category)} text-warning`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">{getCategoryName(category)}</h4>
                  <p className="text-sm text-slate-500">{transactionCount} 筆交易</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">本月支出</span>
                  <span className="font-bold text-warning" data-testid={`text-total-${category}`}>
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                    data-testid={`progress-${category}`}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>預算: {formatCurrency(budget)}</span>
                  <span className={remaining >= 0 ? "text-success" : "text-warning"}>
                    {remaining >= 0 ? "剩餘" : "超支"}: {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Expense Card */}
        <div 
          className="p-4 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-warning hover:text-warning transition-colors cursor-pointer"
          onClick={onAddExpense}
          data-testid="card-add-expense"
        >
          <i className="fas fa-plus text-2xl mb-2"></i>
          <span className="text-sm font-medium">新增支出類別</span>
        </div>
      </div>
    </div>
  );
}
