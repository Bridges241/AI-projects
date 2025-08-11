import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, date, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// 創業專案表
export const entrepreneurshipProjects = pgTable("entrepreneurship_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  status: text("status").notNull().default("active"), // "active", "completed", "paused"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 創業專案財務記錄表 (會計損益表格式)
export const projectFinancialRecords = pgTable("project_financial_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  type: text("type").notNull(), // "revenue", "expense"
  category: text("category").notNull(), // 會計科目
  subCategory: text("sub_category"), // 明細科目
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  isPlanned: boolean("is_planned").notNull().default(false), // 計畫 vs 現實
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const incomeRecords = pgTable("income_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // "salary", "investment", "business"
  category: text("category").notNull(), // specific income category
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  isPlanned: boolean("is_planned").notNull().default(false), // 計畫 vs 現實
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenseRecords = pgTable("expense_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(), // "living", "loan", "insurance", "investment", "entertainment", "other"
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  description: text("description"),
  notes: text("notes"),
  isPlanned: boolean("is_planned").notNull().default(false), // 計畫 vs 現實
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  period: text("period").notNull().default("monthly"), // "monthly", "yearly"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const entrepreneurshipProjectsRelations = relations(entrepreneurshipProjects, ({ one, many }) => ({
  user: one(users, {
    fields: [entrepreneurshipProjects.userId],
    references: [users.id],
  }),
  financialRecords: many(projectFinancialRecords),
}));

export const projectFinancialRecordsRelations = relations(projectFinancialRecords, ({ one }) => ({
  project: one(entrepreneurshipProjects, {
    fields: [projectFinancialRecords.projectId],
    references: [entrepreneurshipProjects.id],
  }),
}));

export const incomeRecordsRelations = relations(incomeRecords, ({ one }) => ({
  user: one(users, {
    fields: [incomeRecords.userId],
    references: [users.id],
  }),
}));

export const expenseRecordsRelations = relations(expenseRecords, ({ one }) => ({
  user: one(users, {
    fields: [expenseRecords.userId],
    references: [users.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEntrepreneurshipProjectSchema = createInsertSchema(entrepreneurshipProjects).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertProjectFinancialRecordSchema = createInsertSchema(projectFinancialRecords).omit({
  id: true,
  createdAt: true,
});

export const insertIncomeRecordSchema = createInsertSchema(incomeRecords).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertExpenseRecordSchema = createInsertSchema(expenseRecords).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEntrepreneurshipProject = z.infer<typeof insertEntrepreneurshipProjectSchema>;
export type EntrepreneurshipProject = typeof entrepreneurshipProjects.$inferSelect;
export type InsertProjectFinancialRecord = z.infer<typeof insertProjectFinancialRecordSchema>;
export type ProjectFinancialRecord = typeof projectFinancialRecords.$inferSelect;
export type InsertIncomeRecord = z.infer<typeof insertIncomeRecordSchema>;
export type IncomeRecord = typeof incomeRecords.$inferSelect;
export type InsertExpenseRecord = z.infer<typeof insertExpenseRecordSchema>;
export type ExpenseRecord = typeof expenseRecords.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;
