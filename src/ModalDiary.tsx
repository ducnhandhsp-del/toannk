import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Save, BookOpen, Calendar, Users, FileText } from 'lucide-react';
import { formatDate, toInputDate, localDateStr } from './helpers';
import { ModalWrap, ModalFooter } from './UIComponents';
import { Button, IconButton, Input, Select, RadioGroup, AttendancePicker } from './dsComponents';
import type { AttendanceStudent } from './dsComponents';
import type { Student } from './types';

const FS_WRAP: React.CSSProperties = { position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:12,overflowY:'auto',background:'rgba(15,23,42,0.65)',backdropFilter:'blur(5px)' };
const FS_DLG: React.CSSProperties  = { background:'white',width:'100%',maxWidth:900,maxHeight:'95vh',borderRadius:12,overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(0,0,0,0.28)' };

function SBox({ color, icon:Icon, title, children }: { color:string; icon:any; title:string; children:React.ReactNode }) {
  return (
    <div style={{ borderRadius:8, border:'1.5px solid #e2e8f0', overflow:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 14px',background:`${color}08`,borderBottom:`1.5px solid ${color}22` }}>
        <Icon size={13} color={color}/>
        <span style={{ fontSize:11,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'0.08em' }}>{title}</span>
      </div>
      <div style={{ padding:'14px',display:'flex',flexDirection:'column',gap:12 }}>{children}</div>
    </div>
  );
}

export function DiaryModal({
  open, onClose, uniqueClasses, students, isSaving, onSave, editingLog, caDayOptions=[], preselectedClassId='',
}: {
  open:boolean; onClose:()=>void; uniqueClasses:any[]; students:Student[]; isSaving:boolean;
  onSave:(f:any)=>Promise<void>; editingLog?:any; caDayOptions?:string[]; preselectedClassId?:string;
}) {
  const [classId,setClassId]=useState('');
  const [date,setDate]=useState(localDateStr());
  const [content,setContent]=useState('');
  const [hw,setHw]=useState('');
  const [caDay,setCaDay]=useState('');
  const [att,setAtt]=useState<Record<string,{trangThai:string;ghiChu:string}>>({});

  useEffect(()=>{
    if(open){
      if(editingLog){
        setClassId(editingLog.classId||''); setDate(toInputDate(editingLog.rawDate||editingLog.date||''));
        setContent(editingLog.content||''); setHw(editingLog.homework==='---'?'':editingLog.homework||'');
        setCaDay(editingLog.caDay||'');
        const attInit:Record<string,{trangThai:string;ghiChu:string}>={};
        (editingLog.attendanceList||[]).forEach((a:any)=>{ attInit[a.maHS||a['Mã HS']]={trangThai:a['Trạng thái']||'Có mặt',ghiChu:a['Ghi chú']||''}; });
        setAtt(attInit);
      } else {
        const dc=preselectedClassId||uniqueClasses[0]?.['Mã Lớp']||'';
        setClassId(dc); setDate(localDateStr()); setContent(''); setHw(''); setCaDay(''); setAtt({});
      }
    }
  },[open,uniqueClasses,editingLog,preselectedClassId]);

  if(!open) return null;

  const cls=students.filter(s=>s.classId===classId);
  const caList=caDayOptions.length>0?caDayOptions:['7h30','9h','13h30','15h30','17h30','19h30'];
  const classOptions=uniqueClasses.map(c=>({value:c['Mã Lớp'],label:`Lớp ${c['Mã Lớp']}`}));

  
  const attStudents: AttendanceStudent[] = cls.map(s=>({
    id:s.id, name:s.name,
    status:(att[s.id]?.trangThai==='Vắng'?'absent':att[s.id]?.trangThai==='Muộn'?'late':'present') as any,
    note:att[s.id]?.ghiChu||'',
  }));
  const handleAttChange=(updated:AttendanceStudent[])=>{
    const next:Record<string,{trangThai:string;ghiChu:string}>={};
    updated.forEach(a=>{ next[a.id]={trangThai:a.status==='absent'?'Vắng':a.status==='late'?'Muộn':'Có mặt',ghiChu:a.note||''}; });
    setAtt(next);
  };

  const doSave=()=>{
    if(!caDay){toast.error('⚠️ Vui lòng chọn ca dạy!');return;}
    if(!content.trim()){toast.error('⚠️ Vui lòng nhập nội dung bài dạy!');return;}
    onSave({ date,classId,caDay,content,homework:hw||'---',teacherName:cls[0]?.teacher||'',
      ...(editingLog&&{originalDate:editingLog.originalDate||editingLog.rawDate,originalClassId:editingLog.originalClassId||editingLog.classId,originalCaDay:editingLog.originalCaDay||editingLog.caDay||''}),
      attendance:cls.map(s=>({maHS:s.id,tenHS:s.name,trangThai:att[s.id]?.trangThai||'Có mặt',ghiChu:att[s.id]?.ghiChu||''})),
    });
  };

  return (
    <div style={FS_WRAP}>
      <div style={FS_DLG}>
        {}
        <div style={{ padding:'18px 24px',borderBottom:'1.5px solid #f1f5f9',background:'linear-gradient(135deg,#eef2ff,#f5f3ff)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(99,102,241,0.3)' }}><BookOpen size={17} color="white"/></div>
            <div>
              <h3 style={{ fontSize:16,fontWeight:800,color:'#0f172a',margin:0 }}>{editingLog?'Cập nhật buổi dạy':'Ghi buổi dạy mới'}</h3>
              {classId&&<p style={{ fontSize:12,color:'#6366f1',fontWeight:600,margin:0 }}>Lớp {classId} · {cls.length} học sinh</p>}
            </div>
          </div>
          <IconButton icon={<X size={18}/>} label="Đóng" onClick={onClose}/>
        </div>

        {}
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:'18px 24px' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
            {}
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <SBox color="#6366f1" icon={Calendar} title="Thông tin buổi dạy">
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                  <Input label="Ngày dạy" type="date" value={date} onChange={setDate}/>
                  <Select label="Lớp học" value={classId} onChange={v=>{setClassId(v);if(!editingLog)setAtt({});}} options={classOptions}/>
                </div>
                <RadioGroup label="Ca dạy *" value={caDay} onChange={setCaDay} direction="horizontal" options={caList.map(ca=>({value:ca,label:ca}))}/>
                {!caDay&&<p style={{ fontSize:11,color:'#f59e0b',fontWeight:600,margin:0 }}>⚠️ Bắt buộc chọn ca dạy</p>}
              </SBox>
              <SBox color="#7c3aed" icon={FileText} title="Nội dung bài học">
                <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Nội dung bài dạy *</label>
                  <textarea value={content} onChange={e=>setContent(e.target.value)} rows={4} placeholder="VD: Phương trình bậc 2, đồ thị hàm số..." style={{ width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #ede9fe',fontSize:13,fontWeight:500,color:'#0f172a',outline:'none',background:'white',resize:'vertical',fontFamily:'inherit',boxSizing:'border-box' }} onFocus={e=>e.target.style.borderColor='#7c3aed'} onBlur={e=>e.target.style.borderColor='#ede9fe'}/>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em' }}>Bài tập về nhà</label>
                  <textarea value={hw} onChange={e=>setHw(e.target.value)} rows={2} placeholder="SBT tr.45: 1,2,3 — hoặc để trống" style={{ width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #ede9fe',fontSize:13,fontWeight:500,color:'#0f172a',outline:'none',background:'white',resize:'vertical',fontFamily:'inherit',boxSizing:'border-box' }} onFocus={e=>e.target.style.borderColor='#7c3aed'} onBlur={e=>e.target.style.borderColor='#ede9fe'}/>
                </div>
              </SBox>
            </div>
            {}
            {cls.length>0
              ? <SBox color="#059669" icon={Users} title={`Điểm danh · ${cls.length} học sinh`}>
                  <AttendancePicker students={attStudents} onChange={handleAttChange}/>
                </SBox>
              : <div style={{ display:'flex',alignItems:'center',justifyContent:'center',background:'#f8fafc',border:'1.5px dashed #e2e8f0',borderRadius:8,color:'#94a3b8',fontStyle:'italic',fontSize:13 }}>
                  Chọn lớp để điểm danh
                </div>
            }
          </div>
        </div>

        {}
        <div style={{ padding:'14px 24px',borderTop:'1px solid #f1f5f9',display:'flex',justifyContent:'flex-end',gap:10,flexShrink:0 }}>
          <Button variant="outline" intent="neutral" onClick={onClose}>Hủy</Button>
          <Button intent="primary" loading={isSaving} icon={<Save size={14}/>} onClick={doSave} style={{ boxShadow:'0 4px 14px rgba(99,102,241,0.4)' }}>
            {editingLog?'Cập nhật buổi dạy':'Lưu buổi dạy'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<string,{active:string;bg:string;dot:string}> = {
  'Có mặt':{active:'#059669',bg:'#ecfdf5',dot:'#10b981'},
  'Muộn':  {active:'#d97706',bg:'#fffbeb',dot:'#f59e0b'},
  'Vắng':  {active:'#dc2626',bg:'#fef2f2',dot:'#ef4444'},
};
export function DiaryDetailModal({ log, onClose }: { log:any; onClose:()=>void }) {
  const l=log;
  return (
    <div style={FS_WRAP}>
      <div style={{ ...FS_DLG, maxWidth:560 }}>
        <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)',padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:40,height:40,borderRadius:10,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}><BookOpen size={20} color="white"/></div>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:2 }}>
                <span style={{ background:'rgba(255,255,255,0.2)',color:'white',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:5 }}>{l.classId}</span>
                {l.caDay&&<span style={{ background:'rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.9)',fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:5 }}>⏰ {l.caDay}</span>}
              </div>
              <p style={{ color:'rgba(255,255,255,0.8)',fontSize:13,margin:0,fontWeight:500 }}>{formatDate(l.date)}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.2)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={14} color="white"/></button>
        </div>
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:'16px 24px',display:'flex',flexDirection:'column',gap:12 }}>
          <div style={{ display:'flex',gap:8 }}>
            {[{label:'Có mặt',val:l.present,color:'#059669',bg:'#ecfdf5',border:'#a7f3d0'},{label:'Vắng',val:l.absent,color:'#dc2626',bg:'#fef2f2',border:'#fecaca'},{label:'Muộn',val:l.late,color:'#d97706',bg:'#fffbeb',border:'#fde68a'}].map(({label,val,color,bg,border})=>(
              <div key={label} style={{ flex:1,textAlign:'center',padding:'10px 8px',borderRadius:8,background:bg,border:`1.5px solid ${border}` }}>
                <p style={{ fontSize:26,fontWeight:800,color,margin:0,lineHeight:1 }}>{val}</p>
                <p style={{ fontSize:10,fontWeight:700,color,margin:'3px 0 0',textTransform:'uppercase' }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ borderRadius:8,background:'#eef2ff',border:'1.5px solid #c7d2fe',padding:'12px 14px' }}>
            <p style={{ fontSize:10,fontWeight:700,color:'#6366f1',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 5px' }}>📖 Nội dung bài dạy</p>
            <p style={{ fontSize:14,fontWeight:600,color:'#1e1b4b',margin:0,lineHeight:1.5 }}>{l.content}</p>
          </div>
          {l.homework&&l.homework!=='---'&&<div style={{ borderRadius:8,background:'#fffbeb',border:'1.5px solid #fde68a',padding:'12px 14px' }}><p style={{ fontSize:10,fontWeight:700,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 5px' }}>📝 Bài tập về nhà</p><p style={{ fontSize:14,fontWeight:600,color:'#451a03',margin:0 }}>{l.homework}</p></div>}
          {l.attendanceList?.length>0&&(
            <div style={{ border:'1.5px solid #e2e8f0',overflow:'hidden',borderRadius:8 }}>
              <div style={{ padding:'8px 12px',background:'#f8fafc',borderBottom:'1.5px solid #e2e8f0' }}><p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>Danh sách điểm danh</p></div>
              <div style={{ maxHeight:200,overflowY:'auto' }}>
                {l.attendanceList.map((a:any,i:number)=>{
                  const name=a['Họ và tên']||a['tenHS']||'---',status=a['Trạng thái']||'---',note=a['Ghi chú']||a['ghiChu']||'',sty=STATUS_STYLES[status]||STATUS_STYLES['Có mặt'];
                  return (
                    <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 14px',borderBottom:'1px solid #f1f5f9',background:status!=='Có mặt'?sty.bg:'white' }}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <span style={{ fontSize:13,fontWeight:600,color:'#0f172a' }}>{name}</span>
                        {note&&<p style={{ fontSize:11,color:'#94a3b8',margin:'2px 0 0',fontStyle:'italic' }}>{note}</p>}
                      </div>
                      <span style={{ background:sty.bg,color:sty.active,fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:7,whiteSpace:'nowrap',border:`1px solid ${sty.dot}33` }}>{status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:'14px 24px',borderTop:'1px solid #f1f5f9',flexShrink:0 }}>
          <Button variant="outline" intent="neutral" fullWidth onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
