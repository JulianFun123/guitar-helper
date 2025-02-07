import {computed, html, state, watch} from "jdomjs";
import {parseChord, ParsedChord} from "../notes/chords.js";
import Chord from "../components/Chord.js";

export default function ChordFinder() {
    const chordInput = state('Cm')
    const parsed = state<ParsedChord>(parseChord(chordInput.value))

    const error = state<Error|null>(null)

    const update = () => {
        try {
            parsed.value = parseChord(chordInput.value)
            if (error.value) error.value = null;
        } catch (e) {
            error.value = e
        }
    }

    watch([chordInput], () => {
        if (chordInput.value[0] && chordInput.value[0] === chordInput.value[0].toLowerCase()){
            chordInput.value = `${chordInput.value[0].toUpperCase()}${chordInput.value.substring(1)}`
        } else {
            update()
        }
    })
    update()

    return html`
        <div class="flex flex-col items-center justify-center gap-2 h-full">
            <input :bind=${chordInput} type="text" class="text-center text-3xl border rounded-xl p-3" placeholder="Chord">
            
            ${computed(() => error.value ? html`
                <span class="text-red-500">${error.value.message}</span>
            ` : html`<span>Note: ${parsed.value.baseNote}, ${parsed.value.type}</span>`, [parsed, error])}
            <${Chord}
                    selectedChord=${chordInput}
                    hideNotes
            />
            
        </div>
    `
}