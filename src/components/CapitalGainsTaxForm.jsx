/**
 * 양도소득세 계산 폼 컴포넌트
 * Capital Gains Tax Calculation Form Component
 *
 * 사용자 입력을 받아 양도소득세를 계산하고 결과를 표시합니다.
 *
 * @version 1.0.0
 * @date 2025-10-17
 */

import React, { useState, useEffect } from 'react';
import { calculateCapitalGainsTax, calculateTaxScenarios } from '../services/cgt/index.js';
import CapitalGainsTaxResultDisplay from './CapitalGainsTaxResultDisplay.jsx';
import TaxScenarioComparison from './TaxScenarioComparison.jsx';
import './CapitalGainsTaxForm.css';

const CapitalGainsTaxForm = () => {
  // ==========================================
  // State Management
  // ==========================================

  // 입력 데이터
  const [formData, setFormData] = useState({
    acquisitionDate: '',
    acquisitionPrice: '',
    transferDate: '',
    transferPrice: '',
    houseCount: 1,
    address: '',
    necessaryExpenses: '',
    residenceYears: '',
    tempDual2Years: false
  });

  // 계산 결과
  const [result, setResult] = useState(null);

  // 시나리오 비교 결과
  const [scenarios, setScenarios] = useState(null);
  const [showScenarios, setShowScenarios] = useState(false);

  // 보유기간 (자동 계산)
  const [holdingPeriod, setHoldingPeriod] = useState(null);

  // 에러 및 경고
  const [errors, setErrors] = useState({});
  const [showResults, setShowResults] = useState(false);

  // ==========================================
  // Event Handlers
  // ==========================================

  /**
   * 입력 필드 변경 핸들러
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * 숫자 입력 포맷팅 (금액)
   */
  const handleNumberInput = (e) => {
    const { name, value } = e.target;

    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    setFormData(prev => ({
      ...prev,
      [name]: numbers
    }));

    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * 보유기간 자동 계산 (날짜 변경 시)
   */
  useEffect(() => {
    if (formData.acquisitionDate && formData.transferDate) {
      try {
        const acqDate = new Date(formData.acquisitionDate);
        const transDate = new Date(formData.transferDate);

        if (transDate >= acqDate) {
          const diffInMs = transDate - acqDate;
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          const years = Math.floor(diffInDays / 365);
          const remainingDays = diffInDays % 365;
          const months = Math.floor(remainingDays / 30);

          setHoldingPeriod({
            years,
            months,
            days: diffInDays
          });
        } else {
          setHoldingPeriod(null);
        }
      } catch (error) {
        setHoldingPeriod(null);
      }
    } else {
      setHoldingPeriod(null);
    }
  }, [formData.acquisitionDate, formData.transferDate]);

  /**
   * 폼 검증
   */
  const validateForm = () => {
    const newErrors = {};

    // 필수 필드 검증
    if (!formData.acquisitionDate) {
      newErrors.acquisitionDate = '취득일을 입력해주세요';
    }
    if (!formData.acquisitionPrice) {
      newErrors.acquisitionPrice = '취득가액을 입력해주세요';
    }
    if (!formData.transferDate) {
      newErrors.transferDate = '양도일을 입력해주세요';
    }
    if (!formData.transferPrice) {
      newErrors.transferPrice = '양도가액을 입력해주세요';
    }
    if (!formData.address) {
      newErrors.address = '주소를 입력해주세요';
    }

    // 날짜 순서 검증
    if (formData.acquisitionDate && formData.transferDate) {
      if (new Date(formData.transferDate) < new Date(formData.acquisitionDate)) {
        newErrors.transferDate = '양도일은 취득일 이후여야 합니다';
      }
    }

    // 금액 검증
    if (formData.acquisitionPrice && parseInt(formData.acquisitionPrice) < 0) {
      newErrors.acquisitionPrice = '취득가액은 0 이상이어야 합니다';
    }
    if (formData.transferPrice && parseInt(formData.transferPrice) < 0) {
      newErrors.transferPrice = '양도가액은 0 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 주소에서 도시와 구 파싱
   */
  const parseLocation = (address) => {
    if (!address) return null;

    // 서울특별시, 부산광역시 등 패턴
    const cityMatch = address.match(/(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)/);
    const districtMatch = address.match(/([가-힣]+구|[가-힣]+시)/);

    return {
      city: cityMatch ? cityMatch[1] : '',
      district: districtMatch ? districtMatch[1] : ''
    };
  };

  /**
   * 계산 실행
   */
  const handleCalculate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // 주소 파싱
      const location = parseLocation(formData.address);

      // 거주기간 계산 (거주 시작일 = 취득일 + 2개월, 거주 종료일 = 양도일 - 1개월 가정)
      const residenceStartDate = formData.residenceYears > 0
        ? formData.acquisitionDate
        : null;
      const residenceEndDate = formData.residenceYears > 0
        ? formData.transferDate
        : null;

      // 입력 데이터 변환 (새로운 엔진 형식)
      const params = {
        salePrice: parseInt(formData.transferPrice) || 0,
        purchasePrice: parseInt(formData.acquisitionPrice) || 0,
        necessaryExpenses: parseInt(formData.necessaryExpenses) || 0,
        homeCount: formData.houseCount,
        householdHomeCount: formData.houseCount, // 같은 값으로 설정 (1세대 가정)
        purchaseDate: formData.acquisitionDate,
        saleDate: formData.transferDate,
        residenceStartDate,
        residenceEndDate,
        location: location.city ? location : null
      };

      // 계산 실행
      const calculationResult = await calculateCapitalGainsTax(params);

      setResult(calculationResult);
      setShowResults(true);
      setErrors({});
    } catch (error) {
      setErrors({ calculation: error.message });
      setResult(null);
      setShowResults(false);
    }
  };

  /**
   * 시나리오 비교 실행
   */
  const handleCompareScenarios = async () => {
    if (!result) return;

    try {
      const location = parseLocation(formData.address);

      const baseInput = {
        salePrice: parseInt(formData.transferPrice) || 0,
        purchasePrice: parseInt(formData.acquisitionPrice) || 0,
        necessaryExpenses: parseInt(formData.necessaryExpenses) || 0,
        homeCount: formData.houseCount,
        householdHomeCount: formData.houseCount,
        purchaseDate: formData.acquisitionDate,
        residenceStartDate: formData.acquisitionDate,
        location: location.city ? location : null
      };

      const scenarioResults = await calculateTaxScenarios(baseInput, [2, 3, 5, 10, 15]);
      setScenarios(scenarioResults);
      setShowScenarios(true);
    } catch (error) {
      setErrors({ scenarios: error.message });
    }
  };

  /**
   * 폼 초기화
   */
  const handleReset = () => {
    setFormData({
      acquisitionDate: '',
      acquisitionPrice: '',
      transferDate: '',
      transferPrice: '',
      houseCount: 1,
      address: '',
      necessaryExpenses: '',
      residenceYears: '',
      tempDual2Years: false
    });
    setResult(null);
    setScenarios(null);
    setShowScenarios(false);
    setHoldingPeriod(null);
    setErrors({});
    setShowResults(false);
  };

  /**
   * 숫자 포맷팅 (천단위 콤마)
   */
  const formatNumber = (num) => {
    if (!num) return '';  // Return empty string for empty/null/undefined values
    return parseInt(num).toLocaleString('ko-KR');
  };

  /**
   * 퍼센트 포맷팅
   */
  const formatPercent = (rate) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="capital-gains-tax-calculator">
      <div className="calculator-header">
        <h1>양도소득세 계산기</h1>
        <p className="subtitle">부동산 양도소득세를 간편하게 계산해보세요</p>
      </div>

      <form onSubmit={handleCalculate} className="calculator-form">

        {/* ==================== */}
        {/* 기본 정보 섹션 */}
        {/* ==================== */}
        <section className="form-section">
          <h2>📋 기본 정보</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="acquisitionDate">
                취득일 <span className="required">*</span>
              </label>
              <input
                type="date"
                id="acquisitionDate"
                name="acquisitionDate"
                value={formData.acquisitionDate}
                onChange={handleInputChange}
                className={errors.acquisitionDate ? 'error' : ''}
              />
              {errors.acquisitionDate && (
                <span className="error-message">{errors.acquisitionDate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="transferDate">
                양도일 <span className="required">*</span>
              </label>
              <input
                type="date"
                id="transferDate"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleInputChange}
                className={errors.transferDate ? 'error' : ''}
              />
              {errors.transferDate && (
                <span className="error-message">{errors.transferDate}</span>
              )}
            </div>
          </div>

          {/* 보유기간 자동 표시 */}
          {holdingPeriod && (
            <div className="info-box">
              <strong>보유기간:</strong> {holdingPeriod.years}년 {holdingPeriod.months}개월
              ({holdingPeriod.days}일)
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="acquisitionPrice">
                취득가액 <span className="required">*</span>
              </label>
              <div className="input-with-unit">
                <input
                  type="text"
                  id="acquisitionPrice"
                  name="acquisitionPrice"
                  value={formatNumber(formData.acquisitionPrice)}
                  onChange={handleNumberInput}
                  placeholder="500,000,000"
                  className={errors.acquisitionPrice ? 'error' : ''}
                />
                <span className="unit">원</span>
              </div>
              {errors.acquisitionPrice && (
                <span className="error-message">{errors.acquisitionPrice}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="transferPrice">
                양도가액 <span className="required">*</span>
              </label>
              <div className="input-with-unit">
                <input
                  type="text"
                  id="transferPrice"
                  name="transferPrice"
                  value={formatNumber(formData.transferPrice)}
                  onChange={handleNumberInput}
                  placeholder="800,000,000"
                  className={errors.transferPrice ? 'error' : ''}
                />
                <span className="unit">원</span>
              </div>
              {errors.transferPrice && (
                <span className="error-message">{errors.transferPrice}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="necessaryExpenses">
              필요경비 (선택)
            </label>
            <div className="input-with-unit">
              <input
                type="text"
                id="necessaryExpenses"
                name="necessaryExpenses"
                value={formatNumber(formData.necessaryExpenses)}
                onChange={handleNumberInput}
                placeholder="0"
              />
              <span className="unit">원</span>
            </div>
            <small className="helper-text">
              취득세, 중개수수료, 자본적지출 등
            </small>
          </div>
        </section>

        {/* ==================== */}
        {/* 주택 정보 섹션 */}
        {/* ==================== */}
        <section className="form-section">
          <h2>🏠 주택 정보</h2>

          <div className="form-group">
            <label>
              주택 수 <span className="required">*</span>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="houseCount"
                  value="1"
                  checked={formData.houseCount === 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseCount: 1 }))}
                />
                <span>1주택</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="houseCount"
                  value="2"
                  checked={formData.houseCount === 2}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseCount: 2 }))}
                />
                <span>2주택</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="houseCount"
                  value="3"
                  checked={formData.houseCount === 3}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseCount: 3 }))}
                />
                <span>3주택 이상</span>
              </label>
            </div>
          </div>

          {formData.houseCount === 2 && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="tempDual2Years"
                  checked={formData.tempDual2Years}
                  onChange={handleInputChange}
                />
                <span>일시적 2주택 (이사 목적, 3년 이내 양도)</span>
              </label>
              <small className="helper-text">
                이사를 위해 신규 주택 취득 후 기존 주택을 3년 이내 양도하는 경우
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="address">
              주택 소재지 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="예: 서울특별시 강남구 또는 부산광역시 해운대구"
              className={errors.address ? 'error' : ''}
            />
            {errors.address && (
              <span className="error-message">{errors.address}</span>
            )}
            <small className="helper-text">
              조정대상지역 판정에 사용됩니다 (서울 전역, 과천, 분당 등)
            </small>
          </div>

          {formData.houseCount === 1 && (
            <div className="form-group">
              <label htmlFor="residenceYears">
                거주기간 (선택)
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="residenceYears"
                  name="residenceYears"
                  value={formData.residenceYears}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
                <span className="unit">년</span>
              </div>
              <small className="helper-text">
                실제 거주한 기간 (1세대1주택 비과세 및 장기보유특별공제에 적용)
              </small>
            </div>
          )}
        </section>

        {/* ==================== */}
        {/* 버튼 */}
        {/* ==================== */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            계산하기
          </button>
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            초기화
          </button>
        </div>

        {/* 에러 메시지 */}
        {errors.calculation && (
          <div className="error-box">
            <strong>⚠️ 계산 오류:</strong> {errors.calculation}
          </div>
        )}
      </form>

      {/* ==================== */}
      {/* 계산 결과 섹션 */}
      {/* ==================== */}
      {showResults && result && (
        <>
          <CapitalGainsTaxResultDisplay
            result={result}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
          />

          {/* 시나리오 비교 버튼 */}
          <div className="scenario-actions">
            <button
              type="button"
              onClick={handleCompareScenarios}
              className="btn btn-secondary"
              disabled={showScenarios}
            >
              📊 보유기간별 세금 비교
            </button>
          </div>

          {/* 시나리오 비교 결과 */}
          {showScenarios && scenarios && (
            <TaxScenarioComparison
              scenarios={scenarios}
              formatNumber={formatNumber}
              formatPercent={formatPercent}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CapitalGainsTaxForm;
