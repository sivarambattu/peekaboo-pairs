// src/components/GameBoard.jsx
import { useState, useEffect } from 'react';
import Card from './Card';
import { getHighScore, updateHighScore } from '../services/dynamoDBService';
import '../styles/GameBoard.css';

const GameBoard = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [newHighScore, setNewHighScore] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const [lastScore, setLastScore] = useState({ match: 0, time: 0, flip: 0 }); // For showing score breakdown

  // Fetch high score when component mounts
  useEffect(() => {
    const fetchHighScore = async () => {
      const currentHighScore = await getHighScore();
      setHighScore(currentHighScore);
    };
    fetchHighScore();
  }, []);
  
  // Add this near the top of GameBoard.jsx, after the useState declarations
  useEffect(() => {
    // Test data - pairs of cards
    const initialCards = [
      { id: 1, content: '🐶' },
      { id: 2, content: '🐶' },
      { id: 3, content: '🐱' },
      { id: 4, content: '🐱' },
      { id: 5, content: '🐰' },
      { id: 6, content: '🐰' },
      { id: 7, content: '🦊' },
      { id: 8, content: '🦊' },
      { id: 9, content: '🐼' },
      { id: 10, content: '🐼' },
      { id: 11, content: '🐨' },
      { id: 12, content: '🐨' },
      { id: 13, content: '🐯' },
      { id: 14, content: '🐯' },
      { id: 15, content: '🐴' },
      { id: 16, content: '🐴' },
    ].sort(() => Math.random() - 0.5); // Shuffle the cards
  
    setCards(initialCards);
  }, []);


  // Start timer when first card is flipped
  useEffect(() => {
    if (flippedCards.length === 1 && !isGameStarted) {
      setIsGameStarted(true);
    }
  }, [flippedCards]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isGameStarted && !isGameComplete) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameStarted, isGameComplete]);

  // Calculate time bonus
  const calculateTimeBonus = (timeSpent) => {
    if (timeSpent <= 30) return 100; // Super fast: 100 bonus points
    if (timeSpent <= 45) return 75;  // Fast: 75 bonus points
    if (timeSpent <= 60) return 50;  // Good: 50 bonus points
    if (timeSpent <= 90) return 25;  // OK: 25 bonus points
    return 10; // Over 90 seconds: 10 bonus points
  };

  // Calculate flip efficiency bonus
  const calculateFlipBonus = (flips, totalPairs) => {
    // Minimum possible flips is 2 * totalPairs
    const minFlips = 2 * totalPairs;
    const extraFlips = flips - minFlips;
    
    if (extraFlips === 0) return 150; // Perfect memory!
    if (extraFlips <= 4) return 100;  // Very efficient
    if (extraFlips <= 8) return 75;   // Good
    if (extraFlips <= 12) return 50;  // Okay
    if (extraFlips <= 16) return 25;  // Could be better
    return 0;                         // Too many flips
  };  

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2) return;

    setFlipCount(prev => prev + 1);
    setFlippedCards([...flippedCards, cardId]);

    if (flippedCards.length === 1) {
      const firstCard = cards.find(card => card.id === flippedCards[0]);
      const secondCard = cards.find(card => card.id === cardId);

      if (firstCard.content === secondCard.content) {
        const timeBonus = calculateTimeBonus(timer);
        const flipBonus = calculateFlipBonus(flipCount + 1, cards.length / 2);
        const matchScore = 10; // Base score for a match

        setLastScore({
          match: matchScore,
          time: timeBonus,
          flip: flipBonus
        });

        setMatchedPairs([...matchedPairs, firstCard.content]);
        setScore(prevScore => prevScore + matchScore + timeBonus + flipBonus);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Check for game completion
  useEffect(() => {
    const checkGameComplete = async () => {
      if (matchedPairs.length === cards.length / 2 && isGameStarted) {
        setIsGameComplete(true);
        if (score > highScore) {
          setNewHighScore(true);
          setHighScore(score);
          await updateHighScore(score);
        }
      }
    };

    checkGameComplete();
  }, [matchedPairs, cards.length, score, highScore, isGameStarted]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset game function
  // const resetGame = () => {
  //   setCards(cards.sort(() => Math.random() - 0.5));
  //   setFlippedCards([]);
  //   setMatchedPairs([]);
  //   setScore(0);
  //   setTimer(0);
  //   setIsGameStarted(false);
  //   setIsGameComplete(false);
  //   setNewHighScore(false);
  // };
  const resetGame = () => {
    setCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairs([]);
    setScore(0);
    setTimer(0);
    setFlipCount(0);
    setIsGameStarted(false);
    setIsGameComplete(false);
    setNewHighScore(false);
    setLastScore({ match: 0, time: 0, flip: 0 });
  };

    return (
      <div className="game-container">
        <div className="game-info">
          <div className="score-container">
            <div className="current-score">Score: {score}</div>
            <div className="timer">Time: {formatTime(timer)}</div>
            <div className="high-score">High Score: {highScore}</div>
          </div>
          <div className="stats-container">
            <div className="flips">Flips: {flipCount}</div>
            {lastScore.match > 0 && (
              <div className="last-score">
                Last Match: +{lastScore.match} 
                {lastScore.time > 0 && <span className="bonus">+{lastScore.time} (time)</span>}
                {lastScore.flip > 0 && <span className="bonus">+{lastScore.flip} (efficiency)</span>}
              </div>
            )}
          </div>
          {isGameComplete && (
            <div className="game-complete">
              <div className="stats-summary">
                <p>Total Flips: {flipCount}</p>
                <p>Time: {formatTime(timer)}</p>
                <p>Final Score: {score}</p>
              </div>
              {newHighScore ? (
                <div className="new-high-score-message">
                  🎉 New High Score! 🎉
                </div>
              ) : (
                <div className="completion-message">
                  Game Complete!
                </div>
              )}
              <button className="reset-button" onClick={resetGame}>
                Play Again
              </button>
            </div>
          )}
        </div>
         <div className="game-board">
           {cards.map(card => (
             <Card
               key={card.id}
               id={card.id}
               content={card.content}
               isFlipped={flippedCards.includes(card.id) || matchedPairs.includes(card.content)}
               isMatched={matchedPairs.includes(card.content)}
               onClick={handleCardClick}
             />
           ))}
         </div>
      </div>
    );    

};

export default GameBoard;
