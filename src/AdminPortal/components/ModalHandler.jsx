import { Modal } from "../../components/Modal";
import { CONFIRMATION_MODAL, EXIT_MODAL } from "../../controllers/constants";

export const ModalHandler = ({
  openModal,
  setOpenModal,
  navigate,
  handleUpload,
}) => {
  if (!openModal) return;
  const { type, path } = openModal;

  const logout = (path) => {
    localStorage.removeItem("token");
    navigate(path);
  };

  const onConfirmModal = () => {
    setOpenModal(null);
    if (type === EXIT_MODAL) {
      logout(path);
    }
    if (type === CONFIRMATION_MODAL) handleUpload();
  };

  return (
    <Modal
      isModalOpen={openModal}
      onClose={() => setOpenModal(null)}
      onConfirm={onConfirmModal}
      type={type}
    />
  );
};
