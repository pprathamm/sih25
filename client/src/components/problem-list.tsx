import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { FileText, Download, Trash2, Plus, Package, ArrowRight } from "lucide-react";

interface ProblemEntry {
  id: string;
  patientId?: string;
  namasteCode?: string;
  namasteDisplay?: string;
  icd11Code?: string;
  icd11Display?: string;
  clinicalStatus: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export function ProblemList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch problem list
  const { data: problems = [], isLoading } = useQuery<ProblemEntry[]>({
    queryKey: ["/api/problems"],
    retry: false,
  });

  // Delete problem mutation
  const deleteProblemMutation = useMutation({
    mutationFn: async (problemId: string) => {
      await apiRequest("DELETE", `/api/problems/${problemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/problems"] });
      toast({
        title: "Problem Removed",
        description: "The problem has been removed from your list.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Export as FHIR Bundle mutation
  const exportBundleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/problems/export/fhir");
      return response.json();
    },
    onSuccess: (bundle) => {
      // Download the FHIR Bundle
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `problem-list-bundle-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "FHIR Bundle Exported",
        description: "Problem list has been exported as a FHIR Bundle.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }

      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteProblem = (problemId: string) => {
    if (confirm("Are you sure you want to remove this problem from your list?")) {
      deleteProblemMutation.mutate(problemId);
    }
  };

  const handleExportBundle = () => {
    if (problems.length === 0) {
      toast({
        title: "No Problems to Export",
        description: "Add some problems to your list first.",
        variant: "destructive",
      });
      return;
    }
    
    exportBundleMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="heading-problem-list">Problem List Builder</h2>
          <p className="text-muted-foreground">
            Manage dual-coded diagnoses for FHIR-compliant problem lists.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => window.location.hash = "#search"}
            data-testid="button-add-problems"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Problems
          </Button>
          <Button
            onClick={handleExportBundle}
            disabled={exportBundleMutation.isPending || problems.length === 0}
            data-testid="button-export-bundle"
          >
            {exportBundleMutation.isPending ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export FHIR Bundle
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Problem List Content */}
      <div className="space-y-4" data-testid="problem-entries">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : problems.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Problems Added Yet</h3>
              <p className="text-muted-foreground mb-4">
                Use the Dual Search tab to find and add coded problems to your list.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.hash = "#search"}
                data-testid="button-goto-search"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Problem
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Problem entries
          <div className="space-y-4">
            {problems.map((problem) => (
              <Card key={problem.id} data-testid={`problem-entry-${problem.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* NAMASTE Code */}
                      {problem.namasteCode && (
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{problem.namasteDisplay}</h3>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <Badge variant="default">NAMASTE</Badge>
                            <span>{problem.namasteCode}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>http://namaste.gov.in/CodeSystem</span>
                          </div>
                        </div>
                      )}

                      {/* ICD-11 Code */}
                      {problem.icd11Code && (
                        <div className="space-y-1">
                          {!problem.namasteCode && (
                            <h3 className="font-semibold text-lg">{problem.icd11Display}</h3>
                          )}
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <Badge variant="secondary">ICD-11</Badge>
                            <span>{problem.icd11Code}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>http://id.who.int/icd/release/11/mms</span>
                          </div>
                          {problem.namasteCode && problem.icd11Display && (
                            <p className="text-sm text-muted-foreground pl-16">
                              Mapped to: {problem.icd11Display}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Dual Coding Badge */}
                      {problem.namasteCode && problem.icd11Code && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-chart-2 border-chart-2">
                            Dual Coded
                          </Badge>
                          <Badge variant="outline" className={
                            problem.clinicalStatus === 'active' 
                              ? 'text-chart-2 border-chart-2' 
                              : 'text-muted-foreground border-muted'
                          }>
                            {problem.clinicalStatus}
                          </Badge>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="text-xs text-muted-foreground">
                        Added: {new Date(problem.createdAt).toLocaleString()}
                        {problem.patientId && ` • Patient: ${problem.patientId}`}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProblem(problem.id)}
                      disabled={deleteProblemMutation.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      data-testid={`button-delete-${problem.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* FHIR Compliance Info */}
      {problems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>FHIR R4 Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Problem List Structure:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Resource Type: Condition</li>
                  <li>• Category: problem-list-item</li>
                  <li>• Clinical Status: active/inactive</li>
                  <li>• Dual Coding Support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Export Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• FHIR Bundle (Collection)</li>
                  <li>• Standard JSON Format</li>
                  <li>• EMR Integration Ready</li>
                  <li>• Audit Trail Included</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <strong>Total Problems:</strong> {problems.length} • 
              <strong> Dual Coded:</strong> {problems.filter(p => p.namasteCode && p.icd11Code).length} • 
              <strong> NAMASTE Only:</strong> {problems.filter(p => p.namasteCode && !p.icd11Code).length} •
              <strong> ICD-11 Only:</strong> {problems.filter(p => !p.namasteCode && p.icd11Code).length}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
