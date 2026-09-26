import { DeepPartial } from 'typeorm';

function isObject(item: unknown): item is Record<string, unknown> {
    return item && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge<T extends object>(...objects: T[]): T {
    if (objects.length === 0) {
        return {} as T;
    }

    const result: any = {};

    for (const source of objects) {
        if (!isObject(source)) {
            continue;
        }

        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const sourceValue = (source as any)[key];
                const resultValue = result[key];

                if (sourceValue === undefined || sourceValue === null) {
                    continue;
                } else if (isObject(resultValue) && isObject(sourceValue)) {
                    result[key] = deepMerge(resultValue, sourceValue);
                } else {
                    result[key] = sourceValue;
                }
            }
        }
    }

    return result as T;
}

export function deepDifference<T extends object>(
    base: T,
    target: DeepPartial<T>,
): DeepPartial<T> {
    const result = {} as DeepPartial<T>;

    if (!isObject(target)) {
        return {} as DeepPartial<T>;
    }

    for (const key in target) {
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
            continue;
        }

        const baseValue = base[key as keyof T];
        const targetValue = target[key as keyof DeepPartial<T>];

        if (Array.isArray(targetValue)) {
            if (JSON.stringify(baseValue) !== JSON.stringify(targetValue)) {
                result[key as string] = targetValue;
            }
        } else if (isObject(targetValue) && isObject(baseValue)) {
            const nestedDiff = deepDifference(
                baseValue as object,
                targetValue as object,
            );
            if (Object.keys(nestedDiff).length > 0) {
                result[key as keyof DeepPartial<T>] = nestedDiff as any;
            }
        } else if (baseValue !== targetValue) {
            result[key as string] = targetValue;
        }
    }
    return result;
}

const CIRCULAR_REFERENCE_PLACEHOLDER = '[Circular]';

export function deepSort<T>(obj: T, seen = new WeakSet<object>()): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (seen.has(obj as object)) {
        return CIRCULAR_REFERENCE_PLACEHOLDER as unknown as T;
    }

    seen.add(obj as object);

    try {
        if (Array.isArray(obj)) {
            return obj
                .filter((item) => item !== undefined)
                .map((item) => deepSort(item, seen)) as unknown as T;
        }

        const sortedKeys = Object.keys(obj as object).sort();
        const result: any = {};
        for (const key of sortedKeys) {
            const value = (obj as any)[key];
            if (value !== undefined) {
                result[key] = deepSort(value, seen);
            }
        }
        return result;
    } finally {
        seen.delete(obj as object);
    }
}
