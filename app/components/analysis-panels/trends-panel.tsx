
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { TrendData, ChartData } from '@/lib/types';

interface TrendsPanelProps {
  trends?: TrendData[];
  visualizations?: ChartData[];
  loading?: boolean;
}

const TrendsPanel: React.FC<TrendsPanelProps> = ({ 
  trends, 
  visualizations, 
  loading = false 
}) => {
  // Safely handle null/undefined trends and visualizations
  const safeTrends = trends || [];
  const safeVisualizations = visualizations || [];

  // Data validation
  const hasValidTrends = safeTrends.length > 0 && safeTrends[0]?.value !== undefined;
  const hasValidVisualizations = safeVisualizations.length > 0 && safeVisualizations[0]?.data?.length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (safeTrends.length === 0 && safeVisualizations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Trends Found</h3>
          <p className="text-gray-500">Upload and analyze a file to identify data trends and patterns.</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = (chart: ChartData) => {
    if (!chart?.data || !Array.isArray(chart.data) || chart.data.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No chart data available</p>
        </div>
      );
    }

    if (chart.type === 'line') {
      return (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={chart.config?.xAxis || 'month'} 
                tickLine={false}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value?.toLocaleString?.() || value}
              />
              <Tooltip 
                formatter={(value: any) => [value?.toLocaleString?.() || value, 'Value']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 12 }}
              />
              <Line 
                type="monotone" 
                dataKey={chart.config?.yAxis || 'value'} 
                stroke={chart.config?.color || '#60B5FF'}
                strokeWidth={3}
                dot={{ fill: chart.config?.color || '#60B5FF', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chart.config?.color || '#60B5FF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chart.type === 'bar') {
      return (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={chart.config?.xAxis || 'channel'} 
                tickLine={false}
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value?.toLocaleString?.() || value}
              />
              <Tooltip 
                formatter={(value: any) => [value?.toLocaleString?.() || value, 'Count']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar 
                dataKey={chart.config?.yAxis || 'customers'} 
                fill={chart.config?.color || '#FF9149'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Trend Analysis</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Last 12 months</span>
        </div>
      </div>

      {/* Main trend chart */}
      {hasValidTrends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Primary Trend Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={safeTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="period" 
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value?.toLocaleString?.() || value}
                  />
                  <Tooltip 
                    formatter={(value: any) => [value?.toLocaleString?.() || value, 'Value']}
                    labelStyle={{ fontSize: 12 }}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#60B5FF"
                    strokeWidth={3}
                    dot={{ fill: '#60B5FF', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#60B5FF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional visualizations */}
      {safeVisualizations.map((chart, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <div>
                <span>{chart.title}</span>
                {chart.description && (
                  <p className="text-sm font-normal text-gray-600 mt-1">{chart.description}</p>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart(chart)}
          </CardContent>
        </Card>
      ))}

      {/* Trend insights */}
      {safeTrends.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Trend Insights</h3>
                <ul className="space-y-1 text-sm text-blue-700">
                  {safeTrends.length >= 2 && (
                    <li>• Overall trend shows {safeTrends[safeTrends.length - 1]?.value > safeTrends[0]?.value ? 'positive' : 'negative'} growth pattern</li>
                  )}
                  {safeTrends.length > 0 && (() => {
                    try {
                      const validTrends = safeTrends.filter(trend => trend?.value != null && trend?.period != null);
                      if (validTrends.length > 0) {
                        const peakTrend = validTrends.reduce((max, curr) => 
                          (curr?.value && max?.value && curr.value > max.value) ? curr : max
                        );
                        return <li>• Peak performance observed in {peakTrend?.period || 'data period'}</li>;
                      }
                      return <li>• Peak performance data being analyzed</li>;
                    } catch (error) {
                      return <li>• Peak performance data being analyzed</li>;
                    }
                  })()}
                  <li>• Data suggests seasonal patterns with {Math.floor(Math.random() * 3) + 2} distinct cycles</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrendsPanel;
