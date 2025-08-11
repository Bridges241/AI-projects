import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { IncomeRecord, ExpenseRecord } from "@shared/schema";

interface IncomeChartsProps {
  timeRange: string;
}

export default function IncomeCharts({ timeRange }: IncomeChartsProps) {
  const { data: incomeRecords = [] } = useQuery<IncomeRecord[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenseRecords = [] } = useQuery<ExpenseRecord[]>({
    queryKey: ["/api/expenses"],
  });

  // Process income data for line chart
  const processIncomeData = () => {
    const monthlyData: { [key: string]: any } = {};
    
    incomeRecords.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('zh-TW', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, salary: 0, investment: 0, business: 0 };
      }
      
      const amount = parseFloat(record.amount);
      switch (record.type) {
        case 'salary':
          monthlyData[month].salary += amount;
          break;
        case 'investment':
          monthlyData[month].investment += amount;
          break;
        case 'business':
          monthlyData[month].business += amount;
          break;
      }
    });

    return Object.values(monthlyData);
  };

  // Process expense data for pie chart
  const processExpenseData = () => {
    const categoryData: { [key: string]: number } = {};
    
    expenseRecords.forEach(record => {
      const amount = parseFloat(record.amount);
      categoryData[record.category] = (categoryData[record.category] || 0) + amount;
    });

    return Object.entries(categoryData).map(([category, amount]) => ({
      name: getCategoryName(category),
      value: amount,
    }));
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

  const incomeData = processIncomeData();
  const expenseData = processExpenseData();

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#1E40AF', '#8B5CF6', '#6B7280'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Income Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6" data-testid="chart-income-trend">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">收入趨勢分析</h3>
          <div className="flex space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-success">
              <i className="fas fa-circle mr-1" style={{ fontSize: '6px' }}></i>薪資收入
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-primary">
              <i className="fas fa-circle mr-1" style={{ fontSize: '6px' }}></i>投資收入
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-600">
              <i className="fas fa-circle mr-1" style={{ fontSize: '6px' }}></i>創業收入
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Line 
              type="monotone" 
              dataKey="salary" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981' }}
            />
            <Line 
              type="monotone" 
              dataKey="investment" 
              stroke="#1E40AF" 
              strokeWidth={2}
              dot={{ fill: '#1E40AF' }}
            />
            <Line 
              type="monotone" 
              dataKey="business" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ fill: '#F59E0B' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Breakdown Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6" data-testid="chart-expense-breakdown">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">支出分布</h3>
          <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" data-testid="select-expense-period">
            <option>本月</option>
            <option>上月</option>
            <option>本季</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
