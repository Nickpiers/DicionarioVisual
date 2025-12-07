import { CONFIRMATION_MODAL } from "../../controllers/constants";
import { AddMeaningCard } from "./AddMeaningCard";
import { FaPlus, FaTrash, FaUpload } from "react-icons/fa";

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
      <label className="block text-lg font-medium mb-2 text-[#2c3e50]">
        Palavra
      </label>
      <input
        type="text"
        placeholder="Digite a nova palavra..."
        value={word}
        onChange={(e) => setWord(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#2c3e50]"
      />
    </div>
  );

  const renderVideoUpload = () => (
    <div className="col-span-1">
      <label className="block text-lg font-medium mb-2 text-[#2c3e50]">
        Link do Vídeo
      </label>
      <input
        type="text"
        placeholder="Digite o link do vídeo..."
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#2c3e50]"
      />
    </div>
  );

  const renderButtons = () => (
    <div className="flex justify-between mt-10">
      <button
        onClick={handleAddMeaning}
        className="flex items-center justify-center bg-[#2c3e50] text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-[#1a252f] transition-colors cursor-pointer"
      >
        <FaPlus className="mr-2" /> Add Significado
      </button>

      <button
        onClick={() => setOpenModal({ type: CONFIRMATION_MODAL })}
        className="flex items-center justify-center bg-green-600 text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
      >
        <FaUpload className="mr-2" /> Upload
      </button>
    </div>
  );

  return (
    <main className="flex flex-col flex-1 p-8 overflow-auto">
      <div className="relative flex justify-center items-center w-full mb-8">
        <h1 className="text-3xl font-bold text-[#2c3e50] text-center">
          Cadastro de Nova Palavra
        </h1>
        <button
          onClick={clearPage}
          className="absolute right-0 flex items-center justify-center bg-red-600 text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-red-700 transition-colors cursor-pointer"
        >
          <FaTrash className="mr-2" /> Limpar Edição
        </button>
      </div>
      <div className="flex flex-col bg-white shadow-lg rounded-2xl p-8 flex-1">
        <div className="grid grid-cols-3 gap-8 mb-8">
          {renderWordInput()}
          {renderVideoUpload()}
        </div>
        <AddMeaningCard meanings={meanings} setMeanings={setMeanings} />
        {renderButtons()}
      </div>
    </main>
  );
};
