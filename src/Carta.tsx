import { CartaType } from "./data/cartas.ts";
import "./Carta.css";
import * as motion from "motion/react-client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
type CartaProps = {
  carta: CartaType;
  onCartaClick: () => void;
  onCardRender: (id: string, rect: DOMRect) => void;
  posicaoPrevia?: DOMRect;
};
export default function Carta({
  carta,
  onCartaClick,
  onCardRender,
  posicaoPrevia,
}: CartaProps) {
  const cartaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cartaRef.current) {
      onCardRender(carta.id, cartaRef.current.getBoundingClientRect());
    }
  }, []);

  return (
    <motion.div
      ref={cartaRef}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.5,
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
      <div className="custo">
        {carta.custo.map((ganho) => (
          <p key={ganho.nome}>
            {ganho.quantidade > 0 ? "Ganhe" : "Pague"} {ganho.quantidade}{" "}
            {ganho.nome}
          </p>
        ))}
      </div>
      {posicaoPrevia &&
        createPortal(
          <motion.div
            initial={{
              x:
                (cartaRef.current
                  ? cartaRef.current.getBoundingClientRect().x
                  : 0) - posicaoPrevia.x,
              y:
                (cartaRef.current?.getBoundingClientRect()?.y ?? 0) -
                posicaoPrevia.y,
              position: "absolute",
            }}
            animate={{
              x: 0,
              y: 0,
              position: "absolute",
            }}
            transition={{
              duration: 0.5,
              scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
            }}
            className="carta movida"
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
            <div className="custo">
              {carta.custo.map((ganho) => (
                <p key={ganho.nome}>
                  {ganho.quantidade > 0 ? "Ganhe" : "Pague"} {ganho.quantidade}{" "}
                  {ganho.nome}
                </p>
              ))}
            </div>
          </motion.div>,
          document.body
        )}
    </motion.div>
  );
}
