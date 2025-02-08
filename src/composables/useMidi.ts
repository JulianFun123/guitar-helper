export function useMidi() {
    let midi = null; // global MIDIAccess object
    function onMIDISuccess(midiAccess) {
        console.log("MIDI ready!");
        midi = midiAccess; // store in the global (in real usage, would probably keep in an object instance)
    }

    function onMIDIFailure(msg) {
        console.error(`Failed to get MIDI access - ${msg}`);
    }

    function listInputsAndOutputs() {
        for (const entry of midi.inputs) {
            const input = entry[1];
            console.log(
                `Input port [type:'${input.type}']` +
                ` id:'${input.id}'` +
                ` manufacturer:'${input.manufacturer}'` +
                ` name:'${input.name}'` +
                ` version:'${input.version}'`,
            );
        }

        for (const entry of midi.outputs) {
            const output = entry[1];
            console.log(
                `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
            );
        }
    }

    async function start() {
        try {
            const m = await navigator.requestMIDIAccess();
            onMIDISuccess(m)
        } catch (e) {
            onMIDIFailure(e)
        }
    }

    function onMIDIMessage(event) {
        let str = `MIDI message received at timestamp ${event} bytes]: `;
        for (const character of event.data) {
            str += `0x${character.toString(16)} `;
        }
        console.log(str, event);

    }

    function startLoggingMIDIInput() {
        midi.inputs.forEach((entry) => {
            entry.onmidimessage = onMIDIMessage;
        });
    }

    return {startLoggingMIDIInput, start, listInputsAndOutputs};
}