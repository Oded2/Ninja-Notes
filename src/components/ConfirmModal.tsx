import { useConfirmStore } from '@/lib/stores/confirmStore';
import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import ModalActions from './ModalActions';
import FormInput from './FormInput';

export default function ConfirmModal() {
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const content = useConfirmStore((state) => state.content);
  const [inProgress, setInProgress] = useState(false);
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const text = content?.text;

  const handleClose = () => {
    closeConfirm();
    setVal('');
  };

  const handleConfirm = () => {
    if (!content) return;
    setInProgress(true);
    content.callback().then(() => {
      handleClose();
      setInProgress(false);
    });
  };

  useEffect(() => {
    const func = (e: KeyboardEvent) => {
      // Require extra confirmation by enforcing the user to manually click the confirm button instead of clicking enter
      if (e.key === 'Enter') e.preventDefault();
    };
    if (content) {
      window.addEventListener('keydown', func);
      inputRef.current?.focus();
    }
    return () => window.removeEventListener('keydown', func);
  }, [content]);

  return (
    <Modal
      handleSubmit={handleConfirm}
      visible={!!content}
      closeFn={handleClose}
      title={content?.title}
    >
      <span className="text-base-content/80">{content?.description}</span>
      {text && (
        <div className="my-3 flex flex-col gap-1">
          <div className="text-sm">
            To confirm, type: <span className="font-semibold">{text}</span>
          </div>
          <FormInput
            inputRef={inputRef}
            required
            pattern={stringToPattern(text)}
            label={text}
            val={val}
            setVal={setVal}
          />
        </div>
      )}
      <ModalActions>
        <Button type="button" label="Cancel" small onClick={handleClose} />
        <Button
          type="submit"
          label="Confirm"
          small
          style="primary"
          disabled={inProgress || (!!text && val !== text)}
        />
      </ModalActions>
    </Modal>
  );
}

function stringToPattern(input: string) {
  const escaped = input.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  return `^${escaped}$`;
}
