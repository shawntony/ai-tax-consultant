/**
 * Date Utils Unit Tests
 * @jest-environment node
 */

import {
  calculateYearsDifference,
  calculateHoldingPeriod,
  calculateResidencePeriod,
  isDateInRange,
  parseDate,
  formatDate,
  getToday
} from '../dateUtils.js'

describe('Date Utils Module', () => {
  describe('calculateYearsDifference', () => {
    test('Should calculate exact years correctly', () => {
      const start = new Date('2020-01-01')
      const end = new Date('2023-01-01')
      expect(calculateYearsDifference(start, end)).toBe(3)
    })

    test('Should calculate partial years correctly', () => {
      const start = new Date('2020-01-01')
      const end = new Date('2023-06-01')
      const years = calculateYearsDifference(start, end)
      expect(years).toBeGreaterThan(3.4)
      expect(years).toBeLessThan(3.5)
    })

    test('Should handle leap years correctly', () => {
      const start = new Date('2020-02-29') // Leap year
      const end = new Date('2024-02-29') // Leap year
      expect(calculateYearsDifference(start, end)).toBe(4)
    })

    test('Should calculate 0 for same dates', () => {
      const date = new Date('2020-01-01')
      expect(calculateYearsDifference(date, date)).toBe(0)
    })

    test('Should throw error if end date is before start date', () => {
      const start = new Date('2023-01-01')
      const end = new Date('2020-01-01')
      expect(() => calculateYearsDifference(start, end)).toThrow('End date must be after start date')
    })

    test('Should throw error for invalid date', () => {
      const start = new Date('invalid')
      const end = new Date('2023-01-01')
      expect(() => calculateYearsDifference(start, end)).toThrow('Invalid date provided')
    })

    test('Should throw error if not Date objects', () => {
      expect(() => calculateYearsDifference('2020-01-01', new Date())).toThrow('Both arguments must be Date objects')
    })
  })

  describe('calculateHoldingPeriod', () => {
    test('Should calculate holding period for standard case', () => {
      const purchase = new Date('2019-01-01')
      const sale = new Date('2024-01-01')
      expect(calculateHoldingPeriod(purchase, sale)).toBe(5)
    })

    test('Should calculate holding period with partial year', () => {
      const purchase = new Date('2020-03-15')
      const sale = new Date('2023-09-20')
      const years = calculateHoldingPeriod(purchase, sale)
      expect(years).toBeGreaterThan(3.5)
      expect(years).toBeLessThan(3.6)
    })
  })

  describe('calculateResidencePeriod', () => {
    test('Should calculate residence period', () => {
      const start = new Date('2019-03-01')
      const end = new Date('2023-12-01')
      const years = calculateResidencePeriod(start, end)
      expect(years).toBeGreaterThan(4.7)
      expect(years).toBeLessThan(4.8)
    })

    test('Should return 0 if no dates provided', () => {
      expect(calculateResidencePeriod(null, null)).toBe(0)
      expect(calculateResidencePeriod(undefined, null)).toBe(0)
    })

    test('Should return 0 if only one date provided', () => {
      expect(calculateResidencePeriod(new Date(), null)).toBe(0)
      expect(calculateResidencePeriod(null, new Date())).toBe(0)
    })
  })

  describe('isDateInRange', () => {
    test('Should return true if date is within range', () => {
      const date = new Date('2023-06-15')
      const start = new Date('2023-01-01')
      const end = new Date('2023-12-31')
      expect(isDateInRange(date, start, end)).toBe(true)
    })

    test('Should return true if date equals start', () => {
      const date = new Date('2023-01-01')
      const start = new Date('2023-01-01')
      const end = new Date('2023-12-31')
      expect(isDateInRange(date, start, end)).toBe(true)
    })

    test('Should return true if date equals end', () => {
      const date = new Date('2023-12-31')
      const start = new Date('2023-01-01')
      const end = new Date('2023-12-31')
      expect(isDateInRange(date, start, end)).toBe(true)
    })

    test('Should return false if date is before range', () => {
      const date = new Date('2022-12-31')
      const start = new Date('2023-01-01')
      const end = new Date('2023-12-31')
      expect(isDateInRange(date, start, end)).toBe(false)
    })

    test('Should return false if date is after range', () => {
      const date = new Date('2024-01-01')
      const start = new Date('2023-01-01')
      const end = new Date('2023-12-31')
      expect(isDateInRange(date, start, end)).toBe(false)
    })

    test('Should throw error if not Date objects', () => {
      expect(() => isDateInRange('2023-06-15', new Date(), new Date())).toThrow('All arguments must be Date objects')
    })
  })

  describe('parseDate', () => {
    test('Should return Date object if input is already Date', () => {
      const date = new Date('2023-01-01')
      expect(parseDate(date)).toBe(date)
    })

    test('Should parse valid date string', () => {
      const result = parseDate('2023-01-01')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(1)
    })

    test('Should parse ISO date string', () => {
      const result = parseDate('2023-06-15T10:30:00Z')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(5) // June
    })

    test('Should throw error for invalid date string', () => {
      expect(() => parseDate('invalid-date')).toThrow('Invalid date string')
    })

    test('Should throw error for non-string, non-Date input', () => {
      expect(() => parseDate(123)).toThrow('Date input must be a Date object or valid date string')
    })
  })

  describe('formatDate', () => {
    test('Should format date as YYYY-MM-DD', () => {
      const date = new Date('2023-01-05')
      expect(formatDate(date)).toBe('2023-01-05')
    })

    test('Should pad single-digit month and day', () => {
      const date = new Date('2023-03-09')
      expect(formatDate(date)).toBe('2023-03-09')
    })

    test('Should throw error if not Date object', () => {
      expect(() => formatDate('2023-01-01')).toThrow('Argument must be a Date object')
    })
  })

  describe('getToday', () => {
    test('Should return today at midnight', () => {
      const today = getToday()
      expect(today).toBeInstanceOf(Date)
      expect(today.getHours()).toBe(0)
      expect(today.getMinutes()).toBe(0)
      expect(today.getSeconds()).toBe(0)
      expect(today.getMilliseconds()).toBe(0)
    })
  })
})
