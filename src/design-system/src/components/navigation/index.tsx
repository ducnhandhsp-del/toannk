/**
 * components/navigation/index.tsx
 * NavBar · FilterTabs · FilterChip
 */
import React, { useState, useEffect, useRef, memo } from 'react';
import type { NavBarProps, FilterTabsProps, FilterChipProps, BadgeColor } from '../../types';
import { colors, typography, radius, shadows, transition } from '../../styles/theme';

/* ── NAV BAR ────────────────────────────────────────── */
export const NavBar = memo(({items,active,onNavigate,variant='sidebar',centerName='App'}:NavBarProps)=>{
  if(variant==='sidebar') return <SidebarNav items={items} active={active} onNavigate={onNavigate} centerName={centerName}/>;
  if(variant==='bottom')  return <BottomNav  items={items} active={active} onNavigate={onNavigate}/>;
  return <TopBarNav items={items} active={active} onNavigate={onNavigate} centerName={centerName}/>;
});

function SidebarNav({items,active,onNavigate,centerName}:NavBarProps&{centerName?:string}){
  return(
    <aside style={{width:220,minWidth:220,minHeight:'100vh',position:'sticky',top:0,background:colors.dark.grad,boxShadow:'4px 0 24px rgba(0,0,0,0.2)',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'18px 16px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:40,height:40,borderRadius:radius.md,flexShrink:0,background:colors.primary.grad,boxShadow:shadows.primary,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontWeight:800,color:'white',fontSize:13,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{centerName}</p>
          <p style={{fontSize:10,color:'rgba(147,197,253,0.55)',letterSpacing:'0.12em',fontWeight:600,textTransform:'uppercase',margin:0}}>Quản lý giảng dạy</p>
        </div>
      </div>
      <nav style={{flex:1,overflowY:'auto',padding:'12px 10px'}}>
        {items.map(({id,label,icon:Icon,color})=>{
          const isActive=active===id;
          return(
            <button key={id} onClick={()=>onNavigate(id)} aria-current={isActive?'page':undefined}
              style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:radius.md,border:'none',cursor:'pointer',marginBottom:2,fontSize:12,fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',transition:transition.normal,background:isActive?colors.primary.grad:'transparent',color:isActive?'white':'rgba(255,255,255,0.5)',boxShadow:isActive?shadows.primary:'none'}}>
              <span style={{width:30,height:30,borderRadius:9,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:isActive?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.06)'}}><Icon size={14} color={isActive?'white':undefined} className={isActive?'':color}/></span>
              <span style={{flex:1,textAlign:'left',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</span>
              {isActive&&<span style={{width:6,height:6,borderRadius:'50%',background:'rgba(255,255,255,0.7)',flexShrink:0}}/>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:'10px 16px',borderTop:'1px solid rgba(255,255,255,0.07)',textAlign:'center',fontSize:10,fontWeight:600,color:'rgba(255,255,255,0.15)',letterSpacing:'0.12em',textTransform:'uppercase'}}>© 2026 · v1.0</div>
    </aside>
  );
}

function BottomNav({items,active,onNavigate}:NavBarProps){
  const btnRefs=useRef<Record<string,HTMLButtonElement|null>>({});
  const navRef=useRef<HTMLElement>(null);
  useEffect(()=>{ const btn=btnRefs.current[active]; if(btn&&navRef.current) btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}); },[active]);
  return(
    <>
      <style>{`.ds-bnav::-webkit-scrollbar{display:none}`}</style>
      <nav ref={navRef} className="ds-bnav" style={{position:'fixed',bottom:0,left:0,right:0,zIndex:50,background:colors.dark.grad,borderTop:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'stretch',overflowX:'auto',scrollbarWidth:'none',paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
        {items.map(({id,shortLabel='',icon:Icon,color})=>{
          const isActive=active===id;
          return(
            <button key={id} ref={el=>{btnRefs.current[id]=el;}} onClick={()=>onNavigate(id)} style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,padding:'9px 4px 7px',background:'none',border:'none',cursor:'pointer',color:isActive?'#a5b4fc':'rgba(255,255,255,0.38)',transition:transition.fast,minHeight:56}}>
              <span style={{width:34,height:26,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:isActive?'rgba(99,102,241,0.3)':'transparent',transition:transition.fast}}><Icon size={17} color={isActive?'#a5b4fc':undefined} className={isActive?'':color}/></span>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.03em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{shortLabel||id}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

function TopBarNav({items,active,onNavigate,centerName}:NavBarProps&{centerName?:string}){
  return(
    <header style={{position:'sticky',top:0,zIndex:50,background:colors.dark.grad,borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',padding:'0 20px',height:56,gap:24}}>
      <span style={{fontWeight:800,color:'white',fontSize:14,whiteSpace:'nowrap'}}>{centerName}</span>
      <nav style={{display:'flex',gap:2}}>
        {items.map(({id,label,icon:Icon})=>{
          const isActive=active===id;
          return(<button key={id} onClick={()=>onNavigate(id)} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:radius.md,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,textTransform:'uppercase',letterSpacing:'0.04em',transition:transition.fast,background:isActive?'rgba(99,102,241,0.3)':'transparent',color:isActive?'#a5b4fc':'rgba(255,255,255,0.5)'}}><Icon size={13}/>{label}</button>);
        })}
      </nav>
    </header>
  );
}

/* ── FILTER TABS ─────────────────────────────────────── */
export function FilterTabs({tabs,active,onChange,variant='pill',size='md'}:FilterTabsProps){
  const fs=size==='sm'?12:13, ph=size==='sm'?'7px 12px':'8px 16px';
  if(variant==='segment'){
    return(
      <div style={{display:'flex',gap:3,padding:3,background:colors.neutral[100],borderRadius:radius.lg,width:'fit-content'}}>
        {tabs.map(t=>{ const isA=t.id===active; return(
          <button key={t.id} onClick={()=>!t.disabled&&onChange(t.id)} disabled={t.disabled}
            style={{display:'flex',alignItems:'center',gap:6,padding:ph,borderRadius:radius.md,border:'none',cursor:t.disabled?'not-allowed':'pointer',fontWeight:700,fontSize:fs,whiteSpace:'nowrap',transition:transition.fast,opacity:t.disabled?0.4:1,background:isA?'white':'transparent',color:isA?colors.neutral[900]:colors.neutral[500],boxShadow:isA?shadows.sm:'none'}}>
            {t.icon&&<span style={{display:'flex',alignItems:'center'}}>{t.icon}</span>}
            {t.label}
            {t.count!==undefined&&<span style={{fontSize:fs-1,fontWeight:800,background:isA?colors.primary[100]:colors.neutral[200],color:isA?colors.primary[600]:colors.neutral[500],padding:'1px 6px',borderRadius:9999}}>{t.count}</span>}
          </button>
        );})}
      </div>
    );
  }
  if(variant==='underline'){
    return(
      <div style={{display:'flex',gap:0,borderBottom:`2px solid ${colors.neutral[200]}`}}>
        {tabs.map(t=>{ const isA=t.id===active; return(
          <button key={t.id} onClick={()=>!t.disabled&&onChange(t.id)} disabled={t.disabled}
            style={{display:'flex',alignItems:'center',gap:6,padding:'10px 16px 12px',border:'none',borderBottom:`3px solid ${isA?colors.primary[500]:'transparent'}`,marginBottom:-2,background:'transparent',cursor:t.disabled?'not-allowed':'pointer',fontWeight:700,fontSize:fs,color:isA?colors.primary[600]:colors.neutral[400],whiteSpace:'nowrap',opacity:t.disabled?0.4:1,transition:transition.fast}}>
            {t.icon&&<span style={{display:'flex',alignItems:'center'}}>{t.icon}</span>}
            {t.label}
            {t.count!==undefined&&<span style={{fontSize:fs-1,fontWeight:800,background:isA?colors.primary[50]:colors.neutral[100],color:isA?colors.primary[600]:colors.neutral[400],padding:'1px 6px',borderRadius:9999}}>{t.count}</span>}
          </button>
        );})}
      </div>
    );
  }
  return(
    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
      {tabs.map(t=>{ const isA=t.id===active; return(
        <button key={t.id} onClick={()=>!t.disabled&&onChange(t.id)} disabled={t.disabled}
          style={{display:'flex',alignItems:'center',gap:6,padding:ph,borderRadius:radius.lg,border:`1.5px solid ${isA?colors.primary[500]:colors.neutral[200]}`,background:isA?colors.primary[50]:'white',color:isA?colors.primary[700]:colors.neutral[500],fontWeight:700,fontSize:fs,cursor:t.disabled?'not-allowed':'pointer',whiteSpace:'nowrap',opacity:t.disabled?0.4:1,transition:transition.fast,boxShadow:isA?`0 0 0 1px ${colors.primary[500]}`:'none'}}>
          {t.icon&&<span style={{display:'flex',alignItems:'center'}}>{t.icon}</span>}
          {t.label}
          {t.count!==undefined&&<span style={{fontSize:fs-1,fontWeight:800,background:isA?colors.primary[500]:colors.neutral[100],color:isA?'white':colors.neutral[400],padding:'1px 6px',borderRadius:9999}}>{t.count}</span>}
        </button>
      );})}
    </div>
  );
}

/* ── FILTER CHIP ─────────────────────────────────────── */
const CC:Record<string,{bg:string;border:string;color:string;activeBg:string;activeText:string}>={
  indigo: {bg:colors.primary[50],   border:colors.primary[200], color:colors.primary[700],   activeBg:colors.primary[500],   activeText:'white'},
  teal:   {bg:colors.teal[50],      border:'#99f6e4',           color:colors.teal[600],      activeBg:colors.teal[500],      activeText:'white'},
  emerald:{bg:colors.success[50],   border:colors.success[200], color:colors.success[600],   activeBg:colors.success[500],   activeText:'white'},
  amber:  {bg:colors.warning[50],   border:colors.warning[200], color:colors.warning[600],   activeBg:colors.warning[500],   activeText:'white'},
  rose:   {bg:colors.danger[50],    border:colors.danger[200],  color:colors.danger[600],    activeBg:colors.danger[500],    activeText:'white'},
  slate:  {bg:colors.neutral[50],   border:colors.neutral[200], color:colors.neutral[600],   activeBg:colors.neutral[500],   activeText:'white'},
  sky:    {bg:colors.info[50],      border:'#bae6fd',           color:colors.info[600],      activeBg:colors.info[500],      activeText:'white'},
  violet: {bg:colors.secondary[50], border:'#ddd6fe',           color:colors.secondary[600], activeBg:colors.secondary[500], activeText:'white'},
};
export function FilterChip({label,count,active=false,onClick,onRemove,color='indigo'}:FilterChipProps){
  const c=CC[color]||CC.indigo;
  return(
    <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 10px',borderRadius:9999,border:`1.5px solid ${active?c.activeBg:c.border}`,background:active?c.activeBg:c.bg,color:active?c.activeText:c.color,fontWeight:700,fontSize:12,cursor:'pointer',transition:transition.fast,boxShadow:active?shadows.sm:'none'}}>
      {label}
      {count!==undefined&&<span style={{fontSize:11,fontWeight:800,background:active?'rgba(255,255,255,0.25)':c.border,color:active?c.activeText:c.color,padding:'1px 6px',borderRadius:9999,lineHeight:1.4}}>{count}</span>}
      {onRemove&&<span onClick={e=>{e.stopPropagation();onRemove();}} style={{width:14,height:14,borderRadius:'50%',background:'rgba(0,0,0,0.12)',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginLeft:2}}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg></span>}
    </button>
  );
}
