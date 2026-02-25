/**
 * Prepare query parameters from request query
 * This function extracts filters and options from query object
 */
/**
 * Prepare query parameters from request query
 * This function extracts filters and options from query object.
 * It supports flattened parameters (e.g., ?search=abc) which is the preferred way.
 * Parameters mapping: 
 * - Standard options: page, limit, sort, sort_by, sort_order, format
 * - Everything else is treated as a filter
 */
export function prepareQuery(query: any = {}): { filter: any; options: any } {
  if (!query || typeof query !== 'object') {
    return { filter: {}, options: {} };
  }

  // 1. Destructure standard options
  const {
    page,
    limit,
    sort,
    sort_by,
    sort_order,
    sortBy,
    sortOrder,
    format,
    filters, // Backward compatibility for filters[key]
    filter: nestedFilter, // Common naming convention
    options, // Backward compatibility for options[key]
    maxLimit,
    skipCount,
    ...flatFilters
  } = query;

  // 2. Build options
  const rootOptions: any = {};
  if (page !== undefined) rootOptions.page = Number(page);
  if (limit !== undefined) rootOptions.limit = Number(limit);
  if (sort !== undefined) rootOptions.sort = sort;
  if (format !== undefined) rootOptions.format = format;
  if (maxLimit !== undefined) rootOptions.maxLimit = Number(maxLimit);
  if (skipCount !== undefined) rootOptions.skipCount = skipCount === 'true' || skipCount === true;

  // Handle sort_by/sort_order or sortBy/sortOrder (backward compatibility)
  const finalSortBy = sort_by || sortBy;
  const finalSortOrder = sort_order || sortOrder || 'DESC';
  if (finalSortBy && !sort) {
    const order = finalSortOrder.toUpperCase();
    rootOptions.sort = `${finalSortBy}:${order}`;
  }

  // Merge explicitly passed options if any
  const finalOptions = { ...rootOptions, ...(options || {}) };

  // 3. Build filters
  // Priority: flat filters (preferred) merged with explicitly passed filters (singular or plural)
  const finalFilters = { ...flatFilters, ...(filters || {}), ...(nestedFilter || {}) };

  // Note: renamed 'filters' to 'filter' to match IPaginationOptions.filter
  return { filter: finalFilters, options: finalOptions };
}

