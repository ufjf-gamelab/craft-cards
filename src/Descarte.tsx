import { useState } from "react";
import { CartaType } from "./data/cartas";
import ListaDeCartas from "./ListaDeCartas.tsx";
import "./Descarte.css";
import Carta from "./Carta";
type DescarteProps = {
  cartas: Array<CartaType>;
  onDescarteClick: () => void;
};

export default function Descarte({ cartas, onDescarteClick }: DescarteProps) {
  const [aberto, setAberto] = useState(false);
  return (
    <div
      className={`descarte ${aberto ? "aberto" : ""}`}
      onClick={() => {
        setAberto(!aberto);
        onDescarteClick();
      }}
    >
        <ListaDeCartas closed>
          {cartas.map((item) => (
            <Carta key={item.id} carta={item} onCartaClick={() => {}} />
          ))}
        </ListaDeCartas>
    </div>
  );
}
