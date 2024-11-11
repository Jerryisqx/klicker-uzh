import React, { createContext, useContext, ReactNode } from 'react';

interface PageSourceContextProps {
  isGeneratedPage: boolean;
}

const PageSourceContext = createContext<PageSourceContextProps | undefined>(undefined);

export const PageSourceProvider = ({
  isGeneratedPage,
  children,
}: PageSourceContextProps & { children: ReactNode }) => {
  return (
    <PageSourceContext.Provider value={{ isGeneratedPage }}>
      {children}
    </PageSourceContext.Provider>
  );
};

export const usePageSource = () => {
  const context = useContext(PageSourceContext);
  if (!context) {
    throw new Error('usePageSource must be used within a PageSourceProvider');
  }
  return context;
};
