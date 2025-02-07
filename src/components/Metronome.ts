import { html, state, watch } from "jdomjs";
import {useMetronome} from "../composables/useMetronome.js";

export function Metronome() {

    const {stopMetronome, startMetronome, bpm, isPlaying} = useMetronome()

    return html`
        <div @:detach=${stopMetronome} class="flex h-full w-full justify-center items-center">
            <div class="flex flex-col items-center gap-6 border rounded-xl px-10 py-7 w-[30rem] max-w-full">
                <div class="flex w-full justify-between items-center">
                    <div class="flex items-end">
                        <input 
                            :bind=${bpm} type="number"
                            class="min-w-[1rem] text-lg" 
                            style="field-sizing: content"
                            min="30"
                            max="500"
                        >
                        <span class="text-sm">BPM</span>
                    </div>
                    
                    <button :if=${isPlaying} @click=${stopMetronome} class="px-3 border rounded-md bg-black text-white dark:bg-white dark:text-black">Stop</button>
                    <button :else @click=${startMetronome} class="px-3 rounded-md border">Start</button>
                </div>
                <div class="flex items-center gap-2 w-full">
                    <input type="range" min="30" max="500" 
                           class="slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                           :bind=${bpm} />
                </div>
            </div>
        </div>
    `;
}
