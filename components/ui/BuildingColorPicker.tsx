'use client';

import { useState, useEffect } from 'react';

interface BuildingColorPickerProps {
  color: string;
  opacity: number;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onClose: () => void;
}

export default function BuildingColorPicker({
  color,
  opacity,
  onColorChange,
  onOpacityChange,
  onClose,
}: BuildingColorPickerProps) {
  const [hexValue, setHexValue] = useState(color);

  useEffect(() => {
    setHexValue(color);
  }, [color]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexValue(value);
    // Only update if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onColorChange(value);
    }
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexValue(value);
    onColorChange(value);
  };

  return (
    <div
      style={{
        background: 'rgba(15, 15, 26, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
        minWidth: 200,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Building Color
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>
      </div>

      {/* Color preview + picker */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: color,
            opacity: opacity,
            border: '2px solid rgba(255,255,255,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <input
            type="color"
            value={color}
            onChange={handleColorInputChange}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 4 }}>
            HEX
          </label>
          <input
            type="text"
            value={hexValue}
            onChange={handleHexChange}
            placeholder="#000000"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              padding: '6px 8px',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          />
        </div>
      </div>

      {/* Opacity slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>OPACITY</label>
          <span style={{ color: '#fff', fontSize: 11, fontFamily: 'monospace' }}>
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: 6,
            WebkitAppearance: 'none',
            appearance: 'none',
            background: `linear-gradient(to right, transparent 0%, ${color} 100%)`,
            borderRadius: 3,
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Output values */}
      <div
        style={{
          marginTop: 14,
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 11,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <div>color: &apos;{color}&apos;</div>
        <div>opacity: {opacity.toFixed(2)}</div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
