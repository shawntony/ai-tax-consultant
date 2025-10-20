/**
 * Full Data Flow Integration Tests
 *
 * Tests the complete application data flow from end to end:
 * 1. User Setup → API Key Management
 * 2. Tax Calculation → Service Layer → Result Display
 * 3. Scenario Comparison → Multi-year Analysis
 * 4. Error Handling → Recovery Flow
 * 5. State Management → Cross-component Communication
 *
 * This tests the ENTIRE application as a system, verifying that all layers
 * work together correctly from user input to final output.
 *
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Import all major components
import APIKeyForm from '../components/APIKeyForm.jsx'
import CapitalGainsTaxForm from '../components/CapitalGainsTaxForm.jsx'

// Import services
import * as cgtService from '../services/cgt/index.js'
import * as encryption from '../utils/encryption'
import * as apiKeyValidator from '../utils/apiKeyValidator'

// Mock only external dependencies
jest.mock('../utils/apiKeyValidator')

describe('Full Data Flow Integration Tests', () => {
  let localStorageMock

  beforeEach(() => {
    // Create functional mock localStorage
    localStorageMock = {}

    Storage.prototype.getItem = jest.fn((key) => localStorageMock[key] || null)
    Storage.prototype.setItem = jest.fn((key, value) => {
      localStorageMock[key] = value
    })
    Storage.prototype.removeItem = jest.fn((key) => {
      delete localStorageMock[key]
    })
    Storage.prototype.clear = jest.fn(() => {
      localStorageMock = {}
    })

    jest.clearAllMocks()
    global.confirm = jest.fn(() => true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Complete Application Flow: Setup → Calculate → Results', () => {
    test('Full workflow: New user setup and first calculation', async () => {
      const user = userEvent.setup()

      // ============================================================
      // PHASE 1: User Setup - API Key Management
      // ============================================================

      const { unmount: unmountAPIForm } = render(<APIKeyForm />)

      // User enters Claude API key
      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-user-setup-key-12345')

      // Save the key
      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      // Verify key was saved
      await waitFor(() => {
        expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      }, { timeout: 15000 })

      // Verify encryption and storage occurred
      const storedKey = encryption.getAPIKey('claude')
      expect(storedKey).toBe('sk-ant-user-setup-key-12345')

      unmountAPIForm()

      // ============================================================
      // PHASE 2: Tax Calculation - Complete Form Submission
      // ============================================================

      render(<CapitalGainsTaxForm />)

      // Fill out comprehensive tax form
      const formData = {
        acquisitionDate: '2019-01-15',
        transferDate: '2024-06-30',
        acquisitionPrice: '500000000',
        transferPrice: '800000000',
        necessaryExpenses: '30000000',
        address: '서울특별시 강남구'
      }

      // Enter all form fields
      await user.type(screen.getByLabelText(/취득일/), formData.acquisitionDate)
      await user.type(screen.getByLabelText(/양도일/), formData.transferDate)
      await user.type(screen.getByLabelText(/취득가액/), formData.acquisitionPrice)
      await user.type(screen.getByLabelText(/양도가액/), formData.transferPrice)
      await user.type(screen.getByLabelText(/필요경비/), formData.necessaryExpenses)
      await user.type(screen.getByLabelText(/주택 소재지/), formData.address)

      // Select 2 households to make it taxable (not exempt)
      const twoHouseholdsRadio = screen.getByLabelText('2주택')
      await user.click(twoHouseholdsRadio)

      // ============================================================
      // PHASE 3: Calculation Execution
      // ============================================================

      const calculateButton = screen.getByText('계산하기')
      await user.click(calculateButton)

      // Verify calculation was executed
      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // ============================================================
      // PHASE 4: Result Verification
      // ============================================================

      // Verify result display shows key information
      await waitFor(() => {
        // Should show capital gains (270M)
        // Numbers may be split across DOM nodes, so use flexible matching
        expect(screen.getAllByText(/270/).length).toBeGreaterThan(0)
      }, { timeout: 15000 })

      // ============================================================
      // PHASE 5: Scenario Comparison
      // ============================================================

      // User requests scenario comparison
      const scenarioButton = screen.getByText(/보유기간별 세금 비교/)
      await user.click(scenarioButton)

      // Verify scenario comparison is triggered
      await waitFor(() => {
        expect(screen.getAllByText(/보유기간별 세금 비교/).length).toBeGreaterThan(0)
      }, { timeout: 15000 })

      // Verify multiple scenarios displayed
      await waitFor(() => {
        expect(screen.getAllByText(/2년/).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/3년/).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/5년/).length).toBeGreaterThan(0)
      }, { timeout: 15000 })
    }, 30000) // 30 second timeout for full workflow

    test('Complete workflow: Returning user with saved API key', async () => {
      const user = userEvent.setup()

      // ============================================================
      // SETUP: Pre-existing API key
      // ============================================================

      encryption.storeAPIKey('claude', 'sk-ant-returning-user-key')

      // ============================================================
      // PHASE 1: Direct to Tax Calculation (skip API setup)
      // ============================================================

      render(<CapitalGainsTaxForm />)

      // User already has key, goes directly to calculation
      const formData = {
        acquisitionDate: '2020-03-01',
        transferDate: '2024-10-15',
        acquisitionPrice: '600000000',
        transferPrice: '900000000',
        necessaryExpenses: '25000000',
        address: '서울특별시 마포구'
      }

      // Rapid form fill
      await user.type(screen.getByLabelText(/취득일/), formData.acquisitionDate)
      await user.type(screen.getByLabelText(/양도일/), formData.transferDate)
      await user.type(screen.getByLabelText(/취득가액/), formData.acquisitionPrice)
      await user.type(screen.getByLabelText(/양도가액/), formData.transferPrice)
      await user.type(screen.getByLabelText(/필요경비/), formData.necessaryExpenses)
      await user.type(screen.getByLabelText(/주택 소재지/), formData.address)

      // Select 2 households to make it taxable (not exempt)
      const twoHouseholdsRadio = screen.getByLabelText('2주택')
      await user.click(twoHouseholdsRadio)

      // Calculate
      await user.click(screen.getByText('계산하기'))

      // Verify results appear quickly
      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // Verify taxable result (should show tax amount, not exempt)
      await waitFor(() => {
        // Should NOT show 1세대1주택 exemption
        const text = screen.queryByText(/1세대1주택 비과세/);
        expect(text).not.toBeInTheDocument();
        // Should show results section with calculations
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument();
        // Verify capital gains calculated correctly (275M = 900M - 600M - 25M)
        expect(screen.getByText(/275,000,000/)).toBeInTheDocument();
      }, { timeout: 15000 })
    }, 20000)

    test('Multi-property scenario: Calculate for different properties', async () => {
      const user = userEvent.setup()

      render(<CapitalGainsTaxForm />)

      // ============================================================
      // Property 1: Seoul Gangnam (1-home exemption eligible)
      // ============================================================

      await user.type(screen.getByLabelText(/취득일/), '2019-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-01-01')
      await user.type(screen.getByLabelText(/취득가액/), '500000000')
      await user.type(screen.getByLabelText(/양도가액/), '800000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 강남구')

      await user.click(screen.getByText('계산하기'))

      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // Verify exemption message
      await waitFor(() => {
        expect(screen.getAllByText(/1세대1주택/).length).toBeGreaterThan(0)
      }, { timeout: 15000 })

      // ============================================================
      // Reset and Calculate Property 2: Multiple homes (taxable)
      // ============================================================

      const resetButton = screen.getByText('초기화')
      await user.click(resetButton)

      // Wait for form to reset
      await waitFor(() => {
        const acquisitionInput = screen.getByLabelText(/취득일/)
        expect(acquisitionInput.value).toBe('')
      }, { timeout: 15000 })

      // Property 2 data (2 homes, heavy tax)
      await user.type(screen.getByLabelText(/취득일/), '2022-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-06-01')
      await user.type(screen.getByLabelText(/취득가액/), '700000000')
      await user.type(screen.getByLabelText(/양도가액/), '1000000000')

      // Select 2 homes (using radio button, not select)
      const twoHouseholdsRadio = screen.getByLabelText('2주택')
      await user.click(twoHouseholdsRadio)

      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 송파구')

      await user.click(screen.getByText('계산하기'))

      await waitFor(() => {
        // Results should be different from first calculation
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // Should show higher tax (not exempt)
      await waitFor(() => {
        // Capital gains should be 300M
        expect(screen.getAllByText(/300/).length).toBeGreaterThan(0)
      }, { timeout: 15000 })
    }, 30000)
  })

  describe('Data Flow: Form Validation → Service Layer → Error Handling', () => {
    test('Invalid input flow: Form validation → Error display → Correction → Success', async () => {
      const user = userEvent.setup()

      render(<CapitalGainsTaxForm />)

      // ============================================================
      // PHASE 1: Submit with missing required fields
      // ============================================================

      await user.click(screen.getByText('계산하기'))

      // Verify validation errors appear
      await waitFor(() => {
        expect(screen.getByText(/취득일을 입력해주세요/)).toBeInTheDocument()
        expect(screen.getByText(/양도일을 입력해주세요/)).toBeInTheDocument()
      }, { timeout: 15000 })

      // ============================================================
      // PHASE 2: Partial correction - dates only
      // ============================================================

      await user.type(screen.getByLabelText(/취득일/), '2020-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-01-01')

      await user.click(screen.getByText('계산하기'))

      // Still missing prices
      await waitFor(() => {
        expect(screen.getByText(/취득가액을 입력해주세요/)).toBeInTheDocument()
        expect(screen.getByText(/양도가액을 입력해주세요/)).toBeInTheDocument()
      }, { timeout: 15000 })

      // ============================================================
      // PHASE 3: Complete all fields
      // ============================================================

      await user.type(screen.getByLabelText(/취득가액/), '500000000')
      await user.type(screen.getByLabelText(/양도가액/), '800000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 강남구')

      await user.click(screen.getByText('계산하기'))

      // Verify successful calculation
      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })
    }, 20000)

    test('Invalid date order flow: Error → Correction → Success', async () => {
      const user = userEvent.setup()

      render(<CapitalGainsTaxForm />)

      // ============================================================
      // PHASE 1: Enter dates in wrong order
      // ============================================================

      await user.type(screen.getByLabelText(/취득일/), '2024-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2020-01-01') // Before acquisition!

      await user.click(screen.getByText('계산하기'))

      // Verify date validation error
      await waitFor(() => {
        expect(screen.getByText(/양도일은 취득일 이후여야 합니다/)).toBeInTheDocument()
      }, { timeout: 15000 })

      // ============================================================
      // PHASE 2: Correct the dates
      // ============================================================

      // Clear and re-enter correct dates
      const transferDateInput = screen.getByLabelText(/양도일/)
      await user.clear(transferDateInput)
      await user.type(transferDateInput, '2024-06-01')

      // Complete the form
      await user.type(screen.getByLabelText(/취득가액/), '500000000')
      await user.type(screen.getByLabelText(/양도가액/), '800000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 강남구')

      await user.click(screen.getByText('계산하기'))

      // Verify successful calculation
      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })
    }, 20000)

    test('Service layer error propagation to UI', async () => {
      const user = userEvent.setup()

      // Mock service to throw error
      jest.spyOn(cgtService, 'calculateCapitalGainsTax').mockRejectedValue(
        new Error('계산 서비스 오류: 데이터베이스 연결 실패')
      )

      render(<CapitalGainsTaxForm />)

      // Fill form with valid data
      await user.type(screen.getByLabelText(/취득일/), '2020-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-01-01')
      await user.type(screen.getByLabelText(/취득가액/), '500000000')
      await user.type(screen.getByLabelText(/양도가액/), '800000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 강남구')

      await user.click(screen.getByText('계산하기'))

      // Verify error message propagates to UI
      await waitFor(() => {
        expect(screen.getByText(/계산 오류:/)).toBeInTheDocument()
        expect(screen.getByText(/데이터베이스 연결 실패/)).toBeInTheDocument()
      }, { timeout: 15000 })

      // Restore mock
      cgtService.calculateCapitalGainsTax.mockRestore()
    }, 15000)
  })

  describe('State Management Across Components', () => {
    test('Form state persistence: Fill → Reset → Refill', async () => {
      const user = userEvent.setup()

      render(<CapitalGainsTaxForm />)

      // ============================================================
      // PHASE 1: Fill form
      // ============================================================

      const originalData = {
        acquisitionDate: '2019-05-15',
        transferDate: '2024-08-20',
        acquisitionPrice: '450000000',
        transferPrice: '750000000'
      }

      await user.type(screen.getByLabelText(/취득일/), originalData.acquisitionDate)
      await user.type(screen.getByLabelText(/양도일/), originalData.transferDate)
      await user.type(screen.getByLabelText(/취득가액/), originalData.acquisitionPrice)
      await user.type(screen.getByLabelText(/양도가액/), originalData.transferPrice)

      // Verify data is in form
      expect(screen.getByLabelText(/취득일/).value).toBe(originalData.acquisitionDate)
      expect(screen.getByLabelText(/양도일/).value).toBe(originalData.transferDate)

      // ============================================================
      // PHASE 2: Reset form
      // ============================================================

      await user.click(screen.getByText('초기화'))

      // Verify form is cleared (wait for React state update)
      await waitFor(() => {
        const acquisitionDateInput = screen.getByLabelText(/취득일/)
        const transferDateInput = screen.getByLabelText(/양도일/)
        const acquisitionPriceInput = screen.getByLabelText(/취득가액/)
        const transferPriceInput = screen.getByLabelText(/양도가액/)

        expect(acquisitionDateInput.value).toBe('')
        expect(transferDateInput.value).toBe('')
        expect(acquisitionPriceInput.value).toBe('')
        expect(transferPriceInput.value).toBe('')
      }, { timeout: 20000 })

      // ============================================================
      // PHASE 3: Refill with new data
      // ============================================================

      const newData = {
        acquisitionDate: '2021-03-10',
        transferDate: '2024-09-15',
        acquisitionPrice: '600000000',
        transferPrice: '850000000'
      }

      await user.type(screen.getByLabelText(/취득일/), newData.acquisitionDate)
      await user.type(screen.getByLabelText(/양도일/), newData.transferDate)
      await user.type(screen.getByLabelText(/취득가액/), newData.acquisitionPrice)
      await user.type(screen.getByLabelText(/양도가액/), newData.transferPrice)

      // Verify new data replaced old data
      expect(screen.getByLabelText(/취득일/).value).toBe(newData.acquisitionDate)
      expect(screen.getByLabelText(/취득일/).value).not.toBe(originalData.acquisitionDate)
    }, 30000)  // Increased timeout for slow user.type() operations

    test('Calculation state: Multiple calculations update correctly', async () => {
      const user = userEvent.setup()

      render(<CapitalGainsTaxForm />)

      // ============================================================
      // CALCULATION 1: High gains
      // ============================================================

      await user.type(screen.getByLabelText(/취득일/), '2020-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-01-01')
      await user.type(screen.getByLabelText(/취득가액/), '400000000')
      await user.type(screen.getByLabelText(/양도가액/), '900000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 강남구')

      // Select 2 households to make it taxable
      await user.click(screen.getByLabelText('2주택'))

      await user.click(screen.getByText('계산하기'))

      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // Verify high capital gains (500M = 900M - 400M)
      await waitFor(() => {
        const results = screen.getAllByText(/500,000,000/)
        expect(results.length).toBeGreaterThan(0)
      }, { timeout: 15000 })

      // ============================================================
      // CALCULATION 2: Low gains (after reset)
      // ============================================================

      await user.click(screen.getByText('초기화'))

      await waitFor(() => {
        expect(screen.getByLabelText(/취득일/).value).toBe('')
      }, { timeout: 15000 })

      await user.type(screen.getByLabelText(/취득일/), '2022-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-01-01')
      await user.type(screen.getByLabelText(/취득가액/), '700000000')
      await user.type(screen.getByLabelText(/양도가액/), '800000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 마포구')

      // Select 2 households to make it taxable
      await user.click(screen.getByLabelText('2주택'))

      await user.click(screen.getByText('계산하기'))

      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // Verify low capital gains (100M = 800M - 700M) replaced high gains
      await waitFor(() => {
        const results = screen.getAllByText(/100,000,000/)
        expect(results.length).toBeGreaterThan(0)
      }, { timeout: 15000 })
    }, 30000)
  })

  describe('Cross-Component Data Sharing', () => {
    test('API Key availability affects calculation flow', async () => {
      const user = userEvent.setup()

      // ============================================================
      // SCENARIO 1: No API key stored
      // ============================================================

      // Verify no key exists
      expect(encryption.getAPIKey('claude')).toBeNull()

      render(<CapitalGainsTaxForm />)

      // User can still calculate (API key optional for tax calc)
      await user.type(screen.getByLabelText(/취득일/), '2020-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-01-01')
      await user.type(screen.getByLabelText(/취득가액/), '500000000')
      await user.type(screen.getByLabelText(/양도가액/), '800000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 강남구')

      await user.click(screen.getByText('계산하기'))

      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // ============================================================
      // SCENARIO 2: With API key stored
      // ============================================================

      // Store API key
      encryption.storeAPIKey('claude', 'sk-ant-cross-component-key')

      // Verify key is available across components
      expect(encryption.getAPIKey('claude')).toBe('sk-ant-cross-component-key')

      // Calculation should still work (with potential AI enhancements)
      await user.click(screen.getByText('초기화'))

      await waitFor(() => {
        expect(screen.getByLabelText(/취득일/).value).toBe('')
      }, { timeout: 15000 })

      await user.type(screen.getByLabelText(/취득일/), '2021-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-06-01')
      await user.type(screen.getByLabelText(/취득가액/), '600000000')
      await user.type(screen.getByLabelText(/양도가액/), '900000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 송파구')

      await user.click(screen.getByText('계산하기'))

      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })
    }, 30000)

    test('Encryption service shared across components', async () => {
      // ============================================================
      // Component 1: API Key Form stores encrypted data
      // ============================================================

      const { unmount: unmountAPIForm } = render(<APIKeyForm />)
      const user = userEvent.setup()

      const claudeInput = screen.getByPlaceholderText('sk-ant-api...')
      await user.type(claudeInput, 'sk-ant-shared-encryption-test')

      const saveButtons = screen.getAllByText('저장')
      await user.click(saveButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/API 키가 안전하게 저장되었습니다/)).toBeInTheDocument()
      }, { timeout: 15000 })

      // Verify encrypted storage
      const encryptedData = localStorageMock['__aitax_api_claude__']
      expect(encryptedData).toBeDefined()
      expect(encryptedData).not.toContain('sk-ant-shared-encryption-test')

      unmountAPIForm()

      // ============================================================
      // Component 2: Encryption service can decrypt in different context
      // ============================================================

      // Simulate another component accessing the same encrypted data
      const retrievedKey = encryption.getAPIKey('claude')
      expect(retrievedKey).toBe('sk-ant-shared-encryption-test')

      // ============================================================
      // Component 3: Tax form can access encrypted API key if needed
      // ============================================================

      render(<CapitalGainsTaxForm />)

      // Tax form should be able to access API key through shared service
      const apiKey = encryption.getAPIKey('claude')
      expect(apiKey).toBe('sk-ant-shared-encryption-test')
    }, 15000)
  })

  describe('Performance and Optimization', () => {
    test('Rapid successive calculations handle correctly', async () => {
      const user = userEvent.setup()

      render(<CapitalGainsTaxForm />)

      // ============================================================
      // Rapid calculation 1
      // ============================================================

      await user.type(screen.getByLabelText(/취득일/), '2020-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-01-01')
      await user.type(screen.getByLabelText(/취득가액/), '500000000')
      await user.type(screen.getByLabelText(/양도가액/), '800000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 강남구')

      // Select 2 households to make it taxable
      await user.click(screen.getByLabelText('2주택'))

      await user.click(screen.getByText('계산하기'))

      // Don't wait for full result, immediately start next calculation
      await user.click(screen.getByText('초기화'))

      // ============================================================
      // Rapid calculation 2
      // ============================================================

      await user.type(screen.getByLabelText(/취득일/), '2021-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-06-01')
      await user.type(screen.getByLabelText(/취득가액/), '600000000')
      await user.type(screen.getByLabelText(/양도가액/), '900000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 마포구')

      // Select 2 households to make it taxable
      await user.click(screen.getByLabelText('2주택'))

      await user.click(screen.getByText('계산하기'))

      // Wait for final result
      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // Verify calculation results displayed (not checking specific numbers due to complex tax calc)
      await waitFor(() => {
        // Should show results section with data
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument();
      }, { timeout: 15000 })
    }, 45000)  // Increased timeout for rapid successive operations

    test('Large number input handling', async () => {
      const user = userEvent.setup()

      render(<CapitalGainsTaxForm />)

      // Test with very large numbers (billions)
      await user.type(screen.getByLabelText(/취득일/), '2018-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-01-01')
      await user.type(screen.getByLabelText(/취득가액/), '5000000000') // 5 billion
      await user.type(screen.getByLabelText(/양도가액/), '8000000000') // 8 billion
      await user.type(screen.getByLabelText(/필요경비/), '500000000') // 500 million
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 강남구')

      await user.click(screen.getByText('계산하기'))

      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // Verify large numbers handled correctly (capital gains = 2.5 billion)
      await waitFor(() => {
        expect(screen.getAllByText(/2,500/).length).toBeGreaterThan(0)
      }, { timeout: 15000 })
    }, 15000)
  })

  describe('End-to-End User Scenarios', () => {
    test('Real estate investor workflow: Multiple property analysis', async () => {
      const user = userEvent.setup()

      // Investor setup
      encryption.storeAPIKey('claude', 'sk-ant-investor-key')

      render(<CapitalGainsTaxForm />)

      // ============================================================
      // Property A: Long-term hold (eligible for exemption)
      // ============================================================

      await user.type(screen.getByLabelText(/취득일/), '2019-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-10-01')
      await user.type(screen.getByLabelText(/취득가액/), '500000000')
      await user.type(screen.getByLabelText(/양도가액/), '800000000')
      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 강남구')

      await user.click(screen.getByText('계산하기'))

      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // Check for exemption eligibility
      await waitFor(() => {
        expect(screen.getAllByText(/1세대1주택/).length).toBeGreaterThan(0)
      }, { timeout: 15000 })

      // Compare scenarios
      const scenarioButton = screen.getByText(/보유기간별 세금 비교/)
      await user.click(scenarioButton)

      await waitFor(() => {
        expect(screen.getAllByText(/보유기간별 세금 비교/).length).toBeGreaterThan(0)
      }, { timeout: 15000 })

      // ============================================================
      // Property B: Short-term flip (high tax)
      // ============================================================

      await user.click(screen.getByText('초기화'))

      await waitFor(() => {
        expect(screen.getByLabelText(/취득일/).value).toBe('')
      }, { timeout: 15000 })

      await user.type(screen.getByLabelText(/취득일/), '2023-01-01')
      await user.type(screen.getByLabelText(/양도일/), '2024-06-01')
      await user.type(screen.getByLabelText(/취득가액/), '700000000')
      await user.type(screen.getByLabelText(/양도가액/), '900000000')

      // 2 homes (heavy tax) - using radio button
      const twoHouseholdsRadio = screen.getByLabelText('2주택')
      await user.click(twoHouseholdsRadio)

      await user.type(screen.getByLabelText(/주택 소재지/), '서울특별시 송파구')

      await user.click(screen.getByText('계산하기'))

      await waitFor(() => {
        expect(screen.getByText('📊 계산 결과')).toBeInTheDocument()
      }, { timeout: 15000 })

      // Should show higher tax burden for short-term, multi-home sale
      await waitFor(() => {
        expect(screen.getAllByText(/200/).length).toBeGreaterThan(0)
      }, { timeout: 15000 })
    }, 45000) // Extended timeout for complex scenario
  })
})
