import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'orange' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = "flex justify-center items-center font-bold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const sizes = {
        sm: "px-3 py-1.5 text-xs rounded-lg",
        md: "px-5 py-2.5 text-sm rounded-xl",
        lg: "px-8 py-3.5 text-base rounded-2xl",
    };

    const variants = {
        primary: "text-white bg-slate-900 hover:bg-slate-800 focus:ring-slate-500",
        secondary: "text-slate-700 bg-slate-100 hover:bg-slate-200 focus:ring-slate-300",
        danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
        orange: "text-white bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 shadow-md shadow-orange-100",
        outline: "text-slate-600 bg-transparent border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-200",
    };

    return (
        <button
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}
