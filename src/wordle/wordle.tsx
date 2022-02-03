import React, { useState } from "react";
import { getRandomWord, validateWord } from "./../lib";
import WordleBoardComponent from "./wordle-board";
import Keyboard from "./keyboard";
import { RowData, WordleEvent, WordleEventType } from "./wordle-types";
import ResultComponent from "./result";

import styles from "./wordle.module.scss";

export interface Props {
  length: number;
  rows?: number;
  word?: string;
  mode: "normal" | "hard" | "hardcore";
}

const WordleComponent: React.FC<Props> = (props) => {
  // these props can't react to change, so we make them state.
  const [length] = useState(props.length);
  const [rows] = useState(props.rows ?? 6);
  const [word] = useState<Promise<string>>((async () => {
    return props.word ?? await getRandomWord(length);
  })());
  const [wordAwaited, setWordAwaited] = useState("");
  const [victory, setVictory] = useState(false);
  const [complete, setComplete] = useState(false);

  const [waiting, setWaiting] = useState(false);
  const [guesses, setGuesses] = useState<string[]>([""]);
  const getCurrentGuess = () => guesses[guesses.length - 1];
  const setCurrentGuess = (v: string) => {
    const newGuesses = [...guesses];
    newGuesses[newGuesses.length - 1] = v;
    setGuesses(newGuesses);
  };

  const wordleRows: () => RowData[] = () => {
    const result: RowData[] = [];
    for (let i = 0; i < rows; i++) {
      result.push({
        length,
        guess: guesses[i] ?? "",
        entered: (guesses.length - 1 > i),
        word,
      })
    }
    return result
  }

  const handleEvent = async (event: WordleEvent) => {
    const currentGuess = getCurrentGuess()
    switch(event.type) {
      case(WordleEventType.Letter):
        if(waiting) break;
        if(currentGuess.length === length) break;

        setCurrentGuess(currentGuess + event.letter);
        break;
      case(WordleEventType.Back):
        if(waiting) break;
        if(currentGuess.length === 0) break;

        setCurrentGuess(currentGuess.slice(0, -1));
        break;
      case(WordleEventType.Enter):
        if(waiting) break;
        if(currentGuess.length !== length) break;
        setWaiting(true);
        setWordAwaited(await word);
        if(currentGuess === await word) {
          setComplete(true);
          setVictory(true);
          setGuesses([...guesses, ""]);
          break;
        }

        const wordValid = await validateWord(currentGuess);
        setWaiting(false);
        if(!wordValid) break;

        if(guesses.length === rows) {
          setComplete(true);
          setVictory(false);
        }
        setGuesses([...guesses, ""]);
        
        break;
    }
  }

  const rowData = wordleRows();

  return (
    <div className={styles["wordle__wrapper"]}>
      <div className={styles["wordle"]}>
        <div className={styles["wordle__board"]}>
          <WordleBoardComponent rows={rowData} />
        </div>
        <div className={styles["wordle__result"]}>
          {complete ? <ResultComponent victory={victory} word={wordAwaited} /> : undefined}
        </div>
        <div className={styles["wordle__keyboard"]}>
          <Keyboard eventHandler={handleEvent} rowData={rowData} />
        </div>
      </div>
    </div>
  )
};

export default WordleComponent;