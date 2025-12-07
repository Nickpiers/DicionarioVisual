import { MeaningCards } from "./MeaningCards";
import { WelcomeScreen } from "./WelcomeScreen";
import ReactPlayer from "react-player";
import "../style/WordPresentation.css";

export const WordPresentation = ({ selectedWord, searchedWord }) => {
  if (!selectedWord || (!searchedWord && !selectedWord)) {
    return (
      <div className="centered-welcome">
        <div className="video-container">
          <ReactPlayer
            src="https://www.youtube.com/watch?v=ZFwaDz87uP0"
            controls
            width="100%"
            height="480px"
          />
        </div>
        <WelcomeScreen />
      </div>
    );
  }

  const { meanings, word: title, video } = selectedWord;

  return (
    <div
      className="word-presentation"
      aria-label={`palavra-${title}-selecionada`}
    >
      <h2>{title}</h2>
      <hr />
      {video && (
        <div className="video-container">
          <ReactPlayer src={video} controls width="100%" height="480px" />
        </div>
      )}
      <div className="meanings-container">
        {meanings.map(({ icon, definition, example }, index) => (
          <MeaningCards
            key={index}
            icon={icon}
            definition={definition}
            example={example}
          />
        ))}
      </div>
    </div>
  );
};
