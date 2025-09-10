import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Activity, Search, Filter, Download, Clock, User, Code } from "lucide-react";

interface AuditEntry {
  id: string;
  operation: string;
  userId?: string;
  sessionId?: string;
  data?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState("");
  const [limit, setLimit] = useState(50);
  const { toast } = useToast();

  // Fetch audit entries
  const { data: auditEntries = [], isLoading, error } = useQuery<AuditEntry[]>({
    queryKey: ["/api/audit", limit],
    retry: false,
  });

  // Handle unauthorized errors
  if (error && isUnauthorizedError(error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  // Filter entries based on search and operation filter
  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(entry.data || {}).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperation = !operationFilter || operationFilter === 'all' || entry.operation === operationFilter;
    
    return matchesSearch && matchesOperation;
  });

  // Get unique operations for filter dropdown
  const uniqueOperations = Array.from(new Set(auditEntries.map(entry => entry.operation))).sort();

  const exportAuditLog = () => {
    const csvHeader = "Timestamp,Operation,User ID,IP Address,Data\n";
    const csvContent = filteredEntries.map(entry => {
      return [
        entry.timestamp,
        entry.operation,
        entry.userId || '',
        entry.ipAddress || '',
        JSON.stringify(entry.data || {}).replace(/"/g, '""')
      ].join(',');
    }).join('\n');
    
    const csv = csvHeader + csvContent;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Audit Log Exported",
      description: "Audit trail has been exported as CSV file.",
    });
  };

  const getOperationIcon = (operation: string) => {
    if (operation.includes('search')) return <Search className="w-4 h-4" />;
    if (operation.includes('auth')) return <User className="w-4 h-4" />;
    if (operation.includes('fhir') || operation.includes('api')) return <Code className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getOperationColor = (operation: string) => {
    if (operation.includes('error') || operation.includes('fail')) return 'destructive';
    if (operation.includes('auth')) return 'secondary';
    if (operation.includes('create') || operation.includes('ingest')) return 'default';
    return 'outline';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="heading-audit-trail">Audit Trail</h2>
          <p className="text-muted-foreground">
            Real-time logging of all terminology operations for compliance and monitoring.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportAuditLog}
          disabled={filteredEntries.length === 0}
          data-testid="button-export-audit"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search operations, users, or data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-audit-search"
                />
              </div>
            </div>
            
            <Select value={operationFilter} onValueChange={setOperationFilter}>
              <SelectTrigger className="w-48" data-testid="select-operation-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operations</SelectItem>
                {uniqueOperations.map(operation => (
                  <SelectItem key={operation} value={operation}>
                    {operation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-32" data-testid="select-limit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">Last 25</SelectItem>
                <SelectItem value="50">Last 50</SelectItem>
                <SelectItem value="100">Last 100</SelectItem>
                <SelectItem value="200">Last 200</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredEntries.length} of {auditEntries.length} audit entries
        </span>
        <span>
          {filteredEntries.length > 0 && `Latest: ${formatTimestamp(filteredEntries[0]?.timestamp)}`}
        </span>
      </div>

      {/* Audit Entries */}
      <div className="space-y-3" data-testid="audit-entries">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || operationFilter ? 'No Matching Entries' : 'No Audit Entries'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || operationFilter 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Audit entries will appear here as you use the system.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          // Audit entries list
          filteredEntries.map((entry) => (
            <Card key={entry.id} data-testid={`audit-entry-${entry.id}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-muted rounded-md">
                        {getOperationIcon(entry.operation)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getOperationColor(entry.operation)} className="text-xs">
                            {entry.operation}
                          </Badge>
                          {entry.userId && (
                            <Badge variant="outline" className="text-xs">
                              <User className="w-3 h-3 mr-1" />
                              {entry.userId.slice(0, 8)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(entry.timestamp)}</span>
                          </div>
                          {entry.ipAddress && (
                            <span>IP: {entry.ipAddress}</span>
                          )}
                          {entry.sessionId && (
                            <span>Session: {entry.sessionId.slice(0, 8)}...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {entry.data && (
                    <div className="bg-muted/50 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(entry.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Audit Compliance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">India EHR Standards 2016:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• User authentication tracking</li>
                <li>• Session management logging</li>
                <li>• API access audit trail</li>
                <li>• FHIR operation monitoring</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-3">Tracked Operations:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Terminology search & mapping</li>
                <li>• FHIR Bundle validation</li>
                <li>• CSV data ingestion</li>
                <li>• AI-assisted operations</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-primary mb-2">
              <Activity className="w-4 h-4" />
              <span className="font-semibold text-sm">Real-time Monitoring</span>
            </div>
            <p className="text-sm text-muted-foreground">
              All operations are logged in real-time with comprehensive metadata including user context, 
              IP addresses, session information, and detailed operation parameters for full audit compliance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
