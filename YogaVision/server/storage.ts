import {
  users,
  namasteCodes,
  icd11Codes,
  conceptMappings,
  problemEntries,
  auditEntries,
  chatMessages,
  type User,
  type UpsertUser,
  type NamasteCode,
  type InsertNamasteCode,
  type Icd11Code,
  type InsertIcd11Code,
  type ConceptMapping,
  type InsertConceptMapping,
  type ProblemEntry,
  type InsertProblemEntry,
  type AuditEntry,
  type InsertAuditEntry,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // NAMASTE codes
  createNamasteCode(code: InsertNamasteCode): Promise<NamasteCode>;
  getNamasteCodes(query?: string, limit?: number): Promise<NamasteCode[]>;
  getNamasteCodeByCode(code: string): Promise<NamasteCode | undefined>;
  bulkInsertNamasteCodes(codes: InsertNamasteCode[]): Promise<void>;

  // ICD-11 codes
  createIcd11Code(code: InsertIcd11Code): Promise<Icd11Code>;
  getIcd11Codes(query?: string, module?: string, limit?: number): Promise<Icd11Code[]>;
  getIcd11CodeByCode(code: string): Promise<Icd11Code | undefined>;

  // Concept mappings
  createConceptMapping(mapping: InsertConceptMapping): Promise<ConceptMapping>;
  getConceptMappings(sourceCode?: string, targetSystem?: string): Promise<ConceptMapping[]>;
  findMappingForCode(sourceCode: string, sourceSystem: string, targetSystem: string): Promise<ConceptMapping | undefined>;

  // Problem entries
  createProblemEntry(entry: InsertProblemEntry): Promise<ProblemEntry>;
  getProblemEntries(patientId?: string, userId?: string): Promise<ProblemEntry[]>;
  deleteProblemEntry(id: string): Promise<void>;

  // Audit trail
  createAuditEntry(entry: InsertAuditEntry): Promise<AuditEntry>;
  getAuditEntries(userId?: string, limit?: number): Promise<AuditEntry[]>;

  // Chat messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string, limit?: number): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  // NAMASTE codes
  async createNamasteCode(code: InsertNamasteCode): Promise<NamasteCode> {
    const [namasteCode] = await db
      .insert(namasteCodes)
      .values(code)
      .returning();
    return namasteCode;
  }

  async getNamasteCodes(query?: string, limit = 50): Promise<NamasteCode[]> {
    let dbQuery = db.select().from(namasteCodes);
    
    if (query) {
      dbQuery = dbQuery.where(
        or(
          like(namasteCodes.display, `%${query}%`),
          like(namasteCodes.code, `%${query}%`),
          like(namasteCodes.definition, `%${query}%`)
        )
      );
    }
    
    return await dbQuery.orderBy(asc(namasteCodes.display)).limit(limit);
  }

  async getNamasteCodeByCode(code: string): Promise<NamasteCode | undefined> {
    const [namasteCode] = await db
      .select()
      .from(namasteCodes)
      .where(eq(namasteCodes.code, code));
    return namasteCode;
  }

  async bulkInsertNamasteCodes(codes: InsertNamasteCode[]): Promise<void> {
    if (codes.length === 0) return;
    
    await db.insert(namasteCodes).values(codes).onConflictDoNothing();
  }

  // ICD-11 codes
  async createIcd11Code(code: InsertIcd11Code): Promise<Icd11Code> {
    const [icd11Code] = await db
      .insert(icd11Codes)
      .values(code)
      .returning();
    return icd11Code;
  }

  async getIcd11Codes(query?: string, module?: string, limit = 50): Promise<Icd11Code[]> {
    let dbQuery = db.select().from(icd11Codes);
    
    const conditions = [];
    if (query) {
      conditions.push(
        or(
          like(icd11Codes.display, `%${query}%`),
          like(icd11Codes.code, `%${query}%`),
          like(icd11Codes.definition, `%${query}%`)
        )
      );
    }
    
    if (module) {
      conditions.push(eq(icd11Codes.module, module));
    }
    
    if (conditions.length > 0) {
      dbQuery = dbQuery.where(conditions.length === 1 ? conditions[0] : or(...conditions));
    }
    
    return await dbQuery.orderBy(asc(icd11Codes.display)).limit(limit);
  }

  async getIcd11CodeByCode(code: string): Promise<Icd11Code | undefined> {
    const [icd11Code] = await db
      .select()
      .from(icd11Codes)
      .where(eq(icd11Codes.code, code));
    return icd11Code;
  }

  // Concept mappings
  async createConceptMapping(mapping: InsertConceptMapping): Promise<ConceptMapping> {
    const [conceptMapping] = await db
      .insert(conceptMappings)
      .values(mapping)
      .returning();
    return conceptMapping;
  }

  async getConceptMappings(sourceCode?: string, targetSystem?: string): Promise<ConceptMapping[]> {
    let dbQuery = db.select().from(conceptMappings);
    
    const conditions = [];
    if (sourceCode) {
      conditions.push(eq(conceptMappings.sourceCode, sourceCode));
    }
    
    if (targetSystem) {
      conditions.push(eq(conceptMappings.targetSystem, targetSystem));
    }
    
    if (conditions.length > 0) {
      dbQuery = dbQuery.where(conditions.length === 1 ? conditions[0] : or(...conditions));
    }
    
    return await dbQuery.orderBy(desc(conceptMappings.confidence));
  }

  async findMappingForCode(sourceCode: string, sourceSystem: string, targetSystem: string): Promise<ConceptMapping | undefined> {
    const [mapping] = await db
      .select()
      .from(conceptMappings)
      .where(
        eq(conceptMappings.sourceCode, sourceCode)
      );
    return mapping;
  }

  // Problem entries
  async createProblemEntry(entry: InsertProblemEntry): Promise<ProblemEntry> {
    const [problemEntry] = await db
      .insert(problemEntries)
      .values(entry)
      .returning();
    return problemEntry;
  }

  async getProblemEntries(patientId?: string, userId?: string): Promise<ProblemEntry[]> {
    let dbQuery = db.select().from(problemEntries);
    
    const conditions = [];
    if (patientId) {
      conditions.push(eq(problemEntries.patientId, patientId));
    }
    
    if (userId) {
      conditions.push(eq(problemEntries.createdBy, userId));
    }
    
    if (conditions.length > 0) {
      dbQuery = dbQuery.where(conditions.length === 1 ? conditions[0] : or(...conditions));
    }
    
    return await dbQuery.orderBy(desc(problemEntries.createdAt));
  }

  async deleteProblemEntry(id: string): Promise<void> {
    await db.delete(problemEntries).where(eq(problemEntries.id, id));
  }

  // Audit trail
  async createAuditEntry(entry: InsertAuditEntry): Promise<AuditEntry> {
    const [auditEntry] = await db
      .insert(auditEntries)
      .values(entry)
      .returning();
    return auditEntry;
  }

  async getAuditEntries(userId?: string, limit = 100): Promise<AuditEntry[]> {
    let dbQuery = db.select().from(auditEntries);
    
    if (userId) {
      dbQuery = dbQuery.where(eq(auditEntries.userId, userId));
    }
    
    return await dbQuery.orderBy(desc(auditEntries.timestamp)).limit(limit);
  }

  // Chat messages
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return chatMessage;
  }

  async getChatMessages(sessionId: string, limit = 50): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
