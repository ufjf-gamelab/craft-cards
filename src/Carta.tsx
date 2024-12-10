import "./Carta.css";
type CartaProps = {titulo:string}
export default function Carta({titulo}: CartaProps) {
  return <div className="carta">
    <h1>{titulo}</h1>
    </div>;
}
