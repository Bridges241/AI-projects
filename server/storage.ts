import { 
  users, 
  incomeRecords, 
  expenseRecords, 
  budgets,
  entrepreneurshipProjects,
  projectFinancialRecords,
  type User, 
  type InsertUser,
  type IncomeRecord,
  type InsertIncomeRecord,
  type ExpenseRecord,
  type InsertExpenseRecord,
  type Budget,
  type InsertBudget,
  type EntrepreneurshipProject,
  type InsertEntrepreneurshipProject,
  type ProjectFinancialRecord,
  type InsertProjectFinancialRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Income operations
  getIncomeRecords(userId: string, startDate?: string, endDate?: string): Promise<IncomeRecord[]>;
  createIncomeRecord(userId: string, record: InsertIncomeRecord): Promise<IncomeRecord>;
  updateIncomeRecord(id: string, userId: string, record: Partial<InsertIncomeRecord>): Promise<IncomeRecord | undefined>;
  deleteIncomeRecord(id: string, userId: string): Promise<boolean>;
  
  // Expense operations
  getExpenseRecords(userId: string, startDate?: string, endDate?: string): Promise<ExpenseRecord[]>;
  createExpenseRecord(userId: string, record: InsertExpenseRecord): Promise<ExpenseRecord>;
  updateExpenseRecord(id: string, userId: string, record: Partial<InsertExpenseRecord>): Promise<ExpenseRecord | undefined>;
  deleteExpenseRecord(id: string, userId: string): Promise<boolean>;
  
  // Budget operations
  getBudgets(userId: string): Promise<Budget[]>;
  createBudget(userId: string, budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, userId: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string, userId: string): Promise<boolean>;
  
  // Entrepreneurship Project operations
  getEntrepreneurshipProjects(userId: string): Promise<EntrepreneurshipProject[]>;
  createEntrepreneurshipProject(userId: string, project: InsertEntrepreneurshipProject): Promise<EntrepreneurshipProject>;
  updateEntrepreneurshipProject(id: string, userId: string, project: Partial<InsertEntrepreneurshipProject>): Promise<EntrepreneurshipProject | undefined>;
  deleteEntrepreneurshipProject(id: string, userId: string): Promise<boolean>;
  
  // Project Financial Record operations
  getProjectFinancialRecords(projectId: string, startDate?: string, endDate?: string): Promise<ProjectFinancialRecord[]>;
  createProjectFinancialRecord(record: InsertProjectFinancialRecord): Promise<ProjectFinancialRecord>;
  updateProjectFinancialRecord(id: string, record: Partial<InsertProjectFinancialRecord>): Promise<ProjectFinancialRecord | undefined>;
  deleteProjectFinancialRecord(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getIncomeRecords(userId: string, startDate?: string, endDate?: string): Promise<IncomeRecord[]> {
    if (startDate && endDate) {
      return db.select().from(incomeRecords).where(
        and(
          eq(incomeRecords.userId, userId),
          gte(incomeRecords.date, startDate),
          lte(incomeRecords.date, endDate)
        )
      ).orderBy(desc(incomeRecords.date));
    }
    
    return db.select().from(incomeRecords).where(eq(incomeRecords.userId, userId)).orderBy(desc(incomeRecords.date));
  }

  async createIncomeRecord(userId: string, record: InsertIncomeRecord): Promise<IncomeRecord> {
    const [created] = await db
      .insert(incomeRecords)
      .values({ ...record, userId })
      .returning();
    return created;
  }

  async updateIncomeRecord(id: string, userId: string, record: Partial<InsertIncomeRecord>): Promise<IncomeRecord | undefined> {
    const [updated] = await db
      .update(incomeRecords)
      .set(record)
      .where(and(eq(incomeRecords.id, id), eq(incomeRecords.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteIncomeRecord(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(incomeRecords)
      .where(and(eq(incomeRecords.id, id), eq(incomeRecords.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getExpenseRecords(userId: string, startDate?: string, endDate?: string): Promise<ExpenseRecord[]> {
    if (startDate && endDate) {
      return db.select().from(expenseRecords).where(
        and(
          eq(expenseRecords.userId, userId),
          gte(expenseRecords.date, startDate),
          lte(expenseRecords.date, endDate)
        )
      ).orderBy(desc(expenseRecords.date));
    }
    
    return db.select().from(expenseRecords).where(eq(expenseRecords.userId, userId)).orderBy(desc(expenseRecords.date));
  }

  async createExpenseRecord(userId: string, record: InsertExpenseRecord): Promise<ExpenseRecord> {
    const [created] = await db
      .insert(expenseRecords)
      .values({ ...record, userId })
      .returning();
    return created;
  }

  async updateExpenseRecord(id: string, userId: string, record: Partial<InsertExpenseRecord>): Promise<ExpenseRecord | undefined> {
    const [updated] = await db
      .update(expenseRecords)
      .set(record)
      .where(and(eq(expenseRecords.id, id), eq(expenseRecords.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteExpenseRecord(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(expenseRecords)
      .where(and(eq(expenseRecords.id, id), eq(expenseRecords.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getBudgets(userId: string): Promise<Budget[]> {
    return db.select().from(budgets).where(eq(budgets.userId, userId));
  }

  async createBudget(userId: string, budget: InsertBudget): Promise<Budget> {
    const [created] = await db
      .insert(budgets)
      .values({ ...budget, userId })
      .returning();
    return created;
  }

  async updateBudget(id: string, userId: string, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [updated] = await db
      .update(budgets)
      .set(budget)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Entrepreneurship Project operations
  async getEntrepreneurshipProjects(userId: string): Promise<EntrepreneurshipProject[]> {
    return db.select().from(entrepreneurshipProjects).where(eq(entrepreneurshipProjects.userId, userId));
  }

  async createEntrepreneurshipProject(userId: string, project: InsertEntrepreneurshipProject): Promise<EntrepreneurshipProject> {
    const [created] = await db
      .insert(entrepreneurshipProjects)
      .values({ ...project, userId })
      .returning();
    return created;
  }

  async updateEntrepreneurshipProject(id: string, userId: string, project: Partial<InsertEntrepreneurshipProject>): Promise<EntrepreneurshipProject | undefined> {
    const [updated] = await db
      .update(entrepreneurshipProjects)
      .set(project)
      .where(and(eq(entrepreneurshipProjects.id, id), eq(entrepreneurshipProjects.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteEntrepreneurshipProject(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(entrepreneurshipProjects)
      .where(and(eq(entrepreneurshipProjects.id, id), eq(entrepreneurshipProjects.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Project Financial Record operations
  async getProjectFinancialRecords(projectId: string, startDate?: string, endDate?: string): Promise<ProjectFinancialRecord[]> {
    if (startDate && endDate) {
      return db.select().from(projectFinancialRecords).where(
        and(
          eq(projectFinancialRecords.projectId, projectId),
          gte(projectFinancialRecords.date, startDate),
          lte(projectFinancialRecords.date, endDate)
        )
      ).orderBy(desc(projectFinancialRecords.date));
    }
    
    return db.select().from(projectFinancialRecords).where(eq(projectFinancialRecords.projectId, projectId)).orderBy(desc(projectFinancialRecords.date));
  }

  async createProjectFinancialRecord(record: InsertProjectFinancialRecord): Promise<ProjectFinancialRecord> {
    const [created] = await db
      .insert(projectFinancialRecords)
      .values(record)
      .returning();
    return created;
  }

  async updateProjectFinancialRecord(id: string, record: Partial<InsertProjectFinancialRecord>): Promise<ProjectFinancialRecord | undefined> {
    const [updated] = await db
      .update(projectFinancialRecords)
      .set(record)
      .where(eq(projectFinancialRecords.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProjectFinancialRecord(id: string): Promise<boolean> {
    const result = await db
      .delete(projectFinancialRecords)
      .where(eq(projectFinancialRecords.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
