import {computed, html, onUnmounted, state, watch} from "pulsjs";
import Fretboard from "../components/Fretboard.js";
import {tuning} from "../main.js";
import {useTuner} from "../composables/useTuner.js";

// Logic from https://github.com/pmoieni/celeste-tuner/blob/main/src/lib/Tuner.svelte
export function Tuner() {

    const {
        noteHistory,
        selectedNote,
        historyLength,
        isStarted,
        note,
        deviation,
        init,
        stop
    } = useTuner()

    const linePositions = () => {
        let out = []

        let s = 1

        let lastPos = [100, 50]
        for (const note of [...noteHistory.value].reverse()) {
            const pos = [
                100 - (100 / historyLength) * s++,
                50 - (note.deviation / 3)
            ]

            out.push(`<line x1="${pos[0]}%" y1="${pos[1]}%" x2="${lastPos[0]}%" y2="${lastPos[1]}%" stroke="black"  class="dark:stroke-white" />`)
            lastPos = pos
        }

        return out.join('');
    }

    onUnmounted(() => {
        stop()
    })

    return html`
        <div class="flex flex-col justify-center items-center h-full w-full">
            ${computed(() => isStarted.value ? html`
                <div class="relative overflow-hidden h-full w-full">
                    <div class="grid grid-cols-[1fr_200px_1fr] gap-[10rem] items-center h-full absolute left-[50%] top-[50%]" style="transform: translate(-50%, -50%)">
                        <div class="flex justify-end items-end w-[600px] pr-[50px]">
                            <div class="h-[200px] border w-full rounded">
                                ${computed(() => {
                                    const svg = document.createElement("div");
                                    svg.style.width = "100%";
                                    svg.style.height = "100%";
                                    
                                    svg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                                        <defs>
                                            <linearGradient id="redgr" gradientTransform="rotate(90)">
                                              <stop offset="0%" stop-color="#FF000011" />
                                              <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0" />
                                              <stop offset="100%" stop-color="#FF000011" />
                                            </linearGradient>
                                        </defs>
                                        <rect x="0" y="0" width="100%" height="100%" fill="url(#redgr)" />
                                        
                                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#555" class="dark:stroke-neutral-300" />
                                        ${linePositions()}
                                    </svg>
                                    `
                                    return html`${svg}`
                                })}
                            </div>
                        </div>
                        ${computed(() => html`
        
                            <div class="flex flex-col gap-1 items-center">
                                <span class="italic opacity-70">Current Note</span>
                                <div class="flex items-center gap-2">
                                    <div>
                                        <span class="text-5xl font-bold">${note.value.name}</span>
                                        <span class="text-3xl font-bold">${note.value.octave}</span>
                                    </div>
                                    ${computed(()=> selectedNote.value ? html`
                                        <span class="text-3xl font-bold opacity-70"> → </span>
                                        <div>
                                            <span class="text-5xl font-bold">${selectedNote.value.name}</span>
                                            <span class="text-3xl font-bold">${selectedNote.value.octave}</span>
                                        </div>
                                    ` : null)}
                                </div>
                                
                                ${deviation.value > 0 ? '+' : ''}${deviation.value}
                            </div>
        
                        `, [note])}
                        
                        <div class="w-[600px]">
                            ${computed(() => html`
                                <${Fretboard} 
                                    onNoteClick=${({note, octave}) => {
                                        selectedNote.value = selectedNote.value?.name === note && selectedNote.value?.octave === octave ? null : {name: note, octave}
                                        noteHistory.value = []
                                    }}
                                    baseNotes=${tuning.value.split(',').map(r => r.trim())}
                                    isHighlightedHandler=${(row, col, note, octave) => selectedNote.value?.name === note && selectedNote.value?.octave === octave && col === 0} 
                                    hideNotes
                                />
                            `, [selectedNote, tuning])}
                        </div>
                    </div>
                </div>
            ` : html`
                <div>
                    <button
                            class="p-3 px-[6rem] text-lg border border-neutral-300 bg-neutral-100 rounded-xl dark:bg-neutral-800"
                            @click=${() => init()}
                    >
                        Start
                    </button>
                </div>
            `, [isStarted])}
        </div>
    `
}