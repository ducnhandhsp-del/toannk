/**
 * SmartAlerts.tsx — Lớp Toán NK v23.1
 * Mỗi cảnh báo mở modal báo cáo chi tiết thay vì chỉ điều hướng tab.
 *   - attendance  → AttendanceStreakModal  (HS vắng liên tiếp)
 *   - payment     → UnpaidModal            (HS chưa đóng phí)
 *   - class-size  → ClassSizeModal         (lớp sĩ số bất thường)
 *   - general     → hành động đơn giản
 */

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, CreditCard, Users, Info,
  X, Phone, Search, ChevronDown,
} from 'lucide-react';
import { cn, capitalizeName } from './helpers';
import type { SmartAlert, AlertSeverity } from './hooks/useAlerts';
import type { Student } from './types';

/* ══ Styles ══ */
const SEV: Record<AlertSeverity, {
  border: string; bg: string; iconBg: string; iconColor: string;
  badge: string; btn: string; bar: string;
}> = {
  high: {
    border:'border-red-200', bg:'bg-red-50/70',
    iconBg:'bg-red-100 border border-red-200', iconColor:'text-red-500',
    badge:'bg-red-100 text-red-700', btn:'bg-red-500 hover:bg-red-600 text-white',
    bar:'bg-red-400',
  },
  medium: {
    border:'border-orange-200', bg:'bg-orange-50/70',
    iconBg:'bg-orange-100 border border-orange-200', iconColor:'text-orange-500',
    badge:'bg-orange-100 text-orange-700', btn:'bg-orange-500 hover:bg-orange-600 text-white',
    bar:'bg-orange-400',
  },
  low: {
    border:'border-blue-200', bg:'bg-blue-50/70',
    iconBg:'bg-blue-100 border border-blue-200', iconColor:'text-blue-500',
    badge:'bg-blue-100 text-blue-700', btn:'bg-blue-500 hover:bg-blue-600 text-white',
    bar:'bg-blue-400',
  },
};

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  attendance: AlertTriangle, payment: CreditCard, 'class-size': Users, general: Info,
};

const SEV_LABEL: Record<AlertSeverity, string> = { high:'Khẩn', medium:'Lưu ý', low:'Thông tin' };

/* ══ Shared: Modal wrapper ══ */
function ReportModal({ open, onClose, title, subtitle, icon: Icon, iconBg, iconColor, children }: {
  open:boolean; onClose:()=>void; title:string; subtitle:string;
  icon: React.ComponentType<{size?:number;className?:string}>;
  iconBg:string; iconColor:string; children:React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{animation:'cmdSlideIn .15s ease-out'}}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', iconBg)}>
            <Icon size={18} className={iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-400 font-medium">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
      <style>{`@keyframes cmdSlideIn{from{opacity:0;transform:translateY(-10px) scale(.97)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 px-5 py-3 border-b border-slate-100 shrink-0 bg-slate-50/60">{children}</div>;
}

function THead({ cols }: { cols: { label: string; cls?: string }[] }) {
  return (
    <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
      <tr>{cols.map((c,i) => (
        <th key={i} className={cn('px-4 py-3 text-left text-sm font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap', c.cls)}>
          {c.label}
        </th>
      ))}</tr>
    </thead>
  );
}

function ModalFooter({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
      <span className="text-sm text-slate-400 font-medium">{left}</span>
      {right}
    </div>
  );
}

function ZaloBtn({ phone }: { phone: string }) {
  const ph = String(phone||'').replace(/\D/g,'');
  if (ph.length < 9) return <span className="text-sm text-slate-300">—</span>;
  return (
    <a href={`https://zalo.me/${ph}`} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors">
      <Phone size={12}/> Zalo
    </a>
  );
}

function SearchInput({ value, onChange, placeholder }: { value:string; onChange:(v:string)=>void; placeholder:string }) {
  return (
    <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white">
      <Search size={14} className="text-slate-400 shrink-0"/>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoFocus
        className="bg-transparent outline-none text-sm font-semibold text-slate-800 w-full placeholder:text-slate-400"/>
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }: {
  value:string; onChange:(v:string)=>void; options:string[]; placeholder:string;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-200">
        <option value="">{placeholder}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
    </div>
  );
}

/* ══ Modal 1: Vắng liên tiếp ══ */
function AttendanceStreakModal({ open, onClose, students, tlogs, goScreen }: {
  open:boolean; onClose:()=>void; students:Student[]; tlogs:any[]; goScreen:(s:any)=>void;
}) {
  const [search, setSearch]       = useState('');
  const [fClass, setFClass]       = useState('');
  const [minStreak, setMinStreak] = useState('2');

  const rows = useMemo(() => {
    return students
      .filter(s => s.status !== 'inactive' && (!s.endDate || s.endDate === '---' || s.endDate === ''))
      .map(s => {
        const logs = tlogs.filter(l => l.classId === s.classId).slice(0, 10);
        let streak = 0;
        let allAbsent = 0;
        // Count all absences
        tlogs.forEach(l => {
          (l.attendanceList||[]).forEach((a:any) => {
            if ((a.maHS||a['Mã HS'])===s.id && a['Trạng thái']==='Vắng') allAbsent++;
          });
        });
        // Consecutive streak
        for (const log of logs) {
          const att = (log.attendanceList||[]).find((a:any)=>(a.maHS||a['Mã HS'])===s.id);
          if (att && att['Trạng thái']==='Vắng') streak++;
          else if (att) break;
        }
        return { ...s, streak, allAbsent };
      })
      .filter(r => r.streak >= parseInt(minStreak||'2'))
      .sort((a,b) => b.streak - a.streak);
  }, [students, tlogs, minStreak]);

  const classes  = [...new Set(rows.map(r=>r.classId))].sort();
  const filtered = rows.filter(r =>
    (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())) &&
    (!fClass || r.classId === fClass)
  );

  return (
    <ReportModal open={open} onClose={onClose} title="Học sinh vắng liên tiếp"
      subtitle={`${rows.length} HS vắng ≥${minStreak} buổi liên tiếp`}
      icon={AlertTriangle} iconBg="bg-red-100 border-red-200" iconColor="text-red-500">

      {/* Summary */}
      <div className="flex gap-2 px-5 py-2.5 bg-red-50/40 border-b border-red-100 shrink-0 flex-wrap">
        {[
          {l:'≥5 buổi', c:rows.filter(r=>r.streak>=5).length, col:'bg-red-100 text-red-700'},
          {l:'3–4 buổi', c:rows.filter(r=>r.streak>=3&&r.streak<5).length, col:'bg-orange-100 text-orange-700'},
          {l:'2 buổi',  c:rows.filter(r=>r.streak===2).length, col:'bg-amber-100 text-amber-700'},
        ].map(b=>(
          <span key={b.l} className={cn('text-sm font-bold px-3 py-1 rounded-lg', b.col)}>
            {b.l}: <strong>{b.c}</strong>
          </span>
        ))}
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm tên, mã HS..."/>
        <FilterSelect value={fClass} onChange={setFClass} options={classes} placeholder="Tất cả lớp"/>
        <FilterSelect value={minStreak} onChange={setMinStreak} options={['2','3','4','5']} placeholder="≥2 buổi"/>
      </FilterBar>

      <div className="overflow-y-auto flex-1">
        {filtered.length === 0
          ? <div className="py-16 text-center text-slate-400 italic text-base">Không tìm thấy</div>
          : <table className="w-full">
              <THead cols={[
                {label:'#'},{label:'Học sinh'},{label:'Lớp'},
                {label:'Liên tiếp',cls:'text-red-400'},{label:'Tổng vắng'},{label:'Liên hệ PH'},
              ]}/>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r,i)=>(
                  <tr key={r.id} className={cn('hover:bg-slate-50/60', r.streak>=5?'bg-red-50/30':r.streak>=3?'bg-orange-50/20':'')}>
                    <td className="px-4 py-3 text-sm font-bold text-slate-400">{i+1}</td>
                    <td className="px-4 py-3">
                      <p className="text-base font-bold text-slate-900">{capitalizeName(r.name)}</p>
                      <p className="text-sm text-slate-400">{r.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg">{r.classId}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-base font-bold px-3 py-1 rounded-xl',
                        r.streak>=5?'bg-red-100 text-red-600':r.streak>=3?'bg-orange-100 text-orange-500':'bg-amber-100 text-amber-600')}>
                        {r.streak} buổi
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-base font-semibold text-slate-600">{r.allAbsent}</span>
                    </td>
                    <td className="px-4 py-3 text-center"><ZaloBtn phone={r.parentPhone}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>

      <ModalFooter
        left={<><strong className="text-slate-700">{filtered.length}</strong> học sinh</>}
        right={<button onClick={()=>{goScreen('operations');onClose();}} className="text-sm font-bold text-indigo-600 hover:underline">Xem nhật ký →</button>}
      />
    </ReportModal>
  );
}

/* ══ Modal 2: Chưa đóng học phí ══ */
function UnpaidModal({ open, onClose, students, uClasses, curMo, curYr, isPaid, goScreen }: {
  open:boolean; onClose:()=>void; students:Student[]; uClasses:any[];
  curMo:number; curYr:number; isPaid:(sid:string,mo:number,yr:number)=>boolean; goScreen:(s:any)=>void;
}) {
  const [search, setSearch] = useState('');
  const [fClass, setFClass] = useState('');

  const unpaid = useMemo(() =>
    students
      .filter(s => s.status!=='inactive' && (!s.endDate||s.endDate==='---'||s.endDate==='') && !isPaid(s.id,curMo,curYr))
      .sort((a,b)=>(a.classId||'').localeCompare(b.classId||'')||a.name.localeCompare(b.name)),
    [students, isPaid, curMo, curYr]
  );

  const classes  = [...new Set(unpaid.map(s=>s.classId).filter(Boolean))].sort();
  const filtered = unpaid.filter(s =>
    (!search||s.name.toLowerCase().includes(search.toLowerCase())||s.id.toLowerCase().includes(search.toLowerCase()))&&
    (!fClass||s.classId===fClass)
  );

  const byClass = useMemo(()=>{
    const m:Record<string,number>={};
    unpaid.forEach(s=>{m[s.classId]=(m[s.classId]||0)+1;});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6);
  },[unpaid]);

  return (
    <ReportModal open={open} onClose={onClose} title={`Chưa đóng học phí T${curMo}/${curYr}`}
      subtitle={`${unpaid.length} học sinh chưa đóng`}
      icon={CreditCard} iconBg="bg-orange-100 border-orange-200" iconColor="text-orange-500">

      {/* By class */}
      <div className="flex gap-2 px-5 py-2.5 bg-orange-50/40 border-b border-orange-100 shrink-0 overflow-x-auto flex-wrap">
        <span className="text-sm font-semibold text-slate-500 shrink-0 self-center">Theo lớp:</span>
        {byClass.map(([cls,cnt])=>(
          <button key={cls} onClick={()=>setFClass(fClass===cls?'':cls)}
            className={cn('text-sm font-bold px-3 py-1 rounded-lg whitespace-nowrap transition-all',
              fClass===cls?'bg-orange-500 text-white':'bg-orange-100 text-orange-700 hover:bg-orange-200')}>
            {cls}: {cnt}
          </button>
        ))}
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm tên, mã HS..."/>
        <FilterSelect value={fClass} onChange={setFClass} options={classes} placeholder="Tất cả lớp"/>
      </FilterBar>

      <div className="overflow-y-auto flex-1">
        {filtered.length===0
          ? <div className="py-16 text-center text-slate-400 italic text-base">Không tìm thấy</div>
          : <table className="w-full">
              <THead cols={[{label:'#'},{label:'Học sinh'},{label:'Lớp'},{label:'Giáo viên'},{label:'Liên hệ PH'}]}/>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s,i)=>(
                  <tr key={s.id} className="hover:bg-orange-50/20">
                    <td className="px-4 py-3 text-sm font-bold text-slate-400">{i+1}</td>
                    <td className="px-4 py-3">
                      <p className="text-base font-bold text-slate-900">{capitalizeName(s.name)}</p>
                      <p className="text-sm text-slate-400">{s.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg">{s.classId||'—'}</span>
                    </td>
                    <td className="px-4 py-3 text-base font-medium text-slate-600">{s.teacher||'—'}</td>
                    <td className="px-4 py-3"><ZaloBtn phone={s.parentPhone}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>

      <ModalFooter
        left={<><strong className="text-slate-700">{filtered.length}</strong> / {unpaid.length} chưa đóng</>}
        right={<button onClick={()=>{goScreen('finance');onClose();}} className="text-sm font-bold text-indigo-600 hover:underline">Xem tài chính →</button>}
      />
    </ReportModal>
  );
}

/* ══ Modal 3: Sĩ số bất thường ══ */
function ClassSizeModal({ open, onClose, students, uClasses, goScreen }: {
  open:boolean; onClose:()=>void; students:Student[]; uClasses:any[]; goScreen:(s:any)=>void;
}) {
  const { small, large } = useMemo(()=>{
    const active = students.filter(s=>s.status!=='inactive'&&(!s.endDate||s.endDate==='---'||s.endDate===''));
    const small  = uClasses.map(c=>({...c,count:active.filter(s=>s.classId===c['Mã Lớp']).length})).filter(c=>c.count>0&&c.count<3).sort((a,b)=>a.count-b.count);
    const large  = uClasses.map(c=>({...c,count:students.filter(s=>s.classId===c['Mã Lớp']).length})).filter(c=>c.count>20).sort((a,b)=>b.count-a.count);
    return {small,large};
  },[students,uClasses]);

  const ClassTable = ({rows,type}:{rows:any[];type:'small'|'large'})=>(
    <div>
      <div className={cn('px-5 py-2.5 text-sm font-bold uppercase tracking-wide border-b',
        type==='small'?'text-amber-700 bg-amber-50 border-amber-100':'text-orange-700 bg-orange-50 border-orange-100')}>
        {type==='small'?`⚠️ Sĩ số thấp (<3 HS) — ${rows.length} lớp`:`🔴 Quá đông (>20 HS) — ${rows.length} lớp`}
      </div>
      <table className="w-full">
        <THead cols={[{label:'Mã lớp'},{label:'Sĩ số',cls:'text-center'},{label:'Giáo viên'},{label:'Cơ sở'}]}/>
        <tbody className="divide-y divide-slate-50">
          {rows.map(c=>(
            <tr key={c['Mã Lớp']} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 text-base font-bold text-indigo-700">{c['Mã Lớp']}</td>
              <td className="px-4 py-3 text-center">
                <span className={cn('text-base font-bold px-3 py-1 rounded-xl',
                  type==='small'?'bg-amber-100 text-amber-700':'bg-orange-100 text-orange-600')}>
                  {c.count} HS
                </span>
              </td>
              <td className="px-4 py-3 text-base font-medium text-slate-600">{c['Giáo viên']||'—'}</td>
              <td className="px-4 py-3 text-base font-medium text-slate-500">{c['Cơ sở']||'—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ReportModal open={open} onClose={onClose} title="Sĩ số lớp bất thường"
      subtitle={`${small.length} lớp thiếu · ${large.length} lớp đông`}
      icon={Users} iconBg="bg-blue-100 border-blue-200" iconColor="text-blue-500">
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
        {small.length>0&&<ClassTable rows={small} type="small"/>}
        {large.length>0&&<ClassTable rows={large} type="large"/>}
        {small.length===0&&large.length===0&&(
          <div className="py-16 text-center text-slate-400 italic text-base">Không có lớp bất thường</div>
        )}
      </div>
      <ModalFooter
        left={<>Tổng <strong className="text-slate-700">{small.length+large.length}</strong> lớp cần xem xét</>}
        right={<button onClick={()=>{goScreen('classes');onClose();}} className="text-sm font-bold text-indigo-600 hover:underline">Xem lớp học →</button>}
      />
    </ReportModal>
  );
}

/* ══ MAIN ══ */
export interface SmartAlertsProps {
  alerts:   SmartAlert[];
  students: Student[];
  tlogs:    any[];
  uClasses: any[];
  curMo:    number;
  curYr:    number;
  isPaid:   (sid: string, mo: number, yr: number) => boolean;
  goScreen: (s: any) => void;
}

export default function SmartAlerts({
  alerts, students, tlogs, uClasses, curMo, curYr, isPaid, goScreen,
}: SmartAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [openModal, setOpenModal] = useState<string | null>(null);

  const visible = alerts.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    if (openModal === id) setOpenModal(null);
  };

  const HAS_MODAL = new Set(['attendance-streak','payment-unpaid','class-small','class-large']);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-red-500 to-orange-400 inline-block"/>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cảnh báo thông minh</span>
          <span className="text-sm font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{visible.length}</span>
        </div>

        {visible.map(alert => {
          const s    = SEV[alert.severity];
          const Icon = ICONS[alert.type] || Info;
          return (
            <div key={alert.id} className={cn('relative flex items-center gap-4 px-4 py-3.5 rounded-2xl border shadow-sm overflow-hidden', s.bg, s.border)}>
              <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl', s.bar)}/>
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-1 border', s.iconBg)}>
                <Icon size={20} className={s.iconColor}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn('text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md', s.badge)}>
                    {SEV_LABEL[alert.severity]}
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900 leading-snug">{alert.title}</p>
                <p className="text-sm text-slate-500 font-medium mt-0.5 line-clamp-1">{alert.description}</p>
              </div>
              <button
                onClick={() => HAS_MODAL.has(alert.id) ? setOpenModal(alert.id) : alert.actions[0]?.handler()}
                className={cn('shrink-0 text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap', s.btn)}>
                {HAS_MODAL.has(alert.id) ? 'Xem báo cáo →' : (alert.actions[0]?.label ?? 'Xem')}
              </button>
              <button onClick={()=>dismiss(alert.id)}
                className="shrink-0 w-8 h-8 rounded-xl bg-white/60 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all border border-white/80">
                <X size={14}/>
              </button>
            </div>
          );
        })}
      </div>

      <AttendanceStreakModal open={openModal==='attendance-streak'} onClose={()=>setOpenModal(null)} students={students} tlogs={tlogs} goScreen={goScreen}/>
      <UnpaidModal open={openModal==='payment-unpaid'} onClose={()=>setOpenModal(null)} students={students} uClasses={uClasses} curMo={curMo} curYr={curYr} isPaid={isPaid} goScreen={goScreen}/>
      <ClassSizeModal open={openModal==='class-small'||openModal==='class-large'} onClose={()=>setOpenModal(null)} students={students} uClasses={uClasses} goScreen={goScreen}/>
    </>
  );
}
