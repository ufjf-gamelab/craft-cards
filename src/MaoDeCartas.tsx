import { ReactNode } from "react"
import "./MaoDeCartas.css"
type MaoDeCartasProps = {children:Array<ReactNode>}

export default function MaoDeCartas({children:cartas}: MaoDeCartasProps){
  return <div className="maoDeCartas">
    <div className="tamanho">{cartas.length} Cartas</div>
    <div className="cartas">{cartas}</div>
  </div> 

}