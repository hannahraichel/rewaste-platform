import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            style={{
                backgroundColor: 'var(--bg-dark)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                height: '40px', /* Matches your dashboard action button heights precisely */
                boxSizing: 'border-box'
            }}
        >
            {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
    );
};

export default ThemeToggle;