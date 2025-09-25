
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Database, FileSpreadsheet, File, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadProgress } from '@/lib/types';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
}

const FileUploadZone: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedTypes = ['.xlsx', '.xls', '.csv', '.pdf', '.json'],
  maxSize = 100 * 1024 * 1024, // 100MB
  multiple = true
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Initialize progress for each file
    const newProgress = acceptedFiles.map(file => ({
      fileId: `${Date.now()}_${file.name}`,
      filename: file.name,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadProgress(prev => [...prev, ...newProgress]);
    onFileUpload(acceptedFiles);

    // Simulate upload progress
    newProgress.forEach(progressItem => {
      simulateProgress(progressItem.fileId);
    });
  }, [onFileUpload]);

  const simulateProgress = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(prev =>
          prev.map(item =>
            item.fileId === fileId
              ? { ...item, progress: 100, status: 'completed' }
              : item
          )
        );
      } else {
        setUploadProgress(prev =>
          prev.map(item =>
            item.fileId === fileId
              ? { ...item, progress: Math.min(progress, 100) }
              : item
          )
        );
      }
    }, 300);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json']
    },
    maxSize,
    multiple
  });

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
      case 'csv':
        return <Database className="w-8 h-8 text-blue-600" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-600" />;
      case 'json':
        return <File className="w-8 h-8 text-yellow-600" />;
      default:
        return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'uploading':
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const removeFile = (fileId: string) => {
    setUploadProgress(prev => prev.filter(item => item.fileId !== fileId));
  };

  return (
    <div className="w-full space-y-6">
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-colors ${
              isDragActive ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`w-16 h-16 mx-auto mb-4 ${
              isDragActive ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your reports here for analysis' : 'Drop your reports here for analysis'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Supports Excel, CSV, PDF, VR reports and more
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: {maxSize / (1024 * 1024)}MB per file
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={(e) => {
                e.stopPropagation();
                (document.querySelector('input[type="file"]') as HTMLInputElement)?.click();
              }}
            >
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {uploadProgress.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4">Upload Progress</h4>
            <div className="space-y-4">
              {uploadProgress.map((progress) => (
                <div key={progress.fileId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getFileIcon(progress.filename)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {progress.filename}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(progress.status)}
                        <span className="text-xs text-gray-500">
                          {progress.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full">
                      <Progress value={progress.progress} className="h-2" />
                    </div>
                    {progress.message && (
                      <p className="text-xs text-gray-500 mt-1">{progress.message}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(progress.fileId)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadZone;
