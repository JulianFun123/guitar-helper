import Fretboard from "./components/Fretboard.ts";
import { html, state, watch } from 'jdomjs';
import Piano from "./components/Piano.ts";
import {NOTES} from "./notes/notes.ts";
import {getMajorChord} from "./notes/chords.ts";
import {getMajorScale, getMinorScale} from "./notes/scales.ts";

const TYPES = ['MAJOR_SCALE', 'MINOR_SCALE', 'MAJOR_CHORD', 'MINOR_CHORD'] as const;

type TypeType = typeof TYPES[number];

const selectedNote = state('A')
const selectedType = state<TypeType>('MAJOR_SCALE');
const hideNotes = state<boolean>(true);
const isColored = state<boolean>(false);

const highlightedNotes = state([])


const setHighlights = () => {
    switch (selectedType.value) {
        case 'MAJOR_SCALE':
            highlightedNotes.value = getMajorScale(selectedNote.value)
            console.log(getMajorScale(selectedNote.value))
            break
        case 'MINOR_SCALE':
            highlightedNotes.value = getMinorScale(selectedNote.value)
            break
        case 'MAJOR_CHORD':
            highlightedNotes.value = getMajorChord(selectedNote.value)
            break
        case 'MINOR_CHORD':
            highlightedNotes.value = getMinorScale(selectedNote.value)
            break
    }
}

watch([selectedType, selectedNote, hideNotes], setHighlights)

setHighlights()

html`
    <div class="flex flex-col items-center gap-5 mb-5">
        <h1 class="text-xl mt-5">Guitar Helper</h1>
        
        <${Piano} highlighted=${highlightedNotes} hideNotes=${hideNotes} isColored=${isColored} />
        <${Fretboard} highlighted=${highlightedNotes} hideNotes=${hideNotes} isColored=${isColored} />
    </div>

    <div class="flex gap-5 justify-center mb-3">
        <div class="flex gap-2 items-center">
            <span>Note:</span>
            <select class="border rounded-md" :bind=${selectedNote}>
                ${NOTES.map(n => html`<option value=${n}>${n}</option>`)}
            </select>
        </div>
        <div class="flex gap-2 items-center">
            <span>Type:</span>
            <select id="type-select" class="border rounded-md" :bind=${selectedType}>
                ${[
                    ['MAJOR_SCALE', 'Major Scale'],
                    ['MINOR_SCALE', 'Minor Scale'],
                    ['MAJOR_CHORD', 'Major Chord'],
                    ['MINOR_CHORD', 'Minor Chord'],
                ].map(([type, value]) => html`<option value=${type}>${value}</option>`)}
            </select>
        </div>
        <div class="flex gap-2 items-center">
            <span>Colored:</span>
            <input @change=${e => isColored.value = e.target.checked} type="checkbox">
        </div>
        <div class="flex gap-2 items-center">
            <span>Show all notes:</span>
            <input @change=${e => hideNotes.value = !e.target.checked} id="show-all-notes-checkbox" type="checkbox">
        </div>
    </div>
`.appendTo(document.body)