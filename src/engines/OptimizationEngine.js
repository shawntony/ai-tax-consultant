/**
 * Optimization Engine
 * 노드 조합 생성 및 최적화 엔진
 *
 * @version 2.0.0
 * @date 2025-09-27
 */

import NodeGraph from '../models/NodeGraph.js';

// ===================================================
// Optimization Engine Class
// ===================================================
export class OptimizationEngine {
  constructor(nodeGraph, taxCalculator = null) {
    this.graph = nodeGraph;
    this.calculator = taxCalculator;
  }

  // ===================================================
  // Combination Generation
  // ===================================================

  /**
   * 모든 유효한 실행 순서 조합 생성
   * @param {number} maxCombinations - 최대 조합 수 (기본: 500)
   * @returns {Array} 유효한 조합 배열
   */
  generateValidCombinations(maxCombinations = 500) {
    const solutions = Array.from(this.graph.solutionNodes.values());

    console.log(`[OptimizationEngine] 총 ${solutions.length}개 솔루션으로부터 조합 생성 시작...`);

    // 1. 모든 부분집합 생성 (순열이 아닌 조합)
    const allSubsets = this.generateSubsets(solutions);
    console.log(`[OptimizationEngine] ${allSubsets.length}개 부분집합 생성됨`);

    // 2. 각 부분집합에 대해 모든 순열 생성
    let allPermutations = [];
    for (const subset of allSubsets) {
      if (subset.length === 0) continue; // 빈 집합 제외
      const perms = this.permute(subset);
      allPermutations = allPermutations.concat(perms);
    }
    console.log(`[OptimizationEngine] ${allPermutations.length}개 순열 생성됨`);

    // 3. 종속성 필터링
    const validByDependency = allPermutations.filter(combo =>
      this.validateDependencies(combo)
    );
    console.log(`[OptimizationEngine] 종속성 검증 후 ${validByDependency.length}개 조합 남음`);

    // 4. 상호 배타적 솔루션 필터링
    const finalCombos = validByDependency.filter(combo =>
      !this.hasConflictingSolutions(combo)
    );
    console.log(`[OptimizationEngine] 충돌 제거 후 ${finalCombos.length}개 조합 남음`);

    // 5. 최대 개수 제한 (성능 최적화를 위해 상위 N개만)
    const limitedCombos = finalCombos.slice(0, maxCombinations);
    console.log(`[OptimizationEngine] 최종 ${limitedCombos.length}개 조합 반환`);

    return limitedCombos;
  }

  /**
   * 부분집합 생성 (Power Set)
   * @param {Array} arr - 원소 배열
   * @returns {Array} 모든 부분집합
   */
  generateSubsets(arr) {
    const subsets = [[]];
    for (const elem of arr) {
      const length = subsets.length;
      for (let i = 0; i < length; i++) {
        subsets.push([...subsets[i], elem]);
      }
    }
    return subsets;
  }

  /**
   * 순열 생성 (Permutations)
   * @param {Array} arr - 원소 배열
   * @returns {Array} 모든 순열
   */
  permute(arr) {
    if (arr.length <= 1) return [arr];

    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const remainingPermuted = this.permute(remaining);

      for (const perm of remainingPermuted) {
        result.push([current, ...perm]);
      }
    }
    return result;
  }

  /**
   * 종속성 검증
   * @param {Array} combination - Solution 객체 배열
   * @returns {boolean} 종속성이 유효하면 true
   */
  validateDependencies(combination) {
    for (let i = 0; i < combination.length; i++) {
      const solution = combination[i];

      // 이 솔루션의 종속성들이 모두 앞에 나왔는지 확인
      for (const depId of solution.dependencies) {
        const depIndex = combination.findIndex(s => s.id === depId);

        // 종속성이 조합에 없거나, 뒤에 있으면 invalid
        if (depIndex === -1 || depIndex > i) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 상호 배타적 솔루션 체크 (충돌 검사)
   * @param {Array} combination - Solution 객체 배열
   * @returns {boolean} 충돌이 있으면 true
   */
  hasConflictingSolutions(combination) {
    // Graph의 CONFLICT edge를 확인
    const solutionIds = new Set(combination.map(s => s.id));

    for (const edge of this.graph.edges.values()) {
      if (edge.type === 'CONFLICT') {
        const hasFrom = solutionIds.has(edge.from);
        const hasTo = solutionIds.has(edge.to);

        // 두 솔루션이 모두 조합에 포함되어 있으면 충돌
        if (hasFrom && hasTo) {
          return true;
        }
      }
    }

    return false;
  }

  // ===================================================
  // Alternative (Workflow) Generation
  // ===================================================

  /**
   * 조합을 Alternative(대안) 객체로 변환
   * @param {Array} combination - Solution 객체 배열
   * @param {number} index - 대안 번호
   * @returns {Object} Alternative 객체
   */
  createAlternative(combination, index) {
    // 1. 총 절세액 계산
    const totalSavings = combination.reduce((sum, sol) => {
      return sum + Math.abs(sol.taxImpact); // 음수를 양수로 변환 (절세액)
    }, 0);

    // 2. 평균 복잡도 계산
    const complexityScore = this.getComplexityScore(combination);

    // 3. 최대 리스크 계산
    const riskScore = this.getRiskScore(combination);

    // 4. 예상 소요 기간 계산
    const estimatedDays = this.calculateEstimatedDays(combination);

    // 5. 최적화 점수 계산
    const optimizationScore = this.calculateScore({
      totalSavings,
      complexityScore,
      riskScore,
      estimatedDays
    });

    return {
      id: `alternative-${index}`,
      name: `시나리오 ${index + 1}`,
      description: this.generateDescription(combination),
      executionOrder: combination,
      totalSavings,
      complexityScore,
      riskScore,
      estimatedDays,
      optimizationScore,
      solutionTitles: combination.map(s => s.title)
    };
  }

  /**
   * Alternative 설명 자동 생성
   */
  generateDescription(combination) {
    const count = combination.length;
    const categories = [...new Set(combination.map(s => s.category))];

    return `${count}개 솔루션 조합 (${categories.join(', ')})`;
  }

  /**
   * 복잡도 점수 계산 (1-10)
   */
  getComplexityScore(combination) {
    const complexityMap = { 'LOW': 3, 'MEDIUM': 5, 'HIGH': 8 };
    const scores = combination.map(s => complexityMap[s.complexity] || 5);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * 리스크 점수 계산 (1-10)
   */
  getRiskScore(combination) {
    // 각 솔루션의 리스크 개수에서 최대값
    const riskCounts = combination.map(s => Math.min(s.risks.length * 2, 10));
    return Math.max(...riskCounts, 1);
  }

  /**
   * 예상 소요 기간 계산 (일)
   */
  calculateEstimatedDays(combination) {
    // estimatedTime을 일수로 변환
    const days = combination.map(s => {
      const time = s.estimatedTime || '';

      // "30일", "3개월" 등을 일수로 변환
      if (time.includes('일')) {
        return parseInt(time.match(/\d+/)?.[0] || '0');
      } else if (time.includes('개월')) {
        return parseInt(time.match(/\d+/)?.[0] || '0') * 30;
      } else if (time.includes('년')) {
        return parseInt(time.match(/\d+/)?.[0] || '0') * 365;
      } else if (time.includes('즉시') || time.includes('즉각')) {
        return 0;
      } else {
        return 30; // 기본값: 1개월
      }
    });

    // 순차적 실행이므로 합계
    return days.reduce((a, b) => a + b, 0);
  }

  /**
   * 최적화 점수 계산 (0-100)
   */
  calculateScore(alternative) {
    // Score = (절세액 * 0.5) + (100 - 복잡도*10) * 0.2 + (100 - 리스크*10) * 0.2 + (100 - 기간/10) * 0.1

    const savingsScore = Math.min((alternative.totalSavings / 1_000_000_000) * 50, 50); // 최대 50점 (10억 기준)
    const complexityScore = (100 - alternative.complexityScore * 10) * 0.2; // 최대 20점
    const riskScore = (100 - alternative.riskScore * 10) * 0.2; // 최대 20점
    const timeScore = (100 - alternative.estimatedDays / 10) * 0.1; // 최대 10점

    const totalScore = savingsScore + complexityScore + riskScore + timeScore;

    return Math.max(0, Math.min(100, totalScore)); // 0-100 범위로 제한
  }

  // ===================================================
  // Optimization Main Function
  // ===================================================

  /**
   * 최적화 실행 (모든 조합 생성 및 평가)
   * @param {number} maxCombinations - 최대 조합 수
   * @returns {Array} 평가된 Alternative 배열 (점수 내림차순)
   */
  optimize(maxCombinations = 500) {
    console.log('[OptimizationEngine] 최적화 시작...');

    // 1. 유효한 조합 생성
    const validCombinations = this.generateValidCombinations(maxCombinations);

    // 2. 각 조합을 Alternative로 변환
    const alternatives = validCombinations.map((combo, index) =>
      this.createAlternative(combo, index)
    );

    // 3. 점수 내림차순 정렬
    alternatives.sort((a, b) => b.optimizationScore - a.optimizationScore);

    console.log(`[OptimizationEngine] 최적화 완료: ${alternatives.length}개 대안 생성`);

    return alternatives;
  }

  /**
   * 최적 대안 찾기 (점수가 가장 높은 것)
   */
  findBestAlternative() {
    const alternatives = this.optimize();
    return alternatives.length > 0 ? alternatives[0] : null;
  }

  /**
   * 상위 N개 대안 찾기
   */
  findTopAlternatives(n = 5) {
    const alternatives = this.optimize();
    return alternatives.slice(0, n);
  }

  // ===================================================
  // Alternative Comparison
  // ===================================================

  /**
   * 두 대안 비교
   */
  compareAlternatives(alt1, alt2) {
    return {
      savingsDiff: alt1.totalSavings - alt2.totalSavings,
      complexityDiff: alt1.complexityScore - alt2.complexityScore,
      riskDiff: alt1.riskScore - alt2.riskScore,
      timeDiff: alt1.estimatedDays - alt2.estimatedDays,
      scoreDiff: alt1.optimizationScore - alt2.optimizationScore
    };
  }

  /**
   * 대안 분석 보고서 생성
   */
  generateReport(alternative) {
    return {
      id: alternative.id,
      name: alternative.name,
      summary: {
        totalSavings: `${(alternative.totalSavings / 100000000).toFixed(1)}억원`,
        complexity: this.getComplexityLabel(alternative.complexityScore),
        risk: this.getRiskLabel(alternative.riskScore),
        duration: `약 ${alternative.estimatedDays}일`,
        score: `${alternative.optimizationScore.toFixed(1)}점`
      },
      solutions: alternative.executionOrder.map((sol, index) => ({
        step: index + 1,
        title: sol.title,
        taxImpact: `${Math.abs(sol.taxImpact / 100000000).toFixed(1)}억원 절세`,
        complexity: sol.complexity,
        risks: sol.risks.length,
        requirements: sol.requirements
      }))
    };
  }

  /**
   * 복잡도 레이블
   */
  getComplexityLabel(score) {
    if (score < 4) return '낮음';
    if (score < 6) return '보통';
    return '높음';
  }

  /**
   * 리스크 레이블
   */
  getRiskLabel(score) {
    if (score < 4) return '낮음';
    if (score < 7) return '보통';
    return '높음';
  }
}

// ===================================================
// Export
// ===================================================
export default OptimizationEngine;
