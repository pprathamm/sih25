import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "" 
});

export interface MappingSuggestion {
  targetCode: string;
  targetDisplay?: string;
  equivalence: "equivalent" | "wider" | "narrower" | "inexact";
  confidence: string;
  rationale?: string;
}

export interface MappingResponse {
  mappings: MappingSuggestion[];
}

export class GeminiService {
  async getMappingSuggestions(prompt: string): Promise<MappingResponse> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: `You are a medical terminology mapping expert specializing in Traditional Medicine and ICD-11 classifications. 
Provide accurate mappings between NAMASTE codes and ICD-11 TM2 codes based on medical context and semantic similarity.
Always respond with valid JSON in the requested format.`,
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
                    equivalence: { 
                      type: "string",
                      enum: ["equivalent", "wider", "narrower", "inexact"]
                    },
                    confidence: { type: "string" },
                    rationale: { type: "string" }
                  },
                  required: ["targetCode", "equivalence", "confidence"]
                }
              }
            },
            required: ["mappings"]
          }
        },
        contents: prompt
      });

      const rawResponse = response.text;
      if (!rawResponse) {
        throw new Error("Empty response from Gemini AI");
      }

      const mappingData: MappingResponse = JSON.parse(rawResponse);
      
      // Validate the response structure
      if (!mappingData.mappings || !Array.isArray(mappingData.mappings)) {
        throw new Error("Invalid response format from Gemini AI");
      }

      return mappingData;
    } catch (error) {
      console.error("Gemini AI mapping error:", error);
      
      // Provide fallback suggestions based on common patterns
      return this.getFallbackMappings(prompt);
    }
  }

  private getFallbackMappings(prompt: string): MappingResponse {
    // Extract key terms from the prompt to provide basic fallback mappings
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("digestive") || lowerPrompt.includes("agni")) {
      return {
        mappings: [
          {
            targetCode: "TM2-DA01",
            targetDisplay: "Disorder of digestive qi transformation",
            equivalence: "equivalent",
            confidence: "75%",
            rationale: "Pattern-based fallback mapping for digestive disorders"
          }
        ]
      };
    }
    
    if (lowerPrompt.includes("respiratory") || lowerPrompt.includes("lung")) {
      return {
        mappings: [
          {
            targetCode: "TM2-RE01",
            targetDisplay: "Lung qi deficiency",
            equivalence: "equivalent",
            confidence: "70%",
            rationale: "Pattern-based fallback mapping for respiratory conditions"
          }
        ]
      };
    }

    if (lowerPrompt.includes("cardiac") || lowerPrompt.includes("heart")) {
      return {
        mappings: [
          {
            targetCode: "TM2-HE01",
            targetDisplay: "Heart qi stagnation",
            equivalence: "equivalent",
            confidence: "70%",
            rationale: "Pattern-based fallback mapping for cardiac conditions"
          }
        ]
      };
    }

    return {
      mappings: [
        {
          targetCode: "TM2-GEN01",
          targetDisplay: "General traditional medicine pattern",
          equivalence: "inexact",
          confidence: "50%",
          rationale: "Generic fallback mapping - manual review recommended"
        }
      ]
    };
  }

  async analyzeTerm(term: string, context?: string): Promise<string> {
    try {
      const prompt = `Analyze this medical terminology term and provide context:
Term: ${term}
${context ? `Context: ${context}` : ''}

Provide a brief analysis including:
1. Medical domain (Ayurveda, Siddha, Unani, Modern Medicine)
2. Key concepts and meanings
3. Potential ICD-11 classification areas

Keep the response concise and informative.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      return response.text || "Analysis unavailable";
    } catch (error) {
      console.error("Term analysis error:", error);
      return `Basic analysis for: ${term}. Consider manual review for detailed classification.`;
    }
  }
}

export const geminiService = new GeminiService();
