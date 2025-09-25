
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Target, 
  ListChecks, 
  GitCompare,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUploadZone from '@/components/ui/file-upload';
import KPIPanel from '@/components/analysis-panels/kpi-panel';
import TrendsPanel from '@/components/analysis-panels/trends-panel';
import SummaryPanel from '@/components/analysis-panels/summary-panel';
import ActionItemsPanel from '@/components/analysis-panels/action-items-panel';
import ComparePanel from '@/components/analysis-panels/compare-panel';
import ChatInterface from '@/components/chat-interface';
import DashboardSidebar from '@/components/dashboard-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { AnalysisResult, ChatMessage, FileUpload } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DashboardClient: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentFile, setCurrentFile] = useState<FileUpload | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | undefined>(undefined);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch uploaded files on component mount
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const response = await fetch('/api/files');
        if (response.ok) {
          const files = await response.json();
          setUploadedFiles(files);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    
    fetchUploadedFiles();
  }, []);

  // Auto-advance to next step after successful operations
  const autoAdvanceTab = useCallback((currentTab: string) => {
    const tabOrder = ['upload', 'summarize', 'trends', 'insights', 'kpis', 'actions', 'compare'];
    const currentIndex = tabOrder.indexOf(currentTab);
    if (currentIndex < tabOrder.length - 1) {
      setTimeout(() => {
        setActiveTab(tabOrder[currentIndex + 1]);
      }, 2000);
    }
  }, []);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const uploadedFile = await response.json();
      setCurrentFile(uploadedFile);
      setUploadedFiles(prev => [uploadedFile, ...prev]);
      
      toast.success('File uploaded successfully!');
      
      // Start monitoring file processing
      monitorFileProcessing(uploadedFile.fileId || uploadedFile.id);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  }, []);

  const monitorFileProcessing = useCallback(async (fileId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/files/${fileId}/status`);
        const status = await response.json();
        
        if (status.status === 'COMPLETED') {
          toast.success('File processing completed!');
          autoAdvanceTab('upload');
          return true;
        } else if (status.status === 'FAILED') {
          toast.error('File processing failed');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Status check error:', error);
        return true;
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      const completed = await checkStatus();
      if (completed) {
        clearInterval(interval);
      }
    }, 2000);

    // Initial check
    await checkStatus();
  }, [autoAdvanceTab]);

  const handleAnalyze = useCallback(async (analysisType: string) => {
    if (!currentFile) {
      toast.error('Please upload a file first');
      return;
    }

    setAnalysisLoading(true);

    try {
      const response = await fetch(`/api/files/${currentFile.fileId || currentFile.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysis = await response.json();
      
      toast.success('Analysis started!');
      
      // Monitor analysis progress
      monitorAnalysis(analysis.analysisId);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to start analysis');
    } finally {
      setAnalysisLoading(false);
    }
  }, [currentFile]);

  const monitorAnalysis = useCallback(async (analysisId: string) => {
    const checkAnalysis = async () => {
      try {
        const response = await fetch(`/api/analysis/${analysisId}`);
        const analysis = await response.json();
        
        if (analysis.status === 'COMPLETED') {
          setCurrentAnalysis(analysis);
          toast.success('Analysis completed!');
          return true;
        } else if (analysis.status === 'FAILED') {
          toast.error('Analysis failed');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Analysis check error:', error);
        return true;
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(async () => {
      const completed = await checkAnalysis();
      if (completed) {
        clearInterval(interval);
      }
    }, 3000);

    // Initial check
    await checkAnalysis();
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      content: message,
      role: 'USER',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);

    try {
      console.log('🔄 Sending message:', message);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          reportId: currentFile?.fileId || currentFile?.id,
          sessionId: null
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Chat request failed`);
      }

      const aiResponse = await response.json();
      console.log('✅ AI Response received:', aiResponse);
      
      const assistantMessage: ChatMessage = {
        id: aiResponse.messageId || `msg_${Date.now()}_assistant`,
        content: aiResponse.response,
        role: 'ASSISTANT',
        timestamp: new Date(),
        metadata: {
          suggestions: aiResponse.suggestions,
          charts: aiResponse.charts
        }
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('💥 Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(`Chat Error: ${errorMessage}`);
      
      // Remove user message if sending failed
      setChatMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setChatLoading(false);
    }
  }, [currentFile]);

  const handleNewAnalysis = useCallback(() => {
    setActiveTab('upload');
    setCurrentFile(null);
    setCurrentAnalysis(undefined);
    setChatMessages([]);
  }, []);

  const handleSelectFile = useCallback((file: FileUpload) => {
    setCurrentFile(file);
    setCurrentAnalysis(undefined);
    setChatMessages([]);
    setActiveTab('summarize'); // Auto navigate to first analysis tab
  }, []);

  // Auto-analyze when switching to analysis tabs
  useEffect(() => {
    if (!currentFile || currentAnalysis) return;
    
    const analysisTypes: Record<string, string> = {
      'summarize': 'SUMMARY',
      'trends': 'TREND_ANALYSIS',
      'insights': 'FULL_ANALYSIS',
      'kpis': 'KPI_EXTRACTION',
      'actions': 'FULL_ANALYSIS'
    };

    if (analysisTypes[activeTab] && currentFile) {
      handleAnalyze(analysisTypes[activeTab]);
    }
  }, [activeTab, currentFile, currentAnalysis, handleAnalyze]);

  const renderMainContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                I'm your intelligent reporting assistant! Upload Excel files, CSV, PDF, VR reports, or any business documents, and I'll provide comprehensive analysis, extract key insights, and suggest actionable next steps. Perfect for business intelligence and strategic decision-making. 🤖
              </h1>
              <p className="text-gray-600">
                Get started by uploading your data files for comprehensive analysis
              </p>
            </div>
            <FileUploadZone onFileUpload={handleFileUpload} />
            {currentFile && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h3 className="font-medium text-green-900 mb-1">File Ready for Analysis</h3>
                  <p className="text-sm text-green-700">
                    {currentFile.originalName} ({(currentFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'summarize':
        return <SummaryPanel analysis={currentAnalysis} loading={analysisLoading} />;

      case 'trends':
        return (
          <TrendsPanel
            trends={currentAnalysis?.trends}
            visualizations={currentAnalysis?.visualizations}
            loading={analysisLoading}
          />
        );

      case 'insights':
        return <SummaryPanel analysis={currentAnalysis} loading={analysisLoading} />;

      case 'kpis':
        return <KPIPanel kpis={currentAnalysis?.kpis} loading={analysisLoading} />;

      case 'actions':
        return <ActionItemsPanel actionItems={currentAnalysis?.actionItems} loading={analysisLoading} />;

      case 'compare':
        return <ComparePanel currentFile={currentFile} loading={analysisLoading} />;

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-600">Select an analysis type from the sidebar</h2>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewAnalysis={handleNewAnalysis}
        uploadedFiles={uploadedFiles}
        currentFile={currentFile}
        onSelectFile={handleSelectFile}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and User Info */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">Reporting Agent</h1>
              <span className="text-sm text-gray-500">GPT-4o</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                S
              </div>
              <span className="text-sm text-gray-700">Super Admin</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto bg-white">
            <div className="p-6">
              {renderMainContent()}
            </div>
          </main>

          {/* Chat Interface */}
          <div className="border-t bg-white">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              loading={chatLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
