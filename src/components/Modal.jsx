import { IoMdClose } from "react-icons/io";

import "../style/Modal.css";

export const Modal = ({ isModalOpen, onClose, onConfirm }) => {
  if (!isModalOpen) return null;

  const infosModal = {
    title: "Quer mesmo sair?",
    content:
      "Você terá que fazer o login novamente se quiser acessar o portal novamente!",
    buttonTextFirst: "Sair",
    buttonTextSecond: "Ficar",
  };

  return (
    <section className="modal">
      <article className="modal-container">
        <div className="modal-close">
          <IoMdClose onClick={onClose} className="icon-close" />
        </div>
        <h2 className="modal-title">{infosModal.title}</h2>
        <p className="modal-text">{infosModal.content}</p>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            {infosModal.buttonTextSecond}
          </button>

          <button className="btn-danger" onClick={onConfirm}>
            {infosModal.buttonTextFirst}
          </button>
        </div>
      </article>
    </section>
  );
};
