import * as Tone from "tone";
import {SampleLibrary} from "../Tonejs-Instruments.js";
import {Time} from "tone/build/esm/core/type/Units.js";

const synth = new Tone.Synth().toDestination();

const samples = SampleLibrary.load({
    instruments: ['piano', 'guitar-acoustic'],
    baseUrl: "samples/"
})
export function playNote(sound: string, note: string, octave: number, time: Time = '8n', velocity?) {
    samples[sound].release = .5;
    samples[sound].toDestination();
    samples[sound].triggerAttackRelease(`${note}${octave}`, time, velocity)
}