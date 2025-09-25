
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Target, DollarSign, Users, Activity, BarChart } from 'lucide-react';
import { KPI } from '@/lib/types';

interface KPIPanelProps {
  kpis?: KPI[];
  loading?: boolean;
}

const KPIPanel: React.FC<KPIPanelProps> = ({ kpis, loading = false }) => {
  // Safely handle null/undefined kpis
  const safeKpis = Array.isArray(kpis) ? kpis : [];
  

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4" />;
      case 'DollarSign':
        return <DollarSign className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'Activity':
        return <Activity className="w-4 h-4" />;
      case 'Target':
        return <Target className="w-4 h-4" />;
      case 'Percent':
        return <BarChart className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600 bg-green-50';
      case 'decreasing':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (safeKpis.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs Found</h3>
          <p className="text-gray-500">Upload and analyze a file to extract key performance indicators.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Key Performance Indicators</h2>
        <span className="text-sm text-gray-500">{safeKpis.length} KPIs identified</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeKpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <div className="text-blue-600">
                        {getIcon(kpi.icon)}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{kpi.name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {typeof kpi.value === 'number' 
                          ? kpi.value.toLocaleString() 
                          : kpi.value}
                      </span>
                      {kpi.unit && (
                        <span className="text-sm text-gray-500">{kpi.unit}</span>
                      )}
                    </div>
                    {kpi.change && (
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(kpi.trend)}`}>
                        {getTrendIcon(kpi.trend)}
                        <span>{kpi.change}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KPIPanel;
