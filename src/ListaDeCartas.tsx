import { ReactNode } from "react";
import "./ListaDeCartas.css";
type ListaDeCartasProps = { children: Array<ReactNode>, fechado ? : boolean };


export default function ListaDeCartas({ children: cartas, fechado = false }: ListaDeCartasProps) {
  return (
    <div className={`listaDeCartas ${fechado && "fechado"}`}>
      <div className="tamanho">{cartas.length} Cartas</div>
      <div className="cartas">{cartas}</div>
    </div>
  );
}
