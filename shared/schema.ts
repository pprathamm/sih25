import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const terminologyCodes = pgTable("terminology_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  display: text("display").notNull(),
  definition: text("definition"),
  system: text("system").notNull(), // NAMASTE, ICD-11-TM2, ICD-11-BIOMEDICINE
  createdAt: timestamp("created_at").defaultNow(),
});

export const conceptMappings = pgTable("concept_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceCode: text("source_code").notNull(),
  sourceSystem: text("source_system").notNull(),
  targetCode: text("target_code").notNull(),
  targetSystem: text("target_system").notNull(),
  equivalence: text("equivalence").notNull(), // equivalent, wider, narrower, inexact
  confidence: text("confidence"), // AI confidence score
  createdAt: timestamp("created_at").defaultNow(),
});

export const problemListEntries = pgTable("problem_list_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: text("patient_id"),
  namasteCode: text("namaste_code"),
  icd11Code: text("icd11_code"),
  status: text("status").default("active"), // active, resolved, inactive
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditEvents = pgTable("audit_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(), // search, map, upload, validate
  details: jsonb("details"),
  userId: text("user_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTerminologyCodeSchema = createInsertSchema(terminologyCodes).omit({
  id: true,
  createdAt: true,
});

export const insertConceptMappingSchema = createInsertSchema(conceptMappings).omit({
  id: true,
  createdAt: true,
});

export const insertProblemListEntrySchema = createInsertSchema(problemListEntries).omit({
  id: true,
  createdAt: true,
});

export const insertAuditEventSchema = createInsertSchema(auditEvents).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTerminologyCode = z.infer<typeof insertTerminologyCodeSchema>;
export type TerminologyCode = typeof terminologyCodes.$inferSelect;

export type InsertConceptMapping = z.infer<typeof insertConceptMappingSchema>;
export type ConceptMapping = typeof conceptMappings.$inferSelect;

export type InsertProblemListEntry = z.infer<typeof insertProblemListEntrySchema>;
export type ProblemListEntry = typeof problemListEntries.$inferSelect;

export type InsertAuditEvent = z.infer<typeof insertAuditEventSchema>;
export type AuditEvent = typeof auditEvents.$inferSelect;

// API Types
export interface SearchRequest {
  query: string;
  systems?: string[];
  includeSuggestions?: boolean;
}

export interface SearchResult {
  code: string;
  display: string;
  definition?: string;
  system: string;
  mappings?: ConceptMapping[];
}

export interface FHIRBundle {
  resourceType: "Bundle";
  type: string;
  entry: Array<{
    resource: any;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  summary?: {
    resources: number;
    conditions: number;
    namasteCodes: number;
    icd11Codes: number;
  };
}
