import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChatWidget } from "@/components/chat-widget";
import { 
  Zap, 
  Brain, 
  Package, 
  Shield, 
  Heart, 
  MessageCircle,
  CheckCircle,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAPI = () => {
    document.getElementById('api')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuthLogin = () => {
    setAuthModalOpen(false);
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm" data-testid="logo-text">N×I</span>
                </div>
                <div>
                  <h1 className="font-semibold text-lg" data-testid="app-title">NAMASTE × ICD-11</h1>
                  <p className="text-xs text-muted-foreground">FHIR Terminology Service</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-docs">
                Documentation
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-api">
                API Reference
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-support">
                Support
              </a>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  data-testid="button-theme-toggle"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button 
                  onClick={() => setAuthModalOpen(true)}
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
              </div>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-3 space-y-3">
              <a href="#" className="block text-muted-foreground hover:text-foreground">Documentation</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground">API Reference</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground">Support</a>
              <div className="flex items-center space-x-2 pt-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button onClick={() => setAuthModalOpen(true)}>Sign In</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-1/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="inline-flex items-center space-x-2 bg-primary/10 text-primary hover:bg-primary/20" data-testid="badge-fhir">
                  <Zap className="w-4 h-4" />
                  <span>FHIR R4 Compliant</span>
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight" data-testid="heading-hero">
                  Bridge Traditional Medicine with
                  <span className="text-primary"> Global Standards</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-hero-description">
                  Seamlessly integrate India's NAMASTE terminologies with WHO ICD-11 Traditional Medicine Module 2. 
                  Enable dual coding for Ayurveda, Siddha, and Unani systems in your EMR workflow.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={scrollToDemo} 
                  size="lg"
                  data-testid="button-try-demo"
                >
                  Try Live Demo
                </Button>
                <Button 
                  variant="outline" 
                  onClick={scrollToAPI} 
                  size="lg"
                  data-testid="button-explore-api"
                >
                  Explore API
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center" data-testid="stat-namaste-terms">
                  <div className="text-2xl font-bold text-primary">4,500+</div>
                  <div className="text-sm text-muted-foreground">NAMASTE Terms</div>
                </div>
                <div className="text-center" data-testid="stat-uptime">
                  <div className="text-2xl font-bold text-chart-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">API Uptime</div>
                </div>
                <div className="text-center" data-testid="stat-fhir">
                  <div className="text-2xl font-bold text-chart-3">FHIR R4</div>
                  <div className="text-sm text-muted-foreground">Compliant</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-primary/10 to-chart-1/10 rounded-2xl flex items-center justify-center" data-testid="hero-image-placeholder">
                <div className="text-center space-y-4">
                  <Heart className="w-16 h-16 mx-auto text-primary" />
                  <p className="text-muted-foreground">Healthcare Professional Interface</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold" data-testid="heading-features">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built for healthcare professionals, designed for seamless integration, powered by AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card data-testid="feature-dual-coding">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Dual Coding System</h3>
                <p className="text-muted-foreground">Automatically map NAMASTE codes to ICD-11 TM2 and Biomedicine classifications for comprehensive medical records.</p>
              </CardContent>
            </Card>
            
            <Card data-testid="feature-ai-mapping">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-chart-2" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Mapping</h3>
                <p className="text-muted-foreground">Intelligent semantic matching using Gemini API to suggest accurate code translations and provide contextual explanations.</p>
              </CardContent>
            </Card>
            
            <Card data-testid="feature-fhir-compliant">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-chart-3" />
                </div>
                <h3 className="text-xl font-semibold mb-3">FHIR R4 Compliant</h3>
                <p className="text-muted-foreground">Standards-compliant API endpoints for ValueSet expansion, ConceptMap translation, and Bundle validation.</p>
              </CardContent>
            </Card>
            
            <Card data-testid="feature-abha-integration">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-chart-4" />
                </div>
                <h3 className="text-xl font-semibold mb-3">ABHA Integration</h3>
                <p className="text-muted-foreground">OAuth 2.0 secured access using ABHA tokens with comprehensive audit trails for regulatory compliance.</p>
              </CardContent>
            </Card>
            
            <Card data-testid="feature-emr-integration">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-chart-5/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-chart-5" />
                </div>
                <h3 className="text-xl font-semibold mb-3">EMR Integration</h3>
                <p className="text-muted-foreground">Lightweight microservice that integrates seamlessly with existing Electronic Medical Record systems.</p>
              </CardContent>
            </Card>
            
            <Card data-testid="feature-ai-assistant">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Assistant</h3>
                <p className="text-muted-foreground">Interactive chat assistant for answering questions about AYUSH terminologies and coding best practices.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section id="demo" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold" data-testid="heading-demo">Experience the Platform</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Try our interactive dashboard with dual terminology search and AI-powered code mapping
            </p>
          </div>
          
          <Card className="overflow-hidden" data-testid="demo-preview">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-chart-2 rounded-full" data-testid="status-indicator"></div>
                    <span className="font-medium">Demo Environment Ready</span>
                  </div>
                  <Button 
                    onClick={() => setAuthModalOpen(true)}
                    data-testid="button-start-demo"
                  >
                    Start Demo
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Features Available:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-chart-2" />
                        <span className="text-sm">Dual terminology search</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-chart-2" />
                        <span className="text-sm">AI-powered code mapping</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-chart-2" />
                        <span className="text-sm">FHIR API playground</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-chart-2" />
                        <span className="text-sm">Problem list builder</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-chart-2" />
                        <span className="text-sm">Bundle validation</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-6" data-testid="demo-code-preview">
                    <h4 className="font-medium mb-3">Sample API Response:</h4>
                    <pre className="text-sm overflow-x-auto">
{`{
  "query": "Agnimandya",
  "results": [
    {
      "code": "AYU-DIG-001",
      "display": "Agnimandya (digestive fire deficiency)",
      "system": "http://namaste.gov.in/CodeSystem",
      "mappings": [
        {
          "code": "TM2-DA01",
          "display": "Disorder of digestive qi transformation",
          "system": "http://id.who.int/icd/release/11/mms"
        }
      ]
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* API Reference */}
      <section id="api" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold" data-testid="heading-api">FHIR R4 API Reference</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Standards-compliant endpoints for seamless EMR integration
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card data-testid="api-valueset-expand">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant="outline" className="text-chart-1 border-chart-1">GET</Badge>
                  <h3 className="text-lg font-semibold">ValueSet $expand</h3>
                </div>
                <p className="text-muted-foreground mb-4">Expand NAMASTE ValueSets to retrieve all concepts within a specific domain.</p>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm overflow-x-auto">
                  GET /fhir/ValueSet/$expand?url=http://namaste.gov.in/ValueSet/ayurveda
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="api-conceptmap-translate">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant="outline" className="text-chart-2 border-chart-2">POST</Badge>
                  <h3 className="text-lg font-semibold">ConceptMap $translate</h3>
                </div>
                <p className="text-muted-foreground mb-4">Translate NAMASTE codes to ICD-11 TM2 equivalents.</p>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm overflow-x-auto">
                  POST /fhir/ConceptMap/$translate
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="api-terminology-search">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant="outline" className="text-chart-3 border-chart-3">GET</Badge>
                  <h3 className="text-lg font-semibold">Terminology Search</h3>
                </div>
                <p className="text-muted-foreground mb-4">Search across NAMASTE and ICD-11 terminologies with auto-complete.</p>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm overflow-x-auto">
                  GET /api/search?q=agnimandya&include_icd=true
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="api-bundle-validation">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant="outline" className="text-chart-4 border-chart-4">POST</Badge>
                  <h3 className="text-lg font-semibold">Bundle Validation</h3>
                </div>
                <p className="text-muted-foreground mb-4">Validate FHIR Bundles containing dual-coded Condition resources.</p>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm overflow-x-auto">
                  POST /fhir/Bundle/$validate
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">N×I</span>
                </div>
                <div>
                  <h1 className="font-semibold">NAMASTE × ICD-11</h1>
                  <p className="text-xs text-muted-foreground">FHIR Terminology Service</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Bridging traditional medicine with global healthcare standards through innovative FHIR R4 compliance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Documentation</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Getting Started</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FHIR Integration</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Code Examples</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">NAMASTE Specification</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">ICD-11 TM2 Guide</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">ABHA Integration</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support Forum</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              © 2024 NAMASTE × ICD-11 FHIR Service. Built for healthcare innovation.
            </p>
            <p className="text-muted-foreground text-sm">
              Compliant with India EHR Standards 2016
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent data-testid="modal-auth">
          <DialogHeader>
            <DialogTitle>ABHA OAuth Login</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="abha-number">ABHA Number</Label>
              <Input
                id="abha-number"
                placeholder="14-1234-5678-9012"
                data-testid="input-abha-number"
              />
            </div>
            <div>
              <Label htmlFor="abha-pin">PIN</Label>
              <Input
                id="abha-pin"
                type="password"
                placeholder="Enter 4-digit PIN"
                data-testid="input-abha-pin"
              />
            </div>
            <Button 
              onClick={handleAuthLogin} 
              className="w-full"
              data-testid="button-authenticate"
            >
              Authenticate with ABHA
            </Button>
            <p className="text-muted-foreground text-sm text-center">
              This is a demo environment. Use any credentials to proceed.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
