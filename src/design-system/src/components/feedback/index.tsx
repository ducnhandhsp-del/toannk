/**
 * components/feedback/index.tsx
 * Badge · ConnectionStatus · QuickActionGroup · Pager
 */
import React, { useState } from 'react';
import type { BadgeProps, ConnectionStatusProps, QuickActionGroupProps, PagerProps, BadgeColor, QuickAction } from '../../types';
import { colors, typography, radius, shadows, transition } from '../../styles/theme';

/* ── BADGE ───────────────────────────────────────────── */
const BC:Record<BadgeColor,{solid:string;text:string;subtle:string;subtleText:string;border:string}>={
  indigo: {solid:colors.primary[500],  text:'white',subtle:colors.primary[50],  subtleText:colors.primary[700],   border:colors.primary[200]},
  teal:   {solid:colors.teal[500],     text:'white',subtle:colors.teal[50],     subtleText:colors.teal[600],      border:'#99f6e4'},
  emerald:{solid:colors.success[500],  text:'white',subtle:colors.success[50],  subtleText:colors.success[600],   border:colors.success[200]},
  amber:  {solid:colors.warning[500],  text:'white',subtle:colors.warning[50],  subtleText:colors.warning[600],   border:colors.warning[200]},
  rose:   {solid:colors.danger[500],   text:'white',subtle:colors.danger[50],   subtleText:colors.danger[600],    border:colors.danger[200]},
  sky:    {solid:colors.info[500],     text:'white',subtle:colors.info[50],     subtleText:colors.info[600],      border:'#bae6fd'},
  violet: {solid:colors.secondary[500],text:'white',subtle:colors.secondary[50],subtleText:colors.secondary[600],border:'#ddd6fe'},
  slate:  {solid:colors.neutral[500],  text:'white',subtle:colors.neutral[50],  subtleText:colors.neutral[600],   border:colors.neutral[200]},
};
export function Badge({children,color='indigo',variant='subtle',size='md',dot=false,onRemove}:BadgeProps){
  const c=BC[color]; const fs=size==='sm'?10:12; const py=size==='sm'?'2px':'3px'; const px=size==='sm'?'6px':'9px';
  let bg:string,textColor:string,border:string;
  if(variant==='solid')   {bg=c.solid;    textColor=c.text;       border='transparent';}
  else if(variant==='outline'){bg='transparent';textColor=c.subtleText;border=c.border;}
  else                    {bg=c.subtle;   textColor=c.subtleText; border=c.border;}
  return(
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:`${py} ${px}`,borderRadius:9999,background:bg,border:`1px solid ${border}`,color:textColor,fontSize:fs,fontWeight:700,fontFamily:typography.fontFamily,whiteSpace:'nowrap',lineHeight:1.4}}>
      {dot&&<span style={{width:6,height:6,borderRadius:'50%',background:textColor,flexShrink:0}}/>}
      {children}
      {onRemove&&<span onClick={onRemove} style={{cursor:'pointer',display:'inline-flex',alignItems:'center',marginLeft:2,opacity:0.7}}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg></span>}
    </span>
  );
}

/* ── CONNECTION STATUS ──────────────────────────────── */
const CONN={
  connected:    {label:'Đã kết nối',      color:'#059669',bg:'#ecfdf5',border:'#a7f3d0',dot:'#10b981',pulse:false},
  disconnected: {label:'Mất kết nối',     color:'#e11d48',bg:'#fff1f2',border:'#fecaca',dot:'#f43f5e',pulse:true},
  loading:      {label:'Đang đồng bộ...',  color:'#d97706',bg:'#fffbeb',border:'#fde68a',dot:'#f59e0b',pulse:true},
  error:        {label:'Lỗi kết nối',     color:'#be123c',bg:'#fff1f2',border:'#fecaca',dot:'#e11d48',pulse:false},
};
export function ConnectionStatus({state,lastSynced,onRetry,onSync,compact=false}:ConnectionStatusProps){
  const c=CONN[state];
  if(compact){
    return(
      <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 10px',borderRadius:radius.md,background:c.bg,border:`1px solid ${c.border}`}}>
        <span style={{width:7,height:7,borderRadius:'50%',background:c.dot,flexShrink:0,animation:c.pulse?'dsPulse 1.2s ease-in-out infinite':undefined}}/>
        <style>{`@keyframes dsPulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        <span style={{fontSize:11,fontWeight:700,color:c.color}}>{c.label}</span>
        {state==='disconnected'&&onRetry&&<button onClick={onRetry} style={{fontSize:11,fontWeight:700,color:c.color,background:'none',border:'none',cursor:'pointer',textDecoration:'underline',padding:0}}>Thử lại</button>}
      </div>
    );
  }
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderRadius:radius.lg,background:c.bg,border:`1px solid ${c.border}`}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{position:'relative',width:10,height:10}}>
          <span style={{display:'block',width:10,height:10,borderRadius:'50%',background:c.dot,animation:c.pulse?'dsPulse 1.2s ease-in-out infinite':undefined}}/>
          {c.pulse&&<span style={{position:'absolute',inset:0,borderRadius:'50%',background:c.dot,opacity:0.4,animation:'dsRipple 1.2s ease-in-out infinite'}}/>}
        </div>
        <div>
          <p style={{fontSize:13,fontWeight:700,color:c.color,margin:0}}>{c.label}</p>
          {lastSynced&&<p style={{fontSize:11,color:colors.neutral[400],margin:0}}>Cập nhật: {lastSynced}</p>}
        </div>
      </div>
      <div style={{display:'flex',gap:8}}>
        {onSync&&state==='connected'&&<button onClick={onSync} style={{padding:'5px 12px',borderRadius:radius.sm,border:`1px solid ${c.border}`,background:'white',color:c.color,fontWeight:700,fontSize:12,cursor:'pointer'}}>🔄 Đồng bộ</button>}
        {onRetry&&(state==='disconnected'||state==='error')&&<button onClick={onRetry} style={{padding:'5px 12px',borderRadius:radius.sm,background:c.dot,border:'none',color:'white',fontWeight:700,fontSize:12,cursor:'pointer'}}>Thử lại</button>}
      </div>
      <style>{`@keyframes dsRipple{0%{transform:scale(1);opacity:0.4}100%{transform:scale(2.5);opacity:0}}`}</style>
    </div>
  );
}

/* ── QUICK ACTION GROUP ─────────────────────────────── */
function QuickActionBtn({label,icon:Icon,color,shadow,onClick}:QuickAction){
  const [hov,setHov]=useState(false);
  return(
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:color,border:'none',cursor:'pointer',borderRadius:radius.xl,padding:'14px 12px',display:'flex',flexDirection:'column',alignItems:'center',gap:8,color:'white',fontWeight:700,fontSize:13,fontFamily:typography.fontFamily,boxShadow:hov?shadow:`0 4px 12px ${shadow.split(')')[0]}0.3)`,transform:hov?'translateY(-2px) scale(1.02)':'translateY(0) scale(1)',transition:transition.normal}}>
      <Icon size={20} color="white"/>
      <span style={{textAlign:'center',lineHeight:1.3}}>{label}</span>
    </button>
  );
}
export function QuickActionGroup({actions,columns,minWidth=140}:QuickActionGroupProps){
  return(
    <div style={{display:'grid',gridTemplateColumns:columns?`repeat(${columns},1fr)`:`repeat(auto-fit,minmax(${minWidth}px,1fr))`,gap:12}}>
      {actions.map((a,i)=><QuickActionBtn key={i} {...a}/>)}
    </div>
  );
}

/* ── PAGER ───────────────────────────────────────────── */
export function Pager({page,total,perPage,setPage,showTotal=true}:PagerProps){
  const totalPages=Math.ceil(total/perPage); if(totalPages<=1&&!showTotal) return null;
  const from=(page-1)*perPage+1, to=Math.min(page*perPage,total);
  const pages=[...Array(totalPages)].map((_,i)=>i+1).filter(p=>Math.abs(p-page)<=2||p===1||p===totalPages).reduce<(number|'...')[]>((acc,p,i,arr)=>{ if(i>0&&p-(arr[i-1] as number)>1) acc.push('...'); acc.push(p); return acc; },[]);
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderTop:`1px solid ${colors.neutral[100]}`,background:colors.neutral[50]}}>
      {showTotal?<span style={{fontSize:12,fontWeight:600,color:colors.neutral[400]}}>{from}–{to} / {total} mục</span>:<span/>}
      <div style={{display:'flex',alignItems:'center',gap:4}}>
        <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page<=1} style={{width:32,height:32,borderRadius:radius.md,border:`1px solid ${colors.neutral[200]}`,background:'white',cursor:page<=1?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:colors.neutral[page<=1?300:500],transition:transition.fast,opacity:page<=1?0.4:1}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
        {pages.map((p,i)=>p==='...'?<span key={`e${i}`} style={{width:32,textAlign:'center',color:colors.neutral[400],fontSize:12,fontWeight:700}}>…</span>:<button key={p} onClick={()=>setPage(p as number)} style={{width:32,height:32,borderRadius:radius.md,border:`1px solid ${p===page?colors.primary[500]:colors.neutral[200]}`,background:p===page?colors.primary[500]:'white',color:p===page?'white':colors.neutral[600],fontWeight:700,fontSize:12,cursor:'pointer',transition:transition.fast}}>{p}</button>)}
        <button onClick={()=>setPage(Math.min(totalPages,page+1))} disabled={page>=totalPages} style={{width:32,height:32,borderRadius:radius.md,border:`1px solid ${colors.neutral[200]}`,background:'white',cursor:page>=totalPages?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:colors.neutral[page>=totalPages?300:500],transition:transition.fast,opacity:page>=totalPages?0.4:1}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
    </div>
  );
}
