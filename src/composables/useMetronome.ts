import {state, watch} from "jdomjs";

export function useMetronome() {
    let audioContext = new (window.AudioContext || globalThis.webkitAudioContext.webkitAudioContext!)();
    let bpm = state(120); // Default BPM
    let isPlaying = state(false);
    let intervalId = null;
    let audioBuffer = null;

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
    }

    function startMetronome() {
        if (isPlaying.value) return;
        isPlaying.value = true;

        // Ensure audio context is running
        audioContext.resume();

        const intervalMs = (60 / bpm.value) * 1000;

        intervalId = setInterval(() => {
            if (!isPlaying.value) return;
            playClick();
        }, intervalMs);
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

    return {bpm, stopMetronome, startMetronome, isPlaying}
}