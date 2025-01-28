import {getAfter, getAfterFullNote, getAfterWithOctave, NOTES, NotesType} from "./notes.ts";
import {getMajorScale, getMinorScale, getScale, jumpFind} from "./scales.js";
import Chord from "../components/Chord.js";

const CHORD_TYPE_NOTES = {
    MAJOR: [0, 4, 7],
    MINOR: [0, 3, 7],
    DIMINISHED: [0, 3, 6],
    AUGMENTED: [0, 4, 8],
} as const


export const getMajorChord = (key: string) => {
    return [
        key,
        getAfter(key, 4),
        getAfter(key, 7),
    ]
}
export const getMinorChord = (key: string) => {
    return [
        key,
        getAfter(key, 3),
        getAfter(key, 7),
    ]
}
export const getChord = (chordString: string, startingOctave = 2) => {
    const chord = parseChord(chordString)
    const scale = getScale(chord, startingOctave)

    const arr = [jumpFind(scale, 0)[0], jumpFind(scale, 2)[0], jumpFind(scale, 4)[0]]

    for (let extension of chord.extensions) {
        if (extension.type === 'TH') {
            const [i, oin, inc] = jumpFind(scale, extension.value)
            arr.push([NOTES[inc], scale[0][1] + oin])
        }
    }

    return arr
}

export const getMajorScaleChords = (key: NotesType) => {
    const scaleNotes = getMajorScale(key).map(k => k[0])
    return [
        `${scaleNotes[0]}`,
        `${scaleNotes[1]}m`,
        `${scaleNotes[2]}m`,
        `${scaleNotes[3]}`,
        `${scaleNotes[4]}`,
        `${scaleNotes[5]}m`,
        `${scaleNotes[6]}dim`,
    ]
}
export const getMinorScaleChords = (key: NotesType) => {
    const scaleNotes = getMinorScale(key).map(k => k[0])
    return [
        `${scaleNotes[0]}m`,
        `${scaleNotes[1]}dim`,
        `${scaleNotes[2]}`,
        `${scaleNotes[3]}m`,
        `${scaleNotes[4]}m`,
        `${scaleNotes[5]}`,
        `${scaleNotes[6]}`,
    ]
}

export type ChordType = keyof typeof CHORD_TYPE_NOTES
export type ParsedChord = {
    baseNote?: string;
    type?: ChordType,
    cameFromb?: boolean
    fullName?: string,
    extensions?: {
        type: string;
        value: any
    }[]
}

export function parseChord(chord: string): ParsedChord {
    const noteParts = chord.split('')
    let type: ChordType = 'MAJOR'

    let cameFromb = false

    const extensions = []

    function nextIs(string: string, startInd = 0) {
        const split = string.split('')

        for (let indStr in split) {
            const ind = parseInt(indStr)
            const current = noteParts[ind + startInd]

            if (current === undefined || current != split[ind]) return false
        }

        return true
    }

    function nextIsAndCall(text: string) {
        if (nextIs(text)) {
            let s = noteParts.slice(0, text.length)
            noteParts.splice(0, text.length)
            return s.join('') || true
        }
        return false
    }

    let baseNote = [...NOTES].reverse().find(n => nextIsAndCall(n))

    const types: [string[], ChordType][] = [
        [['major', 'maj', 'M'], 'MAJOR'],
        [['minor', 'min', 'Min', 'm'], 'MINOR'],
        [['dim', 'Dim'], 'DIMINISHED'],
        [['aug', 'Aug', '+'], 'AUGMENTED'],
    ];

    const getNextNumber = () => {
        let out = ''
        while (true) {
            if (noteParts[0] && ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(noteParts[0])) {
                out += noteParts[0]
                noteParts.splice(0,1)
            } else break
        }

        if (out === '') return false
        return Number(out)
    }

    let i = 0
    while (noteParts.length > 0) {
        if (i++ > 100) break;

        const th = getNextNumber()
        if (th !== false) extensions.push({type: 'TH', value: th})


        if (nextIsAndCall(' ')) {} else if (nextIsAndCall('b')) {
            baseNote = getAfter(baseNote, -1)
            cameFromb = true
        } else if (nextIsAndCall('add')) {
            extensions.push({
                type: 'ADD',
                value: getNextNumber()
            })
        } else {
            for (const [vals, valType] of types) {
                for (const val of vals) {
                    if (nextIsAndCall(val)) {
                        type = valType
                        continue;
                    }
                }
            }
        }
    }

    return {
        baseNote,
        type,
        cameFromb,
        fullName: chord,
        extensions
    }
}

export function buildChord(options: ParsedChord): string {
    return `${options.baseNote}${
        options.type === 'MINOR' ? 'm' : options.type === 'DIMINISHED' ? 'dim' : ''
    }`
}
