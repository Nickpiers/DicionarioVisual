import { FaTrash } from "react-icons/fa";

export const AddMeaningCard = ({ meanings, setMeanings }) => {
  const handleRemoveMeaning = (index) => {
    const newMeanings = meanings.filter((_, i) => i !== index);
    setMeanings(newMeanings);
  };

  const handleChangeMeaning = (index, field, value) => {
    const newMeanings = [...meanings];
    newMeanings[index][field] = value;
    setMeanings(newMeanings);
  };

  const isFirstOrSecondMeaning = (index) => index < 2;

  return (
    <div className="flex-1 overflow-auto">
      <h2 className="text-2xl font-semibold mb-6 text-[#2c3e50]">
        Significados
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {meanings.map((meaning, index) => (
          <div
            key={index}
            className="relative border border-gray-300 rounded-xl p-5 bg-gray-50 shadow-sm"
          >
            {!isFirstOrSecondMeaning(index) && (
              <button
                onClick={() => handleRemoveMeaning(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                title="Remover significado"
              >
                <FaTrash />
              </button>
            )}

            <h3 className="text-lg font-semibold mb-3 text-[#2c3e50]">
              Significado {index + 1}
            </h3>

            <input
              type="text"
              placeholder="Significado..."
              value={meaning.significado}
              onChange={(e) =>
                handleChangeMeaning(index, "significado", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md p-2 mb-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2c3e50]"
            />

            <textarea
              placeholder="Descrição..."
              value={meaning.descricao}
              onChange={(e) =>
                handleChangeMeaning(index, "descricao", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md p-2 mb-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2c3e50]"
              rows={2}
            />

            <input
              type="text"
              placeholder="Exemplo..."
              value={meaning.exemplo}
              onChange={(e) =>
                handleChangeMeaning(index, "exemplo", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md p-2 text-base focus:outline-none focus:ring-2 focus:ring-[#2c3e50]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
