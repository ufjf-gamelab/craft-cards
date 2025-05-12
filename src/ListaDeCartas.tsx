import { ReactNode } from "react";
import "./ListaDeCartas.css";
type ListaDeCartasProps = { children: Array<ReactNode> };

export default function ListaDeCartas({ children: cartas }: ListaDeCartasProps) {
  return (
    <div className="listaDeCartas">
      <div className="tamanho">{cartas.length} Cartas</div>
      <div className="cartas">{cartas}</div>
    </div>
  );
}
