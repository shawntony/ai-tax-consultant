/**
 * Decision Tree Component
 * ReactFlow를 활용한 의사결정 트리 시각화
 *
 * @version 1.0.0
 * @date 2025-10-22
 */

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import './DecisionTree.css';

// Dagre를 사용한 자동 레이아웃
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 250;
  const nodeHeight = 100;

  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export default function DecisionTree({ scenarios, actionPlan, reasoning }) {
  // 노드와 엣지 생성
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!scenarios || scenarios.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes = [];
    const edges = [];

    // 루트 노드 (질문/결정 포인트)
    nodes.push({
      id: 'root',
      type: 'input',
      data: {
        label: (
          <div className="node-content root-node">
            <div className="node-icon">🤔</div>
            <div className="node-title">증여 vs 상속</div>
            <div className="node-subtitle">어떤 전략이 유리할까요?</div>
          </div>
        ),
      },
      position: { x: 0, y: 0 },
      className: 'decision-node',
    });

    // 각 시나리오를 노드로 추가
    scenarios.forEach((scenario, index) => {
      const nodeId = `scenario-${index}`;
      const totalTax = scenario.taxCalculation?.totalTax || 0;
      const complexity = scenario.complexity || 'medium';

      nodes.push({
        id: nodeId,
        data: {
          label: (
            <div className={`node-content scenario-node complexity-${complexity}`}>
              <div className="node-icon">
                {complexity === 'low' && '🟢'}
                {complexity === 'medium' && '🟡'}
                {complexity === 'high' && '🔴'}
              </div>
              <div className="node-title">{scenario.name}</div>
              <div className="node-tax">총 세금: {totalTax.toLocaleString()}원</div>
              <div className="node-timeframe">⏱️ {scenario.timeframe || '정보없음'}</div>
            </div>
          ),
        },
        position: { x: 0, y: 0 },
        className: `scenario-node complexity-${complexity}`,
      });

      edges.push({
        id: `edge-root-${nodeId}`,
        source: 'root',
        target: nodeId,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      });
    });

    // 실행 단계가 있으면 추가
    if (actionPlan && actionPlan.length > 0) {
      const firstScenarioId = 'scenario-0';

      actionPlan.forEach((step, index) => {
        const stepId = `step-${index}`;

        nodes.push({
          id: stepId,
          type: index === actionPlan.length - 1 ? 'output' : 'default',
          data: {
            label: (
              <div className="node-content action-node">
                <div className="node-icon">📋</div>
                <div className="node-step">단계 {step.step}</div>
                <div className="node-title">{step.title}</div>
                <div className="node-duration">⏱️ {step.duration || '미정'}</div>
              </div>
            ),
          },
          position: { x: 0, y: 0 },
          className: 'action-node',
        });

        if (index === 0) {
          edges.push({
            id: `edge-scenario-step-${index}`,
            source: firstScenarioId,
            target: stepId,
            type: 'smoothstep',
            label: '선택 시',
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        } else {
          edges.push({
            id: `edge-step-${index - 1}-${index}`,
            source: `step-${index - 1}`,
            target: stepId,
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }
      });
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'TB'
    );

    return {
      initialNodes: layoutedNodes,
      initialEdges: layoutedEdges,
    };
  }, [scenarios, actionPlan]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node);
  }, []);

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="decision-tree empty">
        <p>의사결정 트리를 생성할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="decision-tree">
      <div className="tree-header">
        <h2>🌳 의사결정 트리</h2>
        {reasoning && (
          <div className="reasoning-box">
            <h3>💡 추천 이유</h3>
            <p>{reasoning}</p>
          </div>
        )}
      </div>

      <div className="tree-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.className?.includes('complexity-low')) return '#10b981';
              if (node.className?.includes('complexity-medium')) return '#f59e0b';
              if (node.className?.includes('complexity-high')) return '#ef4444';
              return '#3b82f6';
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      <div className="tree-legend">
        <h4>범례</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-box decision"></span>
            <span>의사결정 포인트</span>
          </div>
          <div className="legend-item">
            <span className="legend-box complexity-low"></span>
            <span>낮은 복잡도</span>
          </div>
          <div className="legend-item">
            <span className="legend-box complexity-medium"></span>
            <span>중간 복잡도</span>
          </div>
          <div className="legend-item">
            <span className="legend-box complexity-high"></span>
            <span>높은 복잡도</span>
          </div>
          <div className="legend-item">
            <span className="legend-box action"></span>
            <span>실행 단계</span>
          </div>
        </div>
      </div>
    </div>
  );
}
