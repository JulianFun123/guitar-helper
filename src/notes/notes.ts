export const NOTES = [
    'A', 'A#',
    'B',
    'C', 'C#',
    'D', 'D#',
    'E',
    'F', 'F#',
    'G', 'G#'
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
    'G#': 'G / Ab',
}

export const NOTE_COLORS = {
    'A': ['bg-red-600', 'text-white'],
    'A#': ['bg-red-400', 'text-white'],
    'B': ['bg-blue-600', 'text-white'],
    'C': ['bg-green-600', 'text-white'],
    'C#': ['bg-green-400', 'text-white'],
    'D': ['bg-yellow-600', 'text-white'],
    'D#': ['bg-yellow-400', 'text-white'],
    'E': ['bg-cyan-600', 'text-white'],
    'F': ['bg-pink-600', 'text-white'],
    'F#': ['bg-pink-400', 'text-white'],
    'G': ['bg-indigo-600', 'text-white'],
    'G#': ['bg-indigo-400', 'text-white'],
}

export type NotesType = typeof NOTES[number];

export const getAfter = (key: string, addition: number) => {
    const ind = NOTES.findIndex(k => k === key)

    let newInd = ind + addition

    while (newInd > NOTES.length - 1) {
        newInd -= NOTES.length
    }

    if (NOTES[newInd] === undefined) {
        console.log(newInd)
    }

    return NOTES[newInd]
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
