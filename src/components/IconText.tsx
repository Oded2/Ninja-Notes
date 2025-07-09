type Props = {
  text: string;
  children: React.ReactNode;
};

export default function IconText({ text, children }: Props) {
  return (
    <div className="flex items-center gap-1">
      <div className="*:size-6">{children}</div>
      <span>{text}</span>
    </div>
  );
}
