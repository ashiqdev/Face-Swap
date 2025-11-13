
import React from 'react';
import Loader from './Loader';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  isLoading = false,
  children,
  disabled,
  variant = 'primary',
  icon,
  ...props
}) => {
  const baseClasses = "flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg";
  const variantClasses = {
    primary: 'bg-brand-primary hover:bg-blue-500 text-white focus:ring-brand-primary',
    secondary: 'bg-brand-secondary hover:bg-purple-500 text-white focus:ring-brand-secondary',
  };
  const disabledClasses = "disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses}`}
      {...props}
    >
      {isLoading ? (
        <Loader className="w-5 h-5" />
      ) : (
        <>
          {icon && <span className="w-5 h-5">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
