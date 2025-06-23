import { useConfirmStore } from "@/lib/stores/confirmStore";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Modal from "./Modal";
import ModalActions from "./ModalActions";
import AccountInput from "./AccountInput";

export default function ConfirmModal() {
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const content = useConfirmStore((state) => state.content);
  const [inProgress, setInProgress] = useState(false);
  const [val, setVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const text = content?.text;

  const handleClose = () => {
    closeConfirm();
    setVal("");
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
    if (content) inputRef.current?.focus();
  }, [content]);

  return (
    <Modal visible={!!content} closeFn={handleClose} title={content?.title}>
      <span className="text-slate-950/80">{content?.description}</span>
      {text && (
        <div className="my-3 flex flex-col gap-1">
          <div className="text-sm">
            To confirm, type: <span className="font-semibold">{text}</span>
          </div>
          <AccountInput
            inputRef={inputRef}
            placeholder={text}
            val={val}
            setVal={setVal}
          />
        </div>
      )}
      <ModalActions>
        <Button label="Cancel" small onClick={handleClose} />
        <Button
          label="Confirm"
          small
          style="primary"
          onClick={handleConfirm}
          disabled={inProgress || (!!text && val !== text)}
        />
      </ModalActions>
    </Modal>
  );
}
