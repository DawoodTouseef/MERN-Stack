/**
 * Safely parses a value into a number and performs basic arithmetic.
 * Ensures that prices are handled consistently as floats.
 */
export const parsePrice = (value) => {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculates total price for order items.
 */
export const calculateItemsTotal = (items) => {
    return items.reduce((acc, item) => acc + parsePrice(item.price) * (item.qty || 1), 0);
};
