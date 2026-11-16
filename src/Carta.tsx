import { CartaType } from "./data/cartas.ts";
import "./Carta.css";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { useCardTranslations } from "./i18n/useCardTranslations.ts";

type CartaProps = {
  carta: CartaType;
  onCartaClick: () => void;
  facedown?: boolean;
};

export default function Carta({
  carta,
  onCartaClick,
  facedown = false,
}: CartaProps) {
  const tr = useCardTranslations();

  const titulo = tr.tituloSmart(carta);
  const texto = tr.textoSmart(carta);

  // Identidade da cópia física. Fallback para id (compat. com saves antigos).
  const instanceKey = carta._instanceId ?? carta.id;

  const back = <h1>Craft Cards</h1>;
  const front = (
    <>
      <h1>{titulo}</h1>
      <section>
        <p>{texto}</p>
        {carta.ganho.map((ganho) => (
          <p key={ganho.nome}>
            {ganho.quantidade > 0 ? "+" : "-"} {ganho.quantidade}{" "}
            {tr.resource(ganho.nome)}
          </p>
        ))}
      </section>
      <div className="custo">
        {carta.custo.map((custo) => (
          <p key={custo.nome}>
            {custo.quantidade > 0 ? "-" : "+"} {custo.quantidade}{" "}
            {tr.resource(custo.nome)}
          </p>
        ))}
      </div>
    </>
  );

  return (
    <AnimatePresence>
      <motion.div
        layoutId={instanceKey}
        initial={{ scale: 1.0 }}
        animate={{ scale: 1.0 }}
        exit={{ scale: 1.0 }}
        transition={{
          duration: 1.0,
          scale: { type: "inertia", visualDuration: 5 },
        }}
        className={`carta ${facedown && "facedown"}`}
        onClick={() => {
          onCartaClick();
        }}
      >
        {facedown ? back : front}
      </motion.div>
    </AnimatePresence>
  );
}