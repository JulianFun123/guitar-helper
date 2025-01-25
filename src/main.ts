import './style.scss'
import piano from './piano.svg?raw'
import fretboard from './fretboard.svg?raw'


// @language=html
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="max-w-[1200px] mx-auto ">
        <div class="flex flex-col items-center gap-5 pt-4 w-full mb-5">
            <h1>Piano Helper</h1>
            <div class="h-[10rem]">
                ${piano}
            </div>
            <div class="h-[10rem]">
                ${fretboard}
            </div>
        </div>
        
        <div class="flex gap-2 justify-center">
            <div>
                <span>Note:</span>
                <select id="note-select" class="border rounded-md"></select>
            </div>
            <div>
                <span>Chord:</span>
                <select id="type-select" class="border rounded-md"></select>
            </div>
            <div>
                <span>Colored:</span>
                <input id="colored-checkbox" type="checkbox">
            </div>
        </div>
        <div class="flex gap-2 justify-center" id="more-info">
            
        </div>
    </div>
    
    <style id="styling">
    </style>
`

const NOTES = [
    'A', 'A#',
    'B',
    'C', 'C#',
    'D', 'D#',
    'E',
    'F', 'F#',
    'G', 'G#'
] as const

// type NotesType = typeof NOTES

const COLOR_PALETTE = [
    ['#dd2a2a', '#FFF'],
    ['#8cdd2a', '#FFF'],
    ['#2a7edd', '#FFF'],
    ['#dd2a9e', '#FFF'],
    ['#2add92', '#FFF'],
    ['#95dd2a', '#FFF'],
]

const styleEl = document.getElementById('styling')!

const noteSelect = document.getElementById('note-select')! as HTMLSelectElement
const typeSelect = document.getElementById('type-select')! as HTMLSelectElement
const coloredCheckBox = document.getElementById('colored-checkbox')! as HTMLInputElement
const moreInfoDiv = document.getElementById('more-info')! as HTMLDivElement

const resetStyling = () => styleEl.innerHTML = ''

const addStyling = (note: string, fillColor: string, textColor: string, extraClasses = '') => {
    note = note.replace('#', '\\#')

    styleEl.innerHTML += `
        .${note}-Note${extraClasses} {
            opacity: 1;
        }
        
        .${note}-Note${extraClasses} circle {
            fill: ${fillColor};
        }
        
        .${note}-Note${extraClasses} path {
            fill: ${textColor};
        }
    `
}


resetStyling()

const getAfter = (key: string, addition: number) => {
    const ind = NOTES.findIndex(k => k === key)

    let newInd = ind + addition

    if (newInd > NOTES.length -1) {
        newInd -= NOTES.length
    }

    return NOTES[newInd]
}

const getMajorScale = (key: string) => {
    return [
        key,
        getAfter(key, 2),
        getAfter(key, 4),
        getAfter(key, 5),
        getAfter(key, 7),
        getAfter(key, 9),
        getAfter(key, 11),
    ]
}

const getMinorScale = (key: string) => {
    return [
        key,
        getAfter(key, 2),
        getAfter(key, 3),
        getAfter(key, 5),
        getAfter(key, 7),
        getAfter(key, 8),
        getAfter(key, 10),
    ]
}
const getMajorChord = (key: string) => {
    return [
        key,
        getAfter(key, 4),
        getAfter(key, 7),
    ]
}
const getMinorChord = (key: string) => {
    return [
        key,
        getAfter(key, 3),
        getAfter(key, 7),
    ]
}

const selected = () => {
    resetStyling()
    let colorI = 0

    moreInfoDiv.innerHTML = ''

    styleEl.innerHTML += NOTES.map(n => `.${n.replace('#', '\\#')}-Note {
        opacity: 0;
    }`).join('\n')

    const nextColor = () => {
        if (!coloredCheckBox.checked) return ['#FFF', '#000']

        return COLOR_PALETTE[colorI++] ?? ['#EE4444', '#FFF']
    }

    let scaleNotes;
    switch (typeSelect.value) {
        case 'MAJOR_SCALE':
            scaleNotes = getMajorScale(noteSelect.value)
            getMajorScale(noteSelect.value).forEach(k => {
                const color = nextColor()
                addStyling(k, color[0], color[1])
            })
            moreInfoDiv.innerHTML = 'Major Scale Chords: ' + [
                `${scaleNotes[0]}`,
                `${scaleNotes[1]}m`,
                `${scaleNotes[2]}m`,
                `${scaleNotes[3]}`,
                `${scaleNotes[4]}`,
                `${scaleNotes[5]}m`,
                `${scaleNotes[6]}dim`,
            ].map(k => `<span class="px-1 bg-neutral-100 rounded-md">${k}</span>`).join(' ')
            break
        case 'MINOR_SCALE':
            scaleNotes = getMinorScale(noteSelect.value)
            scaleNotes.forEach(k => {
                const color = nextColor()
                addStyling(k, color[0], color[1])
            })

            moreInfoDiv.innerHTML = 'Major Scale Chords: ' + [
                `${scaleNotes[0]}m`,
                `${scaleNotes[1]}dim`,
                `${scaleNotes[2]}`,
                `${scaleNotes[3]}m`,
                `${scaleNotes[4]}m`,
                `${scaleNotes[5]}`,
                `${scaleNotes[6]}`,
            ].map(k => `<span class="px-1 bg-neutral-100 rounded-md">${k}</span>`).join(' ')
            break
        case 'MAJOR_CHORD':
            getMajorChord(noteSelect.value).forEach(k => {
                const color = nextColor()
                addStyling(k, color[0], color[1])
            })
            break;
        case 'MINOR_CHORD':
            getMinorChord(noteSelect.value).forEach(k => {
                const color = nextColor()
                addStyling(k, color[0], color[1])
            })
            break;
    }

}


noteSelect.innerHTML = NOTES.map(n => `<option value="${n}">${n}</option>`).join('')
noteSelect.value = 'A'

typeSelect.innerHTML = [
    ['MAJOR_SCALE', 'Major Scale'],
    ['MINOR_SCALE', 'Minor Scale'],
    ['MAJOR_CHORD', 'Major Chord'],
    ['MINOR_CHORD', 'Minor Chord'],
].map(([val, label]) => `<option value="${val}">${label}</option>`).join('')

noteSelect.addEventListener('change', selected)
typeSelect.addEventListener('change', selected)
coloredCheckBox.addEventListener('change', selected)

selected()