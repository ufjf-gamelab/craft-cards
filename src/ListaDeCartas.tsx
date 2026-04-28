import { ReactNode } from "react";
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
  return (
    <div className={`listaDeCartas ${closed && "closed"} ${facedown && "facedown"}`}>
      <div className="tamanho">{cartas.length} Cartas</div>
      <div className="cartas">{cartas}</div>
    </div>
  );
}
