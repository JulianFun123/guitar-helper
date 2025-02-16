import {state, watch} from "pulsjs";

export function useMetronome() {
    let audioContext = new (window.AudioContext || globalThis.webkitAudioContext.webkitAudioContext!)();
    let bpm = state(120); // Default BPM
    let isPlaying = state(false);
    let intervalId = null;
    let audioBuffer = null;


    const listeners = {
        click: []
    }

    const addListener = (event: string, callback: Function) => {
        listeners[event].push(callback)
    }

    async function loadSound() {
        if (!audioBuffer) {
            const response = await fetch("/samples/metronome.mp3");
            const arrayBuffer = await response.arrayBuffer();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        }
    }

    async function playClick() {
        if (!audioBuffer) await loadSound();
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        listeners.click.forEach((cb: Function) => cb())
    }

    function startMetronome() {
        if (isPlaying.value) return;
        isPlaying.value = true;

        // Ensure audio context is running
        audioContext.resume();


        let bpmValue = Number(bpm.value);
        if (bpmValue === 0) {
            bpmValue = 1
        }
        if (bpmValue > 1000) {
            bpmValue = 1000
        }

        const intervalMs = (60 / bpmValue) * 1000;

        intervalId = setInterval(() => {
            if (!isPlaying.value) return;
            playClick();
        }, intervalMs);
        showGlobalMetronome.value = true
    }

    function stopMetronome() {
        isPlaying.value = false;
        clearInterval(intervalId);
        intervalId = null;
    }

    watch([bpm], () => {
        if (isPlaying.value) {
            stopMetronome()
            startMetronome();
        }
    });

    return {bpm, stopMetronome, startMetronome, isPlaying, addListener}
}

export const showGlobalMetronome = state(false)
export const globalMetronome = useMetronome()