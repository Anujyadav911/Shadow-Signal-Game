import React from 'react';

interface ShadowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export const ShadowButton: React.FC<ShadowButtonProps> = ({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    disabled,
    ...props
}) => {

    const baseStyles = "relative px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_0_rgb(67,56,202)] active:shadow-none active:translate-y-[4px] focus:ring-indigo-500",
        secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100 shadow-[0_4px_0_rgb(55,65,81)] active:shadow-none active:translate-y-[4px] focus:ring-gray-500",
        danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-[0_4px_0_rgb(190,18,60)] active:shadow-none active:translate-y-[4px] focus:ring-rose-500",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                </span>
            ) : children}
        </button>
    );
};
