import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  credits: integer("credits").default(1000).notNull(),
  lastCreditRegeneration: timestamp("last_credit_regeneration").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training scenarios
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // 'gto' or 'icm'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  situation: text("situation").notNull(),
  gameType: varchar("game_type", { length: 50 }).notNull(), // '6max', '9max', 'hu', etc.
  position: varchar("position", { length: 10 }), // 'BTN', 'BB', 'UTG', etc.
  stackSizes: jsonb("stack_sizes"), // Array of stack sizes
  boardCards: jsonb("board_cards"), // Community cards
  heroCards: jsonb("hero_cards"), // Hero's hole cards
  potSize: integer("pot_size"),
  betSize: integer("bet_size"),
  actions: jsonb("actions"), // Available actions with EV
  optimalAction: varchar("optimal_action", { length: 50 }),
  difficulty: varchar("difficulty", { length: 20 }).default("beginner"), // 'beginner', 'intermediate', 'advanced'
  credits: integer("credits").default(50).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User training sessions
export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  scenarioId: integer("scenario_id").notNull().references(() => scenarios.id),
  userAction: varchar("user_action", { length: 50 }).notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"), // in seconds
  evDifference: decimal("ev_difference", { precision: 10, scale: 2 }), // EV difference from optimal
  creditsSpent: integer("credits_spent").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bot practice sessions
export const botSessions = pgTable("bot_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  botType: varchar("bot_type", { length: 50 }).notNull(), // 'gto', 'lag', 'tag'
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  handsPlayed: integer("hands_played").default(0),
  handsWon: integer("hands_won").default(0),
  totalProfit: decimal("total_profit", { precision: 10, scale: 2 }).default("0"),
  creditsSpent: integer("credits_spent").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gtoAccuracy: decimal("gto_accuracy", { precision: 5, scale: 2 }).default("0"),
  icmScore: decimal("icm_score", { precision: 5, scale: 2 }).default("0"),
  totalHandsPlayed: integer("total_hands_played").default(0),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0"),
  preflopAccuracy: decimal("preflop_accuracy", { precision: 5, scale: 2 }).default("0"),
  postflopAccuracy: decimal("postflop_accuracy", { precision: 5, scale: 2 }).default("0"),
  bettingSizeAccuracy: decimal("betting_size_accuracy", { precision: 5, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  trainingSessions: many(trainingSessions),
  botSessions: many(botSessions),
  progress: one(userProgress, {
    fields: [users.id],
    references: [userProgress.userId],
  }),
}));

export const scenariosRelations = relations(scenarios, ({ many }) => ({
  trainingSessions: many(trainingSessions),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one }) => ({
  user: one(users, {
    fields: [trainingSessions.userId],
    references: [users.id],
  }),
  scenario: one(scenarios, {
    fields: [trainingSessions.scenarioId],
    references: [scenarios.id],
  }),
}));

export const botSessionsRelations = relations(botSessions, ({ one }) => ({
  user: one(users, {
    fields: [botSessions.userId],
    references: [users.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
  lastCreditRegeneration: true,
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({
  id: true,
  createdAt: true,
});

export const insertBotSessionSchema = createInsertSchema(botSessions).omit({
  id: true,
  startedAt: true,
  endedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type BotSession = typeof botSessions.$inferSelect;
export type InsertBotSession = z.infer<typeof insertBotSessionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
