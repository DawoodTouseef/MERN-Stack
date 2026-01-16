
/**
 * Utility functions for Order processing
 */

/**
 * Calculate the platform fee for a given sub-order amount.
 * @param {number} subOrderAmount - The sub-total of the items in the order
 * @param {number} percentage - The platform fee percentage (default 10)
 * @returns {number} The calculated fee
 */
export const calculatePlatformFee = (subOrderAmount, percentage = 10) => {
    return (subOrderAmount * percentage) / 100;
};

/**
 * Distribute global tax and shipping costs proportionally to a sub-order.
 * @param {number} subItemTotal - Total price of items in this sub-order
 * @param {number} grandItemTotal - Total price of items in the entire parent order
 * @param {number} totalTax - Total tax for the parent order
 * @param {number} totalShipping - Total shipping for the parent order
 * @returns {object} { allocatedTax, allocatedShipping }
 */
export const distributeTaxAndShipping = (subItemTotal, grandItemTotal, totalTax, totalShipping) => {
    if (grandItemTotal === 0) return { allocatedTax: 0, allocatedShipping: 0 };

    // Calculate ratio
    const ratio = subItemTotal / grandItemTotal;

    // Allocate
    const allocatedTax = totalTax * ratio;
    const allocatedShipping = totalShipping * ratio;

    return {
        allocatedTax,
        allocatedShipping
    };
};
