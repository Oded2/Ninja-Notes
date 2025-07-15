import ViewerClient from '@/components/clients/ViewerClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Note Viewer',
};

export default function Viewer() {
  return <ViewerClient />;
}
