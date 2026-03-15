/**
 * components/form/index.tsx
 * Button · IconButton · Input · Select · RadioGroup · SearchBar
 *
 * Usage: import { Button, Input, Select, RadioGroup, SearchBar, IconButton } from '../../design-system/src';
 */
import React, { useState } from 'react';
import type { ButtonProps, IconButtonProps, InputProps, SelectProps, RadioGroupProps, SearchBarProps } from '../../types';
import { colors, typography, radius, shadows, transition } from '../../styles/theme';

/* ── BUTTON ────────────────────────────────────────────── */
const BTN_SIZE = {
  xs:{height:28,px:10,fontSize:11,gap:4,iconSize:12,radius:radius.sm},
  sm:{height:32,px:12,fontSize:12,gap:5,iconSize:14,radius:radius.sm},
  md:{height:38,px:16,fontSize:13,gap:6,iconSize:15,radius:radius.md},
  lg:{height:44,px:20,fontSize:14,gap:7,iconSize:16,radius:radius.lg},
  xl:{height:52,px:24,fontSize:15,gap:8,iconSize:18,radius:radius.lg},
};
const BTN_INTENT = {
  primary:  {solid:colors.primary[500],  hover:colors.primary[600],   text:colors.primary[600],   border:colors.primary[200],   light:colors.primary[50],   shadow:shadows.primary},
  secondary:{solid:colors.secondary[500],hover:colors.secondary[600], text:colors.secondary[600], border:'#ddd6fe',              light:colors.secondary[50], shadow:'0 8px 24px rgba(139,92,246,0.35)'},
  success:  {solid:colors.success[500],  hover:colors.success[600],   text:colors.success[600],   border:colors.success[200],   light:colors.success[50],   shadow:shadows.success},
  warning:  {solid:colors.warning[500],  hover:colors.warning[600],   text:colors.warning[600],   border:colors.warning[200],   light:colors.warning[50],   shadow:shadows.warning},
  danger:   {solid:colors.danger[500],   hover:colors.danger[600],    text:colors.danger[600],    border:colors.danger[200],    light:colors.danger[50],    shadow:shadows.danger },
  neutral:  {solid:colors.neutral[700],  hover:colors.neutral[800],   text:colors.neutral[600],   border:colors.neutral[200],   light:colors.neutral[50],   shadow:shadows.md     },
};

function Spinner({size=14}:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{animation:'ds-spin 0.8s linear infinite'}}>
      <style>{`@keyframes ds-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

export function Button({
  children, intent='primary', variant='solid', size='md',
  icon, iconPosition='left', loading=false, disabled=false,
  fullWidth=false, onClick, type='button', style,
}: ButtonProps) {
  const [hov,setHov]=useState(false);
  const s=BTN_SIZE[size]; const c=BTN_INTENT[intent];
  const isDisabled=disabled||loading;
  const getStyle=():React.CSSProperties=>{
    const base:React.CSSProperties={display:'inline-flex',alignItems:'center',justifyContent:'center',gap:s.gap,height:s.height,paddingLeft:s.px,paddingRight:s.px,fontSize:s.fontSize,fontWeight:700,fontFamily:typography.fontFamily,borderRadius:s.radius,border:'none',cursor:isDisabled?'not-allowed':'pointer',transition:transition.normal,userSelect:'none',width:fullWidth?'100%':undefined,opacity:isDisabled?0.5:1,whiteSpace:'nowrap'};
    if(variant==='solid')   return{...base,background:hov&&!isDisabled?c.hover:c.solid,color:'white',boxShadow:hov&&!isDisabled?c.shadow:shadows.sm,transform:hov&&!isDisabled?'translateY(-1px)':'none'};
    if(variant==='outline') return{...base,background:hov&&!isDisabled?c.light:'transparent',color:c.text,border:`1.5px solid ${hov&&!isDisabled?c.solid:c.border}`};
    if(variant==='ghost')   return{...base,background:hov&&!isDisabled?c.light:'transparent',color:c.text};
    return{...base,background:'transparent',color:c.text,padding:0,height:'auto'};
  };
  return (
    <button type={type} onClick={isDisabled?undefined:onClick} disabled={isDisabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{...getStyle(),...style}}>
      {loading&&<Spinner size={s.iconSize}/>}
      {!loading&&icon&&iconPosition==='left'&&<span style={{display:'flex',alignItems:'center'}}>{icon}</span>}
      {children}
      {!loading&&icon&&iconPosition==='right'&&<span style={{display:'flex',alignItems:'center'}}>{icon}</span>}
    </button>
  );
}

/* ── ICON BUTTON ─────────────────────────────────────── */
const IB_SIZE={xs:28,sm:32,md:36,lg:40,xl:46};
const IB_INTENT:Record<string,{bg:string;hover:string;color:string}>={
  default:{bg:colors.neutral[100],hover:colors.neutral[200],color:colors.neutral[600]},
  primary:{bg:colors.primary[50], hover:colors.primary[100],color:colors.primary[600]},
  warning:{bg:colors.warning[50], hover:colors.warning[200],color:colors.warning[600]},
  danger: {bg:colors.danger[50],  hover:colors.danger[200], color:colors.danger[600] },
  success:{bg:colors.success[50], hover:colors.success[200],color:colors.success[600]},
};
export function IconButton({icon,label,intent='default',size='md',onClick,disabled,tooltip,style}:IconButtonProps){
  const [hov,setHov]=useState(false),[showTip,setShowTip]=useState(false);
  const sz=IB_SIZE[size]; const c=IB_INTENT[intent]||IB_INTENT.default;
  return(
    <div style={{position:'relative',display:'inline-flex'}}>
      <button onClick={disabled?undefined:onClick} disabled={disabled} aria-label={label}
        onMouseEnter={()=>{setHov(true);setShowTip(true);}} onMouseLeave={()=>{setHov(false);setShowTip(false);}}
        style={{width:sz,height:sz,borderRadius:radius.md,background:hov?c.hover:c.bg,border:'none',cursor:disabled?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:c.color,transition:transition.fast,opacity:disabled?0.4:1,transform:hov?'scale(1.06)':'scale(1)',...style}}>
        {icon}
      </button>
      {tooltip&&showTip&&<div style={{position:'absolute',bottom:'calc(100% + 6px)',left:'50%',transform:'translateX(-50%)',background:colors.neutral[900],color:'white',fontSize:11,fontWeight:700,padding:'4px 8px',borderRadius:6,whiteSpace:'nowrap',pointerEvents:'none',zIndex:99}}>{tooltip}</div>}
    </div>
  );
}

/* ── INPUT ───────────────────────────────────────────── */
const INP_SIZE={sm:{height:32,px:10,fs:12},md:{height:38,px:12,fs:13},lg:{height:44,px:14,fs:14}};
export function Input({label,placeholder,value,onChange,type='text',error,hint,disabled,required,prefix,suffix,clearable=false,size='md',style}:InputProps){
  const [focus,setFocus]=useState(false); const s=INP_SIZE[size]; const hasError=!!error;
  const borderColor=hasError?colors.danger[500]:focus?colors.primary[500]:colors.neutral[200];
  return(
    <div style={{display:'flex',flexDirection:'column',gap:4,...style}}>
      {label&&<label style={{fontSize:11,fontWeight:700,color:colors.neutral[500],textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}{required&&<span style={{color:colors.danger[500],marginLeft:2}}>*</span>}</label>}
      <div style={{position:'relative',display:'flex',alignItems:'center'}}>
        {prefix&&<span style={{position:'absolute',left:s.px,color:colors.neutral[400],display:'flex',alignItems:'center',pointerEvents:'none'}}>{prefix}</span>}
        <input type={type} value={value} disabled={disabled} placeholder={placeholder} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          style={{width:'100%',height:s.height,paddingLeft:prefix?`calc(${s.px}px + 20px)`:s.px,paddingRight:(suffix||clearable)?`calc(${s.px}px + 24px)`:s.px,fontSize:s.fs,fontWeight:500,fontFamily:typography.fontFamily,color:colors.neutral[900],background:disabled?colors.neutral[50]:'white',border:`1.5px solid ${borderColor}`,borderRadius:radius.md,outline:'none',boxShadow:focus?`0 0 0 3px ${hasError?colors.danger[50]:colors.primary[50]}`:'none',transition:transition.fast,cursor:disabled?'not-allowed':undefined}}/>
        {clearable&&value&&<button onClick={()=>onChange('')} style={{position:'absolute',right:s.px,background:'none',border:'none',cursor:'pointer',color:colors.neutral[400],display:'flex',alignItems:'center',padding:2}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg></button>}
        {suffix&&!clearable&&<span style={{position:'absolute',right:s.px,color:colors.neutral[400],display:'flex',alignItems:'center',pointerEvents:'none'}}>{suffix}</span>}
      </div>
      {(error||hint)&&<p style={{fontSize:11,fontWeight:600,color:error?colors.danger[600]:colors.neutral[400],margin:0}}>{error||hint}</p>}
    </div>
  );
}

/* ── SELECT ──────────────────────────────────────────── */
export function Select({label,value,onChange,options,placeholder,error,disabled,size='md',style}:SelectProps){
  const [focus,setFocus]=useState(false); const s=INP_SIZE[size];
  return(
    <div style={{display:'flex',flexDirection:'column',gap:4,...style}}>
      {label&&<label style={{fontSize:11,fontWeight:700,color:colors.neutral[500],textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</label>}
      <div style={{position:'relative'}}>
        <select value={value} disabled={disabled} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          style={{width:'100%',height:s.height,paddingLeft:s.px,paddingRight:32,fontSize:s.fs,fontWeight:600,fontFamily:typography.fontFamily,color:value?colors.neutral[900]:colors.neutral[400],background:disabled?colors.neutral[50]:'white',border:`1.5px solid ${error?colors.danger[500]:focus?colors.primary[500]:colors.neutral[200]}`,borderRadius:radius.md,outline:'none',cursor:disabled?'not-allowed':'pointer',appearance:'none',WebkitAppearance:'none',boxShadow:focus?`0 0 0 3px ${colors.primary[50]}`:'none',transition:transition.fast}}>
          {placeholder&&<option value="" disabled>{placeholder}</option>}
          {options.map(o=><option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.neutral[400]} strokeWidth="2.5" style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {error&&<p style={{fontSize:11,fontWeight:600,color:colors.danger[600],margin:0}}>{error}</p>}
    </div>
  );
}

/* ── RADIO GROUP ─────────────────────────────────────── */
export function RadioGroup({label,value,onChange,options,direction='horizontal',error}:RadioGroupProps){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      {label&&<label style={{fontSize:11,fontWeight:700,color:colors.neutral[500],textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</label>}
      <div style={{display:'flex',flexDirection:direction==='vertical'?'column':'row',flexWrap:'wrap',gap:direction==='horizontal'?6:4}}>
        {options.map(o=>{
          const active=value===o.value;
          return(
            <button key={o.value} type="button" onClick={()=>!o.disabled&&onChange(o.value)} disabled={o.disabled}
              style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:radius.md,border:`1.5px solid ${active?colors.primary[500]:colors.neutral[200]}`,background:active?colors.primary[50]:'white',cursor:o.disabled?'not-allowed':'pointer',transition:transition.fast,opacity:o.disabled?0.5:1,textAlign:'left'}}>
              <div style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${active?colors.primary[500]:colors.neutral[300]}`,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {active&&<div style={{width:8,height:8,borderRadius:'50%',background:colors.primary[500]}}/>}
              </div>
              <div>
                <span style={{fontSize:13,fontWeight:active?700:500,color:active?colors.primary[700]:colors.neutral[700]}}>{o.label}</span>
                {o.description&&<p style={{fontSize:11,color:colors.neutral[400],margin:0}}>{o.description}</p>}
              </div>
            </button>
          );
        })}
      </div>
      {error&&<p style={{fontSize:11,fontWeight:600,color:colors.danger[600],margin:0}}>{error}</p>}
    </div>
  );
}

/* ── SEARCH BAR ──────────────────────────────────────── */
const SB_SIZE={sm:{h:32,px:10,fs:12,icon:13},md:{h:38,px:12,fs:13,icon:14}};
export function SearchBar({value,onChange,placeholder='Tìm kiếm...',onClear,width,size='md',style}:SearchBarProps){
  const [focus,setFocus]=useState(false); const s=SB_SIZE[size];
  return(
    <div style={{position:'relative',display:'flex',alignItems:'center',width,...style}}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none" stroke={focus?colors.primary[500]:colors.neutral[400]} strokeWidth="2.5" style={{position:'absolute',left:s.px,pointerEvents:'none',transition:transition.fast}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
        style={{width:'100%',height:s.h,paddingLeft:s.px+s.icon+4,paddingRight:value?32:s.px,fontSize:s.fs,fontWeight:600,fontFamily:typography.fontFamily,color:colors.neutral[900],background:'white',border:`1.5px solid ${focus?colors.primary[500]:colors.neutral[200]}`,borderRadius:radius.md,outline:'none',transition:transition.fast,boxShadow:focus?`0 0 0 3px ${colors.primary[50]}`:'0 1px 3px rgba(0,0,0,0.06)'}}/>
      {value&&<button onClick={()=>{onChange('');onClear?.();}} style={{position:'absolute',right:s.px,background:'none',border:'none',cursor:'pointer',color:colors.neutral[400],display:'flex',alignItems:'center',padding:2,borderRadius:4}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg></button>}
    </div>
  );
}
