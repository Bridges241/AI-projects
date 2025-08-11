import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import OverviewCards from "@/components/financial/overview-cards";
import IncomeCharts from "@/components/financial/income-charts";
import IncomeModules from "@/components/financial/income-modules";
import ExpenseTracking from "@/components/financial/expense-tracking";
import LoanAssessment from "@/components/financial/loan-assessment";
import IncomeModal from "@/components/modals/income-modal";
import ExpenseModal from "@/components/modals/expense-modal";

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("本月");
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-800">財務總覽</h2>
            <div className="flex items-center space-x-4">
              <select 
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                data-testid="select-time-range"
              >
                <option>本月</option>
                <option>最近3個月</option>
                <option>最近6個月</option>
                <option>本年度</option>
              </select>
              <button 
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                onClick={() => setIncomeModalOpen(true)}
                data-testid="button-add-record"
              >
                <i className="fas fa-plus mr-2"></i>新增資料
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          <OverviewCards timeRange={selectedTimeRange} />
          <IncomeCharts timeRange={selectedTimeRange} />
          <IncomeModules onAddIncome={() => setIncomeModalOpen(true)} />
          <ExpenseTracking onAddExpense={() => setExpenseModalOpen(true)} />
          <LoanAssessment />
        </div>
      </main>

      <IncomeModal 
        open={incomeModalOpen} 
        onClose={() => setIncomeModalOpen(false)} 
      />
      <ExpenseModal 
        open={expenseModalOpen} 
        onClose={() => setExpenseModalOpen(false)} 
      />
    </div>
  );
}
