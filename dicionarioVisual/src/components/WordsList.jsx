/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { words } from "../controllers/words";

export const WordsList = ({ setSelectedWord, isHome, searchedWord }) => {
  const [selected, setSelected] = useState(null);

  const selectWord = (index, item) => {
    setSelected(index);
    setSelectedWord(item);
  };

  const filteredWords = searchedWord
    ? words.filter((item) =>
        item.word.toLowerCase().includes(searchedWord.toLowerCase())
      )
    : words;

  const selectedStyle = (index) => {
    return selected === index
      ? "bg-blue-100 border-blue-500"
      : "hover:bg-gray-100 border-transparent";
  };

  useEffect(() => {
    if (isHome) setSelected(null);
  }, [isHome]);

  useEffect(() => {
    if (searchedWord) {
      if (filteredWords.length > 0) {
        setSelected(0);
        setSelectedWord(filteredWords[0]);
      } else setSelectedWord(null);
    }
  }, [searchedWord]);

  return (
    <div className="word-list">
      {filteredWords.map((item, index) => (
        <div
          key={index}
          onClick={() => selectWord(index, item)}
          className={`
            px-6 py-4 cursor-pointer text-lg font-medium border-l-5
            ${selectedStyle(index)}
          `}
        >
          {item.word}
        </div>
      ))}
    </div>
  );
};
