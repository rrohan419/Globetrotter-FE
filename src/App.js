import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { destinations } from "./assets/destinations";
import html2canvas from "html2canvas";
import useSound from "use-sound";
import "./App.css";

function App() {
  const [currentDestination, setCurrentDestination] = useState(null);
  const [options, setOptions] = useState([]);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [username, setUsername] = useState("");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [inviterScore, setInviterScore] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviter = urlParams.get("inviter");
    const inviterCorrect = urlParams.get("correct");
    const inviterIncorrect = urlParams.get("incorrect");
    if (inviter && inviterCorrect && inviterIncorrect) {
      setInviterScore({
        username: inviter,
        correct: parseInt(inviterCorrect),
        incorrect: parseInt(inviterIncorrect),
      });
    }
  }, []);

  const loadNewDestination = () => {
    const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
    const randomClues = randomDest.clues.sort(() => 0.5 - Math.random()).slice(0, 2);
    setCurrentDestination({ ...randomDest, clues: randomClues });
    const allCities = destinations.map((d) => `${d.city}, ${d.country}`);
    const incorrectOptions = allCities
      .filter((city) => city !== `${randomDest.city}, ${randomDest.country}`)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const allOptions = [...incorrectOptions, `${randomDest.city}, ${randomDest.country}`].sort(
      () => 0.5 - Math.random()
    );
    setOptions(allOptions);
    setUserGuess("");
    setFeedback(null);
    setShowConfetti(false);
  };

  const handlePlayAgain = () => {
    setScore({ correct: 0, incorrect: 0 });
    loadNewDestination();
  };

  const handleStartGame = () => {
    if (username.trim()) {
      setIsGameStarted(true);
      loadNewDestination();
    } else {
      alert("Please enter a username!");
    }
  };

  const handleGuess = () => {
    const isCorrect = userGuess === `${currentDestination.city}, ${currentDestination.country}`;
    const funFact = currentDestination.fun_fact[Math.floor(Math.random() * currentDestination.fun_fact.length)];
    setFeedback({ isCorrect, funFact });
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));
    setShowConfetti(isCorrect);
  };

  const handleChallengeFriend = async () => {
    const element = document.getElementById("game-screen");
    const canvas = await html2canvas(element);
    const imageUrl = canvas.toDataURL("https://www.shutterstock.com/image-photo/travel-world-monument-concept-2533906529");
    const inviteLink = `${window.location.origin}/?inviter=${username}&correct=${score.correct}&incorrect=${score.incorrect}`;
    const whatsappMessage = `Hey! I scored ${score.correct} correct on Globetrotter. Beat me if you can! ${inviteLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!isGameStarted) {
    return (
      <div className="App start-screen">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to Globetrotter Challenge!
        </motion.h1>
        {inviterScore && (
          <p className="inviter-text">
            {inviterScore.username} challenged you! Their score: {inviterScore.correct} correct,{" "}
            {inviterScore.incorrect} incorrect.
          </p>
        )}
        <motion.input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        <motion.button
          onClick={handleStartGame}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          Start Adventure
        </motion.button>
      </div>
    );
  }

  return (
    <div className="App game-screen">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Globetrotter Challenge
      </motion.h1>
      <div className="score-board">
        <p>
          {username}'s Journey: <span>{score.correct} 🌍</span> | <span>{score.incorrect} ✈️</span>
        </p>
      </div>

      {currentDestination && (
        <motion.div
          className="game-card"
          id="game-screen"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Where Am I?</h2>
          <ul className="clues">
            <AnimatePresence>
              {currentDestination.clues.map((clue, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  ✈️ {clue}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {!feedback && (
            <div className="guess-section">
              <select value={userGuess} onChange={(e) => setUserGuess(e.target.value)}>
                <option value="">Pick a destination</option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <motion.button
                onClick={handleGuess}
                disabled={!userGuess}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Guess!
              </motion.button>
            </div>
          )}

          {feedback && (
            <motion.div
              className="feedback-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {feedback.isCorrect ? (
                <>
                  {showConfetti && (
                    <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />
                  )}
                  <p className="correct">🎉 Nailed It! {feedback.funFact}</p>
                </>
              ) : (
                <p className="incorrect">
                  <span role="img" aria-label="plane crash">💥</span> Oops! {feedback.funFact}
                </p>
              )}
              <div className="button-group">
                <motion.button
                  onClick={loadNewDestination}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Next Stop
                </motion.button>
                <motion.button
                  onClick={handlePlayAgain}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Restart Journey
                </motion.button>
                <motion.button
                  onClick={handleChallengeFriend}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Challenge a Friend
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default App;