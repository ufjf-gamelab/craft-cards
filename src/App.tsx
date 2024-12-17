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

  const cartas = MAO.map(function(item){
    return <Carta key={item} titulo={item}/>;
  });

  return (
    <>
      <MaoDeCartas>
        {cartas}
      </MaoDeCartas>
    </>
  );
}

export default App;
