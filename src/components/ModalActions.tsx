type Props = {
  children: React.ReactNode;
};

export default function ModalActions({ children }: Props) {
  return (
    <div className="mt-2 flex grow items-end justify-end gap-2">{children}</div>
  );
}
