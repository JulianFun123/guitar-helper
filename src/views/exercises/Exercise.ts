import {computed, html, state} from "pulsjs";
import {router} from "../../main.js";
import exercises from "../../data/exercises.js";
import BigButton from "../../components/ui/BigButton.js";
import {GuitarBodyIcon} from "../../components/icons/icons.js";

export function Exercise() {
    const exerciseName = computed(() => router.currentRoute.value.params.name);
    const exercise = computed(() => exercises.find(e => e.name === exerciseName.value));

    const showExercise = state(false)

    const start = () => {
        showExercise.value = true
    }

    return html`
        <div class="p-10 min-h-full flex justify-center items-center w-full">
            <div :if=${() => !showExercise.value} class="border rounded-2xl min-h-full md:grid md:grid-cols-2 max-w-[1200px] relative">
                <img src="/assets/koala/half.svg" class="absolute left-[50%] translate-x-[-50%] translate-y-[-99px]" />

                <div class="space-y-4 p-10 border-b md:border-b-0 md:border-r">
                    <img src=${computed(() => `/assets/exercises/${exercise.value.icon}.svg`)} />
                    <h1 class="text-3xl text-bold">${computed(() => exercise.value.label)}</h1>
                    <p>${computed(() => exercise.value.description)}</p>
                    <div class="flex gap-1 text-lg opacity-60 hover:opacity-100 transition-all">
                        ${exercise.value.features?.map(f => {
                            switch (f) {
                                case "guitar":
                                    return html`
                                        <span class="flex items-center gap-2">
                                            <${GuitarBodyIcon} />
                                            <span class="text-sm">You can use a real guitar to play this</span>
                                        </span>
                                    `
                            }

                            return null
                        })}
                    </div>
                </div>
                <div class="flex flex-col gap-4 justify-center items-center p-10">
                    
                    <${BigButton} label="Start" @click=${start} />
                </div>
            </div>
            <div :else class="w-full">
                ${computed(() => html`<${exercise.value.component} />`)}
            </div>
        </div>
    `
}