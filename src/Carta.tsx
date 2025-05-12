import { CartaType } from "./data/cartas.ts";
import "./Carta.css";
import * as motion from "motion/react-client"
type CartaProps = { carta: CartaType; onCartaClick: () => void };
export default function Carta({ carta, onCartaClick }: CartaProps) {
  return (
    <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
    }}
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
    </motion.div>
  );
}
