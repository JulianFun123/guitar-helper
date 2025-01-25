import { html } from "jdomjs";
import {NOTE_COLORS} from "../notes/notes.ts";

export function Note(note: string, {isHighlighted = false, isColored = false, size = 30, octave = 2, hide = false} = {}) {
    const col = NOTE_COLORS[note]
    return html`
        <div 
            class=${`absolute z-10 border flex items-center justify-center border-black rounded-full ${
                isHighlighted ? isColored ? `bg-${col[0]} text-${col[1]}` : 'bg-gray-600 text-white' : 'bg-white'
            }`} 
            style=${{
                width: `${size}px`,
                height: `${size}px`,
                opacity: hide && !isHighlighted ? 0 : 1,
            }}
        >
            <span class="font-600 block" style=${{fontSize: `${size / 1.8}px`}}>
                ${note}
            </span>
        </div>
    
    `
}