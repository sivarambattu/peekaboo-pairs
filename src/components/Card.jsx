// src/components/Card.jsx
import { useState, useEffect } from 'react';
import '../styles/Card.css';

const Card = ({ id, content, isFlipped, isMatched, onClick }) => {
  return (
    <div 
      className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
      onClick={() => !isMatched && !isFlipped && onClick(id)}
    >
      <div className="card-inner">
        <div className="card-front">
          {isMatched ? '✓' : '?'}  {/* Show check mark if matched, otherwise question mark */}
        </div>
        <div className="card-back">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Card;
