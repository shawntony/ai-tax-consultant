/**
 * Solution Node Component
 * Solution 노드 시각화 컴포넌트
 *
 * @version 2.0.0
 * @date 2025-09-27
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * Solution Node 컴포넌트
 * @param {Object} data - Node data
 * @param {Object} data.originalNode - Original SolutionNode instance
 * @param {boolean} data.highlighted - Highlighted state
 */
const SolutionNodeComponent = memo(({ data }) => {
  const { originalNode, highlighted } = data;

  // Complexity colors
  const complexityColors = {
    LOW: 'bg-green-100 border-green-300',
    MEDIUM: 'bg-blue-100 border-blue-300',
    HIGH: 'bg-purple-100 border-purple-300'
  };

  const complexityTextColors = {
    LOW: 'text-green-700',
    MEDIUM: 'text-blue-700',
    HIGH: 'text-purple-700'
  };

  const complexityColor = complexityColors[originalNode.complexity] || complexityColors.MEDIUM;
  const complexityTextColor =
    complexityTextColors[originalNode.complexity] || complexityTextColors.MEDIUM;

  // Tax impact display
  const taxImpact = originalNode.taxImpact || 0;
  const isSavings = taxImpact < 0;
  const taxImpactAbs = Math.abs(taxImpact);
  const taxImpactFormatted = (taxImpactAbs / 100000000).toFixed(1); // 억원

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[250px] max-w-[350px] ${complexityColor} ${
        highlighted ? 'ring-4 ring-yellow-400' : ''
      }`}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-green-500" />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
            ✓
          </div>
          <div className={`text-xs font-semibold ${complexityTextColor}`}>
            {originalNode.complexity}
          </div>
        </div>

        {/* Tax Impact Badge */}
        {taxImpact !== 0 && (
          <div
            className={`px-2 py-1 rounded text-xs font-bold ${
              isSavings ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {isSavings ? '↓' : '↑'} {taxImpactFormatted}억
          </div>
        )}
      </div>

      {/* Title */}
      <div className="font-bold text-sm text-gray-800 mb-2">{originalNode.title}</div>

      {/* Description */}
      {originalNode.description && (
        <div className="text-xs text-gray-600 mb-2 line-clamp-2">
          {originalNode.description}
        </div>
      )}

      {/* Category & Estimated Time */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">카테고리</span>
          <span className="text-xs font-semibold text-gray-700">{originalNode.category}</span>
        </div>
        {originalNode.estimatedTime && (
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">소요 기간</span>
            <span className="text-xs font-semibold text-gray-700">
              {originalNode.estimatedTime}
            </span>
          </div>
        )}
      </div>

      {/* Tax Impact Details */}
      {taxImpact !== 0 && (
        <div className="mb-2 p-2 bg-white bg-opacity-50 rounded">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">세금 영향:</span>
              <span
                className={`font-bold ${isSavings ? 'text-green-600' : 'text-red-600'}`}
              >
                {taxImpactAbs.toLocaleString()}원
              </span>
            </div>
            {originalNode.taxImpactPercentage && (
              <div className="flex justify-between">
                <span className="text-gray-600">절세율:</span>
                <span
                  className={`font-bold ${isSavings ? 'text-green-600' : 'text-red-600'}`}
                >
                  {Math.abs(originalNode.taxImpactPercentage).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requirements */}
      {originalNode.requirements && originalNode.requirements.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-gray-600 font-semibold mb-1">적용 요건:</div>
          <div className="text-xs text-gray-700 space-y-0.5">
            {originalNode.requirements.slice(0, 2).map((req, idx) => (
              <div key={idx} className="flex items-start">
                <span className="mr-1">•</span>
                <span className="line-clamp-1">{req}</span>
              </div>
            ))}
            {originalNode.requirements.length > 2 && (
              <div className="text-gray-500">+{originalNode.requirements.length - 2} more</div>
            )}
          </div>
        </div>
      )}

      {/* Risks */}
      {originalNode.risks && originalNode.risks.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-red-600 font-semibold mb-1">
            ⚠ 리스크 ({originalNode.risks.length})
          </div>
          <div className="text-xs text-gray-700">
            {originalNode.risks.slice(0, 1).map((risk, idx) => (
              <div key={idx} className="line-clamp-1">
                • {risk}
              </div>
            ))}
            {originalNode.risks.length > 1 && (
              <div className="text-gray-500">+{originalNode.risks.length - 1} more</div>
            )}
          </div>
        </div>
      )}

      {/* Legal Basis */}
      {originalNode.legalBasis && originalNode.legalBasis.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {originalNode.legalBasis.slice(0, 2).map((law, idx) => (
            <span
              key={idx}
              className="text-xs bg-white bg-opacity-70 px-2 py-0.5 rounded border border-gray-300"
            >
              {law}
            </span>
          ))}
          {originalNode.legalBasis.length > 2 && (
            <span className="text-xs text-gray-500">
              +{originalNode.legalBasis.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Dependencies */}
      {originalNode.dependencies && originalNode.dependencies.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-300">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Dependencies: </span>
            {originalNode.dependencies.length}
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-green-500" />
    </div>
  );
});

SolutionNodeComponent.displayName = 'SolutionNodeComponent';

export default SolutionNodeComponent;
