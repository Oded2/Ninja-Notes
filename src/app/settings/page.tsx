import SettingsClient from '@/components/clients/SettingsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function Settings() {
  return <SettingsClient />;
}
