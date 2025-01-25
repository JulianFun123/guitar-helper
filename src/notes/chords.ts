import {getAfter} from "./notes.ts";

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
