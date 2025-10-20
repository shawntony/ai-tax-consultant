/**
 * CaseInput Component Tests
 *
 * 사례 입력 컴포넌트 테스트
 *
 * @version 1.0.0
 * @date 2024-10-18
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CaseInput from './CaseInput';

describe('CaseInput Component', () => {

  // ===========================================
  // 렌더링 테스트
  // ===========================================

  describe('기본 렌더링', () => {
    test('컴포넌트가 정상 렌더링', () => {
      render(<CaseInput />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    test('제목이 표시됨', () => {
      render(<CaseInput title="사례 입력" />);
      expect(screen.getByText('사례 입력')).toBeInTheDocument();
    });

    test('설명이 표시됨', () => {
      render(<CaseInput description="세금 계산을 위한 정보를 입력하세요" />);
      expect(screen.getByText(/세금 계산을 위한 정보/)).toBeInTheDocument();
    });

    test('필수 필드에 * 표시', () => {
      render(<CaseInput fields={[{ name: 'amount', label: '금액', required: true }]} />);
      expect(screen.getByText(/금액\s*\*/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // 입력 필드 테스트
  // ===========================================

  describe('입력 필드 동작', () => {
    test('텍스트 입력 동작', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <CaseInput
          fields={[{ name: 'name', type: 'text', label: '이름' }]}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('이름');
      await user.type(input, '홍길동');

      expect(input).toHaveValue('홍길동');
      expect(onChange).toHaveBeenCalled();
    });

    test('숫자 입력 동작', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <CaseInput
          fields={[{ name: 'amount', type: 'number', label: '금액' }]}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('금액');
      await user.type(input, '1000000');

      expect(input).toHaveValue(1000000);
    });

    test('날짜 입력 동작', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <CaseInput
          fields={[{ name: 'date', type: 'date', label: '날짜' }]}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('날짜');
      await user.type(input, '2024-10-18');

      expect(input).toHaveValue('2024-10-18');
    });

    test('선택 박스 동작', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <CaseInput
          fields={[{
            name: 'relationship',
            type: 'select',
            label: '관계',
            options: [
              { value: 'spouse', label: '배우자' },
              { value: 'child', label: '자녀' }
            ]
          }]}
          onChange={onChange}
        />
      );

      const select = screen.getByLabelText('관계');
      await user.selectOptions(select, 'spouse');

      expect(select).toHaveValue('spouse');
    });

    test('체크박스 동작', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <CaseInput
          fields={[{ name: 'agree', type: 'checkbox', label: '동의' }]}
          onChange={onChange}
        />
      );

      const checkbox = screen.getByLabelText('동의');
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  // ===========================================
  // 유효성 검증 테스트
  // ===========================================

  describe('유효성 검증', () => {
    test('필수 필드 누락 시 에러 표시', async () => {
      const user = userEvent.setup();

      render(
        <CaseInput
          fields={[{ name: 'amount', type: 'number', label: '금액', required: true }]}
          onSubmit={jest.fn()}
        />
      );

      const submitButton = screen.getByRole('button', { name: /제출/ });
      await user.click(submitButton);

      expect(screen.getByText(/필수 항목입니다/)).toBeInTheDocument();
    });

    test('최소값 검증', async () => {
      const user = userEvent.setup();

      render(
        <CaseInput
          fields={[{
            name: 'amount',
            type: 'number',
            label: '금액',
            min: 1000000
          }]}
        />
      );

      const input = screen.getByLabelText('금액');
      await user.type(input, '500000');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/최소 금액/)).toBeInTheDocument();
      });
    });

    test('최대값 검증', async () => {
      const user = userEvent.setup();

      render(
        <CaseInput
          fields={[{
            name: 'amount',
            type: 'number',
            label: '금액',
            max: 10000000000
          }]}
        />
      );

      const input = screen.getByLabelText('금액');
      await user.type(input, '20000000000');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/최대 금액/)).toBeInTheDocument();
      });
    });

    test('패턴 검증 (정규식)', async () => {
      const user = userEvent.setup();

      render(
        <CaseInput
          fields={[{
            name: 'phone',
            type: 'text',
            label: '전화번호',
            pattern: /^\d{3}-\d{4}-\d{4}$/
          }]}
        />
      );

      const input = screen.getByLabelText('전화번호');
      await user.type(input, '01012345678');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/형식이 올바르지 않습니다/)).toBeInTheDocument();
      });
    });

    test('커스텀 검증 함수', async () => {
      const user = userEvent.setup();
      const customValidator = (value) => {
        if (value < 0) return '양수만 입력 가능합니다';
        return null;
      };

      render(
        <CaseInput
          fields={[{
            name: 'amount',
            type: 'number',
            label: '금액',
            validate: customValidator
          }]}
        />
      );

      const input = screen.getByLabelText('금액');
      await user.type(input, '-1000');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/양수만 입력 가능/)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // 제출 동작 테스트
  // ===========================================

  describe('폼 제출', () => {
    test('유효한 데이터 제출', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(
        <CaseInput
          fields={[
            { name: 'name', type: 'text', label: '이름' },
            { name: 'amount', type: 'number', label: '금액' }
          ]}
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByLabelText('이름'), '홍길동');
      await user.type(screen.getByLabelText('금액'), '1000000');
      await user.click(screen.getByRole('button', { name: /제출/ }));

      expect(onSubmit).toHaveBeenCalledWith({
        name: '홍길동',
        amount: 1000000
      });
    });

    test('제출 중 로딩 상태', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(
        <CaseInput
          fields={[{ name: 'name', type: 'text', label: '이름' }]}
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByLabelText('이름'), '홍길동');
      await user.click(screen.getByRole('button', { name: /제출/ }));

      expect(screen.getByRole('button', { name: /제출 중/ })).toBeDisabled();
    });

    test('제출 실패 시 에러 메시지', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn(() => Promise.reject(new Error('제출 실패')));

      render(
        <CaseInput
          fields={[{ name: 'name', type: 'text', label: '이름' }]}
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByLabelText('이름'), '홍길동');
      await user.click(screen.getByRole('button', { name: /제출/ }));

      await waitFor(() => {
        expect(screen.getByText(/제출 실패/)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // 초기화 및 리셋 테스트
  // ===========================================

  describe('폼 리셋', () => {
    test('리셋 버튼 클릭 시 폼 초기화', async () => {
      const user = userEvent.setup();

      render(
        <CaseInput
          fields={[
            { name: 'name', type: 'text', label: '이름' },
            { name: 'amount', type: 'number', label: '금액' }
          ]}
          showResetButton
        />
      );

      const nameInput = screen.getByLabelText('이름');
      const amountInput = screen.getByLabelText('금액');

      await user.type(nameInput, '홍길동');
      await user.type(amountInput, '1000000');

      await user.click(screen.getByRole('button', { name: /초기화/ }));

      expect(nameInput).toHaveValue('');
      expect(amountInput).toHaveValue(null);
    });

    test('초기값으로 리셋', async () => {
      const user = userEvent.setup();

      render(
        <CaseInput
          fields={[{ name: 'name', type: 'text', label: '이름' }]}
          initialValues={{ name: '초기이름' }}
          showResetButton
        />
      );

      const input = screen.getByLabelText('이름');

      await user.clear(input);
      await user.type(input, '새이름');
      await user.click(screen.getByRole('button', { name: /초기화/ }));

      expect(input).toHaveValue('초기이름');
    });
  });

  // ===========================================
  // 접근성 테스트
  // ===========================================

  describe('접근성 (Accessibility)', () => {
    test('모든 입력 필드에 label 연결', () => {
      render(
        <CaseInput
          fields={[
            { name: 'field1', type: 'text', label: 'Field 1' },
            { name: 'field2', type: 'number', label: 'Field 2' }
          ]}
        />
      );

      expect(screen.getByLabelText('Field 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Field 2')).toBeInTheDocument();
    });

    test('에러 메시지에 aria-describedby 설정', async () => {
      const user = userEvent.setup();

      render(
        <CaseInput
          fields={[{ name: 'amount', type: 'number', label: '금액', required: true }]}
          onSubmit={jest.fn()}
        />
      );

      await user.click(screen.getByRole('button', { name: /제출/ }));

      const input = screen.getByLabelText('금액');
      const errorMessage = screen.getByText(/필수 항목입니다/);

      expect(input).toHaveAttribute('aria-describedby');
      expect(input.getAttribute('aria-describedby')).toContain(errorMessage.id);
    });

    test('키보드 네비게이션 지원', async () => {
      const user = userEvent.setup();

      render(
        <CaseInput
          fields={[
            { name: 'field1', type: 'text', label: 'Field 1' },
            { name: 'field2', type: 'text', label: 'Field 2' }
          ]}
        />
      );

      const field1 = screen.getByLabelText('Field 1');
      const field2 = screen.getByLabelText('Field 2');

      field1.focus();
      expect(field1).toHaveFocus();

      await user.tab();
      expect(field2).toHaveFocus();
    });
  });

  // ===========================================
  // 특수 시나리오 테스트
  // ===========================================

  describe('특수 시나리오', () => {
    test('조건부 필드 표시', () => {
      const { rerender } = render(
        <CaseInput
          fields={[
            { name: 'hasSpouse', type: 'checkbox', label: '배우자 있음' }
          ]}
        />
      );

      expect(screen.queryByLabelText('배우자 이름')).not.toBeInTheDocument();

      rerender(
        <CaseInput
          fields={[
            { name: 'hasSpouse', type: 'checkbox', label: '배우자 있음' },
            {
              name: 'spouseName',
              type: 'text',
              label: '배우자 이름',
              visible: (values) => values.hasSpouse === true
            }
          ]}
          values={{ hasSpouse: true }}
        />
      );

      expect(screen.getByLabelText('배우자 이름')).toBeInTheDocument();
    });

    test('필드 간 의존성', async () => {
      const user = userEvent.setup();

      render(
        <CaseInput
          fields={[
            { name: 'totalAmount', type: 'number', label: '총금액' },
            { name: 'debtAmount', type: 'number', label: '부채금액' },
            {
              name: 'netAmount',
              type: 'number',
              label: '순금액',
              readOnly: true,
              calculate: (values) => (values.totalAmount || 0) - (values.debtAmount || 0)
            }
          ]}
        />
      );

      await user.type(screen.getByLabelText('총금액'), '1000000000');
      await user.type(screen.getByLabelText('부채금액'), '100000000');

      await waitFor(() => {
        expect(screen.getByLabelText('순금액')).toHaveValue(900000000);
      });
    });

    test('다국어 지원', () => {
      render(
        <CaseInput
          fields={[{ name: 'amount', type: 'number', label: 'Amount' }]}
          locale="en"
          translations={{
            en: {
              required: 'This field is required',
              submit: 'Submit',
              reset: 'Reset'
            }
          }}
        />
      );

      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
  });
});
