import {getAfter, getAfterWithOctave, NOTES} from "./notes.js";

export const getFretboard = (tuning = ['E', 'A', 'D' ,'G', 'B', 'E'], length = 22, startingOctave = 2): any[][] => {
    const emptyArr = [...new Array(length)];

    return tuning.map((key, i) => {
        let stOct = ''
        let note = key
        for (const n of [...NOTES].reverse()) {
            if (key.startsWith(n)) {
                stOct = key.replace(n, '');
                note = key
                break;
            }
        }


        const oct = Number((stOct) || [2, 2, 3, 3, 3, 4][i] || startingOctave)
        note = note.replace(/[0-9]/g, "")

        return emptyArr.map((_, kI) => getAfterWithOctave(note, kI, oct))
    });
}