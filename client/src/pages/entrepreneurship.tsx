import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEntrepreneurshipProjectSchema, type EntrepreneurshipProject } from "@shared/schema";
import { Plus, Building2, BarChart3, Calendar, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

// 會計損益表科目
const ACCOUNTING_CATEGORIES = {
  revenue: {
    label: "營業收入",
    items: [
      { value: "sales_revenue", label: "銷貨收入" },
      { value: "service_revenue", label: "勞務收入" },
      { value: "other_revenue", label: "其他營業收入" }
    ]
  },
  expense: {
    label: "營業費用",
    items: [
      { value: "cost_of_goods_sold", label: "銷貨成本" },
      { value: "marketing_expense", label: "行銷費用" },
      { value: "admin_expense", label: "管理費用" },
      { value: "research_development", label: "研發費用" },
      { value: "rent_expense", label: "租金費用" },
      { value: "salary_expense", label: "薪資費用" },
      { value: "equipment_expense", label: "設備費用" },
      { value: "material_expense", label: "材料費用" },
      { value: "other_expense", label: "其他營業費用" }
    ]
  }
};

const projectFormSchema = insertEntrepreneurshipProjectSchema.extend({
  startDate: z.string().min(1, "請選擇開始日期"),
});

export default function EntrepreneurshipPage() {
  const [selectedProject, setSelectedProject] = useState<EntrepreneurshipProject | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const { data: projects = [] } = useQuery<EntrepreneurshipProject[]>({
    queryKey: ["/api/entrepreneurship/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      const response = await fetch("/api/entrepreneurship/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entrepreneurship/projects"] });
      setIsProjectModalOpen(false);
      toast({ description: "專案創建成功！" });
    },
    onError: () => {
      toast({ description: "創建專案失敗", variant: "destructive" });
    },
  });

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date().toISOString().split('T')[0],
      status: "active",
    },
  });

  const onSubmit = (data: z.infer<typeof projectFormSchema>) => {
    createProjectMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "進行中", variant: "default" as const },
      completed: { label: "已完成", variant: "secondary" as const },
      paused: { label: "暫停", variant: "outline" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.active;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800" data-testid="text-page-title">
                52系統 - 創業管理
              </h2>
              <p className="text-slate-600 mt-1">
                管理創業專案，追蹤損益表現
              </p>
            </div>
            <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-project">
                  <Plus className="w-4 h-4 mr-2" />
                  新增專案
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>新增創業專案</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>專案名稱</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="輸入專案名稱" data-testid="input-project-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>專案描述</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="專案簡介" data-testid="input-project-description" value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>開始日期</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-project-start-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>狀態</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid="select-project-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">進行中</SelectItem>
                              <SelectItem value="paused">暫停</SelectItem>
                              <SelectItem value="completed">已完成</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsProjectModalOpen(false)}
                        data-testid="button-cancel"
                      >
                        取消
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createProjectMutation.isPending}
                        data-testid="button-submit"
                      >
                        {createProjectMutation.isPending ? "創建中..." : "創建"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Projects Grid */}
            {projects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">還沒有創業專案</h3>
                  <p className="text-slate-600 mb-4">創建您的第一個創業專案，開始追蹤損益表現</p>
                  <Button onClick={() => setIsProjectModalOpen(true)} data-testid="button-create-first-project">
                    <Plus className="w-4 h-4 mr-2" />
                    創建專案
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const statusBadge = getStatusBadge(project.status);
                  return (
                    <Card 
                      key={project.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                      data-testid={`card-project-${project.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-sm text-slate-600 mb-3">
                          <Calendar className="w-4 h-4 mr-2" />
                          開始：{new Date(project.startDate).toLocaleDateString('zh-TW')}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-slate-600">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            損益表
                          </div>
                          <Button size="sm" variant="outline">
                            查看詳情
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Project Detail Modal */}
            {selectedProject && (
              <Dialog 
                open={!!selectedProject} 
                onOpenChange={() => setSelectedProject(null)}
              >
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {selectedProject.name}
                      <Badge variant={getStatusBadge(selectedProject.status).variant}>
                        {getStatusBadge(selectedProject.status).label}
                      </Badge>
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Project Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">專案描述</h4>
                        <p className="text-slate-600">{selectedProject.description || "無描述"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">開始日期</h4>
                        <p className="text-slate-600">
                          {new Date(selectedProject.startDate).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    </div>

                    {/* Accounting Categories */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-4">損益表科目</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Revenue Categories */}
                        <div>
                          <h5 className="font-medium text-green-700 mb-3 flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {ACCOUNTING_CATEGORIES.revenue.label}
                          </h5>
                          <div className="space-y-2">
                            {ACCOUNTING_CATEGORIES.revenue.items.map((item) => (
                              <div 
                                key={item.value}
                                className="p-3 bg-green-50 rounded-lg border border-green-200"
                              >
                                <span className="text-sm font-medium text-green-800">
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Expense Categories */}
                        <div>
                          <h5 className="font-medium text-red-700 mb-3 flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {ACCOUNTING_CATEGORIES.expense.label}
                          </h5>
                          <div className="space-y-2">
                            {ACCOUNTING_CATEGORIES.expense.items.map((item) => (
                              <div 
                                key={item.value}
                                className="p-3 bg-red-50 rounded-lg border border-red-200"
                              >
                                <span className="text-sm font-medium text-red-800">
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Note about P&L tracking */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-800 mb-2">52系統雙軌設計</h5>
                      <p className="text-sm text-blue-700">
                        此專案支援計畫 vs 現實的雙軌比較，您可以在每個會計科目中記錄計畫金額和實際金額，
                        系統將自動分析差異，幫助您掌握專案的財務表現。
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}