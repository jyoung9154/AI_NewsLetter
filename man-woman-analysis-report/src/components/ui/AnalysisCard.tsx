'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Newsletter } from '@/types';

interface AnalysisCardProps {
  report: Newsletter;
}

export function AnalysisCard({ report }: AnalysisCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analysis':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'story':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'advice':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analysis':
        return '🧠';
      case 'story':
        return '📖';
      case 'advice':
        return '💡';
      default:
        return '📄';
    }
  };

  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant="secondary" 
            className={getCategoryColor(report.category)}
          >
            {getCategoryIcon(report.category)} {report.category === 'analysis' ? '심리 분석' : 
                                  report.category === 'story' ? '사례 연구' : '해결책'}
          </Badge>
          <span className="text-sm text-gray-500">
            {report.readTime}분 분량
          </span>
        </div>
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {report.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {report.content}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {report.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="text-xs text-gray-500">
          {report.author} • {new Date(report.createdAt).toLocaleDateString('ko-KR')}
        </div>
      </CardContent>
    </Card>
  );
}