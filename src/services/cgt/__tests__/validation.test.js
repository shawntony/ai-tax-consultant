/**
 * Validation Module Unit Tests
 * @jest-environment node
 */

import { validateCalculationInput, sanitizeInput } from '../validation.js'

describe('Validation Module', () => {
  describe('validateCalculationInput', () => {
    const validInput = {
      salePrice: 800000000,
      purchasePrice: 500000000,
      necessaryExpenses: 30000000,
      homeCount: 1,
      householdHomeCount: 1,
      purchaseDate: '2020-01-01',
      saleDate: '2024-01-01'
    }

    test('Should validate correct input successfully', () => {
      const result = validateCalculationInput(validInput)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('Should reject invalid sale price', () => {
      const input = { ...validInput, salePrice: -100 }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('salePrice')
    })

    test('Should reject non-number sale price', () => {
      const input = { ...validInput, salePrice: 'invalid' }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'salePrice')).toBe(true)
    })

    test('Should reject invalid purchase price', () => {
      const input = { ...validInput, purchasePrice: -100 }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'purchasePrice')).toBe(true)
    })

    test('Should allow capital loss (purchase price > sale price)', () => {
      const input = { ...validInput, purchasePrice: 900000000, salePrice: 600000000 }
      const result = validateCalculationInput(input)
      // Capital loss should be allowed now
      const hasLossError = result.errors.some(e => e.code === 'CALC_TAX_LOGIC_ERROR')
      expect(hasLossError).toBe(false)
    })

    test('Should reject negative necessary expenses', () => {
      const input = { ...validInput, necessaryExpenses: -100 }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'necessaryExpenses')).toBe(true)
    })

    test('Should reject invalid home count', () => {
      const input = { ...validInput, homeCount: 0 }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'homeCount')).toBe(true)
    })

    test('Should reject non-integer home count', () => {
      const input = { ...validInput, homeCount: 1.5 }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'homeCount')).toBe(true)
    })

    test('Should reject sale date before purchase date', () => {
      const input = { ...validInput, purchaseDate: '2024-01-01', saleDate: '2020-01-01' }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'saleDate')).toBe(true)
    })

    test('Should reject invalid date format', () => {
      const input = { ...validInput, purchaseDate: 'invalid-date' }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'dates')).toBe(true)
    })

    test('Should validate residence dates if provided', () => {
      const input = {
        ...validInput,
        residenceStartDate: '2020-03-01',
        residenceEndDate: '2023-12-01'
      }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(true)
    })

    test('Should reject residence end before residence start', () => {
      const input = {
        ...validInput,
        residenceStartDate: '2023-01-01',
        residenceEndDate: '2020-01-01'
      }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'residenceEndDate')).toBe(true)
    })

    test('Should reject residence start before purchase date', () => {
      const input = {
        ...validInput,
        purchaseDate: '2020-01-01',
        residenceStartDate: '2019-01-01',
        residenceEndDate: '2023-01-01'
      }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'residenceStartDate')).toBe(true)
    })

    test('Should reject residence end after sale date', () => {
      const input = {
        ...validInput,
        saleDate: '2024-01-01',
        residenceStartDate: '2020-03-01',
        residenceEndDate: '2025-01-01'
      }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'residenceEndDate')).toBe(true)
    })

    test('Should collect multiple errors', () => {
      const input = {
        salePrice: -100,
        purchasePrice: -200,
        necessaryExpenses: -50,
        homeCount: 0,
        householdHomeCount: 0,
        purchaseDate: '2024-01-01',
        saleDate: '2020-01-01'
      }
      const result = validateCalculationInput(input)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(3)
    })
  })

  describe('sanitizeInput', () => {
    test('Should sanitize and convert types correctly', () => {
      const input = {
        salePrice: 800000000,
        purchasePrice: 500000000,
        necessaryExpenses: 30000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2020-01-01',
        saleDate: '2024-01-01'
      }
      const result = sanitizeInput(input)
      expect(typeof result.salePrice).toBe('number')
      expect(typeof result.purchasePrice).toBe('number')
      expect(typeof result.necessaryExpenses).toBe('number')
      expect(typeof result.homeCount).toBe('number')
      expect(result.purchaseDate).toBeInstanceOf(Date)
      expect(result.saleDate).toBeInstanceOf(Date)
    })

    test('Should handle optional residence dates', () => {
      const input = {
        salePrice: 800000000,
        purchasePrice: 500000000,
        necessaryExpenses: 30000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2020-01-01',
        saleDate: '2024-01-01',
        residenceStartDate: '2020-03-01',
        residenceEndDate: '2023-12-01'
      }
      const result = sanitizeInput(input)
      expect(result.residenceStartDate).toBeInstanceOf(Date)
      expect(result.residenceEndDate).toBeInstanceOf(Date)
    })

    test('Should set null for missing residence dates', () => {
      const input = {
        salePrice: 800000000,
        purchasePrice: 500000000,
        necessaryExpenses: 30000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2020-01-01',
        saleDate: '2024-01-01'
      }
      const result = sanitizeInput(input)
      expect(result.residenceStartDate).toBeNull()
      expect(result.residenceEndDate).toBeNull()
    })

    test('Should throw error for invalid input', () => {
      const input = {
        salePrice: -100,
        purchasePrice: 500000000,
        necessaryExpenses: 30000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2020-01-01',
        saleDate: '2024-01-01'
      }
      expect(() => sanitizeInput(input)).toThrow('입력 검증 실패')
    })

    test('Should handle location object', () => {
      const input = {
        salePrice: 800000000,
        purchasePrice: 500000000,
        necessaryExpenses: 30000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2020-01-01',
        saleDate: '2024-01-01',
        location: { city: '서울특별시', district: '강남구' }
      }
      const result = sanitizeInput(input)
      expect(result.location).toEqual({ city: '서울특별시', district: '강남구' })
    })

    test('Should set null for missing location', () => {
      const input = {
        salePrice: 800000000,
        purchasePrice: 500000000,
        necessaryExpenses: 30000000,
        homeCount: 1,
        householdHomeCount: 1,
        purchaseDate: '2020-01-01',
        saleDate: '2024-01-01'
      }
      const result = sanitizeInput(input)
      expect(result.location).toBeNull()
    })
  })
})
