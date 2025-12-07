import { iconsList } from "../controllers/iconsList";

export const MeaningCards = ({ definition, example, icon }) => {
  const paddingDefinition = icon ? "px-6 pb-6" : "p-6";

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md w-full md:w-[calc(50%-0.75rem)]">
      {icon && (
        <div className="text-blue-600 text-3xl p-6 pb-2">{iconsList[icon]}</div>
      )}

      <div className={`${paddingDefinition} flex-1`}>
        <p className="font-semibold text-lg">Significado:</p>
        <p className="text-lg">{definition}</p>
      </div>

      <div className="bg-blue-200 p-4">
        <p className="text-lg">
          <span className="font-semibold">Exemplo:</span> {example}
        </p>
      </div>
    </div>
  );
};
