import { 
  type User, 
  type InsertUser,
  type TerminologyCode,
  type InsertTerminologyCode,
  type ConceptMapping,
  type InsertConceptMapping,
  type ProblemListEntry,
  type InsertProblemListEntry,
  type AuditEvent,
  type InsertAuditEvent,
  users,
  terminologyCodes,
  conceptMappings,
  problemListEntries,
  auditEvents
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, like, gte, desc, sql, inArray, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Terminology Codes
  getTerminologyCode(id: string): Promise<TerminologyCode | undefined>;
  getTerminologyCodeByCode(code: string, system: string): Promise<TerminologyCode | undefined>;
  createTerminologyCode(code: InsertTerminologyCode): Promise<TerminologyCode>;
  searchTerminologyCodes(query: string, systems?: string[]): Promise<TerminologyCode[]>;
  bulkCreateTerminologyCodes(codes: InsertTerminologyCode[]): Promise<TerminologyCode[]>;

  // Concept Mappings
  getConceptMapping(id: string): Promise<ConceptMapping | undefined>;
  createConceptMapping(mapping: InsertConceptMapping): Promise<ConceptMapping>;
  getMappingsForCode(code: string, system: string): Promise<ConceptMapping[]>;

  // Problem List
  getProblemListEntry(id: string): Promise<ProblemListEntry | undefined>;
  createProblemListEntry(entry: InsertProblemListEntry): Promise<ProblemListEntry>;
  getProblemListEntriesByPatient(patientId: string): Promise<ProblemListEntry[]>;
  getAllProblemListEntries(): Promise<ProblemListEntry[]>;

  // Audit Events
  createAuditEvent(event: InsertAuditEvent): Promise<AuditEvent>;
  getAuditEvents(limit?: number): Promise<AuditEvent[]>;

  // Stats
  getStats(): Promise<{
    namasteTerms: number;
    icd11Terms: number;
    mappedPairs: number;
    todaySearches: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.ensureSeedData();
  }

  private async ensureSeedData() {
    // Check if we have any terminology codes, if not seed the database
    const existingCodes = await db.select().from(terminologyCodes).limit(1);
    if (existingCodes.length === 0) {
      await this.seedData();
    }
  }

  private async seedData() {
    // Seed expanded terminology codes for better demonstration
    const namasteTerms = [
      // Digestive System - Ayurveda
      { code: "AYU-DIG-001", display: "Agnimandya", definition: "Digestive fire deficiency in Ayurveda", system: "NAMASTE" },
      { code: "AYU-DIG-002", display: "Ajeerna", definition: "Indigestion and dyspepsia", system: "NAMASTE" },
      { code: "AYU-DIG-003", display: "Grahani", definition: "Inflammatory bowel syndrome", system: "NAMASTE" },
      { code: "AYU-DIG-004", display: "Amlapitta", definition: "Acid peptic disorders", system: "NAMASTE" },
      
      // Respiratory System - Ayurveda
      { code: "AYU-RES-001", display: "Kasaroga", definition: "Respiratory disorders and cough", system: "NAMASTE" },
      { code: "AYU-RES-002", display: "Shwasa", definition: "Bronchial asthma", system: "NAMASTE" },
      { code: "AYU-RES-003", display: "Kshayaroga", definition: "Tuberculosis and wasting diseases", system: "NAMASTE" },
      
      // Siddha Medicine
      { code: "SID-CIR-001", display: "Hrudayaroga", definition: "Cardiac disorders in Siddha medicine", system: "NAMASTE" },
      { code: "SID-DIG-001", display: "Gunmam", definition: "Abdominal disorders", system: "NAMASTE" },
      { code: "SID-SKN-001", display: "Kuttam", definition: "Skin diseases including leprosy", system: "NAMASTE" },
      
      // Unani Medicine
      { code: "UNA-NEU-001", display: "Falij", definition: "Neurological paralysis conditions", system: "NAMASTE" },
      { code: "UNA-FEV-001", display: "Humma", definition: "Fever and inflammatory conditions", system: "NAMASTE" },
      { code: "UNA-JOI-001", display: "Waja-ul-Mafasil", definition: "Joint pain and arthritis", system: "NAMASTE" },
      
      // Mental Health - Ayurveda
      { code: "AYU-MEN-001", display: "Unmada", definition: "Mental disorders and psychosis", system: "NAMASTE" },
      { code: "AYU-MEN-002", display: "Apasmara", definition: "Epilepsy and seizure disorders", system: "NAMASTE" },
      
      // Women's Health
      { code: "AYU-GYN-001", display: "Yoniroga", definition: "Gynecological disorders", system: "NAMASTE" },
      { code: "AYU-GYN-002", display: "Artavadusti", definition: "Menstrual disorders", system: "NAMASTE" }
    ];

    const icd11Terms = [
      // Digestive System TM2
      { code: "TM2-DA01", display: "Disorder of digestive qi transformation", definition: "Traditional medicine disorder affecting digestive function", system: "ICD-11-TM2" },
      { code: "TM2-DA02", display: "Stomach heat with counterflow", definition: "Heat pattern in stomach affecting digestion", system: "ICD-11-TM2" },
      { code: "TM2-DA03", display: "Spleen qi deficiency syndrome", definition: "Deficient spleen qi affecting digestion", system: "ICD-11-TM2" },
      { code: "TM2-DA04", display: "Liver qi stagnation affecting stomach", definition: "Liver qi stagnation causing digestive issues", system: "ICD-11-TM2" },
      
      // Respiratory System TM2
      { code: "TM2-RE01", display: "Lung qi deficiency", definition: "Deficient lung qi causing respiratory symptoms", system: "ICD-11-TM2" },
      { code: "TM2-RE02", display: "Wind-cold affecting lungs", definition: "External wind-cold pathogen affecting respiratory system", system: "ICD-11-TM2" },
      { code: "TM2-RE03", display: "Phlegm-heat in lungs", definition: "Phlegm-heat pattern causing respiratory disorders", system: "ICD-11-TM2" },
      
      // Cardiovascular TM2
      { code: "TM2-HE01", display: "Heart qi stagnation", definition: "Stagnant heart qi affecting circulation", system: "ICD-11-TM2" },
      { code: "TM2-HE02", display: "Heart blood stasis", definition: "Blood stasis pattern in cardiovascular system", system: "ICD-11-TM2" },
      
      // Neurological TM2
      { code: "TM2-NE01", display: "Wind stroke pattern", definition: "Wind pathogen causing neurological symptoms", system: "ICD-11-TM2" },
      { code: "TM2-NE02", display: "Kidney essence deficiency affecting brain", definition: "Kidney essence deficiency causing neurological issues", system: "ICD-11-TM2" },
      
      // Mental Health TM2
      { code: "TM2-MH01", display: "Heart spirit disturbance", definition: "Disturbed heart spirit causing mental symptoms", system: "ICD-11-TM2" },
      { code: "TM2-MH02", display: "Phlegm misting the mind", definition: "Phlegm pathology affecting mental clarity", system: "ICD-11-TM2" },
      
      // Biomedicine codes
      { code: "K59.1", display: "Diarrhoea, unspecified", definition: "Digestive system disorder", system: "ICD-11-BIOMEDICINE" },
      { code: "J44.1", display: "Chronic obstructive pulmonary disease with acute exacerbation", definition: "Respiratory system disorder", system: "ICD-11-BIOMEDICINE" },
      { code: "I25.9", display: "Chronic ischaemic heart disease, unspecified", definition: "Cardiovascular system disorder", system: "ICD-11-BIOMEDICINE" }
    ];

    // Insert terminology codes
    const allTerms = [...namasteTerms, ...icd11Terms];
    await db.insert(terminologyCodes).values(allTerms.map(term => ({
      code: term.code,
      display: term.display,
      definition: term.definition || null,
      system: term.system
    })));

    // Seed comprehensive mappings
    const mappings = [
      // Digestive System Mappings
      { sourceCode: "AYU-DIG-001", sourceSystem: "NAMASTE", targetCode: "TM2-DA01", targetSystem: "ICD-11-TM2", equivalence: "equivalent", confidence: "95%" },
      { sourceCode: "AYU-DIG-002", sourceSystem: "NAMASTE", targetCode: "TM2-DA02", targetSystem: "ICD-11-TM2", equivalence: "equivalent", confidence: "90%" },
      { sourceCode: "AYU-DIG-003", sourceSystem: "NAMASTE", targetCode: "TM2-DA03", targetSystem: "ICD-11-TM2", equivalence: "wider", confidence: "85%" },
      { sourceCode: "AYU-DIG-004", sourceSystem: "NAMASTE", targetCode: "TM2-DA04", targetSystem: "ICD-11-TM2", equivalence: "equivalent", confidence: "92%" },
      
      // Respiratory System Mappings  
      { sourceCode: "AYU-RES-001", sourceSystem: "NAMASTE", targetCode: "TM2-RE01", targetSystem: "ICD-11-TM2", equivalence: "equivalent", confidence: "88%" },
      { sourceCode: "AYU-RES-002", sourceSystem: "NAMASTE", targetCode: "TM2-RE02", targetSystem: "ICD-11-TM2", equivalence: "narrower", confidence: "87%" },
      { sourceCode: "AYU-RES-003", sourceSystem: "NAMASTE", targetCode: "TM2-RE03", targetSystem: "ICD-11-TM2", equivalence: "wider", confidence: "83%" },
      
      // Cardiovascular Mappings
      { sourceCode: "SID-CIR-001", sourceSystem: "NAMASTE", targetCode: "TM2-HE01", targetSystem: "ICD-11-TM2", equivalence: "equivalent", confidence: "91%" },
      { sourceCode: "SID-CIR-001", sourceSystem: "NAMASTE", targetCode: "TM2-HE02", targetSystem: "ICD-11-TM2", equivalence: "narrower", confidence: "78%" },
      
      // Neurological Mappings
      { sourceCode: "UNA-NEU-001", sourceSystem: "NAMASTE", targetCode: "TM2-NE01", targetSystem: "ICD-11-TM2", equivalence: "equivalent", confidence: "89%" },
      { sourceCode: "AYU-MEN-002", sourceSystem: "NAMASTE", targetCode: "TM2-NE02", targetSystem: "ICD-11-TM2", equivalence: "wider", confidence: "82%" },
      
      // Mental Health Mappings
      { sourceCode: "AYU-MEN-001", sourceSystem: "NAMASTE", targetCode: "TM2-MH01", targetSystem: "ICD-11-TM2", equivalence: "equivalent", confidence: "86%" },
      { sourceCode: "AYU-MEN-001", sourceSystem: "NAMASTE", targetCode: "TM2-MH02", targetSystem: "ICD-11-TM2", equivalence: "narrower", confidence: "79%" },
      
      // Cross-system mappings to Biomedicine
      { sourceCode: "AYU-DIG-002", sourceSystem: "NAMASTE", targetCode: "K59.1", targetSystem: "ICD-11-BIOMEDICINE", equivalence: "wider", confidence: "74%" },
      { sourceCode: "AYU-RES-002", sourceSystem: "NAMASTE", targetCode: "J44.1", targetSystem: "ICD-11-BIOMEDICINE", equivalence: "narrower", confidence: "71%" },
      { sourceCode: "SID-CIR-001", sourceSystem: "NAMASTE", targetCode: "I25.9", targetSystem: "ICD-11-BIOMEDICINE", equivalence: "wider", confidence: "68%" }
    ];

    // Insert concept mappings
    await db.insert(conceptMappings).values(mappings.map(mapping => ({
      sourceCode: mapping.sourceCode,
      sourceSystem: mapping.sourceSystem,
      targetCode: mapping.targetCode,
      targetSystem: mapping.targetSystem,
      equivalence: mapping.equivalence,
      confidence: mapping.confidence || null
    })));

    // Seed some demo audit events for better dashboard visualization
    const auditEventsData = [
      { eventType: "search", details: { query: "digestive disorders", systems: ["NAMASTE"] }, userId: "demo-user-1" },
      { eventType: "search", details: { query: "heart conditions", systems: ["NAMASTE", "ICD-11-TM2"] }, userId: "demo-user-2" },
      { eventType: "map", details: { sourceCode: "AYU-DIG-001", sourceSystem: "NAMASTE", targetCode: "TM2-DA01", targetSystem: "ICD-11-TM2" }, userId: "demo-user-1" },
      { eventType: "upload", details: { recordCount: 25 }, userId: "admin-user" },
      { eventType: "validate", details: { resourceType: "Bundle", entryCount: 3 }, userId: "demo-user-2" },
      { eventType: "search", details: { query: "respiratory", systems: ["NAMASTE"] }, userId: "demo-user-3" },
      { eventType: "map", details: { sourceCode: "AYU-RES-001", sourceSystem: "NAMASTE", targetCode: "TM2-RE01", targetSystem: "ICD-11-TM2" }, userId: "demo-user-3" },
      { eventType: "search", details: { query: "mental health", systems: ["NAMASTE", "ICD-11-TM2"] }, userId: "demo-user-1" }
    ];

    // Insert audit events
    await db.insert(auditEvents).values(auditEventsData.map(event => ({
      eventType: event.eventType,
      details: event.details,
      userId: event.userId
    })));

    // Seed some problem list entries
    const problemEntries = [
      { namasteCode: "AYU-DIG-001", icd11Code: "TM2-DA01", patientId: "patient-001", status: "active" },
      { namasteCode: "AYU-RES-001", icd11Code: "TM2-RE01", patientId: "patient-002", status: "active" },
      { namasteCode: "SID-CIR-001", icd11Code: "TM2-HE01", patientId: "patient-003", status: "resolved" },
      { namasteCode: "UNA-NEU-001", icd11Code: "TM2-NE01", patientId: "patient-001", status: "active" }
    ];

    // Insert problem list entries
    await db.insert(problemListEntries).values(problemEntries.map(entry => ({
      patientId: entry.patientId,
      namasteCode: entry.namasteCode,
      icd11Code: entry.icd11Code,
      status: entry.status
    })));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Terminology code methods
  async getTerminologyCode(id: string): Promise<TerminologyCode | undefined> {
    const [code] = await db.select().from(terminologyCodes).where(eq(terminologyCodes.id, id));
    return code;
  }

  async getTerminologyCodeByCode(code: string, system: string): Promise<TerminologyCode | undefined> {
    const [term] = await db.select().from(terminologyCodes)
      .where(and(eq(terminologyCodes.code, code), eq(terminologyCodes.system, system)));
    return term;
  }

  async createTerminologyCode(insertCode: InsertTerminologyCode): Promise<TerminologyCode> {
    const [code] = await db.insert(terminologyCodes).values(insertCode).returning();
    return code;
  }

  async searchTerminologyCodes(query: string, systems?: string[]): Promise<TerminologyCode[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    // Use raw SQL for case-insensitive search
    const searchConditions = sql`LOWER(${terminologyCodes.display}) LIKE ${searchTerm} 
    OR LOWER(${terminologyCodes.code}) LIKE ${searchTerm} 
    OR LOWER(${terminologyCodes.definition}) LIKE ${searchTerm}`;
    
    if (systems && systems.length > 0) {
      // Use OR conditions for multiple systems to avoid array parameter issues
      const systemConditions = or(...systems.map(system => eq(terminologyCodes.system, system)));
      return await db.select().from(terminologyCodes)
        .where(and(searchConditions, systemConditions));
    } else {
      return await db.select().from(terminologyCodes).where(searchConditions);
    }
  }

  async bulkCreateTerminologyCodes(codes: InsertTerminologyCode[]): Promise<TerminologyCode[]> {
    return await db.insert(terminologyCodes).values(codes).returning();
  }

  // Concept mapping methods
  async getConceptMapping(id: string): Promise<ConceptMapping | undefined> {
    const [mapping] = await db.select().from(conceptMappings).where(eq(conceptMappings.id, id));
    return mapping;
  }

  async createConceptMapping(insertMapping: InsertConceptMapping): Promise<ConceptMapping> {
    const [mapping] = await db.insert(conceptMappings).values(insertMapping).returning();
    return mapping;
  }

  async getMappingsForCode(code: string, system: string): Promise<ConceptMapping[]> {
    return await db.select().from(conceptMappings)
      .where(and(eq(conceptMappings.sourceCode, code), eq(conceptMappings.sourceSystem, system)));
  }

  // Problem list methods
  async getProblemListEntry(id: string): Promise<ProblemListEntry | undefined> {
    const [entry] = await db.select().from(problemListEntries).where(eq(problemListEntries.id, id));
    return entry;
  }

  async createProblemListEntry(insertEntry: InsertProblemListEntry): Promise<ProblemListEntry> {
    const [entry] = await db.insert(problemListEntries).values(insertEntry).returning();
    return entry;
  }

  async getProblemListEntriesByPatient(patientId: string): Promise<ProblemListEntry[]> {
    return await db.select().from(problemListEntries)
      .where(eq(problemListEntries.patientId, patientId));
  }

  async getAllProblemListEntries(): Promise<ProblemListEntry[]> {
    return await db.select().from(problemListEntries);
  }

  // Audit event methods
  async createAuditEvent(insertEvent: InsertAuditEvent): Promise<AuditEvent> {
    const [event] = await db.insert(auditEvents).values(insertEvent).returning();
    return event;
  }

  async getAuditEvents(limit = 50): Promise<AuditEvent[]> {
    return await db.select().from(auditEvents)
      .orderBy(desc(auditEvents.timestamp))
      .limit(limit);
  }

  // Stats methods
  async getStats() {
    const [namasteCount] = await db.select({ count: sql<number>`count(*)` })
      .from(terminologyCodes)
      .where(eq(terminologyCodes.system, "NAMASTE"));
    
    const [icd11Count] = await db.select({ count: sql<number>`count(*)` })
      .from(terminologyCodes)
      .where(like(terminologyCodes.system, "ICD-11%"));
    
    const [mappingCount] = await db.select({ count: sql<number>`count(*)` })
      .from(conceptMappings);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [searchCount] = await db.select({ count: sql<number>`count(*)` })
      .from(auditEvents)
      .where(and(
        eq(auditEvents.eventType, "search"),
        gte(auditEvents.timestamp, today)
      ));

    return {
      namasteTerms: namasteCount.count,
      icd11Terms: icd11Count.count,
      mappedPairs: mappingCount.count,
      todaySearches: searchCount.count
    };
  }
}

export const storage = new DatabaseStorage();
