import { useState } from "react";
import "./App.css";
import Carta from "./Carta";
import ListaDeRecursos from "./ListaDeRecursos";
import MaoDeCartas from "./MaoDeCartas";

export type CartaType = {
  id:string;
  titulo:string;
  texto:string;
  custo:number;
}

const MAO:Array<CartaType> = [
  {id:"m1", titulo: "Pegar madeira",texto:"Ganha 1 madeira", custo: 0},
  {id:"a1", titulo: "Pegar água",texto:"Ganha 1 água", custo: 0},
  {id:"a2", titulo: "Pegar água",texto:"Ganha 1 água", custo: 0},
  {id:"p1", titulo: "Pegar pedra",texto:"Ganha 1 pedra", custo: 1},
  {id:"b1", titulo: "Pegar amora",texto:"Ganha 1 amora", custo: 2},
  {id:"m2", titulo: "Pegar madeira",texto:"Ganha 1 madeira", custo: 0},
]


function App() {
  let [pontos, setPontos] = useState(0);
  
  function aumentaPonto(){
    setPontos(pontos + 1);
  }
  return (
    <>
      <div>pontos: {pontos}</div>
      <button onClick={aumentaPonto}>Aumenta Ponto</button>
      <ListaDeRecursos/>
      <MaoDeCartas>
        {MAO.map((item)=><Carta key={item.id} carta = {item}/>)}
      </MaoDeCartas>
    </>
  );
}

export default App;
