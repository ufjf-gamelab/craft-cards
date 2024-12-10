import "./Carta.css";
type CartaProps = {titulo:string}
export default function Carta(props: CartaProps) {
  return <div className="carta">
    <h1>{props.titulo}</h1>
    </div>;
}
