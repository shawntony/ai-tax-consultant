/**
 * PDF Generator - 기본 구조 및 헤더
 * 
 * jsPDF를 사용한 세금 계산 리포트 PDF 생성
 * 
 * @module utils/pdfGenerator
 * @version 1.0.0
 * @date 2024-10-18
 */

import jsPDF from 'jspdf';

/**
 * PDF 문서 초기화 및 기본 설정
 * @returns {jsPDF} PDF 문서 객체
 */
export function initializePDF() {
  // A4 세로 레이아웃 (210mm × 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  return doc;
}

/**
 * PDF 헤더 생성
 * @param {jsPDF} doc - PDF 문서 객체
 * @param {object} options - 헤더 옵션
 * @param {string} options.title - 문서 제목
 * @param {string} options.subtitle - 부제목 (선택)
 * @param {Date} options.date - 생성 날짜
 */
export function generatePDFHeader(doc, options = {}) {
  const {
    title = 'AI Tax Consultant - 세금 계산 리포트',
    subtitle = '',
    date = new Date()
  } = options;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // 로고 영역 (향후 이미지 추가 가능)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  
  // 제목
  doc.text(title, pageWidth / 2, 30, { align: 'center' });

  // 부제목
  if (subtitle) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, 40, { align: 'center' });
  }

  // 날짜
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`생성일: ${dateStr}`, pageWidth - margin, 30, { align: 'right' });

  // 구분선
  doc.setLineWidth(0.5);
  doc.line(margin, 45, pageWidth - margin, 45);

  return 50; // 다음 컨텐츠 시작 Y 위치 반환
}

/**
 * 기본 PDF 생성 테스트
 * @param {string} filename - 저장할 파일명
 * @returns {Promise<void>}
 */
export async function testPDFGeneration(filename = 'test-report.pdf') {
  try {
    const doc = initializePDF();
    
    const nextY = generatePDFHeader(doc, {
      title: 'AI Tax Consultant',
      subtitle: '세금 계산 리포트 테스트',
      date: new Date()
    });

    // 테스트 컨텐츠
    doc.setFontSize(12);
    doc.text('PDF 생성 테스트 성공!', 20, nextY + 10);
    doc.text('jsPDF가 정상적으로 작동합니다.', 20, nextY + 20);

    // PDF 저장
    doc.save(filename);
    
    return { success: true, message: 'PDF generated successfully' };
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('PDF 생성 실패');
  }
}

/**
 * 페이지 번호 추가
 * @param {jsPDF} doc - PDF 문서 객체
 */
export function addPageNumbers(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${i} / ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
}

/**
 * PDF 사례 요약 섹션 생성
 * @param {jsPDF} doc - PDF 문서 객체
 * @param {object} caseData - 사례 데이터
 * @param {string} caseData.taxType - 세금 유형 (상속세/증여세/양도소득세)
 * @param {string} caseData.summary - AI 분석 요약
 * @param {Array<string>} caseData.keyIssues - 주요 이슈 목록
 * @param {string} caseData.recommendation - AI 권장사항
 * @param {number} startY - 시작 Y 위치
 * @returns {number} 다음 컨텐츠 시작 Y 위치
 */
export function generateCaseSummary(doc, caseData, startY = 55) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let currentY = startY;

  // 섹션 제목
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('사례 요약', margin, currentY);
  currentY += 10;

  // 구분선
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // 세금 유형
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('세금 유형:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(caseData.taxType || '양도소득세', margin + 30, currentY);
  currentY += 8;

  // AI 분석 요약
  doc.setFont('helvetica', 'bold');
  doc.text('AI 분석 요약:', margin, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(
    caseData.summary || 'AI 분석 결과가 여기에 표시됩니다.',
    maxWidth - 5
  );

  summaryLines.forEach(line => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(line, margin + 5, currentY);
    currentY += 5;
  });
  currentY += 5;

  // 주요 이슈
  if (caseData.keyIssues && caseData.keyIssues.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('주요 이슈:', margin, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    caseData.keyIssues.forEach((issue, index) => {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = 20;
      }
      const issueLines = doc.splitTextToSize(`${index + 1}. ${issue}`, maxWidth - 10);
      issueLines.forEach(line => {
        doc.text(line, margin + 5, currentY);
        currentY += 5;
      });
      currentY += 2;
    });
    currentY += 5;
  }

  // AI 권장사항
  if (caseData.recommendation) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI 권장사항:', margin, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const recommendationLines = doc.splitTextToSize(
      caseData.recommendation,
      maxWidth - 5
    );

    recommendationLines.forEach(line => {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(line, margin + 5, currentY);
      currentY += 5;
    });
    currentY += 5;
  }

  // 섹션 구분선
  currentY += 5;
  doc.setLineWidth(0.2);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  return currentY;
}

export default {
  initializePDF,
  generatePDFHeader,
  testPDFGeneration,
  addPageNumbers,
  generateCaseSummary
};
