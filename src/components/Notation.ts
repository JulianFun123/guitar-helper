import {html, JDOM, JDOMComponent, CustomElement, state, computed, watch} from 'jdomjs'
import {getAfter, getDistance, getMDistance} from "../notes/notes.js";
import {playNote} from "../notes/note-tone.js";

let listenerCount = 0

@CustomElement('gh-notation')
export default class Notation extends JDOMComponent {

    clef: 'G' | 'F'= 'G'

    height = 240
    width = 1200
    lineHeight = 20

    tactWidth = 400

    constructor() {
        super();
    }

    notes = [
        [
            [
                ['A', 5, 1],
            ],
            [
                ['D', 5, 1/2],
            ],
            [
                ['G#', 5, 1/4],
            ],
            [
                ['C', 5, 1/8],
            ],
        ],
        [
            [
                ['C', 5, 1/16],
            ],
            [
                ['D', 5, 1],
            ],
            [ ['G#', 3, 1], ],
            [
                ['G#', 5, 1],
            ],
        ]
    ]

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
                    <line x1="0" y1=${`${l}px`} x2="100%" y2=${`${l}px`} stroke-width="2" stroke="#555" class="dark:stroke-neutral-300" />
                `).join('')}
        `

        let x = 10

        svg += `
            <text x=${x} y=${center} dominant-baseline="middle" font-size="${this.lineHeight*5}px">${this.clef === 'G' ? '𝄞' : '𝄢' }</text>
        `

        x += 60
        svg += `
            <text x=${x} y=${center - this.lineHeight + 4} dominant-baseline="middle" font-size="${this.lineHeight*2}px" font-weight="700">4</text>
            <text x=${x} y=${center + this.lineHeight + 4} dominant-baseline="middle" font-size="${this.lineHeight*2}px" font-weight="700">4</text>  
        `

        x += 80

        const createVerticalLine = (x) => {
            svg += `
                <line x1=${x} y1=${center - this.lineHeight * 2} x2=${x} y2=${center + this.lineHeight * 2} stroke-width="2" stroke="#555" class="dark:stroke-neutral-300" />
            `
        }
        createVerticalLine(1)
        createVerticalLine(this.width-1)

        const spawnNote = (note, octave: number, length = 0, nx) => {
            let ny = center + getMDistance(this.clef === 'G' ? 'B' : 'D',
                this.clef === 'G' ? 5 : 3
                , note[0], octave)*(this.lineHeight/2)

            const className = `click-listener-${++listenerCount}`

            svg += `<g class="${className}">`

            listeners.push({
                el: `.${className}`,
                type: 'click',
                callback: () => {
                    playNote('piano', note, octave, length)
                }
            })

            if (note.length === 2) {
                svg += `
                    <text x=${nx - 40} y=${ny + 2} dominant-baseline="middle" font-size="${this.lineHeight * 1.5}px">${
                        note[1] === '#' 
                        ? '♯' 
                            : note[1] === 'b'
                        ? '♭' 
                            : ''
                    }</text>
                `
            }

            svg += `
                <ellipse cx=${nx} cy=${ny} rx=${10} ry=${7} transform="${`rotate(-30)`}" transform-origin="${nx} ${ny}" />
            `

            let poleX = ny > center ? nx - 10 : nx + 7
            let poleY = ny > center ? ny : ny - 50
            let poleHeight = 50

            let noteL = 1
            while (length < 1/noteL) {
                noteL *= 2
            }

            if (noteL >= 2) {
                svg += `<rect x=${poleX} y=${poleY} height=${poleHeight} width="2" fill="black" />`
            }

            if (noteL <= 2){
                svg += `
                    <ellipse cx=${nx} cy=${ny} rx=${6} ry=${5} transform="${`rotate(30)`}" fill="white" transform-origin="${nx} ${ny}" />
                `
            }

            if (noteL >= 4){
                let a = 4
                let b = 0
                while (length <= 1/a) {
                    //svg += `<rect x=${poleX} y=${poleY - b} height=${4} width="16" fill="black" />`
                    svg += `
                        <g transform="translate(${poleX}, ${poleY - b})">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.0073451 9.37119C0.0073451 9.37119 -0.00918137 1.49606 0.0073451 0C2.74614 5.60567 5.50669 9.12353 7.37973 11.2286C9.15814 13.2273 18.9091 22.1126 7.67155 36C14.3447 22.4005 11.9441 14.3407 0.0073451 9.37119Z" fill="black"/>
                        </g>
                    `
                    a *= 2
                    b -= 10
                }
            }

            svg += `</g>`
        }

        this.notes.forEach((tact) => {
            let innerX = x
            tact.forEach(ln => {
                ln.forEach((n) => {
                    const [note, octave, length] = n
                    spawnNote(note, Number(octave), Number(length), innerX + this.tactWidth/8)
                })
                innerX += this.tactWidth / 4
            })

            x += this.tactWidth
            createVerticalLine(x)
        })

        const svgEl = document.createElement('div')
        svgEl.innerHTML = `
            <svg width="${this.width}px" height=${`${this.height}px`}>    
                ${svg}
            </svg>`

        listeners.forEach(listener => {
            svgEl.querySelector(listener.el).addEventListener(listener.type, listener.callback)
        })

        return svgEl
    }
}