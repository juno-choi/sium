'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-4">
                    <div className="text-center max-w-md mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            오류가 발생했습니다
                        </h1>
                        <p className="text-gray-600 mb-6 break-words">
                            {this.state.error?.message || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>페이지 새로고침</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
