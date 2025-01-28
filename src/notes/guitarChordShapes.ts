import {getDistance, NOTES, NotesType} from "./notes.js";
import {getChord, ParsedChord} from "./chords.js";
import {getFretboard} from "./fretboardHelper.js";

const BASIC_MAJOR_SHAPES = {
    'A': [0, 2, 2, 2, 0, null],
    'C': [0, 1, 0, 2, 3, null],
    'D': [2, 3, 2, 0, null, null],
    'E': [0, 0, 1, 2, 2, 0],
    'G': [3, 0, 0, 0, 2, 3],
}
const BASIC_MINOR_SHAPES = {
    'A': [0, 1, 2, 2, 0, null],
    'D': [1, 3, 2, 0, null, null],
    'E': [0, 0, 0, 2, 2, 0],
}

const BASIC_DIMINISHED_SHAPES = {
    'A#': [null, 2, 3, 2, 1, null],
}

export const GUITAR_CHORD_SHAPES = {
    MAJOR: BASIC_MAJOR_SHAPES,
    MINOR: BASIC_MINOR_SHAPES,
    DIMINISHED: BASIC_DIMINISHED_SHAPES,
}

export function generateChordShape(chord: string) {
    const fretboard = getFretboard(['E ', 'A', 'D', 'G', 'B', 'E'], 4);
    const chordSymboles = fretboard.map(() => null)

    for (const rowI in fretboard) {
        const row = fretboard[rowI];

        for (const colI in row) {
            const col = row[colI];

            if (getChord(chord, 2).map(n => n[0]).includes(col[0])) {
                chordSymboles[rowI] = {
                    note: col[0],
                    row: Number(rowI),
                    col: Number(colI)
                }
                break;
            }
        }
    }

    return (col: number, row: number) => {
        return chordSymboles.filter(s => s ? s.col === row && s.row === col : false).length > 0
    }
}

export function guitarChordHighlightedHandler(chord: ParsedChord, { shift = 0, shape = 'default' } = {}) {
    let chordShape = GUITAR_CHORD_SHAPES[chord.type]?.[chord.baseNote]

    if (!chordShape || shape !== 'default') {
        shift = NOTES.indexOf(chord.baseNote as NotesType)

        if (shape === 'default' && !GUITAR_CHORD_SHAPES[chord.type]?.[chord.baseNote]) {
            if (chord.type === 'DIMINISHED') {
                shape = 'A#'
            } else {
                shape = getDistance('E', chord.baseNote) < getDistance('A', chord.baseNote) ? 'E' : 'A'
            }
        }

        if (shape === 'default') {
        } else {
            if (chord.type === 'DIMINISHED') {

                switch (shape) {
                    case 'A#':
                        shift = shift - 2 > 0 ? shift - 1 : shift + 11;
                        break;
                }
            } else {
                switch (shape) {
                    case 'A':
                        break;
                    case 'E':
                        shift = shift - 7 > 0 ? shift - 7 : shift + 5;
                        break;
                    case 'D':
                        shift = shift - 3 > 0 ? shift - 4 : shift + 8;
                        break;
                }
            }
            chordShape = GUITAR_CHORD_SHAPES[chord.type]?.[shape]
        }


    }

    return {
        handler: (col: number, row: number) => {
            if (!chordShape) return false
            col = 5 - col

            return chordShape[col] === null ? false : chordShape[col] + shift === row
        },
        shift: shift
    }
}