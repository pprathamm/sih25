import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Search, FileText, List, Code, History } from "lucide-react";
import TerminologySearch from "@/components/terminology-search.js";
import CSVIngestion from "@/components/csv-ingestion.js";
import ProblemList from "@/components/problem-list.js";
import BundleValidator from "@/components/bundle-validator.js";
import AuditTrail from "@/components/audit-trail.js";

export default function Dashboard() {
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
                <button className="nav-btn text-sm hover:text-primary transition-colors font-semibold text-primary" data-testid="nav-dashboard">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Terminology Dashboard</h1>
          <p className="text-muted-foreground">Search, map, and manage NAMASTE and ICD-11 terminologies</p>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="search" className="flex items-center gap-2" data-testid="tab-search">
              <Search className="h-4 w-4" />
              Dual Search
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2" data-testid="tab-csv">
              <FileText className="h-4 w-4" />
              CSV Ingestion
            </TabsTrigger>
            <TabsTrigger value="problems" className="flex items-center gap-2" data-testid="tab-problems">
              <List className="h-4 w-4" />
              Problem List
            </TabsTrigger>
            <TabsTrigger value="bundle" className="flex items-center gap-2" data-testid="tab-bundle">
              <Code className="h-4 w-4" />
              FHIR Bundle
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2" data-testid="tab-audit">
              <History className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-6">
            <TerminologySearch />
          </TabsContent>

          <TabsContent value="csv" className="mt-6">
            <CSVIngestion />
          </TabsContent>

          <TabsContent value="problems" className="mt-6">
            <ProblemList />
          </TabsContent>

          <TabsContent value="bundle" className="mt-6">
            <BundleValidator />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditTrail />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
