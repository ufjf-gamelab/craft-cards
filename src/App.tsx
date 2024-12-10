import "./App.css";
import Carta from "./Carta";
import MaoDeCartas from "./MaoDeCartas";

function App() {
  return (
    <>
      <MaoDeCartas>
        <Carta titulo="Pegar madeira" />
        <Carta titulo="Pegar pedra" />
        <Carta titulo="Pegar água" />
      </MaoDeCartas>
    </>
  );
}

export default App;
