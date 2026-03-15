/**
 * ModalDelete.tsx — v26.2 (Design System)
 * MIGRATE: BTN_S → Button outline, danger button → Button intent="danger"
 * Logic/props: KHÔNG THAY ĐỔI
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ModalWrap } from './UIComponents';
import { Button } from './design-system/src';

export function DeleteModal({
  target,
  onClose,
  onConfirm,
  isSaving,
}: {
  target: { type: string; id: string; name: string };
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}) {
  return (
    <ModalWrap onClose={onClose}>
      <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

        {/* Icon */}
        <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff1f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={32} color="#e11d48" />
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Xác nhận xóa</h3>
          <p style={{ fontSize: 16, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Bạn có chắc muốn xóa{' '}
            <span style={{ fontWeight: 700, color: '#0f172a' }}>"{target.name}"</span>?<br />
            Thao tác này không thể hoàn tác.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <Button
            variant="outline"
            intent="neutral"
            fullWidth
            onClick={onClose}
          >
            Hủy bỏ
          </Button>
          <Button
            intent="danger"
            fullWidth
            loading={isSaving}
            onClick={onConfirm}
          >
            Xóa vĩnh viễn
          </Button>
        </div>

      </div>
    </ModalWrap>
  );
}
