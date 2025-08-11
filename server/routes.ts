import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertIncomeRecordSchema, 
  insertExpenseRecordSchema, 
  insertBudgetSchema,
  insertEntrepreneurshipProjectSchema,
  insertProjectFinancialRecordSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEMO_USER_ID = "demo-user-id";

  // Income routes
  app.get("/api/income", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const records = await storage.getIncomeRecords(
        DEMO_USER_ID,
        startDate as string,
        endDate as string
      );
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income records" });
    }
  });

  app.post("/api/income", async (req, res) => {
    try {
      const data = insertIncomeRecordSchema.parse(req.body);
      const record = await storage.createIncomeRecord(DEMO_USER_ID, data);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid income record data" });
    }
  });

  app.put("/api/income/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertIncomeRecordSchema.partial().parse(req.body);
      const record = await storage.updateIncomeRecord(id, DEMO_USER_ID, data);
      if (!record) {
        return res.status(404).json({ error: "Income record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid income record data" });
    }
  });

  app.delete("/api/income/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteIncomeRecord(id, DEMO_USER_ID);
      if (!success) {
        return res.status(404).json({ error: "Income record not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete income record" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const records = await storage.getExpenseRecords(
        DEMO_USER_ID,
        startDate as string,
        endDate as string
      );
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense records" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const data = insertExpenseRecordSchema.parse(req.body);
      const record = await storage.createExpenseRecord(DEMO_USER_ID, data);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense record data" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertExpenseRecordSchema.partial().parse(req.body);
      const record = await storage.updateExpenseRecord(id, DEMO_USER_ID, data);
      if (!record) {
        return res.status(404).json({ error: "Expense record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense record data" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteExpenseRecord(id, DEMO_USER_ID);
      if (!success) {
        return res.status(404).json({ error: "Expense record not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense record" });
    }
  });

  // Budget routes
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets(DEMO_USER_ID);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const data = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(DEMO_USER_ID, data);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, DEMO_USER_ID, data);
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBudget(id, DEMO_USER_ID);
      if (!success) {
        return res.status(404).json({ error: "Budget not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete budget" });
    }
  });

  // Financial analysis routes
  app.get("/api/analysis/summary", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const [incomeRecords, expenseRecords] = await Promise.all([
        storage.getIncomeRecords(DEMO_USER_ID, startDate as string, endDate as string),
        storage.getExpenseRecords(DEMO_USER_ID, startDate as string, endDate as string)
      ]);

      const totalIncome = incomeRecords.reduce((sum, record) => sum + parseFloat(record.amount), 0);
      const totalExpenses = expenseRecords.reduce((sum, record) => sum + parseFloat(record.amount), 0);
      const netIncome = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

      res.json({
        totalIncome,
        totalExpenses,
        netIncome,
        savingsRate
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate financial summary" });
    }
  });

  // Entrepreneurship Project routes
  app.get("/api/entrepreneurship/projects", async (req, res) => {
    try {
      const projects = await storage.getEntrepreneurshipProjects(DEMO_USER_ID);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entrepreneurship projects" });
    }
  });

  app.post("/api/entrepreneurship/projects", async (req, res) => {
    try {
      const data = insertEntrepreneurshipProjectSchema.parse(req.body);
      const project = await storage.createEntrepreneurshipProject(DEMO_USER_ID, data);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.put("/api/entrepreneurship/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertEntrepreneurshipProjectSchema.partial().parse(req.body);
      const project = await storage.updateEntrepreneurshipProject(id, DEMO_USER_ID, data);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.delete("/api/entrepreneurship/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEntrepreneurshipProject(id, DEMO_USER_ID);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Project Financial Record routes
  app.get("/api/entrepreneurship/projects/:projectId/records", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;
      const records = await storage.getProjectFinancialRecords(
        projectId,
        startDate as string,
        endDate as string
      );
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project financial records" });
    }
  });

  app.post("/api/entrepreneurship/projects/:projectId/records", async (req, res) => {
    try {
      const { projectId } = req.params;
      const data = insertProjectFinancialRecordSchema.parse({
        ...req.body,
        projectId
      });
      const record = await storage.createProjectFinancialRecord(data);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid financial record data" });
    }
  });

  app.put("/api/entrepreneurship/records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertProjectFinancialRecordSchema.partial().parse(req.body);
      const record = await storage.updateProjectFinancialRecord(id, data);
      if (!record) {
        return res.status(404).json({ error: "Financial record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid financial record data" });
    }
  });

  app.delete("/api/entrepreneurship/records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProjectFinancialRecord(id);
      if (!success) {
        return res.status(404).json({ error: "Financial record not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete financial record" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
