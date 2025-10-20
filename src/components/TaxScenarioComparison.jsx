/**
 * Tax Scenario Comparison Component
 * 보유기간별 세금 비교 컴포넌트
 *
 * @version 1.0.0
 * @date 2025-10-18
 */

import React from 'react';

const TaxScenarioComparison = ({ scenarios, formatNumber, formatPercent }) => {
  if (!scenarios || scenarios.length === 0) return null;

  // 최저 세금 시나리오 찾기
  const lowestTaxScenario = scenarios.reduce((min, scenario) =>
    scenario.totalTax < min.totalTax ? scenario : min
  , scenarios[0]);

  return (
    <div className="scenario-comparison">
      <h3>📈 보유기간별 세금 비교</h3>
      <p className="subtitle">다양한 보유기간에 따른 세금 부담을 비교합니다</p>

      <div className="scenario-table">
        <table>
          <thead>
            <tr>
              <th>보유기간</th>
              <th>양도예정일</th>
              <th>면세금액</th>
              <th>공제금액</th>
              <th>양도소득세</th>
              <th>지방소득세</th>
              <th className="total-column">총 납부세액</th>
              <th>실효세율</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario, index) => {
              const isLowest = scenario.holdingYears === lowestTaxScenario.holdingYears;
              const rowClass = isLowest ? 'lowest-tax' : '';

              return (
                <tr key={index} className={rowClass}>
                  <td className="holding-years">
                    {scenario.holdingYears}년
                    {isLowest && <span className="badge">✨ 최저</span>}
                  </td>
                  <td>
                    {new Date(scenario.saleDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="positive">
                    {formatNumber(scenario.exemption)}원
                  </td>
                  <td className="positive">
                    {formatNumber(scenario.deduction)}원
                  </td>
                  <td>
                    {formatNumber(scenario.summary.capitalGainsTax)}원
                  </td>
                  <td>
                    {formatNumber(scenario.summary.localIncomeTax)}원
                  </td>
                  <td className="total-column">
                    <strong>{formatNumber(scenario.totalTax)}원</strong>
                  </td>
                  <td>
                    {scenario.effectiveTaxRate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 추천 */}
      <div className="scenario-recommendation">
        <div className="recommendation-icon">💡</div>
        <div className="recommendation-content">
          <h4>추천 판매 시기</h4>
          <p>
            <strong>{lowestTaxScenario.holdingYears}년 보유</strong> 시 가장 낮은 세금 부담
            ({formatNumber(lowestTaxScenario.totalTax)}원)
          </p>
          <p className="recommendation-detail">
            예상 판매일: {new Date(lowestTaxScenario.saleDate).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* 인사이트 */}
      <div className="scenario-insights">
        <h4>📊 인사이트</h4>
        <ul>
          {scenarios[0].totalTax === 0 && scenarios[1].totalTax === 0 && (
            <li className="insight-item">
              ✅ 2년 이상 보유 시 1세대1주택 비과세 혜택을 받을 수 있습니다
            </li>
          )}

          {scenarios.some((s, i) => i > 0 && s.totalTax < scenarios[i-1].totalTax * 0.8) && (
            <li className="insight-item">
              📉 특정 보유기간에서 세금이 크게 감소합니다 (장기보유특별공제 효과)
            </li>
          )}

          {lowestTaxScenario.holdingYears >= 10 && (
            <li className="insight-item">
              🎯 10년 이상 보유 시 최대 장기보유특별공제 혜택을 받을 수 있습니다
            </li>
          )}

          {scenarios.length > 1 && (
            <li className="insight-item">
              💰 최저 세금과 최고 세금의 차이: {formatNumber(Math.max(...scenarios.map(s => s.totalTax)) - lowestTaxScenario.totalTax)}원
            </li>
          )}
        </ul>
      </div>

      {/* 차트 (간단한 막대 그래프) */}
      <div className="scenario-chart">
        <h4>세금 부담 비교</h4>
        <div className="bar-chart">
          {scenarios.map((scenario, index) => {
            const maxTax = Math.max(...scenarios.map(s => s.totalTax));
            const barWidth = maxTax > 0 ? (scenario.totalTax / maxTax * 100) : 0;
            const isLowest = scenario.holdingYears === lowestTaxScenario.holdingYears;

            return (
              <div key={index} className="bar-item">
                <span className="bar-label">{scenario.holdingYears}년</span>
                <div className="bar-container">
                  <div
                    className={`bar ${isLowest ? 'bar-lowest' : ''}`}
                    style={{ width: `${barWidth}%` }}
                  >
                    <span className="bar-value">{formatNumber(scenario.totalTax)}원</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaxScenarioComparison;
