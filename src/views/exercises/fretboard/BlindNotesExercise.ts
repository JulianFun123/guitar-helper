import {computed, html, onMounted, onUnmounted, state} from "pulsjs";
import {tuning} from "../../../main.js";
import Fretboard from "../../../components/Fretboard.js";
import {NOTES} from "../../../notes/notes.js";
import {useTuner} from "../../../composables/useTuner.js";
import BigButton from "../../../components/ui/BigButton.js";
import {useInterval} from "../../../composables/useInterval.js";

export default function BlindNotesExercise() {

    const note = state('')

    const isWrong = state(false)

    const selectRandomNote = () => {
        note.value = NOTES[ Math.floor(Math.random() * NOTES.length)]
    }


    const {
        noteHistory,
        selectedNote,
        isStarted,
        note: tunerGuitar,
        stop,
        init,
    } = useTuner()

    useInterval(() => {
        if (!isStarted.value) return;

        console.log('tunerGuitar', tunerGuitar.value.name)
        onNoteClick({
            note: tunerGuitar.value.name,
           // octave: tunerGuitar.value.octave
        })
    }, 250)

    onMounted(() => {
        selectRandomNote()
    })

    onUnmounted(() => {
        stop()
    })

    const onNoteClick = (n: {note: string}) => {
        if (n.note === note.value) {
            selectRandomNote()
            isWrong.value = false
        } else {
            isWrong.value = true
        }
    }

    return html`
        <div class="flex flex-col gap-10 w-full">
            
            <div class="flex justify-center">
                <div class=${computed(() => `border p-5 px-10 rounded-3xl transition-all ${isWrong.value && !isStarted.value ? 'animate-[bounce_1s_0.5] text-red-500 border-red-500' : ''}`)}>
                    <span class="text-5xl">${note}</span>
                </div>
            </div>
            
            <div class="overflow-auto max-w-full px-2">
                ${computed(() => html`
                    <${Fretboard} 
                        baseNotes=${tuning.value.split(',').map(r => r.trim())}
                        hideNoteNames
                        onNoteClick=${onNoteClick}
                    />
                `, [tuning])}
            </div>
            
            <${BigButton} label="Use Microphone for Guitar" @click=${init} />
        </div>
    `;
}