import { FaTrash } from "react-icons/fa";
import { capitalizeFirstLetter } from "../controllers.js/wordRestController";
import "../style/AddMeaningCard.css";

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
    <div className="add-meaning-card-container">
      <h2 className="add-meaning-card-title">Significados</h2>

      <div className="meanings-grid">
        {meanings.map((meaning, index) => (
          <div key={index} className="meaning-card">
            {!isFirstOrSecondMeaning(index) && (
              <button
                onClick={() => handleRemoveMeaning(index)}
                className="remove-meaning-button"
                title="Remover significado"
              >
                <FaTrash />
              </button>
            )}

            <h3 className="meaning-card-title">Significado {index + 1}</h3>

            <textarea
              placeholder="Descrição..."
              value={meaning.description}
              onChange={(e) =>
                handleChangeMeaning(
                  index,
                  "description",
                  capitalizeFirstLetter(e.target.value)
                )
              }
              className="meaning-textarea"
              rows={2}
            />

            <input
              type="text"
              aria-label="Exemplo da frase"
              placeholder="Exemplo..."
              value={meaning.example}
              onChange={(e) =>
                handleChangeMeaning(
                  index,
                  "example",
                  capitalizeFirstLetter(e.target.value)
                )
              }
              className="meaning-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
