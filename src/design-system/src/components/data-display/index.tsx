/**
 * components/data-display/index.tsx
 * StatCard · DataTable · TableActions · AttendancePicker
 */
import React, { useState, useMemo } from 'react';
import type { StatCardProps, DataTableProps, TableActionsProps, AttendancePickerProps, AttendanceStatus } from '../../types';
import { colors, typography, radius, shadows, transition } from '../../styles/theme';

/* ── STAT CARD ──────────────────────────────────────── */
export function StatCard({label,value,sub,gradient,icon:Icon,trend,trendLabel,onClick,clickable=!!onClick}:StatCardProps){
  const [hov,setHov]=useState(false); const hasDelta=trend!=null;
  return(
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:gradient,borderRadius:radius.xl,padding:'20px 20px 16px',position:'relative',overflow:'hidden',minWidth:0,boxShadow:hov?shadows.xl:shadows.md,transform:hov&&clickable?'translateY(-3px)':'translateY(0)',transition:transition.normal,cursor:clickable?'pointer':'default'}}>
      <div style={{position:'absolute',right:-16,top:-16,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,0.12)',pointerEvents:'none'}}/>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14,position:'relative'}}>
        <div style={{width:42,height:42,borderRadius:radius.md,background:'rgba(255,255,255,0.22)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={20} color="white"/></div>
        {hasDelta&&<span style={{display:'flex',alignItems:'center',gap:2,fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:radius.sm,background:'rgba(255,255,255,0.25)',color:'white'}}>{trend!>0?'↑':trend!<0?'↓':'→'} {Math.abs(trend!)}</span>}
      </div>
      <div style={{fontSize:30,fontWeight:800,color:'white',lineHeight:1.1,position:'relative',fontFamily:typography.fontFamily}}>{value}</div>
      <div style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.9)',marginTop:4,position:'relative'}}>{label}</div>
      {sub&&<div style={{fontSize:12,color:'rgba(255,255,255,0.65)',marginTop:2,position:'relative'}}>{sub}</div>}
      {trendLabel&&hasDelta&&<div style={{fontSize:11,color:'rgba(255,255,255,0.55)',marginTop:4,position:'relative'}}>{trendLabel}</div>}
    </div>
  );
}

/* ── DATA TABLE ─────────────────────────────────────── */
export function DataTable<T extends Record<string,any>>({
  columns,data,rowKey,loading=false,emptyIcon='📋',emptyText='Không có dữ liệu',emptyAction,
  striped=true,hoverable=true,page,perPage=10,total,onPageChange,scrollX=true,style,
}:DataTableProps<T>){
  const [sortKey,setSortKey]=useState<string|null>(null),[sortDir,setSortDir]=useState<'asc'|'desc'>('asc'),[hovRow,setHovRow]=useState<any>(null);
  const sorted=useMemo(()=>{ if(!sortKey) return data; return [...data].sort((a,b)=>{ const cmp=String(a[sortKey]).localeCompare(String(b[sortKey]),'vi'); return sortDir==='asc'?cmp:-cmp; }); },[data,sortKey,sortDir]);
  const handleSort=(key:string)=>{ if(sortKey===key)setSortDir(d=>d==='asc'?'desc':'asc'); else{setSortKey(key);setSortDir('asc');} };
  const TH:React.CSSProperties={padding:'11px 14px',fontSize:11,fontWeight:700,color:colors.neutral[500],textTransform:'uppercase',letterSpacing:'0.08em',background:colors.neutral[50],whiteSpace:'nowrap',userSelect:'none',borderBottom:`2px solid ${colors.neutral[200]}`};
  const TD_BASE:React.CSSProperties={padding:'13px 14px',fontSize:13,color:colors.neutral[800],fontWeight:500,borderBottom:`1px solid ${colors.neutral[50]}`,fontFamily:typography.fontFamily};
  return(
    <div style={{background:'white',borderRadius:radius.lg,border:`1px solid ${colors.neutral[200]}`,boxShadow:shadows.sm,overflow:'hidden',...style}}>
      {loading&&<div style={{height:4,background:colors.neutral[100],overflow:'hidden',position:'relative'}}><div style={{height:'100%',width:'40%',background:colors.primary[500],animation:'dsLoad 1.2s ease-in-out infinite',borderRadius:4}}/><style>{`@keyframes dsLoad{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style></div>}
      <div style={{overflowX:scrollX?'auto':undefined}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:scrollX?'min-content':undefined}}>
          <thead><tr>{columns.map((col,i)=>(
            <th key={String(col.key)} onClick={col.sortable?()=>handleSort(String(col.key)):undefined}
              style={{...TH,textAlign:col.align||'left',cursor:col.sortable?'pointer':'default',width:col.width,...col.headerStyle}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{col.label}{col.sortable&&<span style={{opacity:sortKey===String(col.key)?1:0.4}}>{sortKey===String(col.key)&&sortDir==='asc'?'↑':'↓'}</span>}</span>
            </th>
          ))}</tr></thead>
          <tbody>
            {sorted.length===0?(
              <tr><td colSpan={columns.length} style={{padding:'48px 16px',textAlign:'center'}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
                  <span style={{fontSize:40}}>{emptyIcon}</span>
                  <p style={{color:colors.neutral[400],fontStyle:'italic',fontSize:14,margin:0}}>{emptyText}</p>
                  {emptyAction&&<button onClick={emptyAction.onClick} style={{padding:'8px 20px',background:colors.primary[500],color:'white',border:'none',borderRadius:radius.md,fontWeight:700,fontSize:13,cursor:'pointer'}}>{emptyAction.label}</button>}
                </div>
              </td></tr>
            ):sorted.map((row,idx)=>{
              const key=row[rowKey]; const isHov=hoverable&&hovRow===key; const isStripe=striped&&idx%2!==0;
              return(
                <tr key={String(key)} onMouseEnter={()=>hoverable&&setHovRow(key)} onMouseLeave={()=>hoverable&&setHovRow(null)} style={{background:isHov?'#f8f7ff':isStripe?'#fafcff':'white',transition:transition.fast}}>
                  {columns.map(col=>{ const val=String(col.key) in row?row[col.key as keyof T]:undefined; return(<td key={String(col.key)} style={{...TD_BASE,textAlign:col.align||'left',...col.cellStyle}}>{col.render?col.render(val,row,idx):String(val??'—')}</td>); })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {total!==undefined&&onPageChange&&page!==undefined&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderTop:`1px solid ${colors.neutral[100]}`,background:colors.neutral[50]}}>
          <span style={{fontSize:12,fontWeight:600,color:colors.neutral[400]}}>{(page-1)*perPage+1}–{Math.min(page*perPage,total)} / {total}</span>
          <div style={{display:'flex',gap:4}}>
            {[...Array(Math.ceil(total/perPage))].map((_,i)=>{ const p=i+1,active=p===page; return(<button key={p} onClick={()=>onPageChange(p)} style={{width:32,height:32,borderRadius:radius.md,border:`1px solid ${active?colors.primary[500]:colors.neutral[200]}`,background:active?colors.primary[500]:'white',color:active?'white':colors.neutral[600],fontWeight:700,fontSize:12,cursor:'pointer',transition:transition.fast}}>{p}</button>); })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TABLE ACTIONS ──────────────────────────────────── */
const TA_C={default:{bg:colors.neutral[100],hover:colors.neutral[200],color:colors.neutral[600]},primary:{bg:colors.primary[50],hover:colors.primary[100],color:colors.primary[600]},warning:{bg:colors.warning[50],hover:colors.warning[200],color:colors.warning[600]},danger:{bg:colors.danger[50],hover:colors.danger[200],color:colors.danger[600]}};
export function TableActions({actions,compact=false}:TableActionsProps){
  const [hovIdx,setHovIdx]=useState<number|null>(null);
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:compact?4:6}}>
      {actions.filter(a=>!a.hidden).map((a,i)=>{ const c=TA_C[a.intent||'default']||TA_C.default; return(
        <div key={i} style={{position:'relative'}}>
          <button onClick={a.disabled?undefined:a.onClick} disabled={a.disabled} onMouseEnter={()=>setHovIdx(i)} onMouseLeave={()=>setHovIdx(null)} aria-label={a.label}
            style={{width:compact?30:34,height:compact?30:34,borderRadius:radius.sm,background:hovIdx===i?c.hover:c.bg,border:'none',cursor:a.disabled?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:c.color,opacity:a.disabled?0.4:1,transform:hovIdx===i?'scale(1.08)':'scale(1)',transition:transition.fast}}>
            {a.icon}
          </button>
          {hovIdx===i&&<div style={{position:'absolute',bottom:'calc(100% + 5px)',left:'50%',transform:'translateX(-50%)',background:colors.neutral[900],color:'white',fontSize:11,fontWeight:700,padding:'3px 7px',borderRadius:5,whiteSpace:'nowrap',pointerEvents:'none',zIndex:99}}>{a.label}</div>}
        </div>
      );})}
    </div>
  );
}

/* ── ATTENDANCE PICKER ──────────────────────────────── */
const ST_CFG:Record<AttendanceStatus,{label:string;bg:string;border:string;color:string;activeBg:string}>={
  present:{label:'Có mặt',bg:'#f0fdf4',border:'#86efac',color:'#15803d',activeBg:'#16a34a'},
  late:   {label:'Muộn',  bg:'#fffbeb',border:'#fcd34d',color:'#b45309',activeBg:'#d97706'},
  absent: {label:'Vắng',  bg:'#fff1f2',border:'#fecaca',color:'#be123c',activeBg:'#e11d48'},
};
export function AttendancePicker({students,onChange,readOnly=false}:AttendancePickerProps){
  const update=(id:string,status:AttendanceStatus)=>onChange(students.map(s=>s.id===id?{...s,status}:s));
  const bulkSet=(status:AttendanceStatus)=>onChange(students.map(s=>({...s,status})));
  const counts={present:students.filter(s=>s.status==='present').length,late:students.filter(s=>s.status==='late').length,absent:students.filter(s=>s.status==='absent').length};
  return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',gap:8}}>{(['present','late','absent'] as AttendanceStatus[]).map(s=>{const c=ST_CFG[s];return(<span key={s} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:radius.md,background:c.bg,border:`1px solid ${c.border}`,fontSize:12,fontWeight:700,color:c.color}}>{c.label}: {counts[s]}</span>);})}</div>
        {!readOnly&&<div style={{display:'flex',gap:6}}>{(['present','late','absent'] as AttendanceStatus[]).map(s=>{const c=ST_CFG[s];return(<button key={s} onClick={()=>bulkSet(s)} style={{padding:'5px 10px',borderRadius:radius.sm,border:`1px solid ${c.border}`,background:c.bg,color:c.color,fontWeight:700,fontSize:11,cursor:'pointer'}}>{c.label}: Tất cả</button>);})}</div>}
      </div>
      <div style={{background:'white',borderRadius:radius.lg,border:`1px solid ${colors.neutral[200]}`,overflow:'hidden'}}>
        {students.map((s,idx)=>(
          <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 16px',borderBottom:idx<students.length-1?`1px solid ${colors.neutral[50]}`:'none',background:idx%2===0?'white':colors.neutral[50]}}>
            <span style={{fontSize:11,fontWeight:700,color:colors.neutral[300],width:20,textAlign:'center'}}>{idx+1}</span>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:13,fontWeight:700,color:colors.neutral[900],margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</p>
              <p style={{fontSize:11,color:colors.neutral[400],margin:0}}>{s.id}</p>
            </div>
            <div style={{display:'flex',gap:4}}>
              {(['present','late','absent'] as AttendanceStatus[]).map(st=>{const c=ST_CFG[st],isActive=s.status===st;return(<button key={st} onClick={readOnly?undefined:()=>update(s.id,st)} disabled={readOnly} style={{padding:'5px 10px',borderRadius:radius.sm,border:`1.5px solid ${isActive?c.activeBg:c.border}`,background:isActive?c.activeBg:c.bg,color:isActive?'white':c.color,fontWeight:700,fontSize:11,cursor:readOnly?'default':'pointer',transition:transition.fast,boxShadow:isActive?shadows.sm:'none'}}>{c.label}</button>);})}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
