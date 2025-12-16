export type Deferred<T = void> = {
    promise: Promise<T>;
    resolve: (r: T) => void;
    reject: (reason?: any) => void;
};
export function createDeferred<T = void>() {
    let out = {} as Deferred<T>;
    out.promise = new Promise<T>((res, rej) => {
        out.resolve = res;
        out.reject = rej;
    });
    return out;
}
