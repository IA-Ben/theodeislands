'use client';

/**
 * Roadmap Filters
 * Filter cards by user type and event phase
 */

import React from 'react';

export type UserType = 'end-user' | 'creator-admin' | 'all';
export type EventPhase = 'before-event' | 'at-event' | 'after-event' | 'all';

export interface FilterState {
  userType: UserType;
  eventPhase: EventPhase;
}

interface RoadmapFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const USER_TYPES = [
  { id: 'all' as const, label: 'All Users', emoji: '👥', color: 'bg-gray-100 text-gray-700' },
  { id: 'end-user' as const, label: 'End User', emoji: '👤', color: 'bg-blue-100 text-blue-700' },
  { id: 'creator-admin' as const, label: 'Creator/Admin', emoji: '⚙️', color: 'bg-purple-100 text-purple-700' }
];

const EVENT_PHASES = [
  { id: 'all' as const, label: 'All Phases', emoji: '🔄', color: 'bg-gray-100 text-gray-700' },
  { id: 'before-event' as const, label: 'Before Event', emoji: '📅', color: 'bg-green-100 text-green-700' },
  { id: 'at-event' as const, label: 'At Event', emoji: '🎪', color: 'bg-orange-100 text-orange-700' },
  { id: 'after-event' as const, label: 'After Event', emoji: '📊', color: 'bg-indigo-100 text-indigo-700' }
];

export default function RoadmapFilters({ filters, onFilterChange }: RoadmapFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-2 gap-6">
        {/* User Type Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">👥 User Type</h3>
          <div className="flex gap-2">
            {USER_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => onFilterChange({ ...filters, userType: type.id })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filters.userType === type.id
                    ? type.color + ' ring-2 ring-offset-2 ring-gray-400'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{type.emoji}</span>
                  <span className="hidden sm:inline">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Event Phase Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🎪 Event Phase</h3>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_PHASES.map(phase => (
              <button
                key={phase.id}
                onClick={() => onFilterChange({ ...filters, eventPhase: phase.id })}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filters.eventPhase === phase.id
                    ? phase.color + ' ring-2 ring-offset-2 ring-gray-400'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{phase.emoji}</span>
                  <span className="hidden sm:inline">{phase.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.userType !== 'all' || filters.eventPhase !== 'all') && (
        <div className="mt-4 pt-4 border-t flex items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.userType !== 'all' && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {USER_TYPES.find(t => t.id === filters.userType)?.emoji}{' '}
              {USER_TYPES.find(t => t.id === filters.userType)?.label}
            </span>
          )}
          {filters.eventPhase !== 'all' && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              {EVENT_PHASES.find(p => p.id === filters.eventPhase)?.emoji}{' '}
              {EVENT_PHASES.find(p => p.id === filters.eventPhase)?.label}
            </span>
          )}
          <button
            onClick={() => onFilterChange({ userType: 'all', eventPhase: 'all' })}
            className="ml-auto text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

