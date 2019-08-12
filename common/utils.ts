// tslint:disable: no-bitwise
export function deserializeRGB(value: number) {
    const red = (value >> 16) & 0xFF;
    const green = (value >> 8) & 0xFF;
    const blue = value & 0xFF;

    return [red, green, blue];
}

export function serializeRGB(red: number, green: number, blue: number) {
    let value = 0;
    value += (red * 65536) + (green * 256) + blue;

    return value;
}
