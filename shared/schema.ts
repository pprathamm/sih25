import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// NAMASTE terminology codes
export const namasteCodes = pgTable("namaste_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  display: text("display").notNull(),
  definition: text("definition"),
  system: varchar("system").notNull().default("http://namaste.gov.in/CodeSystem"),
  category: varchar("category"), // AYU, SID, UNA
  subCategory: varchar("sub_category"), // DIG, RES, NEU, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ICD-11 codes for mapping
export const icd11Codes = pgTable("icd11_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  display: text("display").notNull(),
  definition: text("definition"),
  system: varchar("system").notNull().default("http://id.who.int/icd/release/11/mms"),
  module: varchar("module"), // TM2, biomedicine
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Concept mappings between NAMASTE and ICD-11
export const conceptMappings = pgTable("concept_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceCode: varchar("source_code").notNull(),
  sourceSystem: varchar("source_system").notNull(),
  targetCode: varchar("target_code").notNull(),
  targetSystem: varchar("target_system").notNull(),
  equivalence: varchar("equivalence").notNull().default("equivalent"), // equivalent, wider, narrower, inexact
  confidence: integer("confidence").default(100), // 0-100
  aiGenerated: boolean("ai_generated").default(false),
  verifiedBy: varchar("verified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Problem list entries for patients
export const problemEntries = pgTable("problem_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id"), // Reference to patient (demo)
  namasteCode: varchar("namaste_code"),
  namasteDisplay: text("namaste_display"),
  icd11Code: varchar("icd11_code"),
  icd11Display: text("icd11_display"),
  clinicalStatus: varchar("clinical_status").default("active"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit trail for all operations
export const auditEntries = pgTable("audit_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operation: varchar("operation").notNull(),
  userId: varchar("user_id"),
  sessionId: varchar("session_id"),
  data: jsonb("data"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Chat messages for AI assistant
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id"),
  message: text("message").notNull(),
  response: text("response"),
  context: jsonb("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertNamasteCodeSchema = createInsertSchema(namasteCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIcd11CodeSchema = createInsertSchema(icd11Codes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConceptMappingSchema = createInsertSchema(conceptMappings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProblemEntrySchema = createInsertSchema(problemEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditEntrySchema = createInsertSchema(auditEntries).omit({
  id: true,
  timestamp: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type NamasteCode = typeof namasteCodes.$inferSelect;
export type InsertNamasteCode = z.infer<typeof insertNamasteCodeSchema>;
export type Icd11Code = typeof icd11Codes.$inferSelect;
export type InsertIcd11Code = z.infer<typeof insertIcd11CodeSchema>;
export type ConceptMapping = typeof conceptMappings.$inferSelect;
export type InsertConceptMapping = z.infer<typeof insertConceptMappingSchema>;
export type ProblemEntry = typeof problemEntries.$inferSelect;
export type InsertProblemEntry = z.infer<typeof insertProblemEntrySchema>;
export type AuditEntry = typeof auditEntries.$inferSelect;
export type InsertAuditEntry = z.infer<typeof insertAuditEntrySchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
