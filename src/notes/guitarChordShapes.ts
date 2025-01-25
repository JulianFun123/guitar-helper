import {getDistance, NOTES, NotesType} from "./notes.js";
import {ParsedChord} from "./chords.js";

const BASIC_MAJOR_SHAPES = {
    'A': [0, 2, 2, 2, 0, null],
    'C': [0, 1, 0, 2, 3, null],
    'D': [2, 3, 2, 0, null, null],
    'E': [0, 0, 1, 2, 2, 0],
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
                console.log('YO')
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