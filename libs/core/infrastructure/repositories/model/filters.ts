/**
 * Creates nested conditions based on a prefix and a filter object.
 * Recursively handles deeply nested objects.
 *
 * @param {string} prefix - The prefix to use for creating the nested conditions.
 * @param {Partial<T>} filterObject - The filter object used to create the conditions.
 * @return {Record<string, any>} The nested conditions created based on the prefix and filter object.
 */
const createNestedConditions = <T>(
    prefix: string,
    filterObject?: Partial<T>,
): Record<string, any> => {
    if (!filterObject) {
        return {};
    }

    const conditions: Record<string, any> = {};

    Object.keys(filterObject).forEach((key) => {
        const value = filterObject[key];
        const currentPath = `${prefix}.${key}`;

        if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            value.constructor === Object
        ) {
            // Recursively handle nested objects
            const nestedConditions = createNestedConditions(currentPath, value);
            Object.assign(conditions, nestedConditions);
        } else {
            // For primitive values, create direct condition
            conditions[currentPath] = value;
        }
    });

    return conditions;
};

export { createNestedConditions };
