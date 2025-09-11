import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Stethoscope, 
  Code, 
  Play, 
  Copy,
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react";

export default function ApiDocs() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string>("Click a test button to see API response");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testAPI = async (endpoint: string) => {
    setActiveTest(endpoint);
    setIsLoading(true);
    setApiResponse("Loading...");

    try {
      let response;
      let result;

      switch (endpoint) {
        case 'expand':
          response = await apiRequest('GET', '/api/fhir/ValueSet/namaste-codes/expand?filter=digestive&count=5');
          result = await response.json();
          break;

        case 'translate':
          response = await apiRequest('POST', '/api/fhir/ConceptMap/translate', {
            code: "AYU-DIG-001",
            system: "NAMASTE",
            target: "http://icd.who.int/tm2"
          });
          result = await response.json();
          break;

        case 'search':
          response = await apiRequest('POST', '/api/search', {
            query: "digestive disorders",
            systems: ["NAMASTE", "ICD-11-TM2"],
            includeSuggestions: true
          });
          result = await response.json();
          break;

        case 'validate':
          const sampleBundle = {
            resourceType: "Bundle",
            type: "collection",
            entry: [{
              resource: {
                resourceType: "Condition",
                code: {
                  coding: [{
                    system: "http://namaste.gov.in/CodeSystem",
                    code: "AYU-DIG-001"
                  }]
                }
              }
            }]
          };
          response = await apiRequest('POST', '/api/bundle/validate', sampleBundle);
          result = await response.json();
          break;

        default:
          throw new Error('Unknown endpoint');
      }

      setApiResponse(JSON.stringify(result, null, 2));
      
      toast({
        title: "API test successful",
        description: `${endpoint} endpoint responded successfully`
      });

    } catch (error) {
      console.error('API test error:', error);
      setApiResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        title: "API test failed",
        description: "Please check the console for details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setActiveTest(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet has been copied"
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Stethoscope className="text-primary text-xl" />
              <h1 className="text-lg font-semibold">NAMASTE × ICD‑11</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <button className="nav-btn text-sm hover:text-primary transition-colors" data-testid="nav-home">
                  Home
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="nav-btn text-sm hover:text-primary transition-colors" data-testid="nav-dashboard">
                  Dashboard
                </button>
              </Link>
              <Link href="/api-docs">
                <button className="nav-btn text-sm hover:text-primary transition-colors font-semibold text-primary" data-testid="nav-api">
                  API
                </button>
              </Link>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-demo-login">
                <span className="mr-2">👤</span>Demo Login
              </Button>
            </nav>
            <button className="md:hidden" data-testid="button-mobile-menu">
              <span className="sr-only">Menu</span>
              ☰
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
          <p className="text-muted-foreground">FHIR R4-compliant REST endpoints for terminology operations</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-chart-3 text-white">POST</Badge>
                    <code className="font-mono text-sm">/auth/login</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard('/auth/login')}
                      data-testid="button-copy-auth"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">ABHA OAuth 2.0 token authentication</p>
                  <div className="bg-muted p-3 rounded font-mono text-sm overflow-x-auto">
<pre>{`{
  "grant_type": "authorization_code",
  "client_id": "your_client_id", 
  "code": "auth_code"
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FHIR Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">FHIR Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ValueSet Expand */}
                <div className="bg-background p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-primary text-primary-foreground">GET</Badge>
                    <code className="font-mono text-sm">/fhir/ValueSet/$expand</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard('/fhir/ValueSet/$expand')}
                      data-testid="button-copy-expand"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Expand NAMASTE or ICD-11 ValueSets</p>
                  <div className="bg-muted p-3 rounded font-mono text-sm overflow-x-auto">
<pre>{`GET /fhir/ValueSet/namaste-codes/$expand?filter=digestive&count=20`}</pre>
                  </div>
                </div>

                {/* ConceptMap Translate */}
                <div className="bg-background p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-chart-3 text-white">POST</Badge>
                    <code className="font-mono text-sm">/fhir/ConceptMap/$translate</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard('/fhir/ConceptMap/$translate')}
                      data-testid="button-copy-translate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Translate NAMASTE codes to ICD-11 TM2</p>
                  <div className="bg-muted p-3 rounded font-mono text-sm overflow-x-auto">
<pre>{`{
  "code": "AYU-DIG-001",
  "system": "http://namaste.gov.in/CodeSystem",
  "target": "http://icd.who.int/tm2"
}`}</pre>
                  </div>
                </div>

                {/* Bundle Validation */}
                <div className="bg-background p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-chart-3 text-white">POST</Badge>
                    <code className="font-mono text-sm">/api/bundle/validate</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard('/api/bundle/validate')}
                      data-testid="button-copy-validate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Validate FHIR Bundles with dual coding</p>
                  <div className="bg-muted p-3 rounded font-mono text-sm overflow-x-auto">
<pre>{`{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [...conditions with dual codes...]
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search API */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Search API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-chart-3 text-white">POST</Badge>
                    <code className="font-mono text-sm">/api/search</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard('/api/search')}
                      data-testid="button-copy-search"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Intelligent dual terminology search with AI suggestions</p>
                  <div className="bg-muted p-3 rounded font-mono text-sm overflow-x-auto">
<pre>{`{
  "query": "digestive disorders",
  "systems": ["NAMASTE", "ICD-11-TM2"],
  "includeSuggestions": true
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Quick Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => testAPI('expand')}
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-test-expand"
                >
                  {activeTest === 'expand' && isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Testing...
                    </span>
                  ) : (
                    <>
                      <Code className="h-4 w-4 mr-2" />
                      Test ValueSet $expand
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => testAPI('translate')}
                  disabled={isLoading}
                  className="w-full bg-chart-1 text-white hover:bg-chart-1/90"
                  data-testid="button-test-translate"
                >
                  {activeTest === 'translate' && isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Testing...
                    </span>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Test ConceptMap $translate
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => testAPI('search')}
                  disabled={isLoading}
                  className="w-full bg-chart-3 text-white hover:bg-chart-3/90"
                  data-testid="button-test-search"
                >
                  {activeTest === 'search' && isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Testing...
                    </span>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Test Dual Search
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => testAPI('validate')}
                  disabled={isLoading}
                  className="w-full bg-chart-2 text-white hover:bg-chart-2/90"
                  data-testid="button-test-validate"
                >
                  {activeTest === 'validate' && isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Testing...
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Test Bundle Validation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">FHIR Server</span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                      <span className="text-sm text-chart-2">Online</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Terminology DB</span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                      <span className="text-sm text-chart-2">Connected</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gemini AI</span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                      <span className="text-sm text-chart-2">Active</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={apiResponse}
                  readOnly
                  className="bg-background border border-border font-mono text-sm min-h-48 resize-none"
                  data-testid="textarea-response"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(apiResponse)}
                    data-testid="button-copy-response"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
