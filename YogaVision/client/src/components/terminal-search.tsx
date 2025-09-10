import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Plus, ArrowRight, Sparkles } from "lucide-react";

interface SearchResult {
  code: string;
  display: string;
  definition?: string;
  system: string;
  category?: string;
  module?: string;
  type: 'namaste' | 'icd11';
}

interface MappingSuggestion {
  targetCode: string;
  targetDisplay: string;
  confidence: number;
  explanation: string;
}

export function TerminalSearch() {
  const [query, setQuery] = useState("");
  const [includeIcd, setIncludeIcd] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["/api/search", query, includeIcd],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        include_icd: includeIcd.toString(),
        limit: '10'
      });
      const response = await apiRequest("GET", `/api/search?${params}`);
      return response.json();
    },
    enabled: query.length >= 2,
    staleTime: 5000,
  });

  // Mapping suggestion mutation
  const mappingSuggestionMutation = useMutation({
    mutationFn: async (code: SearchResult) => {
      const response = await apiRequest(
        "POST", 
        "/api/mapping/suggest", 
        {
          code: code.code,
          display: code.display,
          definition: code.definition,
          system: code.system
        }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "AI Mapping Generated",
        description: "Intelligent code mappings have been suggested using Gemini AI.",
      });
    },
    onError: (error) => {
      toast({
        title: "Mapping Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add to problem list mutation
  const addToProblemMutation = useMutation({
    mutationFn: async (data: { namasteCode: string; namasteDisplay: string; icd11Code?: string; icd11Display?: string }) => {
      const response = await apiRequest("POST", "/api/problems", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/problems"] });
      toast({
        title: "Added to Problem List",
        description: "The coded diagnosis has been added to your problem list.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateMapping = async (result: SearchResult) => {
    if (result.type === 'namaste') {
      mappingSuggestionMutation.mutate(result);
    }
  };

  const handleAddToProblemList = (result: SearchResult) => {
    const data = {
      namasteCode: result.type === 'namaste' ? result.code : '',
      namasteDisplay: result.type === 'namaste' ? result.display : '',
      icd11Code: result.type === 'icd11' ? result.code : undefined,
      icd11Display: result.type === 'icd11' ? result.display : undefined,
    };

    if (!data.namasteCode && !data.icd11Code) {
      toast({
        title: "Invalid Selection",
        description: "Please select a valid NAMASTE or ICD-11 code.",
        variant: "destructive",
      });
      return;
    }

    addToProblemMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search NAMASTE or ICD-11 terms..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-icd"
              checked={includeIcd}
              onCheckedChange={setIncludeIcd}
              data-testid="checkbox-include-icd"
            />
            <label htmlFor="include-icd" className="text-sm font-medium">
              Include ICD-11 suggestions
            </label>
          </div>
        </div>

        {query.length > 0 && query.length < 2 && (
          <p className="text-sm text-muted-foreground">
            Type at least 2 characters to search...
          </p>
        )}
      </div>

      <div className="space-y-4" data-testid="search-results">
        {isSearching && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchResults?.results?.length === 0 && !isSearching && query.length >= 2 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try searching with different terms or check your spelling.
              </p>
            </CardContent>
          </Card>
        )}

        {searchResults?.results?.map((result: SearchResult, index: number) => (
          <Card key={`${result.code}-${index}`} data-testid={`result-${result.code}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{result.display}</h3>
                      <Badge variant={result.type === 'namaste' ? 'default' : 'secondary'}>
                        {result.type === 'namaste' ? 'NAMASTE' : 'ICD-11'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{result.code}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{result.system}</span>
                      {result.category && (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          <span>{result.category}</span>
                        </>
                      )}
                      {result.module && (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          <span>{result.module}</span>
                        </>
                      )}
                    </div>
                    {result.definition && (
                      <p className="text-sm text-muted-foreground">{result.definition}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {result.type === 'namaste' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateMapping(result)}
                        disabled={mappingSuggestionMutation.isPending}
                        data-testid={`button-generate-mapping-${result.code}`}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Map
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleAddToProblemList(result)}
                      disabled={addToProblemMutation.isPending}
                      data-testid={`button-add-problem-${result.code}`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* AI Mapping Suggestions (shown after generation) */}
                {mappingSuggestionMutation.data?.sourceCode === result.code && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h4 className="font-medium text-sm">AI-Generated ICD-11 Mappings:</h4>
                    </div>
                    <div className="space-y-2">
                      {mappingSuggestionMutation.data.mappings?.map((mapping: MappingSuggestion, idx: number) => (
                        <div key={idx} className="bg-muted rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{mapping.targetDisplay}</p>
                              <p className="text-xs text-muted-foreground">
                                {mapping.targetCode} • Confidence: {mapping.confidence}%
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {mapping.explanation}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddToProblemList({
                                ...result,
                                code: mapping.targetCode,
                                display: mapping.targetDisplay,
                                type: 'icd11'
                              })}
                              data-testid={`button-map-${mapping.targetCode}`}
                            >
                              Map
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
