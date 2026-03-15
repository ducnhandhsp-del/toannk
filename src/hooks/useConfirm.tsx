/**
 * useConfirm.tsx — Tách riêng từ UIComponents.tsx để tương thích Vite Fast Refresh
 * Hook không được export chung file với React components
 */

import { useState } from 'react';
import { ConfirmDialog } from '../UIComponents';

export function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    resolver: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    resolver: null,
  });

  const confirm = (
    title: string,
    message: string,
    variant: 'danger' | 'warning' | 'info' = 'info'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title,
        message,
        variant,
        resolver: resolve,
      });
    });
  };

  const handleConfirm = () => {
    state.resolver?.(true);
    setState(prev => ({ ...prev, isOpen: false, resolver: null }));
  };

  const handleCancel = () => {
    state.resolver?.(false);
    setState(prev => ({ ...prev, isOpen: false, resolver: null }));
  };

  const ConfirmComponent = () => (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={state.title}
      message={state.message}
      variant={state.variant}
    />
  );

  return { confirm, ConfirmDialog: ConfirmComponent };
}
