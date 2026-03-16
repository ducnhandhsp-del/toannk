import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, DollarSign, Printer, Check, Calendar, StickyNote, TrendingUp, TrendingDown } from 'lucide-react';
import { fmtVND, formatDate, makeVietQR, BANK_DEFAULT, toInputDate, localDateStr } from './helpers';
import { ModalWrap, DS } from './UIComponents';
import { Button, IconButton, Input, Select, RadioGroup, FilterTabs } from './dsComponents';
import type { Student, Payment } from './types';

const FS_WRAP: React.CSSProperties = { position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center',background:'rgba(15,23,42,0.65)',backdropFilter:'blur(5px)' };
const FS_DLG: React.CSSProperties  = { background:'white',width:'100%',maxWidth:780,maxHeight:'94dvh',borderRadius:'14px 14px 0 0',display:'flex',flexDirection:'column',boxShadow:'0 -8px 40px rgba(0,0,0,0.28)',overflow:'hidden' };
// Desktop: center dialog
const FS_WRAP_DT: React.CSSProperties = { position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:12,overflowY:'auto',background:'rgba(15,23,42,0.65)',backdropFilter:'blur(5px)' };
const FS_DLG_DT: React.CSSProperties  = { background:'white',width:'100%',maxWidth:780,maxHeight:'94vh',borderRadius:14,display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(0,0,0,0.28)',overflow:'hidden' };

function SBox({ color, iconColor, icon:Icon, title, children }: { color:string; iconColor:string; icon:any; title:string; children:React.ReactNode }) {
  return (
    <div style={{ borderRadius:10,border:`1.5px solid ${color}33`,background:`${color}06` }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 16px',borderBottom:`1.5px solid ${color}22`,background:`${color}0a`,borderRadius:'9px 9px 0 0' }}>
        <Icon size={14} color={iconColor}/>
        <span style={{ fontSize:11,fontWeight:700,color:iconColor,textTransform:'uppercase',letterSpacing:'0.1em' }}>{title}</span>
      </div>
      <div style={{ padding:'14px 16px',display:'flex',flexDirection:'column',gap:14 }}>{children}</div>
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
  const monthOptions=Array.from({length:12},(_,i)=>({value:String(i+1),label:`Tháng ${i+1}/${fee.namHP||curYr}`}));
  const yearOptions=[curYr-1,curYr,curYr+1].map(y=>({value:String(y),label:String(y)}));
  const methodOptions=[{value:'Chuyển khoản',label:'Chuyển khoản'},{value:'Tiền mặt',label:'Tiền mặt'}];
  const categoryOptions=['Vận hành','In ấn','Trang thiết bị','Lương','Khác'].map(v=>({value:v,label:v}));
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const wrapStyle = isMobile ? FS_WRAP : FS_WRAP_DT;
  const dlgStyle  = isMobile ? FS_DLG  : FS_DLG_DT;

  return (
    <div style={wrapStyle}>
      <div style={dlgStyle}>
        <div style={{ padding:'16px 20px',background:headerGrad,borderBottom:`1.5px solid ${accentColor}22`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:14 }}>
            <div style={{ width:44,height:44,borderRadius:12,background:accentColor,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px ${accentColor}44` }}>
              {isIncome?<TrendingUp size={20} color="white"/>:<TrendingDown size={20} color="white"/>}
            </div>
            <div>
              <h3 style={{ fontSize:18,fontWeight:800,color:'#0f172a',margin:0 }}>{isEditing?(isIncome?'Sửa phiếu thu':'Sửa phiếu chi'):(isIncome?'Ghi phiếu thu':'Ghi phiếu chi')}</h3>
              <p style={{ fontSize:13,color:accentColor,fontWeight:600,margin:0 }}>{isIncome?'Thu học phí từ học sinh':'Ghi nhận chi phí vận hành'}</p>
            </div>
          </div>
          <IconButton icon={<X size={18}/>} label="Đóng" onClick={onClose}/>
        </div>

        {!isEditing&&<div style={{ padding:'14px 28px 0' }}>
          <FilterTabs variant="segment" active={tab} onChange={id=>setTab(id as any)} tabs={[{id:'income',label:'💰 Thu phí'},{id:'expense',label:'💸 Ghi chi'}]}/>
        </div>}

        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:'14px 20px',display:'flex',flexDirection:'column',gap:12 }}>
          {isIncome&&(<>
            <SBox color="#059669" iconColor="#059669" icon={Calendar} title="Thông tin chứng từ">
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Input label="Ngày thu" type="date" value={fee.date||''} onChange={v=>uf('date',v)} size="lg"/>
                <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                  <label style={{ fontSize:12,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Mã học sinh *</label>
                  <input value={fee.maHS||''} onChange={e=>{ const raw=e.target.value; const match=raw.match(/^([^\s-]+)\s*-/); uf('maHS',match?match[1].trim():raw); }} placeholder="HS001 hoặc chọn..." list="fab-hs-v27" autoComplete="off"
                    style={{ height:44,paddingLeft:14,paddingRight:14,fontSize:15,fontWeight:500,color:'#0f172a',background:'white',border:'1.5px solid #a7f3d0',borderRadius:10,outline:'none',fontFamily:'inherit',boxSizing:'border-box',width:'100%' }}
                    onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor='#a7f3d0'}/>
                  <datalist id="fab-hs-v27">{students.map(s=><option key={s.id} value={`${s.id} - ${s.name}`}/>)}</datalist>
                </div>
              </div>
              <Input label="Người nộp" value={fee.nguoiNop||''} onChange={v=>uf('nguoiNop',v)} placeholder="Tên phụ huynh hoặc học sinh..." size="lg"/>
            </SBox>

            <SBox color="#f59e0b" iconColor="#d97706" icon={DollarSign} title="Số tiền & Học phí">
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                <label style={{ fontSize:12,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Số tiền (VNĐ) *</label>
                <div style={{ position:'relative' }}>
                  <input type="number" value={fee.soTien||''} onChange={e=>uf('soTien',e.target.value)}
                    style={{ width:'100%',height:56,paddingLeft:44,paddingRight:14,fontSize:24,fontWeight:800,color:'#059669',background:'white',border:'1.5px solid #fde68a',borderRadius:10,outline:'none',textAlign:'right',boxSizing:'border-box',fontFamily:'inherit' }}
                    onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#fde68a'}/>
                  <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:18,fontWeight:700,color:'#d97706' }}>₫</span>
                  {fee.soTien>0&&<span style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',fontSize:13,color:'#d97706',fontWeight:700,pointerEvents:'none' }}>{fmtVND(Number(fee.soTien))}</span>}
                </div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,alignItems:'start' }}>
                <Select label="Hình thức thu" value={fee.method||'Chuyển khoản'} onChange={v=>uf('method',v)} options={methodOptions} size="lg"/>
                <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                  <label style={{ fontSize:12,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Tháng học phí *</label>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 80px',gap:8 }}>
                    <Select value={String(fee.thangHP||curMo)} onChange={v=>uf('thangHP',Number(v))} options={Array.from({length:12},(_,i)=>({value:String(i+1),label:`Tháng ${i+1}`}))} size="lg"/>
                    <Select value={String(fee.namHP||curYr)} onChange={v=>uf('namHP',Number(v))} options={yearOptions} size="lg"/>
                  </div>
                </div>
              </div>
            </SBox>

            <SBox color="#6366f1" iconColor="#6366f1" icon={StickyNote} title="Ghi chú">
              <textarea value={fee.note||''} onChange={e=>uf('note',e.target.value)} rows={2} placeholder="Đóng trễ, đóng thiếu..."
                style={{ width:'100%',padding:'12px 14px',borderRadius:10,border:'1.5px solid #c7d2fe',fontSize:14,fontWeight:500,color:'#0f172a',outline:'none',background:'white',resize:'vertical',fontFamily:'inherit',boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#c7d2fe'}/>
            </SBox>
          </>)}

          {!isIncome&&(<>
            <SBox color="#dc2626" iconColor="#dc2626" icon={Calendar} title="Thông tin chứng từ">
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Input label="Ngày chi" type="date" value={exp.date||''} onChange={v=>ue('date',v)} size="lg"/>
                <Input label="Người chi" value={exp.spender||''} onChange={v=>ue('spender',v)} placeholder="Ai chi?" size="lg"/>
              </div>
              <RadioGroup label="Hạng mục" value={exp.category||''} onChange={v=>ue('category',v)} direction="horizontal" options={categoryOptions}/>
            </SBox>

            <SBox color="#f97316" iconColor="#ea580c" icon={DollarSign} title="Số tiền">
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                <label style={{ fontSize:12,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Số tiền (VNĐ) *</label>
                <div style={{ position:'relative' }}>
                  <input type="number" value={exp.amount||''} onChange={e=>ue('amount',e.target.value)}
                    style={{ width:'100%',height:56,paddingLeft:44,paddingRight:14,fontSize:24,fontWeight:800,color:'#dc2626',background:'white',border:'1.5px solid #fed7aa',borderRadius:10,outline:'none',textAlign:'right',boxSizing:'border-box',fontFamily:'inherit' }}
                    onFocus={e=>e.target.style.borderColor='#f97316'} onBlur={e=>e.target.style.borderColor='#fed7aa'}/>
                  <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:18,fontWeight:700,color:'#ea580c' }}>₫</span>
                  {exp.amount>0&&<span style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',fontSize:13,color:'#ea580c',fontWeight:700,pointerEvents:'none' }}>{fmtVND(Number(exp.amount))}</span>}
                </div>
              </div>
              <Input label="Lý do *" value={exp.description||''} onChange={v=>ue('description',v)} placeholder="Mua bút, in đề, văn phòng phẩm..." size="lg"/>
            </SBox>
          </>)}
        </div>

        <div style={{ padding:'14px 20px',borderTop:'1px solid #f1f5f9',display:'flex',justifyContent:'flex-end',gap:10,flexShrink:0,flexWrap:'wrap' }}>
          <Button variant="outline" intent="neutral" size="lg" onClick={onClose} style={{ minWidth:100 }}>Hủy</Button>
          {isIncome
            ? <Button intent="success" size="lg" loading={isSaving} icon={<Save size={16}/>} onClick={()=>onSaveFee(fee)} style={{ boxShadow:'0 4px 14px rgba(5,150,105,0.4)',flex:1,maxWidth:220 }}>{isEditing?'Cập nhật thu':'✓ Ghi sổ thu'}</Button>
            : <Button intent="danger"  size="lg" loading={isSaving} icon={<Save size={16}/>} onClick={()=>onSaveExpense(exp)} style={{ boxShadow:'0 4px 14px rgba(220,38,38,0.4)',flex:1,maxWidth:220 }}>{isEditing?'Cập nhật chi':'✓ Ghi sổ chi'}</Button>
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
      <div style={{ position:'relative',background:'white',width:'100%',maxWidth:400,borderRadius:14,boxShadow:'0 8px 40px rgba(0,0,0,0.2)',overflow:'hidden' }} id="inv">
        <div style={{ background:'linear-gradient(135deg,#f97316,#ea580c)',padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5 }}>
              <div style={{ width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}><DollarSign size={15} color="white"/></div>
              <span style={{ fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.85)',textTransform:'uppercase',letterSpacing:'0.1em' }}>Phiếu thu học phí</span>
            </div>
            <p style={{ fontSize:16,fontWeight:800,color:'white',margin:0 }}>{centerName}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',margin:'0 0 2px' }}>Số CT</p>
            <p style={{ fontSize:14,fontWeight:800,color:'white',margin:0 }}>{r.docNum}</p>
          </div>
        </div>
        <div style={{ padding:'18px 24px' }}>
          {rows.map((item,i)=>(
            <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'9px 0',borderBottom:'1px solid #f1f5f9',gap:14 }}>
              <span style={{ fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.07em',flexShrink:0 }}>{item.l}</span>
              <span style={{ fontSize:14,fontWeight:600,color:'#0f172a',textAlign:'right',maxWidth:220 }}>{item.v}</span>
            </div>
          ))}
          {r.note&&<div style={{ display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #f1f5f9',gap:14 }}><span style={{ fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.07em' }}>Ghi chú</span><span style={{ fontSize:14,color:'#64748b',fontStyle:'italic',textAlign:'right' }}>{r.note}</span></div>}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:14,padding:'13px 16px',borderRadius:10,background:'linear-gradient(135deg,#fff7ed,#fffbeb)',border:'1.5px solid #fed7aa' }}>
            <span style={{ fontSize:13,fontWeight:700,color:'#374151',textTransform:'uppercase' }}>Số tiền thu</span>
            <span style={{ fontSize:22,fontWeight:800,color:'#ea580c' }}>{fmtVND(r.amount)}</span>
          </div>
        </div>
        {qrUrl&&<div style={{ padding:'0 24px 16px',textAlign:'center' }}><div style={{ borderTop:'1px solid #f1f5f9',paddingTop:14 }}><p style={{ fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10 }}>Quét để chuyển khoản</p><img src={qrUrl} alt="VietQR" style={{ width:150,height:150,margin:'0 auto',display:'block',borderRadius:10,border:'1px solid #e2e8f0' }}/><p style={{ fontSize:12,color:'#64748b',marginTop:8 }}>{bankId} · {accountNo}</p><p style={{ fontSize:13,fontWeight:700,color:'#0f172a',margin:'2px 0 0' }}>{accountName}</p></div></div>}
        <div style={{ padding:'0 24px 20px',display:'flex',flexDirection:'column',gap:8 }} className="print:hidden">
          <Button intent="warning" fullWidth size="lg" icon={<Printer size={15}/>} onClick={()=>window.print()} style={{ background:'#ea580c' }}>In / Xuất PDF</Button>
          <button onClick={onClose} style={{ width:'100%',padding:10,background:'none',border:'none',color:'#94a3b8',fontSize:14,fontWeight:600,cursor:'pointer' }}>Đóng lại</button>
        </div>
      </div>
    </div>
  );
}

export function FinanceDetailModal({ student, payments, onClose, isPaid }: {
  student:Student; payments:Payment[]; onClose:()=>void; isPaid:(sid:string,mo:number,yr:number)=>boolean;
}) {
  const financeMonths = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return { m: d.getMonth()+1, y: d.getFullYear(), label: `T${d.getMonth()+1}` };
    });
  }, []);

  const s=student, sPayments=payments.filter(p=>p.studentId===s.id);
  return (
    <div style={FS_WRAP}>
      <div style={{ ...FS_DLG, maxWidth:580 }}>
        <div style={{ background:'linear-gradient(135deg,#0f172a,#1e293b)',padding:'18px 24px',borderRadius:'14px 14px 0 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:14 }}>
            <div style={{ width:42,height:42,borderRadius:11,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><DollarSign size={20} color="rgba(255,255,255,0.7)"/></div>
            <div><h3 style={{ fontSize:16,fontWeight:800,color:'white',margin:0 }}>{s.name}</h3><p style={{ fontSize:13,color:'rgba(255,255,255,0.6)',margin:'2px 0 0' }}>{s.id} · Lớp {s.classId}</p></div>
          </div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:9,background:'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={15} color="white"/></button>
        </div>
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:'18px 24px' }}>
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10 }}>Lịch đóng học phí</p>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(54px,1fr))',gap:6 }}>
              {financeMonths.map(fm=>{ const paid=isPaid(s.id,fm.m,fm.y); return (
                <div key={fm.label} style={{ borderRadius:8,padding:'8px 4px',textAlign:'center',background:paid?'#ecfdf5':'#f8fafc',border:paid?'1.5px solid #a7f3d0':'1.5px solid #e2e8f0' }}>
                  <p style={{ fontSize:11,fontWeight:700,color:paid?'#059669':'#94a3b8',margin:'0 0 3px' }}>{fm.label}</p>
                  {paid?<div style={{ width:16,height:16,borderRadius:'50%',background:'#059669',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto' }}><Check size={9} color="white"/></div>:<div style={{ width:16,height:16,borderRadius:'50%',background:'#e2e8f0',margin:'0 auto' }}/>}
                </div>
              );})}
            </div>
          </div>
          <div style={{ marginTop:16,border:'1.5px solid #e2e8f0',overflow:'hidden',borderRadius:10 }}>
            <div style={{ padding:'9px 16px',background:'#f8fafc',borderBottom:'1.5px solid #e2e8f0' }}><p style={{ fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>💳 Lịch sử ({sPayments.length} giao dịch)</p></div>
            <div style={{ maxHeight:220,overflowY:'auto' }}>
              {sPayments.length===0?<p style={{ padding:20,textAlign:'center',color:'#94a3b8',fontStyle:'italic',fontSize:14 }}>Chưa có giao dịch</p>
                :sPayments.map((p,i)=>(
                <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 16px',borderBottom:'1px solid #f1f5f9',background:i%2===0?'white':'#fafafa' }}>
                  <div><p style={{ fontSize:14,fontWeight:600,color:'#0f172a',margin:0 }}>{formatDate(p.date)}</p><p style={{ fontSize:12,color:'#94a3b8',margin:'2px 0 0',fontStyle:'italic' }}>{p.description}</p></div>
                  <span style={{ fontSize:15,fontWeight:800,color:'#059669',background:'#ecfdf5',padding:'4px 10px',borderRadius:8,border:'1px solid #a7f3d0' }}>+{fmtVND(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding:'14px 24px',borderTop:'1px solid #f1f5f9',flexShrink:0 }}><Button variant="outline" intent="neutral" fullWidth size="lg" onClick={onClose}>Đóng</Button></div>
      </div>
    </div>
  );
}
