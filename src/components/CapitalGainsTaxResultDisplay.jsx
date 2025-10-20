/**
 * Capital Gains Tax Result Display Component
 * 양도소득세 계산 결과 표시 컴포넌트
 *
 * @version 2.0.0
 * @date 2025-10-18
 */

import React from 'react';

const CapitalGainsTaxResultDisplay = ({ result, formatNumber, formatPercent }) => {
  if (!result) return null;

  const hasLoss = result.hasLoss || result.capitalGains < 0;
  const isTaxFree = result.summary.totalTax === 0 && !hasLoss;

  return (
    <div className="results-section">
      <h2>📊 계산 결과</h2>

      {/* 양도손실 또는 비과세 */}
      {(hasLoss || isTaxFree) && (
        <div className={`result-highlight ${hasLoss ? 'info' : 'success'}`}>
          <div className="result-icon">{hasLoss ? '📉' : '✅'}</div>
          <div className="result-content">
            <h3>
              {hasLoss ? '양도손실 발생' : (result.eligibility?.message || '세금 없음')}
            </h3>
            <p className="result-amount">
              {hasLoss ? `손실액: ${formatNumber(Math.abs(result.capitalGains))}원` : '납부세액: 0원'}
            </p>
            {hasLoss && (
              <p className="result-note">
                양도소득세가 부과되지 않습니다. 손실액은 다른 양도소득과 통산 가능합니다.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 과세 대상 */}
      {!hasLoss && result.summary.totalTax > 0 && (
        <>
          <div className="result-highlight warning">
            <div className="result-icon">💰</div>
            <div className="result-content">
              <h3>총 납부세액</h3>
              <p className="result-amount">{formatNumber(result.summary.totalTax)}원</p>
              <div className="result-breakdown">
                <span>양도소득세: {formatNumber(result.summary.capitalGainsTax)}원</span>
                <span>지방소득세: {formatNumber(result.summary.localIncomeTax)}원</span>
              </div>
              <p className="result-note">
                실효세율: {result.summary.effectiveTaxRate}%
              </p>
            </div>
          </div>

          {/* 상세 계산 과정 */}
          <div className="calculation-details">
            <h3>상세 계산 과정</h3>

            <div className="detail-section">
              <h4>1️⃣ 기본 정보</h4>

              <div className="detail-row">
                <span className="detail-label">보유기간</span>
                <span className="detail-value">
                  {result.holdingYears.toFixed(1)}년
                </span>
              </div>

              {result.residenceYears > 0 && (
                <div className="detail-row">
                  <span className="detail-label">거주기간</span>
                  <span className="detail-value">
                    {result.residenceYears.toFixed(1)}년
                  </span>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">양도차익</span>
                <span className="detail-value">{formatNumber(result.capitalGains)}원</span>
              </div>
            </div>

            {/* 1세대1주택 비과세 */}
            {result.exemption && result.exemption.exemptionType !== 'NONE' && (
              <div className="detail-section highlight-green">
                <h4>2️⃣ 1세대1주택 비과세</h4>

                <div className="detail-row">
                  <span className="detail-label">비과세 유형</span>
                  <span className="detail-value">
                    {result.exemption.exemptionType === 'FULL' ? '전액 면세' : '비례 면세'}
                  </span>
                </div>

                {result.exemption.exemptionRate && (
                  <div className="detail-row">
                    <span className="detail-label">면세율</span>
                    <span className="detail-value">
                      {formatPercent(result.exemption.exemptionRate)}
                    </span>
                  </div>
                )}

                <div className="detail-row total">
                  <span className="detail-label">비과세 금액</span>
                  <span className="detail-value negative">
                    - {formatNumber(result.exemption.exemptionAmount)}원
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">과세대상 금액</span>
                  <span className="detail-value">
                    {formatNumber(result.exemption.taxableAmount)}원
                  </span>
                </div>
              </div>
            )}

            {/* 장기보유특별공제 */}
            {result.deduction && result.deduction.deductionAmount > 0 && (
              <div className="detail-section highlight-blue">
                <h4>3️⃣ 장기보유특별공제</h4>

                <div className="detail-row">
                  <span className="detail-label">공제 유형</span>
                  <span className="detail-value">
                    {result.deduction.deductionType === 'ONE_HOME_HIGH_VALUE'
                      ? '1세대1주택 고가 (보유+거주)'
                      : '일반'}
                  </span>
                </div>

                {result.deduction.breakdown && (
                  <>
                    {result.deduction.breakdown.holdingDeduction.amount > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">보유공제 ({formatPercent(result.deduction.breakdown.holdingDeduction.rate)})</span>
                        <span className="detail-value">
                          - {formatNumber(result.deduction.breakdown.holdingDeduction.amount)}원
                        </span>
                      </div>
                    )}
                    {result.deduction.breakdown.residenceDeduction.amount > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">거주공제 ({formatPercent(result.deduction.breakdown.residenceDeduction.rate)})</span>
                        <span className="detail-value">
                          - {formatNumber(result.deduction.breakdown.residenceDeduction.amount)}원
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="detail-row total">
                  <span className="detail-label">공제 금액 ({formatPercent(result.deduction.deductionRate)})</span>
                  <span className="detail-value negative">
                    - {formatNumber(result.deduction.deductionAmount)}원
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">공제 후 과세표준</span>
                  <span className="detail-value">
                    {formatNumber(result.deduction.remainingTaxable)}원
                  </span>
                </div>
              </div>
            )}

            {/* 세율 적용 */}
            <div className="detail-section">
              <h4>4️⃣ 세율 적용</h4>

              <div className="detail-row">
                <span className="detail-label">과세표준</span>
                <span className="detail-value">
                  {formatNumber(result.tax.taxableGains)}원
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">세율 유형</span>
                <span className="detail-value">
                  {result.effectiveRate.rateType === 'FLAT'
                    ? '단일세율'
                    : result.heavyTaxStatus.heavyTaxApplied
                      ? '누진세율 + 중과'
                      : '누진세율'}
                </span>
              </div>

              {result.effectiveRate.baseRate !== result.effectiveRate.effectiveRate && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">기본세율</span>
                    <span className="detail-value">
                      {formatPercent(result.effectiveRate.baseRate)}
                    </span>
                  </div>
                  {result.effectiveRate.surcharge > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">중과세율</span>
                      <span className="detail-value">
                        + {formatPercent(result.effectiveRate.surcharge)}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="detail-row total">
                <span className="detail-label">적용세율</span>
                <span className="detail-value">
                  {formatPercent(result.effectiveRate.effectiveRate)}
                </span>
              </div>

              {result.effectiveRate.bracket && (
                <div className="detail-row">
                  <span className="detail-label">누진공제</span>
                  <span className="detail-value negative">
                    - {formatNumber(result.effectiveRate.bracket.deduction)}원
                  </span>
                </div>
              )}
            </div>

            {/* 최종 세액 */}
            <div className="detail-section final-tax">
              <h4>5️⃣ 최종 세액</h4>

              <div className="detail-row">
                <span className="detail-label">양도소득세</span>
                <span className="detail-value">
                  {formatNumber(result.summary.capitalGainsTax)}원
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">지방소득세 (10%)</span>
                <span className="detail-value">
                  {formatNumber(result.summary.localIncomeTax)}원
                </span>
              </div>

              <div className="detail-row total grand-total">
                <span className="detail-label">총 납부세액</span>
                <span className="detail-value">
                  {formatNumber(result.summary.totalTax)}원
                </span>
              </div>
            </div>
          </div>

          {/* 중과세 정보 */}
          {result.heavyTaxStatus && (
            <div className={`info-box ${result.heavyTaxStatus.heavyTaxApplied ? 'warning' : 'info'}`}>
              <h4>🏘️ 다주택자 중과세 정보</h4>
              <p>{result.heavyTaxStatus.message}</p>
              {result.heavyTaxStatus.reason === 'SUSPENDED' && (
                <p className="note">
                  ⚠️ 중과세는 2025-05-09까지 한시적으로 배제됩니다.
                  이후 판매 시 중과세가 적용될 수 있습니다.
                </p>
              )}
            </div>
          )}

          {/* 경고 및 권고사항 */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="warnings-box">
              <h4>💡 권고사항</h4>
              <ul>
                {result.warnings.map((warning, index) => (
                  <li key={index} className={`warning-${warning.impact?.toLowerCase()}`}>
                    <strong>[{warning.category}]</strong> {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* 법적 고지 */}
      <div className="legal-notice">
        <p>
          ⚠️ 본 계산 결과는 참고용이며, 실제 세액과 다를 수 있습니다.
          <br />
          정확한 세액은 세무사 또는 관할 세무서에 문의하시기 바랍니다.
        </p>
        <p className="calculation-version">
          계산 엔진 버전: {result.metadata?.version || '2.0.0'} |
          계산일시: {new Date(result.metadata?.calculationDate || Date.now()).toLocaleString('ko-KR')}
        </p>
      </div>
    </div>
  );
};

export default CapitalGainsTaxResultDisplay;
