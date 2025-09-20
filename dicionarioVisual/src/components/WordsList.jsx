import { useState } from "react";
import { words } from "../controllers/words";

export const WordsList = () => {
  const [selected, setSelected] = useState(null);

  const selectedStyle = (index) => {
    return selected === index
      ? "bg-blue-100 border-blue-500"
      : "hover:bg-gray-100 border-transparent";
  };

  return (
    <div className="word-list">
      {words.map(({ word }, index) => (
        <div
          key={index}
          onClick={() => setSelected(index)}
          className={`
            px-6 py-4 cursor-pointer text-lg font-medium border-l-5
            ${selectedStyle(index)}
          `}
        >
          {word}
        </div>
      ))}
    </div>
  );
};
