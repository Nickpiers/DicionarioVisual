import { WelcomeScreen } from "./WelcomeScreen";

export const WordPresentation = ({ selectedWord }) => {
  if (!selectedWord) {
    return <WelcomeScreen />;
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold">{selectedWord}</h2>
    </div>
  );
};
