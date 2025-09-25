
'use client';

import React from 'react';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Target, 
  ListChecks, 
  GitCompare,
  Upload,
  Plus,
  Home,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewAnalysis: () => void;
  uploadedFiles: any[];
  currentFile: any;
  onSelectFile: (file: any) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  onNewAnalysis,
  uploadedFiles,
  currentFile,
  onSelectFile
}) => {
  const mainMenuItems = [
    { id: 'upload', label: 'Upload Report', icon: Upload }
  ];

  const analysisItems = [
    { id: 'summarize', label: 'Summarize', icon: FileText },
    { id: 'trends', label: 'Analyse Trends', icon: TrendingUp },
    { id: 'insights', label: 'Key Insights', icon: BarChart3 },
    { id: 'kpis', label: 'Extract KPIs', icon: Target },
    { id: 'actions', label: 'Action Items', icon: ListChecks },
    { id: 'compare', label: 'Compare', icon: GitCompare }
  ];

  return (
    <div className="w-80 bg-gradient-to-b from-blue-50 to-indigo-100 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Reporting Agent</h2>
        </div>
        <Button 
          onClick={onNewAnalysis}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Main Menu Items - Always visible */}
        <div className="mb-6 space-y-2">
          {mainMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left h-auto p-3",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-gray-700 hover:bg-white/50"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Current Analysis Section - Only when file is selected */}
        {currentFile && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-1">New Report Analysis</h3>
              <p className="text-xs text-blue-700 truncate">{currentFile.originalName}</p>
              <p className="text-xs text-blue-600 capitalize">{currentFile.status}</p>
            </div>

            <div className="space-y-2">
              {analysisItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-left h-auto p-3",
                      isActive 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-700 hover:bg-white/50"
                    )}
                    onClick={() => onTabChange(item.id)}
                  >
                    <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h3>
            <div className="space-y-1">
              {uploadedFiles.slice(0, 5).map((file) => (
                <Button
                  key={file.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left h-auto p-2 text-xs",
                    currentFile?.id === file.id
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "text-gray-600 hover:bg-white/50"
                  )}
                  onClick={() => onSelectFile(file)}
                >
                  <FileText className="w-3 h-3 mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{file.originalName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-200 bg-white/30 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-700 hover:bg-white/50"
          onClick={() => window.open('https://docs.reportingagent.com', '_blank')}
        >
          <HelpCircle className="w-4 h-4 mr-3" />
          Help & FAQ
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
