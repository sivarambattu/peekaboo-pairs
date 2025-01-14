import './styles/App.css';
import GameBoard from './components/GameBoard';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="game-title">
          <span className="title-icon">✨</span>
          Peekaboo Pairs
          <span className="title-icon">✨</span>
        </h1>
      </header>
      <GameBoard />
    </div>
  );
}

export default App;
