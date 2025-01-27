import {html, JDOM, JDOMComponent, CustomElement, state, computed, watch} from 'jdomjs'
import {getAfter, getDistance, getMDistance, NotesType} from "../notes/notes.js";
import {playNote} from "../notes/note-tone.js";
import {getScale} from "../notes/scales.js";
import {parseChord} from "../notes/chords.js";

let listenerCount = 0

export type NotationNote = {
    note: NotesType;
    octave: number;
}

export type NotationEntry = {
    length: number; // 1/2
} & ({
    type: 'note'
    notes: NotationNote[];
} | {
    type: 'pause'
})

export type NotationPart = {
    speed: [number, number]; // Example 4/4
    bpm: number;
    notes: NotationEntry[];
    scale?: string
}

@CustomElement('gh-notation')
export default class Notation extends JDOMComponent {

    notes: NotationPart[] = []

    entryPositions: Record<string, number> = {}

    clef: 'G' | 'F' = 'G'

    height = 240
    width = null
    lineHeight = 20

    tactWidth = 400

    playbackLineClass = ''

    hideBpm = false
    hideSpeed = false

    constructor() {
        super();
    }

    wait(ms) {
        return new Promise((res) => {
            return setTimeout(() => {
                return res(true)
            }, ms)
        })
    }

    playPart(part: NotationPart) {
        return new Promise(async (res) => {
            const chunks = this.chunkIntoTacts(part)

            const line = (document.querySelector(`.${this.playbackLineClass}`) as SVGLineElement)
            const bpmL = 1000 * 60 / part.bpm
            line.style.transition = `${bpmL}ms linear`

            let tactI = 0
            for (const tact of chunks) {
                let entryI = 0
                for (const entry of tact) {
                    line.style.stroke = `#55a9ee`
                    line.style.transform = `translateX(${this.entryPositions[`${tactI}-${entryI}`]}px)`

                    if (entry.type === 'note') {
                        entry.notes.forEach(n => {
                            playNote('piano', n.note, n.octave, entry.length * bpmL)
                        })
                    }
                    await this.wait(entry.length * bpmL)

                    entryI++
                }
                tactI++
            }

            res(true)
        })
    }

    async play() {
        let i = 0

        const line = (document.querySelector(`.${this.playbackLineClass}`) as SVGLineElement)
        line.style.transform = `translateX(${this.entryPositions[`${0}-${0}`]}px)`
        line.style.transition = `0ms linear`

        for (const part of this.notes) {
            await this.playPart(part)
        }

        line.style.transform = `translateX(${0}px)`
        line.style.transition = `0ms linear`
        line.style.stroke = `transparent`
    }

    chunkIntoTacts (part: NotationPart) {
        let currentLength = 0
        const tacts: NotationEntry[][] = [ [] ]

        part.notes.forEach((entry) => {
            if (currentLength + entry.length > 1) {
                currentLength = 0
                tacts.push([])
            }
            tacts[tacts.length - 1].push(entry)

            currentLength += entry.length
        })

        return tacts
    }

    setup() {
    }

    render(): Node | JDOM | string | undefined {
        const listeners = []
        const center = this.height / 2

        // language=svg
        let svg = `
                ${[
                    center - this.lineHeight * 2,
                    center - this.lineHeight,
                    center,
                    center + this.lineHeight,
                    center + this.lineHeight * 2,
                 ].map(l => `
                    <line x1="0" y1=${`${l}px`} x2="100%" y2=${`${l}px`} stroke-width="2" stroke="#555" class="dark:stroke-neutral-400" />
                `).join('')}
        `

        let x = 10

        svg += `
            <text x=${x} y=${center} dominant-baseline="middle" font-size="${this.lineHeight*5}px" class="dark:fill-white">${this.clef === 'G' ? '𝄞' : '𝄢' }</text>
        `

        x += 30
        const addSpeed = (a, b) => {
            svg += `
                <text x=${x} y=${center - this.lineHeight + 4} dominant-baseline="middle" font-size="${this.lineHeight*2}px" font-weight="700" class="dark:fill-white">${a}</text>
                <text x=${x} y=${center + this.lineHeight + 4} dominant-baseline="middle" font-size="${this.lineHeight*2}px" font-weight="700" class="dark:fill-white">${b}</text>  
            `
        }

        const createVerticalLine = (x, color = '#555', props = '', strokeWidth = 2) => {
            svg += `
                <line x1=${x} y1=${center - this.lineHeight * 2} x2=${x} y2=${center + this.lineHeight * 2} ${props} stroke-width="${strokeWidth}" stroke=${color} class="dark:stroke-neutral-400" />
            `
        }

        this.playbackLineClass = `playback-line-${++listenerCount}`

        createVerticalLine(x, '#', `class="${this.playbackLineClass}"`, 4)

        createVerticalLine(1)

        const spawnNote = (note, octave: number, length = 0, nx, connect: number|false = 0, flagBottom: null|boolean = null, showNote = true, scale: string[]|null = null, bScale = false) => {
            nx += 30

            let annotation = note[1]
            if (bScale) {
                if (note[1] === '#') {
                    note = `${getAfter(note, 1)}b`
                    annotation = 'b'
                }
            }

            let ny = center + getMDistance(this.clef === 'G' ? 'B' : 'D',
                this.clef === 'G' ? 5 : 3
                , note[0], octave)*(this.lineHeight/2)


            if (scale) {
                const target = scale.find(n => n[0] === note[0])

                if (target) {
                    if (target[1] === '#') {
                        if (note[1] === 'b') {
                            note = note[0]
                            annotation = null
                        } else if (note[1] === '#') {
                            note = getAfter(note[0], 1)
                            annotation = null
                        } else if (target[0] === note) {
                            note = `${note[0]}`
                            annotation = 'b'
                        }
                    }
                }
            }

            if (annotation) {
                svg += `
                    <text x=${nx - Math.max(this.tactWidth*0.025, 7)*4} y=${ny + 2} dominant-baseline="middle" font-size="${this.lineHeight * 1.5}px" class="dark:fill-white">${
                    annotation === '#'
                        ? '♯'
                        : annotation === 'b'
                            ? '♭'
                            : ''
                }</text>
                `
            }

            if (!showNote) return { flagBottom: false, annotation };

            if ((ny > center + this.lineHeight * 2 || ny < center - this.lineHeight * 2)) {
                svg += `
                    <line x1=${nx - this.tactWidth * 0.04} y1=${ny} x2=${nx + (this.tactWidth * 0.04)} y2=${ny} stroke-width="2" stroke="#555" class="dark:fill-white" />
                `
            }

            const className = `click-listener-${++listenerCount}`

            svg += `<g class="${className}">`

            listeners.push({
                el: `.${className}`,
                type: 'click',
                callback: () => {
                    playNote('piano', note, octave, length)
                }
            })

            const ry = Math.max(this.tactWidth * 0.0175, 5)
            const rx = Math.max(this.tactWidth*0.025, 7)

            svg += `
                <ellipse cx=${nx} cy=${ny} rx=${rx} ry=${ry} transform="${`rotate(-30)`}" transform-origin="${nx} ${ny}" class="dark:fill-white" />
            `

            flagBottom = flagBottom === null ? ny > center : flagBottom
            let poleX = flagBottom ? nx - rx : nx + ry
            let poleY = flagBottom ? ny : ny - this.lineHeight * 2.5
            let poleHeight = this.lineHeight * 2.5

            let noteL = 1
            while (length < 1/noteL) {
                noteL *= 2
            }

            if (noteL >= 2) {
                svg += `<rect x=${poleX} y=${poleY} height=${poleHeight} width="2" fill="black" class="dark:fill-white" />`
            }

            if (noteL <= 2){
                svg += `
                    <ellipse cx=${nx} cy=${ny} rx=${Math.max(this.tactWidth * 0.015, 4)} ry=${Math.max(this.tactWidth * 0.0125, 3)} transform="${`rotate(30)`}" fill="white" class="dark:fill-white" transform-origin="${nx} ${ny}" />
                `
            }

            if (noteL >= 4){
                let a = 4
                let b = 0
                while (length <= 1/a) {
                    if (connect !== false) {
                        svg += `<rect x=${poleX} y=${poleY - b} height=${4} width="${connect}" fill="black" class="dark:fill-white" />`
                    } else {
                        svg += `
                            <g transform="translate(${poleX}, ${poleY - b + (flagBottom ?  poleHeight: 0)}) ${flagBottom ? 'scale(-1, -1)' : ''}">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.0073451 9.37119C0.0073451 9.37119 -0.00918137 1.49606 0.0073451 0C2.74614 5.60567 5.50669 9.12353 7.37973 11.2286C9.15814 13.2273 18.9091 22.1126 7.67155 36C14.3447 22.4005 11.9441 14.3407 0.0073451 9.37119Z" fill="black" class="dark:fill-white"/>
                            </g>
                        `
                    }
                    a *= 2
                    b -= 10
                }
            }

            svg += `</g>`

            return { flagBottom, annotation }
        }

        let lastSpeed = []
        let lastBpm = -1
        this.notes.forEach((tact: NotationPart) => {
            let info = ''
            let infoShift = 0

            if ((lastSpeed[0] !== tact.speed[0] || lastSpeed[1] !== tact.speed[1]) && !this.hideSpeed) {
                x += 20
                addSpeed(tact.speed[0], tact.speed[1])
                lastSpeed = tact.speed
                x += 40
            }

            let innerX = x

            let scale = null
            let parsedScaleChord = null
            if (tact.scale) {

                parsedScaleChord = parseChord(tact.scale)


                scale = getScale(parsedScaleChord).sort(parsedScaleChord.cameFromb ?
                    (a, b) =>  (a.includes('#') ? getAfter(a, 1) + 'b' : a) > (b.includes('#') ? getAfter(b, 1) + 'b' : b) ? 1 : -1
                    : undefined)

                let shift = false
                scale.forEach((n) => {
                    if (spawnNote(n, this.clef === 'G' ? 5 : 3, 1, innerX + (shift ? 20 : 0), false, null, false, null, parsedScaleChord.cameFromb).annotation)
                        shift = !shift
                })

                infoShift -= this.lineHeight * 1.2
                innerX += 50
            }

            if (lastBpm !== tact.bpm && !this.hideBpm) {
                info += `${tact.bpm} bpm`
                lastBpm = tact.bpm
            }

            svg += `
                <text x=${innerX} y=${center - this.lineHeight * 3 + infoShift} dominant-baseline="middle" opacity="0.6" font-style="italic" font-size="${this.lineHeight * 0.7}px" class="dark:fill-white">${info}</text>
            `

            this.chunkIntoTacts(tact).forEach((entries, tactI) => {
                let lastConnected = false
                entries.forEach((entry, entryInd) => {
                    innerX += 10

                    if (entry.type === 'note') {
                        let connect = false;

                        let highestNote = true
                        let lastFlagBottom = null
                        entry.notes.sort((a, b) => (a.octave < b.octave && a.note < b.note) ? 1 : -1)
                            .forEach((n) => {
                                const nextEntry = entries[entryInd+1]
                                if (nextEntry?.type === 'note' && nextEntry.length) {
                                    connect = nextEntry.notes.every((nextEntryNote) =>
                                        nextEntryNote.note === n.note
                                        && nextEntryNote.octave === n.octave
                                    ) && nextEntry.length === entry.length
                                }

                                const { flagBottom } = spawnNote(
                                    n.note,
                                    n.octave,
                                    entry.length,
                                    innerX,
                                    lastConnected && !connect || !highestNote
                                        ? 0 : connect
                                            ? this.tactWidth * entry.length : false,
                                    lastFlagBottom,
                                    true,
                                    scale || null,
                                    parsedScaleChord?.cameFromb || false
                                )
                                lastFlagBottom = flagBottom
                                lastConnected = connect

                                highestNote = false
                            })
                    } else {
                        let restType = 1
                        while (entry.length < 1/restType) {
                            restType *= 2
                        }

                        let pauseX = innerX + (this.tactWidth * entry.length)/2 - this.tactWidth / 16 / 2

                        if (restType === 1 || restType === 2) {
                            svg += `<rect x="${pauseX}" y=${center - this.lineHeight + (restType ===2 ? this.lineHeight / 2 : 0)} height=${this.lineHeight / 2} width=${this.tactWidth / 16} class="dark:fill-white" />`
                        } else if (restType === 4) {
                            svg += `
                                <g transform="translate(${pauseX} ${center - this.lineHeight/2})">
                                    <path d="M10.4558 18.8835C9.71504 18.3021 8.2013 16.6841 7.12693 13.6896C6.07058 10.7461 8.42936 8.90252 9.69498 7.90858C10.0243 7.6495 10.0972 7.32175 9.65984 6.86599C9.22332 6.41069 3.86708 0.458477 3.86708 0.458477C3.2054 -0.412064 2.30221 0.0964074 2.82079 0.829281C8.94753 9.4897 1.03999 10.8148 1.03999 10.8148C1.03999 10.8148 1.89586 13.0409 5.98567 16.6578C1.70583 15.5449 -1.0526 18.6981 1.03999 21.9445C3.13218 25.1906 7.17425 25.8861 7.50738 25.9791C7.8761 26.0816 8.41098 25.7932 7.84055 25.4229C6.54228 24.5787 3.84575 22.3388 5.1298 20.7388C6.84194 18.6056 9.36231 19.533 10.0278 19.8573C11.1845 20.4215 11.5975 19.7803 10.4558 18.8835Z" fill="black" class="dark:fill-white"/>
                                </g>
                            `
                        } else {
                            svg += `<g transform="translate(${pauseX} ${center - this.lineHeight/2})">`
                            let a = 8
                            let xAb = 0
                            let yAb = 0
                            while (entry.length <= 1/a) {
                                svg+= `
                                    <g transform="translate(${xAb} ${yAb})">
                                        <path d="M10.7788 3.5L9.92962 5.40458C9.30545 6.36335 8.22698 7 7 7C6.36323 7 5.76625 6.82827 5.2514 6.52995C6.2965 5.92445 7 4.79488 7 3.5C7 1.56695 5.43317 0 3.5 0C1.56695 0 0 1.56695 0 3.5C0 3.56055 0.00151662 3.62063 0.00454995 3.68037C0.100917 7.45698 3.20063 10.5 7 10.5C7.22692 10.5 7.45103 10.4881 7.67247 10.4669L2.97582 21H6.80797L14.6111 3.5H10.7788Z" fill="black" class="dark:fill-white"/>
                                    </g>
                                `
                                a *= 2
                                xAb -= -8
                                yAb -= 18
                            }
                            svg += `</g>`
                        }
                    }

                    innerX += this.tactWidth * entry.length + 10
                    this.entryPositions[`${tactI}-${entryInd}`] = innerX + this.tactWidth * entry.length
                })
                innerX += 30
                createVerticalLine(innerX)
            })

            x = innerX
        })

        const svgEl = document.createElement('div')

        svgEl.style.width = 'fit-content'

        createVerticalLine((this.width || x)-1)

        svgEl.innerHTML = `
            <svg width="${this.width || x}px" height=${`${this.height}px`}>    
                ${svg}
            </svg>`

        listeners.forEach(listener => {
            svgEl.querySelector(listener.el).addEventListener(listener.type, listener.callback)
        })

        return svgEl
    }
}