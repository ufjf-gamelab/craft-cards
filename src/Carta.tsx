import { CartaType } from "./App";
import "./Carta.css";
type CartaProps = {carta:CartaType}
export default function Carta({carta}: CartaProps) {
  return <div className="carta">
    <h1>{carta.titulo}</h1>
    <p>{carta.texto}</p>
    <div className="custo">{carta.custo}</div>
    </div>;
}
