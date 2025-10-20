/**
 * CapitalGainsTaxResultDisplay Component Tests
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CapitalGainsTaxResultDisplay from './CapitalGainsTaxResultDisplay'

describe('CapitalGainsTaxResultDisplay Component', () => {
  // Mock formatting functions
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0'
    return parseInt(num).toLocaleString('ko-KR')
  }

  const formatPercent = (rate) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  describe('Null and Empty State', () => {
    test('Should return null when result is not provided', () => {
      const { container } = render(
        <CapitalGainsTaxResultDisplay
          result={null}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    test('Should return null when result is undefined', () => {
      const { container } = render(
        <CapitalGainsTaxResultDisplay
          result={undefined}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Capital Loss Case', () => {
    test('Should display capital loss message when hasLoss is true', () => {
      const result = {
        hasLoss: true,
        capitalGains: -50000000,
        summary: {
          totalTax: 0,
          capitalGainsTax: 0,
          localIncomeTax: 0
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date('2024-01-01').toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('양도손실 발생')).toBeInTheDocument()
      expect(screen.getByText(/손실액:/)).toBeInTheDocument()
      expect(screen.getByText(/50,000,000원/)).toBeInTheDocument()
      expect(screen.getByText(/양도소득세가 부과되지 않습니다/)).toBeInTheDocument()
    })

    test('Should display capital loss when capitalGains is negative', () => {
      const result = {
        capitalGains: -30000000,
        summary: {
          totalTax: 0,
          capitalGainsTax: 0,
          localIncomeTax: 0
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('양도손실 발생')).toBeInTheDocument()
      expect(screen.getByText(/30,000,000원/)).toBeInTheDocument()
    })
  })

  describe('Tax-Free Case', () => {
    test('Should display tax-free message when totalTax is 0 and no loss', () => {
      const result = {
        capitalGains: 100000000,
        summary: {
          totalTax: 0,
          capitalGainsTax: 0,
          localIncomeTax: 0
        },
        eligibility: {
          message: '1세대1주택 비과세 적용'
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('1세대1주택 비과세 적용')).toBeInTheDocument()
      expect(screen.getByText('납부세액: 0원')).toBeInTheDocument()
    })

    test('Should display default tax-free message when eligibility message is not provided', () => {
      const result = {
        capitalGains: 100000000,
        summary: {
          totalTax: 0,
          capitalGainsTax: 0,
          localIncomeTax: 0
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('세금 없음')).toBeInTheDocument()
    })
  })

  describe('Taxable Case - Summary Display', () => {
    test('Should display total tax amount and breakdown', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.2,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          surcharge: 0,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getAllByText('총 납부세액')[0]).toBeInTheDocument()
      expect(screen.getAllByText('66,000,000원')[0]).toBeInTheDocument()
      expect(screen.getByText(/양도소득세: 60,000,000원/)).toBeInTheDocument()
      expect(screen.getByText(/지방소득세: 6,000,000원/)).toBeInTheDocument()
      expect(screen.getByText(/실효세율:.*22/)).toBeInTheDocument()
    })

    test('Should display holding period in detail section', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 7.5,
        summary: {
          totalTax: 50000000,
          capitalGainsTax: 45454545,
          localIncomeTax: 4545455,
          effectiveTaxRate: 16.7
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('7.5년')).toBeInTheDocument()
      expect(screen.getByText(/양도차익/)).toBeInTheDocument()
    })

    test('Should display residence years when provided', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 10.0,
        residenceYears: 8.5,
        summary: {
          totalTax: 40000000,
          capitalGainsTax: 36363636,
          localIncomeTax: 3636364,
          effectiveTaxRate: 13.3
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.15,
          effectiveRate: 0.15
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('거주기간')).toBeInTheDocument()
      expect(screen.getByText('8.5년')).toBeInTheDocument()
    })

    test('Should not display residence years when 0', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        residenceYears: 0,
        summary: {
          totalTax: 60000000,
          capitalGainsTax: 54545455,
          localIncomeTax: 5454545,
          effectiveTaxRate: 20.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.queryByText('거주기간')).not.toBeInTheDocument()
    })
  })

  describe('One-Home Exemption Section', () => {
    test('Should display full exemption information', () => {
      const result = {
        capitalGains: 800000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 0,
          capitalGainsTax: 0,
          localIncomeTax: 0
        },
        eligibility: {
          message: '1세대1주택 비과세 적용'
        },
        exemption: {
          exemptionType: 'FULL',
          exemptionAmount: 800000000,
          taxableAmount: 0
        },
        tax: {
          taxableGains: 0
        },
        effectiveRate: {
          rateType: 'FLAT',
          effectiveRate: 0
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText(/1세대1주택.*비과세/)).toBeInTheDocument()
      expect(screen.getByText(/납부세액: 0원/)).toBeInTheDocument()
    })

    test('Should display proportional exemption information', () => {
      const result = {
        capitalGains: 1000000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 44000000,
          capitalGainsTax: 40000000,
          localIncomeTax: 4000000,
          effectiveTaxRate: 4.4
        },
        exemption: {
          exemptionType: 'PROPORTIONAL',
          exemptionRate: 0.8,
          exemptionAmount: 800000000,
          taxableAmount: 200000000
        },
        tax: {
          taxableGains: 200000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('비례 면세')).toBeInTheDocument()
      expect(screen.getByText('80.0%')).toBeInTheDocument()
      expect(screen.getByText(/비과세 금액/)).toBeInTheDocument()
      expect(screen.getByText(/과세대상 금액/)).toBeInTheDocument()
    })

    test('Should not display exemption section when exemptionType is NONE', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        exemption: {
          exemptionType: 'NONE',
          exemptionAmount: 0,
          taxableAmount: 300000000
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.queryByText('1세대1주택 비과세')).not.toBeInTheDocument()
    })
  })

  describe('Long-Term Holding Deduction Section', () => {
    test('Should display deduction information with breakdown', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 10.0,
        residenceYears: 8.0,
        summary: {
          totalTax: 33000000,
          capitalGainsTax: 30000000,
          localIncomeTax: 3000000,
          effectiveTaxRate: 11.0
        },
        deduction: {
          deductionType: 'ONE_HOME_HIGH_VALUE',
          deductionRate: 0.6,
          deductionAmount: 180000000,
          remainingTaxable: 120000000,
          breakdown: {
            holdingDeduction: {
              rate: 0.4,
              amount: 120000000
            },
            residenceDeduction: {
              rate: 0.2,
              amount: 60000000
            }
          }
        },
        tax: {
          taxableGains: 120000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText(/장기보유.*공제/)).toBeInTheDocument()
      expect(screen.getByText('1세대1주택 고가 (보유+거주)')).toBeInTheDocument()
      expect(screen.getByText(/보유공제 \(40.0%\)/)).toBeInTheDocument()
      expect(screen.getByText(/거주공제 \(20.0%\)/)).toBeInTheDocument()
      expect(screen.getByText(/공제 금액 \(60.0%\)/)).toBeInTheDocument()
      expect(screen.getByText(/180,000,000원/)).toBeInTheDocument()
    })

    test('Should not display deduction section when deductionAmount is 0', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 1.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        deduction: {
          deductionAmount: 0,
          remainingTaxable: 300000000
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.queryByText('장기보유특별공제')).not.toBeInTheDocument()
    })

    test('Should display general deduction type', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 44000000,
          capitalGainsTax: 40000000,
          localIncomeTax: 4000000,
          effectiveTaxRate: 14.7
        },
        deduction: {
          deductionType: 'GENERAL',
          deductionRate: 0.2,
          deductionAmount: 60000000,
          remainingTaxable: 240000000
        },
        tax: {
          taxableGains: 240000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('일반')).toBeInTheDocument()
    })
  })

  describe('Tax Rate Application Section', () => {
    test('Should display flat rate type', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 132000000,
          capitalGainsTax: 120000000,
          localIncomeTax: 12000000,
          effectiveTaxRate: 44.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'FLAT',
          baseRate: 0.4,
          surcharge: 0,
          effectiveRate: 0.4
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText(/세율.*적용/)).toBeInTheDocument()
      expect(screen.getByText('단일세율')).toBeInTheDocument()
      expect(screen.getByText('40.0%')).toBeInTheDocument()
    })

    test('Should display progressive rate with surcharge', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 99000000,
          capitalGainsTax: 90000000,
          localIncomeTax: 9000000,
          effectiveTaxRate: 33.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          surcharge: 0.06,
          effectiveRate: 0.3
        },
        heavyTaxStatus: {
          heavyTaxApplied: true,
          reason: 'MULTI_HOME',
          message: '2주택 이상 중과세 적용'
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('누진세율 + 중과')).toBeInTheDocument()
      expect(screen.getByText('기본세율')).toBeInTheDocument()
      expect(screen.getByText('24.0%')).toBeInTheDocument()
      expect(screen.getByText('중과세율')).toBeInTheDocument()
      expect(screen.getByText('+ 6.0%')).toBeInTheDocument()
    })

    test('Should display progressive rate without surcharge', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          surcharge: 0,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false,
          reason: 'ONE_HOME',
          message: '1주택자'
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('누진세율')).toBeInTheDocument()
      expect(screen.queryByText('중과세율')).not.toBeInTheDocument()
    })

    test('Should display progressive deduction when bracket is provided', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24,
          bracket: {
            min: 88000000,
            max: 150000000,
            rate: 0.24,
            deduction: 5220000
          }
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('누진공제')).toBeInTheDocument()
      expect(screen.getByText(/5,220,000원/)).toBeInTheDocument()
    })
  })

  describe('Heavy Tax Information', () => {
    test('Should display heavy tax applied message', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 3.0,
        summary: {
          totalTax: 99000000,
          capitalGainsTax: 90000000,
          localIncomeTax: 9000000,
          effectiveTaxRate: 33.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          surcharge: 0.06,
          effectiveRate: 0.3
        },
        heavyTaxStatus: {
          heavyTaxApplied: true,
          reason: 'MULTI_HOME',
          message: '2주택 이상 중과세 적용'
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText(/다주택.*중과세.*정보/)).toBeInTheDocument()
      expect(screen.getByText('2주택 이상 중과세 적용')).toBeInTheDocument()
    })

    test('Should display heavy tax suspended message', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 3.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false,
          reason: 'SUSPENDED',
          message: '중과세 한시 배제 (2024-05-10 ~ 2025-05-09)'
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText(/중과세 한시 배제/)).toBeInTheDocument()
      expect(screen.getByText(/2025-05-09까지 한시적으로 배제됩니다/)).toBeInTheDocument()
    })
  })

  describe('Warnings Section', () => {
    test('Should display warnings when provided', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        warnings: [
          {
            category: '보유기간',
            message: '2년 미만 보유 시 단기 양도로 중과세 대상',
            impact: 'HIGH'
          },
          {
            category: '다주택',
            message: '조정대상지역 내 2주택 이상 소유 시 중과세 적용',
            impact: 'MEDIUM'
          }
        ],
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText('💡 권고사항')).toBeInTheDocument()
      expect(screen.getByText(/\[보유기간\]/)).toBeInTheDocument()
      expect(screen.getByText(/2년 미만 보유 시/)).toBeInTheDocument()
      expect(screen.getByText(/\[다주택\]/)).toBeInTheDocument()
      expect(screen.getByText(/조정대상지역 내 2주택/)).toBeInTheDocument()
    })

    test('Should not display warnings section when no warnings', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        warnings: [],
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.queryByText('💡 권고사항')).not.toBeInTheDocument()
    })
  })

  describe('Legal Notice and Metadata', () => {
    test('Should display legal notice', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date('2024-01-01T12:00:00').toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText(/본 계산 결과는 참고용이며/)).toBeInTheDocument()
      expect(screen.getByText(/세무사 또는 관할 세무서에 문의하시기 바랍니다/)).toBeInTheDocument()
    })

    test('Should display calculation metadata', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.5.1',
          calculationDate: new Date('2024-06-15T10:30:00').toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText(/계산 엔진 버전: 2.5.1/)).toBeInTheDocument()
      expect(screen.getByText(/계산일시:/)).toBeInTheDocument()
    })

    test('Should use default version when metadata is not provided', () => {
      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(screen.getByText(/계산 엔진 버전: 2.0.0/)).toBeInTheDocument()
    })
  })

  describe('Formatting Functions Usage', () => {
    test('Should use formatNumber for all currency values', () => {
      const mockFormatNumber = jest.fn((num) => {
        return `${num}원`
      })

      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={mockFormatNumber}
          formatPercent={formatPercent}
        />
      )

      expect(mockFormatNumber).toHaveBeenCalled()
    })

    test('Should use formatPercent for all rate values', () => {
      const mockFormatPercent = jest.fn((rate) => {
        return `${rate * 100}%`
      })

      const result = {
        capitalGains: 300000000,
        holdingYears: 5.0,
        summary: {
          totalTax: 66000000,
          capitalGainsTax: 60000000,
          localIncomeTax: 6000000,
          effectiveTaxRate: 22.0
        },
        tax: {
          taxableGains: 300000000
        },
        effectiveRate: {
          rateType: 'PROGRESSIVE',
          baseRate: 0.24,
          effectiveRate: 0.24
        },
        heavyTaxStatus: {
          heavyTaxApplied: false
        },
        metadata: {
          version: '2.0.0',
          calculationDate: new Date().toISOString()
        }
      }

      render(
        <CapitalGainsTaxResultDisplay
          result={result}
          formatNumber={formatNumber}
          formatPercent={mockFormatPercent}
        />
      )

      expect(mockFormatPercent).toHaveBeenCalled()
    })
  })
})
