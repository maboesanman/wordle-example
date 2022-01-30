import React, { useState } from "react";
import { getRandomWord, validateWord } from "./../lib";
import WordleRowComponent, { RowData } from "./wordle-row";
import Keyboard, { KeyboardHints } from "./keyboard";
import { WordleEvent, WordleEventType } from "./events";

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
    return props.word ?? await getRandomWord(length)
  })());
  // const [mode] = useState(props.mode);

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
        entered: guesses.length - 1 > i,
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
        if(currentGuess === await word) {
          // check for victory
        }
        const wordValid = await validateWord(currentGuess);
        setWaiting(false);
        if(!wordValid) break;

        setGuesses([...guesses, ""]);
        break;
    }
  }

  const keyboardHints: () => KeyboardHints = () => {
    return {}
  }

  return (<div>
    <div className="wordle__board">
      {wordleRows().map((rowData, i) => <WordleRowComponent key={i} data={rowData} />)}
    </div>
    <div className="wordle__keyboard">
      <Keyboard eventHandler={handleEvent} hints={keyboardHints()} />
    </div>
  </div>)
};

export default WordleComponent;