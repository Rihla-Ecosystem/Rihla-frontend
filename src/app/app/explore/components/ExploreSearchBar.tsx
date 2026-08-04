'use client';

import React from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { C } from '@/lib/constants/theme';

export interface ExploreGovernorateOption {
  name: string;
}

export const EXPLORE_CATEGORY_CHIPS = ['All', 'archaeological', 'islamic', 'christian', 'infrastructure'] as const;

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
          <option value="">All Egypt</option>
          {governorates.map((g) => (
            <option key={g.name} value={g.name}>
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