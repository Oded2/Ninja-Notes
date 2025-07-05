import { Metadata } from 'next';
import LandingClient from '@/components/clients/LandingClient';

export const metadata: Metadata = {
  title: 'Ninja Notes',
  description: 'End-to-End encrypted notes',
};

export default function LandingPage() {
  return <LandingClient />;
}
