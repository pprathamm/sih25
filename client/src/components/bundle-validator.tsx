import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Package, CheckCircle, AlertTriangle, Copy, FileText, Upload } from "lucide-react";

interface ValidationIssue {
  severity: "information" | "warning" | "error";
  code: string;
  diagnostics: string;
}

interface ValidationResponse {
  resourceType: "OperationOutcome";
  issue: ValidationIssue[];
}

export function BundleValidator() {
  const [bundleJson, setBundleJson] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const { toast } = useToast();

  const validationMutation = useMutation({
    mutationFn: async (bundle: any) => {
      const response = await apiRequest("POST", "/fhir/Bundle/$validate", bundle);
      return response.json();
    },
    onSuccess: (data: ValidationResponse) => {
      setValidationResult(data);
      const hasErrors = data.issue.some(issue => issue.severity === "error");
      
      toast({
        title: hasErrors ? "Validation Issues Found" : "Bundle Valid",
        description: hasErrors 
          ? "The bundle contains validation errors. Please review below."
          : "FHIR Bundle structure and dual coding format validated successfully.",
        variant: hasErrors ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loadSampleBundle = () => {
    const sampleBundle = {
      "resourceType": "Bundle",
      "id": "example-problem-list",
      "type": "collection",
      "timestamp": new Date().toISOString(),
      "entry": [
        {
          "resource": {
            "resourceType": "Condition",
            "id": "condition-1",
            "clinicalStatus": {
              "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active"
              }]
            },
            "category": [{
              "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                "code": "problem-list-item"
              }]
            }],
            "code": {
              "coding": [
                {
                  "system": "http://namaste.gov.in/CodeSystem",
                  "code": "AYU-DIG-001",
                  "display": "Agnimandya (digestive fire deficiency)"
                },
                {
                  "system": "http://id.who.int/icd/release/11/mms",
                  "code": "TM2-DA01",
                  "display": "Disorder of digestive qi transformation"
                }
              ]
            },
            "subject": {
              "reference": "Patient/demo-patient",
              "display": "Demo Patient"
            },
            "recordedDate": new Date().toISOString()
          }
        }
      ]
    };

    setBundleJson(JSON.stringify(sampleBundle, null, 2));
    setValidationResult(null);
  };

  const clearBundle = () => {
    setBundleJson("");
    setValidationResult(null);
  };

  const handleValidate = () => {
    if (!bundleJson.trim()) {
      toast({
        title: "No Bundle Data",
        description: "Please enter a FHIR Bundle JSON before validating.",
        variant: "destructive",
      });
      return;
    }

    try {
      const bundle = JSON.parse(bundleJson);
      validationMutation.mutate(bundle);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard.",
    });
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "default";
      case "information":
        return "secondary";
      default:
        return "default";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      case "information":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" data-testid="heading-bundle-validator">FHIR Bundle Upload/Validate</h2>
        <p className="text-muted-foreground">
          Paste a FHIR Bundle to validate its structure and content against FHIR R4 specifications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>FHIR Bundle JSON</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="bundle-input" className="text-sm font-medium mb-2 block">
              Bundle Content
            </label>
            <Textarea
              id="bundle-input"
              value={bundleJson}
              onChange={(e) => setBundleJson(e.target.value)}
              placeholder="Paste FHIR Bundle JSON here..."
              className="font-mono text-sm h-64"
              data-testid="textarea-bundle-input"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={loadSampleBundle}
              data-testid="button-load-sample-bundle"
            >
              <FileText className="w-4 h-4 mr-2" />
              Load Sample Bundle
            </Button>
            <Button
              variant="outline"
              onClick={clearBundle}
              data-testid="button-clear-bundle"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(bundleJson)}
              disabled={!bundleJson.trim()}
              data-testid="button-copy-bundle"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={handleValidate}
              disabled={validationMutation.isPending || !bundleJson.trim()}
              data-testid="button-validate-bundle"
            >
              {validationMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                  Validating...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Validate Bundle
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card data-testid="validation-results">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Validation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.issue.length === 0 || 
             (validationResult.issue.length === 1 && validationResult.issue[0].severity === "information") ? (
              <Alert data-testid="validation-success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Bundle is valid!</strong>
                  <br />
                  FHIR Bundle structure and dual coding format validated successfully.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <Alert variant="destructive" data-testid="validation-has-issues">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Bundle contains validation issues. Please review the details below.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Validation Issues:</h4>
                  <div className="space-y-2">
                    {validationResult.issue.map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 rounded-lg border"
                        data-testid={`validation-issue-${index}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={getSeverityVariant(issue.severity)} className="text-xs">
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <code className="text-xs bg-muted px-1 rounded">{issue.code}</code>
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.diagnostics}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>FHIR Bundle Validation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">Bundle Requirements:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <code className="bg-muted px-1 rounded">resourceType</code> must be "Bundle"</li>
                <li>• <code className="bg-muted px-1 rounded">type</code> should be specified</li>
                <li>• <code className="bg-muted px-1 rounded">entry</code> array contains resources</li>
                <li>• Each entry must have a valid <code className="bg-muted px-1 rounded">resource</code></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-3">Condition Resource:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <code className="bg-muted px-1 rounded">clinicalStatus</code> required</li>
                <li>• <code className="bg-muted px-1 rounded">category</code> should include problem-list-item</li>
                <li>• <code className="bg-muted px-1 rounded">code</code> supports dual coding</li>
                <li>• <code className="bg-muted px-1 rounded">subject</code> reference required</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Dual Coding Support:</h4>
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="mb-2">The validator supports dual coding with:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>NAMASTE System:</strong> http://namaste.gov.in/CodeSystem</li>
                <li>• <strong>ICD-11 TM2 System:</strong> http://id.who.int/icd/release/11/mms</li>
                <li>• <strong>Biomedicine System:</strong> http://id.who.int/icd/release/11/mms (with different codes)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
