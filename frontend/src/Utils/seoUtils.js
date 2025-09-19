/**
 * Generate meta tags for SEO
 * @param {Object} options - SEO options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.url - Page URL
 * @param {string} options.image - Social media image URL
 * @param {string} options.type - Open Graph type
 * @param {string} options.siteName - Site name
 * @returns {Array} Array of meta tag objects
 */
export const generateMetaTags = ({
  title,
  description,
  url,
  image,
  type = 'website',
  siteName = 'Nexus Mart'
}) => {
  return [
    // Basic meta tags
    { name: 'title', content: title },
    { name: 'description', content: description },
    
    // Open Graph / Facebook
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:site_name', content: siteName },
    
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: url },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];
};

/**
 * Update document title
 * @param {string} title - New document title
 */
export const updateDocumentTitle = (title) => {
  if (typeof document !== 'undefined') {
    document.title = title;
  }
};

/**
 * Update meta description
 * @param {string} description - New meta description
 */
export const updateMetaDescription = (description) => {
  if (typeof document !== 'undefined') {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
  }
};

/**
 * Generate breadcrumb structured data
 * @param {Array} breadcrumbs - Array of breadcrumb objects {name, url}
 * @returns {Object} Structured data object
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': breadcrumb.name,
      'item': breadcrumb.url
    }))
  };
};

/**
 * Generate product structured data
 * @param {Object} product - Product object
 * @returns {Object} Structured data object
 */
export const generateProductSchema = (product) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': product.media?.map(m => m.url) || [],
    'description': product.description,
    'sku': product.sku,
    'brand': {
      '@type': 'Brand',
      'name': product.brand?.name
    },
    'offers': {
      '@type': 'Offer',
      'url': `${window.location.origin}/product/${product._id}`,
      'priceCurrency': 'USD',
      'price': product.price,
      'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.countInStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Nexus Mart'
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.rating,
      'reviewCount': product.numReviews
    }
  };
};

export default {
  generateMetaTags,
  updateDocumentTitle,
  updateMetaDescription,
  generateBreadcrumbSchema,
  generateProductSchema
};