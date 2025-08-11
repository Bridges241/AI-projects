import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ExpenseRecord, Budget } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import ExpenseModal from "@/components/modals/expense-modal";
import { Button } from "@/components/ui/button";

export default function ExpensesPage() {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: expenseRecords = [], isLoading } = useQuery<ExpenseRecord[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analysis/summary"] });
    },
  });

  const filteredRecords = selectedCategory === "all" 
    ? expenseRecords 
    : expenseRecords.filter(record => record.category === selectedCategory);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  const getCategoryBudget = (category: string) => {
    const budget = budgets.find(b => b.category === category);
    return budget ? parseFloat(budget.amount) : 0;
  };

  const getCategoryTotal = (category: string) => {
    return expenseRecords
      .filter(record => record.category === category)
      .reduce((sum, record) => sum + parseFloat(record.amount), 0);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="text-center">載入中...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-800">支出管理</h2>
            <Button 
              onClick={() => setExpenseModalOpen(true)}
              className="bg-warning text-white hover:bg-red-600"
              data-testid="button-add-expense"
            >
              <i className="fas fa-plus mr-2"></i>新增支出記錄
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="border-b border-slate-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: "all", label: "全部支出" },
                  { key: "living", label: "生活費用" },
                  { key: "loan", label: "貸款支出" },
                  { key: "insurance", label: "保險費用" },
                  { key: "investment", label: "投資支出" },
                  { key: "entertainment", label: "娛樂支出" },
                  { key: "other", label: "其他支出" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`border-b-2 font-medium text-sm py-2 px-1 ${
                      selectedCategory === tab.key
                        ? "border-warning text-warning"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setSelectedCategory(tab.key)}
                    data-testid={`tab-${tab.key}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Expense Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-200">
                    <th className="pb-3 text-slate-600 font-medium">日期</th>
                    <th className="pb-3 text-slate-600 font-medium">類別</th>
                    <th className="pb-3 text-slate-600 font-medium">描述</th>
                    <th className="pb-3 text-slate-600 font-medium">金額</th>
                    <th className="pb-3 text-slate-600 font-medium">備註</th>
                    <th className="pb-3 text-slate-600 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        <i className="fas fa-inbox text-4xl mb-4 block"></i>
                        還沒有支出記錄，點擊上方按鈕新增第一筆記錄
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`row-expense-${record.id}`}>
                        <td className="py-4 text-slate-800">
                          {new Date(record.date).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="p-1 bg-red-100 rounded mr-2">
                              <i className={`${getCategoryIcon(record.category)} text-warning text-xs`}></i>
                            </div>
                            <span className="text-slate-800">{getCategoryName(record.category)}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-800 max-w-xs truncate">
                          {record.description || '-'}
                        </td>
                        <td className="py-4 font-bold text-warning" data-testid={`text-amount-${record.id}`}>
                          {formatCurrency(parseFloat(record.amount))}
                        </td>
                        <td className="py-4 text-slate-600 max-w-xs truncate">
                          {record.notes || '-'}
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <button 
                              className="p-1 text-slate-400 hover:text-primary"
                              data-testid={`button-edit-${record.id}`}
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </button>
                            <button 
                              className="p-1 text-slate-400 hover:text-warning"
                              onClick={() => deleteExpenseMutation.mutate(record.id)}
                              data-testid={`button-delete-${record.id}`}
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["living", "loan", "insurance", "investment", "entertainment", "other"].map((category) => {
              const total = getCategoryTotal(category);
              const budget = getCategoryBudget(category);
              const progress = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
              const remaining = budget - total;
              const transactionCount = expenseRecords.filter(record => record.category === category).length;
              
              return (
                <div key={category} className="bg-white rounded-xl shadow-sm p-6" data-testid={`card-stats-${category}`}>
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <i className={`${getCategoryIcon(category)} text-warning`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{getCategoryName(category)}</h4>
                      <p className="text-sm text-slate-500">{transactionCount} 筆交易</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">本月支出</span>
                      <span className="font-bold text-warning" data-testid={`text-total-${category}`}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                    {budget > 0 && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <ExpenseModal 
        open={expenseModalOpen} 
        onClose={() => setExpenseModalOpen(false)} 
      />
    </div>
  );
}