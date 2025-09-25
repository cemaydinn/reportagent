

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GitCompare, TrendingUp, BarChart3, Users, Calendar } from 'lucide-react';
import { FileUpload } from '@/lib/types';
import { toast } from 'sonner';

interface ComparePanelProps {
  currentFile?: FileUpload | null;
  loading?: boolean;
}

const ComparePanel: React.FC<ComparePanelProps> = ({ 
  currentFile, 
  loading = false 
}) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [compareData, setCompareData] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Fetch available files for comparison
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files');
        if (response.ok) {
          const allFiles = await response.json();
          // Filter out the current file from comparison options
          const availableFiles = allFiles.filter((file: FileUpload) => 
            file.id !== currentFile?.id && file.status === 'COMPLETED'
          );
          setFiles(availableFiles);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    
    if (currentFile) {
      fetchFiles();
    }
  }, [currentFile]);

  const handleCompare = async () => {
    if (!currentFile || !selectedFile) {
      toast.error('Please select a file to compare with');
      return;
    }

    setCompareLoading(true);
    try {
      // Get analysis for current file
      const currentAnalysis = await fetch(`/api/files/${currentFile.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: 'FULL_ANALYSIS' })
      });

      // Get analysis for selected file
      const compareAnalysis = await fetch(`/api/files/${selectedFile}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: 'FULL_ANALYSIS' })
      });

      if (currentAnalysis.ok && compareAnalysis.ok) {
        const current = await currentAnalysis.json();
        const compare = await compareAnalysis.json();

        // Create comparison data
        const currentFile2 = files.find(f => f.id === selectedFile);
        setCompareData({
          current: {
            name: currentFile.originalName,
            rows: currentFile.rowCount,
            columns: currentFile.columnCount,
            size: currentFile.size,
            uploadDate: currentFile.uploadedAt
          },
          compare: {
            name: currentFile2?.originalName,
            rows: currentFile2?.rowCount,
            columns: currentFile2?.columnCount,
            size: currentFile2?.size,
            uploadDate: currentFile2?.uploadedAt
          }
        });
        
        toast.success('Comparison analysis completed!');
      } else {
        throw new Error('Failed to analyze files');
      }
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error('Failed to compare files');
    } finally {
      setCompareLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!currentFile) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <GitCompare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No File Selected</h3>
          <p className="text-gray-500">
            Please upload and select a file to start comparison analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparison Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <span>File Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current File
              </label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900 truncate">
                  {currentFile.originalName}
                </p>
                <p className="text-sm text-blue-700">
                  {currentFile.rowCount?.toLocaleString()} rows, {currentFile.columnCount} columns
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compare With
              </label>
              <Select onValueChange={setSelectedFile} value={selectedFile}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a file to compare with" />
                </SelectTrigger>
                <SelectContent>
                  {files.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      <div className="flex flex-col">
                        <span className="truncate">{file.originalName}</span>
                        <span className="text-xs text-gray-500">
                          {file.rowCount?.toLocaleString()} rows, {file.columnCount} columns
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleCompare} 
            disabled={!selectedFile || compareLoading}
            className="w-full"
          >
            {compareLoading ? 'Comparing...' : 'Start Comparison'}
          </Button>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {compareData && (
        <>
          {/* File Statistics Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span>File Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    {compareData.current.name}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Records:</span>
                      <span className="font-medium">
                        {compareData.current.rows?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Columns:</span>
                      <span className="font-medium">{compareData.current.columns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">File Size:</span>
                      <span className="font-medium">
                        {formatFileSize(compareData.current.size)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Upload Date:</span>
                      <span className="font-medium">
                        {formatDate(compareData.current.uploadDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    {compareData.compare.name}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Records:</span>
                      <span className="font-medium">
                        {compareData.compare.rows?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Columns:</span>
                      <span className="font-medium">{compareData.compare.columns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">File Size:</span>
                      <span className="font-medium">
                        {formatFileSize(compareData.compare.size)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Upload Date:</span>
                      <span className="font-medium">
                        {formatDate(compareData.compare.uploadDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span>Size Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: compareData.current.name.length > 20 
                        ? compareData.current.name.substring(0, 20) + '...'
                        : compareData.current.name,
                      records: compareData.current.rows,
                      columns: compareData.current.columns,
                      size: Math.round(compareData.current.size / (1024 * 1024))
                    },
                    {
                      name: compareData.compare.name.length > 20 
                        ? compareData.compare.name.substring(0, 20) + '...'
                        : compareData.compare.name,
                      records: compareData.compare.rows,
                      columns: compareData.compare.columns,
                      size: Math.round(compareData.compare.size / (1024 * 1024))
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'size') return [value + ' MB', 'File Size'];
                      if (name === 'records') return [value.toLocaleString(), 'Records'];
                      return [value, 'Columns'];
                    }}
                  />
                  <Bar dataKey="records" fill="#60B5FF" name="records" />
                  <Bar dataKey="size" fill="#FF9149" name="size" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Comparison Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Data Volume:</strong> {compareData.current.name} has{' '}
                    {compareData.current.rows > compareData.compare.rows ? 'more' : 'fewer'} records{' '}
                    ({Math.abs(compareData.current.rows - compareData.compare.rows).toLocaleString()} difference)
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Structure:</strong> Files have{' '}
                    {compareData.current.columns === compareData.compare.columns 
                      ? 'the same number of columns' 
                      : `different column counts (${Math.abs(compareData.current.columns - compareData.compare.columns)} difference)`}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>File Size:</strong> {compareData.current.name} is{' '}
                    {compareData.current.size > compareData.compare.size ? 'larger' : 'smaller'} by{' '}
                    {formatFileSize(Math.abs(compareData.current.size - compareData.compare.size))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {files.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Available</h3>
            <p className="text-gray-500">
              Upload more files to enable comparison analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparePanel;

