import {
  users,
  scenarios,
  trainingSessions,
  botSessions,
  userProgress,
  type User,
  type UpsertUser,
  type Scenario,
  type InsertScenario,
  type TrainingSession,
  type InsertTrainingSession,
  type BotSession,
  type InsertBotSession,
  type UserProgress,
  type InsertUserProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Credit operations
  deductCredits(userId: string, amount: number): Promise<boolean>;
  regenerateCredits(userId: string): Promise<User>;
  
  // Scenario operations
  getScenariosByType(type: 'gto' | 'icm'): Promise<Scenario[]>;
  getScenario(id: number): Promise<Scenario | undefined>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  
  // Training session operations
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  getUserTrainingSessions(userId: string, limit?: number): Promise<TrainingSession[]>;
  
  // Bot session operations
  createBotSession(session: InsertBotSession): Promise<BotSession>;
  updateBotSession(id: number, updates: Partial<BotSession>): Promise<BotSession>;
  getUserBotSessions(userId: string, limit?: number): Promise<BotSession[]>;
  
  // Progress operations
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, progress: Partial<InsertUserProgress>): Promise<UserProgress>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Credit operations
  async deductCredits(userId: string, amount: number): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        credits: sql`credits - ${amount}`,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, userId), sql`credits >= ${amount}`))
      .returning();
    
    return result.length > 0;
  }

  async regenerateCredits(userId: string): Promise<User> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const [user] = await db
      .update(users)
      .set({
        credits: sql`LEAST(credits + 100, 1000)`,
        lastCreditRegeneration: now,
        updatedAt: now,
      })
      .where(and(
        eq(users.id, userId),
        sql`last_credit_regeneration < ${twentyFourHoursAgo}`
      ))
      .returning();
    
    if (!user) {
      const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
      return existingUser;
    }
    
    return user;
  }

  // Scenario operations
  async getScenariosByType(type: 'gto' | 'icm'): Promise<Scenario[]> {
    return await db
      .select()
      .from(scenarios)
      .where(eq(scenarios.type, type))
      .orderBy(scenarios.difficulty, scenarios.title);
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario;
  }

  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const [newScenario] = await db
      .insert(scenarios)
      .values(scenario)
      .returning();
    return newScenario;
  }

  // Training session operations
  async createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession> {
    const [newSession] = await db
      .insert(trainingSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getUserTrainingSessions(userId: string, limit = 10): Promise<TrainingSession[]> {
    return await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.userId, userId))
      .orderBy(desc(trainingSessions.createdAt))
      .limit(limit);
  }

  // Bot session operations
  async createBotSession(session: InsertBotSession): Promise<BotSession> {
    const [newSession] = await db
      .insert(botSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateBotSession(id: number, updates: Partial<BotSession>): Promise<BotSession> {
    const [updatedSession] = await db
      .update(botSessions)
      .set(updates)
      .where(eq(botSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getUserBotSessions(userId: string, limit = 10): Promise<BotSession[]> {
    return await db
      .select()
      .from(botSessions)
      .where(eq(botSessions.userId, userId))
      .orderBy(desc(botSessions.startedAt))
      .limit(limit);
  }

  // Progress operations
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    return progress;
  }

  async updateUserProgress(userId: string, progressData: Partial<InsertUserProgress>): Promise<UserProgress> {
    const [updatedProgress] = await db
      .insert(userProgress)
      .values({ userId, ...progressData })
      .onConflictDoUpdate({
        target: userProgress.userId,
        set: {
          ...progressData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updatedProgress;
  }
}

export const storage = new DatabaseStorage();
