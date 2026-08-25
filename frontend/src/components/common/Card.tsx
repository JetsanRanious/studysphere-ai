import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 transition-all duration-200 ${
        hoverable ? 'hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)] hover:border-blue-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
