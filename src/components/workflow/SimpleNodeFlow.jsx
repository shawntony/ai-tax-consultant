/**
 * Simple Node Flow Component
 * ReactFlow 기반 노드 워크플로우 편집기
 *
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import './SimpleNodeFlow.css';

// 커스텀 노드 컴포넌트
const IssueNode = ({ data }) => {
  return (
    <div className="custom-node issue-node">
      <div className="node-header issue">
        <span className="node-icon">⚠️</span>
        <span className="node-type">이슈</span>
      </div>
      <div className="node-content">
        <div className="node-title">{data.label}</div>
        <div className="node-description">{data.description}</div>
      </div>
      <div className="node-handles">
        {/* ReactFlow handles are automatically added */}
      </div>
    </div>
  );
};

const SolutionNode = ({ data }) => {
  return (
    <div className="custom-node solution-node">
      <div className="node-header solution">
        <span className="node-icon">💡</span>
        <span className="node-type">해결방안</span>
      </div>
      <div className="node-content">
        <div className="node-title">{data.label}</div>
        <div className="node-description">{data.description}</div>
        {data.taxImpact && (
          <div className="node-metric">
            <span className="metric-label">절세효과:</span>
            <span className="metric-value positive">
              {(Math.abs(data.taxImpact) / 100000000).toFixed(1)}억원
            </span>
          </div>
        )}
        {data.complexity && (
          <div className="node-metric">
            <span className="metric-label">복잡도:</span>
            <span className={`metric-value complexity-${data.complexity.toLowerCase()}`}>
              {data.complexity}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// 노드 타입 정의
const nodeTypes = {
  issue: IssueNode,
  solution: SolutionNode
};

// 초기 노드 (데모용)
const initialNodes = [
  {
    id: 'issue-1',
    type: 'issue',
    position: { x: 100, y: 100 },
    data: {
      label: '부동산 양도소득세 부담',
      description: '상속 받은 아파트 매도 시 높은 양도소득세 예상'
    }
  },
  {
    id: 'solution-1',
    type: 'solution',
    position: { x: 400, y: 50 },
    data: {
      label: '일시적 2주택 비과세 활용',
      description: '상속주택 보유기간 중 다른 주택 취득 후 양도',
      taxImpact: -50000000,
      complexity: 'MEDIUM'
    }
  },
  {
    id: 'solution-2',
    type: 'solution',
    position: { x: 400, y: 250 },
    data: {
      label: '장기보유특별공제 활용',
      description: '2년 이상 보유 후 양도하여 최대 80% 공제',
      taxImpact: -80000000,
      complexity: 'LOW'
    }
  }
];

// 초기 엣지
const initialEdges = [
  {
    id: 'e1-s1',
    source: 'issue-1',
    target: 'solution-1',
    type: 'smoothstep',
    animated: true,
    label: '해결',
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  {
    id: 'e1-s2',
    source: 'issue-1',
    target: 'solution-2',
    type: 'smoothstep',
    animated: true,
    label: '해결',
    markerEnd: { type: MarkerType.ArrowClosed }
  }
];

export default function SimpleNodeFlow({ onNodesChange: externalOnNodesChange, onEdgesChange: externalOnEdgesChange }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  // 노드 연결 시
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        label: '연결',
        markerEnd: { type: MarkerType.ArrowClosed }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // 노드 클릭 시
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // 새 노드 추가
  const addNewNode = (type) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type: type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100
      },
      data: {
        label: type === 'issue' ? '새 이슈' : '새 해결방안',
        description: '설명을 입력하세요',
        ...(type === 'solution' && {
          taxImpact: 0,
          complexity: 'MEDIUM'
        })
      }
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // 선택된 노드 삭제
  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
    }
  };

  return (
    <div className="simple-node-flow">
      {/* 툴바 */}
      <div className="flow-toolbar">
        <button
          className="toolbar-btn add-issue"
          onClick={() => addNewNode('issue')}
          title="이슈 노드 추가"
        >
          <span className="btn-icon">⚠️</span>
          <span className="btn-text">이슈 추가</span>
        </button>
        <button
          className="toolbar-btn add-solution"
          onClick={() => addNewNode('solution')}
          title="해결방안 노드 추가"
        >
          <span className="btn-icon">💡</span>
          <span className="btn-text">해결방안 추가</span>
        </button>
        {selectedNode && (
          <button
            className="toolbar-btn delete-node"
            onClick={deleteSelectedNode}
            title="선택된 노드 삭제"
          >
            <span className="btn-icon">🗑️</span>
            <span className="btn-text">삭제</span>
          </button>
        )}
        <div className="toolbar-spacer"></div>
        <div className="toolbar-info">
          <span>노드: {nodes.length}</span>
          <span>연결: {edges.length}</span>
        </div>
      </div>

      {/* ReactFlow 캔버스 */}
      <div className="flow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'issue':
                  return '#ef4444';
                case 'solution':
                  return '#10b981';
                default:
                  return '#6b7280';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </div>

      {/* 노드 상세 패널 */}
      {selectedNode && (
        <div className="node-detail-panel">
          <div className="panel-header">
            <h3>노드 상세정보</h3>
            <button
              className="close-btn"
              onClick={() => setSelectedNode(null)}
            >
              ✕
            </button>
          </div>
          <div className="panel-content">
            <div className="detail-field">
              <label>타입:</label>
              <span className="detail-value">
                {selectedNode.type === 'issue' ? '⚠️ 이슈' : '💡 해결방안'}
              </span>
            </div>
            <div className="detail-field">
              <label>제목:</label>
              <span className="detail-value">{selectedNode.data.label}</span>
            </div>
            <div className="detail-field">
              <label>설명:</label>
              <span className="detail-value">{selectedNode.data.description}</span>
            </div>
            {selectedNode.type === 'solution' && (
              <>
                <div className="detail-field">
                  <label>절세효과:</label>
                  <span className="detail-value positive">
                    {selectedNode.data.taxImpact
                      ? `${(Math.abs(selectedNode.data.taxImpact) / 100000000).toFixed(1)}억원`
                      : 'N/A'}
                  </span>
                </div>
                <div className="detail-field">
                  <label>복잡도:</label>
                  <span className="detail-value">{selectedNode.data.complexity}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
