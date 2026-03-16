/**
 * ClassesTab.tsx — v27.1
 * ✅ Xoá 4 khối thống kê
 * ✅ Dùng AppTable (bảng góc vuông, header xanh)
 * ✅ SearchBar + Select từ design-system
 */
import React, { useState } from 'react';
import { Edit3, Clock, Plus } from 'lucide-react';
import { resolveTeacher } from './helpers';
import { FAB, ScrollHintTable } from './AppComponents';
import { Badge, SearchBar, Select, IconButton, Button } from './dsComponents';
import { AppTable, TH_SHARED, TD_SHARED, TABLE_WRAP, trStyle } from './AppComponents';
import type { Student } from './types';

interface Props {
  uClasses: any[]; students: Student[]; tlogs: any[];
  curMo: number; curYr: number; paidNow: number; paidPct: number;
  qCls: string; setQCls: (v: string) => void;
  fClsTeacher: string; setFClsTeacher: (v: string) => void;
  isPaid: (sid: string, mo: number, yr: number) => boolean;
  onEditClass: (c: any) => void; onAddClass: () => void; uniqueBranches: string[];
}

export default function ClassesTab({
  uClasses, students, tlogs, curMo, curYr, paidNow, paidPct,
  qCls, setQCls, fClsTeacher, setFClsTeacher, isPaid, onEditClass, onAddClass, uniqueBranches,
}: Props) {
  const [fBranch, setFBranch] = useState('');
  const [hovRow, setHovRow] = useState<string | null>(null);

  const clsStats = uClasses.map(c => {
    const cls = students.filter(s => s.classId === c['Mã Lớp']);
    const paidCount = cls.filter(s => isPaid(s.id, curMo, curYr)).length;
    const pct = cls.length > 0 ? Math.round(paidCount / cls.length * 100) : 0;
    return { ...c, studentCount: cls.length, paidCount, pct };
  }).sort((a, b) => (a['Mã Lớp'] || '').localeCompare(b['Mã Lớp'] || ''));

  const filtCls = clsStats.filter(c => {
    const q = qCls.toLowerCase();
    return (!q || (c['Mã Lớp'] || '').toLowerCase().includes(q) || (c['Tên Lớp'] || '').toLowerCase().includes(q))
      && (!fClsTeacher || (c['Giáo viên'] || '').includes(fClsTeacher))
      && (!fBranch || (c['Cơ sở'] || '').includes(fBranch));
  });

  const teachers = [...new Set(uClasses.map(c => resolveTeacher(c['Giáo viên'] || '')).filter(Boolean))];
  const getSchedule = (c: any) => { const p = [c['Buổi 1'], c['Buổi 2'], c['Buổi 3']].filter(Boolean); return p.length > 0 ? p.join(' | ') : (c['Ca học'] || '---'); };

  const teacherOptions = [{ value: '', label: 'Tất cả GV' }, ...teachers.map(t => ({ value: t, label: t }))];
  const branchOptions  = [{ value: '', label: 'Tất cả cơ sở' }, ...uniqueBranches.map(b => ({ value: b, label: b }))];

  const TH = TH_SHARED;
  const TD = TD_SHARED;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Lớp học</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>{filtCls.length}/{uClasses.length} lớp · {students.length} học sinh</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <SearchBar value={qCls} onChange={setQCls} placeholder="Tìm mã/tên lớp..." width={180} />
          <Select value={fClsTeacher} onChange={setFClsTeacher} options={teacherOptions} />
          <Select value={fBranch} onChange={setFBranch} options={branchOptions} />
        </div>
      </div>

      {/* Table */}
      <div style={TABLE_WRAP}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Mã lớp', 'Lịch học', 'Sĩ số', 'Cơ sở', 'Giáo viên', `Đóng phí T${curMo}`, ''].map((h, i) => (
                  <th key={i} style={{ ...TH, textAlign: i >= 2 ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtCls.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '52px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 36 }}>🏫</span>
                    <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 14, margin: 0 }}>Chưa có lớp nào</p>
                    <Button intent="primary" size="sm" icon={<Plus size={13} />} onClick={onAddClass}>Tạo lớp đầu tiên</Button>
                  </div>
                </td></tr>
              ) : filtCls.map((c, idx) => (
                <tr key={c['Mã Lớp']} onMouseEnter={() => setHovRow(c['Mã Lớp'])} onMouseLeave={() => setHovRow(null)}
                  style={trStyle(idx, hovRow === c['Mã Lớp'])}>
                  <td style={TD}><Badge color="indigo">{c['Mã Lớp']}</Badge></td>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#475569', fontSize: 12 }}>
                      <Clock size={11} color="#6366f1" /><span>{getSchedule(c)}</span>
                    </div>
                  </td>
                  <td style={{ ...TD, textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#f1f5f9', fontWeight: 700, color: '#374151', fontSize: 13 }}>{c.studentCount}</span>
                  </td>
                  <td style={{ ...TD, color: '#475569' }}>{c['Cơ sở'] || '---'}</td>
                  <td style={{ ...TD, fontWeight: 600, color: '#374151' }}>{resolveTeacher(c['Giáo viên'] || '')}</td>
                  <td style={{ ...TD, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <Badge color={c.pct >= 80 ? 'emerald' : c.pct >= 50 ? 'amber' : 'rose'}>{c.paidCount}/{c.studentCount} ({c.pct}%)</Badge>
                      <div style={{ width: 72, height: 5, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ width: `${c.pct}%`, height: '100%', background: c.pct >= 80 ? '#10b981' : c.pct >= 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ ...TD, textAlign: 'center' }}>
                    <IconButton icon={<Edit3 size={13} />} label={`Sửa lớp ${c['Mã Lớp']}`} intent="warning" tooltip="Sửa" onClick={() => onEditClass(c)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FAB onClick={onAddClass} label="Thêm lớp học mới" />
    </div>
  );
}
