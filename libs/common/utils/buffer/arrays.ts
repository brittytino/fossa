export function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
    if (arrays.length === 0) {
        return new Uint8Array(0);
    }

    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);

    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }

    return result;
}
