'use client';

import React from 'react';

export default function SwitchSimple({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        width: 44,
        height: 24,
        background: checked ? '#4caf50' : '#e0e0e0',
        borderRadius: 12,
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        transition: 'background 0.2s',
      }}
      onClick={() => onChange(!checked)}
    >
      <div
        style={{
          width: 20,
          height: 20,
          background: '#fff',
          borderRadius: 50,
          transform: `translateX(${checked ? 20 : 0}%)`,
          transition: 'transform 0.2s',
        }}
      />
    </label>
  );
}
