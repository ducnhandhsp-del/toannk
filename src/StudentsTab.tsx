/**
 * StudentsTab.tsx — v26.2 (Design System)
 * MIGRATE:
 *   - Inline search div → SearchBar
 *   - Inline select → Select component
 *   - Lớp / Học lực span → Badge
 *   - Table action buttons → TableActions + IconButton
 *   - Bulk transfer button → Button intent="primary"
 *   - Toggle inactive → Button variant="outline"/"solid"
 *   - Pager → từ design-system (compatible API)
 * Logic/state/filter/pagination: KHÔNG THAY ĐỔI
 */
import React, { useState } from 'react';
import { UserPlus, Eye, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { IPP, capitalizeName, isStudentActive } from './helpers';
import { ScrollHintTable, FAB } from './FAB';
import { TABLE_WRAP, TH_SHARED, TD_SHARED, trStyle } from './AppComponents';
import { Badge, Pager, SearchBar, Button, IconButton, TableActions, Select } from './design-system/src';
import type { Student, DeleteTarget } from './types';

interface Props {
  filtS:           Student[];
  pgS:             number;
  setPgS:          (p: number) => void;
  students:        Student[];
  qS:              string;
  setQS:           (v: string) => void;
  fCls:            string;
  setFCls:         (v: string) => void;
  uClasses:        any[];
  onViewStudent:   (s: Student) => void;
  onEditStudent:   (s: Student) => void;
  onDeleteStudent: (t: DeleteTarget) => void;
  onAddStudent:    () => void;
  onBulkTransfer:  (ss: Student[]) => void;
  curMo:           number;
  curYr:           number;
  isPaid:          (sid: string, mo: number, yr: number) => boolean;
  zaloTpl:         string;
  baseTuition:     number;
}

const LEVEL_COLOR: Record<string, { color: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate' }> = {
  'Xuất sắc':   { color: 'emerald' },
  'Giỏi':       { color: 'emerald' },
  'Khá':        { color: 'indigo'  },
  'Trung bình': { color: 'amber'   },
  'Yếu':        { color: 'rose'    },
};

export default function StudentsTab({
  filtS, pgS, setPgS, students, qS, setQS,
  fCls, setFCls, uClasses,
  onViewStudent, onEditStudent, onDeleteStudent,
  onAddStudent, onBulkTransfer,
}: Props) {
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [hideInactive, setHideInactive] = useState(false);
  const [hovRow,       setHovRow]       = useState<string | null>(null);

  const visible = filtS.filter(s => hideInactive ? isStudentActive(s) : true);
  const paged   = visible.slice((pgS - 1) * IPP, pgS * IPP);

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const selectedStudents = students.filter(s => selected.has(s.id));

  const TH = TH_SHARED;
  const TD = TD_SHARED;

  /* Class select options */
  const classOptions = [
    { value: '', label: 'Tất cả lớp' },
    ...uClasses.map(c => ({ value: c['Mã Lớp'], label: c['Mã Lớp'] })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
            Học sinh
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>
            {visible.length}/{students.length} học sinh
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

          {/* Bulk transfer */}
          {selected.size > 0 && (
            <Button
              intent="primary"
              size="sm"
              icon={<ArrowRight size={14} />}
              iconPosition="left"
              onClick={() => { onBulkTransfer(selectedStudents); setSelected(new Set()); }}
            >
              Chuyển lớp ({selected.size})
            </Button>
          )}

          {/* Toggle ẩn HS nghỉ */}
          <Button
            variant={hideInactive ? 'solid' : 'outline'}
            intent={hideInactive ? 'primary' : 'neutral'}
            size="sm"
            onClick={() => { setHideInactive(h => !h); setPgS(1); }}
            aria-pressed={hideInactive}
          >
            {hideInactive ? '● Đang học' : '○ Tất cả'}
          </Button>

          {/* SearchBar */}
          <SearchBar
            value={qS}
            onChange={v => { setQS(v); setPgS(1); }}
            placeholder="Tìm tên, mã HS..."
            width={200}
          />

          {/* Class filter */}
          <Select
            value={fCls}
            onChange={v => { setFCls(v); setPgS(1); }}
            options={classOptions}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div style={TABLE_WRAP}>
        <ScrollHintTable>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr>
                {/* Checkbox col */}
                <th style={{ ...TH, width: 40, textAlign: 'center' }} />
                {['Học sinh', 'Lớp', 'Học lực', 'SĐT phụ huynh', 'Thao tác'].map(h => (
                  <th key={h} style={{ ...TH, textAlign: h === 'Thao tác' ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '56px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 40 }}>👤</span>
                      <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 15, margin: 0 }}>Không có học sinh nào</p>
                      <Button intent="primary" size="sm" icon={<UserPlus size={14} />} onClick={onAddStudent}>
                        Thêm học sinh đầu tiên
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : paged.map(s => {
                const inactive  = !isStudentActive(s);
                const levelConf = LEVEL_COLOR[s.academicLevel] || { color: 'slate' as const };

                return (
                  <tr
                    key={s.id}
                    onMouseEnter={() => setHovRow(s.id)}
                    onMouseLeave={() => setHovRow(null)}
                    style={{ ...trStyle(paged.indexOf(s), hovRow === s.id), opacity: inactive ? 0.5 : 1 }}
                  >
                    {/* Checkbox */}
                    <td style={{ ...TD, width: 40, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        aria-label={`Chọn ${s.name}`}
                      />
                    </td>

                    {/* Tên + mã */}
                    <td style={TD}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {capitalizeName(s.name)}
                      </p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                        {s.id}
                      </p>
                    </td>

                    {/* Lớp → Badge */}
                    <td style={TD}>
                      <Badge color="indigo">{s.classId || '---'}</Badge>
                    </td>

                    {/* Học lực → Badge */}
                    <td style={TD}>
                      <Badge color={levelConf.color}>{s.academicLevel || '---'}</Badge>
                    </td>

                    {/* SĐT */}
                    <td style={TD}>
                      <span style={{ color: '#475569', fontWeight: 500 }}>{s.parentPhone || '---'}</span>
                    </td>

                    {/* Actions → TableActions */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <TableActions actions={[
                        { icon: <Eye   size={13} />, label: `Xem ${s.name}`,  intent: 'primary', onClick: () => onViewStudent(s) },
                        { icon: <Edit3 size={13} />, label: `Sửa ${s.name}`,  intent: 'warning', onClick: () => onEditStudent(s) },
                        { icon: <Trash2 size={13}/>, label: `Xóa ${s.name}`,  intent: 'danger',  onClick: () => onDeleteStudent({ type: 'student', id: s.id, name: s.name }) },
                      ]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollHintTable>

        {/* Pager từ design-system — API tương thích */}
        <Pager page={pgS} total={visible.length} perPage={IPP} setPage={setPgS} showTotal />
      </div>

      <FAB onClick={onAddStudent} label="Thêm học sinh mới" icon={UserPlus} />
    </div>
  );
}
