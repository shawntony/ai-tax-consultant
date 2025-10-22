# 노드 기반 워크플로우 아키텍처 설계

## 📋 개요

ReactFlow를 활용한 세무 최적화 노드 기반 워크플로우 시스템 설계입니다.

## 🎯 핵심 기능

### 1. 노드 타입 정의

```javascript
// 노드 타입
- IssueNode: 세무 이슈 (문제점)
- SolutionNode: 해결 방안
- DecisionNode: 의사결정 포인트
- ActionNode: 실행 액션
- ResultNode: 결과/영향
```

### 2. 노드 CRUD 작업

#### 노드 추가
```javascript
const addNode = (type, data, position) => {
  const newNode = {
    id: `${type}-${Date.now()}`,
    type: type,
    position: position,
    data: {
      label: data.label,
      description: data.description,
      // 타입별 추가 데이터
      ...(type === 'solution' && {
        taxImpact: data.taxImpact,
        complexity: data.complexity,
        requirements: data.requirements
      })
    }
  };

  setNodes((nds) => [...nds, newNode]);
};
```

#### 노드 수정
```javascript
const updateNode = (nodeId, updates) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    )
  );
};
```

#### 노드 삭제
```javascript
const deleteNode = (nodeId) => {
  setNodes((nds) => nds.filter((node) => node.id !== nodeId));
  setEdges((eds) => eds.filter((edge) =>
    edge.source !== nodeId && edge.target !== nodeId
  ));
};
```

### 3. 엣지(연결) 관리

#### 엣지 타입
```javascript
- SOLVES: Issue → Solution
- DEPENDS_ON: Solution → Solution (선행 조건)
- CONFLICTS_WITH: Solution ↔ Solution (상충)
- LEADS_TO: Solution → Result
- DECISION: Decision → Multiple paths
```

#### 엣지 추가
```javascript
const onConnect = useCallback(
  (params) => {
    const newEdge = {
      ...params,
      id: `e${params.source}-${params.target}`,
      type: 'smoothstep', // 또는 'step', 'straight', 'bezier'
      animated: true,
      label: getEdgeLabel(params.sourceHandle, params.targetHandle),
      data: {
        relationship: determineRelationship(params)
      }
    };

    setEdges((eds) => addEdge(newEdge, eds));
  },
  []
);
```

### 4. 자동 레이아웃 (Dagre)

```javascript
import dagre from 'dagre';

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 150 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 75,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
```

### 5. 워크플로우 실행 순서 계산

```javascript
// 위상 정렬 (Topological Sort)
const calculateExecutionOrder = (nodes, edges) => {
  const graph = new Map();
  const inDegree = new Map();

  // 그래프 구축
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach(edge => {
    if (edge.data.relationship === 'DEPENDS_ON') {
      graph.get(edge.source).push(edge.target);
      inDegree.set(edge.target, inDegree.get(edge.target) + 1);
    }
  });

  // 위상 정렬
  const queue = [];
  const result = [];

  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);

    graph.get(current).forEach(neighbor => {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  return result;
};
```

### 6. 순환 종속성 검사

```javascript
const detectCycles = (nodes, edges) => {
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];

  const graph = buildGraph(edges);

  const dfs = (nodeId, path = []) => {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = graph.get(nodeId) || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path])) return true;
      } else if (recursionStack.has(neighbor)) {
        // 순환 발견!
        cycles.push([...path, neighbor]);
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  });

  return cycles;
};
```

## 🎨 UI/UX 권장 사항

### 1. 노드 컨텍스트 메뉴
```javascript
const NodeContextMenu = ({ node, onEdit, onDelete, onAddConnection }) => (
  <div className="context-menu">
    <button onClick={() => onEdit(node)}>✏️ 수정</button>
    <button onClick={() => onAddConnection(node)}>🔗 연결 추가</button>
    <button onClick={() => onDelete(node)}>🗑️ 삭제</button>
  </div>
);
```

### 2. 노드 상세 패널
```javascript
const NodeDetailPanel = ({ selectedNode }) => {
  if (!selectedNode) return null;

  return (
    <div className="detail-panel">
      <h3>{selectedNode.data.label}</h3>
      <p>{selectedNode.data.description}</p>

      {selectedNode.type === 'solution' && (
        <>
          <div className="metric">
            <span>절세 효과:</span>
            <strong>{selectedNode.data.taxImpact}원</strong>
          </div>
          <div className="metric">
            <span>복잡도:</span>
            <span>{selectedNode.data.complexity}</span>
          </div>
        </>
      )}
    </div>
  );
};
```

### 3. 미니맵 & 컨트롤
```javascript
import { MiniMap, Controls, Background } from 'reactflow';

<ReactFlow>
  <Background />
  <Controls />
  <MiniMap
    nodeColor={(node) => {
      switch (node.type) {
        case 'issue': return '#ef4444';
        case 'solution': return '#10b981';
        case 'decision': return '#f59e0b';
        default: return '#6b7280';
      }
    }}
  />
</ReactFlow>
```

## 🔄 워크플로우 실행 전략

### 1. 단계별 실행
```javascript
const executeWorkflow = async (executionOrder) => {
  for (const nodeId of executionOrder) {
    const node = nodes.find(n => n.id === nodeId);

    // 노드 실행 전 상태 업데이트
    updateNodeStatus(nodeId, 'executing');

    // 노드 타입에 따라 실행
    if (node.type === 'solution') {
      await executeSolution(node);
    } else if (node.type === 'decision') {
      const result = await executeDecision(node);
      // 결과에 따라 다음 경로 결정
      filterExecutionPath(result);
    }

    // 실행 완료
    updateNodeStatus(nodeId, 'completed');

    // 다음 노드 실행 전 딜레이 (시각화)
    await delay(500);
  }
};
```

### 2. 병렬 실행 (독립적 노드)
```javascript
const executeParallel = async (nodes) => {
  const independentGroups = findIndependentGroups(nodes);

  for (const group of independentGroups) {
    await Promise.all(
      group.map(nodeId => executeNode(nodeId))
    );
  }
};
```

## 💾 상태 저장 & 불러오기

### 저장
```javascript
const saveWorkflow = () => {
  const workflow = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    nodes: nodes,
    edges: edges,
    metadata: {
      caseDescription: caseDescription,
      totalTaxImpact: calculateTotalImpact(nodes)
    }
  };

  localStorage.setItem('workflow', JSON.stringify(workflow));
  // 또는 서버에 저장
  await saveToServer(workflow);
};
```

### 불러오기
```javascript
const loadWorkflow = async () => {
  const saved = localStorage.getItem('workflow');
  if (saved) {
    const workflow = JSON.parse(saved);
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setCaseDescription(workflow.metadata.caseDescription);
  }
};
```

## 🎯 추천 구현 순서

1. **Phase 1: 기본 노드 시각화**
   - ReactFlow 기본 설정
   - 커스텀 노드 컴포넌트 생성
   - 드래그 앤 드롭 기능

2. **Phase 2: CRUD 기능**
   - 노드 추가/수정/삭제
   - 엣지 연결 관리
   - 컨텍스트 메뉴

3. **Phase 3: 자동화**
   - AI 기반 노드 추출 (현재 서비스 활용)
   - 자동 레이아웃 (Dagre)
   - 순환 검사 & 검증

4. **Phase 4: 실행 엔진**
   - 실행 순서 계산
   - 워크플로우 시뮬레이션
   - 결과 시각화

5. **Phase 5: 고급 기능**
   - 저장/불러오기
   - 공유 기능
   - 템플릿 시스템

## 📦 필요한 추가 라이브러리 (선택사항)

```bash
# 이미 설치됨
✅ reactflow
✅ dagre

# 추가 고려사항
npm install @reactflow/node-resizer  # 노드 크기 조절
npm install @reactflow/background    # 배경 패턴
npm install react-colorful           # 색상 선택기
```

## 🔗 참고 자료

- ReactFlow 공식 문서: https://reactflow.dev/
- Dagre 레이아웃: https://github.com/dagrejs/dagre
- 위상 정렬: https://en.wikipedia.org/wiki/Topological_sorting
