import { useInputStore } from '@/lib/stores/inputStore';
import Modal from './Modal';
import { useEffect, useMemo, useRef, useState } from 'react';
import AccountInput from './AccountInput';
import ModalActions from './ModalActions';
import Button from './Button';

export default function InputModal() {
  const { closeInput } = useInputStore();
  const { content } = useInputStore();
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const maxLength = useMemo(() => content?.maxLength, [content]);

  const handleClose = () => {
    closeInput();
    setVal('');
  };

  const handleInput = () => {
    if (!content) return;
    if (val.length == 0) {
      return;
    }
    content.callback(val.trim());
    handleClose();
  };

  useEffect(() => {
    if (content) inputRef.current?.focus();
  }, [content]);

  return (
    <Modal visible={!!content} closeFn={handleClose} title={content?.label}>
      <form
        className="mt-3 flex grow flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleInput();
        }}
      >
        <AccountInput
          inputRef={inputRef}
          placeholder="Enter text here"
          val={val}
          setVal={setVal}
          maxLength={maxLength}
        />
        {maxLength && (
          <div className="text-sm text-slate-950/80">{`${val.length.toLocaleString()}/${maxLength.toLocaleString()}`}</div>
        )}
        <ModalActions>
          <Button type="button" label="Cancel" small onClick={handleClose} />
          <Button type="submit" label="Confirm" style="primary" small />
        </ModalActions>
      </form>
    </Modal>
  );
}
