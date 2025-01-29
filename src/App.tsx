import { useState } from "react";
import "./App.css";
import Carta from "./Carta";
import ListaDeRecursos from "./ListaDeRecursos";
import MaoDeCartas from "./MaoDeCartas";
import {BARALHO_INICIAL, CartaType, DESCARTE_INICIAL, MAO_INICIAL, RECURSOS_INICIAL} from "./data/cartas.ts";



function App() {
  const [pontos, setPontos] = useState(0);
  const [recursos, setRecursos] = useState(RECURSOS_INICIAL);

  const [mao, setMao] = useState(MAO_INICIAL);
  const [descarte, setDescarte] = useState(DESCARTE_INICIAL);
  const [baralho, setBaralho] = useState(BARALHO_INICIAL);

  function aumentaPonto() {
    setPontos(pontos + 1);
  }

  function diminuiAcao() {
    const newRecursos = structuredClone(recursos);
    newRecursos[0].quantidade = newRecursos[0].quantidade - 1;
    setRecursos(newRecursos);
  }

  function onCartaClick(carta: CartaType) {
    console.log("carta clicada", carta);

    const newRecursos = structuredClone(recursos);

    carta.ganho.forEach((ganho) => {
      const recurso = newRecursos.find((r) => r.nome === ganho.nome);
      if (recurso) {
        recurso.quantidade += ganho.quantidade;
      } else {
        newRecursos.push(structuredClone(ganho));
      }
    });
    if (newRecursos.some((r) => r.quantidade < 0)) {
      console.log("Não pode jogar essa carta");
      return;
    }

    setRecursos(newRecursos);
    const index = mao.findIndex(c=>c === carta);
    const newMao = structuredClone(mao);
    const newDescarte = structuredClone(descarte);

    newDescarte.push(...newMao.splice(index,1));

    setMao(newMao);
    setDescarte(newDescarte);
  }

  return (
    <>
      <div>pontos: {pontos}</div>
      <button onClick={aumentaPonto}>Aumenta Ponto</button>
      <button onClick={diminuiAcao}>Diminui Ação</button>
      <ListaDeRecursos recursos={recursos} />
      <h2>Mão</h2>
      <MaoDeCartas>
        {mao.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {
              onCartaClick(item);
            }}
          />
        ))}
      </MaoDeCartas>
      <h2>Descarte</h2>
      <MaoDeCartas>
        {descarte.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {}}
          />
        ))}
      </MaoDeCartas>
      <h2>Baralho</h2>
      <MaoDeCartas>
        {baralho.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {}}
          />
        ))}
      </MaoDeCartas>
    </>
  );
}

export default App;
