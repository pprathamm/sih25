import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { History, Search, GitBranch, Upload, CheckCircle } from "lucide-react";
import type { AuditEvent } from "@shared/schema";

export default function AuditTrail() {
  const { data: auditEvents, isLoading } = useQuery({
    queryKey: ['/api/audit'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/audit?limit=50');
      return await response.json();
    }
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'search':
        return <Search className="h-4 w-4 text-primary" />;
      case 'map':
        return <GitBranch className="h-4 w-4 text-chart-1" />;
      case 'upload':
        return <Upload className="h-4 w-4 text-chart-3" />;
      case 'validate':
        return <CheckCircle className="h-4 w-4 text-chart-2" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'search':
        return 'bg-primary/10 text-primary';
      case 'map':
        return 'bg-chart-1/10 text-chart-1';
      case 'upload':
        return 'bg-chart-3/10 text-chart-3';
      case 'validate':
        return 'bg-chart-2/10 text-chart-2';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'search':
        return 'Search';
      case 'map':
        return 'Map';
      case 'upload':
        return 'Upload';
      case 'validate':
        return 'Validate';
      default:
        return 'Unknown';
    }
  };

  const formatEventDescription = (event: AuditEvent) => {
    const details = event.details as any;
    
    switch (event.eventType) {
      case 'search':
        return `User searched for "${details?.query}" → Terminology search performed`;
      case 'map':
        return `Mapped ${details?.sourceSystem}:${details?.sourceCode} → ${details?.targetSystem}:${details?.targetCode}`;
      case 'upload':
        return `Processed ${details?.recordCount || 'unknown'} terminology codes from CSV`;
      case 'validate':
        return `Validated FHIR ${details?.resourceType} with ${details?.entryCount || 0} entries`;
      default:
        return 'Audit event recorded';
    }
  };

  const formatTimeAgo = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditEvents && auditEvents.length > 0 ? (
            auditEvents.map((event: AuditEvent, index: number) => (
              <div key={event.id} className="p-4 bg-background rounded-lg border border-border" data-testid={`audit-event-${index}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getEventIcon(event.eventType)}
                    <span className="font-medium capitalize">
                      {event.eventType.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge className={`code-badge text-xs ${getEventColor(event.eventType)}`}>
                      {getEventLabel(event.eventType)}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {event.timestamp ? formatTimeAgo(event.timestamp) : 'Unknown time'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatEventDescription(event)}
                </p>
                {event.userId && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    User: {event.userId}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No audit events yet</h3>
              <p className="text-sm">Audit events will appear here as you use the terminology service.</p>
            </div>
          )}
          
          {auditEvents && auditEvents.length > 0 && (
            <div className="text-center py-4 text-muted-foreground border-t border-border">
              <p className="text-sm">Showing recent audit events. All operations are logged for compliance.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
