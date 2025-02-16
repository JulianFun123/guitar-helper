import {computed, html, state, watch} from "pulsjs";
import Fretboard from "../components/Fretboard.js";
import Notation, {NotationNote} from "../components/Notation.js";
import {getFretboard} from "../notes/fretboardHelper.js";

const NUMBERS = ['0','1','2','3','4','5','6','7','8','9']

export function TabEditor() {
    function tuning() {
        return ['E','A','D','G','B','e']
    }
    function line() {
        return ['|','|','|','|','|','|']
    }

    function bar() {
        return ['','','','','','']
    }

    const cols = state([
        {
            information: state(''),
            bars: state([
                ['','5h','2','','','0'],
                ['','','4p','','',''],
                ['','','2p','','',''],
                ['','','0','','',''],
                ['','','','','',''],
                ['','','','0h','',''],
                ['','','','2','',''],
                ['','','0','','',''],
                ['','','','','',''],
                ['','','0','','',''],
                ['','','','','',''],
                ['','','0','0h','3',''],
                ['','','','2','',''],
                ['x','x','x','x','',''],
                ['','3','0h','0','',''],
                ['','','2','','',''],
                ['x','x','x','x','',''],
                ['','','0','2','2',''],
                ['x','x','x','x','',''],
            ])
        }
    ])

    const selectedBar = state(0)
    const selectedLine = state(0)
    const selectedBarCol = state(0)


    const addLine = () => {
        const a = cols.value[selectedBarCol.value]
        a.bars.value = [
            ...a.bars.value.slice(0, selectedBar.value + 1),
            bar(),
            ...a.bars.value.slice(selectedBar.value + 1, a.bars.value.length)
        ]
        selectedBar.value++
        a.information.value = a.information.value.padEnd(a.bars.value.length - 1, ' ')
    }

    const noteClick = (a, {row, col}) => {
        const b = cols.value[selectedBarCol.value].bars
        b.value[selectedBar.value][5-row] = String(col)


        if (selectedBar.value === b.value.length - 1) {
            addLine()
        } else {
            b.value = [...b.value]
        }
    }

    const letterWidth = 9.8

    const fretboard = getFretboard()

    // TODO
    const saveToPastefy = async () => {
        const { paste } = await (await fetch('https://pastefy.app/api/v2/paste', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'guitar.tab.txt',
                content: toText(),
                type: "PASTE"
            })
        })).json()
        window.open(`https://pastefy.app/${paste.id}`)
    }

    const calcBarWidth = (r, cI) => {
        return Math.max(...cols.value[r].bars.value[cI].map(s => (s?.length || 1) * letterWidth), letterWidth) || letterWidth
    }

    const triggerChange = state(0)

    const moveSelectedBar = (i = 0) => {
        selectedBar.value += i
        if (selectedBar.value <= 0) selectedBar.value = 0
        if (selectedBar.value >= cols.value[selectedBarCol.value].bars.value.length)
            selectedBar.value = cols.value[selectedBarCol.value].bars.value.length - 1
    }


    const letterGap = 0
    const toText = () => {
        let out = ''
        for (let col of cols.value) {
            out += col.information.value + '\n'

            let barStrings = ['e|', 'B|', 'G|', 'D|', 'A|', 'E|' ]
            col.bars.value.forEach((bar) => {
                const a = Math.max(...bar.map(m => m.length))
                bar.forEach((item, index) => {
                    barStrings[index] += (item === '' ? '' : item.replace('—', '')).padEnd(a, '-') + '-'
                })
            })

            ;['|', '|', '|', '|', '|', '|'].forEach((item, index) => barStrings[index] += item)

            out += barStrings.join('\n') + '\n\n\n\n'
        }
        return out.trim()
    }

    setTimeout(() => {
        (document.querySelector(`.inp-0-0-0`) as HTMLInputElement).focus()
    }, 100)

    return html`
        <div  class="w-full h-full text-md flex flex-col justify-between">
            <div class="p-10 overflow-auto">
                <div style="font-family: 'Space Mono'">
                    ${computed(() => cols.value.map((c, cIndex) => html`
                        <div class="mb-8">
                            <input :bind=${c.information} type="text" class="min-w-full text-neutral-600 dark:text-neutral-400" style=${{letterSpacing: `${letterGap*2}px`}}>
                            <div class="flex items-center">

                                ${[tuning(), line()].map((l, i) => html`
                                    <div class="flex flex-col justify-center cursor-pointer items-center flex-reversed" style=${{padding: `0 ${letterGap}px`}}>
                                        ${l.map(c => html`
                                            <span style=${`width: ${letterWidth}px`}>${c}</span>
                                        `)}
                                    </div>
                                `)}
                                
                                ${computed(() => c.bars.value.map((l, i) => html`
                                    <div 
                                        class="flex flex-col justify-center cursor-pointer items-center flex-reversed hover:bg-blue-200 transition-all"
                                        style=${computed(() => ({'background': selectedBar.value === i && selectedBarCol.value === cIndex ? '#3333AA44' : null}), [selectedBar, selectedBarCol])}
                                        @click=${() => {
                                            selectedBarCol.value = cIndex
                                            selectedBar.value = i
                                        }}
                                    >
                                        ${l.map((cc, ccI) => html`
                                            <input
                                                class=${`inp-${cIndex}-${i}-${ccI} select-all placeholder-black dark:placeholder-white`}
                                                style=${computed(() => ({
                                                    width: `${calcBarWidth(cIndex, i) + letterGap*2}px`,
                                                    padding: `0 ${letterGap}px`,
                                                    'min-width': '100%',
                                                    'caret-color': 'transparent',
                                                }), [triggerChange])}
                                                placeholder="————————————————————————————"
                                                type="text"
                                                value=${cc}
                                                @keydown=${(e: KeyboardEvent) => {
                                                    if (e.key === 'Tab' || e.metaKey || e.ctrlKey || e.altKey) return;
                                                    const getEl = (a1 = 0, b1 = 0, c1 = 0) => document.querySelector(`.inp-${cIndex+a1}-${i+b1}-${ccI+c1}`) as HTMLInputElement
                                                    
                                                    let text = (e.target as HTMLInputElement).value
                                                    const hasText = text !== ''
                                                    
                                                    if (NUMBERS.includes(e.key)) {
                                                        text += e.key
                                                        if (Number(text) > 24) {
                                                            text = e.key
                                                        }
                                                    } else if (['x'].includes(e.key)) {
                                                        text = text === 'x' ? '' : e.key
                                                    } else if (hasText && ['x', 'h', 'p', 'b', '\\', '/', '~'].includes(e.key)) {
                                                        text = text.includes(e.key) ? text.replace(e.key, '') : text+e.key
                                                    } else {
                                                        switch (e.key) {
                                                            case 'ArrowUp':
                                                                getEl(0, 0, -1)?.focus()
                                                                break
                                                            case 'Backspace':
                                                                if (hasText) {
                                                                    text = ''
                                                                    break;
                                                                }
                                                                if (ccI === 0) {
                                                                    c.bars.value.splice(i, 1)
                                                                    c.bars.value = [...c.bars.value]
                                                                    getEl(0, -1)?.focus()
                                                                    moveSelectedBar(-1)
                                                                } else {
                                                                    getEl(0, 0, -1)?.focus()
                                                                }
                                                                break
                                                            case 'Enter':
                                                                if (ccI === 5) {
                                                                    if (c.bars.value.length - 1 === selectedBar.value) {
                                                                        addLine()
                                                                    }
                                                                    getEl(0, 1)?.focus()
                                                                    moveSelectedBar(1)

                                                                } else {
                                                                    getEl(0, 0, 1)?.focus()
                                                                }
                                                                break;
                                                            case 'ArrowDown':
                                                                getEl(0, 0, 1)?.focus()
                                                                break
                                                            case 'ArrowLeft':
                                                                e.preventDefault()
                                                                getEl(0, -1)?.focus()
                                                                moveSelectedBar(-1)
                                                                break
                                                            case 'ArrowRight':
                                                                e.preventDefault()
                                                                getEl(0, 1)?.focus()
                                                                moveSelectedBar(1)
                                                                break
                                                        }
                                                    }
                                                    c.bars.value[i][ccI] = text
                                                    ;(e.target as HTMLInputElement).value = text
                                                    e.preventDefault()
                                                    triggerChange.value++
                                                }}
                                            >
                                        `)}
                                    </div>


                                    <div class="flex flex-col justify-center cursor-default items-center flex-reversed" style=${{padding: `0 ${letterGap}px`}}>
                                        ${(i === c.bars.value.length - 1 ? ['|','|','|','|','|','|'] : ['—','—','—','—','—','—']).map(c => html`
                                            <span style=${`width: ${letterWidth}px`}>${c}</span>
                                        `)}
                                    </div>
                                `), [c.bars])}
                                
                                <div class="border rounded-md p-2 ml-5 flex flex-col gap-2" :if=${computed(() => c.bars.value.length === 0 || cIndex === selectedBarCol.value, [selectedBarCol, c.bars])}>
                                    <button @click=${() => cols.value = cols.value.filter((_,ri)=> cIndex !== ri)}>Remove</button>
                                    <button @click=${addLine}>Add col</button>
                                </div>
                            </div>
                        </div>
                    `), [cols])}
                </div>
                <button 
                    class="px-3 border rounded-md"
                    @click=${() => cols.value = [...cols.value, {
                        information: state(''),
                        bars: state([ bar(),bar(),bar(),bar(),bar() ])
                    }]}
                >
                    Add Row
                </button>
            </div>
            
            <div class="flex flex-col w-full">
                <div class="border-t py-4 px-6 flex justify-between">
                    <div />
                    <div class="flex gap-2">
                        <button class="border rounded-md px-3" @click=${() => navigator.clipboard.writeText(toText())}>
                            Copy
                        </button>
                        <button class="border rounded-md px-3" @click=${saveToPastefy}>
                            Export to Pastefy
                        </button>
                    </div>
                </div>
                <div class="border-t  py-4 px-6 flex overflow-auto">
                    <${Fretboard} colHeight=${30} colWidth=${60} rows=${24} onNoteClick=${noteClick} />
                </div>
            </div>
        </div>
        
    `
}