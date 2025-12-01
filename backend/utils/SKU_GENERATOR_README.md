# SKU Generator Utility

This utility provides a standardized way to generate SKUs (Stock Keeping Units) for products in the e-commerce platform.

## SKU Structure

The SKU follows this structure:
```
BRANDCODE-CATEGORYCODE-UNIQUEID-COLORCODE-SIZECODE-VARIANTCODE(optional)
```

## Components

- **Brand Code**: First 3 alphanumeric characters of the brand name (uppercase)
- **Category Code**: First 3 alphanumeric characters of the category name (uppercase)
- **Unique ID**: Last 4 digits of the current timestamp
- **Color Code**: First 3 alphanumeric characters of the color name (uppercase)
- **Size Code**: Full size label (S, M, L, XL, 06, 07, etc.)
- **Variant Code**: First 3 alphanumeric characters (only if the variant exists)

## Installation

The SKU generator is already part of the project utilities. No additional installation is required.

## Usage

### Import the Generator

```javascript
import { generateSKU } from './utils/skuGenerator.js';
```

### Generate a SKU

```javascript
const product = {
  brand: 'Nike',
  category: 'Shoes',
  color: 'Black',
  size: 'M'
};

const sku = generateSKU(product);
console.log(sku); // Output: NIK-SHO-XXXX-BLA-M (where XXXX is the unique ID)
```

### With Variant

```javascript
const product = {
  brand: 'Adidas',
  category: 'Shirt',
  color: 'Red',
  size: 'L',
  variant: 'Limited Edition'
};

const sku = generateSKU(product);
console.log(sku); // Output: ADI-SHI-XXXX-RED-L-LIM (where XXXX is the unique ID)
```

## Individual Component Functions

You can also use individual functions to generate specific components:

```javascript
import {
  generateBrandCode,
  generateCategoryCode,
  generateColorCode,
  generateSizeCode,
  generateVariantCode,
  generateUniqueID
} from './utils/skuGenerator.js';

console.log(generateBrandCode('Apple')); // APP
console.log(generateCategoryCode('Electronics')); // ELE
console.log(generateColorCode('Silver')); // SIL
console.log(generateSizeCode('XL')); // XL
console.log(generateVariantCode('Special')); // SPE
console.log(generateUniqueID()); // XXXX (4-digit timestamp)
```

## Integration Example

To integrate the SKU generator into your product creation workflow:

```javascript
import { generateSKU } from './utils/skuGenerator.js';

const createProductWithSKU = (productData) => {
  const { brand, category, color, size, variant } = productData;
  const sku = generateSKU({ brand, category, color, size, variant });
  
  return {
    ...productData,
    sku
  };
};
```

## Example Outputs

1. Basic product: `NIK-SHO-6438-BLA-M`
2. Product with variant: `ADI-SHI-6438-RED-L-LIM`
3. Product with special characters: `LEV-JEA-6439-DAR-32WX34L`
4. Product with numeric codes: `SAM-PHO-6439-MID-61-5GX`

## Notes

- All text is automatically converted to uppercase
- Special characters are removed from codes
- If a component is missing, defaults are used:
  - Brand/Category/Color: 'XXX'
  - Size: 'OS' (One Size)
  - Variant: Not included in SKU
- Unique ID ensures each SKU is unique even for identical products