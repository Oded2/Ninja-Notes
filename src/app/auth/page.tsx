import AuthClient from '@/components/clients/AuthClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authenticate',
};

export default function Auth() {
  return <AuthClient />;
}
