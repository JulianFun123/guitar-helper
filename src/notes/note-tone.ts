import * as Tone from "tone";
import {SampleLibrary} from "../Tonejs-Instruments.js";
import {Time} from "tone/build/esm/core/type/Units.js";
import {createDeferred} from "../utils/deferred.js";

const synth = new Tone.Synth().toDestination();

let samples;
export async function playNote(sound: string, note: string, octave: number, time: Time = '8n', velocity?) {
    if (!samples) {

        const deferred = createDeferred()

        SampleLibrary.onload = () => {
            setTimeout(() => {
                deferred.resolve()
            }, 50)
        }

        samples = SampleLibrary.load({
            instruments: ['piano', 'guitar-acoustic'],
            baseUrl: "samples/",
            minify: true
        })

        await deferred.promise
    }

    samples[sound].release = .5;
    samples[sound].toDestination();
    samples[sound].triggerAttackRelease(`${note}${octave}`, time, velocity)
}