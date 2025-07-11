import { useInputStore } from '@/lib/stores/inputStore';
import Modal from './Modal';
import { useEffect, useMemo, useRef, useState } from 'react';
import ModalActions from './ModalActions';
import Button from './Button';
import FormInput from './FormInput';

export default function InputModal() {
  const closeInput = useInputStore((state) => state.closeInput);
  const content = useInputStore((state) => state.content);
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const maxLength = useMemo(() => content?.maxLength, [content]);

  const handleClose = () => {
    closeInput();
    setVal('');
  };

  const handleInput = () => {
    if (!content || !val.length) return;
    content.callback(val.trim());
    handleClose();
  };

  useEffect(() => {
    if (content) inputRef.current?.focus();
  }, [content]);

  return (
    <Modal
      handleSubmit={handleInput}
      visible={!!content}
      closeFn={handleClose}
      title={content?.label}
    >
      <div className="flex grow flex-col gap-2">
        <FormInput
          inputRef={inputRef}
          label="Enter text here"
          val={val}
          setVal={setVal}
          maxLength={maxLength}
          required
        />
        {maxLength && (
          <div className="text-base-content/80 text-xs">{`${val.length.toLocaleString()}/${maxLength.toLocaleString()}`}</div>
        )}
      </div>
      <ModalActions>
        <Button type="button" small onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" style="primary" small>
          Confirm
        </Button>
      </ModalActions>
    </Modal>
  );
}
