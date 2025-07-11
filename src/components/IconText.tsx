import clsx from 'clsx';

type Props = {
  responsive?: boolean;
  text: string;
  children: React.ReactNode;
};

/**
 *
 * @param responsive If set to true then only the icon will appear on small screens. Bigger screens will show the text and icon
 * @param text The text to display alongside the icon
 * @param children The icon to display
 */
export default function IconText({ responsive, text, children: icon }: Props) {
  return (
    <>
      <div
        className={clsx(
          'items-center gap-1',
          responsive ? 'hidden sm:flex' : 'flex',
        )}
      >
        <div className="*:size-6">{icon}</div>
        <span>{text}</span>
      </div>
      {responsive && <div className="*:size-6 sm:hidden">{icon}</div>}
    </>
  );
}
