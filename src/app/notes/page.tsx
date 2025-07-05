import HomeClient from '@/components/clients/HomeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ninja Notes',
  description: 'End-to-End encrypted notes',
};

export default function Home() {
  return <HomeClient />;
}
