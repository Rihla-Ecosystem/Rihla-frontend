'use client';

import React from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { C } from '@/lib/constants/theme';

export interface ExploreGovernorateOption {
  name: string;
}

export const EXPLORE_CATEGORY_CHIPS = ['All', 'archaeological', 'islamic', 'christian', 'infrastructure'] as const;

export const ALL_EGYPT_VALUE = '__all__';

interface ExploreSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  governorates: ExploreGovernorateOption[];
  governorate: string;
  onGovernorateChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}

const chipLabel = (c: string) => (c === 'All' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1));

const GOV_NAME_COLORS = [
  '#DC2626',
  '#EA580C',
  '#D97706',
  '#65A30D',
  '#16A34A',
  '#0D9488',
  '#0891B2',
  '#2563EB',
  '#4F46E5',
  '#7C3AED',
  '#C026D3',
  '#DB2777',
  '#E11D48',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
  '#A855F7',
  '#EC4899',
  '#84CC16',
  '#14B8A6',
  '#0EA5E9',
  '#6366F1',
  '#D946EF',
  '#F97316',
  '#9333EA',
];

export const govNameColor = (name: string, index: number) =>
  GOV_NAME_COLORS[index % GOV_NAME_COLORS.length];

export function ExploreSearchBar({
  search,
  onSearchChange,
  governorates,
  governorate,
  onGovernorateChange,
  category,
  onCategoryChange,
}: ExploreSearchBarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          color="#A89880"
          strokeWidth={2}
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={search}
          placeholder="Search sites, cities..."
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '11px 38px 11px 38px',
            borderRadius: 12,
            border: `1.5px solid ${search ? C.solar : 'rgba(27,26,23,0.13)'}`,
            background: '#FFFFFF',
            fontFamily: "'Inter',sans-serif",
            fontSize: '13px',
            color: C.nile,
            outline: 'none',
            boxShadow: search ? `0 0 0 3px ${C.solar}18` : 'none',
            transition: 'all 0.15s',
          }}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: C.limestoneDark,
              border: 'none',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#8B7E6A',
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Governorate select */}
      <div style={{ position: 'relative' }}>
        <MapPin
          size={16}
          color="#A8987B"
          strokeWidth={2}
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <select
          value={governorate}
          onChange={(e) => onGovernorateChange(e.target.value)}
          style={{
            width: '100%',
            appearance: 'none',
            padding: '11px 36px',
            borderRadius: 12,
            border: '1.5px solid rgba(27,26,23,0.13)',
            background: '#FFFFFF',
            fontFamily: "'Inter',sans-serif",
            fontSize: '13px',
            color: C.nile,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="">My location</option>
          <option value={ALL_EGYPT_VALUE}>All Egypt</option>
          {governorates.map((g, i) => (
            <option key={g.name} value={g.name} style={{ color: govNameColor(g.name, i) }}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EXPLORE_CATEGORY_CHIPS.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              style={{
                background: active ? C.nile : 'transparent',
                border: `1.5px solid ${active ? C.nile : 'rgba(27,26,23,0.13)'}`,
                borderRadius: 99,
                padding: '5px 13px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                fontWeight: active ? 600 : 400,
                color: active ? C.limestone : '#6B6354',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {chipLabel(c)}
            </button>
          );
        })}
      </div>
    </div>
  );
}