type Props = {
  children: React.ReactNode;
};

export default function InlineDivider({ children }: Props) {
  return (
    <div className="flex gap-1 *:flex *:items-center *:not-last:after:ms-1 *:not-last:after:content-['·']">
      {children}
    </div>
  );
}
