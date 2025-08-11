import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertIncomeRecordSchema } from "@shared/schema";
import type { InsertIncomeRecord } from "@shared/schema";
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

interface IncomeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function IncomeModal({ open, onClose }: IncomeModalProps) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InsertIncomeRecord>({
    resolver: zodResolver(insertIncomeRecordSchema),
    defaultValues: {
      type: "salary",
      category: "base",
      amount: "0",
      date: new Date().toISOString().split('T')[0],
      notes: ""
    }
  });

  const selectedType = watch("type");

  const createIncomeMutation = useMutation({
    mutationFn: (data: InsertIncomeRecord) => 
      apiRequest("POST", "/api/income", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analysis/summary"] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: InsertIncomeRecord) => {
    createIncomeMutation.mutate(data);
  };

  const getIncomeCategories = (type: string) => {
    const categories: { [key: string]: { value: string; label: string }[] } = {
      salary: [
        { value: "base", label: "基本月薪" },
        { value: "bonus", label: "年終獎金" },
        { value: "overtime", label: "加班費" },
        { value: "allowance", label: "津貼補助" },
        { value: "other", label: "其他薪資" }
      ],
      investment: [
        { value: "dividend", label: "股票股利" },
        { value: "interest", label: "債券利息" },
        { value: "fund", label: "基金收益" },
        { value: "rent", label: "房租收入" },
        { value: "other", label: "其他投資" }
      ],
      business: [
        { value: "revenue", label: "營業收入" },
        { value: "side", label: "副業收入" },
        { value: "consulting", label: "顧問費用" },
        { value: "royalty", label: "版權收入" },
        { value: "other", label: "其他創業" }
      ]
    };
    return categories[type] || [];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-income">
        <DialogHeader>
          <DialogTitle>新增收入記錄</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="type">收入類型</Label>
              <Select onValueChange={(value) => setValue("type", value as any)} defaultValue="salary">
                <SelectTrigger data-testid="select-income-type">
                  <SelectValue placeholder="選擇收入類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">薪資收入</SelectItem>
                  <SelectItem value="investment">投資收入</SelectItem>
                  <SelectItem value="business">創業收入</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-warning mt-1">{errors.type.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="category">收入項目</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger data-testid="select-income-category">
                  <SelectValue placeholder="選擇收入項目" />
                </SelectTrigger>
                <SelectContent>
                  {getIncomeCategories(selectedType).map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-warning mt-1">{errors.category.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="amount">金額</Label>
              <Input
                id="amount"
                type="number"
                placeholder="輸入金額"
                {...register("amount")}
                data-testid="input-income-amount"
              />
              {errors.amount && <p className="text-sm text-warning mt-1">{errors.amount.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                data-testid="input-income-date"
              />
              {errors.date && <p className="text-sm text-warning mt-1">{errors.date.message}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">備註</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="輸入備註..."
              {...register("notes")}
              data-testid="textarea-income-notes"
            />
            {errors.notes && <p className="text-sm text-warning mt-1">{errors.notes.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              data-testid="button-cancel-income"
            >
              取消
            </Button>
            <Button 
              type="submit" 
              className="bg-primary text-white hover:bg-blue-700"
              disabled={createIncomeMutation.isPending}
              data-testid="button-save-income"
            >
              {createIncomeMutation.isPending ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
