/**
 * NumericalInput Component Tests
 *
 * 숫자 입력 컴포넌트 테스트
 *
 * @version 1.0.0
 * @date 2024-10-18
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NumericalInput from './NumericalInput';

describe('NumericalInput Component', () => {

  // ===========================================
  // 기본 렌더링 테스트
  // ===========================================

  describe('기본 렌더링', () => {
    test('컴포넌트가 정상 렌더링', () => {
      render(<NumericalInput label="금액" />);
      expect(screen.getByLabelText('금액')).toBeInTheDocument();
    });

    test('라벨 표시', () => {
      render(<NumericalInput label="총자산" />);
      expect(screen.getByText('총자산')).toBeInTheDocument();
    });

    test('placeholder 표시', () => {
      render(<NumericalInput label="금액" placeholder="금액을 입력하세요" />);
      expect(screen.getByPlaceholderText('금액을 입력하세요')).toBeInTheDocument();
    });

    test('필수 필드 * 표시', () => {
      render(<NumericalInput label="금액" required />);
      expect(screen.getByText(/금액\s*\*/)).toBeInTheDocument();
    });

    test('초기값 표시', () => {
      render(<NumericalInput label="금액" value={1000000} />);
      expect(screen.getByDisplayValue('1,000,000')).toBeInTheDocument();
    });
  });

  // ===========================================
  // 숫자 입력 동작 테스트
  // ===========================================

  describe('숫자 입력 동작', () => {
    test('정수 입력', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<NumericalInput label="금액" onChange={onChange} />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '1000000');

      expect(onChange).toHaveBeenLastCalledWith(1000000);
    });

    test('소수점 입력', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<NumericalInput label="비율" allowDecimal onChange={onChange} />);

      const input = screen.getByLabelText('비율');
      await user.type(input, '12.5');

      expect(onChange).toHaveBeenLastCalledWith(12.5);
    });

    test('음수 입력', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<NumericalInput label="금액" allowNegative onChange={onChange} />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '-500000');

      expect(onChange).toHaveBeenLastCalledWith(-500000);
    });

    test('문자 입력 무시', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<NumericalInput label="금액" onChange={onChange} />);

      const input = screen.getByLabelText('금액');
      await user.type(input, 'abc123def456');

      // 숫자만 추출됨
      expect(onChange).toHaveBeenLastCalledWith(123456);
    });

    test('빈 입력 → null', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<NumericalInput label="금액" value={1000} onChange={onChange} />);

      const input = screen.getByLabelText('금액');
      await user.clear(input);

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  // ===========================================
  // 천 단위 구분 포맷팅 테스트
  // ===========================================

  describe('포맷팅', () => {
    test('천 단위 쉼표 자동 추가', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '1000000');

      expect(input).toHaveDisplayValue('1,000,000');
    });

    test('입력 중에도 실시간 포맷팅', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '1234567');

      expect(input).toHaveDisplayValue('1,234,567');
    });

    test('통화 기호 표시 (원)', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" currency="KRW" />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '1000000');

      expect(screen.getByText(/원/)).toBeInTheDocument();
    });

    test('통화 기호 표시 (달러)', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" currency="USD" />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '1000');

      expect(screen.getByText(/\$/)).toBeInTheDocument();
    });

    test('소수점 자릿수 제한', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="비율" allowDecimal decimalPlaces={2} />);

      const input = screen.getByLabelText('비율');
      await user.type(input, '12.3456');

      expect(input).toHaveDisplayValue('12.35'); // 반올림
    });
  });

  // ===========================================
  // 유효성 검증 테스트
  // ===========================================

  describe('유효성 검증', () => {
    test('최소값 검증', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" min={1000000} />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '500000');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/최소 1,000,000/)).toBeInTheDocument();
      });
    });

    test('최대값 검증', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" max={10000000000} />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '20000000000');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/최대 10,000,000,000/)).toBeInTheDocument();
      });
    });

    test('범위 검증 (min ~ max)', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" min={100} max={1000} />);

      const input = screen.getByLabelText('금액');

      // 최소값 미만
      await user.type(input, '50');
      fireEvent.blur(input);
      expect(screen.getByText(/최소 100/)).toBeInTheDocument();

      // 최대값 초과
      await user.clear(input);
      await user.type(input, '2000');
      fireEvent.blur(input);
      expect(screen.getByText(/최대 1,000/)).toBeInTheDocument();
    });

    test('필수 입력 검증', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" required />);

      const input = screen.getByLabelText(/금액/);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/필수 항목입니다/)).toBeInTheDocument();
      });
    });

    test('양수만 허용', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" positiveOnly />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '-1000');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/양수만 입력/)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // 단위 변환 테스트
  // ===========================================

  describe('단위 변환', () => {
    test('억 단위 변환', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" showUnitConverter />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '1000000000');

      expect(screen.getByText(/10억/)).toBeInTheDocument();
    });

    test('만 단위 변환', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" showUnitConverter />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '50000000');

      expect(screen.getByText(/5천만/)).toBeInTheDocument();
    });

    test('복합 단위 (억 + 만)', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" showUnitConverter />);

      const input = screen.getByLabelText('금액');
      await user.type(input, '320000000');

      expect(screen.getByText(/3억 2천만/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // 증감 버튼 테스트
  // ===========================================

  describe('증감 버튼', () => {
    test('증가 버튼 클릭', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <NumericalInput
          label="금액"
          value={1000000}
          step={100000}
          showSteppers
          onChange={onChange}
        />
      );

      const increaseButton = screen.getByRole('button', { name: /증가/ });
      await user.click(increaseButton);

      expect(onChange).toHaveBeenCalledWith(1100000);
    });

    test('감소 버튼 클릭', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <NumericalInput
          label="금액"
          value={1000000}
          step={100000}
          showSteppers
          onChange={onChange}
        />
      );

      const decreaseButton = screen.getByRole('button', { name: /감소/ });
      await user.click(decreaseButton);

      expect(onChange).toHaveBeenCalledWith(900000);
    });

    test('최소값 이하로 감소 불가', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <NumericalInput
          label="금액"
          value={1000000}
          min={1000000}
          step={100000}
          showSteppers
          onChange={onChange}
        />
      );

      const decreaseButton = screen.getByRole('button', { name: /감소/ });
      await user.click(decreaseButton);

      expect(onChange).not.toHaveBeenCalled();
      expect(decreaseButton).toBeDisabled();
    });

    test('최대값 이상 증가 불가', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <NumericalInput
          label="금액"
          value={10000000000}
          max={10000000000}
          step={100000}
          showSteppers
          onChange={onChange}
        />
      );

      const increaseButton = screen.getByRole('button', { name: /증가/ });
      await user.click(increaseButton);

      expect(onChange).not.toHaveBeenCalled();
      expect(increaseButton).toBeDisabled();
    });
  });

  // ===========================================
  // 키보드 단축키 테스트
  // ===========================================

  describe('키보드 단축키', () => {
    test('위 화살표 → 증가', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <NumericalInput
          label="금액"
          value={1000000}
          step={100000}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('금액');
      input.focus();
      await user.keyboard('{ArrowUp}');

      expect(onChange).toHaveBeenCalledWith(1100000);
    });

    test('아래 화살표 → 감소', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <NumericalInput
          label="금액"
          value={1000000}
          step={100000}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('금액');
      input.focus();
      await user.keyboard('{ArrowDown}');

      expect(onChange).toHaveBeenCalledWith(900000);
    });

    test('PageUp → 큰 단위 증가', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <NumericalInput
          label="금액"
          value={1000000}
          step={100000}
          largeStep={1000000}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('금액');
      input.focus();
      await user.keyboard('{PageUp}');

      expect(onChange).toHaveBeenCalledWith(2000000);
    });
  });

  // ===========================================
  // 접근성 테스트
  // ===========================================

  describe('접근성 (Accessibility)', () => {
    test('label과 input 연결', () => {
      render(<NumericalInput label="금액" id="amount-input" />);

      const label = screen.getByText('금액');
      const input = screen.getByLabelText('금액');

      expect(label).toHaveAttribute('for', 'amount-input');
      expect(input).toHaveAttribute('id', 'amount-input');
    });

    test('에러 시 aria-describedby 설정', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" required />);

      const input = screen.getByLabelText(/금액/);
      fireEvent.blur(input);

      await waitFor(() => {
        const errorMessage = screen.getByText(/필수 항목입니다/);
        expect(input).toHaveAttribute('aria-describedby');
        expect(input.getAttribute('aria-describedby')).toContain(errorMessage.id);
      });
    });

    test('스크린 리더용 설명', () => {
      render(
        <NumericalInput
          label="금액"
          aria-label="총 자산 금액을 입력하세요"
        />
      );

      const input = screen.getByLabelText(/총 자산 금액을 입력하세요/);
      expect(input).toBeInTheDocument();
    });
  });

  // ===========================================
  // 특수 시나리오 테스트
  // ===========================================

  describe('특수 시나리오', () => {
    test('readonly 모드', () => {
      render(<NumericalInput label="금액" value={1000000} readOnly />);

      const input = screen.getByLabelText('금액');
      expect(input).toHaveAttribute('readonly');
    });

    test('disabled 모드', () => {
      render(<NumericalInput label="금액" disabled />);

      const input = screen.getByLabelText('금액');
      expect(input).toBeDisabled();
    });

    test('로딩 상태', () => {
      render(<NumericalInput label="금액" loading />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('복사/붙여넣기 지원', async () => {
      const user = userEvent.setup();

      render(<NumericalInput label="금액" />);

      const input = screen.getByLabelText('금액');

      // 클립보드에서 붙여넣기 시뮬레이션
      await user.click(input);
      await user.paste('5,000,000');

      expect(input).toHaveDisplayValue('5,000,000');
    });

    test('드래그 앤 드롭 무시', async () => {
      render(<NumericalInput label="금액" />);

      const input = screen.getByLabelText('금액');

      fireEvent.drop(input, {
        dataTransfer: {
          getData: () => 'not a number'
        }
      });

      expect(input).toHaveValue(null);
    });
  });
});
