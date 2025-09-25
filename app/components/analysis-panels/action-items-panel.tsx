
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListChecks, Clock, AlertCircle, CheckCircle, Play, Calendar } from 'lucide-react';
import { ActionItem } from '@/lib/types';

interface ActionItemsPanelProps {
  actionItems?: ActionItem[];
  loading?: boolean;
}

const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({ 
  actionItems = [], 
  loading = false 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (actionItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ListChecks className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Action Items</h3>
          <p className="text-gray-500">Upload and analyze a file to generate actionable recommendations.</p>
        </CardContent>
      </Card>
    );
  }

  const prioritizedItems = actionItems.sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Action Items</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{actionItems.length} items</Badge>
          <Badge variant="outline" className="text-red-600 border-red-200">
            {actionItems.filter(item => item.priority === 'HIGH').length} high priority
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {prioritizedItems.map((item, index) => (
          <Card key={item.id || index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 rounded-lg ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getPriorityColor(item.priority)}>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {item.priority}
                    </Badge>
                    
                    <Badge variant="outline">
                      {item.category}
                    </Badge>
                    
                    {item.timeline && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        <Calendar className="w-3 h-3 mr-1" />
                        {item.timeline}
                      </Badge>
                    )}
                  </div>
                  
                  {item.estimatedImpact && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-900">Estimated Impact:</span>
                        <span className="text-sm text-blue-700">{item.estimatedImpact}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    size="sm" 
                    variant={item.status === 'PENDING' ? 'default' : 'outline'}
                    disabled={item.status === 'COMPLETED'}
                  >
                    {item.status === 'COMPLETED' ? 'Completed' : 
                     item.status === 'IN_PROGRESS' ? 'In Progress' : 'Start'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <ListChecks className="w-5 h-5" />
            <span>Action Items Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{actionItems.length}</div>
              <div className="text-sm text-blue-700">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {actionItems.filter(item => item.priority === 'HIGH').length}
              </div>
              <div className="text-sm text-blue-700">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {actionItems.filter(item => item.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-blue-700">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {actionItems.filter(item => item.status === 'PENDING').length}
              </div>
              <div className="text-sm text-blue-700">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionItemsPanel;
