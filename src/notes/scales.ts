import {getAfterWithOctave, NotesType} from "./notes.ts";
import {parseChord, ParsedChord} from "./chords.js";

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
    if (parsed.type === 'MAJOR') return getMajorScale(parsed.baseNote as NotesType, startingOctave)
    if (parsed.type === 'MINOR') return getMinorScale(parsed.baseNote as NotesType, startingOctave)
}