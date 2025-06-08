'use client';

import { Toaster } from 'sonner';

export const ToasterProvider = () => {
  return (
    <Toaster
      position="bottom-right"
      expand={false}
      richColors
      closeButton
    />
  );
}; 