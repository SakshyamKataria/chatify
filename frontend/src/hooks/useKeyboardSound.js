//A custom hook to play a sound when a key is pressed from given set of 4 keystroke mp3 in public folder
//audio setup
import { useEffect } from "react";

const keyStrokeSound = [
    new Audio("./sounds/keystroke1.mp3"),
    new Audio("./sounds/keystroke2.mp3"),
    new Audio("./sounds/keystroke3.mp3"),
    new Audio("./sounds/keystroke4.mp3"),
]

function useKeyboardSound(isSoundEnabled){
    const playRandomKeyStrokeSound = () => {
        const randomSound = keyStrokeSound[Math.floor(Math.random() * keyStrokeSound.length)];
        randomSound.currentTime = 0; // Reset the sound to the beginning
        randomSound.play().catch(error => console.log("Error playing sound:", error));
    };

    return { playRandomKeyStrokeSound };


}

export default useKeyboardSound;