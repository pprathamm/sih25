import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Brain, Plus, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SearchResult } from "@shared/schema";

export default function TerminologySearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [includeSuggestions, setIncludeSuggestions] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const { toast } = useToast();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search'],
    queryFn: async () => {
      if (!searchQuery || !searchTriggered) return { results: [] };
      
      const response = await apiRequest('POST', '/api/search', {
        query: searchQuery,
        systems: selectedSystem === 'all' ? undefined : [selectedSystem],
        includeSuggestions
      });
      
      return await response.json();
    },
    enabled: searchTriggered && !!searchQuery
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/stats');
      return await response.json();
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term to continue.",
        variant: "destructive"
      });
      return;
    }
    setSearchTriggered(true);
  };

  const handleAddToProblems = async (result: SearchResult) => {
    try {
      await apiRequest('POST', '/api/problems', {
        namasteCode: result.system === 'NAMASTE' ? result.code : null,
        icd11Code: result.system.startsWith('ICD-11') ? result.code : null,
        patientId: 'demo-patient'
      });
      
      toast({
        title: "Added to Problem List",
        description: `${result.display} has been added to the problem list.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to problem list.",
        variant: "destructive"
      });
    }
  };

  const handleCreateMapping = async (sourceCode: string, sourceSystem: string, targetCode: string, targetSystem: string) => {
    try {
      await apiRequest('POST', '/api/mappings', {
        sourceCode,
        sourceSystem,
        targetCode,
        targetSystem,
        equivalence: 'equivalent'
      });
      
      toast({
        title: "Mapping Created",
        description: "Terminology mapping has been created successfully."
      });
      
      setSearchTriggered(true); // Refresh results
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create mapping.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Dual Terminology Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search NAMASTE or ICD-11 terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                data-testid="input-search"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} data-testid="button-search">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="suggestions"
                  checked={includeSuggestions}
                  onCheckedChange={(checked) => setIncludeSuggestions(checked === true)}
                  data-testid="checkbox-suggestions"
                />
                <label htmlFor="suggestions" className="text-sm">Include ICD-11 suggestions</label>
              </div>
              <Select value={selectedSystem} onValueChange={setSelectedSystem} data-testid="select-system">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="NAMASTE">NAMASTE Only</SelectItem>
                  <SelectItem value="ICD-11-TM2">ICD-11 TM2 Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : searchResults?.results?.length > 0 ? (
              <div className="space-y-4">
                {searchResults.results.map((result: SearchResult, index: number) => (
                  <div key={index} className="p-4 bg-background rounded-lg border border-border" data-testid={`result-item-${index}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{result.display}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={result.system === 'NAMASTE' ? 'default' : 'secondary'} className="code-badge">
                            {result.system}
                          </Badge>
                          <Badge variant="outline" className="code-badge">
                            {result.code}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToProblems(result)}
                        data-testid={`button-add-${index}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Problem List
                      </Button>
                    </div>
                    {result.definition && (
                      <p className="text-sm text-muted-foreground mb-3">{result.definition}</p>
                    )}
                    
                    {/* Mappings */}
                    {result.mappings && result.mappings.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <h5 className="text-sm font-medium mb-2">ICD-11 TM2 Mapping Suggestions</h5>
                        <div className="space-y-2">
                          {result.mappings.map((mapping, mappingIndex) => (
                            <div key={mappingIndex} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div>
                                <span className="text-sm">{mapping.targetCode}</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary" className="code-badge text-xs">
                                    {mapping.targetSystem}
                                  </Badge>
                                  {mapping.confidence && (
                                    <Badge variant="outline" className="code-badge text-xs">
                                      {mapping.confidence}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleCreateMapping(
                                  result.code,
                                  result.system,
                                  mapping.targetCode,
                                  mapping.targetSystem
                                )}
                                data-testid={`button-map-${index}-${mappingIndex}`}
                              >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                Map
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : searchTriggered ? (
              <p className="text-center py-8 text-muted-foreground">No results found for "{searchQuery}"</p>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Enter a search term to begin</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">NAMASTE Terms</span>
                <span className="font-semibold" data-testid="stat-namaste">
                  {stats?.namasteTerms || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ICD-11 Terms</span>
                <span className="font-semibold" data-testid="stat-icd11">
                  {stats?.icd11Terms || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mapped Pairs</span>
                <span className="font-semibold" data-testid="stat-mapped">
                  {stats?.mappedPairs || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today's Searches</span>
                <span className="font-semibold" data-testid="stat-searches">
                  {stats?.todaySearches || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Mapping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gemini AI suggests optimal ICD-11 mappings based on terminology context and medical relationships.
            </p>
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Suggestion</span>
              </div>
              <p className="text-xs text-muted-foreground">
                AI-powered mapping provides contextual suggestions for better terminology alignment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
