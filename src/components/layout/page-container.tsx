interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer = ({
  children,
  className = "",
}: PageContainerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className={`pt-24 pb-12 ${className}`}>
        {children}
      </div>
    </div>
  );
}; 