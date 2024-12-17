import "./App.css";
import Carta from "./Carta";
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
  return (
    <>
      <MaoDeCartas>
        {MAO.map((item)=><Carta key={item.id} carta = {item}/>)}
      </MaoDeCartas>
    </>
  );
}

export default App;
