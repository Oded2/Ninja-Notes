'use client';

import {
  ArrowTopRightOnSquareIcon,
  CloudIcon,
  FolderIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/Button';
import { useUserStore } from '@/lib/stores/userStore';
import { CommitInfo } from '@/lib/types';
import InlineDivider from '@/components/InlineDivider';
import { repoUrl, springTransition } from '@/lib/constants';
import { useEffect, useState } from 'react';
import {
  BoltIcon,
  CommandLineIcon,
  CodeBracketSquareIcon,
} from '@heroicons/react/24/solid';
import IconText from '@/components/IconText';

type Props = {
  commit: CommitInfo | undefined;
};

export default function LandingClient({ commit }: Props) {
  const user = useUserStore((state) => state.user);

  return (
    <div className="flex flex-col px-2">
      <div className="flex gap-4">
        <div className="my-auto flex flex-col gap-2">
          <div className="flex flex-col sm:px-8">
            <h1 className="text-6xl font-medium">
              Welcome to{' '}
              <span className="from-primary-light to-primary bg-gradient-to-r bg-clip-text text-transparent">
                Ninja Notes
              </span>
            </h1>
            <p className="mb-4 text-xl">
              Take secure notes using Ninja Notes with end-to-end encryption and
              effortless organization.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              externalLink={repoUrl + '/blob/main/README.md'}
              style="black"
            >
              <IconText text="Documentation">
                <ArrowTopRightOnSquareIcon />
              </IconText>
            </Button>
            <Button href={user ? '/notes' : '/auth'} style="primary">
              {user ? 'View Notes' : 'Get Started'}
            </Button>
          </div>
        </div>
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          transition={springTransition}
        >
          <Image
            src="/banner.png"
            alt="Banner of Ninja Notes"
            width={450}
            height={300}
            className="hidden rounded-lg object-contain lg:inline-block"
            priority
          />
        </motion.div>
      </div>
      <Header text="Lots of features - Zero complexity">
        <BoltIcon />
      </Header>
      <div className="relative">
        <div className="from-base to-base-100 pointer-events-none absolute inset-0 bg-gradient-to-br"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <Card
            title="End-to-End Encryption"
            description="Take security to the next level by using Ninja Notes. Every note is encrypted on the client side before being sent to the cloud. This means that no one, not even an admin of the database, except you can see your notes."
          >
            <LockClosedIcon />
          </Card>
          <Card
            title="Collections"
            description="Easily keep track of your notes by sorting them into different collections."
          >
            <FolderIcon />
          </Card>
          <Card
            title="Cloud-Saving"
            description="Access your secure notes on any device."
          >
            <CloudIcon />
          </Card>
        </div>
      </div>
      <Header text="Free & Open Source">
        <CommandLineIcon />
      </Header>
      <div className="flex flex-col gap-4 lg:flex-row">
        <p>
          Ninja Notes is completely free to use — no subscriptions, no hidden
          costs. Its entire source code is publicly available on{' '}
          <a href={repoUrl} className="underline">
            GitHub
          </a>
          , encouraging developers to inspect, contribute, or customize the
          project to fit their needs. Built with transparency and community in
          mind, Ninja Notes is licensed under the permissive MIT license,
          allowing anyone to use, modify, and distribute the software with
          minimal restrictions.
        </p>
        <CommitDisplay commit={commit} />
      </div>
    </div>
  );
}

type HeaderProps = {
  text: string;
  children: React.ReactNode;
};

function Header({ text, children: icon }: HeaderProps) {
  return (
    <div className="mx-auto my-10 flex items-center gap-2 text-center">
      <div className="*:size-6 *:sm:size-9">{icon}</div>
      <h1 className="text-lg font-medium sm:text-4xl">{text}</h1>
    </div>
  );
}

type CardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function Card({ title, description, children: icon }: CardProps) {
  return (
    <div className="group relative flex w-full flex-col lg:flex-row">
      <div className="relative flex w-full flex-col gap-2 rounded border border-gray-800 bg-transparent p-4 shadow">
        <div className="flex items-center justify-center gap-2">
          <div className="*:size-7">{icon}</div>
          <h2 className="text-xl">{title}</h2>
        </div>
        <p>{description}</p>
      </div>
      <div className="bg-base hidden min-w-4 group-last:hidden lg:inline-block" />
      <div className="bg-base min-h-4 group-last:hidden lg:hidden" />
    </div>
  );
}

type CommitDisplayProps = {
  commit?: CommitInfo;
};

function CommitDisplay({ commit }: CommitDisplayProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (commit) {
      const formatted = commit.date.toLocaleDateString(undefined, {
        minute: 'numeric',
        hour: 'numeric',
        day: 'numeric',
        month: 'numeric',
        year: '2-digit',
      });
      setFormattedDate(formatted);
    }
  }, [commit]);

  if (!commit) return null;

  return (
    <div className="flex max-w-full flex-col">
      <h1 className="mb-1 text-center text-lg font-medium italic">
        Latest Commit
      </h1>
      <div className="flex items-center gap-2 rounded bg-black px-4 py-2 text-white">
        <CodeBracketSquareIcon className="size-10" />
        <div className="flex max-w-full flex-col gap-1">
          <div className="text-neutral text-sm">
            <InlineDivider>
              <div>{formattedDate}</div>
              <div className="overflow-hidden">
                <a
                  href={repoUrl + `commit/${commit.hash}`}
                  className="overflow-hidden overflow-ellipsis hover:underline"
                >
                  {commit.hash}
                </a>
              </div>
            </InlineDivider>
          </div>
          <span>{commit.message}</span>
        </div>
      </div>
    </div>
  );
}
