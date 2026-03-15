import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Printer, Check, Calendar, StickyNote, TrendingUp, TrendingDown } from 'lucide-react';
import { fmtVND, formatDate, makeVietQR, FINANCE_MONTHS, BANK_DEFAULT, toInputDate, localDateStr } from './helpers';
import { ModalWrap, ModalFooter, DS } from './UIComponents';
import { Button, IconButton, Input, Select, RadioGroup, FilterTabs } from './design-system/src';
import type { Student, Payment } from './types';

const FS_WRAP: React.CSSProperties = { position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:12,overflowY:'auto',background:'rgba(15,23,42,0.65)',backdropFilter:'blur(5px)' };
const FS_DLG: React.CSSProperties  = { background:'white',width:'100%',maxWidth:720,maxHeight:'94vh',borderRadius:12,display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(0,0,0,0.28)',overflow:'hidden' };

function SBox({ color, iconColor, icon:Icon, title, children }: { color:string; iconColor:string; icon:any; title:string; children:React.ReactNode }) {
  return (
    <div style={{ borderRadius:8,border:`1.5px solid ${color}33`,background:`${color}06` }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderBottom:`1.5px solid ${color}22`,background:`${color}0a`,borderRadius:'7px 7px 0 0' }}>
        <Icon size={13} color={iconColor}/>
        <span style={{ fontSize:10,fontWeight:700,color:iconColor,textTransform:'uppercase',letterSpacing:'0.1em' }}>{title}</span>
      </div>
      <div style={{ padding:'12px 14px',display:'flex',flexDirection:'column',gap:12 }}>{children}</div>
    </div>
  );
}

export function FABModal({
  open, onClose, students, isSaving, onSaveFee, onSaveExpense, baseTuition, editingPayment, editingExpense, initialTab,
}: {
  open:boolean; onClose:()=>void; students:Student[]; isSaving:boolean;
  onSaveFee:(f:any)=>Promise<void>; onSaveExpense:(f:any)=>Promise<void>;
  baseTuition:number; editingPayment?:Payment|null; editingExpense?:any|null; initialTab?:'income'|'expense';
}) {
  const today=localDateStr(), curMo=new Date().getMonth()+1, curYr=new Date().getFullYear();
  const [tab,setTab]=useState<'income'|'expense'>('income');
  const [fee,setFee]=useState<any>({});
  const [exp,setExp]=useState<any>({});

  useEffect(()=>{
    if(open){
      if(!editingPayment&&!editingExpense&&initialTab) setTab(initialTab);
      if(editingPayment){
        setTab('income');
        const parsedMo=(editingPayment as any).thangHP||(editingPayment.description?(()=>{ const d2=String(editingPayment.description||'').toLowerCase(); const mm=d2.match(/th[aá]ng\s*0?(\d{1,2})/)||d2.match(/\bt0?(\d{1,2})\b/i); if(mm){const v=parseInt(mm[1]);if(v>=1&&v<=12)return v;} return null; })():null)||curMo;
        setFee({maHS:editingPayment.studentId,nguoiNop:editingPayment.payer,soTien:editingPayment.amount,method:editingPayment.method,thangHP:parsedMo,namHP:(editingPayment as any).namHP||curYr,note:editingPayment.note||'',date:toInputDate(editingPayment.date),docNum:editingPayment.docNum});
      } else if(editingExpense){
        setTab('expense');
        setExp({description:editingExpense.description,amount:editingExpense.amount,category:editingExpense.category,spender:editingExpense.spender,date:toInputDate(editingExpense.date),docNum:editingExpense.docNum});
      } else {
        setFee({method:'Chuyển khoản',date:today,soTien:baseTuition,thangHP:curMo,namHP:curYr,note:''});
        setExp({date:today,category:'Vận hành'});
      }
    }
  },[open,baseTuition,editingPayment,editingExpense]);

  if(!open) return null;
  const uf=(k:string,v:any)=>setFee((p:any)=>({...p,[k]:v}));
  const ue=(k:string,v:any)=>setExp((p:any)=>({...p,[k]:v}));
  const isEditing=!!(editingPayment||editingExpense), isIncome=tab==='income';
  const accentColor=isIncome?'#059669':'#dc2626';
  const headerGrad=isIncome?'linear-gradient(135deg,#ecfdf5,#d1fae5)':'linear-gradient(135deg,#fef2f2,#fecaca)';
  const monthOptions=Array.from({length:12},(_,i)=>({value:String(i+1),label:`Tháng ${i+1}`}));
  const yearOptions=[curYr-1,curYr,curYr+1].map(y=>({value:String(y),label:String(y)}));
  const methodOptions=[{value:'Chuyển khoản',label:'Chuyển khoản'},{value:'Tiền mặt',label:'Tiền mặt'}];
  const categoryOptions=['Vận hành','In ấn','Trang thiết bị','Lương','Khác'].map(v=>({value:v,label:v}));

  return (
    <div style={FS_WRAP}>
      <div style={FS_DLG}>
        <div style={{ padding:'18px 24px',background:headerGrad,borderBottom:`1.5px solid ${accentColor}22`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:accentColor,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 12px ${accentColor}44` }}>
              {isIncome?<TrendingUp size={17} color="white"/>:<TrendingDown size={17} color="white"/>}
            </div>
            <div>
              <h3 style={{ fontSize:16,fontWeight:800,color:'#0f172a',margin:0 }}>{isEditing?(isIncome?'Sửa phiếu thu':'Sửa phiếu chi'):(isIncome?'Ghi phiếu thu':'Ghi phiếu chi')}</h3>
              <p style={{ fontSize:11,color:accentColor,fontWeight:600,margin:0 }}>{isIncome?'Thu học phí từ học sinh':'Ghi nhận chi phí vận hành'}</p>
            </div>
          </div>
          <IconButton icon={<X size={18}/>} label="Đóng" onClick={onClose}/>
        </div>
        {!isEditing&&<div style={{ padding:'12px 24px 0' }}>
          <FilterTabs variant="segment" active={tab} onChange={id=>setTab(id as any)} tabs={[{id:'income',label:'💰 Thu phí'},{id:'expense',label:'💸 Ghi chi'}]}/>
        </div>}
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:'14px 24px',display:'flex',flexDirection:'column',gap:12 }}>
          {isIncome&&(<>
            <SBox color="#059669" iconColor="#059669" icon={Calendar} title="Thông tin chứng từ">
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Input label="Ngày thu" type="date" value={fee.date||''} onChange={v=>uf('date',v)}/>
                <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Mã học sinh *</label>
                  <input value={fee.maHS||''} onChange={e=>{ const raw=e.target.value; const match=raw.match(/^([^\s-]+)\s*-/); uf('maHS',match?match[1].trim():raw); }} placeholder="HS001 hoặc chọn..." list="fab-hs-v27" autoComplete="off"
                    style={{ height:38,paddingLeft:12,paddingRight:12,fontSize:13,fontWeight:500,color:'#0f172a',background:'white',border:'1.5px solid #a7f3d0',borderRadius:8,outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const,width:'100%' }}
                    onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor='#a7f3d0'}/>
                  <datalist id="fab-hs-v27">{students.map(s=><option key={s.id} value={`${s.id} - ${s.name}`}/>)}</datalist>
                </div>
              </div>
              <Input label="Người nộp" value={fee.nguoiNop||''} onChange={v=>uf('nguoiNop',v)} placeholder="Tên phụ huynh hoặc học sinh..."/>
            </SBox>
            <SBox color="#f59e0b" iconColor="#d97706" icon={DollarSign} title="Số tiền & Học phí">
              <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                <label style={{ fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Số tiền (VNĐ) *</label>
                <div style={{ position:'relative' }}>
                  <input type="number" value={fee.soTien||''} onChange={e=>uf('soTien',e.target.value)} style={{ width:'100%',height:52,paddingLeft:40,paddingRight:12,fontSize:22,fontWeight:800,color:'#059669',background:'white',border:'1.5px solid #fde68a',borderRadius:8,outline:'none',textAlign:'right',boxSizing:'border-box' as const,fontFamily:'inherit' }} onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#fde68a'}/>
                  <span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:15,fontWeight:700,color:'#d97706' }}>₫</span>
                </div>
                {fee.soTien>0&&<p style={{ fontSize:12,color:'#d97706',fontWeight:600,margin:0 }}>= {fmtVND(Number(fee.soTien))}</p>}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,alignItems:'start' }}>
                <Select label="Hình thức" value={fee.method||'Chuyển khoản'} onChange={v=>uf('method',v)} options={methodOptions}/>
                <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Tháng học phí *</label>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 80px',gap:6 }}>
                    <Select value={String(fee.thangHP||curMo)} onChange={v=>uf('thangHP',Number(v))} options={monthOptions}/>
                    <Select value={String(fee.namHP||curYr)} onChange={v=>uf('namHP',Number(v))} options={yearOptions}/>
                  </div>
                  <p style={{ fontSize:11,color:'#d97706',fontWeight:600,margin:0,background:'#fffbeb',border:'1px solid #fde68a',borderRadius:6,padding:'4px 9px' }}>📋 HP tháng {fee.thangHP||curMo}/{fee.namHP||curYr}</p>
                </div>
              </div>
            </SBox>
            <SBox color="#6366f1" iconColor="#6366f1" icon={StickyNote} title="Ghi chú">
              <textarea value={fee.note||''} onChange={e=>uf('note',e.target.value)} rows={2} placeholder="Đóng trễ, đóng thiếu..." style={{ width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #c7d2fe',fontSize:13,fontWeight:500,color:'#0f172a',outline:'none',background:'white',resize:'vertical',fontFamily:'inherit',boxSizing:'border-box' as const }} onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#c7d2fe'}/>
            </SBox>
          </>)}
          {!isIncome&&(<>
            <SBox color="#dc2626" iconColor="#dc2626" icon={Calendar} title="Thông tin chứng từ">
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Input label="Ngày chi" type="date" value={exp.date||''} onChange={v=>ue('date',v)}/>
                <Input label="Người chi" value={exp.spender||''} onChange={v=>ue('spender',v)} placeholder="Ai chi?"/>
              </div>
              <RadioGroup label="Hạng mục" value={exp.category||''} onChange={v=>ue('category',v)} direction="horizontal" options={categoryOptions}/>
            </SBox>
            <SBox color="#f97316" iconColor="#ea580c" icon={DollarSign} title="Số tiền">
              <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                <label style={{ fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Số tiền (VNĐ) *</label>
                <div style={{ position:'relative' }}>
                  <input type="number" value={exp.amount||''} onChange={e=>ue('amount',e.target.value)} style={{ width:'100%',height:52,paddingLeft:40,paddingRight:12,fontSize:22,fontWeight:800,color:'#dc2626',background:'white',border:'1.5px solid #fed7aa',borderRadius:8,outline:'none',textAlign:'right',boxSizing:'border-box' as const,fontFamily:'inherit' }} onFocus={e=>e.target.style.borderColor='#f97316'} onBlur={e=>e.target.style.borderColor='#fed7aa'}/>
                  <span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:15,fontWeight:700,color:'#ea580c' }}>₫</span>
                </div>
                {exp.amount>0&&<p style={{ fontSize:12,color:'#ea580c',fontWeight:600,margin:0 }}>= {fmtVND(Number(exp.amount))}</p>}
              </div>
              <Input label="Lý do *" value={exp.description||''} onChange={v=>ue('description',v)} placeholder="Mua bút, in đề, văn phòng phẩm..."/>
            </SBox>
          </>)}
        </div>
        <div style={{ padding:'14px 24px',borderTop:'1px solid #f1f5f9',display:'flex',justifyContent:'flex-end',gap:10,flexShrink:0 }}>
          <Button variant="outline" intent="neutral" onClick={onClose}>Hủy</Button>
          {isIncome
            ? <Button intent="success" loading={isSaving} icon={<Save size={14}/>} onClick={()=>onSaveFee(fee)} style={{ boxShadow:'0 4px 14px rgba(5,150,105,0.4)' }}>{isEditing?'Cập nhật thu':'✓ Ghi sổ thu'}</Button>
            : <Button intent="danger"  loading={isSaving} icon={<Save size={14}/>} onClick={()=>onSaveExpense(exp)} style={{ boxShadow:'0 4px 14px rgba(220,38,38,0.4)' }}>{isEditing?'Cập nhật chi':'✓ Ghi sổ chi'}</Button>
          }
        </div>
      </div>
    </div>
  );
}

export function InvoiceModal({ payment, onClose, centerName, bankId, accountNo, accountName }: {
  payment:Payment; onClose:()=>void; centerName:string; bankId:string; accountNo:string; accountName:string;
}) {
  const r=payment;
  const qrUrl=accountNo&&accountNo!==BANK_DEFAULT.accountNo?makeVietQR(bankId,accountNo,r.amount,r.docNum,accountName):null;
  const rows=[{l:'Ngày thu',v:formatDate(r.date)},{l:'Học sinh',v:String(r.studentName||'').toUpperCase()},{l:'Người nộp',v:r.payer||'---'},{l:'Hình thức',v:r.method||'---'},{l:'Nội dung',v:r.description||'---'}];
  return (
    <div style={FS_WRAP}>
      <div style={{ position:'absolute',inset:0 }} onClick={onClose}/>
      <div style={{ position:'relative',background:'white',width:'100%',maxWidth:380,borderRadius:12,boxShadow:'0 8px 40px rgba(0,0,0,0.2)',overflow:'hidden' }} id="inv">
        <div style={{ background:'linear-gradient(135deg,#f97316,#ea580c)',padding:'18px 22px',borderRadius:'12px 12px 0 0',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:4 }}><div style={{ width:26,height:26,borderRadius:7,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}><DollarSign size={14} color="white"/></div><span style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.85)',textTransform:'uppercase',letterSpacing:'0.1em' }}>Phiếu thu học phí</span></div>
            <p style={{ fontSize:14,fontWeight:800,color:'white',margin:0 }}>{centerName}</p>
          </div>
          <div style={{ textAlign:'right' }}><p style={{ fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',margin:'0 0 2px' }}>Số CT</p><p style={{ fontSize:13,fontWeight:800,color:'white',margin:0 }}>{r.docNum}</p></div>
        </div>
        <div style={{ padding:'16px 22px' }}>
          {rows.map((item,i)=>(
            <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'8px 0',borderBottom:'1px solid #f1f5f9',gap:14 }}>
              <span style={{ fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.07em',flexShrink:0 }}>{item.l}</span>
              <span style={{ fontSize:13,fontWeight:600,color:'#0f172a',textAlign:'right',maxWidth:200 }}>{item.v}</span>
            </div>
          ))}
          {r.note&&<div style={{ display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',gap:14 }}><span style={{ fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.07em' }}>Ghi chú</span><span style={{ fontSize:13,color:'#64748b',fontStyle:'italic',textAlign:'right' }}>{r.note}</span></div>}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12,padding:'11px 14px',borderRadius:8,background:'linear-gradient(135deg,#fff7ed,#fffbeb)',border:'1.5px solid #fed7aa' }}>
            <span style={{ fontSize:12,fontWeight:700,color:'#374151',textTransform:'uppercase' }}>Số tiền thu</span>
            <span style={{ fontSize:20,fontWeight:800,color:'#ea580c' }}>{fmtVND(r.amount)}</span>
          </div>
        </div>
        {qrUrl&&<div style={{ padding:'0 22px 14px',textAlign:'center' }}><div style={{ borderTop:'1px solid #f1f5f9',paddingTop:12 }}><p style={{ fontSize:9,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8 }}>Quét để chuyển khoản</p><img src={qrUrl} alt="VietQR" style={{ width:140,height:140,margin:'0 auto',display:'block',borderRadius:8,border:'1px solid #e2e8f0' }}/><p style={{ fontSize:11,color:'#64748b',marginTop:6 }}>{bankId} · {accountNo}</p><p style={{ fontSize:12,fontWeight:700,color:'#0f172a',margin:'2px 0 0' }}>{accountName}</p></div></div>}
        <div style={{ padding:'0 22px 18px',display:'flex',flexDirection:'column',gap:7 }} className="print:hidden">
          <Button intent="warning" fullWidth icon={<Printer size={14}/>} onClick={()=>window.print()} style={{ background:'#ea580c' }}>In / Xuất PDF</Button>
          <button onClick={onClose} style={{ width:'100%',padding:8,background:'none',border:'none',color:'#94a3b8',fontSize:13,fontWeight:600,cursor:'pointer' }}>Đóng lại</button>
        </div>
      </div>
    </div>
  );
}

export function FinanceDetailModal({ student, payments, onClose, isPaid }: {
  student:Student; payments:Payment[]; onClose:()=>void; isPaid:(sid:string,mo:number,yr:number)=>boolean;
}) {
  const s=student, sPayments=payments.filter(p=>p.studentId===s.id);
  return (
    <div style={FS_WRAP}>
      <div style={{ ...FS_DLG, maxWidth:560 }}>
        <div style={{ background:'linear-gradient(135deg,#0f172a,#1e293b)',padding:'16px 22px',borderRadius:'12px 12px 0 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><DollarSign size={18} color="rgba(255,255,255,0.7)"/></div>
            <div><h3 style={{ fontSize:14,fontWeight:800,color:'white',margin:0 }}>{s.name}</h3><p style={{ fontSize:12,color:'rgba(255,255,255,0.6)',margin:'1px 0 0' }}>{s.id} · Lớp {s.classId}</p></div>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={14} color="white"/></button>
        </div>
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:'16px 22px' }}>
          <div>
            <p style={{ fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8 }}>Lịch đóng học phí</p>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(50px,1fr))',gap:5 }}>
              {FINANCE_MONTHS.map(fm=>{ const paid=isPaid(s.id,fm.m,fm.y); return (
                <div key={fm.label} style={{ borderRadius:7,padding:'7px 4px',textAlign:'center',background:paid?'#ecfdf5':'#f8fafc',border:paid?'1.5px solid #a7f3d0':'1.5px solid #e2e8f0' }}>
                  <p style={{ fontSize:10,fontWeight:700,color:paid?'#059669':'#94a3b8',margin:'0 0 2px' }}>{fm.label}</p>
                  {paid?<div style={{ width:14,height:14,borderRadius:'50%',background:'#059669',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto' }}><Check size={8} color="white"/></div>:<div style={{ width:14,height:14,borderRadius:'50%',background:'#e2e8f0',margin:'0 auto' }}/>}
                </div>
              );})}
            </div>
          </div>
          <div style={{ marginTop:14,border:'1.5px solid #e2e8f0',overflow:'hidden',borderRadius:8 }}>
            <div style={{ padding:'8px 14px',background:'#f8fafc',borderBottom:'1.5px solid #e2e8f0' }}><p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>💳 Lịch sử ({sPayments.length} giao dịch)</p></div>
            <div style={{ maxHeight:200,overflowY:'auto' }}>
              {sPayments.length===0?<p style={{ padding:20,textAlign:'center',color:'#94a3b8',fontStyle:'italic',fontSize:13 }}>Chưa có giao dịch</p>
                :sPayments.map((p,i)=>(
                <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 14px',borderBottom:'1px solid #f1f5f9',background:i%2===0?'white':'#fafafa' }}>
                  <div><p style={{ fontSize:12,fontWeight:600,color:'#0f172a',margin:0 }}>{formatDate(p.date)}</p><p style={{ fontSize:11,color:'#94a3b8',margin:'1px 0 0',fontStyle:'italic' }}>{p.description}</p></div>
                  <span style={{ fontSize:13,fontWeight:800,color:'#059669',background:'#ecfdf5',padding:'3px 9px',borderRadius:7,border:'1px solid #a7f3d0' }}>+{fmtVND(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding:'14px 22px',borderTop:'1px solid #f1f5f9',flexShrink:0 }}><Button variant="outline" intent="neutral" fullWidth onClick={onClose}>Đóng</Button></div>
      </div>
    </div>
  );
}
