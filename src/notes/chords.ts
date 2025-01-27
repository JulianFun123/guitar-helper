import {getAfter, NOTES} from "./notes.ts";
import {getMajorScale, getMinorScale} from "./scales.js";

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

export const getMajorScaleChords = (key: string) => {
    const scaleNotes = getMajorScale(key)
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
export const getMinorScaleChords = (key: string) => {
    const scaleNotes = getMinorScale(key)
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

type ChordType = 'MAJOR' | 'MINOR' | 'DIMINISHED'
export type ParsedChord = {
    baseNote: string;
    type: ChordType,
    cameFromb: boolean
}

export function parseChord(chord: string): ParsedChord {
    const noteParts = chord.split('')
    let type: ChordType = 'MAJOR'

    let cameFromb = false

    function nextIs(string, startInd = 0) {
        const split = string.split('')

        for (let indStr in split) {
            const ind = parseInt(indStr)
            const current = noteParts[ind + startInd]

            if (current === undefined || current !== split[ind]) return false
        }

        return true
    }

    function nextIsAndCall(text: string) {
        if (nextIs(text)) {
            noteParts.splice(0, text.length)
            return true
        }
        return false
    }

    let baseNote = [...NOTES].reverse().find(n => nextIsAndCall(n))

    let i = 0
    while (noteParts.length > 0) {
        if (i++ > 100) break;

        if (nextIsAndCall('maj') || nextIsAndCall('Maj')) {
            type = 'MINOR'
        } if (nextIsAndCall('min') || nextIsAndCall('Min') || nextIsAndCall('m')) {
            type = 'MINOR'
        } else if (nextIsAndCall('dim') || nextIsAndCall('Dim')) {
            type = 'DIMINISHED'
        } else if (nextIsAndCall('b')) {
            baseNote = getAfter(baseNote, -1)
            cameFromb = true
        } else {
            break;
        }
    }

    return {
        baseNote,
        type,
        cameFromb
    }
}
