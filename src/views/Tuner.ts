import {computed, html, state, watch} from "jdomjs";
import Fretboard from "../components/Fretboard.js";
import JDOMTemplateParser from "jdomjs/src/template/JDOMTemplateParser.js";
import TemplateJDOMAdapter from "jdomjs/src/template/TemplateJDOMAdapter.js";
import {tuning} from "../main.js";

// Logic from https://github.com/pmoieni/celeste-tuner/blob/main/src/lib/Tuner.svelte

export function svg(strings, ...values) {
    // @ts-ignore
    const parser = JDOMTemplateParser.fromTemplate(strings, ...values)

    const parsed = parser.parse()

    // @ts-ignore
    const adapter = new TemplateJDOMAdapter(parsed, true)
    return adapter.create()
}

export function Tuner() {
    // audio context to control audio input
    let audioContext: AudioContext = null;

    // variable to store Audio Context Analyser Node
    let analyser: AnalyserNode = null;

    // variable to store microphone stream data
    let mediaStreamSource: MediaStreamAudioSourceNode = null;

    // false if note was ignored
    let isConfident = false;

    let sensitivity = 0.015; // default is 0.02

    // length of an octave which has 12 notes
    // in Western musical scale
    const octaveLength = 12;

    // pitch is the same as frequency, just different names
    let pitch = state(0);

    interface Note {
        name: string;
        octave: number;
        deviation?: number;
    }

    const note = state<Note>({
        name: "A",
        octave: 4,
        deviation: 0,
    });

    let noteHistory = state<Note[]>([]);
    const historyLength = 60;
    let startButtonDisabled = false;

    let octave: number;
    let deviation = state(0);

    let noteStrings = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    ];

    // brain of the tuner
    // don't change anything if you don't know how the physics of signals work
    function autoCorrelate(buf, sampleRate) {
        // Implements the ACF2+ algorithm
        let SIZE = buf.length;
        let rms = 0;

        for (let i = 0; i < SIZE; i++) {
            let val = buf[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < sensitivity)
            // not enough signal
            // the note is ignored
            return -1;

        let r1 = 0,
            r2 = SIZE - 1,
            thres = 0.2;
        for (let i = 0; i < SIZE / 2; i++)
            if (Math.abs(buf[i]) < thres) {
                r1 = i;
                break;
            }
        for (let i = 1; i < SIZE / 2; i++)
            if (Math.abs(buf[SIZE - i]) < thres) {
                r2 = SIZE - i;
                break;
            }

        buf = buf.slice(r1, r2);
        SIZE = buf.length;

        let c = new Array(SIZE).fill(0);
        for (let i = 0; i < SIZE; i++)
            for (let j = 0; j < SIZE - i; j++) c[i] = c[i] + buf[j] * buf[j + i];

        let d = 0;
        while (c[d] > c[d + 1]) d++;
        let maxval = -1,
            maxpos = -1;
        for (let i = d; i < SIZE; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }
        let T0 = maxpos;

        let x1 = c[T0 - 1],
            x2 = c[T0],
            x3 = c[T0 + 1];
        let a = (x1 + x3 - 2 * x2) / 2,
            b = (x3 - x1) / 2;
        if (a) T0 = T0 - b / (2 * a);

        return sampleRate / T0;
    }

    // an async function that waits for the user to grant microphone permission
    async function getUserMedia() {
        navigator.mediaDevices
            .getUserMedia({
                audio: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false,
                },
                video: false,
            })
            .then((stream) => {
                // run the necessary commands when permission was granted
                gotStream(stream);
                startButtonDisabled = true;
            })
            .catch((err) => {
                // display error if permission was not granted
                alert("getUserMedia threw exception:" + err);
                startButtonDisabled = false;
            });
    }

    function gotStream(stream) {
        // Create an AudioNode from the stream.
        // this is the stream of sound received from microphone
        mediaStreamSource = audioContext.createMediaStreamSource(stream);

        // Connect it to the destination.
        // this is like the tools needed for analaysing the sound buffer
        // more info here: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        // connect the analyser to audio stream
        mediaStreamSource.connect(analyser);

        // start detecting notes
        updatePitch();
    }

    // converts frequency to note
    // frequency of 440 will be converted to note 'A'
    // more info: https://alijamieson.co.uk/2021/12/20/describing-relationship-two-notes/#:~:text=An%20octave%20is%20an%20intervals,A5%20would%20be%20880%20Hz.
    function noteFromPitch(frequency) {
        var noteNum = octaveLength * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    }

    // note: the number 69 corresponds to the pitch A4
    // more info: https://www.audiolabs-erlangen.de/resources/MIR/FMP/C1/C1S3_FrequencyPitch.html
    function frequencyFromNoteNumber(note) {
        return 440 * Math.pow(2, (note - 69) / octaveLength);
    }

    function centsOffFromPitch(frequency, note) {
        return Math.floor(
            (octaveLength *
                100 *
                Math.log(frequency / frequencyFromNoteNumber(note))) /
            Math.log(2)
        );
    }

    // array for received buffer of audio
    let buflen = 2048;
    let buf = new Float32Array(buflen);

    // updates the note using requestAnimationFrame
    function updatePitch() {
        analyser.getFloatTimeDomainData(buf);
        let ac = autoCorrelate(buf, audioContext.sampleRate);

        if (ac == -1) {
            // note was ignored
            isConfident = false;
        } else {
            isConfident = true;
            pitch.value = ac;

            // the index of the detected note
            let noteIdx = noteFromPitch(pitch);

            // noteIdx % noteString.length(108) is one octave high (because octaves start from 0)
            // -12 decreases the octave


            octave = note.value.octave;
            deviation.value = centsOffFromPitch(pitch, selectedNote.value?.name ? Math.floor(noteStrings.indexOf(selectedNote.value?.name) * octaveLength) - 1 : noteIdx);

            note.value = {
                name: noteStrings[noteIdx % noteStrings.length],
                octave: Math.floor(noteIdx / octaveLength) - 1,
                deviation: deviation.value
            };


            if (note?.value.name !== noteHistory.value[noteHistory.value.length - 1]?.name) {
                if (noteHistory.value.length === historyLength) {
                    noteHistory.value.shift();
                }

                noteHistory.value = [
                    ...noteHistory.value,
                    { name: note.value?.name, octave: note.value.octave, deviation: deviation.value },
                ];
            }
        }
        requestAnimationFrame(updatePitch);
    }

    const isStarted = state(false)

    async function init() {
        audioContext = new (window.AudioContext || globalThis.webkitAudioContext)();
        await getUserMedia();
        isStarted.value = true
    }

    const selectedNote = state<Note|null>(null)

    //isStarted.value = true

    const linePositions = () => {
        let out = []

        let s = 1

        let lastPos = [100, 50]
        for (const note of [...noteHistory.value].reverse()) {
            const pos = [100 - (100 / historyLength) * s++, 50 + (note.deviation / 3)]

            out.push(`<line x1="${pos[0]}%" y1="${pos[1]}%" x2="${lastPos[0]}%" y2="${lastPos[1]}%" stroke="black" />`)
            lastPos = pos
        }

        return out.join('');
    }

    return html`
        ${computed(() => isStarted.value ? html`
            <div class="relative overflow-hidden h-full w-full">
                <div class="grid grid-cols-[1fr_200px_1fr] gap-[10rem] items-center h-full w-full absolute left-[50%] top-[50%]" style="transform: translate(-50%, -50%)">
                    <div class="w-full flex justify-end items-end">
                        <div class="h-[200px] border border-l-0 w-full rounded-r">
                            ${computed(() => {
                                const svg = document.createElement("div");
                                svg.style.width = "100%";
                                svg.style.height = "100%";
                                
                                svg.innerHTML = `<svg  xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                                    <defs>
                                        <linearGradient id="redgr" gradientTransform="rotate(90)">
                                          <stop offset="0%" stop-color="#FF000011" />
                                          <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0" />
                                          <stop offset="100%" stop-color="#FF000011" />
                                        </linearGradient>
                                    </defs>
                                    <rect x="0" y="0" width="100%" height="100%" fill="url(#redgr)" />
                                    
                                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#555" />
                                    ${linePositions()}
                                </svg>
                                `
                                return svg
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
            <div class="flex flex-col justify-center items-center h-full w-full">
                <button
                        class="p-3 px-[6rem] text-lg border border-neutral-300 bg-neutral-100 rounded-xl"
                        @click=${() => init()}
                >
                    Start
                </button>
            </div>
        `, [isStarted])}
    `
}