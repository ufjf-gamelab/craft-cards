import { ReactNode } from "react";
import "./ListaDeCartas.css";
type ListaDeCartas = { children: Array<ReactNode> };

export default function MaoDeCartas({ children: cartas }: ListaDeCartas) {
  return (
    <div className="listaDeCartas">
      <div className="tamanho">{cartas.length} Cartas</div>
      <div className="cartas">{cartas}</div>
    </div>
  );
}
