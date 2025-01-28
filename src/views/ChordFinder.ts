import {computed, html, state, watch} from "jdomjs";
import {parseChord, ParsedChord} from "../notes/chords.js";
import Chord from "../components/Chord.js";

export default function ChordFinder() {
    const chordInput = state('Cm')
    const parsed = state<ParsedChord>(parseChord(chordInput.value))


    const update = () => {
        parsed.value = parseChord(chordInput.value)
    }

    watch([chordInput], () => update())
    update()

    return html`
        <div class="flex flex-col items-center justify-center gap-2 h-full">
            <input :bind=${chordInput} type="text" class="text-center text-3xl border rounded-xl p-3" placeholder="Chord">
            ${computed(() => html`
                <span>Note: ${parsed.value.baseNote}, ${parsed.value.type}</span>
            `, [parsed])}
            <${Chord}
                    selectedChord=${chordInput}
                    hideNotes
            />
            
        </div>
    `
}