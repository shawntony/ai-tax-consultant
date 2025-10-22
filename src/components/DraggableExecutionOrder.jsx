/**
 * Draggable Execution Order Component
 * 드래그앤드롭으로 실행 순서 변경 가능
 * @version 1.0.0
 */

import React, { useState } from 'react';

export default function DraggableExecutionOrder({
  executionOrder,
  onOrderChange,
  onTaxImpactRecalculate
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder the execution order
    const newOrder = [...executionOrder];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, movedItem);

    // Call the callback to update parent state
    if (onOrderChange) {
      onOrderChange(newOrder);
    }

    // Recalculate tax impact with new order
    if (onTaxImpactRecalculate) {
      onTaxImpactRecalculate(newOrder);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="execution-section">
      <h3 className="section-title">
        실행 순서 (드래그하여 순서 변경)
      </h3>

      <div className="execution-list">
        {executionOrder.map((solution, index) => (
          <div
            key={solution.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`execution-item ${
              draggedIndex === index ? 'dragging' : ''
            } ${dragOverIndex === index ? 'drag-over' : ''}`}
            style={{
              opacity: draggedIndex === index ? 0.5 : 1,
              cursor: 'move'
            }}
          >
            <div className="execution-number">
              {index + 1}
            </div>
            <div className="execution-content">
              <div className="execution-title">
                {solution.title}
                <span style={{ marginLeft: '8px', fontSize: '0.875rem', opacity: 0.7 }}>
                  🔀 드래그 가능
                </span>
              </div>
              <div className="execution-description">{solution.description}</div>
              <div className="execution-meta">
                <span className="green">
                  절세: {Math.abs(solution.taxImpact / 100000000).toFixed(1)}억원
                </span>
                <span className="gray">복잡도: {solution.complexity}</span>
                <span className="gray">
                  소요: {solution.estimatedTime || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#CBD5E1'
      }}>
        💡 <strong>Tip:</strong> 실행 순서를 변경하면 세금 영향이 달라질 수 있습니다.
        드래그하여 최적의 순서를 찾아보세요!
      </div>
    </div>
  );
}
