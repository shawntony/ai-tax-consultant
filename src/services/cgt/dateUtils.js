/**
 * Date Utilities for Capital Gains Tax Calculations
 * @module services/cgt/dateUtils
 * @version 1.0.0
 */

/**
 * Calculate the difference between two dates in years (decimal)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Years difference (decimal)
 */
export function calculateYearsDifference(startDate, endDate) {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw new Error('Both arguments must be Date objects')
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date provided')
  }

  if (endDate < startDate) {
    throw new Error('End date must be after start date')
  }

  // Calculate years using full year difference plus fractional year
  const yearsDiff = endDate.getFullYear() - startDate.getFullYear()

  // Create a date one year after start to check if we've passed the anniversary
  const anniversaryDate = new Date(startDate)
  anniversaryDate.setFullYear(anniversaryDate.getFullYear() + yearsDiff)

  // If we haven't reached the anniversary yet, subtract 1 from years
  let adjustedYears = yearsDiff
  if (anniversaryDate > endDate) {
    adjustedYears = yearsDiff - 1
    anniversaryDate.setFullYear(anniversaryDate.getFullYear() - 1)
  }

  // Calculate the fractional year based on remaining days
  const remainingMs = endDate.getTime() - anniversaryDate.getTime()
  const nextAnniversary = new Date(anniversaryDate)
  nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1)
  const yearMs = nextAnniversary.getTime() - anniversaryDate.getTime()
  const fractionalYear = remainingMs / yearMs

  return adjustedYears + fractionalYear
}

/**
 * Calculate holding period in years
 * @param {Date} purchaseDate - Property purchase date
 * @param {Date} saleDate - Property sale date
 * @returns {number} Holding period in years
 */
export function calculateHoldingPeriod(purchaseDate, saleDate) {
  return calculateYearsDifference(purchaseDate, saleDate)
}

/**
 * Calculate residence period in years
 * @param {Date} residenceStartDate - Residence start date
 * @param {Date} residenceEndDate - Residence end date
 * @returns {number} Residence period in years
 */
export function calculateResidencePeriod(residenceStartDate, residenceEndDate) {
  if (!residenceStartDate || !residenceEndDate) {
    return 0
  }

  return calculateYearsDifference(residenceStartDate, residenceEndDate)
}

/**
 * Check if a date is within a range
 * @param {Date} date - Date to check
 * @param {Date} startDate - Range start date
 * @param {Date} endDate - Range end date
 * @returns {boolean} Whether date is within range
 */
export function isDateInRange(date, startDate, endDate) {
  if (!(date instanceof Date) || !(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw new Error('All arguments must be Date objects')
  }

  return date >= startDate && date <= endDate
}

/**
 * Parse date string to Date object
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {Date} Parsed date
 */
export function parseDate(dateInput) {
  if (dateInput instanceof Date) {
    return dateInput
  }

  if (typeof dateInput === 'string') {
    const parsed = new Date(dateInput)
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date string: ${dateInput}`)
    }
    return parsed
  }

  throw new Error('Date input must be a Date object or valid date string')
}

/**
 * Get today's date at midnight (00:00:00)
 * @returns {Date} Today's date
 */
export function getToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!(date instanceof Date)) {
    throw new Error('Argument must be a Date object')
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
