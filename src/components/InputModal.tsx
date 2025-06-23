import { useInputStore } from "@/lib/stores/inputStore";
import Modal from "./Modal";
import { useState } from "react";
import AccountInput from "./AccountInput";
import ModalActions from "./ModalActions";
import Button from "./Button";

export default function InputModal() {
  const closeInput = useInputStore((state) => state.closeInput);
  const content = useInputStore((state) => state.content);
  const [val, setVal] = useState("");

  const handleInput = () => {
    if (!content) return;
    if (val.length == 0) {
      return;
    }
    content.callback(val);
    closeInput();
  };

  return (
    <Modal visible={!!content} closeFn={closeInput} title={content?.label}>
      <div className="my-3 flex flex-col">
        <AccountInput val={val} setVal={setVal} />
      </div>
      <ModalActions>
        <Button label="Cancel" small onClick={closeInput} />
        <Button label="Confirm" style="primary" small onClick={handleInput} />
      </ModalActions>
    </Modal>
  );
}
