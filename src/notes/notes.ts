export const NOTES = [
    'A', 'A#',
    'B',
    'C', 'C#',
    'D', 'D#',
    'E',
    'F', 'F#',
    'G', 'G#'
] as const

export const NOTE_COLORS = {
    'A': ['red-600', 'white'],
    'A#': ['red-400', 'white'],
    'B': ['blue-600', 'white'],
    'C': ['green-600', 'white'],
    'C#': ['green-400', 'white'],
    'D': ['yellow-600', 'white'],
    'D#': ['yellow-400', 'white'],
    'E': ['cyan-600', 'white'],
    'F': ['pink-600', 'white'],
    'F#': ['pink-400', 'white'],
    'G': ['indigo-600', 'white'],
    'G#': ['indigo-400', 'white'],
}

export type NotesType = typeof NOTES

export const getAfter = (key: string, addition: number) => {
    const ind = NOTES.findIndex(k => k === key)

    let newInd = ind + addition

    while (newInd > NOTES.length - 1) {
        newInd -= NOTES.length
    }

    return NOTES[newInd]
}

export const getAfterOctave = (key: string, addition: number, octave = 2) => {
    for (let a = 0; a < addition + 1; a++) {
        if (getAfter(key, a) === 'C') {
            octave++
        }
    }

    return octave
}
