import { html } from "pulsjs";
import {getAfter, NOTE_COLORS} from "../notes/notes.ts";
import {playNote} from "../notes/note-tone.js";

export function Note(note: string, {isHighlighted = false, isColored = false, size = 30, octave = 2, hide = false, sound='guitar-acoustic', specific = {}, onClick = ({note, octave}, specific) => null, hideName = false} = {}) {
    const col = NOTE_COLORS[note]

    let noteText = note

    return html`
        <button 
            class=${`absolute z-10 border flex items-center justify-center border-black rounded-full dark:bg-neutral-800 text-black ${
                isHighlighted ? isColored ? `${col[0]} ${col[1]}` : 'bg-gray-600 dark:bg-white dark:text-black text-white' : 'dark:text-white bg-white'
            }`} 
            style=${{
                width: `${size}px`,
                height: `${size}px`,
                opacity: hide && !isHighlighted ? 0 : 1
            }}
            @click.cancel=${() => {
                onClick({note, octave}, specific)
                playNote(sound, note, octave, 3)
            }}
            title=${`Note ${note}, Octave: ${octave}`}
        >
            <span class="font-600 block select-none" style=${{fontSize: `${size / 1.8}px`}}>
                ${hideName ? null : noteText}
            </span>
        </button>
    
    `
}