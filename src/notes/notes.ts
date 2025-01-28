import {Note} from "tone/build/esm/core/type/NoteUnits.js";

export const NOTES = [
    'C', 'C#',
    'D', 'D#',
    'E',
    'F', 'F#',
    'G', 'G#',
    'A', 'A#',
    'B',
] as const

export const NOTE_NAMES = {
    'A': 'A',
    'A#': 'A# / Bb',
    'B': 'B',
    'C': 'C',
    'C#': 'C# / Db',
    'D': 'D',
    'D#': 'D# / Eb',
    'E': 'E',
    'F': 'F',
    'F#': 'F# / Gb',
    'G': 'G',
    'G#': 'G# / Ab',
}

export const NOTE_COLORS = {
    'A': ['!bg-red-600', '!text-white'],
    'A#': ['!bg-red-400', '!text-white'],
    'B': ['!bg-blue-600', '!text-white'],
    'C': ['!bg-green-600', '!text-white'],
    'C#': ['!bg-green-400', '!text-white'],
    'D': ['!bg-yellow-600', '!text-white'],
    'D#': ['!bg-yellow-400', '!text-white'],
    'E': ['!bg-cyan-600', '!text-white'],
    'F': ['!bg-pink-600', '!text-white'],
    'F#': ['!bg-pink-400', '!text-white'],
    'G': ['!bg-indigo-600', '!text-white'],
    'G#': ['!bg-indigo-400', '!text-white'],
}

export type NotesType = typeof NOTES[number];

export const getAfterWithOctave = (key: string, addition: number, startingOctave = 2): [NotesType, number] => {
    const ind = NOTES.findIndex(k => k === key)

    let newInd = ind + addition

    while (newInd < 0) {
        newInd += 12
        startingOctave--
    }

    while (newInd > NOTES.length - 1) {
        newInd -= NOTES.length
        startingOctave++
    }

    return [NOTES[newInd], startingOctave] as [NotesType, number]
}

export const getAfterFullNote = (key: string, addition: number, octave = 2): [NotesType, number] => {
    let outNote = key
    for (let i = 0; i < addition; i++) {
        const nextNote = getAfterWithOctave(key, i, octave)
        if (nextNote[0].includes('#') && i !== addition) {
            addition++
            continue
        }
        if (nextNote[0] === 'C') octave++

        outNote = nextNote[0]
    }

    console.log(octave)

    return [outNote as NotesType, octave]
}

export const getAfter = (key: string, addition: number): NotesType => {
    return getAfterWithOctave(key, addition)[0]
}


export const getMDistance = (first: string, firstOctave: number, second: string, secondOctave: number) => {
    const withoutSharps = NOTES.filter(n => n.length === 1)
    const firstInd = withoutSharps.findIndex(k => k === first)
    const secondInd = withoutSharps.findIndex(k => k === second)

    return (firstInd + (firstOctave*withoutSharps.length)) - (secondInd + (secondOctave * withoutSharps.length))
}
export const getDistance = (first: string, second: string) => {
    const firstInd = NOTES.findIndex(k => k === first)
    const secondInd = NOTES.findIndex(k => k === second)

    return Math.abs(firstInd - secondInd)
}

export const getAfterOctave = (key: string, addition: number, octave = 2) => {
    for (let a = 0; a < addition + 1; a++) {
        if (getAfter(key, a) === 'C') {
            octave++
        }
    }

    return octave
}
