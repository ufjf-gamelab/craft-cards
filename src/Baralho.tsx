import { CartaType } from "./data/cartas";
import "./Baralho.css";
type BaralhoProps = {
  cartas: Array<CartaType>
}

export default function Baralho({ cartas } : BaralhoProps){
  return (
    <div className="baralho"><h1>{cartas.length} cartas</h1></div>
  );
}