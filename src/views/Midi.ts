import {computed, html, state} from "pulsjs";
import {WebMidi} from 'webmidi'
import Notation, {NotationNote} from "../components/Notation.js";
import {NotesType} from "../notes/notes.js";
import {playNote} from "../notes/note-tone.js";
import Piano from "../components/Piano.js";
export function Midi() {
    const notesHit = state<NotationNote[]>([]);
    const isStarted = state(false);
    function onEnabled() {
        if (WebMidi.inputs.length < 1) {
            // document.body.innerHTML+= "No device detected.";
        } else {
            WebMidi.inputs.forEach((device, index) => {
                //document.body.innerHTML+= `${index}: ${device.name} <br>`;
            });
        }

        const mySynth = WebMidi.inputs[0];

        mySynth.channels[1].addListener("noteon", e => {
            console.log(`add ${e.note.name}`)
            notesHit.value = [
                ...notesHit.value,
                {
                    note: `${e.note.name}${e.note.accidental || ''}` as NotesType,
                    octave: e.note.octave
                }
            ]

            playNote('piano', `${e.note.name}${e.note.accidental || ''}` , e.note.octave)
        });

        mySynth.channels[1].addListener("noteoff", e => {
            notesHit.value = notesHit.value.filter((n) => n.note !== e.note.name && n.octave !== e.note.octave)
        })
        isStarted.value = true
    }

    const stop = async () => {
        await WebMidi.disable()
        isStarted.value = false
    }

    return html`
        <div class="p-6 relative h-full w-full flex justify-center items-center flex-col gap-10" @:detached=${() => stop()}>
            ${computed(() => html`
                <div class="flex justify-center">
                    <${Piano} 
                        length=${12 * 5}
                        startingOctave=${1}
                        highlighted=${notesHit.value.map(n => [n.note, n.octave])} 
                    />
                </div>

                <div class="flex flex-col items-center justify-center">
                    <${Notation} height=${190} notes=${[
                        {
                            speed: [4, 4],
                            bpm: 80,
                            notes: [{
                                type: 'note',
                                notes: notesHit.value,
                                length: 1
                            }]
                        }
                    ]} />
                    <${Notation}
                        height=${190}
                        clef="F" 
                        notes=${[
                            {
                                speed: [4, 4],
                                bpm: 80,
                                notes: [{
                                    type: 'note',
                                    notes: notesHit.value,
                                    length: 1
                                }]
                            }
                        ]} 
                    />
                </div>
            `, [notesHit])}
                
            
            ${computed(() => !isStarted.value ? html`
                <div class="w-full h-full left-0 top-0 absolute flex justify-center items-center backdrop-blur-md z-100">
                    <button
                        class="p-3 px-[6rem] text-lg border border-neutral-300 bg-neutral-100 rounded-xl dark:bg-neutral-800"
                        @click=${async () => {
                            WebMidi
                                .enable()
                                .then(onEnabled)
                                .catch(err => alert(err));
                        }}
                    >
                        Start
                    </button>
                </div>
            ` : null)}
        </div>
    `
}