import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "./ListaDeCartas.css";

type ListaDeCartasProps = {
  children: Array<ReactNode>;
  closed?: boolean;
  facedown?: boolean;
};

export default function ListaDeCartas({
  children: cartas,
  closed = false,
  facedown = false,
}: ListaDeCartasProps) {
  const { t } = useTranslation();

  return (
    <div className={`listaDeCartas ${closed && "closed"} ${facedown && "facedown"}`}>
      <div className="tamanho">
        {t("game.cards", { count: cartas.length })}
      </div>
      <div className="cartas">{cartas}</div>
    </div>
  );
}