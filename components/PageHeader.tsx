import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children }) => {
    return (
        <header className="mb-8">
            {children && <div className="mb-4">{children}</div>}
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-gray-400 mt-2 text-lg">{subtitle}</p>}
        </header>
    );
};

export default PageHeader;