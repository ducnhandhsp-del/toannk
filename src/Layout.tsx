/**
 * Layout.tsx — v27.1
 * - Sidebar mở rộng: 200px | Thu gọn: 48px (~0.8cm icon-only)
 * - Mặc định thu gọn (collapsed=true) để tiết kiệm diện tích
 * - BottomNav chỉ mobile (<768px)
 */
import React, { memo, useState, useEffect, useRef } from 'react';
import { X, Menu, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Screen } from './types';
import { NAV_ITEMS } from './navItems';

export { NAV_ITEMS } from './navItems';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', h);
    setIsDesktop(mq.matches);
    return () => mq.removeEventListener('change', h);
  }, []);
  return isDesktop;
}

const W_EXPANDED = 200;
const W_COLLAPSED = 48;  // ~0.8cm ≈ 30px, 48px for icon visibility

const SidebarContent = memo(({
  active, set, centerName, collapsed, onClose,
}: {
  active: Screen; set: (s: Screen) => void;
  centerName: string; collapsed?: boolean; onClose?: () => void;
}) => (
  <div style={{
    display: 'flex', flexDirection: 'column', height: '100%',
    background: 'linear-gradient(180deg,#0f1f3d 0%,#0a1628 100%)',
    overflow: 'hidden',
  }}>
    {/* Logo area */}
    <div style={{
      padding: collapsed ? '12px 0' : '14px 12px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
      gap: 10, minHeight: 56, flexShrink: 0,
    }}>
      <button
        onClick={() => set('overview')}
        title="Về Tổng quan"
        style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer', padding: 0,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='scale(1.08)'; (e.currentTarget as HTMLElement).style.boxShadow='0 0 0 3px rgba(99,102,241,0.4)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}
      >
        <GraduationCap size={15} color="white" />
      </button>
      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {centerName}
          </div>
          <div style={{ fontSize: 8, color: 'rgba(147,197,253,0.5)', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', marginTop: 1 }}>
            Quản lý giảng dạy
          </div>
        </div>
      )}
      {onClose && (
        <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={15} />
        </button>
      )}
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '8px 6px' : '8px 6px' }}>
      {NAV_ITEMS.map(({ id, label, icon: Icon, color }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => { set(id); onClose?.(); }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            title={label}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : 9,
              padding: collapsed ? '9px 0' : '8px 9px',
              borderRadius: 7, border: 'none', cursor: 'pointer', marginBottom: 1,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
              textTransform: 'uppercase', transition: 'all 0.13s',
              background: isActive ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.46)',
              boxShadow: isActive ? '0 3px 10px rgba(99,102,241,0.4)' : 'none',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <span style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
            }}>
              <Icon size={13} color={isActive ? 'white' : undefined} className={isActive ? '' : color} />
            </span>
            {!collapsed && (
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    {/* Footer version */}
    {!collapsed && (
      <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
        v27.1
      </div>
    )}
  </div>
));

/* Desktop Sidebar */
export const Sidebar = memo(({ active, set, centerName }: {
  active: Screen; set: (s: Screen) => void; centerName: string;
}) => {
  const isDesktop = useIsDesktop();
  // Default collapsed to save space
  const [collapsed, setCollapsed] = useState(true);
  const w = collapsed ? W_COLLAPSED : W_EXPANDED;

  if (!isDesktop) return null;

  return (
    <aside style={{
      width: w, minWidth: w, height: '100vh', position: 'sticky', top: 0,
      transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '3px 0 16px rgba(0,0,0,0.15)',
      flexShrink: 0, zIndex: 30,
    }} className="print:hidden">
      <SidebarContent active={active} set={set} centerName={centerName} collapsed={collapsed} />
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          position: 'absolute', bottom: 44, right: -11, width: 22, height: 22,
          borderRadius: '50%', background: '#1e3a5f', border: '2px solid rgba(255,255,255,0.12)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 10, flexShrink: 0,
        }}
        title={collapsed ? 'Mở rộng' : 'Thu gọn'}
      >
        {collapsed
          ? <ChevronRight size={11} color="rgba(255,255,255,0.65)" />
          : <ChevronLeft  size={11} color="rgba(255,255,255,0.65)" />
        }
      </button>
    </aside>
  );
});

/* Mobile header */
export const MobileHeader = memo(({ active, set, centerName }: {
  active: Screen; set: (s: Screen) => void; centerName: string;
}) => {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  if (isDesktop) return null;
  const currentItem = NAV_ITEMS.find(n => n.id === active);

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, height: 50,
        background: 'linear-gradient(180deg,#0f1f3d,#0a1628)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
      }} className="print:hidden">
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4, display: 'flex' }}>
          <Menu size={19} />
        </button>
        <button onClick={() => set('overview')} title="Về Tổng quan" style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', cursor: 'pointer', padding: 0 }}>
          <GraduationCap size={13} color="white" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: 12 }}>{centerName}</div>
          {currentItem && <div style={{ fontSize: 9, color: 'rgba(147,197,253,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{currentItem.label}</div>}
        </div>
      </header>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }} />}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, width: 240, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)', boxShadow: '8px 0 32px rgba(0,0,0,0.35)' }} className="print:hidden">
        <SidebarContent active={active} set={set} centerName={centerName} onClose={() => setOpen(false)} />
      </div>
    </>
  );
});

/* Bottom nav (mobile only) */
export const BottomNav = memo(({ active, set }: { active: Screen; set: (s: Screen) => void }) => {
  const isDesktop = useIsDesktop();
  const navRef  = useRef<HTMLElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => {
    const btn = btnRefs.current[active];
    if (btn && navRef.current) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);
  if (isDesktop) return null;
  return (
    <>
      <style>{`.ltn-bnav::-webkit-scrollbar{display:none}`}</style>
      <nav ref={navRef} className="ltn-bnav print:hidden"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'linear-gradient(180deg,#0f1f3d,#0a1628)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'stretch', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
        {NAV_ITEMS.map(({ id, shortLabel = '', icon: Icon, color }) => {
          const isActive = active === id;
          return (
            <button key={id} ref={el => { btnRefs.current[id] = el; }} onClick={() => set(id)}
              style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '8px 4px 6px', background: 'none', border: 'none', cursor: 'pointer', color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.38)', transition: 'color 0.15s' }}>
              <span style={{ width: 30, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? 'rgba(99,102,241,0.3)' : 'transparent' }}>
                <Icon size={14} color={isActive ? '#a5b4fc' : undefined} className={isActive ? '' : color} />
              </span>
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{shortLabel || id}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
});
