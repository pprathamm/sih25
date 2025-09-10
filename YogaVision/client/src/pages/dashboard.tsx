import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { TerminalSearch } from "@/components/terminal-search";
import { ApiPlayground } from "@/components/api-playground";
import { CsvIngestion } from "@/components/csv-ingestion";
import { ProblemList } from "@/components/problem-list";
import { BundleValidator } from "@/components/bundle-validator";
import { AuditTrail } from "@/components/audit-trail";
import { ChatWidget } from "@/components/chat-widget";
import { useTheme } from "@/components/theme-provider";
import { 
  Search, 
  Code, 
  Upload, 
  FileText, 
  Package, 
  Activity,
  User,
  LogOut,
  Sun,
  Moon,
  CheckCircle
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("search");

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm" data-testid="logo-text">N×I</span>
                </div>
                <div>
                  <h1 className="font-semibold text-lg" data-testid="app-title">NAMASTE × ICD-11 Dashboard</h1>
                  <p className="text-xs text-muted-foreground">FHIR Terminology Service</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3" data-testid="auth-status">
                <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                <span className="text-sm font-medium">
                  {user?.email || 'Demo User'}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Authentication Status Banner */}
      <div className="bg-chart-2/10 border-b border-chart-2/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-chart-2" />
              <div>
                <span className="font-medium text-chart-2">ABHA OAuth Active</span>
                <p className="text-sm text-muted-foreground">Full API access enabled • Session expires in 1 hour</p>
              </div>
            </div>
            <Badge variant="outline" className="text-chart-2 border-chart-2" data-testid="badge-session-status">
              Authenticated
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="stat-searches">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Search className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-sm text-muted-foreground">Searches Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-mappings">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Code className="w-8 h-8 text-chart-2" />
                  <div>
                    <p className="text-2xl font-bold">398</p>
                    <p className="text-sm text-muted-foreground">Code Mappings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-problems">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-chart-3" />
                  <div>
                    <p className="text-2xl font-bold">56</p>
                    <p className="text-sm text-muted-foreground">Problem Entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-bundles">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-chart-4" />
                  <div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">FHIR Bundles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-border">
                <div className="px-6">
                  <TabsList className="h-14 bg-transparent">
                    <TabsTrigger 
                      value="search" 
                      className="flex items-center space-x-2"
                      data-testid="tab-search"
                    >
                      <Search className="w-4 h-4" />
                      <span>Dual Search</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="api" 
                      className="flex items-center space-x-2"
                      data-testid="tab-api"
                    >
                      <Code className="w-4 h-4" />
                      <span>API Playground</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="csv" 
                      className="flex items-center space-x-2"
                      data-testid="tab-csv"
                    >
                      <Upload className="w-4 h-4" />
                      <span>CSV Ingestion</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="problems" 
                      className="flex items-center space-x-2"
                      data-testid="tab-problems"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Problem List</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="bundle" 
                      className="flex items-center space-x-2"
                      data-testid="tab-bundle"
                    >
                      <Package className="w-4 h-4" />
                      <span>FHIR Bundle</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="audit" 
                      className="flex items-center space-x-2"
                      data-testid="tab-audit"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Audit Trail</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value="search" className="p-6">
                <TerminalSearch />
              </TabsContent>
              
              <TabsContent value="api" className="p-6">
                <ApiPlayground />
              </TabsContent>
              
              <TabsContent value="csv" className="p-6">
                <CsvIngestion />
              </TabsContent>
              
              <TabsContent value="problems" className="p-6">
                <ProblemList />
              </TabsContent>
              
              <TabsContent value="bundle" className="p-6">
                <BundleValidator />
              </TabsContent>
              
              <TabsContent value="audit" className="p-6">
                <AuditTrail />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
