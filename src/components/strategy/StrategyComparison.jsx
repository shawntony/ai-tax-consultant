/**
 * Strategy Comparison Component
 * 시나리오별 전략 비교 테이블
 *
 * @version 1.0.0
 * @date 2025-10-22
 */

import React, { useState } from 'react';
import './StrategyComparison.css';

export default function StrategyComparison({ scenarios, recommendedScenario }) {
  const [sortBy, setSortBy] = useState('totalTax'); // totalTax, giftTax, capitalGainsTax
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="strategy-comparison empty">
        <p>비교할 시나리오가 없습니다.</p>
      </div>
    );
  }

  // 정렬 처리
  const sortedScenarios = [...scenarios].sort((a, b) => {
    const aValue = a.taxCalculation?.[sortBy] || 0;
    const bValue = b.taxCalculation?.[sortBy] || 0;
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // 정렬 변경 핸들러
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // 정렬 아이콘
  const getSortIcon = (column) => {
    if (sortBy !== column) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // 복잡도 배지 색상
  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'complexity-low';
      case 'medium': return 'complexity-medium';
      case 'high': return 'complexity-high';
      default: return 'complexity-medium';
    }
  };

  // 추천 시나리오 여부
  const isRecommended = (scenarioName) => {
    return scenarioName === recommendedScenario;
  };

  return (
    <div className="strategy-comparison">
      <div className="comparison-header">
        <h2>📊 전략 시나리오 비교</h2>
        <div className="comparison-legend">
          <span className="legend-item">
            <span className="legend-color recommended"></span>
            추천 전략
          </span>
          <span className="legend-item">
            <span className="legend-color low"></span>
            낮은 복잡도
          </span>
          <span className="legend-item">
            <span className="legend-color medium"></span>
            중간 복잡도
          </span>
          <span className="legend-item">
            <span className="legend-color high"></span>
            높은 복잡도
          </span>
        </div>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="col-scenario">전략명</th>
              <th className="col-description">설명</th>
              <th className="col-tax sortable" onClick={() => handleSort('giftTax')}>
                증여세 {getSortIcon('giftTax')}
              </th>
              <th className="col-tax sortable" onClick={() => handleSort('capitalGainsTax')}>
                양도세 {getSortIcon('capitalGainsTax')}
              </th>
              <th className="col-tax sortable" onClick={() => handleSort('acquisitionTax')}>
                취득세 {getSortIcon('acquisitionTax')}
              </th>
              <th className="col-tax sortable" onClick={() => handleSort('totalTax')}>
                총 세금 {getSortIcon('totalTax')}
              </th>
              <th className="col-complexity">복잡도</th>
              <th className="col-timeframe">소요기간</th>
            </tr>
          </thead>
          <tbody>
            {sortedScenarios.map((scenario, index) => (
              <tr
                key={index}
                className={isRecommended(scenario.name) ? 'recommended-row' : ''}
              >
                <td className="col-scenario">
                  <div className="scenario-name">
                    {isRecommended(scenario.name) && <span className="badge-recommended">✨ 추천</span>}
                    <span className="name">{scenario.name}</span>
                  </div>
                </td>
                <td className="col-description">
                  <p className="description-text">{scenario.description}</p>
                </td>
                <td className="col-tax">
                  {(scenario.taxCalculation?.giftTax || 0).toLocaleString()}원
                </td>
                <td className="col-tax">
                  {(scenario.taxCalculation?.capitalGainsTax || 0).toLocaleString()}원
                </td>
                <td className="col-tax">
                  {(scenario.taxCalculation?.acquisitionTax || 0).toLocaleString()}원
                </td>
                <td className="col-tax total-tax">
                  <strong>{(scenario.taxCalculation?.totalTax || 0).toLocaleString()}원</strong>
                </td>
                <td className="col-complexity">
                  <span className={`badge-complexity ${getComplexityColor(scenario.complexity)}`}>
                    {scenario.complexity === 'low' && '낮음'}
                    {scenario.complexity === 'medium' && '중간'}
                    {scenario.complexity === 'high' && '높음'}
                  </span>
                </td>
                <td className="col-timeframe">
                  {scenario.timeframe || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 장단점 및 리스크 상세 보기 */}
      <div className="scenario-details">
        <h3>📋 각 시나리오 상세 분석</h3>
        <div className="details-grid">
          {sortedScenarios.map((scenario, index) => (
            <div
              key={index}
              className={`detail-card ${isRecommended(scenario.name) ? 'recommended-card' : ''}`}
            >
              <div className="detail-header">
                <h4>{scenario.name}</h4>
                {isRecommended(scenario.name) && <span className="badge-small">✨ 추천</span>}
              </div>

              <div className="detail-section">
                <h5>✅ 장점</h5>
                <ul>
                  {scenario.pros?.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  )) || <li>정보 없음</li>}
                </ul>
              </div>

              <div className="detail-section">
                <h5>❌ 단점</h5>
                <ul>
                  {scenario.cons?.map((con, i) => (
                    <li key={i}>{con}</li>
                  )) || <li>정보 없음</li>}
                </ul>
              </div>

              <div className="detail-section">
                <h5>⚠️ 리스크</h5>
                <ul>
                  {scenario.risks?.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  )) || <li>정보 없음</li>}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
