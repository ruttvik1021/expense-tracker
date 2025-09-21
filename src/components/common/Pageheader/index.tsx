const PageHeader = ({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) => {
  return (
    <header className="h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 w-full font-bold text-selected mt-4">
      <div className="flex justify-between items-center">
        {title && <h1 className="text-lg md:text-2xl">{title}</h1>}
        {children && children}
      </div>
    </header>
  );
};

export default PageHeader;
