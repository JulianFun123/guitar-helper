import {getAfter} from "./notes.ts";
import {parseChord, ParsedChord} from "./chords.js";

export const getMajorScale = (key: string) => {
    return [
        key,
        getAfter(key, 2),
        getAfter(key, 4),
        getAfter(key, 5),
        getAfter(key, 7),
        getAfter(key, 9),
        getAfter(key, 11),
    ]
}

export const getMinorScale = (key: string) => {
    return [
        key,
        getAfter(key, 2),
        getAfter(key, 3),
        getAfter(key, 5),
        getAfter(key, 7),
        getAfter(key, 8),
        getAfter(key, 10),
    ]
}

export const getScale = (chord: string|ParsedChord) => {
    const parsed = typeof chord === 'string' ? parseChord(chord) : chord
    if (parsed.type === 'MAJOR') return getMajorScale(parsed.baseNote)
    if (parsed.type === 'MINOR') return getMinorScale(parsed.baseNote)
}