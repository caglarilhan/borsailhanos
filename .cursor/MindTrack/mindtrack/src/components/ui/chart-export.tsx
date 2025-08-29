"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, FileText } from 'lucide-react';

interface ChartExportProps {
  onExportPNG?: () => void;
  onExportPDF?: () => void;
  onShare?: () => void;
  chartTitle?: string;
}

export function ChartExport({ 
  onExportPNG, 
  onExportPDF, 
  onShare, 
  chartTitle = "Chart" 
}: ChartExportProps) {
  const handleExportPNG = () => {
    if (onExportPNG) {
      onExportPNG();
    } else {
      // Default PNG export logic
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${chartTitle}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      // Default PDF export logic
      window.print();
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share logic
      if (navigator.share) {
        navigator.share({
          title: chartTitle,
          text: `Check out this ${chartTitle} from MindTrack`,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600 font-medium">{chartTitle}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportPNG}
          className="h-8 px-2 text-gray-600 hover:text-gray-900"
        >
          <Download className="h-4 w-4 mr-1" />
          PNG
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportPDF}
          className="h-8 px-2 text-gray-600 hover:text-gray-900"
        >
          <FileText className="h-4 w-4 mr-1" />
          PDF
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="h-8 px-2 text-gray-600 hover:text-gray-900"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </div>
    </div>
  );
}
