import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { IncomeRecord } from "@shared/schema";

interface IncomeModulesProps {
  onAddIncome: () => void;
}

export default function IncomeModules({ onAddIncome }: IncomeModulesProps) {
  const [activeTab, setActiveTab] = useState("salary");
  const queryClient = useQueryClient();

  const { data: incomeRecords = [] } = useQuery<IncomeRecord[]>({
    queryKey: ["/api/income"],
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/income/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
    },
  });

  const filteredRecords = incomeRecords.filter(record => record.type === activeTab);

  const tabs = [
    { key: "salary", label: "薪資收入", testId: "tab-salary" },
    { key: "investment", label: "投資收入", testId: "tab-investment" },
    { key: "business", label: "創業收入", testId: "tab-business" },
  ];

  const getCategoryName = (category: string, type: string) => {
    const categories: { [key: string]: { [key: string]: string } } = {
      salary: {
        base: "基本月薪",
        bonus: "年終獎金",
        overtime: "加班費",
        allowance: "津貼補助",
        other: "其他薪資"
      },
      investment: {
        dividend: "股票股利",
        interest: "債券利息",
        fund: "基金收益",
        rent: "房租收入",
        other: "其他投資"
      },
      business: {
        revenue: "營業收入",
        side: "副業收入",
        consulting: "顧問費用",
        royalty: "版權收入",
        other: "其他創業"
      }
    };
    return categories[type]?.[category] || category;
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8" data-testid="section-income-modules">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">收入模塊管理</h3>
        <button 
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          onClick={onAddIncome}
          data-testid="button-add-income"
        >
          <i className="fas fa-plus mr-2"></i>新增收入記錄
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`border-b-2 font-medium text-sm py-2 px-1 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab(tab.key)}
              data-testid={tab.testId}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Income Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <div 
            key={record.id} 
            className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            data-testid={`card-income-${record.id}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-slate-800">
                  {getCategoryName(record.category, record.type)}
                </h4>
                <p className="text-2xl font-bold text-success mt-1" data-testid={`text-amount-${record.id}`}>
                  {formatCurrency(record.amount)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(record.date).toLocaleDateString('zh-TW')}
                </p>
              </div>
              <div className="flex space-x-1">
                <button 
                  className="p-1 text-slate-400 hover:text-primary"
                  data-testid={`button-edit-${record.id}`}
                >
                  <i className="fas fa-edit text-sm"></i>
                </button>
                <button 
                  className="p-1 text-slate-400 hover:text-warning"
                  onClick={() => deleteIncomeMutation.mutate(record.id)}
                  data-testid={`button-delete-${record.id}`}
                >
                  <i className="fas fa-trash text-sm"></i>
                </button>
              </div>
            </div>
            {record.notes && (
              <div className="text-sm text-slate-600 mt-2">
                <span className="font-medium">備註：</span>
                {record.notes}
              </div>
            )}
          </div>
        ))}

        {/* Add Income Card */}
        <div 
          className="p-4 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
          onClick={onAddIncome}
          data-testid="card-add-income"
        >
          <i className="fas fa-plus text-2xl mb-2"></i>
          <span className="text-sm font-medium">新增{tabs.find(t => t.key === activeTab)?.label}</span>
        </div>
      </div>
    </div>
  );
}
