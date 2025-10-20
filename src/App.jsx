/**
 * Main App Component with Routing
 *
 * MVP 라우팅 설정 - Code Splitting 적용
 *
 * @component App
 * @version 1.1.0
 * @date 2025-10-20
 * @optimization React.lazy를 사용한 라우트별 코드 스플리팅
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// 🚀 Code Splitting: React.lazy로 라우트별 동적 import
const Home = lazy(() => import('./pages/Home'));
const Settings = lazy(() => import('./pages/Settings'));
const CapitalGainsTaxForm = lazy(() => import('./components/CapitalGainsTaxForm'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-container" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    <div className="loading-spinner">
      <span>로딩 중...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* 메인 페이지 */}
            <Route path="/" element={<Home />} />

            {/* 양도소득세 계산기 */}
            <Route path="/capital-gains" element={<CapitalGainsTaxForm />} />

            {/* 설정 페이지 */}
            <Route path="/settings" element={<Settings />} />

            {/* 기본 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
