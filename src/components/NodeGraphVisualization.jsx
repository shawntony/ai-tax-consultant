/**
 * NodeGraph Visualization Component
 * React Flow 기반 노드 그래프 시각화
 *
 * @version 2.0.0
 * @date 2025-09-27
 */

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import IssueNodeComponent from './nodes/IssueNodeComponent';
import SolutionNodeComponent from './nodes/SolutionNodeComponent';
import { convertNodeGraphToReactFlow } from '../utils/nodeGraphConverter';

// ===================================================
// Custom Node Types
// ===================================================

const nodeTypes = {
  issueNode: IssueNodeComponent,
  solutionNode: SolutionNodeComponent
};

// ===================================================
// Edge Styles
// ===================================================

const edgeStyles = {
  ISSUE_TO_SOLUTION: {
    stroke: '#3b82f6',
    strokeWidth: 2,
    animated: false
  },
  DEPENDENCY: {
    stroke: '#f59e0b',
    strokeWidth: 2,
    animated: true,
    style: { strokeDasharray: '5,5' }
  },
  CONFLICT: {
    stroke: '#ef4444',
    strokeWidth: 2,
    animated: false,
    style: { strokeDasharray: '3,3' }
  },
  PREREQUISITE: {
    stroke: '#8b5cf6',
    strokeWidth: 1.5,
    animated: false
  }
};

// ===================================================
// Main Component
// ===================================================

/**
 * NodeGraph 시각화 컴포넌트
 * @param {Object} props
 * @param {NodeGraph} props.nodeGraph - NodeGraph 인스턴스
 * @param {Function} props.onNodeClick - 노드 클릭 핸들러
 * @param {Function} props.onEdgeClick - 엣지 클릭 핸들러
 * @param {Object} props.highlightedNodes - 강조할 노드 ID 배열
 * @param {boolean} props.interactive - 인터랙티브 모드 활성화
 */
export default function NodeGraphVisualization({
  nodeGraph,
  onNodeClick,
  onEdgeClick,
  highlightedNodes = [],
  interactive = true
}) {
  // ===================================================
  // State Management
  // ===================================================

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'issues' | 'solutions'
  const [layoutType, setLayoutType] = useState('hierarchical'); // 'hierarchical' | 'force'

  // ===================================================
  // Convert NodeGraph to React Flow Format
  // ===================================================

  useMemo(() => {
    if (!nodeGraph) return;

    const { nodes: flowNodes, edges: flowEdges } = convertNodeGraphToReactFlow(
      nodeGraph,
      layoutType
    );

    // Apply edge styles
    const styledEdges = flowEdges.map(edge => ({
      ...edge,
      ...edgeStyles[edge.data.type],
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: edgeStyles[edge.data.type]?.stroke || '#999'
      },
      label: edge.data.strength ? `${(edge.data.strength * 100).toFixed(0)}%` : '',
      labelStyle: { fill: '#666', fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.7 }
    }));

    // Apply highlighting
    const highlightedFlowNodes = flowNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        highlighted: highlightedNodes.includes(node.id)
      }
    }));

    setNodes(highlightedFlowNodes);
    setEdges(styledEdges);
  }, [nodeGraph, layoutType, highlightedNodes, setNodes, setEdges]);

  // ===================================================
  // Event Handlers
  // ===================================================

  const handleNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node);
      if (onNodeClick) {
        onNodeClick(node.data.originalNode);
      }
    },
    [onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (event, edge) => {
      if (onEdgeClick) {
        onEdgeClick(edge.data.originalEdge);
      }
    },
    [onEdgeClick]
  );

  const onConnect = useCallback(
    (params) => {
      if (interactive) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [interactive, setEdges]
  );

  // ===================================================
  // Filter Nodes
  // ===================================================

  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    if (filterType === 'issues') {
      return nodes.filter(node => node.type === 'issueNode');
    }
    if (filterType === 'solutions') {
      return nodes.filter(node => node.type === 'solutionNode');
    }
    return nodes;
  }, [nodes, filterType]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(
      edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
  }, [edges, filteredNodes]);

  // ===================================================
  // Statistics
  // ===================================================

  const stats = useMemo(() => {
    const issueCount = nodes.filter(n => n.type === 'issueNode').length;
    const solutionCount = nodes.filter(n => n.type === 'solutionNode').length;
    const edgeTypeCount = edges.reduce((acc, edge) => {
      const type = edge.data.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      issueCount,
      solutionCount,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      edgeTypeCount
    };
  }, [nodes, edges]);

  // ===================================================
  // Render
  // ===================================================

  return (
    <div className="w-full h-full relative bg-gray-50">
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'issueNode') return '#ef4444';
            if (node.type === 'solutionNode') return '#10b981';
            return '#999';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* Control Panel */}
        <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg space-y-4">
          {/* Statistics */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-700">그래프 통계</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Issues:</span>
                <span className="font-semibold text-red-600">{stats.issueCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Solutions:</span>
                <span className="font-semibold text-green-600">{stats.solutionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Edges:</span>
                <span className="font-semibold">{stats.totalEdges}</span>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-700">필터</h3>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full text-xs border rounded px-2 py-1"
            >
              <option value="all">전체 보기</option>
              <option value="issues">Issues만 보기</option>
              <option value="solutions">Solutions만 보기</option>
            </select>
          </div>

          {/* Layout Controls */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-700">레이아웃</h3>
            <select
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value)}
              className="w-full text-xs border rounded px-2 py-1"
            >
              <option value="hierarchical">계층형</option>
              <option value="force">포스 디렉티드</option>
            </select>
          </div>

          {/* Edge Legend */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-700">관계 범례</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-blue-500"></div>
                <span>Issue → Solution</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-amber-500 border-dashed border-t-2"></div>
                <span>Dependency</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-red-500 border-dashed border-t-2"></div>
                <span>Conflict</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-purple-500"></div>
                <span>Prerequisite</span>
              </div>
            </div>
          </div>

          {/* Edge Type Counts */}
          {Object.keys(stats.edgeTypeCount).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-gray-700">관계 유형</h3>
              <div className="text-xs space-y-1">
                {Object.entries(stats.edgeTypeCount).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-gray-600">{type}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        {/* Selected Node Panel */}
        {selectedNode && (
          <Panel position="bottom-left" className="bg-white p-4 rounded-lg shadow-lg max-w-md">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm text-gray-700">
                  {selectedNode.data.originalNode.title}
                </h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs space-y-1">
                <div className="text-gray-600">
                  {selectedNode.data.originalNode.description}
                </div>
                <div className="pt-2 border-t">
                  <span className="font-semibold">Category: </span>
                  <span className="text-gray-700">
                    {selectedNode.data.originalNode.category}
                  </span>
                </div>
                {selectedNode.type === 'solutionNode' && (
                  <>
                    <div>
                      <span className="font-semibold">Tax Impact: </span>
                      <span
                        className={
                          selectedNode.data.originalNode.taxImpact < 0
                            ? 'text-green-600 font-bold'
                            : 'text-red-600 font-bold'
                        }
                      >
                        {Math.abs(selectedNode.data.originalNode.taxImpact).toLocaleString()}원{' '}
                        {selectedNode.data.originalNode.taxImpact < 0 ? '절세' : '추가 세금'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Complexity: </span>
                      <span className="text-gray-700">
                        {selectedNode.data.originalNode.complexity}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
