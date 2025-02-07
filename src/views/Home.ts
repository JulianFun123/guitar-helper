import {computed, html, state, watch} from "jdomjs";
import {getMajorScale, getMinorScale, getScale} from "../notes/scales.js";
import {
    buildChord,
    ChordType, getChord,
    getMajorChord,
    getMajorScaleChords,
    getMinorChord,
    getMinorScaleChords
} from "../notes/chords.js";
import Piano from "../components/Piano.js";
import Fretboard from "../components/Fretboard.js";
import {NOTE_NAMES, NOTES, NotesType} from "../notes/notes.js";
import Chord from "../components/Chord.js";
import {INSTRUMENTS, savedParams, saveParams, tuning} from "../main.js";
import Notation from "../components/Notation.js";

export function Home() {
    const TYPES = ['MAJOR_SCALE', 'MINOR_SCALE', 'MAJOR_CHORD', 'MINOR_CHORD'] as const;

    type TypeType = typeof TYPES[number];

    const selectedNote = state(savedParams.get('note') || 'C')
    const selectedType = state<ChordType>(savedParams.get('type') as ChordType || 'MAJOR')
    const selectedOutput = state(savedParams.get('output') || 'SCALE')

    const hideNotes = state<boolean>(savedParams.has('hide-notes') ? savedParams.get('hide-notes') === 'true' : true);
    const isColored = state<boolean>(savedParams.has('colored') ? savedParams.get('colored') === 'true' : false);

    const expandedSettings = state<boolean>(false);

    const highlightedNotes = state([])


    const setHighlights = () => {
        const chord = buildChord({
            baseNote: selectedNote.value,
            type: selectedType.value,
        })

        console.log(chord)
        switch (selectedOutput.value) {
            case 'SCALE':
                highlightedNotes.value = getScale(chord).map(n => n[0])
                break;
            case 'CHORD':
                highlightedNotes.value = getChord(chord).map(n => n[0])
                break;
        }
    }

    watch([selectedType, selectedNote, hideNotes, selectedOutput], () => {
        savedParams.set('note', selectedNote.value);
        savedParams.set('type', selectedType.value);
        savedParams.set('output', selectedOutput.value);
        saveParams();
        setHighlights()
    })
    watch([isColored, hideNotes], () => {
        savedParams.set('colored', isColored.value ? 'true' : 'false');
        savedParams.set('hide-notes', hideNotes.value ? 'true' : 'false');
        saveParams();
    })

    setHighlights()

    const notationRef = state(null)

    return html`
    <div class="flex flex-col items-center gap-5 mb-5">
        <h1 class="text-xl mt-5">Guitar Helper</h1>
        
        <div class="overflow-auto max-w-full px-2">
            <${Piano} highlighted=${highlightedNotes} hideNotes=${hideNotes} isColored=${isColored} />
        </div>
        
        <div class="overflow-auto max-w-full px-2">
            ${computed(() => html`
                <${Fretboard} 
                    baseNotes=${tuning.value.split(',').map(r => r.trim())} 
                    highlighted=${highlightedNotes} 
                    hideNotes=${hideNotes} 
                    isColored=${isColored} />
            `, [tuning])}
        </div>
    </div>

    <div class="flex flex-col gap-3 justify-center mb-8">
        <div class="flex gap-5 justify-center">
            <div class="flex gap-2 items-center">

                <div class="border rounded-md">
                    <select id="note" class="border-r p-1 rounded-l-md" :bind=${selectedNote}>
                        ${NOTES.map(n => html`<option value=${n}>${NOTE_NAMES[n]}</option>`)}
                    </select>
                    
                    <select id="type" id="type-select" class="border-r p-1" :bind=${selectedType}>
                        ${[
                            ['MAJOR', 'Major'],
                            ['MINOR', 'Minor'],
                            ['DIMINISHED', 'Diminished'],
                        ].map(([type, value]) => html`<option value=${type}>${value}</option>`)}
                    </select>
                    <select id="type" id="type-select" class="p-1 rounded-r-md" :bind=${selectedOutput}>
                        ${[
                            ['SCALE', 'Scale'],
                            ['CHORD', 'Chord'],
                        ].map(([type, value]) => html`<option value=${type}>${value}</option>`)}
                    </select>
                </div>
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
            <div class="flex gap-2 items-center" :if=${false}>
                <label for="more-settings">More settings:</label>
                <input 
                    id="more-settings"
                    @change=${e => expandedSettings.value = e.target.checked}
                    type="checkbox"
                >
            </div>
        </div>
        <div class="flex justify-center gap-3" :if=${expandedSettings}>

        </div>
    </div>



    ${computed(() => selectedOutput.value === 'CHORD' ? html`
        <div class="flex gap-5 justify-center mb-3">
            <${Chord} selectedChord=${`${selectedNote.value}${selectedType.value === 'MINOR' ? 'm' : ''}`} hideNotes=${hideNotes} isColored=${isColored} />
        </div>
    ` : null, [selectedNote, selectedType, selectedOutput])}
    
    ${computed(() => selectedOutput.value === 'SCALE' ? html`
        <div class="flex flex-col justify-center gap-2">
            <span class="text-center opacity-60">Compatible Chords:</span>
            <div class="flex gap-2 justify-center">
                ${(selectedType.value === 'MINOR' ? getMajorScaleChords : getMinorScaleChords)(selectedNote.value as NotesType).map(([c]) => html`
                    <div class="bg-neutral-100 dark:bg-neutral-800 px-1.5 rounded-md group relative">
                        <span class="relative  z-100">${c}</span>
                        
                        <div class="hidden z-10 group-hover:block absolute left-0 top-0 p-4 pt-8" style="transform: translateX(-50%)">
                            <div class="bg-white dark:bg-black border rounded-xl p-3">
                                <${Chord} selectedChord=${c} hideNotes=${hideNotes} isColored=${isColored} />
                            </div>
                        </div>    
                    </div>
                `)}
            </div>
        </div>
        
        <div class="flex flex-col justify-center gap-2 items-center mt-5">
            <${Notation} height="200" 
                 lineHeight=${15} 
                 tactWidth=${100}
                 :ref=${notationRef}
                 notes=${[
                    {
                        scale: `${selectedNote.value}${{
                            MAJOR: '',
                            MINOR: 'm',
                            DIMINISHED: 'dim',
                        }[selectedType.value]}`,
                        speed: [4, 4],
                        bpm: 60,
                        notes: getScale(selectedNote.value as NotesType, 4)?.map(([n, oct]) => ({
                            type: 'note',
                            notes: [{
                                note: n,
                                octave: oct,
                            }],
                            length: 1 / 2
                        }))
                    }
            ]} />
            <button class="px-3 rounded-md border" @click=${() => {
                notationRef.value.play()
            }}>Play</button>
        </div>
    ` : null, [selectedType, selectedNote, selectedOutput])}

    `
}