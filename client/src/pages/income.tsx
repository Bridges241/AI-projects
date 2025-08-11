import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { IncomeRecord } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import IncomeModal from "@/components/modals/income-modal";
import { Button } from "@/components/ui/button";

export default function IncomePage() {
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const queryClient = useQueryClient();

  const { data: incomeRecords = [], isLoading } = useQuery<IncomeRecord[]>({
    queryKey: ["/api/income"],
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/income/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analysis/summary"] });
    },
  });

  const filteredRecords = selectedType === "all" 
    ? incomeRecords 
    : incomeRecords.filter(record => record.type === selectedType);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

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

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      salary: "薪資收入",
      investment: "投資收入",
      business: "創業收入"
    };
    return types[type] || type;
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
            <h2 className="text-2xl font-semibold text-slate-800">收入管理</h2>
            <Button 
              onClick={() => setIncomeModalOpen(true)}
              className="bg-primary text-white hover:bg-blue-700"
              data-testid="button-add-income"
            >
              <i className="fas fa-plus mr-2"></i>新增收入記錄
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
                  { key: "all", label: "全部收入" },
                  { key: "salary", label: "薪資收入" },
                  { key: "investment", label: "投資收入" },
                  { key: "business", label: "創業收入" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`border-b-2 font-medium text-sm py-2 px-1 ${
                      selectedType === tab.key
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setSelectedType(tab.key)}
                    data-testid={`tab-${tab.key}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Income Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-200">
                    <th className="pb-3 text-slate-600 font-medium">日期</th>
                    <th className="pb-3 text-slate-600 font-medium">類型</th>
                    <th className="pb-3 text-slate-600 font-medium">項目</th>
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
                        還沒有收入記錄，點擊上方按鈕新增第一筆記錄
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`row-income-${record.id}`}>
                        <td className="py-4 text-slate-800">
                          {new Date(record.date).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === 'salary' ? 'bg-green-100 text-green-800' :
                            record.type === 'investment' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getTypeLabel(record.type)}
                          </span>
                        </td>
                        <td className="py-4 text-slate-800">
                          {getCategoryName(record.category, record.type)}
                        </td>
                        <td className="py-4 font-bold text-success" data-testid={`text-amount-${record.id}`}>
                          {formatCurrency(record.amount)}
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
                              onClick={() => deleteIncomeMutation.mutate(record.id)}
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

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["salary", "investment", "business"].map((type) => {
              const typeRecords = incomeRecords.filter(record => record.type === type);
              const total = typeRecords.reduce((sum, record) => sum + parseFloat(record.amount), 0);
              const count = typeRecords.length;
              
              return (
                <div key={type} className="bg-white rounded-xl shadow-sm p-6" data-testid={`card-stats-${type}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {getTypeLabel(type)}
                    </h3>
                    <div className={`p-2 rounded-lg ${
                      type === 'salary' ? 'bg-green-100' :
                      type === 'investment' ? 'bg-blue-100' :
                      'bg-yellow-100'
                    }`}>
                      <i className={`${
                        type === 'salary' ? 'fas fa-coins text-green-600' :
                        type === 'investment' ? 'fas fa-chart-line text-blue-600' :
                        'fas fa-briefcase text-yellow-600'
                      }`}></i>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">總金額</span>
                      <span className="font-bold text-success" data-testid={`text-total-${type}`}>
                        {formatCurrency(total.toString())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">記錄數</span>
                      <span className="font-medium text-slate-800">{count} 筆</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <IncomeModal 
        open={incomeModalOpen} 
        onClose={() => setIncomeModalOpen(false)} 
      />
    </div>
  );
}