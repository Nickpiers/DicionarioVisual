import { MeaningCards } from "./MeaningCards";
import { WelcomeScreen } from "./WelcomeScreen";

export const WordPresentation = ({ selectedWord }) => {
  if (!selectedWord) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <WelcomeScreen />
      </div>
    );
  }

  const { meanings, word: title, video } = selectedWord;
  return (
    <div className="flex flex-col p-8">
      <h2 className="text-4xl font-bold">{title}</h2>
      <hr className="my-4 border-t border-gray-300" />
      {video && (
        <video
          src={`/assets/${video}`}
          controls
          className="w-full max-w-3xl mx-auto mb-6 rounded-lg shadow-md"
        />
      )}
      <div className="flex flex-wrap gap-6 w-full mt-4">
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
