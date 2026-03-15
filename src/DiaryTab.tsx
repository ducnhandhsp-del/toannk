/**
 * DiaryTab.tsx — Lớp Toán NK v21.2
 * v21.2: Thêm cột "Ca dạy", bỏ nút Thêm Lớp/Thêm HS khỏi quick-actions (FAB handles),
 *        typography cải thiện
 */

import React from 'react';
import { Search, Eye, Edit3, Plus, Calendar, Clock } from 'lucide-react';
import { cn, card, TH, TD, formatDate } from './helpers';
import { Badge, Pager, DiaryCard } from './UIComponents';

interface DiaryTabProps {
  filtD:        any[];
  pgD:          number;
  setPgD:       (p: number) => void;
  qD:           string;
  setQD:        (v: string) => void;
  dCls:         string;
  setDCls:      (v: string) => void;
  uClasses:     any[];
  onViewDiary:  (log: any) => void;
  onEditDiary:  (log: any) => void;
  onAddDiary:   () => void;
  onAddStudent: () => void;
  onAddClass:   () => void;
  onShowFAB:    () => void;
  IPP:          number;
}

export default function DiaryTab({
  filtD, pgD, setPgD, qD, setQD, dCls, setDCls,
  uClasses, onViewDiary, onEditDiary, onAddDiary,
  onAddStudent, onAddClass, onShowFAB, IPP,
}: DiaryTabProps) {

  const paged = filtD.slice((pgD - 1) * IPP, pgD * IPP);

  return (
    <div className="space-y-4">

      {/* Header + bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase">Nhật ký giảng dạy</h2>
          <p className="text-slate-500 text-base">{filtD.length} buổi đã ghi</p>
        </div>
        <div className="flex gap-2 sm:ml-auto flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm flex-1 sm:flex-none">
            <Search size={14} className="text-slate-400" />
            <input
              value={qD}
              onChange={e => { setQD(e.target.value); setPgD(1); }}
              placeholder="Tìm lớp, nội dung..."
              className="bg-transparent outline-none text-base font-semibold text-slate-900 w-full sm:w-36 placeholder:text-slate-400"
            />
          </div>
          <select
            value={dCls}
            onChange={e => { setDCls(e.target.value); setPgD(1); }}
            className="bg-white text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-base outline-none cursor-pointer appearance-none shadow-sm"
          >
            <option value="">Tất cả lớp</option>
            {uClasses.map(c => (
              <option key={c['Mã Lớp']} value={c['Mã Lớp']}>{c['Mã Lớp']}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop table */}
      <div className={cn(card, 'hidden md:block overflow-hidden')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className={cn(TH, 'rounded-tl-2xl')}>Ngày</th>
                <th className={TH}>Mã Lớp</th>
                <th className={TH}>Ca dạy</th>
                <th className={TH}>Nội dung bài dạy</th>
                <th className={cn(TH, 'text-center')}>Có mặt</th>
                <th className={cn(TH, 'text-center')}>Vắng</th>
                <th className={cn(TH, 'text-center rounded-tr-2xl')}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic text-lg">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                paged.map((l, i) => (
                  <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className={cn(TD, 'whitespace-nowrap')}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                          <Calendar size={14} className="text-indigo-600" />
                        </div>
                        <span className="font-medium text-slate-700">{formatDate(l.date)}</span>
                      </div>
                    </td>
                    <td className={TD}>
                      <Badge color="indigo">{l.classId}</Badge>
                    </td>
                    <td className={TD}>
                      {l.caDay ? (
                        <span className="flex items-center gap-1 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg w-fit">
                          <Clock size={11} />
                          {l.caDay}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm">---</span>
                      )}
                    </td>
                    <td className={cn(TD, 'max-w-[260px]')}>
                      <p className="font-medium text-slate-800">{l.content}</p>
                      {l.homework && l.homework !== '---' && (
                        <p className="text-sm text-slate-400 mt-0.5">📖 {l.homework}</p>
                      )}
                    </td>
                    <td className={cn(TD, 'text-center')}>
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 font-bold text-emerald-700">
                        {l.present}
                      </span>
                    </td>
                    <td className={cn(TD, 'text-center')}>
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-red-100 font-bold text-red-600">
                        {l.absent}
                      </span>
                    </td>
                    <td className={cn(TD, 'text-center')}>
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => onViewDiary(l)}
                          className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); onEditDiary(l); }}
                          className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pager page={pgD} total={filtD.length} perPage={IPP} setPage={setPgD} />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {paged.map((l, i) => (
          <DiaryCard
            key={i}
            log={l}
            onDetail={() => onViewDiary(l)}
            onEdit={() => onEditDiary(l)}
          />
        ))}
        <Pager page={pgD} total={filtD.length} perPage={IPP} setPage={setPgD} />
      </div>

      {/* FAB */}
      <button
        onClick={onAddDiary}
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-40 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-indigo-200 transition-all print:hidden"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
