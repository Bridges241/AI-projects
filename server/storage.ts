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

export class MemoryStorage implements IStorage {
  private users: User[] = [{
    id: "demo-user",
    username: "demo",
    email: "demo@example.com",
    name: "Demo User"
  }];
  private incomeRecords: IncomeRecord[] = [
    {
      id: "294888a7-c635-43f5-bde3-0efb1b4e6b37",
      userId: "demo-user",
      amount: "50000",
      source: "主要工作",
      type: "salary",
      description: "月薪",
      isPlanned: false,
      date: "2024-12-01",
      createdAt: new Date("2024-12-01")
    },
    {
      id: "394888a7-c635-43f5-bde3-0efb1b4e6b38",
      userId: "demo-user",
      amount: "20000",
      source: "股票投資",
      type: "investment",
      description: "股息收入",
      isPlanned: false,
      date: "2024-12-10",
      createdAt: new Date("2024-12-10")
    }
  ];
  private expenseRecords: ExpenseRecord[] = [
    {
      id: "d941abaf-5a49-4daf-822f-c025d7ddfe7d",
      userId: "demo-user",
      amount: "15000",
      category: "食物",
      description: "餐飲費用",
      isPlanned: false,
      date: "2024-12-01",
      createdAt: new Date("2024-12-01")
    },
    {
      id: "e941abaf-5a49-4daf-822f-c025d7ddfe7e",
      userId: "demo-user",
      amount: "8000",
      category: "交通",
      description: "通勤費用",
      isPlanned: false,
      date: "2024-12-05",
      createdAt: new Date("2024-12-05")
    }
  ];
  private budgets: Budget[] = [];
  private entrepreneurshipProjects: EntrepreneurshipProject[] = [];
  private projectFinancialRecords: ProjectFinancialRecord[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...insertUser
    };
    this.users.push(user);
    return user;
  }

  async getIncomeRecords(userId: string, startDate?: string, endDate?: string): Promise<IncomeRecord[]> {
    let records = this.incomeRecords.filter(record => record.userId === userId);
    if (startDate) {
      records = records.filter(record => record.date >= startDate);
    }
    if (endDate) {
      records = records.filter(record => record.date <= endDate);
    }
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createIncomeRecord(userId: string, insertRecord: InsertIncomeRecord): Promise<IncomeRecord> {
    const record: IncomeRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      createdAt: new Date(),
      ...insertRecord
    };
    this.incomeRecords.push(record);
    return record;
  }

  async updateIncomeRecord(id: string, userId: string, update: Partial<InsertIncomeRecord>): Promise<IncomeRecord | undefined> {
    const index = this.incomeRecords.findIndex(record => record.id === id && record.userId === userId);
    if (index === -1) return undefined;
    this.incomeRecords[index] = { ...this.incomeRecords[index], ...update };
    return this.incomeRecords[index];
  }

  async deleteIncomeRecord(id: string, userId: string): Promise<boolean> {
    const index = this.incomeRecords.findIndex(record => record.id === id && record.userId === userId);
    if (index === -1) return false;
    this.incomeRecords.splice(index, 1);
    return true;
  }

  async getExpenseRecords(userId: string, startDate?: string, endDate?: string): Promise<ExpenseRecord[]> {
    let records = this.expenseRecords.filter(record => record.userId === userId);
    if (startDate) {
      records = records.filter(record => record.date >= startDate);
    }
    if (endDate) {
      records = records.filter(record => record.date <= endDate);
    }
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createExpenseRecord(userId: string, insertRecord: InsertExpenseRecord): Promise<ExpenseRecord> {
    const record: ExpenseRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      createdAt: new Date(),
      ...insertRecord
    };
    this.expenseRecords.push(record);
    return record;
  }

  async updateExpenseRecord(id: string, userId: string, update: Partial<InsertExpenseRecord>): Promise<ExpenseRecord | undefined> {
    const index = this.expenseRecords.findIndex(record => record.id === id && record.userId === userId);
    if (index === -1) return undefined;
    this.expenseRecords[index] = { ...this.expenseRecords[index], ...update };
    return this.expenseRecords[index];
  }

  async deleteExpenseRecord(id: string, userId: string): Promise<boolean> {
    const index = this.expenseRecords.findIndex(record => record.id === id && record.userId === userId);
    if (index === -1) return false;
    this.expenseRecords.splice(index, 1);
    return true;
  }

  async getBudgets(userId: string): Promise<Budget[]> {
    return this.budgets.filter(budget => budget.userId === userId);
  }

  async createBudget(userId: string, insertBudget: InsertBudget): Promise<Budget> {
    const budget: Budget = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      createdAt: new Date(),
      ...insertBudget
    };
    this.budgets.push(budget);
    return budget;
  }

  async updateBudget(id: string, userId: string, update: Partial<InsertBudget>): Promise<Budget | undefined> {
    const index = this.budgets.findIndex(budget => budget.id === id && budget.userId === userId);
    if (index === -1) return undefined;
    this.budgets[index] = { ...this.budgets[index], ...update };
    return this.budgets[index];
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    const index = this.budgets.findIndex(budget => budget.id === id && budget.userId === userId);
    if (index === -1) return false;
    this.budgets.splice(index, 1);
    return true;
  }

  async getEntrepreneurshipProjects(userId: string): Promise<EntrepreneurshipProject[]> {
    return this.entrepreneurshipProjects.filter(project => project.userId === userId);
  }

  async createEntrepreneurshipProject(userId: string, insertProject: InsertEntrepreneurshipProject): Promise<EntrepreneurshipProject> {
    const project: EntrepreneurshipProject = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      createdAt: new Date(),
      ...insertProject
    };
    this.entrepreneurshipProjects.push(project);
    return project;
  }

  async updateEntrepreneurshipProject(id: string, userId: string, update: Partial<InsertEntrepreneurshipProject>): Promise<EntrepreneurshipProject | undefined> {
    const index = this.entrepreneurshipProjects.findIndex(project => project.id === id && project.userId === userId);
    if (index === -1) return undefined;
    this.entrepreneurshipProjects[index] = { ...this.entrepreneurshipProjects[index], ...update };
    return this.entrepreneurshipProjects[index];
  }

  async deleteEntrepreneurshipProject(id: string, userId: string): Promise<boolean> {
    const index = this.entrepreneurshipProjects.findIndex(project => project.id === id && project.userId === userId);
    if (index === -1) return false;
    this.entrepreneurshipProjects.splice(index, 1);
    return true;
  }

  async getProjectFinancialRecords(projectId: string, startDate?: string, endDate?: string): Promise<ProjectFinancialRecord[]> {
    let records = this.projectFinancialRecords.filter(record => record.projectId === projectId);
    if (startDate) {
      records = records.filter(record => record.date >= startDate);
    }
    if (endDate) {
      records = records.filter(record => record.date <= endDate);
    }
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createProjectFinancialRecord(insertRecord: InsertProjectFinancialRecord): Promise<ProjectFinancialRecord> {
    const record: ProjectFinancialRecord = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      ...insertRecord
    };
    this.projectFinancialRecords.push(record);
    return record;
  }

  async updateProjectFinancialRecord(id: string, update: Partial<InsertProjectFinancialRecord>): Promise<ProjectFinancialRecord | undefined> {
    const index = this.projectFinancialRecords.findIndex(record => record.id === id);
    if (index === -1) return undefined;
    this.projectFinancialRecords[index] = { ...this.projectFinancialRecords[index], ...update };
    return this.projectFinancialRecords[index];
  }

  async deleteProjectFinancialRecord(id: string): Promise<boolean> {
    const index = this.projectFinancialRecords.findIndex(record => record.id === id);
    if (index === -1) return false;
    this.projectFinancialRecords.splice(index, 1);
    return true;
  }
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

// Use MemoryStorage for demo purposes
export const storage = new MemoryStorage();
