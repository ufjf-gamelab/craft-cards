import "./Carta.css";
type CartaProps = {titulo:string, texto:string, custo:number}
export default function Carta({titulo,texto,custo}: CartaProps) {
  return <div className="carta">
    <h1>{titulo}</h1>
    <p>{texto}</p>
    <div className="custo">{custo}</div>
    </div>;
}
