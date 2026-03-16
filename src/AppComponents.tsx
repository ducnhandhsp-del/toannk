import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export function fmtM(amount: number): string {
  if (amount === 0) return '0';
  const m = amount / 1_000_000;
  if (m >= 1000) return `${Math.round(m/1000)}tỷ`;
  if (m % 1 === 0) return `${m}tr`;
  return `${parseFloat(m.toFixed(1))}tr`;
}

export const TABLE_WRAP: React.CSSProperties = {
  background: 'white', border: '1px solid #e2e8f0', overflow: 'hidden',
};

export const TH_SHARED: React.CSSProperties = {
  padding: '11px 14px', fontSize: 11, fontWeight: 700, color: 'white',
  textTransform: 'uppercase', letterSpacing: '0.08em', background: '#1e3a5f',
  whiteSpace: 'nowrap', borderBottom: '2px solid #0f2d4a', textAlign: 'left' as const,
};

export const TD_SHARED: React.CSSProperties = {
  padding: '11px 14px', fontSize: 13, color: '#1e293b',
  fontWeight: 500, borderBottom: '1px solid #f1f5f9',
};

export const trStyle = (idx: number, hov = false): React.CSSProperties => ({
  background: hov ? '#f0f4ff' : idx % 2 === 0 ? 'white' : '#f9fafc',
  transition: 'background 0.1s',
});

interface ColDef {
  key: string; label: string; align?: 'left'|'center'|'right';
  width?: number|string; render?: (val: any, row: any, idx: number) => React.ReactNode;
}

export function AppTable({ columns, data, rowKey, emptyIcon='📋', emptyText='Không có dữ liệu', emptyAction, footer, style, scrollX=true }: {
  columns: ColDef[]; data: any[]; rowKey: string; emptyIcon?: string; emptyText?: string;
  emptyAction?: { label: string; onClick: () => void }; footer?: React.ReactNode;
  style?: React.CSSProperties; scrollX?: boolean;
}) {
  const [hovRow, setHovRow] = useState<any>(null);
  return (
    <div style={{ ...TABLE_WRAP, ...style }}>
      <div style={{ overflowX: scrollX ? 'auto' : undefined }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{columns.map(col => <th key={col.key} style={{ ...TH_SHARED, textAlign: col.align||'left', width: col.width }}>{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: '52px 16px', textAlign: 'center' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:36 }}>{emptyIcon}</span>
                  <p style={{ color:'#94a3b8', fontStyle:'italic', fontSize:14, margin:0 }}>{emptyText}</p>
                  {emptyAction && <button onClick={emptyAction.onClick} style={{ padding:'7px 18px', background:'#6366f1', color:'white', border:'none', borderRadius:7, fontWeight:700, fontSize:13, cursor:'pointer' }}>{emptyAction.label}</button>}
                </div>
              </td></tr>
            ) : data.map((row, idx) => (
              <tr key={row[rowKey]} onMouseEnter={()=>setHovRow(row[rowKey])} onMouseLeave={()=>setHovRow(null)} style={trStyle(idx, hovRow===row[rowKey])}>
                {columns.map(col => <td key={col.key} style={{ ...TD_SHARED, textAlign: col.align||'left' }}>{col.render ? col.render(row[col.key], row, idx) : (row[col.key]??'—')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && <div style={{ borderTop:'1px solid #f1f5f9', background:'#fafafa' }}>{footer}</div>}
    </div>
  );
}

export function StatBlock({ icon: Icon, value, label, sub, gradient, onClick, actionLabel, delta }: {
  icon: React.ComponentType<{size?:number;color?:string}>; value: string|number;
  label: string; sub?: string; gradient: string; onClick?: ()=>void;
  actionLabel?: string; delta?: number|null;
}) {
  const [hov, setHov] = useState(false);
  const clickable = !!onClick;
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:gradient, padding:'13px 16px', display:'flex', alignItems:'center', gap:12,
        cursor:clickable?'pointer':'default', position:'relative', overflow:'hidden', minWidth:0,
        boxShadow:hov&&clickable?'0 6px 20px rgba(0,0,0,0.18)':'0 2px 8px rgba(0,0,0,0.10)',
        transform:hov&&clickable?'translateY(-2px)':'none', transition:'all 0.16s ease' }}>
      <div style={{ position:'absolute', right:-10, top:-10, width:56, height:56, borderRadius:'50%', background:'rgba(255,255,255,0.10)', pointerEvents:'none' }}/>
      <div style={{ width:40, height:40, borderRadius:9, background:'rgba(255,255,255,0.20)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color="white"/>
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:'white', lineHeight:1, flexShrink:0, maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.92)', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'rgba(255,255,255,0.58)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</div>}
      </div>
      {clickable&&actionLabel&&hov&&<span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:5, background:'rgba(255,255,255,0.28)', color:'white', flexShrink:0, whiteSpace:'nowrap' }}>+ {actionLabel}</span>}
      {!actionLabel&&delta!=null&&<span style={{ fontSize:11, fontWeight:700, padding:'2px 6px', borderRadius:5, background:'rgba(255,255,255,0.22)', color:'white', flexShrink:0 }}>{delta>0?`↑${delta}`:delta<0?`↓${Math.abs(delta)}`:'→'}</span>}
    </div>
  );
}

export function StatGrid({ children, cols }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:cols?`repeat(${cols},1fr)`:'repeat(auto-fit,minmax(200px,1fr))', gap:10 }}>
      {children}
    </div>
  );
}

export function FAB({ onClick, label, icon: Icon=Plus, color='#6366f1', shadow='0 8px 24px rgba(99,102,241,0.5)' }: {
  onClick: ()=>void; label: string;
  icon?: React.ComponentType<{size?:number;color?:string}>;
  color?: string; shadow?: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <>
      <style>{`.ltn-fab{bottom:32px!important}@media(max-width:1023px){.ltn-fab{bottom:88px!important}}`}</style>
      <button onClick={onClick} aria-label={label} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        className="ltn-fab print:hidden"
        style={{ position:'fixed', right:24, zIndex:40, width:56, height:56, borderRadius:'50%', background:color, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:shadow, transform:hov?'scale(1.08)':'scale(1)', transition:'transform 0.18s' }}>
        <Icon size={22} color="white"/>
        {hov && <span style={{ position:'absolute', right:64, whiteSpace:'nowrap', background:'#1e293b', color:'white', fontSize:12, fontWeight:700, padding:'5px 10px', borderRadius:8, pointerEvents:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>{label}</span>}
      </button>
    </>
  );
}

export function ScrollHintTable({ children }: { children: React.ReactNode }) {
  return <div className="table-scroll-hint" style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' as any }}>{children}</div>;
}

interface EBState { hasError: boolean; error: Error|null; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallbackLabel?: string }, EBState> {
  constructor(props: any) { super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error: Error): EBState { return { hasError:true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('[ErrorBoundary]', error, info.componentStack); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Lỗi hiển thị{this.props.fallbackLabel ? ` — ${this.props.fallbackLabel}` : ''}</h3>
          <p className="text-slate-500 text-sm max-w-sm">Một lỗi đã xảy ra. Các phần còn lại vẫn hoạt động bình thường.</p>
          {this.state.error && <p className="mt-2 text-xs font-mono text-red-400 bg-red-50 px-3 py-2 rounded-lg max-w-sm">{this.state.error.message}</p>}
        </div>
        <button onClick={()=>this.setState({hasError:false,error:null})} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition-all">Thử lại</button>
      </div>
    );
  }
}
