import {defineEmits, html} from "pulsjs";

export default function BigButton(props : { label: string, onClick?: () => void }) {
    const emit = defineEmits()

    return html`
        <button @click=${() => emit('click')} class="p-3 px-[6rem] text-lg border border-neutral-300 bg-neutral-100 rounded-xl dark:bg-neutral-800">
            ${props.label}
        </button>
    `
}