import NotFoundClient from '@/components/NotFoundClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not found',
};

export default function NotFound() {
  return <NotFoundClient />;
}
