import {appendTo, computed, html, state, watch} from "pulsjs";
import { Router } from "pulsjs-router";
import Notation from "./components/Notation.ts";
import {showGlobalMetronome} from "./composables/useMetronome.ts";
import {Metronome} from "./components/Metronome.ts";
import {GuitarBodyIcon, GuitarIcon} from "./components/icons/icons.js";

export const savedParams = new URLSearchParams(window.location.hash.substring(1) || localStorage.getItem("settings"))

export const saveParams = () => {
    localStorage.setItem("settings", savedParams.toString());
}
export const INSTRUMENTS = [
    ['GUITAR', 'Guitar', 'E,A,D,G,B,E'],
    ['GUITAR_DROP_D', 'Guitar Drop D', 'D,A,D,G,B,E'],
    ['GUITAR_DROP_D', 'Guitar Drop C', 'C,G,C,F,A,D'],
    ['GUITAR_OPEN_D', 'Guitar Open D', 'D,A,D,F#,A,D'],
    ['GUITAR_OPEN_G', 'Guitar Open G', 'D,G,D,G,B,D'],
    ['BASS', 'Bass', 'E0,A1,D1,G2'],
    ['BASS_5_STRING', 'Bass 5-string', 'B,E,A,D,G'],
    ['UKULELE', 'Ukulele', 'G,C,E,A'],
    ['VIOLIN', 'Violin', 'G,D,A,E'],
    ['VIOLA', 'Viola', 'C,G,D,A'],
    ['BANJO_4_STRING', 'Banjo 4-string', 'C,G,D,A'],
    ['BANJO_5_STRING', 'Banjo 5-string', 'G,D,G,B,D'],
]

export const tuning = state(savedParams.get('tuning') || INSTRUMENTS[0][2])

watch([tuning], () => {
    savedParams.set('tuning', tuning.value);
    saveParams();
})


// @ts-ignore
export const router = new Router([
    {
        path: '/',
        name: 'home',
        view: async () => (await import('./views/Home.js')).Home()
    },
    {
        path: '/tuner',
        name: 'tuner',
        view: async () => html`<${(await import('./views/Tuner.js')).Tuner} />`
    },
    {
        path: '/circle-of-fifths',
        name: 'circle-of-fifths',
        view: async () => (await import('./views/CircleOfFifths.js')).CircleOfFifths()
    },
    {
        path: '/chord-finder',
        name: 'chord-finder',
        view: async () => (await import('./views/ChordFinder.ts')).ChordFinder()
    },
    {
        path: '/metronome',
        name: 'metronome',
        view: async () => (await import('./components/Metronome.ts')).Metronome()
    },
    {
        path: '/tab-editor',
        name: 'tab-editor',
        view: async () => (await import('./views/TabEditor.ts')).TabEditor()
    },
    {
        path: '/midi',
        name: 'midi',
        view: async () => (await import('./views/Midi.ts')).Midi()
    },
    {
        path: '/exercises',
        name: 'exercises',
        view: async () => (await import('./views/exercises/Exercises.ts')).Exercises()
    },
    {
        path: '/exercise/:name',
        name: 'exercise',
        view: async () => (await import('./views/exercises/Exercise.ts')).Exercise()
    },
    {
        path: '/notation',
        name: 'notation',
        view: () => {
            const a = state(null)
            return html`
            <div class="flex flex-col justify-center items-center w-full h-full">
                <div class="max-w-full">
                <${Notation} :ref=${a} clef="G" notes=${[
                    {
                        scale: 'B',
                        speed: [4, 4],
                        bpm: 80,
                        notes: [{
                            type: 'note',
                            notes: [
                                {
                                    note: 'Ab',
                                    octave: 5,
                                },
                                {
                                    note: 'D',
                                    octave: 5,
                                }
                            ],
                            length: 1 / 4
                        },{
                            type: 'note',
                            notes: [
                                {
                                    note: 'A',
                                    octave: 5,
                                },
                                {
                                    note: 'C',
                                    octave: 5,
                                },
                                {
                                    note: 'D',
                                    octave: 5,
                                }
                            ],
                            length: 1 / 4
                        },{
                            type: 'note',
                            notes: [
                                {
                                    note: 'A',
                                    octave: 5,
                                },
                                {
                                    note: 'C',
                                    octave: 5,
                                },
                                {
                                    note: 'D',
                                    octave: 5,
                                }
                            ],
                            length: 1 / 4
                        },{
                            type: 'note',
                            notes: [
                                {
                                    note: 'A',
                                    octave: 5,
                                },
                                {
                                    note: 'C',
                                    octave: 5,
                                },
                                {
                                    note: 'D',
                                    octave: 5,
                                }
                            ],
                            length: 1 / 4
                        },{
                            type: 'note',
                            notes: [
                                {
                                    note: 'A',
                                    octave: 5,
                                },
                                {
                                    note: 'C',
                                    octave: 5,
                                },
                                {
                                    note: 'D',
                                    octave: 5,
                                }
                            ],
                            length: 1 / 2
                        },{
                            type: 'note',
                            notes: [
                                {
                                    note: 'A',
                                    octave: 5,
                                },
                                {
                                    note: 'C',
                                    octave: 5,
                                },
                                {
                                    note: 'D',
                                    octave: 5,
                                }
                            ],
                            length: 1 / 4
                        },{
                            type: 'note',
                            notes: [
                                {
                                    note: 'A',
                                    octave: 5,
                                },
                                {
                                    note: 'C',
                                    octave: 5,
                                },
                                {
                                    note: 'D',
                                    octave: 5,
                                }
                            ],
                            length: 1 / 4
                        }]
                    }
                ]} />
                </div>
                
                <button @click=${() => a.value.play()}>play</button>
            </div>
        `
        }
    }
])

const links = [
    {
        label: 'Scales & Chords',
        route: '/',
        icon: 'piano'
    },
    {
        label: 'Exercises',
        route: '/exercises',
        icon: 'map-route'
    },
    {
        label: 'Tuner',
        route: '/tuner',
        icon: 'gauge'
    },
    {
        label: 'Circle of Fifths',
        route: '/circle-of-fifths',
        icon: 'circle'
    },
    {
        label: 'Chord Finder',
        route: '/chord-finder',
        icon: 'book-2'
    },
    {
        label: 'Metronome',
        route: '/metronome',
        special: 'metronome',
        icon: 'metronome'
    },
    {
        label: 'Tab-txt Editor',
        route: '/tab-editor',
        icon: 'table'
    },
    {
        label: 'Midi Visualizer',
        route: '/midi',
        icon: 'radio'
    },
]

appendTo(document.body, html`
    <div class="grid grid-cols-1 md:grid-cols-[280px_1fr] w-full h-full dark:text-white dark:bg-black">
        <div class="border-r border-neutral-300 bg-neutral-50 dark:bg-black p-2 flex-col justify-between hidden md:flex">
            <div>
                <div class="mb-4 pt-2 px-3 ">
                    <img src="/logo.svg" class="w-[8rem] dark:hidden block" />
                    <img src="/logo-white.svg" class="w-[8rem] dark:block hidden" />
                </div>
                
                <div>
                    ${computed(() =>links.map(l => html`
                        <a 
                            class=${[
                                'p-2', 'px-3', 'block', 'rounded-md', 'flex', 'justify-between', 'items-center',
                                'cursor-pointer', 'transition-all', 
                                ...(router.currentRoute.value?.path === l.route ? ['bg-neutral-200', 'dark:bg-neutral-800'] : ['hover:bg-neutral-100', 'dark:hover:bg-neutral-900'])
                            ]}
                           @click.prevent=${() => router.go(l.route)} 
                            href=${router.getPath(l.route)}
                        >
                            <span class="flex gap-1 items-center">
                                ${l.icon ? html`<i class=${`ti ti-${l.icon}`} />` : null}
                                <span>${l.label}</span>
                            </span>
                            
                            ${
                                l.special === 'metronome' ? 
                                    html`<button @click.stop.prevent=${() => showGlobalMetronome.value = true} class="opacity-70 text-sm">(open)</button>` 
                                    : null
                            }
                        </a>
                    `, [router.currentRoute]))}
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center justify-between">
                    <label for="type">Instrument:</label>
                    <select id="type" class="border rounded-md p-1" :bind=${tuning}>
                        ${INSTRUMENTS.map(([type, value, tuning]) => html`<option value=${tuning}>${value}</option>`)}
                        <option value=${tuning}>Custom</option>
                    </select>
                </div>
                <div class="flex gap-2 items-center justify-between">
                    <label for="tuning">Tuning:</label>
                    <input id="tuning" class="border rounded-md p-1" :bind=${tuning}>
                </div>
                ${computed(() => showGlobalMetronome.value ? html`
                    <${Metronome}  small />
                ` : null)}
            </div>
        </div>
        <div class="overflow-auto">
            ${router.view}
        </div>
    </div>
`)

router.init()



if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
});
