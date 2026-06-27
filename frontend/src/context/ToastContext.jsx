import React, { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        // Remove toast automatically after 3.5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Styled Monochrome Toast Overlay Container */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 99999,
                pointerEvents: 'none'
            }}>
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        style={{
                            pointerEvents: 'auto',
                            backgroundColor: '#0A0A0A',
                            color: '#FFFFFF',
                            border: '1px solid #FFFFFF',
                            padding: '12px 20px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            minWidth: '280px',
                            maxWidth: '380px',
                            borderRadius: '0px',
                            boxSizing: 'border-box',
                            boxShadow: 'none',
                            animation: 'toastSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                        }}
                    >
                        <span style={{ flex: 1, marginRight: '16px', textAlign: 'left', lineHeight: '1.4' }}>
                            {t.type === 'error' ? '[!] ' : '[i] '}
                            {t.message}
                        </span>
                        <button
                            onClick={() => removeToast(t.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                padding: '0 4px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes toastSlideIn {
                    from { transform: translateY(12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
