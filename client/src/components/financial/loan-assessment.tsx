import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LoanForm {
  loanAmount: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
}

interface LoanResult {
  monthlyPayment: number;
  principalPayment: number;
  interestPayment: number;
  debtRatio: number;
  mortgageRatio: number;
  isAffordable: boolean;
}

export default function LoanAssessment() {
  const [loanResult, setLoanResult] = useState<LoanResult | null>(null);
  
  const { register, handleSubmit, setValue, watch } = useForm<LoanForm>({
    defaultValues: {
      loanAmount: 8000000,
      downPayment: 2000000,
      loanTerm: 30,
      interestRate: 2.1
    }
  });

  const calculateLoan = (data: LoanForm) => {
    const { loanAmount, downPayment, loanTerm, interestRate } = data;
    
    // Calculate principal amount (loan amount - down payment)
    const principal = loanAmount - downPayment;
    
    // Convert annual rate to monthly rate
    const monthlyRate = (interestRate / 100) / 12;
    
    // Convert years to months
    const numberOfPayments = loanTerm * 12;
    
    // Calculate monthly payment using loan formula
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                     (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = principal / numberOfPayments;
    }
    
    // Calculate first payment breakdown
    const interestPayment = principal * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    // Assume monthly income for ratio calculations (demo values)
    const monthlyIncome = 90000; // This should come from actual income data
    
    // Calculate ratios
    const mortgageRatio = (monthlyPayment / monthlyIncome) * 100;
    const debtRatio = mortgageRatio; // Simplified - should include other debts
    
    // Determine affordability
    const isAffordable = mortgageRatio <= 30 && debtRatio <= 40;
    
    const result: LoanResult = {
      monthlyPayment,
      principalPayment,
      interestPayment,
      debtRatio,
      mortgageRatio,
      isAffordable
    };
    
    setLoanResult(result);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" data-testid="section-loan-assessment">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">貸款能力評估</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loan Calculator */}
        <div>
          <h4 className="text-lg font-medium text-slate-800 mb-4">房貸試算</h4>
          <form onSubmit={handleSubmit(calculateLoan)} className="space-y-4">
            <div>
              <Label htmlFor="loanAmount">房屋總價</Label>
              <Input
                id="loanAmount"
                type="number"
                placeholder="8000000"
                {...register("loanAmount", { valueAsNumber: true })}
                data-testid="input-loan-amount"
              />
            </div>
            
            <div>
              <Label htmlFor="downPayment">頭期款</Label>
              <Input
                id="downPayment"
                type="number"
                placeholder="2000000"
                {...register("downPayment", { valueAsNumber: true })}
                data-testid="input-down-payment"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loanTerm">貸款年限</Label>
                <Select onValueChange={(value) => setValue("loanTerm", parseInt(value))}>
                  <SelectTrigger data-testid="select-loan-term">
                    <SelectValue placeholder="30年" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20年</SelectItem>
                    <SelectItem value="25">25年</SelectItem>
                    <SelectItem value="30">30年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="interestRate">利率 (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  placeholder="2.1"
                  {...register("interestRate", { valueAsNumber: true })}
                  data-testid="input-interest-rate"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-white hover:bg-blue-700"
              data-testid="button-calculate-loan"
            >
              計算貸款能力
            </Button>
          </form>
        </div>

        {/* Loan Assessment Results */}
        <div>
          <h4 className="text-lg font-medium text-slate-800 mb-4">評估結果</h4>
          {loanResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg" data-testid="result-monthly-payment">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">每月應繳金額</span>
                  <span className="text-xl font-bold text-slate-800">
                    {formatCurrency(loanResult.monthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>本金</span>
                  <span>{formatCurrency(loanResult.principalPayment)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>利息</span>
                  <span>{formatCurrency(loanResult.interestPayment)}</span>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg" data-testid="result-financial-health">
                <h5 className="font-medium text-slate-800 mb-3">財務健康度指標</h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>負債收入比</span>
                      <span className={`font-medium ${loanResult.debtRatio <= 40 ? 'text-success' : 'text-warning'}`}>
                        {loanResult.debtRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${loanResult.debtRatio <= 40 ? 'bg-success' : 'bg-warning'}`}
                        style={{ width: `${Math.min(loanResult.debtRatio, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">健康範圍: &lt; 40%</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>房貸收入比</span>
                      <span className={`font-medium ${loanResult.mortgageRatio <= 30 ? 'text-success' : 'text-warning'}`}>
                        {loanResult.mortgageRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${loanResult.mortgageRatio <= 30 ? 'bg-success' : 'bg-warning'}`}
                        style={{ width: `${Math.min(loanResult.mortgageRatio, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">建議範圍: &lt; 30%</p>
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-lg ${
                loanResult.isAffordable 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`} data-testid="result-affordability">
                <div className="flex items-center">
                  <i className={`${
                    loanResult.isAffordable ? 'fas fa-check-circle text-success' : 'fas fa-exclamation-circle text-warning'
                  } mr-2`}></i>
                  <span className={`text-sm font-medium ${
                    loanResult.isAffordable ? 'text-success' : 'text-warning'
                  }`}>
                    {loanResult.isAffordable ? '符合貸款條件' : '貸款風險偏高'}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${
                  loanResult.isAffordable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {loanResult.isAffordable 
                    ? '根據您的收入狀況，可負擔此房貸金額'
                    : '建議重新評估貸款金額或增加頭期款'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              <i className="fas fa-calculator text-4xl mb-4"></i>
              <p>請填寫左側表單進行貸款評估</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
