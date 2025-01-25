import { html, JDOM, JDOMComponent, CustomElement, state, computed } from 'jdomjs'
import {getAfter, getAfterOctave, NotesType} from "../notes/notes.ts";
import {Note} from "./Note.ts";
import {playNote} from "../notes/note-tone.js";


@CustomElement()
export default class Piano extends JDOMComponent {

    length = 12 * 3

    startingNote = state('C')

    highlighted = state<string[]>([])
    hideNotes = state<boolean>(false)
    isColored = state<boolean>(false)

    isHighlightedHandler = null

    allShownNotes: {note: NotesType, octave: number}[] = []


    renderKeys() {
        const a = []

        let keyRight = 0
        let lastOctave = 2
        for (let i = 0; i < this.length; i++) {
            const currentNote = getAfter(this.startingNote.value, i)

            const octave = getAfterOctave(this.startingNote.value, i, 1)

            const isHighlighted = this.isHighlightedHandler ? this.isHighlightedHandler() :  this.highlighted.value.includes(currentNote)

            if (isHighlighted) {
                this.allShownNotes.push({note: currentNote, octave})
            }

            if (octave !== lastOctave) {
                a.push(html`
                    <div class="w-[4px]" />
                `)
                keyRight += 4
            }
            if (currentNote.includes('#')) {
                a.push(html`
                    <div 
                        class="bg-black h-[140px] w-[36px] absolute flex justify-center items-end pb-1 border-b-3 border-b-gray-500" 
                        style=${{
                           left: keyRight - 20 + 2 + 'px',
                           borderRadius: '0px 0px 6px 6px'
                        }}
                        @click=${() => playNote('piano', currentNote, octave, 0.3)}
                    >
                        ${Note(currentNote, {
                            size: 28,
                            hide: this.hideNotes.value,
                            isColored: this.isColored.value,
                            isHighlighted,
                            octave,
                            sound: 'piano'
                        })}
                    </div>
                `)
            } else {
                a.push(html`
                    <div 
                        class="border h-[200px] w-[40px] flex items-end justify-center pb-1 border-b-3" 
                        style=${{
                            borderRadius: i === 0 ? '10px 0px 0px 10px' : i === this.length-1 ? '0px 10px 10px 0px' : '',
                        }}
                         @click=${() => playNote('piano', currentNote, octave, 0.3)}
                    >
                        ${Note(currentNote, {
                            hide: this.hideNotes.value,
                            isColored: this.isColored.value,
                            octave, 
                            isHighlighted,
                            sound: 'piano'
                        })}
                    </div>
                `)
            }

            if (!currentNote.includes('#')) {
                keyRight += 40
            }
            lastOctave = octave
        }
        return a
    }

    render(): Node | JDOM | string | undefined {
        return html`
            ${computed(() => html`
                <div class="relative w-fit">
                    <div class="flex">
                        ${this.renderKeys()}
                    </div>
                </div>
         `)}
            `
    }
}