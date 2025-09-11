import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, AlertCircle, Copy, Code, FileText } from "lucide-react";
import type { ValidationResult } from "@shared/schema";

export default function BundleValidator() {
  const [bundleContent, setBundleContent] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const loadSampleBundle = () => {
    const sampleBundle = {
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "Condition",
            id: "condition-1",
            clinicalStatus: {
              coding: [{
                system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                code: "active"
              }]
            },
            code: {
              coding: [
                {
                  system: "http://namaste.gov.in/CodeSystem",
                  code: "AYU-DIG-001",
                  display: "Agnimandya (digestive fire deficiency)"
                },
                {
                  system: "http://icd.who.int/tm2",
                  code: "TM2-DA01",
                  display: "Disorder of digestive qi transformation"
                }
              ]
            },
            subject: {
              reference: "Patient/demo-patient"
            }
          }
        }
      ]
    };

    setBundleContent(JSON.stringify(sampleBundle, null, 2));
    toast({
      title: "Sample bundle loaded",
      description: "A sample FHIR Bundle with dual coding has been loaded."
    });
  };

  const validateBundle = async () => {
    if (!bundleContent.trim()) {
      toast({
        title: "Bundle content required",
        description: "Please paste a FHIR Bundle JSON to validate.",
        variant: "destructive"
      });
      return;
    }

    let bundle;
    try {
      bundle = JSON.parse(bundleContent);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "The bundle content is not valid JSON.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await apiRequest('POST', '/api/bundle/validate', bundle);
      const result = await response.json();
      setValidationResult(result);
      
      toast({
        title: result.valid ? "Validation successful" : "Validation completed with issues",
        description: result.valid ? "Bundle is valid FHIR R4" : "Bundle has validation issues",
        variant: result.valid ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation failed",
        description: "Failed to validate bundle. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            FHIR Bundle Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your FHIR Bundle JSON here..."
            value={bundleContent}
            onChange={(e) => setBundleContent(e.target.value)}
            className="min-h-64 font-mono text-sm resize-none"
            data-testid="textarea-bundle"
          />
          <div className="flex gap-4">
            <Button
              onClick={validateBundle}
              disabled={isValidating}
              data-testid="button-validate"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isValidating ? "Validating..." : "Validate"}
            </Button>
            <Button
              onClick={loadSampleBundle}
              variant="outline"
              data-testid="button-load-sample"
            >
              <Copy className="h-4 w-4 mr-2" />
              Load Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Validation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validationResult ? (
            <div className="space-y-4">
              {/* Validation Status */}
              <div className={`p-4 rounded-lg border ${
                validationResult.valid 
                  ? 'bg-chart-2/10 border-chart-2/20' 
                  : 'bg-destructive/10 border-destructive/20'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-chart-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className={`font-medium ${
                    validationResult.valid ? 'text-chart-2' : 'text-destructive'
                  }`}>
                    {validationResult.valid ? 'Valid FHIR Bundle' : 'Invalid FHIR Bundle'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {validationResult.valid 
                    ? 'Bundle structure is valid and contains proper dual coding entries'
                    : 'Bundle has validation issues that need to be addressed'
                  }
                </p>
              </div>

              {/* Errors */}
              {validationResult.errors && validationResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-destructive mb-2">Errors</h4>
                  <ul className="space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-destructive">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">Warnings</h4>
                  <ul className="space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-600">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              {validationResult.summary && (
                <div>
                  <h4 className="font-medium mb-3">Bundle Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span>Resources:</span>
                      <Badge variant="outline" data-testid="summary-resources">
                        {validationResult.summary.resources}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Conditions:</span>
                      <Badge variant="outline" data-testid="summary-conditions">
                        {validationResult.summary.conditions}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>NAMASTE Codes:</span>
                      <Badge variant="outline" data-testid="summary-namaste">
                        {validationResult.summary.namasteCodes}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>ICD-11 Codes:</span>
                      <Badge variant="outline" data-testid="summary-icd11">
                        {validationResult.summary.icd11Codes}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Click "Validate" to see validation results
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
