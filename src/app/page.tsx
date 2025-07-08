import { Metadata } from 'next';
import LandingClient from '@/components/clients/LandingClient';
import { execSync } from 'child_process';
import { CommitInfo } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Ninja Notes',
  description: 'End-to-End encrypted notes',
};

export default function LandingPage() {
  const commit = getLastCommit();
  return <LandingClient commit={commit} />;
}

function getLastCommit(): CommitInfo | undefined {
  try {
    const hash = execSync('git rev-parse HEAD').toString().trim();
    const message = execSync('git log -1 --pretty=%B').toString().trim();
    const dateRaw = execSync('git log -1 --format=%cd --date=iso')
      .toString()
      .trim();
    return { hash, message, date: new Date(dateRaw) };
  } catch (err) {
    console.error(err);
  }
}
