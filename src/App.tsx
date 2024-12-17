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
  return (
    <>
      <MaoDeCartas>
        {MAO.map((item)=><Carta key={item} titulo={item}/>)}
      </MaoDeCartas>
    </>
  );
}

export default App;
