import AccountClient from '@/components/clients/AccountClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account',
};

export default function Account() {
  return <AccountClient />;
}
