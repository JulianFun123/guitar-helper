import { html, state, watch } from "pulsjs";
import {globalMetronome, showGlobalMetronome, useMetronome} from "../composables/useMetronome.js";

export function Metronome({metronome = null, small = false}: {metronome?: any, small?: boolean} = {}) {
    const min = 20
    const max = 1000
    const {stopMetronome, startMetronome, bpm, isPlaying, addListener} = metronome || globalMetronome

    return html`
        <div @:detach=${() => metronome?.stopMetronome()} class="flex h-full w-full justify-center items-center">
            <div 
                class=${`flex flex-col items-center ring-neutral-400 gap-6 border rounded-xl w-[30rem] transition-all max-w-full ${small ? 'p-3' : 'px-10 py-7'}`}
                :ref=${{value: (el) => addListener('click', () => {
                    el.classList.add('ring-3')
                    el.classList.add('ring-offset-2')
                    setTimeout(() => {
                        el.classList.remove('ring-3')
                        el.classList.remove('ring-offset-2')
                    }, 100)
                })}}
            >
                <div class="flex w-full justify-between items-center">
                    <div class="flex items-end">
                        <input 
                            :bind=${bpm} type="number"
                            class="min-w-[1rem] text-lg" 
                            style="field-sizing: content"
                            ${{min, max}}
                        >
                        <span class="text-sm">BPM</span>
                    </div>
                    
                    <div class="flex gap-2 items-center">
                        <button :if=${isPlaying} @click=${stopMetronome} class="px-3 border rounded-md bg-black text-white dark:bg-white dark:text-black">Stop</button>
                        <button :else @click=${startMetronome} class="px-3 rounded-md border">Start</button>
                        
                        <button class="cursor-pointer" :if=${small} @click=${() => {
                            stopMetronome()
                            showGlobalMetronome.value = false
                        }}>✕</button>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full">
                    <input 
                            type="range"
                            ${{min, max}}
                            class="slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 select-all"
                            :bind=${bpm} 
                    />
                </div>
            </div>
        </div>
    `;
}
