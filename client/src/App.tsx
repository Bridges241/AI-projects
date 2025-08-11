import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import IncomePage from "@/pages/income";
import ExpensesPage from "@/pages/expenses";
import AnalysisPage from "@/pages/analysis";
import LoanPage from "@/pages/loan";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/income" component={IncomePage} />
      <Route path="/expenses" component={ExpensesPage} />
      <Route path="/analysis" component={AnalysisPage} />
      <Route path="/loan" component={LoanPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
