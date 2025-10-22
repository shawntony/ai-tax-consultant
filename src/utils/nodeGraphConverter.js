/**
 * NodeGraph to React Flow Converter
 * NodeGraph 인스턴스를 React Flow 형식으로 변환
 *
 * @version 2.0.0
 * @date 2025-09-27
 */

import dagre from 'dagre';

// ===================================================
// Layout Algorithms
// ===================================================

/**
 * Dagre 기반 계층적 레이아웃
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @returns {Array} Positioned nodes
 */
function getHierarchicalLayout(nodes, edges) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Graph 설정
  dagreGraph.setGraph({
    rankdir: 'TB', // Top to Bottom
    align: 'UL',
    nodesep: 100,
    ranksep: 150,
    marginx: 50,
    marginy: 50
  });

  // Nodes 추가
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.type === 'issueNode' ? 300 : 350,
      height: 200
    });
  });

  // Edges 추가
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Layout 계산
  dagre.layout(dagreGraph);

  // Position 적용
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x,
        y: nodeWithPosition.y
      }
    };
  });
}

/**
 * 포스 디렉티드 레이아웃 (간단한 그리드 기반)
 * @param {Array} nodes - React Flow nodes
 * @returns {Array} Positioned nodes
 */
function getForceDirectedLayout(nodes) {
  const issueNodes = nodes.filter(n => n.type === 'issueNode');
  const solutionNodes = nodes.filter(n => n.type === 'solutionNode');

  const positioned = [];

  // Issue nodes를 상단에 배치
  issueNodes.forEach((node, idx) => {
    positioned.push({
      ...node,
      position: {
        x: idx * 350,
        y: 0
      }
    });
  });

  // Solution nodes를 하단에 배치
  solutionNodes.forEach((node, idx) => {
    positioned.push({
      ...node,
      position: {
        x: idx * 400,
        y: 300
      }
    });
  });

  return positioned;
}

// ===================================================
// Main Converter Function
// ===================================================

/**
 * NodeGraph를 React Flow 형식으로 변환
 * @param {NodeGraph} nodeGraph - NodeGraph 인스턴스
 * @param {string} layoutType - 'hierarchical' or 'force'
 * @returns {Object} { nodes, edges }
 */
export function convertNodeGraphToReactFlow(nodeGraph, layoutType = 'hierarchical') {
  if (!nodeGraph) {
    return { nodes: [], edges: [] };
  }

  // ===================================================
  // Convert Issue Nodes
  // ===================================================

  const issueNodes = Array.from(nodeGraph.issueNodes.values()).map((issueNode) => ({
    id: issueNode.id,
    type: 'issueNode',
    data: {
      originalNode: issueNode,
      label: issueNode.title,
      highlighted: false
    },
    position: { x: 0, y: 0 } // Will be calculated by layout algorithm
  }));

  // ===================================================
  // Convert Solution Nodes
  // ===================================================

  const solutionNodes = Array.from(nodeGraph.solutionNodes.values()).map((solutionNode) => ({
    id: solutionNode.id,
    type: 'solutionNode',
    data: {
      originalNode: solutionNode,
      label: solutionNode.title,
      highlighted: false
    },
    position: { x: 0, y: 0 } // Will be calculated by layout algorithm
  }));

  const allNodes = [...issueNodes, ...solutionNodes];

  // ===================================================
  // Convert Edges
  // ===================================================

  const edges = Array.from(nodeGraph.edges.values()).map((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    type: 'default',
    data: {
      originalEdge: edge,
      type: edge.type,
      strength: edge.strength,
      reasoning: edge.reasoning
    }
  }));

  // ===================================================
  // Apply Layout
  // ===================================================

  let positionedNodes;

  if (layoutType === 'hierarchical') {
    positionedNodes = getHierarchicalLayout(allNodes, edges);
  } else if (layoutType === 'force') {
    positionedNodes = getForceDirectedLayout(allNodes);
  } else {
    // Default: hierarchical
    positionedNodes = getHierarchicalLayout(allNodes, edges);
  }

  return {
    nodes: positionedNodes,
    edges
  };
}

/**
 * Alternative를 React Flow 형식으로 변환 (실행 순서 강조)
 * @param {Object} alternative - Alternative 객체 (from OptimizationEngine)
 * @param {NodeGraph} nodeGraph - NodeGraph 인스턴스
 * @returns {Object} { nodes, edges }
 */
export function convertAlternativeToReactFlow(alternative, nodeGraph) {
  if (!alternative || !nodeGraph) {
    return { nodes: [], edges: [] };
  }

  // Alternative의 executionOrder에 있는 솔루션들만 포함
  const executionOrder = alternative.executionOrder; // Array of SolutionNode

  // Execution order에 따라 노드 생성
  const solutionNodes = executionOrder.map((solutionNode, idx) => ({
    id: solutionNode.id,
    type: 'solutionNode',
    data: {
      originalNode: solutionNode,
      label: solutionNode.title,
      highlighted: true,
      executionOrder: idx + 1 // 1-based
    },
    position: {
      x: idx * 400,
      y: 300
    }
  }));

  // Related Issues 추출
  const relatedIssueIds = new Set();
  executionOrder.forEach(solution => {
    solution.relatedIssues?.forEach(issueId => {
      relatedIssueIds.add(issueId);
    });
  });

  const issueNodes = Array.from(relatedIssueIds)
    .map(issueId => nodeGraph.issueNodes.get(issueId))
    .filter(Boolean)
    .map((issueNode, idx) => ({
      id: issueNode.id,
      type: 'issueNode',
      data: {
        originalNode: issueNode,
        label: issueNode.title,
        highlighted: true
      },
      position: {
        x: idx * 350,
        y: 0
      }
    }));

  const allNodes = [...issueNodes, ...solutionNodes];

  // Edges: Issue → Solution + Dependencies
  const edges = [];

  // Issue to Solution edges
  Array.from(nodeGraph.edges.values()).forEach(edge => {
    const sourceInNodes = allNodes.find(n => n.id === edge.from);
    const targetInNodes = allNodes.find(n => n.id === edge.to);

    if (sourceInNodes && targetInNodes) {
      edges.push({
        id: edge.id,
        source: edge.from,
        target: edge.to,
        type: 'default',
        data: {
          originalEdge: edge,
          type: edge.type,
          strength: edge.strength,
          reasoning: edge.reasoning
        }
      });
    }
  });

  return {
    nodes: allNodes,
    edges
  };
}

/**
 * 특정 Solution의 dependency chain을 시각화
 * @param {string} solutionId - Solution ID
 * @param {NodeGraph} nodeGraph - NodeGraph 인스턴스
 * @returns {Object} { nodes, edges }
 */
export function convertDependencyChainToReactFlow(solutionId, nodeGraph) {
  if (!solutionId || !nodeGraph) {
    return { nodes: [], edges: [] };
  }

  const visited = new Set();
  const chainNodes = [];
  const chainEdges = [];

  /**
   * DFS로 dependency chain 추출
   */
  function extractChain(currentId, depth = 0) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const solution = nodeGraph.solutionNodes.get(currentId);
    if (!solution) return;

    chainNodes.push({
      id: solution.id,
      type: 'solutionNode',
      data: {
        originalNode: solution,
        label: solution.title,
        highlighted: true,
        depth
      },
      position: {
        x: depth * 400,
        y: 200
      }
    });

    // Dependencies
    solution.dependencies?.forEach(depId => {
      const depEdge = Array.from(nodeGraph.edges.values()).find(
        e => e.from === currentId && e.to === depId && e.type === 'DEPENDENCY'
      );

      if (depEdge) {
        chainEdges.push({
          id: depEdge.id,
          source: depEdge.from,
          target: depEdge.to,
          type: 'default',
          data: {
            originalEdge: depEdge,
            type: depEdge.type,
            strength: depEdge.strength,
            reasoning: depEdge.reasoning
          }
        });
      }

      extractChain(depId, depth + 1);
    });
  }

  extractChain(solutionId);

  return {
    nodes: chainNodes,
    edges: chainEdges
  };
}

export default {
  convertNodeGraphToReactFlow,
  convertAlternativeToReactFlow,
  convertDependencyChainToReactFlow
};
