import { ReactNode } from 'react';

export interface BodyProps {
  children: ReactNode;
  className?: string;
}

export interface FooterProps {
  onSubmit: () => Promise<void>;
  isDisabled: boolean;
  isLoading: boolean;
}
