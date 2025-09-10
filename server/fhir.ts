import { z } from "zod";

// FHIR R4 Types and Schemas

export const FHIRCodingSchema = z.object({
  system: z.string().optional(),
  version: z.string().optional(),
  code: z.string().optional(),
  display: z.string().optional(),
  userSelected: z.boolean().optional(),
});

export const FHIRCodeableConceptSchema = z.object({
  coding: z.array(FHIRCodingSchema).optional(),
  text: z.string().optional(),
});

export const FHIRParameterSchema = z.object({
  name: z.string(),
  valueString: z.string().optional(),
  valueCode: z.string().optional(),
  valueUri: z.string().optional(),
  valueBoolean: z.boolean().optional(),
  valueInteger: z.number().optional(),
  valueCoding: FHIRCodingSchema.optional(),
  valueCodeableConcept: FHIRCodeableConceptSchema.optional(),
  part: z.array(z.any()).optional(),
});

export const FHIRParametersSchema = z.object({
  resourceType: z.literal("Parameters"),
  id: z.string().optional(),
  parameter: z.array(FHIRParameterSchema).optional(),
});

export const FHIRValueSetContainsSchema = z.object({
  system: z.string().optional(),
  abstract: z.boolean().optional(),
  inactive: z.boolean().optional(),
  version: z.string().optional(),
  code: z.string().optional(),
  display: z.string().optional(),
  designation: z.array(z.any()).optional(),
  contains: z.array(z.any()).optional(),
});

export const FHIRValueSetExpansionSchema = z.object({
  identifier: z.string().optional(),
  timestamp: z.string(),
  total: z.number().optional(),
  offset: z.number().optional(),
  parameter: z.array(FHIRParameterSchema).optional(),
  contains: z.array(FHIRValueSetContainsSchema).optional(),
});

export const FHIRValueSetSchema = z.object({
  resourceType: z.literal("ValueSet"),
  id: z.string().optional(),
  url: z.string().optional(),
  identifier: z.array(z.any()).optional(),
  version: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(["draft", "active", "retired", "unknown"]),
  experimental: z.boolean().optional(),
  date: z.string().optional(),
  publisher: z.string().optional(),
  description: z.string().optional(),
  expansion: FHIRValueSetExpansionSchema.optional(),
});

export const FHIRConditionSchema = z.object({
  resourceType: z.literal("Condition"),
  id: z.string().optional(),
  clinicalStatus: FHIRCodeableConceptSchema.optional(),
  verificationStatus: FHIRCodeableConceptSchema.optional(),
  category: z.array(FHIRCodeableConceptSchema).optional(),
  severity: FHIRCodeableConceptSchema.optional(),
  code: FHIRCodeableConceptSchema.optional(),
  subject: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }),
  onsetDateTime: z.string().optional(),
  recordedDate: z.string().optional(),
  recorder: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
});

export const FHIRBundleEntrySchema = z.object({
  fullUrl: z.string().optional(),
  resource: z.any(),
  search: z.object({
    mode: z.enum(["match", "include", "outcome"]).optional(),
    score: z.number().optional(),
  }).optional(),
});

export const FHIRBundleSchema = z.object({
  resourceType: z.literal("Bundle"),
  id: z.string().optional(),
  identifier: z.any().optional(),
  type: z.enum([
    "document", "message", "transaction", "transaction-response",
    "batch", "batch-response", "history", "searchset", "collection"
  ]),
  timestamp: z.string().optional(),
  total: z.number().optional(),
  link: z.array(z.any()).optional(),
  entry: z.array(FHIRBundleEntrySchema).optional(),
});

// FHIR Helper Functions

export function createFHIRParameters(params: Array<{
  name: string;
  value: any;
  type: string;
}>): any {
  return {
    resourceType: "Parameters",
    parameter: params.map(p => {
      const param: any = { name: p.name };
      param[`value${p.type}`] = p.value;
      return param;
    })
  };
}

export function createFHIRValueSetExpansion(
  url: string,
  concepts: Array<{
    system: string;
    code: string;
    display: string;
  }>
): any {
  return {
    resourceType: "ValueSet",
    id: url.split('/').pop() + "-expanded",
    url,
    status: "active",
    expansion: {
      identifier: `urn:uuid:${generateUUID()}`,
      timestamp: new Date().toISOString(),
      total: concepts.length,
      contains: concepts.map(concept => ({
        system: concept.system,
        code: concept.code,
        display: concept.display
      }))
    }
  };
}

export function createFHIRTranslationResult(
  sourceCode: string,
  sourceSystem: string,
  sourceDisplay: string,
  mappings: Array<{
    code: string;
    system: string;
    display: string;
    equivalence: string;
  }>
): any {
  const hasResults = mappings.length > 0;
  
  const parameters: any[] = [
    {
      name: "result",
      valueBoolean: hasResults
    }
  ];

  if (hasResults) {
    mappings.forEach(mapping => {
      parameters.push({
        name: "match",
        part: [
          {
            name: "equivalence",
            valueCode: mapping.equivalence
          },
          {
            name: "concept",
            valueCoding: {
              system: mapping.system,
              code: mapping.code,
              display: mapping.display
            }
          }
        ]
      });
    });
  }

  return {
    resourceType: "Parameters",
    parameter: parameters
  };
}

export function createFHIRCondition(
  patientRef: string,
  namasteCode: string,
  namasteDisplay: string,
  icd11Code?: string,
  icd11Display?: string
): any {
  const coding: any[] = [
    {
      system: "http://namaste.gov.in/CodeSystem",
      code: namasteCode,
      display: namasteDisplay
    }
  ];

  if (icd11Code && icd11Display) {
    coding.push({
      system: "http://id.who.int/icd/release/11/mms",
      code: icd11Code,
      display: icd11Display
    });
  }

  return {
    resourceType: "Condition",
    id: generateUUID(),
    clinicalStatus: {
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
        code: "active"
      }]
    },
    category: [{
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/condition-category",
        code: "problem-list-item"
      }]
    }],
    code: {
      coding
    },
    subject: {
      reference: patientRef
    },
    recordedDate: new Date().toISOString()
  };
}

export function createFHIRBundle(
  type: string,
  entries: any[]
): any {
  return {
    resourceType: "Bundle",
    id: generateUUID(),
    type,
    timestamp: new Date().toISOString(),
    total: entries.length,
    entry: entries.map(resource => ({
      resource
    }))
  };
}

export function validateFHIRBundle(bundle: any): {
  isValid: boolean;
  errors: string[];
} {
  try {
    FHIRBundleSchema.parse(bundle);
    
    const errors: string[] = [];
    
    // Additional validation rules
    if (bundle.entry) {
      bundle.entry.forEach((entry: any, index: number) => {
        if (!entry.resource) {
          errors.push(`Entry ${index}: Missing resource`);
        } else if (!entry.resource.resourceType) {
          errors.push(`Entry ${index}: Missing resourceType`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [(error as Error).message]
    };
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Types
export type FHIRCoding = z.infer<typeof FHIRCodingSchema>;
export type FHIRCodeableConcept = z.infer<typeof FHIRCodeableConceptSchema>;
export type FHIRParameter = z.infer<typeof FHIRParameterSchema>;
export type FHIRParameters = z.infer<typeof FHIRParametersSchema>;
export type FHIRValueSet = z.infer<typeof FHIRValueSetSchema>;
export type FHIRCondition = z.infer<typeof FHIRConditionSchema>;
export type FHIRBundle = z.infer<typeof FHIRBundleSchema>;
