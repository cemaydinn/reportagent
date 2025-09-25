
export interface FileUpload {
  id: string;
  fileId?: string; // Add this field for compatibility
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  cloudStoragePath?: string; // S3 key for file location
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploadedAt: Date;
  processedAt?: Date;
  metadata?: any;
  rowCount?: number;
  columnCount?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface KPI {
  name: string;
  value: number | string;
  unit?: string;
  change?: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent?: number;
  icon?: string;
}

export interface TrendData {
  period: string;
  value: number;
  date: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar';
  data: any[];
  config?: any;
  title: string;
  description?: string;
}

export interface AnalysisResult {
  id: string;
  type: 'SUMMARY' | 'KPI_EXTRACTION' | 'TREND_ANALYSIS' | 'COMPARISON' | 'FULL_ANALYSIS';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  summary?: {
    executive: string;
    keyFindings: string[];
    statistics: Record<string, any>;
  };
  kpis?: KPI[];
  trends?: TrendData[];
  insights?: string[];
  actionItems?: ActionItem[];
  visualizations?: ChartData[];
  createdAt: Date;
  completedAt?: Date;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  estimatedImpact?: string;
  timeline?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  timestamp: Date;
  metadata?: {
    charts?: ChartData[];
    suggestions?: string[];
    actionItems?: ActionItem[];
  };
}

export interface User {
  id: string;
  name?: string;
  email: string;
  createdAt: Date;
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
}
