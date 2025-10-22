/**
 * Tax Simulator Component
 * 실시간 세금 계산 시뮬레이터
 *
 * @version 1.0.0
 * @date 2025-10-22
 */

import React, { useState, useEffect } from 'react';
import {
  calculateGiftTax,
  calculateInheritanceTax,
  calculateAcquisitionTax,
  optimizeBurdensomeGift
} from '../../utils/taxCalculator';
import './TaxSimulator.css';

export default function TaxSimulator({ collectedInfo }) {
  const [activeTab, setActiveTab] = useState('gift'); // 'gift', 'inheritance', 'burdensome'
  const [results, setResults] = useState(null);

  // 수집된 정보에서 초기값 설정
  const [params, setParams] = useState({
    propertyValue: collectedInfo?.rawAnswers?.propertyValue || 1000000000,
    acquisitionCost: collectedInfo?.rawAnswers?.acquisitionCost || 700000000,
    relationship: collectedInfo?.rawAnswers?.heirIndex === 1 ? 'adult_child' : 'adult_child',
    priorGifts: collectedInfo?.rawAnswers?.priorGiftsAmount || 0,
    loanAmount: collectedInfo?.rawAnswers?.loanAmount || 0,
    donorAge: collectedInfo?.rawAnswers?.donorAge || 70,
    recipientAge: 40,
    houseCount: parseInt(collectedInfo?.rawAnswers?.heirHousingStatus) || 0,
    numberOfChildren: collectedInfo?.rawAnswers?.numberOfChildren || 2,
    spouseAlive: collectedInfo?.rawAnswers?.spouseStatus === 'alive'
  });

  // 계산 실행
  useEffect(() => {
    calculateTaxes();
  }, [params, activeTab]);

  const calculateTaxes = () => {
    if (activeTab === 'gift') {
      const result = calculateGiftTax(
        params.propertyValue,
        params.relationship,
        params.priorGifts,
        params.donorAge,
        params.recipientAge
      );
      setResults(result);
    } else if (activeTab === 'inheritance') {
      const result = calculateInheritanceTax(
        params.propertyValue,
        {
          spouse: params.spouseAlive,
          children: params.numberOfChildren,
          minorChildren: 0,
          elderly: 0,
          disabled: 0
        },
        0,
        10000000
      );
      setResults(result);
    } else if (activeTab === 'burdensome') {
      const result = optimizeBurdensomeGift(
        params.propertyValue,
        params.acquisitionCost,
        params.loanAmount || params.propertyValue * 0.7,
        params.relationship
      );
      setResults(result);
    }
  };

  const handleParamChange = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="tax-simulator">
      {/* 탭 메뉴 */}
      <div className="simulator-tabs">
        <button
          className={`tab-btn ${activeTab === 'gift' ? 'active' : ''}`}
          onClick={() => setActiveTab('gift')}
        >
          💝 증여세
        </button>
        <button
          className={`tab-btn ${activeTab === 'inheritance' ? 'active' : ''}`}
          onClick={() => setActiveTab('inheritance')}
        >
          🏛️ 상속세
        </button>
        <button
          className={`tab-btn ${activeTab === 'burdensome' ? 'active' : ''}`}
          onClick={() => setActiveTab('burdensome')}
        >
          ⚖️ 부담부증여 최적화
        </button>
      </div>

      {/* 입력 파라미터 */}
      <div className="simulator-inputs">
        <h3>📝 파라미터 조정</h3>

        <div className="input-grid">
          <div className="input-group">
            <label>부동산 시가</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={params.propertyValue}
                onChange={(e) => handleParamChange('propertyValue', parseInt(e.target.value))}
                step="100000000"
              />
              <span className="unit">원</span>
            </div>
            <input
              type="range"
              min="100000000"
              max="5000000000"
              step="100000000"
              value={params.propertyValue}
              onChange={(e) => handleParamChange('propertyValue', parseInt(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{(params.propertyValue / 100000000).toFixed(1)}억원</span>
          </div>

          {(activeTab === 'burdensome') && (
            <div className="input-group">
              <label>취득가액</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={params.acquisitionCost}
                  onChange={(e) => handleParamChange('acquisitionCost', parseInt(e.target.value))}
                  step="100000000"
                />
                <span className="unit">원</span>
              </div>
              <input
                type="range"
                min="100000000"
                max={params.propertyValue}
                step="100000000"
                value={params.acquisitionCost}
                onChange={(e) => handleParamChange('acquisitionCost', parseInt(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{(params.acquisitionCost / 100000000).toFixed(1)}억원</span>
            </div>
          )}

          {activeTab === 'gift' && (
            <>
              <div className="input-group">
                <label>이전 증여금액 (10년 이내)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.priorGifts}
                    onChange={(e) => handleParamChange('priorGifts', parseInt(e.target.value))}
                    step="10000000"
                  />
                  <span className="unit">원</span>
                </div>
              </div>

              <div className="input-group">
                <label>증여자 나이</label>
                <input
                  type="number"
                  value={params.donorAge}
                  onChange={(e) => handleParamChange('donorAge', parseInt(e.target.value))}
                  min="50"
                  max="100"
                />
              </div>
            </>
          )}

          {activeTab === 'inheritance' && (
            <>
              <div className="input-group">
                <label>자녀 수</label>
                <input
                  type="number"
                  value={params.numberOfChildren}
                  onChange={(e) => handleParamChange('numberOfChildren', parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>

              <div className="input-group">
                <label>배우자 생존 여부</label>
                <select
                  value={params.spouseAlive}
                  onChange={(e) => handleParamChange('spouseAlive', e.target.value === 'true')}
                >
                  <option value="true">생존</option>
                  <option value="false">사망</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 계산 결과 */}
      <div className="simulator-results">
        {activeTab === 'burdensome' && results ? (
          // 부담부증여 최적화 결과
          <div className="optimization-results">
            <div className="optimal-strategy">
              <h3>🎯 최적 전략</h3>
              <div className="optimal-card">
                <div className="optimal-title">{results.optimal.scenario}</div>
                <div className="optimal-savings">
                  절세액: <span className="highlight">{results.optimal.savings.toLocaleString()}원</span>
                </div>
                <div className="optimal-rate">
                  절세율: {results.optimal.savingsRate}
                </div>
              </div>
              <p className="recommendation">{results.recommendation}</p>
            </div>

            <div className="scenarios-comparison">
              <h3>📊 시나리오 비교</h3>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>전략</th>
                    <th>채무</th>
                    <th>증여</th>
                    <th>증여세</th>
                    <th>양도세</th>
                    <th>취득세</th>
                    <th>총 세금</th>
                  </tr>
                </thead>
                <tbody>
                  {results.scenarios.map((scenario, idx) => (
                    <tr key={idx} className={idx === 0 ? 'optimal-row' : ''}>
                      <td>{scenario.scenario}</td>
                      <td>{(scenario.debtAmount / 100000000).toFixed(1)}억</td>
                      <td>{(scenario.giftAmount / 100000000).toFixed(1)}억</td>
                      <td>{(scenario.giftTax / 10000).toFixed(0)}만</td>
                      <td>{(scenario.capitalGainsTax / 10000).toFixed(0)}만</td>
                      <td>{(scenario.acquisitionTax / 10000).toFixed(0)}만</td>
                      <td className="total">{(scenario.totalTax / 100000000).toFixed(2)}억</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : results ? (
          // 일반 세금 계산 결과
          <div className="tax-results">
            <div className="result-summary">
              <div className="summary-card">
                <div className="card-label">최종 납부세액</div>
                <div className="card-value highlight">{results.finalTax.toLocaleString()}원</div>
                <div className="card-rate">실효세율: {results.effectiveRate}%</div>
              </div>
            </div>

            <div className="result-breakdown">
              <h3>📋 계산 과정</h3>
              <div className="breakdown-list">
                {Object.entries(results.breakdown).map(([key, value]) => (
                  <div key={key} className="breakdown-item">
                    <span className="breakdown-label">{key.replace(/step\d+_/, '')}:</span>
                    <span className="breakdown-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="no-results">
            <p>파라미터를 조정하여 세금을 계산하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
