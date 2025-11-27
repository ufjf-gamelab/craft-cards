# Modeling and Simulation of Deck Building Games as Discrete Systems

## Objective

Implement an online tool that assists in balancing deck-building card games through simulation and visual analysis, using graph theory and Petri nets to model relationships between cards and resources, providing real-time visualizations and metrics that identify imbalances in the early stages of game design.

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

## Folder Structure

```text
src/
├── data/
│   └── cards.ts             # Card definitions and types
├── App/                     # Main component
├── Baralho/                 # Deck component
├── Carta/                   # Individual card component
├── Historico/               # History and charts
├── Jogador/                 # Player interface
├── ListaDeCartas/           # Card listing
├── ListaDeRecursos/         # Resource display
├── Oferta/                  # Card market area
├── ResourcePetriNet/        # Interactive Petri net
├── ResourceGraph/           # Graph visualization
├── Game.ts                  # Main game logic
├── persistance.ts           # Save system
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

## System Features

1. Game System
    - Resource Management: Collection and consumption of basic resources (wood, water, stone, berry)
    - Action Cards: Cards with specific costs and benefits
    - Turns: Turn-based system with purchase and execution phases
    - Card Market: Dynamic market of available cards

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

4. Resource Graphs
    - Cost-Benefit Relationships: Directional visualization between cards and resources
    - Dynamic Layout: Force algorithms for automatic organization
    - Network Metrics: Quantitative analysis of connections

5. Persistence Systems
    - Local Saving: Browser storage
    - Export/Import: JSON files for backup
    - Versioning: Automatic migration between versions
    - Reproducible Seeds: Consistent game generation

## Main Controls

| Action             | Function                                                          |
|--------------------|-------------------------------------------------------------------|
| **End Turn**       | Advances to next turn                                             |
| **Increase Point** | Increments score (debug)                                          |
| **Decrease Action**| Decrements available actions (debug)                              |
| **Show/Hide Analysis** | Toggles analysis panel                                 |

### Analysis Tabs

| Tab           | Function                                                            |
|---------------|---------------------------------------------------------------------|
| **Petri Net** | Interactive Petri net                                               |
| **Graph**     | Directed graph visualization                                        |
| **History**   | Temporal resource charts                                            |

### Petri Net

| Action                | Function                                                          |
|-----------------------|-------------------------------------------------------------------|
| **Left Click**        | Increments tokens in a resource                                   |
| **Right Click**       | Decrements tokens in a resource                                   |
| **Click Transition**  | Fires the transition if enabled                                   |

## Developers

| Name                      | Student ID  | E‑mail                                                                      |
| ------------------------- | ----------- | --------------------------------------------------------------------------- |
| Isabela Coelho Oliveira   | 202365226AB | [isabela.coelho@estudante.ufjf.br](mailto:isabela.coelho@estudante.ufjf.br) |
| Igor de Oliveira Knop     | XXXXXXXXX   | [xxx@ufjf.br](mailto:teste@gmail.com)                                       |

## Publications and Presentations

Mention presentations and publications

## License
> © 2025 UFJF – Computer Science Department