import { useState } from "react";
import { uploadWord } from "../controllers.js/wordRestController";
import { words } from "../../Dictionary/controllers/words";

export const UploadWordsButton = () => {
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleUpload = async () => {
    setLoading(true);
    setSuccessCount(0);
    setErrorCount(0);

    for (const w of words) {
      try {
        // Transformando o formato do JSON para o que o backend espera
        const meanings = w.meanings.map((m) => ({
          description: m.definition,
          example: m.example,
        }));

        await uploadWord({
          term: w.word,
          videoUrl: "url",
          meanings,
        });

        setSuccessCount((prev) => prev + 1);
      } catch (err) {
        console.error(`Erro ao subir palavra ${w.word}:`, err);
        setErrorCount((prev) => prev + 1);
      }
    }

    setLoading(false);
    alert(`Upload finalizado!\nSucesso: ${successCount}\nErros: ${errorCount}`);
  };

  return (
    <div>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded"
      >
        {loading ? "Enviando..." : "Subir verbetes"}
      </button>
    </div>
  );
};
