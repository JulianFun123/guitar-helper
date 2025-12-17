import BlindNotesExercise from "../views/exercises/fretboard/BlindNotesExercise.js";

export type Exercise = {
    name: string;
    icon: string;
    label: string;
    difficulty: number;
    description: string;
    component: () => any;
    features?: ('guitar')[]
}

export default [
    {
        name: 'blind-notes',
        icon: "fretboard",
        label: "Learn the fretboard notes",
        difficulty: 2,
        description: `Ready to become a fretboard ninja? In this exercise, a note will pop up, and it’s your job to track it down somewhere on the guitar neck. Don’t worry if it feels tricky at first—every miss is just another chance to level up your note-hunting skills. The more you play, the faster your fingers and brain will start to work together, turning the entire fretboard into your personal playground. By the end, you’ll be able to spot any note at a glance, improvise with confidence, and finally say goodbye to those “Where is that note again?” moments. Fun, challenging, and addictive, this exercise is your ticket to mastering the fretboard one note at a time!`,
        component: () => BlindNotesExercise(),
        features: ['guitar'],
    }
] as Exercise[]