import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Stethoscope, 
  Search, 
  GitBranch, 
  FileText, 
  Shield, 
  List, 
  Brain,
  CheckCircle,
  Code,
  Rocket
} from "lucide-react";

export default function Home() {
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
                <button className="nav-btn text-sm hover:text-primary transition-colors font-semibold text-primary" data-testid="nav-home">
                  Home
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="nav-btn text-sm hover:text-primary transition-colors" data-testid="nav-dashboard">
                  Dashboard
                </button>
              </Link>
              <Link href="/api-docs">
                <button className="nav-btn text-sm hover:text-primary transition-colors" data-testid="nav-api">
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

      <main className="min-h-screen">
        {/* Hero Section */}
        <div className="gradient-bg py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Bridge <span className="text-primary">AYUSH</span> & <span className="text-primary">Global</span> Medical Terminologies
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                FHIR R4-compliant microservice connecting India's NAMASTE codes with WHO ICD-11 TM2. 
                Enable dual coding for traditional and modern medicine with intelligent mapping.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-launch-dashboard">
                    <Rocket className="mr-2 h-4 w-4" />Launch Dashboard
                  </Button>
                </Link>
                <Link href="/api-docs">
                  <Button size="lg" variant="outline" className="border-border hover:bg-accent" data-testid="button-explore-api">
                    <Code className="mr-2 h-4 w-4" />Explore API
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Comprehensive FHIR Integration</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built for India's EHR Standards with WHO compliance and intelligent terminology mapping
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-background border-border">
                <CardHeader>
                  <Search className="text-primary text-2xl mb-4" />
                  <CardTitle className="text-xl">Dual Terminology Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Search NAMASTE codes with intelligent ICD-11 TM2 mapping suggestions powered by Gemini AI.</p>
                </CardContent>
              </Card>

              <Card className="bg-background border-border">
                <CardHeader>
                  <GitBranch className="text-primary text-2xl mb-4" />
                  <CardTitle className="text-xl">FHIR R4 Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">ValueSet expansion, ConceptMap translation, and Bundle validation following FHIR standards.</p>
                </CardContent>
              </Card>

              <Card className="bg-background border-border">
                <CardHeader>
                  <FileText className="text-primary text-2xl mb-4" />
                  <CardTitle className="text-xl">CSV Ingestion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Load NAMASTE terminologies from CSV exports with automatic CodeSystem generation.</p>
                </CardContent>
              </Card>

              <Card className="bg-background border-border">
                <CardHeader>
                  <Shield className="text-primary text-2xl mb-4" />
                  <CardTitle className="text-xl">OAuth 2.0 Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">ABHA token integration with comprehensive audit trails for compliance.</p>
                </CardContent>
              </Card>

              <Card className="bg-background border-border">
                <CardHeader>
                  <List className="text-primary text-2xl mb-4" />
                  <CardTitle className="text-xl">Problem List Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Create FHIR Bundle entries with dual coding for comprehensive patient records.</p>
                </CardContent>
              </Card>

              <Card className="bg-background border-border">
                <CardHeader>
                  <Brain className="text-primary text-2xl mb-4" />
                  <CardTitle className="text-xl">AI-Powered Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Intelligent term suggestions using Gemini API for accurate code translations.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Technical Overview */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Built for Healthcare Interoperability</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-primary mt-1 h-5 w-5" />
                    <div>
                      <h4 className="font-semibold">NAMASTE Integration</h4>
                      <p className="text-muted-foreground">4,500+ standardized Ayurveda, Siddha & Unani terms</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-primary mt-1 h-5 w-5" />
                    <div>
                      <h4 className="font-semibold">WHO ICD-11 TM2</h4>
                      <p className="text-muted-foreground">Traditional Medicine Module 2 with biomedicine mapping</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-primary mt-1 h-5 w-5" />
                    <div>
                      <h4 className="font-semibold">India EHR Standards</h4>
                      <p className="text-muted-foreground">2016 EHR compliance with ISO 22600 security</p>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">API Endpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">GET</span>
                      <span className="text-muted-foreground">/fhir/ValueSet/$expand</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-chart-3 text-white px-2 py-1 rounded text-xs">POST</span>
                      <span className="text-muted-foreground">/fhir/ConceptMap/$translate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-chart-3 text-white px-2 py-1 rounded text-xs">POST</span>
                      <span className="text-muted-foreground">/api/search</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-chart-3 text-white px-2 py-1 rounded text-xs">POST</span>
                      <span className="text-muted-foreground">/api/bundle/validate</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Stethoscope className="text-primary text-xl" />
                <h3 className="text-lg font-semibold">NAMASTE × ICD‑11</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Bridging traditional and modern medicine through intelligent terminology mapping.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Documentation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FHIR Guide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integration</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Standards</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">NAMASTE Codes</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">WHO ICD-11</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FHIR R4</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">India EHR</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Issues</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 NAMASTE × ICD-11 FHIR Service. Built for India's Digital Health Mission.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
