import { html, JDOM, JDOMComponent, CustomElement, state, computed } from 'jdomjs'
import {Note} from "./Note.ts";
import {guitarChordHighlightedHandler} from "../notes/guitarChordShapes.js";
import Fretboard from "./Fretboard.js";
import {playNote} from "../notes/note-tone.js";
import {getMajorChord, getMinorChord, parseChord, ParsedChord} from "../notes/chords.js";
import Piano from "./Piano.js";
import {getMajorScale, getMinorScale} from "../notes/scales.js";


@CustomElement('gh-chord')
export default class Chord extends Fretboard {
    rows = 4

    selectedChord = 'G'

    sound = state<'guitar-acoustic' | 'piano'>('guitar-acoustic')

    chord = state<ParsedChord|null>(null)

    chordShape = state('default')

    constructor() {
        super();
    }

    setup() {
        const chord = parseChord(this.selectedChord)

        const {handler, shift} = guitarChordHighlightedHandler(chord, { shape: this.chordShape.value })
        this.isHighlightedHandler = handler
        this.shift.value = shift

        switch (chord.type) {
            case 'MAJOR':
                this.highlighted.value = getMajorChord(chord.baseNote)
                break
            case 'MINOR':
                this.highlighted.value = getMinorChord(chord.baseNote)
                break
        }

        if (this.chordShape.value === 'D' || chord.type === 'DIMINISHED') {
            this.rows = 5
        } else {
            this.rows = 4
        }

        this.chord.value = chord
    }

    render(): Node | JDOM | string | undefined {
        return html`
            ${computed(() => this.sound.value === 'guitar-acoustic' ? html`
                <div class="mb-2 pt-5 pr-[80px]">
                    ${super.render()}
                </div>
            ` : computed(() => html`
                <div class="mb-2 pt-5">
                    <${Piano} length=${12} hideNotes=${this.hideNotes} allShownNotes=${this.allShownNotes} highlighted=${this.highlighted} />
                </div>
            `), [this.sound, this.chord])}
            
            <div class="flex justify-center gap-2">
                <div class="border rounded-md border-b-4 active:border-b-3 flex">
                    <select class="p-0.5 px-2 border-r" :bind=${this.sound}>
                        <option value="guitar-acoustic">Guitar</option>
                        <option value="piano">Piano</option>
                    </select>
                    <button class="p-0.5 px-2" @click=${() => {
                        let t = 0;
                        let skip = true;
                        ([...this.allShownNotes]).reverse().forEach(note => {
                            skip = !skip
                            if (skip) return;
                            setTimeout(() => {
                                playNote(this.sound.value, note.note, note.octave, 1)
                            }, t)
                            t += 10
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