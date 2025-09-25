
'use client';

import React from 'react';
import { ArrowLeft, User, Bell, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DashboardHeaderProps {
  onBack?: () => void;
  userName?: string;
  onShare?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onBack,
  userName = "Super Anna",
  onShare
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Data Analysis Report',
          text: 'Check out this comprehensive data analysis',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    
    if (onShare) {
      onShare();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between">
        {/* Left side - Back button and title */}
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Reporting Agent</h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">GPT-4o</span>
          </div>
        </div>

        {/* Right side - Actions and user */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-600 text-white text-sm">
                {userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
