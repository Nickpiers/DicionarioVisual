import { IoMdClose } from "react-icons/io";

import "../style/Modal.css";
import { LOADER_MODAL, MODAL_CONTENTS } from "../controllers/constants";

export const Modal = ({ isModalOpen, onClose, onConfirm, type }) => {
  if (!isModalOpen) return null;

  const infosModal = MODAL_CONTENTS[type] || {};
  const {
    title,
    content,
    buttonTextFirst,
    buttonTextSecond,
    buttonColorSecondProps,
  } = infosModal;

  const loader = (
    <div className="loader-container">
      <div className="loader-spinner"></div>
    </div>
  );

  return (
    <section className="modal">
      <article className="modal-container">
        {type === LOADER_MODAL ? (
          loader
        ) : (
          <>
            <div className="modal-close">
              <IoMdClose onClick={onClose} className="icon-close" />
            </div>

            <h2 className="modal-title">{title}</h2>
            <p className="modal-text">{content}</p>

            <div className="modal-actions">
              <button className="btn-primary" onClick={onClose}>
                {buttonTextFirst}
              </button>

              {buttonTextSecond && (
                <button
                  className={`btn-danger ${buttonColorSecondProps}`}
                  onClick={onConfirm}
                >
                  {buttonTextSecond}
                </button>
              )}
            </div>
          </>
        )}
      </article>
    </section>
  );
};
