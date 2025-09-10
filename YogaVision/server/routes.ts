import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  generateConceptMappings, 
  enhanceTerminologySearch, 
  answerTerminologyQuestion,
  validateCSVData 
} from "./gemini";
import {
  createFHIRValueSetExpansion,
  createFHIRTranslationResult,
  createFHIRCondition,
  createFHIRBundle,
  validateFHIRBundle,
  FHIRParametersSchema,
  FHIRBundleSchema
} from "./fhir";

export async function registerRoutes(app: Express): Promise<Server> {
  // FHIR URL normalization middleware - decode %24 to $ for FHIR operations
  app.use('/fhir', (req, _res, next) => {
    console.log('FHIR middleware - original URL:', req.url);
    req.url = req.url.replace(/%24/g, '$');
    console.log('FHIR middleware - normalized URL:', req.url);
    next();
  });

  // Auth middleware
  await setupAuth(app);

  // Audit logging middleware (disabled for now)
  const auditLog = async (req: any, operation: string, data?: any) => {
    // Temporarily disabled for development
    console.log('Audit log:', operation, data);
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        ...user
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json({
        id: req.user.claims.sub,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name
      });
    }
  });

  // Terminology Search API
  app.get('/api/search', async (req, res) => {
    try {
      const { q: query, include_icd, limit = 10 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      await auditLog(req, 'terminology.search', { query, include_icd });

      // Search NAMASTE codes
      const namasteCodes = await storage.getNamasteCodes(query, parseInt(limit as string));
      
      let results = namasteCodes.map(code => ({
        code: code.code,
        display: code.display,
        definition: code.definition,
        system: code.system,
        category: code.category,
        type: 'namaste'
      }));

      // Include ICD-11 suggestions if requested
      if (include_icd === 'true') {
        const icd11Codes = await storage.getIcd11Codes(query, 'TM2', parseInt(limit as string));
        const icd11Results = icd11Codes.map(code => ({
          code: code.code,
          display: code.display,
          definition: code.definition,
          system: code.system,
          category: code.module,
          type: 'icd11'
        }));
        
        results = [...results, ...icd11Results];
      }

      // Enhance with AI if available
      try {
        results = await enhanceTerminologySearch(query, results);
      } catch (error) {
        console.error('AI enhancement failed:', error);
      }

      res.json({
        query,
        total: results.length,
        results
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Concept Mapping API
  app.post('/api/mapping/suggest', async (req, res) => {
    try {
      const { code, display, definition, system } = req.body;
      
      if (!code || !display) {
        return res.status(400).json({ message: "Code and display are required" });
      }

      await auditLog(req, 'mapping.suggest', { code, system });

      // Generate AI mappings
      const aiMappings = await generateConceptMappings(code, display, definition);
      
      // Store mappings for future use
      for (const mapping of aiMappings) {
        try {
          await storage.createConceptMapping({
            sourceCode: code,
            sourceSystem: system || "http://namaste.gov.in/CodeSystem",
            targetCode: mapping.targetCode,
            targetSystem: "http://id.who.int/icd/release/11/mms",
            equivalence: "equivalent",
            confidence: mapping.confidence,
            mappingType: 'ai-generated',
            createdBy: 'system'
          });
        } catch (error) {
          // Ignore duplicates
        }
      }

      res.json({
        sourceCode: code,
        mappings: aiMappings
      });
    } catch (error) {
      console.error('Mapping suggestion error:', error);
      res.status(500).json({ message: "Mapping suggestion failed" });
    }
  });

  // FHIR ValueSet $expand
  app.get('/fhir/ValueSet/$expand', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "ValueSet URL is required" });
      }

      await auditLog(req, 'fhir.valueset.expand', { url });

      // Extract category from URL (e.g., ayurveda, siddha, unani)
      const category = url.split('/').pop();
      let codes;

      if (category === 'ayurveda') {
        codes = await storage.getNamasteCodes('', 100);
        codes = codes.filter(c => c.category === 'AYU');
      } else if (category === 'siddha') {
        codes = await storage.getNamasteCodes('', 100);
        codes = codes.filter(c => c.category === 'SID');
      } else if (category === 'unani') {
        codes = await storage.getNamasteCodes('', 100);
        codes = codes.filter(c => c.category === 'UNA');
      } else {
        codes = await storage.getNamasteCodes('', 100);
      }

      const concepts = codes.map(code => ({
        system: code.system,
        code: code.code,
        display: code.display
      }));

      const valueSet = createFHIRValueSetExpansion(url, concepts);
      res.json(valueSet);
    } catch (error) {
      console.error('ValueSet expand error:', error);
      res.status(500).json({ message: "ValueSet expansion failed" });
    }
  });

  // FHIR ConceptMap $translate
  app.post('/fhir/ConceptMap/$translate', async (req, res) => {
    try {
      const parameters = FHIRParametersSchema.parse(req.body);
      
      let sourceCode = '';
      let sourceSystem = '';
      let targetSystem = '';
      
      parameters.parameter?.forEach(param => {
        if (param.name === 'code') sourceCode = param.valueCode || '';
        if (param.name === 'system') sourceSystem = param.valueUri || '';
        if (param.name === 'target') targetSystem = param.valueUri || '';
      });

      if (!sourceCode || !sourceSystem || !targetSystem) {
        return res.status(400).json({ message: "Code, system, and target parameters are required" });
      }

      await auditLog(req, 'fhir.conceptmap.translate', { sourceCode, sourceSystem, targetSystem });

      // Look for existing mappings
      const mappings = await storage.getConceptMappings(sourceCode, targetSystem);
      
      let translationResults = mappings.map(mapping => ({
        code: mapping.targetCode,
        system: mapping.targetSystem,
        display: '', // Would need to fetch from ICD-11 codes
        equivalence: mapping.equivalence
      }));

      // If no mappings found, try to generate with AI
      if (translationResults.length === 0 && sourceSystem.includes('namaste.gov.in')) {
        const namasteCode = await storage.getNamasteCodeByCode(sourceCode);
        if (namasteCode) {
          const aiMappings = await generateConceptMappings(
            namasteCode.code,
            namasteCode.display,
            namasteCode.definition || undefined
          );
          
          translationResults = aiMappings.map(mapping => ({
            code: mapping.targetCode,
            system: "http://id.who.int/icd/release/11/mms",
            display: mapping.targetDisplay,
            equivalence: "equivalent"
          }));
        }
      }

      const result = createFHIRTranslationResult(
        sourceCode,
        sourceSystem,
        '', // Would need source display
        translationResults
      );

      res.json(result);
    } catch (error) {
      console.error('ConceptMap translate error:', error);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  // CSV Ingestion API
  app.post('/api/csv/ingest', isAuthenticated, async (req, res) => {
    try {
      const { csvData } = req.body;
      
      if (!csvData || typeof csvData !== 'string') {
        return res.status(400).json({ message: "CSV data is required" });
      }

      await auditLog(req, 'csv.ingest.start', { length: csvData.length });

      // Validate CSV with AI
      const validation = await validateCSVData(csvData);
      
      if (!validation.isValid) {
        return res.status(400).json({
          message: "CSV validation failed",
          errors: validation.errors,
          suggestions: validation.suggestions
        });
      }

      // Parse CSV
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      if (!headers.includes('code') || !headers.includes('display')) {
        return res.status(400).json({ message: "CSV must include 'code' and 'display' columns" });
      }

      const codes = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const codeObj: any = {};
        
        headers.forEach((header, index) => {
          if (values[index]) {
            codeObj[header] = values[index];
          }
        });

        if (codeObj.code && codeObj.display) {
          // Extract category from code (AYU, SID, UNA)
          const category = codeObj.code.split('-')[0];
          const subCategory = codeObj.code.split('-')[1];
          
          codes.push({
            code: codeObj.code,
            display: codeObj.display,
            definition: codeObj.definition,
            system: "http://namaste.gov.in/CodeSystem",
            category,
            subCategory
          });
        }
      }

      // Bulk insert
      await storage.bulkInsertNamasteCodes(codes);

      await auditLog(req, 'csv.ingest.complete', { 
        codesProcessed: codes.length,
        validation: validation.suggestions 
      });

      res.json({
        message: "CSV ingested successfully",
        codesProcessed: codes.length,
        validation
      });
    } catch (error) {
      console.error('CSV ingestion error:', error);
      res.status(500).json({ message: "CSV ingestion failed" });
    }
  });

  // Problem List API
  app.get('/api/problems', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const problems = await storage.getProblemEntries(undefined, userId);
      
      res.json(problems);
    } catch (error) {
      console.error('Get problems error:', error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

  app.post('/api/problems', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { namasteCode, namasteDisplay, icd11Code, icd11Display, patientId } = req.body;
      
      const problem = await storage.createProblemEntry({
        patientId: patientId || 'demo-patient',
        namasteCode,
        namasteDisplay,
        icd11Code,
        icd11Display,
        createdBy: userId
      });

      await auditLog(req, 'problem.create', { problemId: problem.id, namasteCode, icd11Code });

      res.json(problem);
    } catch (error) {
      console.error('Create problem error:', error);
      res.status(500).json({ message: "Failed to create problem" });
    }
  });

  app.delete('/api/problems/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteProblemEntry(id);
      await auditLog(req, 'problem.delete', { problemId: id });

      res.json({ message: "Problem deleted successfully" });
    } catch (error) {
      console.error('Delete problem error:', error);
      res.status(500).json({ message: "Failed to delete problem" });
    }
  });

  // Export problems as FHIR Bundle
  app.get('/api/problems/export/fhir', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const problems = await storage.getProblemEntries(undefined, userId);
      
      const conditions = problems.map(problem => 
        createFHIRCondition(
          problem.patientId || 'Patient/demo',
          problem.namasteCode || '',
          problem.namasteDisplay || '',
          problem.icd11Code || undefined,
          problem.icd11Display || undefined
        )
      );

      const bundle = createFHIRBundle('collection', conditions);
      
      await auditLog(req, 'fhir.bundle.export', { 
        problemCount: problems.length,
        bundleId: bundle.id 
      });

      res.json(bundle);
    } catch (error) {
      console.error('Export problems error:', error);
      res.status(500).json({ message: "Failed to export problems" });
    }
  });

  // FHIR Bundle Validation
  app.post('/fhir/Bundle/$validate', async (req, res) => {
    try {
      const bundle = req.body;
      
      const validation = validateFHIRBundle(bundle);
      
      await auditLog(req, 'fhir.bundle.validate', { 
        isValid: validation.isValid,
        errorCount: validation.errors.length 
      });

      if (validation.isValid) {
        res.json({
          resourceType: "OperationOutcome",
          issue: [{
            severity: "information",
            code: "informational",
            diagnostics: "Bundle is valid"
          }]
        });
      } else {
        res.status(400).json({
          resourceType: "OperationOutcome",
          issue: validation.errors.map(error => ({
            severity: "error",
            code: "invalid",
            diagnostics: error
          }))
        });
      }
    } catch (error) {
      console.error('Bundle validation error:', error);
      res.status(500).json({ message: "Bundle validation failed" });
    }
  });

  // AI Chat API
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and sessionId are required" });
      }

      // Get chat history for context
      const history = await storage.getChatMessages(sessionId, 10);
      
      const response = await answerTerminologyQuestion(message, { history });
      
      // Store chat message
      await storage.createChatMessage({
        sessionId,
        userId: req.user?.claims?.sub,
        message,
        response: response.answer,
        context: response
      });

      await auditLog(req, 'ai.chat', { sessionId, messageLength: message.length });

      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ message: "Chat failed" });
    }
  });

  // Audit Trail API
  app.get('/api/audit', isAuthenticated, async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const userId = req.user?.claims?.sub;
      
      const entries = await storage.getAuditEntries(userId, parseInt(limit as string));
      
      res.json(entries);
    } catch (error) {
      console.error('Audit trail error:', error);
      res.status(500).json({ message: "Failed to fetch audit trail" });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'namaste-icd11-fhir'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
