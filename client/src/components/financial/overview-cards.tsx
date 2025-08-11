import { useQuery } from "@tanstack/react-query";

interface OverviewCardsProps {
  timeRange: string;
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
}

export default function OverviewCards({ timeRange }: OverviewCardsProps) {
  const { data: summary } = useQuery<SummaryData>({
    queryKey: ["/api/analysis/summary"],
    staleTime: 30000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: "總收入",
      value: summary?.totalIncome || 0,
      change: "+12.5% 比上月",
      changeType: "positive",
      icon: "fas fa-arrow-trend-up",
      bgColor: "bg-green-100",
      iconColor: "text-success",
      testId: "card-total-income"
    },
    {
      title: "總支出",
      value: summary?.totalExpenses || 0,
      change: "+3.2% 比上月",
      changeType: "negative",
      icon: "fas fa-arrow-trend-down",
      bgColor: "bg-red-100",
      iconColor: "text-warning",
      testId: "card-total-expenses"
    },
    {
      title: "淨收入",
      value: summary?.netIncome || 0,
      change: "+18.7% 比上月",
      changeType: "positive",
      icon: "fas fa-wallet",
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
      testId: "card-net-income"
    },
    {
      title: "儲蓄率",
      value: summary?.savingsRate || 0,
      change: "目標: 30%",
      changeType: "positive",
      icon: "fas fa-piggy-bank",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      testId: "card-savings-rate",
      isPercentage: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.testId} className="bg-white rounded-xl shadow-sm p-6" data-testid={card.testId}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-slate-800" data-testid={`text-${card.testId}-value`}>
                {card.isPercentage 
                  ? `${card.value.toFixed(1)}%`
                  : formatCurrency(card.value)
                }
              </p>
              <p className={`text-xs mt-1 ${
                card.changeType === "positive" ? "text-success" : "text-warning"
              }`}>
                <i className="fas fa-arrow-up mr-1"></i>
                {card.change}
              </p>
            </div>
            <div className={`p-3 ${card.bgColor} rounded-full`}>
              <i className={`${card.icon} ${card.iconColor}`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
