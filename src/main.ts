import Router from "jdomjs/src/router/Router.js";
import {computed, html, state, watch} from "jdomjs";
import {Home} from "./views/Home.js";
import {Tuner} from "./views/Tuner.js";
import {CircleOfFifths} from "./views/CircleOfFifths.js";
import Notation from "./components/Notation.js";
import ChordFinder from "./views/ChordFinder.js";


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
    ['BASS', 'Bass', 'E,A,D,G'],
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
        view: () => Home()
    },
    {
        path: '/tuner',
        name: 'tuner',
        view: () => Tuner()
    },
    {
        path: '/circle-of-fifths',
        name: 'circle-of-fifths',
        view: () => CircleOfFifths()
    },
    {
        path: '/chord-finder',
        name: 'chord-finder',
        view: () => ChordFinder()
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
        route: '/'
    },
    {
        label: 'Tuner',
        route: '/tuner'
    },
    {
        label: 'Circle of Fifths',
        route: '/circle-of-fifths'
    },
    {
        label: 'Chord Finder',
        route: '/chord-finder'
    },
]

html`
    <div class="grid grid-cols-[280px_1fr] w-full h-full dark:text-white dark:bg-black">
        <div class="border-r border-neutral-300 bg-neutral-50 dark:bg-black p-2 flex flex-col justify-between">
            <div>
                <div class="mb-4 pt-2 px-3">
                    <span class="text-lg">Guitar Helper</span>
                </div>
                
                <div>
                    ${computed(() =>links.map(l => html`
                        <a 
                            class=${[
                                'p-2', 'px-3', 'block', 'rounded-md', 
                                'cursor-pointer', 'transition-all', 
                                ...(router.currentRoute.value?.path === l.route ? ['bg-neutral-200', 'dark:bg-neutral-800'] : ['hover:bg-neutral-100', 'dark:hover:bg-neutral-900'])
                            ]}
                           @click=${() => router.go(l.route)}
                        >
                            ${l.label}
                        </a>
                    `, [router.currentRoute]))}
                </div>
            </div>

            <div class="flex flex-col gap-2">
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
        <div class="overflow-auto">
            ${ router.view }
        </div>
    </div>
`.appendTo(document.body)

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
