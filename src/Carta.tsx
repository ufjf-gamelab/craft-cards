import { CartaType } from "./App";
import "./Carta.css";
type CartaProps = {carta:CartaType, onCartaClick:()=>void}
export default function Carta({carta, onCartaClick}: CartaProps) {
  return (
  <div className="carta" onClick={()=>{onCartaClick();}}>
    <h1>{carta.titulo}</h1>
    <p>{carta.texto}</p>
    <div className="custo">{carta.custo}</div>
  </div>
  );
}
