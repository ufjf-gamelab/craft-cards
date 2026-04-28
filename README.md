# Craft Cards – Modeling and Simulation of Deck Building Games as Discrete Systems

An interactive web application that simulates a resource‑based deck‑building card game, providing real‑time visualizations and analytical tools to assist designers in balancing game mechanics. Using graph theory and Petri nets, the system models relationships between cards and resources, enabling in‑depth analysis of system dynamics, identification of imbalances, and exploration of possible game states.


## Objective

Implement an online tool that assists in balancing deck‑building card games through simulation and visual analysis, using graph theory and Petri nets to model relationships between cards and resources, providing real‑time visualizations and metrics that identify imbalances in the early stages of game design.


## Prerequisites

| Tool            | Minimum Version                      |
|-----------------|--------------------------------------|
| **Node.js**     | 18.0                                 |
| **npm**         | 8.0                                  |
| **React**       | 18.0                                 |
| **TypeScript**  | 5.0                                  |
| **Systems**     | Linux, macOS, WSL or Windows 10+     |

## Technologies Used

| Tool            | Description                          |
|-----------------|--------------------------------------|
| **React**       | Main Framework                       |
| **TypeScript**  | Static Typing                        |
| **D3.js**       | Advanced Graphical Visualizations    |
| **Graphology**  | Graph Manipulation                   |
| **Material-UI** | Interface Components                 |
| **LocalForage** | Local Persistence                    |
| **FramerMotion**| Animations                           |
| **Recharts**    | History Charts                       |

## Folder Structure

```text
src/
├── data/
│   └── cards.ts               # Card definitions and types
├── App.tsx                    # Main component
├── Baralho.tsx                # Deck component
├── Carta.tsx                  # Individual card component
├── Game.ts                    # Main game logic (reducer, actions)
├── GameProvider.tsx           # Context provider
├── Historico.tsx              # History charts
├── HistoricoLog.tsx           # Detailed turn log
├── Jogador.tsx                # Player interface (hand, play area)
├── ListaDeCartas.tsx          # Card listing layout
├── ListaDeRecursos.tsx        # Resource display
├── Oferta.tsx                 # Card market area
├── ResourcePetriNet.tsx       # Interactive Petri net
├── ResourceGraph.tsx          # Graph visualization
├── GraphMetrics.tsx           # Graph metrics and balance analysis
├── persistance.ts             # Save/load system
├── PersistanceDropdown.tsx    # Persistence UI menu
├── LegendaGrafo.tsx           # Graph legend
└── ...
```

## Installation and Execution

### Installing Dependencies

```bash
npm install
```

### Running Development Environment

```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the port shown in the terminal).

## System Features

1. Game System
    - Resource Management: Collection and consumption of basic resources (wood, water, stone, berry)
    - Action Cards: Cards with specific costs and benefits
    - Turns: Turn-based system with purchase and execution phases
    - Card Market: Dynamic market of available cards
    - Seed-based Generation: Start a new game with specific seed to ensure repoducible shuffling

2. Petri Net Analysis
    - Interactive Visualization: Places (resources) and transitions (cards)
    - Free Mode: Manual token manipulation for experimentation
    - Transition Firing: Testing enabled transitions
    - Dynamic Marking: Real-time state updates

3. Reachability Tree
    - Automatic Expansion: Generation of all reachable states
    - Omega Detection: Identification of infinite resources
    - Controlled Simulation: Limited expansion for focused analysis
    - Hierarchical Visualization: Navigation through system states
    - Detailed Table: List all generated states with their marking, transition that lead to them, type (initial, omega, cyclic, terminal, simulation), and a button to center the specific node of your choice

4. Resource Graphs
    - Cost-Benefit Relationships: Directional visualization between cards and resources
    - Dynamic Layout: Force algorithms for automatic organization
    - Network Metrics: Quantitative analysis of connections
    - Balance Analysis Panel: Automatically identifies problems, warnings, and suggestions based on the metrics (e.g., resources not connected, high demand without production, global imbalance).

5. Persistence Systems
    - Local Saving: Browser storage
    - Export/Import: JSON files for backup
    - Versioning: Automatic migration between versions
    - Reproducible Seeds: Consistent game generation

6. Game History
    - Line Chart: Evolution of each resource quantity over turns and actions.
    - Detailed Log: Reverse-chronological list of turns, actions, and resource states after each action.

## Main Controls

### Game Header

| Control / Area          | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| **Pontos**              | Current score (points)                                                      |
| **Recursos**            | List of resources with their current quantities                             |
| **Seed atual**          | Shows the seed used for the current game                                    |
| **Seed input + button** | Enter a seed and click "Novo Jogo com Seed" to restart with that seed       |
| **Aumenta Ponto**       | Debug: increases points by 1                                                |
| **Diminui Ação**        | Debug: decreases action points by 1 (if action resource exists)             |
| **Mostrar Análises**    | Toggles the analysis panel on/off                                           |
| **Passar Turno**        | Advances to the next turn, triggering history recording                     |
| **Persistence dropdown**| Save/Load/Reset/Export/Import options                                       |
| **Theme toggle**        | Switch between light and dark themes                                        |

### Analysis Tabs (when panel is visible)

| Tab           | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| **Petri Net** | Interactive Petri net with free mode and reachability tree generation       |
| **Graph**     | Resource graph with metrics and balance analysis                            |
| **Histórico** | Resource evolution chart and detailed turn log                              |

### Petri Net Specific Controls

| Action                | Function                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| **Left Click**        | Increments tokens in a resource place (in free mode)                    |
| **Right Click**       | Decrements tokens in a resource place (in free mode)                    |
| **Click Transition**  | Fires the transition if it is enabled (enough tokens)                   |
| **Mode Free/Normal**  | Toggle free mode (manual token editing)                                  |
| **Expansions slider** | Select number of simulation expansions for the reachability tree (0‑10) |
| **Generate Tree**     | Build and display the reachability tree based on current marking         |

### Graph Specific Controls

| Action                | Function                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| **Drag nodes**        | Manually reposition nodes                                                |
| **Scroll**            | Zoom in/out                                                              |
| **Metrics tab**       | View detailed graph metrics                                              |
| **Balance tab**       | View problems, warnings, and suggestions based on metrics                |

### History

| Action                | Function                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| **Line chart**        | Hover over lines to see exact values; click legend to toggle resources   |
| **Log**               | Scroll through turns; each turn shows actions and resource states        |


## Developers

| Name                      | Student ID  | E‑mail                                                                      |
| ------------------------- | ----------- | --------------------------------------------------------------------------- |
| Isabela Coelho Oliveira   | 202365226AB | [isabela.coelho@estudante.ufjf.br](mailto:isabela.coelho@estudante.ufjf.br) |
| Igor de Oliveira Knop     | XXXXXXXXX   | [igor.knop@ufjf.br](mailto:igor.knop@ufjf.br)                                       |

## Publications and Presentations

[Mention presentations and publications]

## License
> © 2025 UFJF – Computer Science Department