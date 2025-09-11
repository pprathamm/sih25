import { storage } from "../storage";
import { geminiService } from "./gemini.js";
import type { 
  SearchRequest, 
  SearchResult, 
  FHIRBundle, 
  ValidationResult,
  TerminologyCode,
  ConceptMapping
} from "@shared/schema";

export class TerminologyService {
  async searchTerminologies(request: SearchRequest): Promise<SearchResult[]> {
    // Log search event
    await storage.createAuditEvent({
      eventType: "search",
      details: { query: request.query, systems: request.systems },
      userId: "demo-user"
    });

    // Search in local terminology database
    const codes = await storage.searchTerminologyCodes(request.query, request.systems);
    
    const results: SearchResult[] = [];
    
    for (const code of codes) {
      // Get existing mappings for this code
      const mappings = await storage.getMappingsForCode(code.code, code.system);
      
      let aiMappings: ConceptMapping[] = [];
      
      // If this is a NAMASTE code and we want suggestions, get AI mappings
      if (code.system === "NAMASTE" && request.includeSuggestions && mappings.length === 0) {
        try {
          aiMappings = await this.getAIMappingSuggestions(code);
        } catch (error) {
          console.error("Error getting AI suggestions:", error);
        }
      }

      results.push({
        code: code.code,
        display: code.display,
        definition: code.definition || undefined,
        system: code.system,
        mappings: [...mappings, ...aiMappings]
      });
    }

    return results;
  }

  async getAIMappingSuggestions(namasteCode: TerminologyCode): Promise<ConceptMapping[]> {
    const prompt = `
Given this NAMASTE terminology code:
Code: ${namasteCode.code}
Display: ${namasteCode.display}
Definition: ${namasteCode.definition || "No definition provided"}

Find the best ICD-11 TM2 (Traditional Medicine Module 2) mapping. Consider:
1. Medical context and meaning
2. Traditional medicine concepts
3. Diagnostic equivalence

Respond with potential mappings in this format:
{
  "mappings": [
    {
      "targetCode": "TM2-XXX",
      "targetDisplay": "ICD-11 TM2 term name",
      "equivalence": "equivalent|wider|narrower|inexact",
      "confidence": "percentage",
      "rationale": "brief explanation"
    }
  ]
}
`;

    try {
      const aiResponse = await geminiService.getMappingSuggestions(prompt);
      
      if (!aiResponse.mappings || !Array.isArray(aiResponse.mappings)) {
        return [];
      }

      return aiResponse.mappings.map((mapping: any) => ({
        id: `ai-${Date.now()}-${Math.random()}`,
        sourceCode: namasteCode.code,
        sourceSystem: namasteCode.system,
        targetCode: mapping.targetCode,
        targetSystem: "ICD-11-TM2",
        equivalence: mapping.equivalence,
        confidence: mapping.confidence,
        createdAt: new Date()
      }));
    } catch (error) {
      console.error("AI mapping suggestion failed:", error);
      return [];
    }
  }

  async createMapping(
    sourceCode: string,
    sourceSystem: string,
    targetCode: string,
    targetSystem: string,
    equivalence: string
  ) {
    // Log mapping event
    await storage.createAuditEvent({
      eventType: "map",
      details: { sourceCode, sourceSystem, targetCode, targetSystem, equivalence },
      userId: "demo-user"
    });

    return await storage.createConceptMapping({
      sourceCode,
      sourceSystem,
      targetCode,
      targetSystem,
      equivalence,
      confidence: "manual"
    });
  }

  async ingestCSV(csvData: Array<{ code: string; display: string; definition?: string }>): Promise<number> {
    // Log CSV ingestion event
    await storage.createAuditEvent({
      eventType: "upload",
      details: { recordCount: csvData.length },
      userId: "demo-user"
    });

    const terminologyCodes = csvData.map(row => ({
      code: row.code,
      display: row.display,
      definition: row.definition,
      system: "NAMASTE"
    }));

    const results = await storage.bulkCreateTerminologyCodes(terminologyCodes);
    return results.length;
  }

  async validateFHIRBundle(bundle: FHIRBundle): Promise<ValidationResult> {
    // Log validation event
    await storage.createAuditEvent({
      eventType: "validate",
      details: { resourceType: bundle.resourceType, entryCount: bundle.entry?.length || 0 },
      userId: "demo-user"
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!bundle.resourceType || bundle.resourceType !== "Bundle") {
      errors.push("Invalid resourceType. Expected 'Bundle'");
    }

    if (!bundle.type) {
      errors.push("Bundle type is required");
    }

    if (!bundle.entry || !Array.isArray(bundle.entry)) {
      errors.push("Bundle must have an entry array");
      return { valid: false, errors };
    }

    let resources = 0;
    let conditions = 0;
    let namasteCodes = 0;
    let icd11Codes = 0;

    // Validate each entry
    for (const entry of bundle.entry) {
      if (!entry.resource) {
        warnings.push("Entry missing resource");
        continue;
      }

      resources++;

      if (entry.resource.resourceType === "Condition") {
        conditions++;
        
        // Check for coding systems
        if (entry.resource.code?.coding) {
          for (const coding of entry.resource.code.coding) {
            if (coding.system?.includes("namaste")) {
              namasteCodes++;
            } else if (coding.system?.includes("icd") || coding.system?.includes("who")) {
              icd11Codes++;
            }
          }
        }
      }
    }

    // Validate dual coding presence
    if (conditions > 0 && (namasteCodes === 0 || icd11Codes === 0)) {
      warnings.push("Consider adding dual coding (both NAMASTE and ICD-11) for better interoperability");
    }

    const valid = errors.length === 0;

    return {
      valid,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary: {
        resources,
        conditions,
        namasteCodes,
        icd11Codes
      }
    };
  }

  async getStats() {
    return await storage.getStats();
  }
}

export const terminologyService = new TerminologyService();
