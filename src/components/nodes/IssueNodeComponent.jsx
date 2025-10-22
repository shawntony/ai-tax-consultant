/**
 * Issue Node Component
 * Issue 노드 시각화 컴포넌트
 *
 * @version 2.0.0
 * @date 2025-09-27
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * Issue Node 컴포넌트
 * @param {Object} data - Node data
 * @param {Object} data.originalNode - Original IssueNode instance
 * @param {boolean} data.highlighted - Highlighted state
 */
const IssueNodeComponent = memo(({ data }) => {
  const { originalNode, highlighted } = data;

  // Priority colors
  const priorityColors = {
    LOW: 'bg-blue-100 border-blue-300',
    MEDIUM: 'bg-yellow-100 border-yellow-300',
    HIGH: 'bg-orange-100 border-orange-300',
    CRITICAL: 'bg-red-100 border-red-300'
  };

  const priorityTextColors = {
    LOW: 'text-blue-700',
    MEDIUM: 'text-yellow-700',
    HIGH: 'text-orange-700',
    CRITICAL: 'text-red-700'
  };

  const priorityColor = priorityColors[originalNode.priority] || priorityColors.MEDIUM;
  const priorityTextColor =
    priorityTextColors[originalNode.priority] || priorityTextColors.MEDIUM;

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] max-w-[300px] ${priorityColor} ${
        highlighted ? 'ring-4 ring-purple-400' : ''
      }`}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-red-500"
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
            ⚠
          </div>
          <div className={`text-xs font-semibold ${priorityTextColor}`}>
            {originalNode.priority}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="font-bold text-sm text-gray-800 mb-2">{originalNode.title}</div>

      {/* Description */}
      {originalNode.description && (
        <div className="text-xs text-gray-600 mb-2 line-clamp-2">
          {originalNode.description}
        </div>
      )}

      {/* Category */}
      <div className="flex items-center space-x-1 mb-2">
        <span className="text-xs text-gray-500">카테고리:</span>
        <span className="text-xs font-semibold text-gray-700">{originalNode.category}</span>
      </div>

      {/* Related Law */}
      {originalNode.relatedLaw && originalNode.relatedLaw.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {originalNode.relatedLaw.slice(0, 2).map((law, idx) => (
            <span
              key={idx}
              className="text-xs bg-white bg-opacity-50 px-2 py-0.5 rounded border border-gray-300"
            >
              {law}
            </span>
          ))}
          {originalNode.relatedLaw.length > 2 && (
            <span className="text-xs text-gray-500">
              +{originalNode.relatedLaw.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Connected Solutions Count */}
      {originalNode.connectedSolutions && originalNode.connectedSolutions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-300">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Solutions: </span>
            {originalNode.connectedSolutions.length}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-red-500"
      />
    </div>
  );
});

IssueNodeComponent.displayName = 'IssueNodeComponent';

export default IssueNodeComponent;
