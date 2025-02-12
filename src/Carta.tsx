import { CartaType } from "./data/cartas.ts";
import "./Carta.css";
type CartaProps = { carta: CartaType; onCartaClick: () => void };
export default function Carta({ carta, onCartaClick }: CartaProps) {
  return (
    <div
      className="carta"
      onClick={() => {
        onCartaClick();
      }}
    >
      <h1>{carta.titulo}</h1>
      <section>
        <p>{carta.texto}</p>
        {carta.ganho.map((ganho) => (
          <p key={ganho.nome}>
            {ganho.quantidade > 0 ? "Ganhe" : "Pague"} {ganho.quantidade}{" "}
            {ganho.nome}
          </p>
        ))}
      </section>
      <div className="custo">{carta.custo.map((ganho) => (
          <p key={ganho.nome}>
            {ganho.quantidade > 0 ? "Ganhe" : "Pague"} {ganho.quantidade}{" "}
            {ganho.nome}
          </p>
        ))}</div>
    </div>
  );
}
