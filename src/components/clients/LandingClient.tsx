'use client';

import {
  CloudIcon,
  FolderIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/Button';
import { useUserStore } from '@/lib/stores/userStore';

export default function LandingClient() {
  const user = useUserStore((state) => state.user);

  return (
    <div className="flex flex-col px-2">
      <div className="flex gap-4">
        <div className="my-auto flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, x: '-50%', scale: 0.7 }}
            animate={{ opacity: 1, x: '0%', scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex flex-col sm:px-8"
          >
            <h1 className="text-6xl font-medium">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                Ninja Notes
              </span>
            </h1>
            <p className="mb-4 text-xl">
              Take secure notes using Ninja Notes with end-to-end encryption and
              effortless organization.
            </p>
          </motion.div>
          <div className="flex justify-center gap-2">
            <Button
              href="https://github.com/Oded2/Ninja-Notes/blob/main/README.md"
              newTab
              label="Read the docs"
              style="black"
            />
            <Button
              href={user ? '/notes' : '/auth'}
              label={user ? 'View Notes' : 'Get Started'}
              style="primary"
            />
          </div>
        </div>
        <div>
          <Image
            src="/banner.png"
            alt="Banner of Ninja Notes"
            width={450}
            height={300}
            className="hidden rounded-lg object-contain lg:inline-block"
            priority
          />
        </div>
      </div>
      <h1 className="my-10 text-center text-4xl font-medium">
        Lots of features, zero complexity
      </h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
  );
}

type CardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function Card({ title, description, children: icon }: CardProps) {
  return (
    <div className="flex flex-col gap-2 rounded border border-slate-950/10 bg-linear-to-br from-gray-50 to-gray-200 p-4 shadow-lg transition-shadow hover:shadow-xl">
      <div className="flex items-center justify-center gap-2">
        <div className="*:size-7">{icon}</div>
        <h2 className="text-xl">{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}
