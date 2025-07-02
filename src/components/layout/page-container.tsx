interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer = ({
  children,
  className = "",
}: PageContainerProps) => {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className={`pt-24 pb-12 max-w-7xl mx-auto px-4 ${className}`}>
        {children}
      </div>
    </div>
  );
}; 