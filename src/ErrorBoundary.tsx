/**
 * ErrorBoundary.tsx — Lớp Toán NK v21.3
 * T4-fix: Bắt lỗi render ở bất kỳ tab nào, không crash toàn app.
 */

import React from 'react';

interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackLabel?: string },
  State
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            Lỗi hiển thị{this.props.fallbackLabel ? ` — ${this.props.fallbackLabel}` : ''}
          </h3>
          <p className="text-slate-500 text-sm max-w-sm">
            Một lỗi đã xảy ra ở khu vực này. Các phần còn lại của ứng dụng vẫn hoạt động bình thường.
          </p>
          {this.state.error && (
            <p className="mt-2 text-xs font-mono text-red-400 bg-red-50 px-3 py-2 rounded-lg max-w-sm">
              {this.state.error.message}
            </p>
          )}
        </div>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Thử lại
        </button>
      </div>
    );
  }
}
