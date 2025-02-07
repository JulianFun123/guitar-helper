import {html, JDOM, JDOMComponent, CustomElement, state, computed, watch} from 'jdomjs'
import {getAfter, getAfterOctave, getAfterWithOctave, NotesType} from "../notes/notes.ts";
import {Note} from "./Note.ts";
import {getFretboard} from "../notes/fretboardHelper.js";


@CustomElement('gh-fretboard')
export default class Fretboard extends JDOMComponent {

    rows = 16
    baseNotes = ['E', 'A', 'D', 'G', 'B', 'E']

    highlighted = state<string[]|[NotesType, number][]>([])
    hideNotes = state<boolean>(false)
    isColored = state<boolean>(false)

    shift = state(0)

    isHighlightedHandler = null

    allShownNotes: {note: NotesType, octave: number, row: number, col: number}[] = []


    onNoteClick: (() => void)|undefined = undefined

    constructor() {
        super();
    }

    setup(){
        watch([this.highlighted], () => {
            this.allShownNotes = []
        })
    }

    colHeight = 34
    colWidth = 80

    fretboardNote(note: NotesType, octave = 2, row: number, col: number) {
        return computed(() => {
            const isHighlighted = this.isHighlightedHandler
                ? this.isHighlightedHandler(row, col, note, octave)
                : (!!this.highlighted.value.filter(n => typeof n === 'string' ? n ===  note : n[0] === note && n[1] === octave).length)

            if (isHighlighted) {
                this.allShownNotes.push({note, octave, row, col})
            }


            return html`
                <div 
                    class="relative flex items-center justify-center border-r-1 border-transparent"
                    style=${{height: `${this.colHeight}px`, width: `${this.colWidth}px`}}
                >
                    ${Note(note, {
                        isHighlighted,
                        isColored: this.isColored.value,
                        hide: col === 0 ? false : this.hideNotes.value,
                        octave,
                        specific: {col, row},
                        onClick: this.onNoteClick
                    })}
                </div>
            `
        })
    }

    fretboardRow(notes: string[], row: number) {
        return html`
            <div class="flex">
                ${notes.map(([note, octstr], i) => {
                    let oct = Number(octstr)
                    
                    if (i !== 0) {
                        i += this.shift.value ? this.shift.value : 0;
                        [note, oct] = getAfterWithOctave(note, this.shift.value, oct)
                    }
                    
                    return this.fretboardNote(note as NotesType, oct, row, i)
                })}
            </div>
        `
    }

    spawnDot(row: number, col: number) {
        col += this.shift.value
        if (col === 0) return null;
        while (col > 12) col -= 12

        const middleLine = Math.floor(this.baseNotes.length / 2)-1

        if (
            ([3, 5, 7, 9].includes(col) && row === middleLine) ||
            ([12].includes(col) && (row === middleLine-1 || row === middleLine+ 1 ))
        ) {
            return html`<div class="w-[20px] h-[20px] bg-black dark:bg-neutral-300 rounded-full" />`
        }

        return null
    }

    render(): Node | JDOM | string | undefined {
        this.allShownNotes = []
        return html`
            <div class="relative w-fit">
                ${getFretboard(this.baseNotes, this.rows).reverse().map((k, i) => this.fretboardRow(k, 5-i))}
                
                <div class="absolute left-[-2px] top-0 w-full h-full flex items-center justify-center">
                    <div>
                        ${[...new Array(this.baseNotes.length - 1)].map((n, rI) => html`
                            <div class="flex">
                                ${[...new Array(this.rows)].map((_, i) => html`
                                    <div class=${
                                        `flex items-center justify-center ${i === 0 ? '' : rI === 0 ? 'border-r border-b border-t' : 'border-r border-b'}`
                                    } style=${{height: `${this.colHeight}px`, width: `${this.colWidth}px`}}>
                                        ${i ? this.spawnDot(rI, i) : null}
                                    </div>
                                    ${i === 0 ? html`<div style=${{height: `${this.colHeight}px`}} class="w-[6px] bg-black dark:bg-white" />` : ''}
                                `)}
                            </div>
                        `)}
                    </div>
                </div>
                
                <span class="absolute top-[-24px] left-[119px] opacity-60" style="transform: translateX(-50%)" :if=${computed(() => this.shift.value > 0)}>
                    ${computed(() => this.shift.value - 1)}fr
                </span>
            </div>
        `
    }
}