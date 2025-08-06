import { format } from 'date-fns';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'svg';
  resolution: number; // DPI
  orientation: 'portrait' | 'landscape';
  includeMetadata: boolean;
  includeWatermark: boolean;
  customTitle?: string;
}

export interface ChartExportData {
  title: string;
  dateRange: string;
  silos: number[];
  dataPoints: any[];
  chartType: 'line' | 'bar' | 'area' | 'composed';
  metadata: {
    generatedAt: string;
    totalDataPoints: number;
    timeRange: string;
    alertCount?: number;
  };
}

class AdvancedExportService {
  private static instance: AdvancedExportService;

  public static getInstance(): AdvancedExportService {
    if (!AdvancedExportService.instance) {
      AdvancedExportService.instance = new AdvancedExportService();
    }
    return AdvancedExportService.instance;
  }

  /**
   * Export chart to high-resolution PDF with vector graphics
   */
  async exportToPDF(
    chartElement: HTMLElement,
    data: ChartExportData,
    options: ExportOptions = {
      format: 'pdf',
      resolution: 300,
      orientation: 'landscape',
      includeMetadata: true,
      includeWatermark: true
    }
  ): Promise<void> {
    try {
      // Create a high-resolution canvas
      const canvas = await this.createHighResolutionCanvas(chartElement, options.resolution);
      
      // Generate PDF with metadata
      const pdfContent = this.generatePDFContent(canvas, data, options);
      
      // Download the PDF
      this.downloadFile(pdfContent, `temperature-analytics-${Date.now()}.pdf`, 'application/pdf');
      
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export PDF. Please try again.');
    }
  }

  /**
   * Export chart to high-resolution PNG
   */
  async exportToPNG(
    chartElement: HTMLElement,
    data: ChartExportData,
    options: ExportOptions
  ): Promise<void> {
    try {
      const canvas = await this.createHighResolutionCanvas(chartElement, options.resolution);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          this.downloadBlob(blob, `temperature-chart-${Date.now()}.png`);
        }
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('PNG export failed:', error);
      throw new Error('Failed to export PNG. Please try again.');
    }
  }

  /**
   * Export chart to SVG vector format
   */
  async exportToSVG(
    chartElement: HTMLElement,
    data: ChartExportData,
    options: ExportOptions
  ): Promise<void> {
    try {
      const svgContent = await this.generateSVGContent(chartElement, data, options);
      this.downloadFile(svgContent, `temperature-chart-${Date.now()}.svg`, 'image/svg+xml');
    } catch (error) {
      console.error('SVG export failed:', error);
      throw new Error('Failed to export SVG. Please try again.');
    }
  }

  /**
   * Batch export multiple charts
   */
  async batchExport(
    charts: Array<{
      element: HTMLElement;
      data: ChartExportData;
      filename: string;
    }>,
    options: ExportOptions
  ): Promise<void> {
    try {
      const exportPromises = charts.map(async (chart, index) => {
        const delay = index * 500; // Stagger exports to prevent browser overload
        await new Promise(resolve => setTimeout(resolve, delay));
        
        switch (options.format) {
          case 'pdf':
            return this.exportToPDF(chart.element, chart.data, options);
          case 'png':
            return this.exportToPNG(chart.element, chart.data, options);
          case 'svg':
            return this.exportToSVG(chart.element, chart.data, options);
          default:
            throw new Error(`Unsupported format: ${options.format}`);
        }
      });

      await Promise.all(exportPromises);
    } catch (error) {
      console.error('Batch export failed:', error);
      throw new Error('Failed to complete batch export. Some files may not have been exported.');
    }
  }

  /**
   * Create high-resolution canvas from DOM element
   */
  private async createHighResolutionCanvas(
    element: HTMLElement,
    dpi: number = 300
  ): Promise<HTMLCanvasElement> {
    // Use html2canvas for DOM to canvas conversion
    const { default: html2canvas } = await import('html2canvas');
    
    const scale = dpi / 96; // 96 DPI is standard screen resolution
    
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
      onclone: (clonedDoc) => {
        // Ensure all styles are properly applied to the cloned document
        const clonedElement = clonedDoc.querySelector('[data-chart-export]');
        if (clonedElement) {
          (clonedElement as HTMLElement).style.transform = 'none';
        }
      }
    });

    return canvas;
  }

  /**
   * Generate PDF content with metadata
   */
  private generatePDFContent(
    canvas: HTMLCanvasElement,
    data: ChartExportData,
    options: ExportOptions
  ): string {
    // This is a simplified implementation
    // In a real application, you would use a library like jsPDF
    const imageData = canvas.toDataURL('image/png', 1.0);
    
    const pdfTemplate = `
      %PDF-1.4
      1 0 obj
      <<
      /Type /Catalog
      /Pages 2 0 R
      /Metadata 3 0 R
      >>
      endobj
      
      2 0 obj
      <<
      /Type /Pages
      /Kids [4 0 R]
      /Count 1
      >>
      endobj
      
      3 0 obj
      <<
      /Type /Metadata
      /Subtype /XML
      /Length ${JSON.stringify(data.metadata).length}
      >>
      stream
      ${JSON.stringify(data.metadata, null, 2)}
      endstream
      endobj
      
      4 0 obj
      <<
      /Type /Page
      /Parent 2 0 R
      /MediaBox [0 0 ${options.orientation === 'landscape' ? '842 595' : '595 842'}]
      /Contents 5 0 R
      /Resources <<
        /XObject << /Im1 6 0 R >>
      >>
      >>
      endobj
      
      5 0 obj
      <<
      /Length 44
      >>
      stream
      q
      ${options.orientation === 'landscape' ? '842 0 0 595' : '595 0 0 842'} 0 0 cm
      /Im1 Do
      Q
      endstream
      endobj
      
      6 0 obj
      <<
      /Type /XObject
      /Subtype /Image
      /Width ${canvas.width}
      /Height ${canvas.height}
      /ColorSpace /DeviceRGB
      /BitsPerComponent 8
      /Filter /DCTDecode
      /Length ${imageData.length}
      >>
      stream
      ${imageData}
      endstream
      endobj
      
      xref
      0 7
      0000000000 65535 f 
      0000000009 00000 n 
      0000000074 00000 n 
      0000000120 00000 n 
      0000000179 00000 n 
      0000000364 00000 n 
      0000000466 00000 n 
      trailer
      <<
      /Size 7
      /Root 1 0 R
      >>
      startxref
      ${imageData.length + 700}
      %%EOF
    `;

    return pdfTemplate;
  }

  /**
   * Generate SVG content
   */
  private async generateSVGContent(
    element: HTMLElement,
    data: ChartExportData,
    options: ExportOptions
  ): Promise<string> {
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Get computed styles
    const styles = window.getComputedStyle(element);
    
    // Create SVG wrapper
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="${element.offsetWidth}" 
           height="${element.offsetHeight}"
           viewBox="0 0 ${element.offsetWidth} ${element.offsetHeight}">
        <defs>
          <style type="text/css">
            <![CDATA[
              ${this.extractRelevantStyles(element)}
            ]]>
          </style>
        </defs>
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${clonedElement.outerHTML}
          </div>
        </foreignObject>
        ${options.includeMetadata ? this.generateSVGMetadata(data) : ''}
      </svg>
    `;

    return svgContent;
  }

  /**
   * Extract relevant CSS styles for SVG export
   */
  private extractRelevantStyles(element: HTMLElement): string {
    const styleSheets = Array.from(document.styleSheets);
    let relevantStyles = '';

    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            // Check if rule applies to our element or its children
            if (element.querySelector(rule.selectorText) || element.matches(rule.selectorText)) {
              relevantStyles += rule.cssText + '\n';
            }
          }
        });
      } catch (e) {
        // Handle CORS issues with external stylesheets
        console.warn('Could not access stylesheet:', e);
      }
    });

    return relevantStyles;
  }

  /**
   * Generate SVG metadata
   */
  private generateSVGMetadata(data: ChartExportData): string {
    return `
      <metadata>
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                 xmlns:dc="http://purl.org/dc/elements/1.1/">
          <rdf:Description rdf:about="">
            <dc:title>${data.title}</dc:title>
            <dc:creator>Replica View Studio</dc:creator>
            <dc:date>${data.metadata.generatedAt}</dc:date>
            <dc:description>Temperature analytics chart - ${data.dateRange}</dc:description>
            <dc:subject>Temperature Monitoring, Silo Analytics</dc:subject>
          </rdf:Description>
        </rdf:RDF>
      </metadata>
    `;
  }

  /**
   * Download file with specified content
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  /**
   * Download blob as file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Progressive data loading for large datasets
   */
  async loadDataProgressively(
    dataSource: () => Promise<any[]>,
    chunkSize: number = 1000,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<any[]> {
    try {
      const allData = await dataSource();
      const totalChunks = Math.ceil(allData.length / chunkSize);
      const result: any[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, allData.length);
        const chunk = allData.slice(start, end);
        
        result.push(...chunk);
        
        if (onProgress) {
          onProgress(result.length, allData.length);
        }

        // Allow UI to update between chunks
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      return result;
    } catch (error) {
      console.error('Progressive data loading failed:', error);
      throw new Error('Failed to load data progressively');
    }
  }

  /**
   * Memory optimization for large datasets
   */
  optimizeDataForRendering(
    data: any[],
    maxPoints: number = 1000,
    strategy: 'downsample' | 'aggregate' | 'window' = 'downsample'
  ): any[] {
    if (data.length <= maxPoints) {
      return data;
    }

    switch (strategy) {
      case 'downsample':
        return this.downsampleData(data, maxPoints);
      case 'aggregate':
        return this.aggregateData(data, maxPoints);
      case 'window':
        return this.windowData(data, maxPoints);
      default:
        return this.downsampleData(data, maxPoints);
    }
  }

  /**
   * Downsample data by taking every nth point
   */
  private downsampleData(data: any[], targetPoints: number): any[] {
    const step = Math.ceil(data.length / targetPoints);
    const result: any[] = [];

    for (let i = 0; i < data.length; i += step) {
      result.push(data[i]);
    }

    return result;
  }

  /**
   * Aggregate data by averaging values in chunks
   */
  private aggregateData(data: any[], targetPoints: number): any[] {
    const chunkSize = Math.ceil(data.length / targetPoints);
    const result: any[] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const aggregated = this.aggregateChunk(chunk);
      result.push(aggregated);
    }

    return result;
  }

  /**
   * Aggregate a chunk of data points
   */
  private aggregateChunk(chunk: any[]): any {
    if (chunk.length === 0) return null;
    if (chunk.length === 1) return chunk[0];

    const result: any = { ...chunk[0] };
    const numericKeys = Object.keys(result).filter(key => 
      typeof result[key] === 'number' && key !== 'timestamp'
    );

    numericKeys.forEach(key => {
      const values = chunk.map(item => item[key]).filter(val => typeof val === 'number');
      result[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Use the middle timestamp for the aggregated point
    const middleIndex = Math.floor(chunk.length / 2);
    result.time = chunk[middleIndex].time;
    result.timestamp = chunk[middleIndex].timestamp;

    return result;
  }

  /**
   * Window data by taking sliding window averages
   */
  private windowData(data: any[], targetPoints: number): any[] {
    const windowSize = Math.ceil(data.length / targetPoints);
    const result: any[] = [];

    for (let i = 0; i < data.length; i += Math.floor(windowSize / 2)) {
      const windowStart = Math.max(0, i - Math.floor(windowSize / 2));
      const windowEnd = Math.min(data.length, windowStart + windowSize);
      const window = data.slice(windowStart, windowEnd);
      
      if (window.length > 0) {
        const aggregated = this.aggregateChunk(window);
        result.push(aggregated);
      }

      if (result.length >= targetPoints) break;
    }

    return result;
  }
}

export default AdvancedExportService;
