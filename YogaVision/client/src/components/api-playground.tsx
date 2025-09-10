import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Copy, Download } from "lucide-react";

export function ApiPlayground() {
  const [expandRequest, setExpandRequest] = useState(`{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "url",
      "valueUri": "http://namaste.gov.in/ValueSet/ayurveda-digestive"
    }
  ]
}`);

  const [translateRequest, setTranslateRequest] = useState(`{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "system",
      "valueUri": "http://namaste.gov.in/CodeSystem"
    },
    {
      "name": "code",
      "valueCode": "AYU-DIG-001"
    },
    {
      "name": "target",
      "valueUri": "http://id.who.int/icd/release/11/mms"
    }
  ]
}`);

  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const apiCallMutation = useMutation({
    mutationFn: async ({ endpoint, method, data }: { endpoint: string; method: string; data?: any }) => {
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: (data) => {
      setResponse(JSON.stringify(data, null, 2));
      toast({
        title: "API Call Successful",
        description: "The FHIR operation completed successfully.",
      });
    },
    onError: (error) => {
      setResponse(JSON.stringify({ error: error.message }, null, 2));
      toast({
        title: "API Call Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const executeValueSetExpand = () => {
    try {
      const params = JSON.parse(expandRequest);
      const url = params.parameter?.find((p: any) => p.name === "url")?.valueUri;
      
      if (!url) {
        throw new Error("URL parameter is required");
      }

      apiCallMutation.mutate({
        endpoint: `/fhir/ValueSet/$expand?url=${encodeURIComponent(url)}`,
        method: "GET"
      });
    } catch (error) {
      toast({
        title: "Invalid Request",
        description: "Please check your JSON syntax and parameters.",
        variant: "destructive",
      });
    }
  };

  const executeConceptMapTranslate = () => {
    try {
      const params = JSON.parse(translateRequest);
      
      apiCallMutation.mutate({
        endpoint: "/fhir/ConceptMap/$translate",
        method: "POST",
        data: params
      });
    } catch (error) {
      toast({
        title: "Invalid Request",
        description: "Please check your JSON syntax and parameters.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The content has been copied to your clipboard.",
    });
  };

  const downloadResponse = () => {
    if (!response) return;
    
    const blob = new Blob([response], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fhir-response.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" data-testid="heading-api-playground">FHIR R4 API Playground</h2>
        <p className="text-muted-foreground">
          Test FHIR terminology operations with live examples and real data.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="expand" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expand" data-testid="tab-valueset-expand">ValueSet $expand</TabsTrigger>
              <TabsTrigger value="translate" data-testid="tab-conceptmap-translate">ConceptMap $translate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="expand" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">ValueSet $expand Operation</CardTitle>
                    <Badge variant="outline" className="text-chart-1 border-chart-1">GET</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expand a NAMASTE ValueSet to retrieve all concepts within a specific domain.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Parameters (JSON)</label>
                    <Textarea
                      value={expandRequest}
                      onChange={(e) => setExpandRequest(e.target.value)}
                      className="font-mono text-sm h-40"
                      placeholder="Enter FHIR Parameters..."
                      data-testid="textarea-expand-request"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={executeValueSetExpand}
                      disabled={apiCallMutation.isPending}
                      className="flex-1"
                      data-testid="button-execute-expand"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute $expand
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(expandRequest)}
                      data-testid="button-copy-expand"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="translate" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">ConceptMap $translate Operation</CardTitle>
                    <Badge variant="outline" className="text-chart-2 border-chart-2">POST</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Translate NAMASTE codes to equivalent ICD-11 TM2 concepts.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Request Body (JSON)</label>
                    <Textarea
                      value={translateRequest}
                      onChange={(e) => setTranslateRequest(e.target.value)}
                      className="font-mono text-sm h-40"
                      placeholder="Enter FHIR Parameters..."
                      data-testid="textarea-translate-request"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={executeConceptMapTranslate}
                      disabled={apiCallMutation.isPending}
                      className="flex-1"
                      data-testid="button-execute-translate"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute $translate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(translateRequest)}
                      data-testid="button-copy-translate"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Response Panel */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Response</CardTitle>
              <div className="flex space-x-2">
                {response && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(response)}
                      data-testid="button-copy-response"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadResponse}
                      data-testid="button-download-response"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg bg-muted/50 p-4 h-96 overflow-auto" data-testid="response-area">
              {apiCallMutation.isPending ? (
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  Executing FHIR operation...
                </div>
              ) : response ? (
                <pre className="text-sm whitespace-pre-wrap">{response}</pre>
              ) : (
                <div className="text-center text-muted-foreground">
                  Select an operation and click execute to see the response...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-chart-1 border-chart-1">GET</Badge>
                <code className="text-sm">/fhir/ValueSet/$expand</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Expand NAMASTE ValueSets to get all contained concepts.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-chart-2 border-chart-2">POST</Badge>
                <code className="text-sm">/fhir/ConceptMap/$translate</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Translate codes between NAMASTE and ICD-11 systems.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-chart-3 border-chart-3">GET</Badge>
                <code className="text-sm">/api/search</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Search terminology concepts with AI-enhanced results.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-chart-4 border-chart-4">POST</Badge>
                <code className="text-sm">/fhir/Bundle/$validate</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Validate FHIR Bundles with dual-coded conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
