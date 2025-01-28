import {getAfter, getAfterWithOctave, NOTES, NotesType} from "./notes.ts";
import {parseChord, ParsedChord} from "./chords.js";

const SCALE_NOTES = {
    MAJOR: [0,2,4,5,7,9,11],
    MINOR: [0,2,3,5,7,8,10],
    DIMINISHED: [0, 2, 3, 5, 6, 8, 9],
    AUGMENTED: [0, 2, 4, 6, 7, 9, 11],
}
export const getMajorScale = (key: NotesType, startingOctave = 2): [NotesType, number][] => {
    return [
        [key, startingOctave],
        getAfterWithOctave(key, 2, startingOctave),
        getAfterWithOctave(key, 4, startingOctave),
        getAfterWithOctave(key, 5, startingOctave),
        getAfterWithOctave(key, 7, startingOctave),
        getAfterWithOctave(key, 9, startingOctave),
        getAfterWithOctave(key, 11, startingOctave),
    ]
}

export const getMinorScale = (key: NotesType, startingOctave = 2): [NotesType, number][] => {
    return [
        [key, startingOctave],
        getAfterWithOctave(key, 2, startingOctave),
        getAfterWithOctave(key, 3, startingOctave),
        getAfterWithOctave(key, 5, startingOctave),
        getAfterWithOctave(key, 7, startingOctave),
        getAfterWithOctave(key, 8, startingOctave),
        getAfterWithOctave(key, 10, startingOctave),
    ]
}

export const getScale = (chord: string|ParsedChord, startingOctave = 2): [NotesType, number][] => {
    const parsed = typeof chord === 'string' ? parseChord(chord) : chord

    return SCALE_NOTES[parsed.type].map(n => getAfterWithOctave(parsed.baseNote, n, startingOctave))
}

export const jumpFind = (arr, addition, ind = 0) => {
    let newInd = ind + addition

    let increased = 0
    while (newInd < 0) {
        newInd += 12
        increased--
    }

    while (newInd > arr.length - 1) {
        newInd -= arr.length
        increased++
    }

    return [arr[newInd], increased, newInd]
}

