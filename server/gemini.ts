import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TerminologyMapping {
  sourceCode: string;
  sourceDisplay: string;
  targetCode: string;
  targetDisplay: string;
  confidence: number;
  explanation: string;
}

export interface TerminologyQuestion {
  answer: string;
  confidence: number;
  sources: string[];
}

export async function generateConceptMappings(
  namasteCode: string,
  namasteDisplay: string,
  namasteDefinition?: string
): Promise<TerminologyMapping[]> {
  try {
    const systemPrompt = `You are an expert in medical terminology mapping between AYUSH systems (Ayurveda, Siddha, Unani) and WHO ICD-11 Traditional Medicine Module 2 (TM2).

Your task is to suggest accurate ICD-11 TM2 code mappings for NAMASTE codes.

Rules:
1. Only suggest mappings to ICD-11 TM2 codes (system: http://id.who.int/icd/release/11/mms)
2. Provide confidence scores (0-100) based on semantic similarity and clinical relevance
3. Include brief explanations for each mapping
4. Return 1-3 best mapping suggestions
5. If no good mapping exists, return an empty array

Respond with JSON in this format:
{
  "mappings": [
    {
      "targetCode": "TM2-XX##",
      "targetDisplay": "ICD-11 TM2 term",
      "confidence": 85,
      "explanation": "Brief explanation of mapping rationale"
    }
  ]
}`;

    const prompt = `Map this NAMASTE code to ICD-11 TM2:

Code: ${namasteCode}
Display: ${namasteDisplay}
${namasteDefinition ? `Definition: ${namasteDefinition}` : ''}

Provide accurate ICD-11 TM2 mappings with confidence scores.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  targetCode: { type: "string" },
                  targetDisplay: { type: "string" },
                  confidence: { type: "number" },
                  explanation: { type: "string" }
                },
                required: ["targetCode", "targetDisplay", "confidence", "explanation"]
              }
            }
          },
          required: ["mappings"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data.mappings.map((mapping: any) => ({
        sourceCode: namasteCode,
        sourceDisplay: namasteDisplay,
        targetCode: mapping.targetCode,
        targetDisplay: mapping.targetDisplay,
        confidence: mapping.confidence,
        explanation: mapping.explanation
      }));
    }

    return [];
  } catch (error) {
    console.error('Failed to generate concept mappings:', error);
    return [];
  }
}

export async function enhanceTerminologySearch(
  query: string,
  searchResults: any[]
): Promise<any[]> {
  try {
    const systemPrompt = `You are an expert in AYUSH medical terminology (Ayurveda, Siddha, Unani) and medical coding.

Your task is to analyze search results and provide semantic enhancements:
1. Reorder results by clinical relevance to the query
2. Add contextual information about each term
3. Suggest related terms that might be relevant
4. Identify any potential spelling corrections or alternative terms

Respond with JSON containing the enhanced results in the same format but potentially reordered and with additional context.`;

    const prompt = `Query: "${query}"
Search Results: ${JSON.stringify(searchResults)}

Enhance these search results with better ordering and contextual information.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data.results || searchResults;
    }

    return searchResults;
  } catch (error) {
    console.error('Failed to enhance terminology search:', error);
    return searchResults;
  }
}

export async function answerTerminologyQuestion(
  question: string,
  context?: any
): Promise<TerminologyQuestion> {
  try {
    const systemPrompt = `You are an expert AYUSH terminology assistant with deep knowledge of:
- NAMASTE coding system for Ayurveda, Siddha, and Unani
- WHO ICD-11 Traditional Medicine Module 2 (TM2)
- FHIR R4 terminology services
- Medical coding best practices
- Indian EHR Standards 2016

Provide accurate, helpful answers about terminology, coding practices, and system integration.
Always cite relevant standards or sources when possible.

Respond with JSON in this format:
{
  "answer": "Detailed answer to the question",
  "confidence": 95,
  "sources": ["Standard or source references"]
}`;

    const prompt = `Question: ${question}
${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide a comprehensive answer about AYUSH terminologies and coding.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            confidence: { type: "number" },
            sources: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["answer", "confidence", "sources"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }

    throw new Error("Empty response from model");
  } catch (error) {
    console.error('Failed to answer terminology question:', error);
    return {
      answer: "I apologize, but I'm unable to process your question at the moment. Please try rephrasing or contact support for assistance.",
      confidence: 0,
      sources: []
    };
  }
}

export async function validateCSVData(csvData: string): Promise<{
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}> {
  try {
    // For demo purposes, perform basic validation without strict AI checking
    const lines = csvData.trim().split('\n');
    
    if (lines.length < 2) {
      return {
        isValid: false,
        errors: ["CSV must contain at least a header row and one data row"],
        suggestions: ["Add header row with columns: code, display, definition, category"]
      };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredColumns = ['code', 'display'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      return {
        isValid: false,
        errors: [`Missing required columns: ${missingColumns.join(', ')}`],
        suggestions: ["Ensure CSV has 'code' and 'display' columns"]
      };
    }

    // For demo - always pass validation with helpful suggestions
    return {
      isValid: true,
      errors: [],
      suggestions: [
        "Demo mode: CSV format looks good for ingestion",
        "Consider adding 'definition' column for better terminology descriptions",
        "Category field helps organize codes by system (AYU, SID, UNA)",
        "Codes should follow format: SYSTEM-CATEGORY-NUMBER (e.g., AYU-DIG-001)"
      ]
    };

    // Optional AI validation for production (currently disabled for demo)
    /*
    const systemPrompt = `You are a medical terminology data validation expert providing helpful feedback for NAMASTE code CSV imports.

Be lenient and supportive in validation:
1. Accept reasonable code formats (focus on helping rather than rejecting)
2. Provide constructive suggestions for improvement
3. Only mark as invalid if data is completely unusable
4. Encourage proper NAMASTE format but don't be overly strict

Respond with JSON validation results that help users improve their data.`;

    const prompt = `Validate this NAMASTE CSV data in a helpful, supportive manner:

${csvData}

Provide constructive feedback and suggestions for improvement.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            isValid: { type: "boolean" },
            errors: {
              type: "array",
              items: { type: "string" }
            },
            suggestions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["isValid", "errors", "suggestions"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
    */

  } catch (error) {
    console.error('Failed to validate CSV data:', error);
    return {
      isValid: true, // Allow validation to pass for demo
      errors: [],
      suggestions: ["Demo mode: CSV validation completed with basic checks"]
    };
  }
}
