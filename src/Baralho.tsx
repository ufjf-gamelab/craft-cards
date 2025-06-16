import { CartaType } from "./data/cartas";
import "./Baralho.css";
import ListaDeCartas from "./ListaDeCartas";
import Carta from "./Carta";
type BaralhoProps = {
  cartas: Array<CartaType>;
};

export default function Baralho({ cartas }: BaralhoProps) {
  return (
    <div className="baralho">
      <ListaDeCartas closed facedown>
        {cartas.map((item) => (
          <Carta key={item.id} carta={item} onCartaClick={() => {}} facedown />
        ))}
      </ListaDeCartas>
    </div>
  );
}
