/**
 * ScenarioComparison Component Tests
 *
 * 시나리오 비교 컴포넌트 테스트
 *
 * @version 1.0.0
 * @date 2024-10-18
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ScenarioComparison from './ScenarioComparison';

describe('ScenarioComparison Component', () => {

  // 테스트 데이터
  const scenario1 = {
    id: 'scenario-1',
    name: '시나리오 A',
    taxType: 'inheritance',
    totalAssets: 1000000000,
    deductions: 700000000,
    taxableAmount: 300000000,
    taxAmount: 40000000,
    effectiveTaxRate: 4.0
  };

  const scenario2 = {
    id: 'scenario-2',
    name: '시나리오 B',
    taxType: 'inheritance',
    totalAssets: 1000000000,
    deductions: 800000000,
    taxableAmount: 200000000,
    taxAmount: 20000000,
    effectiveTaxRate: 2.0
  };

  const scenario3 = {
    id: 'scenario-3',
    name: '시나리오 C',
    taxType: 'inheritance',
    totalAssets: 1000000000,
    deductions: 600000000,
    taxableAmount: 400000000,
    taxAmount: 60000000,
    effectiveTaxRate: 6.0
  };

  // ===========================================
  // 기본 렌더링 테스트
  // ===========================================

  describe('기본 렌더링', () => {
    test('컴포넌트가 정상 렌더링', () => {
      render(<ScenarioComparison scenarios={[scenario1, scenario2]} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    test('시나리오 이름 표시', () => {
      render(<ScenarioComparison scenarios={[scenario1, scenario2]} />);
      expect(screen.getByText('시나리오 A')).toBeInTheDocument();
      expect(screen.getByText('시나리오 B')).toBeInTheDocument();
    });

    test('비교 항목 헤더 표시', () => {
      render(<ScenarioComparison scenarios={[scenario1, scenario2]} />);
      expect(screen.getByText('총자산')).toBeInTheDocument();
      expect(screen.getByText('공제액')).toBeInTheDocument();
      expect(screen.getByText('세액')).toBeInTheDocument();
    });

    test('빈 시나리오 배열 → 안내 메시지', () => {
      render(<ScenarioComparison scenarios={[]} />);
      expect(screen.getByText(/비교할 시나리오가 없습니다/)).toBeInTheDocument();
    });

    test('단일 시나리오 → 경고', () => {
      render(<ScenarioComparison scenarios={[scenario1]} />);
      expect(screen.getByText(/2개 이상의 시나리오가 필요합니다/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // 데이터 비교 테스트
  // ===========================================

  describe('데이터 비교', () => {
    test('세액 차이 계산', () => {
      render(<ScenarioComparison scenarios={[scenario1, scenario2]} />);

      // scenario1: 40,000,000원
      // scenario2: 20,000,000원
      // 차이: 20,000,000원 (50%)

      expect(screen.getByText(/2천만원 차이/)).toBeInTheDocument();
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });

    test('최저 세액 시나리오 강조', () => {
      render(<ScenarioComparison scenarios={[scenario1, scenario2, scenario3]} />);

      const bestScenario = screen.getByText('시나리오 B').closest('td');
      expect(bestScenario).toHaveClass('best-scenario');
    });

    test('최고 세액 시나리오 표시', () => {
      render(<ScenarioComparison scenarios={[scenario1, scenario2, scenario3]} />);

      const worstScenario = screen.getByText('시나리오 C').closest('td');
      expect(worstScenario).toHaveClass('worst-scenario');
    });

    test('실효세율 비교', () => {
      render(<ScenarioComparison scenarios={[scenario1, scenario2]} />);

      expect(screen.getByText('4.0%')).toBeInTheDocument();
      expect(screen.getByText('2.0%')).toBeInTheDocument();
    });

    test('절세액 계산', () => {
      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          showSavings
        />
      );

      // 40,000,000 - 20,000,000 = 20,000,000원 절세
      expect(screen.getByText(/2천만원 절세/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // 정렬 및 필터링 테스트
  // ===========================================

  describe('정렬 및 필터링', () => {
    test('세액 기준 오름차순 정렬', async () => {
      const user = userEvent.setup();

      render(<ScenarioComparison scenarios={[scenario3, scenario1, scenario2]} />);

      const sortButton = screen.getByRole('button', { name: /세액 정렬/ });
      await user.click(sortButton);

      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('시나리오 B')).toBeInTheDocument(); // 최저
      expect(within(rows[3]).getByText('시나리오 C')).toBeInTheDocument(); // 최고
    });

    test('세액 기준 내림차순 정렬', async () => {
      const user = userEvent.setup();

      render(<ScenarioComparison scenarios={[scenario1, scenario2, scenario3]} />);

      const sortButton = screen.getByRole('button', { name: /세액 정렬/ });
      await user.click(sortButton); // 오름차순
      await user.click(sortButton); // 내림차순

      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('시나리오 C')).toBeInTheDocument(); // 최고
      expect(within(rows[3]).getByText('시나리오 B')).toBeInTheDocument(); // 최저
    });

    test('실효세율 기준 정렬', async () => {
      const user = userEvent.setup();

      render(<ScenarioComparison scenarios={[scenario1, scenario2, scenario3]} />);

      const sortButton = screen.getByRole('button', { name: /실효세율 정렬/ });
      await user.click(sortButton);

      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('2.0%')).toBeInTheDocument();
    });

    test('시나리오 검색 필터', async () => {
      const user = userEvent.setup();

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2, scenario3]}
          showSearch
        />
      );

      const searchInput = screen.getByPlaceholderText(/검색/);
      await user.type(searchInput, '시나리오 B');

      expect(screen.getByText('시나리오 B')).toBeInTheDocument();
      expect(screen.queryByText('시나리오 A')).not.toBeInTheDocument();
      expect(screen.queryByText('시나리오 C')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // 시각화 테스트
  // ===========================================

  describe('시각화', () => {
    test('막대 차트 표시', () => {
      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          showChart
          chartType="bar"
        />
      );

      expect(screen.getByRole('img', { name: /세액 비교 차트/ })).toBeInTheDocument();
    });

    test('원형 차트 표시', () => {
      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          showChart
          chartType="pie"
        />
      );

      expect(screen.getByRole('img', { name: /세액 비교 차트/ })).toBeInTheDocument();
    });

    test('선 그래프 표시', () => {
      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2, scenario3]}
          showChart
          chartType="line"
        />
      );

      expect(screen.getByRole('img', { name: /세액 비교 차트/ })).toBeInTheDocument();
    });

    test('차트 범례 표시', () => {
      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          showChart
          showLegend
        />
      );

      expect(screen.getByText('시나리오 A')).toBeInTheDocument();
      expect(screen.getByText('시나리오 B')).toBeInTheDocument();
    });
  });

  // ===========================================
  // 상호작용 테스트
  // ===========================================

  describe('상호작용', () => {
    test('시나리오 선택', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          onSelect={onSelect}
        />
      );

      const row = screen.getByText('시나리오 A').closest('tr');
      await user.click(row);

      expect(onSelect).toHaveBeenCalledWith(scenario1);
    });

    test('시나리오 삭제', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          onDelete={onDelete}
          allowDelete
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /삭제/ });
      await user.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(scenario1.id);
    });

    test('시나리오 편집', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          onEdit={onEdit}
          allowEdit
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /편집/ });
      await user.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(scenario1.id);
    });

    test('시나리오 복사', async () => {
      const user = userEvent.setup();
      const onDuplicate = jest.fn();

      render(
        <ScenarioComparison
          scenarios={[scenario1]}
          onDuplicate={onDuplicate}
          allowDuplicate
        />
      );

      const duplicateButton = screen.getByRole('button', { name: /복사/ });
      await user.click(duplicateButton);

      expect(onDuplicate).toHaveBeenCalledWith(scenario1.id);
    });

    test('시나리오 드래그 앤 드롭 정렬', async () => {
      const onReorder = jest.fn();

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          onReorder={onReorder}
          allowReorder
        />
      );

      const rows = screen.getAllByRole('row');

      // 드래그 시뮬레이션
      fireEvent.dragStart(rows[1]);
      fireEvent.dragEnter(rows[2]);
      fireEvent.drop(rows[2]);

      expect(onReorder).toHaveBeenCalled();
    });
  });

  // ===========================================
  // 내보내기 테스트
  // ===========================================

  describe('내보내기', () => {
    test('CSV 내보내기', async () => {
      const user = userEvent.setup();

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          allowExport
        />
      );

      const exportButton = screen.getByRole('button', { name: /CSV 내보내기/ });
      await user.click(exportButton);

      // CSV 다운로드 확인
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('Excel 내보내기', async () => {
      const user = userEvent.setup();

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          allowExport
        />
      );

      const exportButton = screen.getByRole('button', { name: /Excel 내보내기/ });
      await user.click(exportButton);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('PDF 내보내기', async () => {
      const user = userEvent.setup();

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          allowExport
        />
      );

      const exportButton = screen.getByRole('button', { name: /PDF 내보내기/ });
      await user.click(exportButton);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  // ===========================================
  // 반응형 디자인 테스트
  // ===========================================

  describe('반응형 디자인', () => {
    test('모바일 뷰 - 카드 레이아웃', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          responsive
        />
      );

      expect(screen.getByTestId('card-layout')).toBeInTheDocument();
    });

    test('태블릿 뷰 - 테이블 레이아웃', () => {
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          responsive
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    test('데스크톱 뷰 - 전체 기능', () => {
      global.innerWidth = 1920;
      global.dispatchEvent(new Event('resize'));

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          responsive
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /정렬/ })).toBeInTheDocument();
    });
  });

  // ===========================================
  // 접근성 테스트
  // ===========================================

  describe('접근성 (Accessibility)', () => {
    test('테이블 캡션 제공', () => {
      render(<ScenarioComparison scenarios={[scenario1, scenario2]} />);

      expect(screen.getByRole('table')).toHaveAccessibleName();
    });

    test('정렬 버튼 aria-label', () => {
      render(<ScenarioComparison scenarios={[scenario1, scenario2]} />);

      const sortButton = screen.getByRole('button', { name: /세액 정렬/ });
      expect(sortButton).toHaveAttribute('aria-label');
    });

    test('키보드 네비게이션', async () => {
      const user = userEvent.setup();

      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          onSelect={jest.fn()}
        />
      );

      const rows = screen.getAllByRole('row').filter(row =>
        within(row).queryByText(/시나리오/)
      );

      rows[0].focus();
      expect(rows[0]).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(rows[1]).toHaveFocus();
    });

    test('스크린 리더용 설명', () => {
      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          aria-label="세금 시나리오 비교 테이블"
        />
      );

      expect(screen.getByLabelText(/세금 시나리오 비교 테이블/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // 특수 시나리오 테스트
  // ===========================================

  describe('특수 시나리오', () => {
    test('로딩 상태', () => {
      render(<ScenarioComparison scenarios={[]} loading />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('에러 상태', () => {
      render(
        <ScenarioComparison
          scenarios={[]}
          error="데이터를 불러올 수 없습니다"
        />
      );

      expect(screen.getByText(/데이터를 불러올 수 없습니다/)).toBeInTheDocument();
    });

    test('빈 상태 메시지 커스터마이징', () => {
      render(
        <ScenarioComparison
          scenarios={[]}
          emptyMessage="시나리오를 추가해주세요"
        />
      );

      expect(screen.getByText(/시나리오를 추가해주세요/)).toBeInTheDocument();
    });

    test('최대 시나리오 개수 제한', () => {
      const manyScenarios = Array.from({ length: 10 }, (_, i) => ({
        ...scenario1,
        id: `scenario-${i}`,
        name: `시나리오 ${i}`
      }));

      render(
        <ScenarioComparison
          scenarios={manyScenarios}
          maxScenarios={5}
        />
      );

      expect(screen.getByText(/최대 5개까지 비교/)).toBeInTheDocument();
    });

    test('다른 세금 타입 비교 불가', () => {
      const mixedScenarios = [
        { ...scenario1, taxType: 'inheritance' },
        { ...scenario2, taxType: 'gift' }
      ];

      render(<ScenarioComparison scenarios={mixedScenarios} />);

      expect(screen.getByText(/같은 세금 타입만 비교 가능/)).toBeInTheDocument();
    });

    test('추천 시나리오 뱃지', () => {
      render(
        <ScenarioComparison
          scenarios={[scenario1, scenario2]}
          showRecommendation
        />
      );

      const bestRow = screen.getByText('시나리오 B').closest('tr');
      expect(within(bestRow).getByText(/추천/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // 성능 테스트
  // ===========================================

  describe('성능', () => {
    test('많은 시나리오 렌더링', () => {
      const manyScenarios = Array.from({ length: 100 }, (_, i) => ({
        ...scenario1,
        id: `scenario-${i}`,
        name: `시나리오 ${i}`,
        taxAmount: 10000000 + i * 100000
      }));

      const start = performance.now();
      render(<ScenarioComparison scenarios={manyScenarios} />);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000); // 1초 미만
    });

    test('가상 스크롤링 (대용량 데이터)', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...scenario1,
        id: `scenario-${i}`,
        name: `시나리오 ${i}`
      }));

      render(
        <ScenarioComparison
          scenarios={largeDataset}
          virtualScroll
        />
      );

      // 실제 DOM에 렌더링된 행 수가 전체보다 적은지 확인
      const visibleRows = screen.getAllByRole('row');
      expect(visibleRows.length).toBeLessThan(1000);
    });
  });
});
