import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { terminologyService } from "./services/terminology";
import { z } from "zod";
import type { SearchRequest, FHIRBundle } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Search API
  app.post("/api/search", async (req, res) => {
    try {
      const searchRequest = req.body as SearchRequest;
      
      if (!searchRequest.query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const results = await terminologyService.searchTerminologies(searchRequest);
      res.json({ results });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create concept mapping
  app.post("/api/mappings", async (req, res) => {
    try {
      const { sourceCode, sourceSystem, targetCode, targetSystem, equivalence } = req.body;
      
      if (!sourceCode || !sourceSystem || !targetCode || !targetSystem || !equivalence) {
        return res.status(400).json({ error: "All mapping fields are required" });
      }

      const mapping = await terminologyService.createMapping(
        sourceCode,
        sourceSystem,
        targetCode,
        targetSystem,
        equivalence
      );

      res.json(mapping);
    } catch (error) {
      console.error("Mapping creation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // CSV ingestion
  app.post("/api/ingest-csv", async (req, res) => {
    try {
      const csvData = req.body.data;
      
      if (!Array.isArray(csvData)) {
        return res.status(400).json({ error: "CSV data must be an array" });
      }

      const count = await terminologyService.ingestCSV(csvData);
      res.json({ message: `Successfully ingested ${count} terminology codes` });
    } catch (error) {
      console.error("CSV ingestion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Problem list management
  app.get("/api/problems", async (req, res) => {
    try {
      const problems = await storage.getAllProblemListEntries();
      res.json(problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/problems", async (req, res) => {
    try {
      const { namasteCode, icd11Code, patientId } = req.body;
      
      const problem = await storage.createProblemListEntry({
        namasteCode,
        icd11Code,
        patientId: patientId || "demo-patient",
        status: "active"
      });

      res.json(problem);
    } catch (error) {
      console.error("Problem creation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // FHIR Bundle validation
  app.post("/api/bundle/validate", async (req, res) => {
    try {
      const bundle = req.body as FHIRBundle;
      
      if (!bundle || typeof bundle !== "object") {
        return res.status(400).json({ error: "Invalid bundle format" });
      }

      const validationResult = await terminologyService.validateFHIRBundle(bundle);
      res.json(validationResult);
    } catch (error) {
      console.error("Bundle validation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Test FHIR route
  app.get("/api/fhir/test", async (req, res) => {
    console.log("FHIR test route hit!");
    res.json({ message: "FHIR routing is working!", timestamp: new Date().toISOString() });
  });

  // FHIR ValueSet $expand operation
  app.get("/api/fhir/ValueSet/:id/expand", async (req, res) => {
    try {
      const { id } = req.params;
      const { filter, count = 20 } = req.query;

      // Mock FHIR ValueSet expansion
      const searchResults = await storage.searchTerminologyCodes(
        filter as string || "",
        id === "namaste-codes" ? ["NAMASTE"] : undefined
      );

      const expansion = {
        resourceType: "ValueSet",
        id,
        expansion: {
          identifier: `urn:uuid:${Date.now()}`,
          timestamp: new Date().toISOString(),
          total: searchResults.length,
          contains: searchResults.slice(0, parseInt(count as string)).map(code => ({
            system: code.system === "NAMASTE" ? "http://namaste.gov.in/CodeSystem" : "http://icd.who.int/tm2",
            code: code.code,
            display: code.display
          }))
        }
      };

      res.json(expansion);
    } catch (error) {
      console.error("ValueSet expansion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // FHIR ConceptMap $translate operation
  app.post("/api/fhir/ConceptMap/translate", async (req, res) => {
    try {
      const { code, system, target } = req.body;
      
      if (!code || !system) {
        return res.status(400).json({ error: "Code and system are required" });
      }

      const mappings = await storage.getMappingsForCode(code, system);
      
      const parameters: any = {
        resourceType: "Parameters",
        parameter: [
          {
            name: "result",
            valueBoolean: mappings.length > 0
          }
        ]
      };

      if (mappings.length > 0) {
        parameters.parameter.push(...mappings.map((mapping: any) => ({
          name: "match",
          part: [
            {
              name: "equivalence",
              valueCode: mapping.equivalence
            },
            {
              name: "concept",
              valueCoding: {
                system: mapping.targetSystem === "ICD-11-TM2" ? "http://icd.who.int/tm2" : mapping.targetSystem,
                code: mapping.targetCode,
                display: `Mapped from ${mapping.sourceCode}`
              }
            }
          ]
        })));
      }

      res.json(parameters);
    } catch (error) {
      console.error("ConceptMap translation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await terminologyService.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Audit trail
  app.get("/api/audit", async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const events = await storage.getAuditEvents(parseInt(limit as string));
      res.json(events);
    } catch (error) {
      console.error("Audit trail error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
