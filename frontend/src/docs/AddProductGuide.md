# Add Product Component Guide

## Overview

The AddProduct component provides vendors and sellers with an enhanced product management experience. It includes all the necessary fields for creating a new product along with integrated tax calculation and shipping details.

## Features

1. **Basic Product Information**
   - Product name, description, price, and stock information
   - Category and brand selection
   - SKU (Stock Keeping Unit) management
   - Product tags for better searchability

2. **Tax Integration**
   - Taxable/exempt configuration
   - Tax category selection (food, clothing, electronics, etc.)
   - Tax product code for specific classifications
   - Real-time tax calculation preview

3. **Shipping Details**
   - Weight and dimensional information
   - Shipping class selection (standard, express, etc.)

4. **Advanced Features**
   - Product variants management
   - Specifications management
   - Warranty and return policy information

## Usage

### Accessing the Component

The AddProduct component can be accessed through the following routes:
- For vendors: `/vendor/product/add`
- For sellers: `/seller/product/add`

### Navigation

1. Navigate to the product list page (`/vendor/allproductslist` or `/seller/allproductslist`)
2. Click the "Create Product" button
3. You will be redirected to the AddProduct form

## Form Sections

### 1. Basic Product Information
This section includes all the essential product details:
- Product Name (required)
- SKU (required)
- Price (required)
- Quantity (required)
- Description (required)
- Stock Count (required)
- Brand (required)
- Category (required)

### 2. Tax Settings
Configure tax settings for the product:
- Toggle "Product is taxable" to enable tax calculation
- Toggle "Product is tax exempt" for tax-exempt products
- Select a tax category from the dropdown
- Enter a tax product code if applicable

The tax calculation preview will automatically update as you change the price or tax settings, showing:
- Base price
- Tax amount
- Total price
- Detailed tax breakdown (when expanded)

### 3. Shipping Details
Enter shipping information for the product:
- Weight (in kg)
- Dimensions (length, width, height in cm)
- Shipping class (standard, express, overnight, economy)

### 4. Product Tags
Add tags to help with product discovery:
- Type tags and press Enter to add them
- Click the "x" button to remove tags

### 5. Product Variants
Manage product variants (e.g., different colors, sizes):
- Enter variant details in the input fields
- Click "Add Variant" to add to the list
- Use the edit and delete icons to modify existing variants

### 6. Product Specifications
Add key product specifications:
- Enter a specification key (e.g., "Material")
- Enter a specification value (e.g., "Cotton")
- Click "Add" to add to the list
- Use the edit and delete icons to modify existing specifications

### 7. Additional Information
Add warranty and return policy information:
- Warranty period (e.g., "1 year", "30 days")
- Return policy details

## Validation

The form includes validation for required fields:
- Product Name
- SKU
- Price
- Quantity
- Description
- Stock Count
- Brand
- Category

## Backend Integration

The component integrates with the following backend APIs:
- Product creation API (`/api/products`)
- Tax calculation API (`/api/tax/calculate-advanced`)
- Image upload API (`/api/upload`)

## Technical Details

### State Management
The component uses React state hooks to manage:
- Product information
- Images and media
- Tax settings
- Shipping details
- Variants and specifications

### API Integration
The component uses Redux Toolkit Query (RTK Query) hooks for API integration:
- `useCreateProductMutation` for product creation
- `useUploadProductImageMutation` for image uploads
- `useDeleteProductImageMutation` for image deletion
- `useCalculateAdvancedTaxMutation` for tax calculation
- `useFetchCategoriesQuery` for category data
- `useGetBrandsQuery` for brand data

### Styling
The component uses Material-UI components for a consistent and responsive design:
- Accordions for organizing form sections
- Text fields for data input
- Select dropdowns for category/brand selection
- Buttons for actions
- Chips for tags
- Cards for tax preview

## Error Handling

The component includes error handling for:
- Image upload failures
- Product creation errors
- Tax calculation errors
- Form validation errors

Toast notifications are used to display success and error messages to the user.

## Responsive Design

The component is fully responsive and works on:
- Desktop browsers
- Tablet devices
- Mobile devices

## Accessibility

The component follows accessibility best practices:
- Proper labeling of form elements
- Keyboard navigation support
- Sufficient color contrast
- Semantic HTML structure