import AuthClient from '@/components/clients/AuthClient';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Authenticate',
};

export default function Auth() {
  return (
    <Suspense>
      <AuthClient />
    </Suspense>
  );
}
