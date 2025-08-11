import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseRecordSchema } from "@shared/schema";
import type { InsertExpenseRecord } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExpenseModal({ open, onClose }: ExpenseModalProps) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<InsertExpenseRecord>({
    resolver: zodResolver(insertExpenseRecordSchema),
    defaultValues: {
      category: "living",
      amount: "0",
      date: new Date().toISOString().split('T')[0],
      description: "",
      notes: ""
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: InsertExpenseRecord) => 
      apiRequest("POST", "/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analysis/summary"] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: InsertExpenseRecord) => {
    createExpenseMutation.mutate(data);
  };

  const expenseCategories = [
    { value: "living", label: "生活費用" },
    { value: "loan", label: "貸款支出" },
    { value: "insurance", label: "保險費用" },
    { value: "investment", label: "投資支出" },
    { value: "entertainment", label: "娛樂支出" },
    { value: "other", label: "其他支出" }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-expense">
        <DialogHeader>
          <DialogTitle>新增支出記錄</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category">支出類別</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue="living">
                <SelectTrigger data-testid="select-expense-category">
                  <SelectValue placeholder="選擇支出類別" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-warning mt-1">{errors.category.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="amount">金額</Label>
              <Input
                id="amount"
                type="number"
                placeholder="輸入金額"
                {...register("amount")}
                data-testid="input-expense-amount"
              />
              {errors.amount && <p className="text-sm text-warning mt-1">{errors.amount.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                data-testid="input-expense-date"
              />
              {errors.date && <p className="text-sm text-warning mt-1">{errors.date.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                placeholder="支出描述"
                {...register("description")}
                data-testid="input-expense-description"
              />
              {errors.description && <p className="text-sm text-warning mt-1">{errors.description.message}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">備註</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="輸入備註..."
              {...register("notes")}
              data-testid="textarea-expense-notes"
            />
            {errors.notes && <p className="text-sm text-warning mt-1">{errors.notes.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              data-testid="button-cancel-expense"
            >
              取消
            </Button>
            <Button 
              type="submit" 
              className="bg-warning text-white hover:bg-red-600"
              disabled={createExpenseMutation.isPending}
              data-testid="button-save-expense"
            >
              {createExpenseMutation.isPending ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
