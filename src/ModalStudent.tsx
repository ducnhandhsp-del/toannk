import React, { useState, useEffect } from 'react';
import { X, Save, UserCheck, DollarSign, Check, Activity, UserX } from 'lucide-react';
import { fmtVND, formatDate, capitalizeName, isValidPhone, isValidDateDMY, toInputDate } from './helpers';
import { ModalWrap, Field, SL } from './UIComponents';
import { Button, IconButton, Input, Select, Badge } from './design-system/src';
import type { Student, Payment } from './types';

const MODAL_STYLE: React.CSSProperties = {
  position:'fixed', inset:0, zIndex:200,
  display:'flex', alignItems:'center', justifyContent:'center',
  padding:'12px', background:'rgba(15,23,42,0.65)', backdropFilter:'blur(5px)',
};
const DIALOG_STYLE: React.CSSProperties = {
  background:'white', width:'100%', maxWidth:760,
  maxHeight:'95vh', borderRadius:12, overflow:'hidden',
  display:'flex', flexDirection:'column',
  boxShadow:'0 24px 80px rgba(0,0,0,0.28)',
};

export function StudentModal({
  open, onClose, editing, uniqueClasses, uniqueBranches, isSaving, onSave,
}: {
  open:boolean; onClose:()=>void; editing:Student|null;
  uniqueClasses:any[]; uniqueBranches:string[]; isSaving:boolean; onSave:(f:any)=>Promise<void>;
}) {
  const defaultBranch = uniqueBranches[0] || 'Đào Tấn';
  const [f,setF]       = useState<any>({});
  const [errors,setErrors] = useState<Record<string,string>>({});

  useEffect(()=>{ setF(editing??{branch:defaultBranch,academicLevel:'Khá',startDate:new Date().toISOString().split('T')[0]}); setErrors({}); },[editing,open]);
  if(!open) return null;

  const u=(k:string,v:string)=>{ setF((p:any)=>({...p,[k]:v})); if(errors[k]) setErrors(prev=>({...prev,[k]:''})); };

  const validate=():boolean=>{
    const err:Record<string,string>={};
    if(!f.id?.trim()) err.id='Mã HS không được để trống';
    else if(!/^[A-Z0-9_\-]+$/i.test(f.id.trim())) err.id='Chỉ chứa chữ, số, gạch ngang';
    if(!f.name?.trim()) err.name='Họ và tên không được để trống';
    else if(f.name.trim().length<3) err.name='Ít nhất 3 ký tự';
    if(f.parentPhone&&!isValidPhone(f.parentPhone)) err.parentPhone='SĐT không hợp lệ';
    if(f.dob&&!isValidDateDMY(f.dob)) err.dob='Dạng DD/MM/YYYY';
    setErrors(err); return Object.keys(err).length===0;
  };

  const classOptions=[{value:'',label:'Chọn lớp'},...uniqueClasses.map(c=>({value:c['Mã Lớp'],label:c['Mã Lớp']}))];
  const academicOptions=['Xuất sắc','Giỏi','Khá','Trung bình','Yếu'].map(v=>({value:v,label:v}));
  const branchOptions=uniqueBranches.length>0?uniqueBranches.map(b=>({value:b,label:b})):[{value:'Đào Tấn',label:'Đào Tấn'},{value:'Nguyễn Quang Bích',label:'Nguyễn Quang Bích'}];

  return (
    <div style={MODAL_STYLE}>
      <div style={DIALOG_STYLE}>
        {}
        <div style={{ padding:'20px 28px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(135deg,#eef2ff,#f5f3ff)',flexShrink:0 }}>
          <div>
            <h3 style={{ fontSize:18,fontWeight:800,color:'#0f172a',margin:0 }}>{editing?'Sửa thông tin học sinh':'Thêm học sinh mới'}</h3>
            <p style={{ fontSize:12,color:'#6366f1',fontWeight:600,margin:0 }}>Điền đầy đủ thông tin bên dưới</p>
          </div>
          <IconButton icon={<X size={18}/>} label="Đóng" onClick={onClose}/>
        </div>
        {}
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:'24px 28px' }}>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14 }}>
            <Input label="Mã HS *" value={f.id||''} onChange={v=>u('id',v)} placeholder="HS001" error={errors.id} disabled={!!editing}/>
            <Input label="Họ và tên *" value={f.name||''} onChange={v=>u('name',v)} placeholder="Nguyễn Văn A" error={errors.name}/>
            <Select label="Mã lớp" value={f.classId||''} onChange={v=>u('classId',v)} options={classOptions}/>
            <Input label="Khối lớp" value={f.grade||''} onChange={v=>u('grade',v)} placeholder="9"/>
            <Input label="Ngày sinh (DD/MM/YYYY)" value={f.dob||''} onChange={v=>u('dob',v)} placeholder="15/08/2010" error={errors.dob}/>
            <Input label="Ngày bắt đầu học" type="date" value={toInputDate(f.startDate||'')} onChange={v=>u('startDate',v)}/>
            <Select label="Học lực" value={f.academicLevel||'Khá'} onChange={v=>u('academicLevel',v)} options={academicOptions}/>
            <Input label="SĐT phụ huynh" value={f.parentPhone||''} onChange={v=>u('parentPhone',v)} placeholder="09xxxxxxxx" error={errors.parentPhone}/>
            <Input label="Tên phụ huynh" value={f.parentName||''} onChange={v=>u('parentName',v)}/>
            <Input label="Trường đang học" value={f.school||''} onChange={v=>u('school',v)}/>
            <Select label="Cơ sở" value={f.branch||defaultBranch} onChange={v=>u('branch',v)} options={branchOptions}/>
            <Input label="Mục tiêu" value={f.goal||''} onChange={v=>u('goal',v)} placeholder="8 điểm học kỳ tới"/>
          </div>
          {Object.keys(errors).length>0&&(
            <div style={{ marginTop:14,display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:8,background:'#fff1f2',border:'1px solid #fecaca' }}>
              <span>⚠️</span><span style={{ fontSize:13,fontWeight:600,color:'#be123c' }}>Vui lòng kiểm tra lại thông tin đã nhập</span>
            </div>
          )}
        </div>
        {}
        <div style={{ padding:'16px 28px',borderTop:'1px solid #f1f5f9',display:'flex',justifyContent:'flex-end',gap:10,flexShrink:0 }}>
          <Button variant="outline" intent="neutral" onClick={onClose}>Hủy</Button>
          <Button intent="primary" loading={isSaving} icon={<Save size={15}/>} onClick={async()=>{ if(validate()) await onSave(f); }}>
            {editing?'Cập nhật':'Thêm mới'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StudentDetailModal({ student, onClose, tlogs, payments, onToggleStatus }: {
  student:Student; onClose:()=>void; tlogs?:any[]; payments?:Payment[];
  onToggleStatus?:(student:Student,endDate?:string)=>Promise<void>;
}) {
  const [toggling,setToggling]=useState(false);
  const [showEndPicker,setShowEndPicker]=useState(false);
  const [endDateInput,setEndDateInput]=useState(new Date().toISOString().split('T')[0]);
  const s=student, ph=String(s.parentPhone||'').replace(/\D/g,'');
  const resolveT=(raw:string)=>{ const l=(raw||'').toLowerCase(); if(l.includes('nhân')) return 'Lê Đức Nhân'; if(l.includes('kiên')) return 'Nguyễn Thị Kiên'; return raw||'---'; };
  const isInactive=s.status==='inactive'||(s.endDate&&s.endDate!=='---'&&s.endDate!=='');
  let present=0,absent=0,late=0;
  if(tlogs) tlogs.forEach(log=>(log.attendanceList||[]).forEach((a:any)=>{ if((a.maHS||a['Mã HS'])!==s.id) return; const st=a['Trạng thái']||''; if(st==='Có mặt') present++; else if(st==='Vắng') absent++; else if(st==='Muộn') late++; }));
  const totalSessions=present+absent+late, attendPct=totalSessions>0?Math.round(present/totalSessions*100):null;
  const sPayments=(payments||[]).filter(p=>p.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  const handleToggle=async(endDate?:string)=>{ if(!onToggleStatus) return; setToggling(true); try{ await onToggleStatus(s,endDate); }finally{ setToggling(false); } };
  const attendColor=(attendPct??0)>=90?'#10b981':(attendPct??0)>=70?'#f97316':'#ef4444';
  const fields=[{l:'Ngày sinh',v:formatDate(s.dob)},{l:'Bắt đầu học',v:formatDate(s.startDate)},{l:'Khối lớp',v:s.grade},{l:'Học lực',v:s.academicLevel},{l:'Trường HT',v:s.school},{l:'Cơ sở',v:s.branch},{l:'Giáo viên',v:resolveT(s.teacher)},{l:'Phụ huynh',v:s.parentName},{l:'SĐT PH',v:s.parentPhone},{l:'Mục tiêu',v:s.goal},{l:'Cần hỗ trợ',v:s.supportNeeded}];

  return (
    <div style={MODAL_STYLE}>
      <div style={{ ...DIALOG_STYLE, maxWidth:680 }}>
        {}
        <div style={{ padding:'20px 28px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:14,background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',flexShrink:0 }}>
          <div style={{ flex:1,minWidth:0 }}>
            <h3 style={{ fontSize:18,fontWeight:800,color:'#0f172a',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{capitalizeName(s.name)}</h3>
            <p style={{ fontSize:14,color:'#0d9488',fontWeight:700,margin:'2px 0 0' }}>{s.id} · Lớp {s.classId}</p>
            {isInactive&&<span style={{ display:'inline-block',marginTop:4,fontSize:11,fontWeight:700,color:'#e11d48',background:'#fff1f2',border:'1px solid #fecaca',padding:'2px 9px',borderRadius:6,textTransform:'uppercase' }}>Đã nghỉ học</span>}
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>
            {onToggleStatus&&(isInactive
              ? <Button intent="success" variant="outline" size="sm" icon={<UserCheck size={14}/>} loading={toggling} onClick={()=>handleToggle()}>Học lại</Button>
              : showEndPicker
                ? <div style={{ display:'flex',alignItems:'center',gap:8,background:'#fff1f2',border:'1px solid #fecaca',borderRadius:8,padding:'7px 12px' }}>
                    <span style={{ fontSize:12,fontWeight:700,color:'#be123c',whiteSpace:'nowrap' }}>Ngày nghỉ:</span>
                    <input type="date" value={endDateInput} onChange={e=>setEndDateInput(e.target.value)} style={{ fontSize:12,fontWeight:600,color:'#9f1239',background:'transparent',border:'none',borderBottom:'1px solid #fca5a5',outline:'none' }}/>
                    <Button size="xs" intent="danger" loading={toggling} onClick={()=>{setShowEndPicker(false);handleToggle(endDateInput);}}>Xác nhận</Button>
                    <Button size="xs" variant="ghost" intent="neutral" onClick={()=>setShowEndPicker(false)}>Hủy</Button>
                  </div>
                : <Button intent="danger" variant="outline" size="sm" icon={<UserX size={14}/>} onClick={()=>{setEndDateInput(new Date().toISOString().split('T')[0]);setShowEndPicker(true);}}>Nghỉ học</Button>
            )}
            <IconButton icon={<X size={18}/>} label="Đóng" onClick={onClose}/>
          </div>
        </div>
        {}
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:'20px 28px' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            {fields.map((item,i)=>(
              <div key={i} style={{ padding:'10px 12px',borderRadius:7,background:'#f8fafc',border:'1px solid #f1f5f9',gridColumn:(item.l==='Mục tiêu'||item.l==='Cần hỗ trợ')?'1/-1':'auto' }}>
                <p style={{ fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 2px' }}>{item.l}</p>
                <p style={{ fontWeight:600,color:'#1e293b',fontSize:13,margin:0 }}>{item.v||'---'}</p>
              </div>
            ))}
          </div>
          {totalSessions>0&&(
            <div style={{ marginTop:14,border:'1px solid #e2e8f0',borderRadius:8,padding:14 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                <Activity size={14} color="#6366f1"/>
                <span style={{ fontSize:12,fontWeight:700,color:'#6366f1',textTransform:'uppercase',letterSpacing:'0.06em',flex:1 }}>Chuyên cần ({totalSessions} buổi)</span>
                {attendPct!==null&&<span style={{ fontSize:17,fontWeight:800,color:attendColor }}>{attendPct}%</span>}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:7,marginBottom:10 }}>
                {[{label:'Có mặt',val:present,color:'#059669',bg:'#ecfdf5',border:'#a7f3d0'},{label:'Vắng',val:absent,color:'#e11d48',bg:'#fff1f2',border:'#fecaca'},{label:'Muộn',val:late,color:'#d97706',bg:'#fffbeb',border:'#fde68a'}].map(({label,val,color,bg,border})=>(
                  <div key={label} style={{ background:bg,border:`1px solid ${border}`,borderRadius:8,padding:'10px 8px',textAlign:'center' }}>
                    <p style={{ fontSize:24,fontWeight:800,color,margin:0,lineHeight:1 }}>{val}</p>
                    <p style={{ fontSize:10,fontWeight:700,color,margin:'3px 0 0',textTransform:'uppercase' }}>{label}</p>
                  </div>
                ))}
              </div>
              <div style={{ height:7,background:'#e2e8f0',borderRadius:3,overflow:'hidden' }}>
                <div style={{ height:'100%',width:`${attendPct??0}%`,background:attendColor,borderRadius:3,transition:'width 0.4s' }}/>
              </div>
            </div>
          )}
          {sPayments.length>0&&(
            <div style={{ marginTop:14 }}>
              <p style={{ fontSize:11,fontWeight:700,color:'#059669',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8 }}>💰 Đóng phí gần đây</p>
              <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
                {sPayments.map((p,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',borderRadius:7,background:'#f0fdf4',border:'1px solid #bbf7d0' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                      <Check size={12} color="#10b981" style={{ flexShrink:0 }}/>
                      <span style={{ fontWeight:600,color:'#334155',fontSize:13 }}>{p.description}</span>
                      <span style={{ color:'#94a3b8',fontSize:11 }}>{formatDate(p.date)}</span>
                    </div>
                    <span style={{ fontWeight:700,color:'#059669',fontSize:13 }}>+{fmtVND(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {}
        <div style={{ padding:'14px 28px',borderTop:'1px solid #f1f5f9',display:'flex',gap:10,flexShrink:0 }}>
          {ph.length>=9&&<>
            <a href={`tel:${ph}`} style={{ flex:1 }}><Button variant="outline" intent="success" fullWidth>📞 Gọi điện</Button></a>
            <a href={`https://zalo.me/${ph}`} target="_blank" rel="noopener noreferrer" style={{ flex:1,textDecoration:'none' }}><Button variant="outline" intent="primary" fullWidth>💬 Zalo PH</Button></a>
          </>}
          <Button variant="outline" intent="neutral" fullWidth onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
