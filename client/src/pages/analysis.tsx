import { useQuery } from "@tanstack/react-query";
import type { IncomeRecord, ExpenseRecord } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";

export default function AnalysisPage() {
  const { data: incomeRecords = [] } = useQuery<IncomeRecord[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenseRecords = [] } = useQuery<ExpenseRecord[]>({
    queryKey: ["/api/expenses"],
  });

  interface SummaryData {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    savingsRate: number;
  }

  const { data: summary } = useQuery<SummaryData>({
    queryKey: ["/api/analysis/summary"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Process monthly trend data
  const processMonthlyData = () => {
    const monthlyData: { [key: string]: any } = {};
    
    // Process income
    incomeRecords.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expenses: 0 };
      }
      monthlyData[month].income += parseFloat(record.amount);
    });

    // Process expenses
    expenseRecords.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expenses: 0 };
      }
      monthlyData[month].expenses += parseFloat(record.amount);
    });

    return Object.values(monthlyData).map((item: any) => ({
      ...item,
      netIncome: item.income - item.expenses
    }));
  };

  // Process income by type
  const processIncomeByType = () => {
    const typeData: { [key: string]: number } = {};
    
    incomeRecords.forEach(record => {
      const amount = parseFloat(record.amount);
      typeData[record.type] = (typeData[record.type] || 0) + amount;
    });

    return Object.entries(typeData).map(([type, amount]) => ({
      name: type === 'salary' ? '薪資收入' : 
            type === 'investment' ? '投資收入' : '創業收入',
      value: amount,
    }));
  };

  // Process expenses by category
  const processExpensesByCategory = () => {
    const categoryData: { [key: string]: number } = {};
    
    expenseRecords.forEach(record => {
      const amount = parseFloat(record.amount);
      categoryData[record.category] = (categoryData[record.category] || 0) + amount;
    });

    const categoryNames: { [key: string]: string } = {
      living: "生活費用",
      loan: "貸款支出",
      insurance: "保險費用",
      investment: "投資支出",
      entertainment: "娛樂支出",
      other: "其他支出"
    };

    return Object.entries(categoryData).map(([category, amount]) => ({
      name: categoryNames[category] || category,
      value: amount,
    }));
  };

  const monthlyData = processMonthlyData();
  const incomeByType = processIncomeByType();
  const expensesByCategory = processExpensesByCategory();

  const COLORS = ['#10B981', '#1E40AF', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-800">財務分析</h2>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6" data-testid="card-total-income">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <i className="fas fa-arrow-trend-up text-success"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-600">總收入</p>
                  <p className="text-2xl font-bold text-slate-800" data-testid="text-total-income">
                    {formatCurrency(summary?.totalIncome || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6" data-testid="card-total-expenses">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full mr-4">
                  <i className="fas fa-arrow-trend-down text-warning"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-600">總支出</p>
                  <p className="text-2xl font-bold text-slate-800" data-testid="text-total-expenses">
                    {formatCurrency(summary?.totalExpenses || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6" data-testid="card-net-income">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <i className="fas fa-wallet text-primary"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-600">淨收入</p>
                  <p className="text-2xl font-bold text-slate-800" data-testid="text-net-income">
                    {formatCurrency(summary?.netIncome || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6" data-testid="card-savings-rate">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <i className="fas fa-piggy-bank text-purple-600"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-600">儲蓄率</p>
                  <p className="text-2xl font-bold text-slate-800" data-testid="text-savings-rate">
                    {(summary?.savingsRate || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Trend */}
            <div className="bg-white rounded-xl shadow-sm p-6" data-testid="chart-monthly-trend">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">收支趨勢分析</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                    name="收入"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444' }}
                    name="支出"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netIncome" 
                    stroke="#1E40AF" 
                    strokeWidth={2}
                    dot={{ fill: '#1E40AF' }}
                    name="淨收入"
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Income by Type */}
            <div className="bg-white rounded-xl shadow-sm p-6" data-testid="chart-income-by-type">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">收入來源分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {incomeByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Expenses by Category */}
            <div className="bg-white rounded-xl shadow-sm p-6" data-testid="chart-expenses-by-category">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">支出類別分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Bar dataKey="value" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Financial Health Indicators */}
            <div className="bg-white rounded-xl shadow-sm p-6" data-testid="section-financial-health">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">財務健康指標</h3>
              <div className="space-y-6">
                {/* Savings Rate */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">儲蓄率</span>
                    <span className={`font-medium ${(summary?.savingsRate || 0) >= 20 ? 'text-success' : 'text-warning'}`}>
                      {(summary?.savingsRate || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${(summary?.savingsRate || 0) >= 20 ? 'bg-success' : 'bg-warning'}`}
                      style={{ width: `${Math.min(summary?.savingsRate || 0, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">健康範圍: ≥ 20%</p>
                </div>

                {/* Emergency Fund Ratio */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">緊急備用金比率</span>
                    <span className="font-medium text-neutral">6.2</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-success h-3 rounded-full" style={{ width: "62%" }}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">建議範圍: 3-6個月支出</p>
                </div>

                {/* Expense Ratio */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">支出收入比</span>
                    <span className="font-medium text-success">
                      {summary?.totalIncome && summary.totalIncome > 0 
                        ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-success h-3 rounded-full"
                      style={{ 
                        width: `${summary?.totalIncome && summary.totalIncome > 0 
                          ? Math.min((summary.totalExpenses / summary.totalIncome) * 100, 100)
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">健康範圍: ≤ 80%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Insights */}
          <div className="bg-white rounded-xl shadow-sm p-6" data-testid="section-financial-insights">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">財務洞察</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-lightbulb text-success mr-2"></i>
                  <span className="font-medium text-success">理財建議</span>
                </div>
                <p className="text-sm text-green-700">
                  您的儲蓄率表現良好，建議將多餘資金投資於穩健型理財產品以增加被動收入。
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-chart-line text-primary mr-2"></i>
                  <span className="font-medium text-primary">投資建議</span>
                </div>
                <p className="text-sm text-blue-700">
                  考慮增加投資收入比重，建議將部分儲蓄投資於基金或股票以提升整體報酬率。
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                  <span className="font-medium text-yellow-600">支出提醒</span>
                </div>
                <p className="text-sm text-yellow-700">
                  注意控制娛樂支出，建議設定每月預算上限以維持健康的財務狀況。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}