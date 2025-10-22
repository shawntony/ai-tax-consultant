/**
 * AI Analysis Stream Component
 * 실시간 AI 분석 과정 표시
 * @version 1.0.0
 */

import React, { useEffect, useRef } from 'react';

export default function AIAnalysisStream({ messages, isActive }) {
  const streamRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="ai-analysis-stream" ref={streamRef}>
      {messages.length === 0 && !isActive && (
        <div className="ai-stream-message" style={{ animationDelay: '0s' }}>
          <div className="ai-stream-icon">🤖</div>
          <div className="ai-stream-text">
            AI 분석을 시작하려면 케이스를 입력하고 버튼을 클릭하세요...
          </div>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className="ai-stream-message"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="ai-stream-icon">
            {message.type === 'success' ? '✓' : message.type === 'error' ? '✗' : '⚡'}
          </div>
          <div className={`ai-stream-text ${message.type || ''}`}>
            {message.text}
          </div>
        </div>
      ))}

      {isActive && (
        <div className="ai-stream-message" style={{ animationDelay: `${messages.length * 0.1}s` }}>
          <div className="ai-stream-icon">
            <div className="spinner"></div>
          </div>
          <div className="ai-stream-text">
            AI가 분석 중입니다...
          </div>
        </div>
      )}
    </div>
  );
}
