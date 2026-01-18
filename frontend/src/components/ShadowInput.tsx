import React from 'react';

interface ShadowInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const ShadowInput: React.FC<ShadowInputProps> = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
            <input
                className={`w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-500 transition-all ${error ? 'border-rose-500 focus:border-rose-500' : ''} ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-rose-400">{error}</p>}
        </div>
    );
};
