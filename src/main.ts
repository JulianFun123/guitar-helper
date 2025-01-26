import Fretboard from "./components/Fretboard.ts";
import {computed, html, state, watch} from 'jdomjs';
import Piano from "./components/Piano.ts";
import {NOTE_NAMES, NOTES} from "./notes/notes.ts";
import {getMajorChord, getMajorScaleChords, getMinorChord, getMinorScaleChords} from "./notes/chords.ts";
import {getMajorScale, getMinorScale} from "./notes/scales.ts";
import {guitarChordHighlightedHandler} from "./notes/guitarChordShapes.js";
import Chord from "./components/Chord.js";


const TYPES = ['MAJOR_SCALE', 'MINOR_SCALE', 'MAJOR_CHORD', 'MINOR_CHORD'] as const;

type TypeType = typeof TYPES[number];

const savedParams = new URLSearchParams(window.location.hash.substring(1))

const saveParams = () => {
    window.location.hash = `#${savedParams.toString()}`
}

const selectedNote = state(savedParams.get('note') || 'A')
const selectedType = state<TypeType>(savedParams.get('type') as TypeType || 'MAJOR_SCALE');
const hideNotes = state<boolean>(savedParams.has('hide-notes') ? savedParams.get('hide-notes') === 'true' : true);
const isColored = state<boolean>(savedParams.has('colored') ? savedParams.get('colored') === 'true' : false);

const expandedSettings = state<boolean>(false);

const highlightedNotes = state([])

const INSTRUMENTS = [
    ['GUITAR', 'Guitar', 'E,A,D,G,B,E'],
    ['GUITAR_DROP_D', 'Guitar Drop D', 'D,A,D,G,B,E'],
    ['GUITAR_DROP_D', 'Guitar Drop C', 'C,G,C,F,A,D'],
    ['GUITAR_OPEN_D', 'Guitar Open D', 'D,A,D,F#,A,D'],
    ['GUITAR_OPEN_G', 'Guitar Open G', 'D,G,D,G,B,D'],
    ['BASS', 'Bass', 'E,A,D,G'],
    ['BASS_5_STRING', 'Bass 5-string', 'B,E,A,D,G'],
    ['UKULELE', 'Ukulele', 'G,C,E,A'],
    ['VIOLIN', 'Violin', 'G,D,A,E'],
    ['VIOLA', 'Viola', 'C,G,D,A'],
    ['BANJO_4_STRING', 'Banjo 4-string', 'C,G,D,A'],
    ['BANJO_5_STRING', 'Banjo 5-string', 'G,D,G,B,D'],
]

const tuning = state(savedParams.get('tuning') || INSTRUMENTS[0][2])


const setHighlights = () => {
    switch (selectedType.value) {
        case 'MAJOR_SCALE':
            highlightedNotes.value = getMajorScale(selectedNote.value)
            break
        case 'MINOR_SCALE':
            highlightedNotes.value = getMinorScale(selectedNote.value)
            break
        case 'MAJOR_CHORD':
            highlightedNotes.value = getMajorChord(selectedNote.value)
            break
        case 'MINOR_CHORD':
            highlightedNotes.value = getMinorChord(selectedNote.value)
            break
    }
}

watch([selectedType, selectedNote, hideNotes], () => {
    savedParams.set('note', selectedNote.value);
    savedParams.set('type', selectedType.value);
    saveParams();
    setHighlights()
})
watch([isColored, hideNotes, tuning], () => {
    savedParams.set('colored', isColored.value ? 'true' : 'false');
    savedParams.set('hide-notes', hideNotes.value ? 'true' : 'false');
    savedParams.set('tuning', tuning.value);
    saveParams();
})

setHighlights()

html`
    <div class="flex flex-col items-center gap-5 mb-5">
        <h1 class="text-xl mt-5">Guitar Helper</h1>
        
        <${Piano} highlighted=${highlightedNotes} hideNotes=${hideNotes} isColored=${isColored} />
        
        ${computed(() => html`
            <${Fretboard} baseNotes=${tuning.value.split(',').map(r => r.trim())} highlighted=${highlightedNotes} hideNotes=${hideNotes} isColored=${isColored} />
        `, [tuning])}
    </div>

    <div class="flex flex-col gap-3 justify-center mb-8">
        <div class="flex gap-5 justify-center">
            <div class="flex gap-2 items-center">
                <label for="note">Note:</label>
                <select id="note" class="border rounded-md p-1" :bind=${selectedNote}>
                    ${NOTES.map(n => html`<option value=${n}>${NOTE_NAMES[n]}</option>`)}
                </select>
            </div>
            <div class="flex gap-2 items-center">
                <label for="type">Type:</label>
                <select id="type" id="type-select" class="border rounded-md p-1" :bind=${selectedType}>
                    ${[
                        ['MAJOR_SCALE', 'Major Scale'],
                        ['MINOR_SCALE', 'Minor Scale'],
                        ['MAJOR_CHORD', 'Major Chord'],
                        ['MINOR_CHORD', 'Minor Chord'],
                    ].map(([type, value]) => html`<option value=${type}>${value}</option>`)}
                </select>
            </div>
        </div>
        <div class="flex gap-5 justify-center">
            <div class="flex gap-2 items-center">
                <label for="colored">Colored:</label>
                <input
                    id="colored"
                    @:attached=${e => e.target.checked = isColored.value} 
                    @change=${e => {
                        isColored.value = e.target.checked
                    }} 
                    type="checkbox"
                >
            </div>
            <div class="flex gap-2 items-center">
                <label for="show-notes">Show all notes:</label>
                <input 
                    id="show-notes"
                    @:attached=${e => e.target.checked = !hideNotes.value} 
                    @change=${e => hideNotes.value = !e.target.checked}
                    type="checkbox"
                >
            </div>
            <div class="flex gap-2 items-center">
                <label for="more-settings">More settings:</label>
                <input 
                    id="more-settings"
                    @change=${e => expandedSettings.value = e.target.checked}
                    type="checkbox"
                >
            </div>
        </div>
        <div class="flex justify-center gap-3" :if=${expandedSettings}>

            <div class="flex gap-2 items-center">
                <label for="type">Instrument:</label>
                <select id="type" class="border rounded-md p-1" :bind=${tuning}>
                    ${INSTRUMENTS.map(([type, value, tuning]) => html`<option value=${tuning}>${value}</option>`)}
                    <option value=${tuning}>Custom</option>
                </select>
            </div>
            <div class="flex gap-2 items-center">
                <label for="tuning">Tuning:</label>
                <input id="tuning" class="border rounded-md p-1" :bind=${tuning}>
            </div>
        </div>
    </div>



    ${computed(() => selectedType.value.includes('CHORD') ? html`
        <div class="flex gap-5 justify-center mb-3">
            <${Chord} selectedChord=${`${selectedNote.value}${selectedType.value === 'MINOR_CHORD' ? 'm' : ''}`} hideNotes=${hideNotes} isColored=${isColored} />
        </div>
    ` : null, [selectedNote, selectedType])}
    
    ${computed(() => selectedType.value.includes('SCALE') ? html`
        <div class="flex flex-col justify-center gap-2">
            <span class="text-center opacity-60">Compatible Chords:</span>
            <div class="flex gap-3 justify-center">
                ${(selectedType.value === 'MAJOR_SCALE' ? getMajorScaleChords : getMinorScaleChords)(selectedNote.value).map(c => html`
                    <div class="bg-neutral-100 px-1 rounded-md group relative">
                        <span class="relative  z-100">${c}</span>
                        
                        <div class="hidden z-10 group-hover:block absolute left-0 top-0 p-4 pt-8" style="transform: translateX(-50%)">
                            <div class="bg-white border rounded-xl p-3">
                                <${Chord} selectedChord=${c} hideNotes=${hideNotes} isColored=${isColored} />
                            </div>
                        </div>    
                    </div>
                `)}
            </div>
        </div>
    ` : null)}

`.appendTo(document.body)