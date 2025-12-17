import {onMounted, onUnmount} from "pulsjs";

export function useInterval(callback: () => void, delay: number) {
    let intervalId: number | null = null;


    onMounted(() => {
        intervalId = setInterval(callback, delay) as unknown as number;
    })

    onUnmount(() => {
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
    })
}