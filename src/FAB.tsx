/**
 * FAB.tsx — v26.2
 * FIX: icon prop là optional, default = Plus
 *   → ClassesTab / DiaryTab có thể gọi <FAB> mà không cần truyền icon
 *   → Không còn "Element type is invalid: got undefined" khi icon bị bỏ quên
 */
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  label:   string;
  icon?:   React.ComponentType<{ size?: number; color?: string }>;
  color?:  string;
  shadow?: string;
}

export function FAB({
  onClick, label,
  icon: Icon = Plus,            // ← default Plus, không còn undefined
  color  = '#6366f1',
  shadow = '0 8px 24px rgba(99,102,241,0.5)',
}: FABProps) {
  const [hov, setHov] = useState(false);
  return (
    <>
      <style>{`
        .ltn-fab { bottom: 32px !important; }
        @media (max-width: 1023px) { .ltn-fab { bottom: 88px !important; } }
      `}</style>
      <button
        onClick={onClick}
        aria-label={label}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="ltn-fab print:hidden"
        style={{
          position: 'fixed', right: 24, zIndex: 40,
          width: 56, height: 56, borderRadius: '50%',
          background: color, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: shadow,
          transform: hov ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.18s',
        }}
      >
        <Icon size={22} color="white" />
        {hov && (
          <span style={{
            position: 'absolute', right: 64, whiteSpace: 'nowrap',
            background: '#1e293b', color: 'white',
            fontSize: 12, fontWeight: 700, padding: '5px 10px',
            borderRadius: 8, pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {label}
          </span>
        )}
      </button>
    </>
  );
}

export function ScrollHintTable({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="table-scroll-hint"
      style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}
    >
      {children}
    </div>
  );
}
