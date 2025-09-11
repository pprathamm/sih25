import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Download, Trash2, FileText } from "lucide-react";

export default function CSVIngestion() {
  const [csvContent, setCsvContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Array<{ code: string; display: string; definition?: string }>>([]);
  const { toast } = useToast();

  const loadSampleData = () => {
    const sampleCSV = `code,display,definition
AYU-DIG-001,Agnimandya,Digestive fire deficiency in Ayurveda
AYU-DIG-002,Ajeerna,Indigestion and dyspepsia
AYU-RES-001,Kasaroga,Respiratory disorders and cough
SID-CIR-001,Hrudayaroga,Cardiac disorders in Siddha medicine
UNA-NEU-001,Falij,Neurological paralysis conditions`;
    
    setCsvContent(sampleCSV);
    parseCSV(sampleCSV);
    
    toast({
      title: "Sample data loaded",
      description: "Sample NAMASTE terminology data has been loaded for preview."
    });
  };

  const parseCSV = (content: string) => {
    try {
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        setPreviewData([]);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          code: values[0] || '',
          display: values[1] || '',
          definition: values[2] || undefined
        };
      }).filter(row => row.code && row.display);

      setPreviewData(data);
    } catch (error) {
      console.error('CSV parsing error:', error);
      setPreviewData([]);
      toast({
        title: "CSV parsing error",
        description: "Please check your CSV format and try again.",
        variant: "destructive"
      });
    }
  };

  const handleCSVChange = (content: string) => {
    setCsvContent(content);
    parseCSV(content);
  };

  const clearData = () => {
    setCsvContent("");
    setPreviewData([]);
    
    toast({
      title: "Data cleared",
      description: "CSV content has been cleared."
    });
  };

  const ingestCSV = async () => {
    if (previewData.length === 0) {
      toast({
        title: "No data to ingest",
        description: "Please load or paste CSV data first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/ingest-csv', {
        data: previewData
      });
      
      const result = await response.json();
      
      toast({
        title: "CSV ingestion successful",
        description: result.message
      });
      
      // Clear data after successful ingestion
      clearData();
    } catch (error) {
      console.error('Ingestion error:', error);
      toast({
        title: "Ingestion failed",
        description: "Failed to ingest CSV data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ingest NAMASTE CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Upload CSV files with columns: code, display, definition. This updates the in-memory NAMASTE CodeSystem.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="csv-input" className="block text-sm font-medium mb-2">
                CSV Content
              </label>
              <Textarea
                id="csv-input"
                placeholder="Paste CSV content here or load sample data..."
                value={csvContent}
                onChange={(e) => handleCSVChange(e.target.value)}
                className="min-h-32 font-mono text-sm"
                data-testid="textarea-csv"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={loadSampleData}
                variant="outline"
                className="flex-1"
                data-testid="button-load-sample"
              >
                <Download className="h-4 w-4 mr-2" />
                Load Sample Data
              </Button>
              <Button
                onClick={clearData}
                variant="outline"
                className="flex-1"
                data-testid="button-clear"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Data
              </Button>
            </div>

            {/* CSV Preview */}
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-base">CSV Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {previewData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-preview">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2">Code</th>
                          <th className="text-left py-2">Display</th>
                          <th className="text-left py-2">Definition</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        {previewData.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-b border-border/50">
                            <td className="py-2 font-mono text-xs">{row.code}</td>
                            <td className="py-2">{row.display}</td>
                            <td className="py-2">{row.definition || 'N/A'}</td>
                          </tr>
                        ))}
                        {previewData.length > 10 && (
                          <tr>
                            <td colSpan={3} className="py-2 text-center text-muted-foreground">
                              ... and {previewData.length - 10} more rows
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Total rows: {previewData.length}
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No data loaded</p>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={ingestCSV}
              disabled={isLoading || previewData.length === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-ingest"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? "Ingesting..." : "Ingest CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
