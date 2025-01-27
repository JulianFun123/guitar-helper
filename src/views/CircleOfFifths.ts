import {html} from "jdomjs";
import {Note} from "../components/Note.js";
import Chord from "../components/Chord.js";
import Notation from "../components/Notation.js";
import {getMajorScale, getMinorScale} from "../notes/scales.js";

export function CircleOfFifths() {
    const notes = [
        ['C', '♮', 'A'],
        ['F', '1♭', 'D'],
        ['Bb', '2♭', 'G'],
        ['Eb', '3♭', 'C'],
        ['Ab', '4♭', 'F'],
        ['Db', '5♭', 'Bb'],
        ['F#', '6♯', 'D#'],
        ['B', '5♯', 'G#'],
        ['E', '4♯', 'C#'],
        ['A', '3♯', 'F#'],
        ['D', '2♯', 'B'],
        ['G', '1♯', 'E'],
    ]

    const calcRotation = (i: number) => -90 + (notes.length - i) * (360 / notes.length)

    return html`
        <div class="flex justify-center items-center h-full w-full">
            <div class="w-[400px] h-[400px] border border-[2rem] border-neutral-200 dark:border-neutral-800 rounded-full relative">
                <span class="absolute left-[50%] top-[-7rem] italic opacity-60" style="transform: translateX(-50%)">Major</span>
                <span class="absolute left-[50%] top-[4rem] italic opacity-60" style="transform: translateX(-50%)">Minor</span>
                
                ${notes.map((note, i) => html`
                    <div 
                    class="absolute z-0 left-[50%] top-[50%] h-[4rem] gap-2 flex items-center justify-end" 
                    style=${{
                    width: 'calc(50% + 10.5rem)',
                    transformOrigin: 'left',
                    transform: `translateY(-50%) rotate(${calcRotation(i)}deg)`,
                        zIndex: 1
                }}
                >
                    <div class="w-[2rem]">
                        <div class="group relative z-1 w-[30px] h-[30px]" style=${{rotate: `${0-calcRotation(i)}deg`}}>
                            <${Note(note[2])} />
                        </div>
                    </div>
                    <div class="w-[2rem]">
                        <div class="w-[30px] h-[30px] flex items-center justify-center" style=${{rotate: `${0-calcRotation(i)}deg`}}>
                            <span>${note[1]}</span>
                        </div>
                    </div>
                    <div class="w-[2rem]">
                        <div class="group relative z-1 w-[30px] h-[30px]" style=${{rotate: `${0-calcRotation(i)}deg`}}>
                            <${Note(note[0])} />
                        </div>
                    </div>
                        <div class="w-[5.5rem]">
                            <div :if=${note[0] !== 'C'} class="flex items-center justify-center" style=${{rotate: `${0-calcRotation(i)}deg`}}>
                                <${Notation} width=${80} hideBpm hideSpeed notes=${[
                                    {
                                        scale: note[0],
                                        speed: [4, 4],
                                        bpm: 80,
                                        notes: []
                                    }
                                ]} tactWidth=30 lineHeight=${10} />
                            </div>
                        </div>
                </div>
                `)}
            </div>
        </div>
    `
}