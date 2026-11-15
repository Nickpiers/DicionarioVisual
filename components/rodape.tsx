import { Marca } from "./marca";

export function Rodape() {
  return (
    <footer className="flex min-h-24 items-center gap-6 bg-navy-dark px-[max(24px,calc((100%_-_1180px)/2))] py-[22px] text-[.82rem] text-[#dbeaff] phone:flex-col phone:items-start phone:gap-[10px] phone:pb-[30px]">
      <Marca />
      <p className="m-0 mr-auto phone:m-0">
        Dicionário visual, acessível e feito com a comunidade Surda.
      </p>
      <span>WCAG 2.1 • LBI • Português (Brasil) • Libras</span>
    </footer>
  );
}
