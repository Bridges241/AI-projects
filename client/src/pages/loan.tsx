import Sidebar from "@/components/layout/sidebar";
import LoanAssessment from "@/components/financial/loan-assessment";

export default function LoanPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-800">貸款評估</h2>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <LoanAssessment />
        </div>
      </main>
    </div>
  );
}