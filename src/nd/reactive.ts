

export function createSignal<T>(value: T): [() => T, (nextValue: T) => void] {
    const read = () => value;
    const write = (nextValue: T) => value = nextValue;
    return [read, write];
}