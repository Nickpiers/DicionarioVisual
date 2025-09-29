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

  const { meanings, word: title } = selectedWord;
  return (
    <div className="flex flex-col p-8">
      <h2 className="text-4xl font-bold">{title}</h2>
      <hr className="my-4 border-t border-gray-300" />
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
