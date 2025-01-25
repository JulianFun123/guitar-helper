import { html, JDOM, JDOMComponent, CustomElement, state, computed } from 'jdomjs'
import {getAfter, getAfterOctave} from "../notes/notes.ts";
import {Note} from "./Note.ts";


@CustomElement()
export default class Fretboard extends JDOMComponent {

    rows = 16
    baseNotes = ['E', 'A', 'D', 'G', 'B', 'E']

    highlighted = state<string[]>([])
    hideNotes = state<boolean>(false)
    isColored = state<boolean>(false)

    fretboardNote(note: string, octave = 2) {
        return computed(() => html`
            <div class="relative flex items-center justify-center border-r-1 border-transparent" style="height: 34px; width: 80px">
                ${Note(note, {
                    isHighlighted: this.highlighted.value.includes(note),
                    isColored: this.isColored.value,
                    hide: this.hideNotes.value,
                    octave
                })}
            </div>
        `)
    }

    fretboardRow(note: string, row: number) {
        return html`
        <div class="flex">
            ${[...new Array(this.rows)].map((_, i) => this.fretboardNote(getAfter(note, i), getAfterOctave(note, i, [2,2,3,3,3,4][row])))}
        </div>
    `
    }

    spawnDot(row: number, col: number) {
        while (col > 12) col -= 12

        if (
            ([3, 5, 7, 9].includes(col) && row === 2) ||
            ([12].includes(col) && (row === 1 || row === 3))
        ) {
            return html`<div class="w-[20px] h-[20px] bg-black rounded-full" />`
        }

        return null
    }

    render(): Node | JDOM | string | undefined {
        return html`
            <div class="relative w-fit">
                ${[...this.baseNotes].reverse().map((k, i) => this.fretboardRow(k, 5-i))}
                
                <div class="absolute left-[-2px] top-0 w-full h-full flex items-center justify-center">
                    <div>
                        ${[...new Array(this.baseNotes.length - 1)].map((n, rI) => html`
                            <div class="flex">
                                ${[...new Array(this.rows)].map((_, i) => html`
                                    <div class=${
                                        `flex items-center justify-center ${i === 0 ? '' : rI === 0 ? 'border-r border-b border-t' : 'border-r border-b'}`
                                    } style="height: 34px; width: 80px">
                                        ${this.spawnDot(rI, i)}
                                    </div>
                                    ${i === 0 ? html`<div class="h-[34px] w-[6px] bg-black" />` : ''}
                                `)}
                            </div>
                        `)}
                    </div>
                </div>
            </div>
        `
    }
}