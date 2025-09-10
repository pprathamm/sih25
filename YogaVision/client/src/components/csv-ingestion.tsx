import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

interface IngestionResponse {
  message: string;
  codesProcessed: number;
  validation: ValidationResult;
}

export function CsvIngestion() {
  const [csvData, setCsvData] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [ingestionResult, setIngestionResult] = useState<IngestionResponse | null>(null);
  const { toast } = useToast();

  const ingestionMutation = useMutation({
    mutationFn: async (data: { csvData: string }) => {
      const response = await apiRequest("POST", "/api/csv/ingest", data);
      return response.json();
    },
    onSuccess: (data: IngestionResponse) => {
      setIngestionResult(data);
      setValidationResult(data.validation);
      toast({
        title: "CSV Ingested Successfully",
        description: `${data.codesProcessed} codes have been processed and stored.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "CSV Ingestion Failed",
        description: error.message,
        variant: "destructive",
      });
      
      // Try to extract validation errors from the error response
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.errors && errorData.suggestions) {
          setValidationResult({
            isValid: false,
            errors: errorData.errors,
            suggestions: errorData.suggestions
          });
        }
      } catch {
        // Ignore JSON parsing errors
      }
    },
  });

  const loadSampleCSV = () => {
    const sampleData = `code,display,definition
AYU-DIG-001,Agnimandya (digestive fire deficiency),Condition where digestive fire is weakened
AYU-RES-002,Kasa (cough),Respiratory condition with persistent cough
AYU-NEU-005,Shirashoola (headache),Neurological condition causing head pain
SID-RES-015,Irumal (cough - Siddha),Siddha classification for cough disorders
UNA-RES-021,Nazla (catarrh),Unani term for nasal congestion and discharge
UNA-DIG-030,So-e-Meda (metabolic disorder),Unani metabolic condition
AYU-DIG-011,Amla pitta (acid dyspepsia),Ayurvedic acid-related digestive disorder`;
    
    setCsvData(sampleData);
    setValidationResult(null);
    setIngestionResult(null);
  };

  const clearCSV = () => {
    setCsvData("");
    setValidationResult(null);
    setIngestionResult(null);
  };

  const handleIngest = () => {
    if (!csvData.trim()) {
      toast({
        title: "No CSV Data",
        description: "Please enter CSV data before ingesting.",
        variant: "destructive",
      });
      return;
    }

    ingestionMutation.mutate({ csvData });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" data-testid="heading-csv-ingestion">Ingest NAMASTE CSV</h2>
        <p className="text-muted-foreground">
          Upload CSV with columns: code, display, definition. This updates the in-memory NAMASTE CodeSystem with AI-assisted validation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>CSV Data Input</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="csv-input" className="text-sm font-medium mb-2 block">
              CSV Content
            </label>
            <Textarea
              id="csv-input"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste CSV content here..."
              className="font-mono text-sm h-48"
              data-testid="textarea-csv-input"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={loadSampleCSV}
              data-testid="button-load-sample"
            >
              <FileText className="w-4 h-4 mr-2" />
              Load Sample
            </Button>
            <Button
              variant="outline"
              onClick={clearCSV}
              data-testid="button-clear-csv"
            >
              Clear
            </Button>
            <Button
              onClick={handleIngest}
              disabled={ingestionMutation.isPending || !csvData.trim()}
              data-testid="button-ingest-csv"
            >
              {ingestionMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Ingest CSV
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
              <Sparkles className="w-5 h-5 text-primary" />
              <span>AI Validation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.isValid ? (
              <Alert data-testid="validation-success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  CSV data is valid and ready for ingestion.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" data-testid="validation-errors">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Validation issues found. Please review the errors below.
                </AlertDescription>
              </Alert>
            )}

            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-destructive">Validation Errors:</h4>
                <ul className="space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="text-sm text-destructive bg-destructive/10 rounded p-2">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-primary">AI Suggestions:</h4>
                <ul className="space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                      💡 {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ingestion Success */}
      {ingestionResult && (
        <Card data-testid="ingestion-success">
          <CardContent className="p-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{ingestionResult.message}</strong>
                <br />
                {ingestionResult.codesProcessed} codes have been processed and stored.
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">
                  💡 Tip: Try searching the new codes in the Dual Terminology Search tab.
                </span>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* CSV Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-2">Required Columns:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">code</code> - NAMASTE code (e.g., AYU-DIG-001)</li>
                <li><code className="bg-muted px-1 rounded">display</code> - Human-readable term</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">Optional Columns:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">definition</code> - Detailed description</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Code Format:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>AYU-XXX-###</strong> - Ayurveda codes</li>
                <li><strong>SID-XXX-###</strong> - Siddha codes</li>
                <li><strong>UNA-XXX-###</strong> - Unani codes</li>
                <li>Where XXX = system (DIG, RES, NEU, etc.) and ### = sequence number</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
