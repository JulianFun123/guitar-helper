import {html, PulsComponent, CustomElement, state, computed, watch} from "pulsjs"
import {Note} from "./Note.ts";
import {generateChordShape, guitarChordHighlightedHandler} from "../notes/guitarChordShapes.js";
import Fretboard from "./Fretboard.js";
import {playNote} from "../notes/note-tone.js";
import {getChord, parseChord, ParsedChord} from "../notes/chords.js";
import Piano from "./Piano.js";
import Notation, {NotationNote} from "./Notation.js";


@CustomElement('gh-chord')
export default class Chord extends Fretboard {
    rows = 4

    selectedChord = state('G')

    sound = state<'guitar-acoustic' | 'piano' | 'notation'>('guitar-acoustic')

    chord = state<ParsedChord|null>(null)

    chordShape = state('default')

    constructor() {
        super();
    }

    update() {
        const chord = parseChord(this.selectedChord.value)

        const {handler, shift} = guitarChordHighlightedHandler(chord, { shape: this.chordShape.value })
        this.isHighlightedHandler = handler
        this.shift.value = shift
        // this.isHighlightedHandler = generateChordShape(chord.fullName)

        this.highlighted.value = getChord(this.selectedChord.value, 2)

        if (this.chordShape.value === 'D' || chord.type === 'DIMINISHED') {
            this.rows = 5
        } else {
            this.rows = 4
        }

        this.chord.value = chord
    }

    setup() {
        super.setup()
        this.update()
        watch([this.selectedChord], () => this.update())
    }

    render()  {
        return html`
            ${computed(() => this.sound.value === 'guitar-acoustic' ?
                    html`
                    <div class="mb-2 pt-5 pr-[80px]">
                        ${super.render()}
                    </div>
                ` 
                : this.sound.value === 'piano' ? computed(() => html`
                    <div class="mb-2 pt-5">
                        <${Piano} length=${12 * 2} hideNotes=${this.hideNotes} allShownNotes=${this.allShownNotes} highlighted=${this.highlighted.value.map((n) => typeof n === 'string' ? n : [n[0], n[1]])} />
                    </div>`) 
                : html`
                    <${Notation} width=${300} height=${230} notes=${[
                            {
                                speed: [4, 4],
                                bpm: 80,
                                notes: [{
                                    type: 'note',
                                    notes: [...this.highlighted.value].sort((a, b) => a > b ? 1 :-1).map((n) => ({
                                        note: n,
                                        octave: 4
                                    } as NotationNote)),
                                    length: 1 / 2
                                }]
                            }
                        ]} />
                `, [this.sound, this.chord])}
            
            <div class="flex justify-center gap-2">
                <div class="border rounded-md border-b-4 active:border-b-3 flex">
                    <select class="p-0.5 px-2 border-r" :bind=${this.sound}>
                        <option value="guitar-acoustic">Guitar</option>
                        <option value="piano">Piano</option>
                        <option value="notation">Notation</option>
                    </select>
                    <button class="p-0.5 px-2" @click=${() => {
                        let t = 0;
                        let skip = true;
                        ([...this.allShownNotes]).forEach(note => {
                            skip = !skip
                            if (skip) return;
                            setTimeout(() => {
                                playNote(this.sound.value === 'notation' ? 'piano' : this.sound.value, note.note, note.octave, 1)
                            }, t)
                            t += 20
                        })
                    }}>Play</button>
                </div>
                
                ${computed(() => this.sound.value === 'guitar-acoustic' ? html`
                    <select class="p-0.5 border px-2 rounded-md border-b-4 active:border-b-3" :bind=${this.chordShape} @change=${() => this.setup()}>
                        <option value="default">Default</option>
                        ${
                            (this.chord.value.type === 'DIMINISHED' ? ['A#'] : ['E', 'A', 'D']).map(note => html`<option value=${note}>${note}-Shape</option>`)
                        }
                    </select>
                ` : null)}
            </div>
        `;
    }
}