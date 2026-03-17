/**
 * FinanceTab.tsx — v27.1
 * ✅ Xoá khối thống kê ở Sổ cái và Chi tiêu
 * ✅ Giữ StatBlock tóm tắt chỉ ở header chung + tab Công nợ
 * ✅ AppTable (header màu xanh đậm, góc vuông)
 * ✅ Công nợ đặt ĐẦU TIÊN
 */
import React, { useMemo, useState } from 'react';
import { DollarSign, TrendingDown, Eye, Edit3, Trash2, Plus, Search, Check, X as XIcon } from 'lucide-react';
import { fmtVND, formatDate, capitalizeName, FINANCE_MONTHS } from './helpers';
import { Badge, Pager, FilterTabs } from './dsComponents';
import { FAB } from './AppComponents';
import { StatBlock, StatGrid, TABLE_WRAP, TH_SHARED, TD_SHARED, trStyle, fmtM } from './AppComponents';
import type { Payment, Expense, Student, SummaryData, FinanceSub } from './types';

const ZaloIcon = () => (
  <svg viewBox="0 0 48 48" style={{ width:16, height:16 }} fill="currentColor">
    <path d="M24 4C12.954 4 4 12.954 4 24c0 3.594.945 6.97 2.6 9.89L4 44l10.374-2.554A19.9 19.9 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4zm-6.5 13h3v10h-3V17zm4.5 0h3v1.5c.8-.95 1.95-1.5 3-1.5 2.75 0 4 1.9 4 4.5V27h-3v-5.5c0-1.4-.55-2.5-2-2.5s-2 1.1-2 2.5V27h-3V17z"/>
  </svg>
);

interface Props {
  summary: SummaryData | null; payments: Payment[]; expenses: Expense[];
  students: Student[]; uClasses: any[]; tlogs: any[];
  curMo: number; curYr: number;
  qF: string; setQF: (v: string) => void;
  fMo: string; setFMo: (v: string) => void;
  fTch: string; setFTch: (v: string) => void;
  fFC: string; setFFC: (v: string) => void;
  fSt: string; setFSt: (v: string) => void;
  pgF: number; setPgF: (p: number) => void;
  filtFin: Student[];
  isPaid: (sid: string, mo: number, yr: number) => boolean;
  zaloTpl: string; baseTuition: number; schoolYear: string;
  onViewInvoice: (p: Payment) => void;
  onViewFinance: (s: Student) => void;
  onShowFAB: () => void;
  onEditPayment: (p: Payment) => void; onDeletePayment: (p: Payment) => void;
  onEditExpense: (e: Expense) => void; onDeleteExpense: (e: Expense) => void;
}

const IPP = 10;

export default function FinanceTab({
  summary, payments, expenses, students, uClasses, tlogs,
  curMo, curYr, qF, setQF, fMo, setFMo, fTch, setFTch, fFC, setFFC, fSt, setFSt,
  pgF, setPgF, filtFin, isPaid, zaloTpl, baseTuition, schoolYear,
  onViewInvoice, onViewFinance, onShowFAB, onEditPayment, onDeletePayment, onEditExpense, onDeleteExpense,
}: Props) {
  const [finSub, setFinSub] = useState<FinanceSub>('debt');
  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const pagedFin = filtFin.slice((pgF - 1) * IPP, pgF * IPP);
  const [fM, fY] = (fMo || '01/2026').split('/').map(Number);
  const makeZaloMsg = (s: Student) => zaloTpl.replace('[Thang]', String(curMo)).replace('[Ten]', s.name).replace('[SoTien]', fmtVND(baseTuition));
  const paidNow = useMemo(() => students.filter(s => isPaid(s.id, curMo, curYr)).length, [students, isPaid, curMo, curYr]);

  const schoolYearMonths = useMemo(() => {
    const parts = (schoolYear || '2025-2026').split('-').map(Number);
    const y1 = parts[0] || new Date().getFullYear(), y2 = parts[1] || y1 + 1;
    const m: { m: number; y: number; label: string }[] = [];
    for (let mo = 7; mo <= 12; mo++) m.push({ m: mo, y: y1, label: `T${mo}` });
    for (let mo = 1; mo <= 6; mo++)  m.push({ m: mo, y: y2, label: `T${mo}` });
    return m;
  }, [schoolYear]);

  const [hovPay, setHovPay] = useState<number|null>(null);
  const [hovExp, setHovExp] = useState<number|null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header + sub-tabs + filters inline */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, flexShrink: 0 }}>Tài chính</h2>
        <span style={{ width: 1, height: 22, background: '#e2e8f0', flexShrink: 0 }} />
        {/* Công nợ FIRST */}
        <div style={{ padding: 3, background: '#f1f5f9' }}>
          <FilterTabs variant="segment" size="sm" active={finSub} onChange={id => setFinSub(id as FinanceSub)}
            tabs={[
              { id: 'debt',   label: '⚠ Công nợ' },
              { id: 'ledger', label: '📋 Sổ cái' },
              { id: 'expense',label: '📉 Chi tiêu' },
            ]} />
        </div>

        {/* Debt filters inline */}
        {finSub === 'debt' && (<>
          <span style={{ width: 1, height: 22, background: '#e2e8f0', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', border: '1px solid #e2e8f0', background: 'white', borderRadius: 8, flex: 1, maxWidth: 200 }}>
            <Search size={12} color="#94a3b8" />
            <input value={qF} onChange={e => { setQF(e.target.value); setPgF(1); }} placeholder="Tìm tên HS..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 12, fontWeight: 600, color: '#0f172a', width: '100%' }} />
          </div>
          <input type="month" value={fMo ? `${fMo.split('/')[1]}-${fMo.split('/')[0].padStart(2,'0')}` : ''}
            onChange={e => { const [y,m] = e.target.value.split('-'); setFMo(`${m}/${y}`); setPgF(1); }}
            style={{ background: 'white', color: '#0f172a', padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: 12, outline: 'none' }} />
          <select value={fSt} onChange={e => { setFSt(e.target.value); setPgF(1); }} style={{ background: 'white', color: '#0f172a', padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
            <option value="unpaid">Chưa đóng</option><option value="paid">Đã đóng</option><option value="">Tất cả</option>
          </select>
          <select value={fFC} onChange={e => { setFFC(e.target.value); setPgF(1); }} style={{ background: 'white', color: '#0f172a', padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
            <option value="">Tất cả lớp</option>
            {uClasses.map(c => <option key={c['Mã Lớp']} value={c['Mã Lớp']}>{c['Mã Lớp']}</option>)}
          </select>
          <span style={{ fontSize: 12, fontWeight: 700, color: fSt === 'unpaid' ? '#e11d48' : '#059669', background: fSt === 'unpaid' ? '#fff1f2' : '#ecfdf5', padding: '5px 10px' }}>{filtFin.length} HS</span>
        </>)}
      </div>

      {/* Summary StatBlocks — chỉ hiện ở Công nợ */}
      {finSub === 'debt' && (
        <StatGrid>
          <StatBlock icon={DollarSign} value={fmtM(totalRevenue)} label="Tổng thu"    sub={`${payments.length} phiếu thu`}  gradient="linear-gradient(135deg,#10b981,#059669)" />
          <StatBlock icon={TrendingDown} value={fmtM(totalExpense)} label="Tổng chi"  sub={`${expenses.length} phiếu chi`}  gradient="linear-gradient(135deg,#f43f5e,#e11d48)" />
          <StatBlock icon={DollarSign} value={fmtM(totalRevenue-totalExpense)} label="Lợi nhuận" sub={(totalRevenue-totalExpense)>=0?'Dương':'Âm'} gradient={(totalRevenue-totalExpense)>=0?'linear-gradient(135deg,#6366f1,#4f46e5)':'linear-gradient(135deg,#f97316,#ea580c)'} />
          <StatBlock icon={DollarSign} value={`${paidNow}/${students.length}`} label={`Đóng phí T${curMo}`} sub="học sinh đã đóng" gradient="linear-gradient(135deg,#0ea5e9,#2563eb)" />
        </StatGrid>
      )}

      {/* ══ CÔNG NỢ ══ */}
      {finSub === 'debt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Niên khóa:</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: '#eef2ff', border: '1px solid #c7d2fe', padding: '2px 10px' }}>{schoolYear}</span>
          </div>
          <div style={TABLE_WRAP}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'min-content' }}>
                <thead>
                  <tr>
                    <th style={{ ...TH_SHARED, textAlign: 'left' }}>Học sinh</th>
                    <th style={{ ...TH_SHARED, textAlign: 'center' }}>Lớp</th>
                    {schoolYearMonths.map(fm => {
                      const isCur = fm.m === curMo && fm.y === curYr;
                      return (
                        <th key={`${fm.m}-${fm.y}`} style={{ ...TH_SHARED, textAlign: 'center', minWidth: 44, background: isCur ? '#EEF2FF' : '#F8FAFC', color: isCur ? '#4F46E5' : '#64748B', borderLeft: isCur ? '2px solid #C7D2FE' : undefined, borderRight: isCur ? '2px solid #C7D2FE' : undefined }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <span>{fm.label}</span>
                            {isCur && <span style={{ fontSize: 7, fontWeight: 800, color: '#c7d2fe', background: 'rgba(255,255,255,0.15)', padding: '1px 4px', letterSpacing: '0.1em' }}>NOW</span>}
                          </div>
                        </th>
                      );
                    })}
                    <th style={{ ...TH_SHARED, textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedFin.length === 0
                    ? <tr><td colSpan={schoolYearMonths.length + 3} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>Không có dữ liệu</td></tr>
                    : pagedFin.map((s, rowIdx) => {
                      const ph = String(s.parentPhone || '').replace(/\D/g, '');
                      const zMsg = makeZaloMsg(s);
                      const unpaidCount = schoolYearMonths.filter(fm => !isPaid(s.id, fm.m, fm.y)).length;
                      const isProblem = unpaidCount > 2;
                      return (
                        <tr key={s.id} style={trStyle(rowIdx)}>
                          <td style={{ ...TD_SHARED, whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: isProblem ? '#ef4444' : '#a7f3d0' }} />
                              <div>
                                <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: 13 }}>{capitalizeName(s.name)}</p>
                                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{s.id}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ ...TD_SHARED, textAlign: 'center' }}><Badge color="indigo">{s.classId}</Badge></td>
                          {schoolYearMonths.map(fm => {
                            const paid = isPaid(s.id, fm.m, fm.y);
                            const isCurCol = fm.m === curMo && fm.y === curYr;
                            return (
                              <td key={`${fm.m}-${fm.y}`} style={{ ...TD_SHARED, textAlign: 'center', padding: '9px 5px', background: isCurCol ? (paid ? '#ecfdf5' : '#fef2f2') : 'transparent', borderLeft: isCurCol ? '1px solid #c7d2fe' : undefined, borderRight: isCurCol ? '1px solid #c7d2fe' : undefined }}>
                                {paid
                                  ? <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(5,150,105,0.3)' }}><Check size={11} color="white" strokeWidth={3} /></div>
                                  : <div style={{ width: 26, height: 26, borderRadius: '50%', background: isCurCol ? '#fecaca' : '#f1f5f9', border: `1.5px solid ${isCurCol ? '#fca5a5' : '#e2e8f0'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><XIcon size={10} color={isCurCol ? '#ef4444' : '#cbd5e1'} strokeWidth={2.5} /></div>
                                }
                              </td>
                            );
                          })}
                          <td style={{ ...TD_SHARED, textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                              <button onClick={() => onViewFinance(s)} style={{ width: 30, height: 30, background: '#eef2ff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={13} color="#6366f1" /></button>
                              {ph.length >= 9 && !isPaid(s.id, fM, fY) && (
                                <a href={`https://zalo.me/${ph}?text=${encodeURIComponent(zMsg)}`} target="_blank" rel="noopener noreferrer" style={{ width: 30, height: 30, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#0068FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="Nhắc Zalo"><ZaloIcon /></a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
              <Pager page={pgF} total={filtFin.length} perPage={IPP} setPage={setPgF} showTotal />
            </div>
          </div>
        </div>
      )}

      {/* ══ SỔ CÁI — NO stat blocks ══ */}
      {finSub === 'ledger' && (
        <div style={TABLE_WRAP}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
            <DollarSign size={14} color="#10b981" />
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Thu học phí ({payments.length} phiếu thu)</p>
          </div>
          {/* Desktop */}
          <div className="fin-desktop" style={{ overflowX: 'auto' }}>
            <style>{`.fin-desktop{display:block}.fin-mobile{display:none}@media(max-width:767px){.fin-desktop{display:none!important}.fin-mobile{display:block!important}}`}</style>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Thời gian', 'Học sinh', 'Người nộp', 'Nội dung', 'Số tiền', ''].map((h, i) => (
                    <th key={i} style={{ ...TH_SHARED, textAlign: i >= 4 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.length === 0
                  ? <tr><td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có phiếu thu</td></tr>
                  : payments.slice().reverse().slice(0, 30).map((p, i) => (
                    <tr key={i} onMouseEnter={() => setHovPay(i)} onMouseLeave={() => setHovPay(null)} style={trStyle(i, hovPay === i)}>
                      <td style={{ ...TD_SHARED, fontSize: 12, color: '#475569' }}>{formatDate(p.date)}</td>
                      <td style={TD_SHARED}>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: 13 }}>{capitalizeName(p.studentName)}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{p.docNum}</p>
                      </td>
                      <td style={TD_SHARED}>{p.payer || '---'}</td>
                      <td style={TD_SHARED}>{p.description}</td>
                      <td style={{ ...TD_SHARED, textAlign: 'right', fontWeight: 700, color: '#059669' }}>+{fmtVND(p.amount)}</td>
                      <td style={{ ...TD_SHARED, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                          <button onClick={() => onViewInvoice(p)} style={{ width: 30, height: 30, background: '#fff7ed', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={13} color="#f97316" /></button>
                          <button onClick={() => onEditPayment(p)} style={{ width: 30, height: 30, background: '#eef2ff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit3 size={13} color="#6366f1" /></button>
                          <button onClick={() => onDeletePayment(p)} style={{ width: 30, height: 30, background: '#fff1f2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} color="#f87171" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="fin-mobile">
            {payments.length === 0
              ? <p style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: '32px 16px', fontSize: 13 }}>Chưa có phiếu thu</p>
              : payments.slice().reverse().slice(0, 30).map((p, i) => (
                <div key={i} style={{ padding: '11px 14px', borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f9fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{capitalizeName(p.studentName)}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{formatDate(p.date)} · {p.method || '---'}</p>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#059669', flexShrink: 0 }}>+{fmtVND(p.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => onViewInvoice(p)} style={{ flex: 1, padding: '6px 0', background: '#fff7ed', color: '#f97316', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Xem phiếu</button>
                    <button onClick={() => onEditPayment(p)} style={{ flex: 1, padding: '6px 0', background: '#eef2ff', color: '#6366f1', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Sửa</button>
                    <button onClick={() => onDeletePayment(p)} style={{ width: 34, padding: '6px 0', background: '#fff1f2', color: '#f87171', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ══ CHI TIÊU — NO stat blocks ══ */}
      {finSub === 'expense' && (
        <div style={TABLE_WRAP}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
            <TrendingDown size={14} color="#f87171" />
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Chi tiêu ({expenses.length} phiếu chi)</p>
          </div>
          {/* Desktop */}
          <div className="fin-exp-desktop" style={{ overflowX: 'auto' }}>
            <style>{`.fin-exp-desktop{display:block}.fin-exp-mobile{display:none}@media(max-width:767px){.fin-exp-desktop{display:none!important}.fin-exp-mobile{display:block!important}}`}</style>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Ngày', 'Nội dung', 'Hạng mục', 'Người chi', 'Số tiền', ''].map((h, i) => (
                    <th key={i} style={{ ...TH_SHARED, textAlign: i >= 4 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0
                  ? <tr><td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có phiếu chi</td></tr>
                  : expenses.slice().reverse().map((e, i) => (
                    <tr key={i} onMouseEnter={() => setHovExp(i)} onMouseLeave={() => setHovExp(null)} style={trStyle(i, hovExp === i)}>
                      <td style={{ ...TD_SHARED, fontSize: 12, color: '#475569' }}>{formatDate(e.date)}</td>
                      <td style={TD_SHARED}>{e.description}</td>
                      <td style={TD_SHARED}><Badge color="amber">{e.category}</Badge></td>
                      <td style={TD_SHARED}>{e.spender}</td>
                      <td style={{ ...TD_SHARED, textAlign: 'right', fontWeight: 700, color: '#e11d48' }}>-{fmtVND(e.amount)}</td>
                      <td style={{ ...TD_SHARED, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                          <button onClick={() => onEditExpense(e)} style={{ width: 30, height: 30, background: '#eef2ff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit3 size={13} color="#6366f1" /></button>
                          <button onClick={() => onDeleteExpense(e)} style={{ width: 30, height: 30, background: '#fff1f2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} color="#f87171" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="fin-exp-mobile">
            {expenses.length === 0
              ? <p style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: '32px 16px', fontSize: 13 }}>Chưa có phiếu chi</p>
              : expenses.slice().reverse().map((e, i) => (
                <div key={i} style={{ padding: '11px 14px', borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f9fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{e.description}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{formatDate(e.date)} · {e.category}</p>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#e11d48', flexShrink: 0 }}>-{fmtVND(e.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => onEditExpense(e)} style={{ flex: 1, padding: '6px 0', background: '#eef2ff', color: '#6366f1', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Sửa</button>
                    <button onClick={() => onDeleteExpense(e)} style={{ flex: 1, padding: '6px 0', background: '#fff1f2', color: '#f87171', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Xóa</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      <FAB onClick={onShowFAB} label="Thêm phiếu thu/chi" icon={Plus} color="#059669" shadow="0 8px 24px rgba(5,150,105,0.5)" />
    </div>
  );
}
