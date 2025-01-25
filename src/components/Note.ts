import { html } from "jdomjs";
import {NOTE_COLORS} from "../notes/notes.ts";
import * as Tone from "tone";
import {SampleLibrary} from "../Tonejs-Instruments.js";
import {playNote} from "../notes/note-tone.js";

export function Note(note: string, {isHighlighted = false, isColored = false, size = 30, octave = 2, hide = false, sound='guitar-acoustic'} = {}) {
    const col = NOTE_COLORS[note]
    return html`
        <button 
            class=${`absolute z-10 border flex items-center justify-center border-black rounded-full ${
                isHighlighted ? isColored ? `${col[0]} ${col[1]}` : 'bg-gray-600 text-white' : 'bg-white'
            }`} 
            style=${{
                width: `${size}px`,
                height: `${size}px`,
                opacity: hide && !isHighlighted ? 0 : 1
            }}
            @click.cancel=${() => {
                playNote(sound, note, octave)
            }}
        >
            <span class="font-600 block" style=${{fontSize: `${size / 1.8}px`}}>
                ${note}
            </span>
        </button>
    
    `
}