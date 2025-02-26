import { CartaType } from "./data/cartas";
import "./Descarte.css";
type DescarteProps = {
  cartas: Array<CartaType>
}

export default function Descarte({ cartas } : DescarteProps){
  return (
    <div className="descarte"><h1>{cartas.length} cartas</h1></div>
  );
}