/**
 * SettingsTab.tsx — v27.1
 * Thiết kế lại hoàn toàn: 2 cột sidebar + nội dung,
 * giao diện tối ưu, section navigation
 * Logic: KHÔNG THAY ĐỔI
 */
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  RefreshCw, CheckCircle, XCircle, Loader2, Save,
  Plus, X, Trash2, Edit3, Check, Eye,
  Plug, School, DollarSign, Landmark, MessageSquare,
  Paintbrush, Database, Clock, ExternalLink,
} from 'lucide-react';
import { cn, saveSettings, makeVietQR, getCacheSize } from './helpers';
import { ModalWrap } from './UIComponents';
import { Button, IconButton, Input, Select } from './dsComponents';
import { TABLE_WRAP } from './AppComponents';

interface Props {
  bankId: string;        setBankId: (v: string) => void;
  accountNo: string;     setAccountNo: (v: string) => void;
  accountName: string;   setAccountName: (v: string) => void;
  scriptUrl: string;     setScriptUrl: (v: string) => void;
  gsOk: boolean | null;  saving: boolean; loadData: () => void;
  baseTuition: number;   setBaseTuition: (v: number) => void;
  schoolYear: string;    setSchoolYear: (v: string) => void;
  zaloTpl: string;       setZaloTpl: (v: string) => void;
  centerName: string;    setCenterName: (v: string) => void;
  teacher: string;       setTeacher: (v: string) => void;
  addr1: string;         setAddr1: (v: string) => void;
  addr2: string;         setAddr2: (v: string) => void;
  phone: string;         setPhone: (v: string) => void;
  accentColor: string;   setAccentColor: (v: any) => void;
  showId: boolean;       setShowId: (v: boolean) => void;
  hideInactive: boolean; setHideInactive: (v: boolean) => void;
  caDayOptions: string[];setCaDayOptions: (v: string[]) => void;
  teacherList: string[]; setTeacherList: (v: string[]) => void;
  uniqueBranches: string[];
}

interface ZaloTemplate { id: string; name: string; content: string; }
const TEMPLATE_KEY = 'ltn-message-templates';
const DEFAULT_TEMPLATE: ZaloTemplate = {
  id: 'default', name: 'Thông báo học phí',
  content: 'Chào anh/chị, học phí tháng [Thang] của cháu [Ten] là [SoTien]. Vui lòng đóng trước ngày 10. Cảm ơn!',
};
const VARS = ['[Ten]','[Lop]','[Thang]','[SoTien]','[Ngay]'];
const FONT_SIZES = [{ id:'sm',label:'Nhỏ',px:'14px' },{ id:'md',label:'Vừa',px:'16px' },{ id:'lg',label:'To',px:'18px' },{ id:'xl',label:'Rất to',px:'20px' }] as const;

function loadTemplates(): ZaloTemplate[] {
  try { const s = localStorage.getItem(TEMPLATE_KEY); if (s) return JSON.parse(s); } catch {}
  return [DEFAULT_TEMPLATE];
}
function saveTemplates(ts: ZaloTemplate[]) {
  try { localStorage.setItem(TEMPLATE_KEY, JSON.stringify(ts)); } catch {}
}

/* ── Shared input style ── */
const INP: React.CSSProperties = { width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', fontSize:13, fontWeight:500, color:'#0f172a', outline:'none', background:'white', boxSizing:'border-box' as const, fontFamily:'inherit' };

/* ── TagList ── */
function TagList({ items, setItems, placeholder }: { items: string[]; setItems: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState('');
  const add = () => { const v = draft.trim(); if (v && !items.includes(v)) setItems([...items, v]); setDraft(''); };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
      <div style={{ display:'flex', gap:7 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),add())} placeholder={placeholder} style={{ ...INP, flex:1, fontSize:12 }}/>
        <button onClick={add} style={{ padding:'8px 12px', background:'#6366f1', color:'white', border:'none', cursor:'pointer', fontWeight:700, fontSize:12 }}><Plus size={14}/></button>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
        {items.map((item, i) => (
          <span key={i} style={{ display:'flex', alignItems:'center', gap:5, background:'#eef2ff', border:'1px solid #c7d2fe', color:'#3730a3', fontSize:12, fontWeight:700, padding:'3px 9px' }}>
            {item}
            <button onClick={() => setItems(items.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:'#a5b4fc', lineHeight:1 }}><X size={10}/></button>
          </span>
        ))}
        {items.length===0&&<span style={{ fontSize:12, color:'#94a3b8', fontStyle:'italic' }}>Chưa có mục nào</span>}
      </div>
    </div>
  );
}

/* ── QR Modal ── */
function QRModal({ open, onClose, bankId, accountNo, accountName }: { open:boolean; onClose:()=>void; bankId:string; accountNo:string; accountName:string; }) {
  if (!open) return null;
  const url = makeVietQR(bankId, accountNo, 1_000_000, 'Hoc phi mau', accountName);
  return (
    <ModalWrap onClose={onClose}>
      <div style={{ padding:24, textAlign:'center', maxWidth:320 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f1f5f9', paddingBottom:12, marginBottom:16 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'#0f172a', margin:0 }}>Thử QR VietQR</h3>
          <IconButton icon={<X size={16}/>} label="Đóng" onClick={onClose}/>
        </div>
        <img src={url} alt="VietQR Preview" style={{ width:180, height:180, border:'1px solid #e2e8f0', margin:'0 auto 12px', display:'block' }}/>
        <p style={{ fontSize:12, color:'#64748b' }}>{bankId} · {accountNo}</p>
        <p style={{ fontSize:13, fontWeight:700, color:'#0f172a', margin:'2px 0 12px' }}>{accountName}</p>
        <Button variant="outline" intent="neutral" fullWidth onClick={onClose}>Đóng</Button>
      </div>
    </ModalWrap>
  );
}

/* ── Template Modal ── */
function TemplateModal({ open, onClose, initial, onSave }: { open:boolean; onClose:()=>void; initial?:ZaloTemplate|null; onSave:(t:ZaloTemplate)=>void; }) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  useEffect(() => { if (open) { setName(initial?.name||''); setContent(initial?.content||''); } }, [open, initial]);
  if (!open) return null;
  const insertVar = (v: string) => setContent(c => c + v);
  return (
    <ModalWrap onClose={onClose}>
      <div style={{ padding:24, minWidth:440 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f1f5f9', paddingBottom:12, marginBottom:16 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'#0f172a', margin:0 }}>{initial?'Sửa mẫu':'Thêm mẫu'}</h3>
          <IconButton icon={<X size={16}/>} label="Đóng" onClick={onClose}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Input label="Tên mẫu" value={name} onChange={setName} placeholder="Thông báo học phí..."/>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Nội dung</label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={4} style={{ ...INP, resize:'vertical' }} placeholder="Nội dung tin nhắn..."/>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, alignItems:'center' }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#94a3b8' }}>Chèn biến:</span>
            {VARS.map(v => (
              <button key={v} onClick={() => insertVar(v)} style={{ fontSize:11, fontWeight:700, fontFamily:'monospace', padding:'3px 9px', border:'1px solid #c7d2fe', cursor:'pointer', background:'#f8fafc', color:'#4338ca' }}>{v}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:10, paddingTop:8, borderTop:'1px solid #f1f5f9' }}>
            <Button variant="outline" intent="neutral" fullWidth onClick={onClose}>Hủy</Button>
            <Button intent="primary" fullWidth onClick={() => { if(!name.trim()){toast.error('Nhập tên mẫu!');return;} onSave({id:initial?.id||Date.now().toString(),name:name.trim(),content:content.trim()}); }}>
              {initial?'Cập nhật':'Thêm mẫu'}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrap>
  );
}

/* ── Section component ── */
function Section({ icon: Icon, title, color='#6366f1', children }: { icon:any; title:string; color?:string; children:React.ReactNode }) {
  return (
    <div style={{ ...TABLE_WRAP, marginBottom: 0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'#1e3a5f', borderBottom:'2px solid #0f2d4a' }}>
        <div style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.15)', flexShrink:0 }}>
          <Icon size={14} color="white"/>
        </div>
        <h3 style={{ fontSize:12, fontWeight:700, color:'white', textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>{title}</h3>
      </div>
      <div style={{ padding:18 }}>{children}</div>
    </div>
  );
}

/* ── Toggle row ── */
function ToggleRow({ label, sub, val, onChange }: { label:string; sub?:string; val:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f8fafc' }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:'#1e293b', margin:0 }}>{label}</p>
        {sub && <p style={{ fontSize:11, color:'#94a3b8', margin:'1px 0 0' }}>{sub}</p>}
      </div>
      <button onClick={() => onChange(!val)} style={{ width:44, height:24, background:val?'#6366f1':'#e2e8f0', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', borderRadius:12, flexShrink:0 }}>
        <div style={{ position:'absolute', top:2, width:20, height:20, background:'white', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.2s', left:val?22:2, borderRadius:'50%' }}/>
      </button>
    </div>
  );
}

/* ── FormGrid ── */
function FormGrid({ children, cols=2 }: { children:React.ReactNode; cols?:number }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fit, minmax(${cols===1?'100%':'180px'}, 1fr))`, gap:12 }}>{children}</div>;
}

export default function SettingsTab({
  bankId, setBankId, accountNo, setAccountNo, accountName, setAccountName,
  scriptUrl, setScriptUrl, gsOk, saving, loadData,
  baseTuition, setBaseTuition, schoolYear, setSchoolYear, zaloTpl, setZaloTpl,
  centerName, setCenterName, teacher, setTeacher, addr1, setAddr1, addr2, setAddr2,
  phone, setPhone, accentColor, setAccentColor, showId, setShowId, hideInactive, setHideInactive,
  caDayOptions, setCaDayOptions, teacherList, setTeacherList, uniqueBranches,
}: Props) {

  const [teacher1, setTeacher1] = useState(teacherList[0] || teacher || '');
  const [teacher2, setTeacher2] = useState(teacherList[1] || '');
  const [phone1,   setPhone1]   = useState(phone || '');
  const [sheetsUrl, setSheetsUrl] = useState(() => { try { return localStorage.getItem('ltn-sheetsUrl')||''; } catch { return ''; } });
  const [docUrl,    setDocUrl]    = useState(() => { try { return localStorage.getItem('ltn-docUrl')||''; } catch { return ''; } });
  const [showQR,   setShowQR]   = useState(false);
  const [fontSize, setFontSize] = useState<string>(() => { try { return localStorage.getItem('ltn-fontSize')||'md'; } catch { return 'md'; } });
  const [darkMode, setDarkMode] = useState<boolean>(() => { try { return localStorage.getItem('ltn-darkMode')==='true'; } catch { return false; } });
  const [cacheSize, setCacheSize] = useState('');
  const [templates, setTemplates]         = useState<ZaloTemplate[]>(() => loadTemplates());
  const [activeTplId, setActiveTplId]     = useState<string>(templates[0]?.id || 'default');
  const [showTplModal, setShowTplModal]   = useState(false);
  const [editingTpl, setEditingTpl]       = useState<ZaloTemplate | null>(null);
  const [tplContent, setTplContent]       = useState<string>(templates[0]?.content || DEFAULT_TEMPLATE.content);
  const [copiedVar, setCopiedVar]         = useState('');
  const [showDeleteTpl, setShowDeleteTpl] = useState(false);
  const [activeSection, setActiveSection] = useState('connection');

  useEffect(() => { setCacheSize(getCacheSize()); }, []);
  useEffect(() => { const t = templates.find(t => t.id === activeTplId); if (t) setTplContent(t.content); }, [activeTplId, templates]);
  useEffect(() => {
    const px = FONT_SIZES.find(f => f.id === fontSize)?.px || '16px';
    document.documentElement.style.setProperty('--app-font-size', px);
    document.documentElement.style.fontSize = px;
    document.body.style.fontSize = px;
    const root = document.getElementById('root');
    if (root) root.style.fontSize = px;
    try { localStorage.setItem('ltn-fontSize', fontSize); } catch {}
  }, [fontSize]);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.background = '#0f172a';
      document.body.style.color = '#f1f5f9';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '';
      document.body.style.color = '';
    }
    try { localStorage.setItem('ltn-darkMode', String(darkMode)); } catch {}
  }, [darkMode]);

  const handleLoadData = () => {
    if (!scriptUrl.trim().startsWith('https://script.google.com/macros/s/')) { toast.error('⚠️ Script URL không hợp lệ!'); return; }
    loadData();
  };
  const handleClearCache = () => { try { localStorage.removeItem('ltn-cache'); setCacheSize(getCacheSize()); toast.success('✅ Đã xóa cache!'); loadData(); } catch { toast.error('Lỗi xóa cache'); } };
  const silentLoadData = useCallback(() => loadData(), [loadData]);

  const handleSaveAll = () => {
    if (!scriptUrl.trim()) { toast.error('⚠️ Script URL không được để trống!'); return; }
    if (baseTuition <= 0)  { toast.error('⚠️ Học phí phải lớn hơn 0!'); return; }
    const newTeacherList = [teacher1, teacher2].filter(Boolean);
    setTeacherList(newTeacherList); setTeacher(teacher1); setPhone(phone1); setZaloTpl(tplContent);
    saveSettings({ baseTuition, schoolYear, zaloTpl: tplContent, bankId, accountNo, accountName, scriptUrl, centerName, teacher: teacher1, addr1, addr2, phone: phone1, accentColor, showId, hideInactive, caDayOptions, teacherList: newTeacherList, fontSize, darkMode });
    saveTemplates(templates);
    try { localStorage.setItem('ltn-sheetsUrl', sheetsUrl); } catch {}
    try { localStorage.setItem('ltn-docUrl', docUrl); } catch {}
    toast.success('✅ Đã lưu tất cả cài đặt!');
  };

  const handleSaveTpl = (t: ZaloTemplate) => {
    const exists = templates.find(x => x.id===t.id);
    const next = exists ? templates.map(x => x.id===t.id?t:x) : [...templates, t];
    setTemplates(next); setActiveTplId(t.id); setTplContent(t.content); setShowTplModal(false); setEditingTpl(null); toast.success('✅ Đã lưu mẫu!');
  };
  const handleDeleteTpl = () => {
    if (templates.length<=1) { toast.error('Cần ít nhất 1 mẫu!'); return; }
    const next = templates.filter(t => t.id!==activeTplId);
    setTemplates(next); setActiveTplId(next[0].id); setTplContent(next[0].content); setShowDeleteTpl(false); toast.success('Đã xóa mẫu!');
  };
  const insertVar = (v: string) => { setTplContent(c => c+v); setTemplates(ts => ts.map(t => t.id===activeTplId?{...t,content:tplContent+v}:t)); setCopiedVar(v); setTimeout(()=>setCopiedVar(''),1200); };
  const activeTpl = templates.find(t => t.id === activeTplId);

  const navItems = [
    { id:'connection', icon:Plug,         label:'Kết nối' },
    { id:'center',     icon:School,        label:'Trung tâm' },
    { id:'tuition',    icon:DollarSign,    label:'Học phí' },
    { id:'bank',       icon:Landmark,      label:'Ngân hàng' },
    { id:'zalo',       icon:MessageSquare, label:'Zalo' },
    { id:'display',    icon:Paintbrush,    label:'Giao diện' },
    { id:'data',       icon:Database,      label:'Dữ liệu' },
  ];

  const connColor = gsOk===true?'#059669':gsOk===false?'#e11d48':'#64748b';
  const connBg    = gsOk===true?'#ecfdf5':gsOk===false?'#fff1f2':'#f8fafc';
  const connText  = gsOk===true?'Kết nối thành công':gsOk===false?'Lỗi kết nối':'Đang kiểm tra...';

  return (
    <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>

      {/* ── Left nav ── */}
      <div style={{ width:160, flexShrink:0, position:'sticky', top:20 }}>
        <div style={{ border:'1px solid #e2e8f0', overflow:'hidden', marginBottom:12 }}>
          <div style={{ padding:'10px 14px', background:'#1e3a5f' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'white', textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>Cài đặt</p>
          </div>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:9, padding:'10px 14px', background:activeSection===item.id?'#eef2ff':'white', border:'none', borderBottom:'1px solid #f1f5f9', cursor:'pointer', textAlign:'left', fontWeight:activeSection===item.id?700:500, fontSize:13, color:activeSection===item.id?'#4338ca':'#475569', transition:'all 0.12s' }}>
              <item.icon size={13} color={activeSection===item.id?'#6366f1':'#94a3b8'}/>
              {item.label}
              {item.id==='connection'&&(
                <span style={{ width:7, height:7, borderRadius:'50%', background:connColor, marginLeft:'auto', flexShrink:0 }}/>
              )}
            </button>
          ))}
        </div>

        {/* Save button */}
        <Button intent="primary" fullWidth icon={<Save size={14}/>} loading={saving} onClick={handleSaveAll}>
          Lưu cài đặt
        </Button>
      </div>

      {/* ── Right content ── */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:14 }}>

        {/* ── KẾT NỐI ── */}
        {activeSection==='connection'&&(
          <Section icon={Plug} title="Kết nối & Dữ liệu">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Google Apps Script URL</label>
                <input value={scriptUrl} onChange={e=>setScriptUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..." style={{ ...INP, marginBottom:4 }}/>
                <p style={{ fontSize:11, color:'#94a3b8', margin:'0 0 8px', fontStyle:'italic' }}>URL triển khai của Google Apps Script — dùng để kết nối dữ liệu với Google Sheets</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'7px 12px', border:`1px solid`, borderColor:gsOk===true?'#a7f3d0':gsOk===false?'#fca5a5':'#e2e8f0', background:connBg, color:connColor, fontSize:12, fontWeight:700 }}>
                  {gsOk===null&&<Loader2 size={12} style={{ animation:'spin 1s linear infinite' }}/>}
                  {gsOk===true&&<CheckCircle size={12}/>}
                  {gsOk===false&&<XCircle size={12}/>}
                  {connText}
                </span>
                <div style={{ display:'flex', gap:7, marginLeft:'auto' }}>
                  <Button intent="primary" size="sm" icon={<RefreshCw size={13}/>} loading={saving} onClick={handleLoadData}>Tải lại</Button>
                  <Button intent="danger" variant="outline" size="sm" icon={<Trash2 size={13}/>} onClick={handleClearCache}>Xóa cache</Button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Google Sheets URL</label>
                  <input value={sheetsUrl} onChange={e=>setSheetsUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/..." style={INP}/>
                  <p style={{ fontSize:11, color:'#94a3b8', margin:'4px 0 8px', fontStyle:'italic' }}>Link Google Sheets chứa dữ liệu học sinh, lịch học</p>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Google Doc URL</label>
                  <input value={docUrl} onChange={e=>setDocUrl(e.target.value)} placeholder="https://docs.google.com/document/..." style={INP}/>
                  <p style={{ fontSize:11, color:'#94a3b8', margin:'4px 0 0', fontStyle:'italic' }}>Link Google Docs dùng để in phiếu, tạo báo cáo</p>
                </div>
              </div>
              {(sheetsUrl||docUrl)&&(
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {sheetsUrl&&<a href={sheetsUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#059669', background:'#ecfdf5', border:'1px solid #a7f3d0', padding:'5px 12px', textDecoration:'none' }}><ExternalLink size={12}/>Mở Google Sheets</a>}
                  {docUrl&&<a href={docUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#2563eb', background:'#eff6ff', border:'1px solid #bfdbfe', padding:'5px 12px', textDecoration:'none' }}><ExternalLink size={12}/>Mở Google Doc</a>}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── TRUNG TÂM ── */}
        {activeSection==='center'&&(
          <Section icon={School} title="Thông tin trung tâm">
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <FormGrid>
                <div><label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Tên trung tâm</label><input value={centerName} onChange={e=>setCenterName(e.target.value)} placeholder="Lớp Toán NK" style={INP}/></div>
                <div><label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Giáo viên 1</label><input value={teacher1} onChange={e=>setTeacher1(e.target.value)} placeholder="Lê Đức Nhân" style={INP}/></div>
                <div><label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Giáo viên 2</label><input value={teacher2} onChange={e=>setTeacher2(e.target.value)} placeholder="Nguyễn Thị Kiên" style={INP}/></div>
                <div><label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>SĐT liên hệ</label><input value={phone1} onChange={e=>setPhone1(e.target.value)} placeholder="0383634949" style={INP}/></div>
                <div><label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Địa chỉ cơ sở 1</label><input value={addr1} onChange={e=>setAddr1(e.target.value)} placeholder="15/80 Đào Tấn" style={INP}/></div>
                <div><label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Địa chỉ cơ sở 2</label><input value={addr2} onChange={e=>setAddr2(e.target.value)} placeholder="30 Nguyễn Quang Bích" style={INP}/></div>
              </FormGrid>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 8px', display:'flex', alignItems:'center', gap:6 }}>
                  <Clock size={12}/>Ca dạy
                </p>
                <TagList items={caDayOptions} setItems={setCaDayOptions} placeholder="Thêm ca (VD: 7h30, 19h30)..."/>
              </div>
            </div>
          </Section>
        )}

        {/* ── HỌC PHÍ ── */}
        {activeSection==='tuition'&&(
          <Section icon={DollarSign} title="Học phí & Niên khóa">
            <FormGrid>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Học phí cơ bản (đ/tháng)</label>
                <input type="number" value={baseTuition} onChange={e=>setBaseTuition(Number(e.target.value))} placeholder="600000" style={INP} min={0}/>
                <p style={{ fontSize:11, color:'#94a3b8', margin:'5px 0 0' }}>Hiện tại: <b style={{ color:'#374151' }}>{baseTuition.toLocaleString('vi-VN')}đ/tháng</b></p>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Niên khóa</label>
                <input value={schoolYear} onChange={e=>setSchoolYear(e.target.value)} placeholder="2025-2026" style={INP}/>
                <p style={{ fontSize:11, color:'#94a3b8', margin:'5px 0 0' }}>Định dạng: YYYY-YYYY</p>
              </div>
            </FormGrid>
          </Section>
        )}

        {/* ── NGÂN HÀNG ── */}
        {activeSection==='bank'&&(
          <Section icon={Landmark} title="Ngân hàng (VietQR)">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <FormGrid>
                <div><label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Bank ID</label><input value={bankId} onChange={e=>setBankId(e.target.value)} placeholder="VCB" style={INP}/><p style={{ fontSize:10, color:'#94a3b8', margin:'3px 0 0' }}>VD: VCB, MBBank, TCB</p></div>
                <div><label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Số tài khoản</label><input value={accountNo} onChange={e=>setAccountNo(e.target.value)} placeholder="1234567890" style={INP}/></div>
                <div><label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Tên tài khoản</label><input value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="LOP TOAN NK" style={{ ...INP, textTransform:'uppercase' }}/></div>
              </FormGrid>
              <div>
                <Button variant="outline" intent="primary" size="sm" icon={<Eye size={13}/>} onClick={() => setShowQR(true)}>Xem thử QR VietQR</Button>
              </div>
              <QRModal open={showQR} onClose={() => setShowQR(false)} bankId={bankId} accountNo={accountNo} accountName={accountName}/>
            </div>
          </Section>
        )}

        {/* ── ZALO ── */}
        {activeSection==='zalo'&&(
          <Section icon={MessageSquare} title="Mẫu tin nhắn Zalo">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                <select value={activeTplId} onChange={e=>setActiveTplId(e.target.value)} style={{ flex:1, minWidth:0, padding:'8px 10px', border:'1.5px solid #e2e8f0', fontSize:13, outline:'none', background:'white', cursor:'pointer' }}>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <Button size="sm" intent="primary" icon={<Plus size={13}/>} onClick={()=>{setEditingTpl(null);setShowTplModal(true);}}>Thêm</Button>
                <Button size="sm" intent="warning" variant="outline" icon={<Edit3 size={13}/>} onClick={()=>{setEditingTpl(activeTpl||null);setShowTplModal(true);}}>Sửa</Button>
                {templates.length>1&&<Button size="sm" intent="danger" variant="outline" icon={<Trash2 size={13}/>} onClick={()=>setShowDeleteTpl(true)}>Xóa</Button>}
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Nội dung mẫu</label>
                <textarea value={tplContent} onChange={e=>{ setTplContent(e.target.value); setTemplates(ts=>ts.map(t=>t.id===activeTplId?{...t,content:e.target.value}:t)); }} rows={4} style={{ ...INP, resize:'vertical' }} placeholder="Nội dung tin nhắn..."/>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, alignItems:'center' }}>
                <span style={{ fontSize:12, fontWeight:600, color:'#94a3b8' }}>Chèn biến:</span>
                {VARS.map(v => (
                  <button key={v} onClick={()=>insertVar(v)} style={{ fontSize:11, fontWeight:700, fontFamily:'monospace', padding:'3px 9px', border:'1px solid', cursor:'pointer', background:copiedVar===v?'#10b981':'#f8fafc', color:copiedVar===v?'white':'#4338ca', borderColor:copiedVar===v?'#10b981':'#c7d2fe' }}>
                    {copiedVar===v?<Check size={10}/>:null}{v}
                  </button>
                ))}
              </div>
              {showDeleteTpl&&(
                <div style={{ padding:14, background:'#fff1f2', border:'1px solid #fecaca' }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#be123c', margin:'0 0 10px' }}>Xóa mẫu "<b>{activeTpl?.name}</b>"?</p>
                  <div style={{ display:'flex', gap:8 }}>
                    <Button variant="outline" intent="neutral" fullWidth onClick={()=>setShowDeleteTpl(false)}>Hủy</Button>
                    <Button intent="danger" fullWidth onClick={handleDeleteTpl}>Xóa mẫu</Button>
                  </div>
                </div>
              )}
              <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>Biến sẽ được thay thế tự động khi gửi cho từng học sinh.</p>
              <TemplateModal open={showTplModal} onClose={()=>{setShowTplModal(false);setEditingTpl(null);}} initial={editingTpl} onSave={handleSaveTpl}/>
            </div>
          </Section>
        )}

        {/* ── GIAO DIỆN ── */}
        {activeSection==='display'&&(
          <Section icon={Paintbrush} title="Giao diện">
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 8px' }}>Cỡ chữ</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                  {FONT_SIZES.map(f => (
                    <button key={f.id} onClick={()=>setFontSize(f.id)} style={{ padding:'10px 8px', border:`1.5px solid ${fontSize===f.id?'#6366f1':'#e2e8f0'}`, fontWeight:700, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:fontSize===f.id?'#eef2ff':'white', color:fontSize===f.id?'#4338ca':'#475569' }}>
                      <span style={{ fontSize:f.px, lineHeight:1 }}>A</span>
                      <span style={{ fontSize:10, fontWeight:600 }}>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 8px' }}>Chế độ hiển thị</p>
                <div style={{ display:'flex', gap:8 }}>
                  {[{id:false,label:'🌞 Sáng'},{id:true,label:'🌙 Tối'}].map(m => (
                    <button key={String(m.id)} onClick={()=>setDarkMode(m.id)} style={{ flex:1, padding:'10px 14px', border:`1.5px solid ${darkMode===m.id?'#6366f1':'#e2e8f0'}`, fontWeight:700, fontSize:13, cursor:'pointer', background:darkMode===m.id?'#eef2ff':'white', color:darkMode===m.id?'#4338ca':'#475569' }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 4px' }}>Tuỳ chọn hiển thị</p>
                <ToggleRow label="Hiển thị Mã HS trong danh sách" val={showId} onChange={setShowId}/>
                <ToggleRow label="Ẩn học sinh đã nghỉ học theo mặc định" val={hideInactive} onChange={setHideInactive}/>
              </div>
            </div>
          </Section>
        )}

        {/* ── DỮ LIỆU ── */}
        {activeSection==='data'&&(
          <Section icon={Database} title="Dữ liệu & Cache">
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#f8fafc', border:'1px solid #e2e8f0' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:0 }}>Cache offline</p>
                  <p style={{ fontSize:11, color:'#94a3b8', margin:'2px 0 0' }}>Dữ liệu lưu tạm từ Google Sheets</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:16, fontWeight:800, color:'#6366f1', margin:0 }}>{cacheSize||'…'}</p>
                  <button onClick={handleClearCache} style={{ fontSize:12, color:'#e11d48', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Xóa cache</button>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#f8fafc', border:'1px solid #e2e8f0' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:0 }}>Cài đặt ứng dụng</p>
                  <p style={{ fontSize:11, color:'#94a3b8', margin:'2px 0 0' }}>Lưu trong localStorage của trình duyệt</p>
                </div>
                <button onClick={() => { try { localStorage.removeItem('ltn-settings'); toast.success('✅ Đã xóa cài đặt!'); } catch { toast.error('Lỗi'); } }} style={{ fontSize:12, color:'#e11d48', fontWeight:700, background:'#fff1f2', border:'1px solid #fecaca', padding:'5px 12px', cursor:'pointer' }}>Reset cài đặt</button>
              </div>
              <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>v27.1 · Lớp Toán NK</p>
            </div>
          </Section>
        )}

      </div>
    </div>
  );
}
