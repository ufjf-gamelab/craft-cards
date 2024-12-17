import "./App.css";
import Carta from "./Carta";
import MaoDeCartas from "./MaoDeCartas";

const MAO:Array<string> = [
  "Pegar madeira",
  "Pegar pedra",
  "Pegar água",
  "Pegar amoras"
]

function App() {

  const cartas = [];
  for(let i = 0; i < MAO.length; i++){
    cartas.push(<Carta key={MAO[i]} titulo={MAO[i]}/>)
  }

  return (
    <>
      <MaoDeCartas>
        {cartas}
      </MaoDeCartas>
    </>
  );
}

export default App;
