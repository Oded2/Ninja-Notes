import { useConfirmStore } from "@/lib/stores/confirmStore";
import { useState } from "react";
import Button from "./Button";
import Modal from "./Modal";
import ModalActions from "./ModalActions";

export default function ConfirmModal() {
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const content = useConfirmStore((state) => state.content);
  const [inProgress, setInProgress] = useState(false);

  const handleConfirm = () => {
    if (!content) return;
    setInProgress(true);
    content.callback().then(() => {
      closeConfirm();
      setInProgress(false);
    });
  };

  return (
    <Modal visible={!!content} closeFn={closeConfirm} title={content?.title}>
      <span className="text-slate-950/80">{content?.description}</span>
      <ModalActions>
        <Button label="Cancel" style="neutral" small onClick={closeConfirm} />
        <Button
          label="Confirm"
          small
          style="primary"
          onClick={handleConfirm}
          disabled={inProgress}
        />
      </ModalActions>
    </Modal>
  );
}
