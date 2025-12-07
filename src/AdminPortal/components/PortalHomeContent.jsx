import { CONFIRMATION_MODAL } from "../../controllers/constants";
import { AddMeaningCard } from "./AddMeaningCard";
import { FaPlus, FaTrash, FaUpload } from "react-icons/fa";
import "../style/PortalHomeContent.css";

export const PortalHomeContent = ({
  word,
  setWord,
  videoUrl,
  setVideoUrl,
  setOpenModal,
  meanings,
  setMeanings,
  clearPage,
}) => {
  const handleAddMeaning = () => {
    setMeanings([...meanings, { description: "", example: "" }]);
  };

  const renderWordInput = () => (
    <div className="col-span-2">
      <label className="portal-label">Palavra</label>
      <input
        type="text"
        placeholder="Digite a nova palavra..."
        value={word}
        onChange={(e) => setWord(e.target.value)}
        className="portal-input"
      />
    </div>
  );

  const renderVideoUpload = () => (
    <div className="col-span-1">
      <label className="portal-label">Link do Vídeo</label>
      <input
        type="text"
        placeholder="Digite o link do vídeo..."
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="portal-input"
      />
    </div>
  );

  const renderButtons = () => (
    <div className="portal-buttons">
      <button onClick={handleAddMeaning} className="portal-btn portal-btn-add">
        <FaPlus /> Add Significado
      </button>

      <button
        onClick={() => setOpenModal({ type: CONFIRMATION_MODAL })}
        className="portal-btn portal-btn-upload"
      >
        <FaUpload /> Upload
      </button>
    </div>
  );

  return (
    <main className="portal-main">
      <div className="portal-header">
        <h1>Cadastro de Nova Palavra</h1>
        <button onClick={clearPage} className="portal-clear-btn">
          <FaTrash /> Limpar Edição
        </button>
      </div>
      <div className="portal-card">
        <div className="portal-grid">
          {renderWordInput()}
          {renderVideoUpload()}
        </div>
        <AddMeaningCard meanings={meanings} setMeanings={setMeanings} />
        {renderButtons()}
      </div>
    </main>
  );
};
