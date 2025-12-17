import {html} from "pulsjs";
import {router} from "../../main.js";
import exercises, {Exercise} from "../../data/exercises.js";

export function ExerciseCard(props: Exercise) {
    return html`
        <${router.link} to=${{name: 'exercise', params: {name: props.name}}}>
            <span  class="border flex flex-col items-center justify-center p-5 gap-3 rounded-xl border-b-4 relative">
                <div class="absolute top-2 left-2 flex gap-0.5">
                    ${[1,2,3,4].map((n) => html`<div class=${`size-2.5 border rounded-full ${props.difficulty >= n ? 'bg-black dark:bg-white' : ''}`} />`)}
                </div>

                <img src=${`/assets/exercises/${props.icon}.svg`} />
                <span class="text-center">${props.label}</span>
            </span>
        </${router.link}>
    `
}

export function Exercises() {
    return html`
        <div class="w-full max-w-[1200px] mx-auto p-10 space-y-10">
            <div class="dark:bg-neutral-500/20 border border-neutral-500/30 p-7 flex justify-between items-center rounded-2xl">
                <h1 class="text-4xl font-bold ">Exercises with Koala</h1>
                
                <img src="/assets/koala/withguitar.svg" />
            </div>
            
            <div class="grid grid-cols-4 gap-3">
                ${exercises.map(e => html`<${ExerciseCard} label=${e.label} icon=${e.icon} difficulty=${e.difficulty} name=${e.name} />`)}
            </div>
        </div>
    `
}