import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Download, Edit, Trash2, List } from "lucide-react";
import type { ProblemListEntry } from "@shared/schema";

export default function ProblemList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: problems, isLoading } = useQuery({
    queryKey: ['/api/problems'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/problems');
      return await response.json();
    }
  });

  const exportToFHIRBundle = () => {
    if (!problems || problems.length === 0) {
      toast({
        title: "No problems to export",
        description: "Add some problems to the list first.",
        variant: "destructive"
      });
      return;
    }

    const bundle = {
      resourceType: "Bundle",
      type: "collection",
      entry: problems.map((problem: ProblemListEntry, index: number) => ({
        resource: {
          resourceType: "Condition",
          id: `condition-${index + 1}`,
          clinicalStatus: {
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: problem.status === "active" ? "active" : "resolved"
            }]
          },
          code: {
            coding: [
              ...(problem.namasteCode ? [{
                system: "http://namaste.gov.in/CodeSystem",
                code: problem.namasteCode,
                display: `NAMASTE Code: ${problem.namasteCode}`
              }] : []),
              ...(problem.icd11Code ? [{
                system: "http://icd.who.int/tm2",
                code: problem.icd11Code,
                display: `ICD-11 TM2 Code: ${problem.icd11Code}`
              }] : [])
            ]
          },
          subject: {
            reference: `Patient/${problem.patientId}`
          },
          recordedDate: problem.createdAt
        }
      }))
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(bundle, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `fhir-problem-list-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "FHIR Bundle exported",
      description: `Problem list exported as ${exportFileDefaultName}`
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Problem List Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Problem List Builder
          </CardTitle>
          <Button data-testid="button-add-problem">
            <Plus className="h-4 w-4 mr-2" />
            Add Problem
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4" data-testid="problems-list">
          {problems && problems.length > 0 ? (
            problems.map((problem: ProblemListEntry, index: number) => (
              <div key={problem.id} className="p-4 bg-background rounded-lg border border-border" data-testid={`problem-item-${index}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold">
                        Problem #{index + 1}
                      </h4>
                      {problem.namasteCode && (
                        <Badge className="code-badge bg-primary/10 text-primary">
                          NAMASTE: {problem.namasteCode}
                        </Badge>
                      )}
                    </div>
                    {problem.icd11Code && (
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm text-muted-foreground">Mapped to:</span>
                        <Badge className="code-badge bg-chart-1/10 text-chart-1">
                          ICD-11 TM2: {problem.icd11Code}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Patient: {problem.patientId}</span>
                      <span>Status: {problem.status}</span>
                      {problem.createdAt && (
                        <span>Added: {new Date(problem.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" data-testid={`button-edit-${index}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" data-testid={`button-delete-${index}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No problems added yet</h3>
              <p className="text-sm">Search for terminology codes and add them to build your problem list.</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-border">
          <Button
            onClick={exportToFHIRBundle}
            disabled={!problems || problems.length === 0}
            className="bg-accent text-accent-foreground hover:bg-accent/80"
            data-testid="button-export-bundle"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as FHIR Bundle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
