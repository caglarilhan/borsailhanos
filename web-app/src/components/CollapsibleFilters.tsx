/**
 * P5.2: Collapsible Filters
 * Filtre gruplarını collapse et
 */

'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export interface FilterGroup {
  id: string;
  label: string;
  collapsed?: boolean;
  children: React.ReactNode;
}

export interface CollapsibleFiltersProps {
  groups: FilterGroup[];
  defaultCollapsed?: boolean;
  className?: string;
}

export function CollapsibleFilters({ 
  groups, 
  defaultCollapsed = false,
  className = '' 
}: CollapsibleFiltersProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(groups.filter(g => g.collapsed !== undefined ? g.collapsed : defaultCollapsed).map(g => g.id))
  );

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {groups.map(group => {
        const isCollapsed = collapsedGroups.has(group.id);
        
        return (
          <div key={group.id} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full px-3 py-2 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-700">{group.label}</span>
              {isCollapsed ? (
                <ChevronDownIcon className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronUpIcon className="w-4 h-4 text-slate-500" />
              )}
            </button>
            {!isCollapsed && (
              <div className="p-3 bg-white">
                {group.children}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


