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
  ganho:Array<RecursoType>;
}

export type RecursoType = {
  nome: string;
  quantidade: number;
};

const RECURSOS: Array<RecursoType> = [
  { nome: "Ação", quantidade: 1 },
  { nome: "Madeira", quantidade: 0 },
];

const MAO:Array<CartaType> = [
  {id:"m1", titulo: "Pegar madeira",texto:"", custo: 0, ganho: [{nome:"madeira", quantidade: 1}]},
  {id:"a1", titulo: "Pegar água",texto:"", custo: 0, ganho: [{nome:"água", quantidade: 1}]},
  {id:"a2", titulo: "Pegar água",texto:"", custo: 0, ganho: [{nome:"água", quantidade: 1}]},
  {id:"p1", titulo: "Pegar pedra",texto:"", custo: 1, ganho: [{nome:"pedra", quantidade: 1}]},
  {id:"b1", titulo: "Pegar amora",texto:"", custo: 2, ganho: [{nome:"amora", quantidade: 1}]},
  {id:"m2", titulo: "Pegar madeira",texto:"", custo: 0, ganho: [{nome:"madeira", quantidade: 2}]},
]


function App() {
  const [pontos, setPontos] = useState(0);
  const [recursos, setRecursos] = useState(RECURSOS);

  function aumentaPonto(){
    setPontos(pontos + 1);
  }

  function diminuiAcao(){
    const newRecursos = structuredClone(recursos);
    newRecursos[0].quantidade = newRecursos[0].quantidade -1;
    setRecursos(newRecursos);
  }

  function onCartaClick(carta:CartaType){
    console.log("carta clicada", carta);
    setRecursos([...recursos, ...carta.ganho]);
  }

  return (
    <>
      <div>pontos: {pontos}</div>
      <button onClick={aumentaPonto}>Aumenta Ponto</button>
      <button onClick={diminuiAcao}>Diminui Ação</button>
      <ListaDeRecursos recursos = {recursos}/>
      <MaoDeCartas>
        {MAO.map((item)=><Carta key={item.id} carta = {item} onCartaClick={()=>{onCartaClick(item);}}/>)}
      </MaoDeCartas>
    </>
  );
}

export default App;
