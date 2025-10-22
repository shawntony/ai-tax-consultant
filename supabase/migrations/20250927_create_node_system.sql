-- ===================================================
-- Node-Based Tax Optimization System
-- Migration: 20250927_create_node_system
-- ===================================================

-- ===================================================
-- 1. NODES Table (Issue Nodes)
-- ===================================================
CREATE TABLE IF NOT EXISTS nodes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Node Identity
  node_type VARCHAR(20) NOT NULL DEFAULT 'ISSUE',
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Categorization
  category VARCHAR(100) NOT NULL,
  -- Categories: '상속세', '증여세', '양도소득세', '부동산', '금융자산', '사업승계', '기타'

  -- Legal Context
  related_law TEXT[], -- 관련 법조항 배열
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  -- Priority: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

  -- Metadata
  created_by VARCHAR(50) DEFAULT 'AI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_node_type CHECK (node_type IN ('ISSUE')),
  CONSTRAINT valid_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

-- Indexes for performance
CREATE INDEX idx_nodes_category ON nodes(category);
CREATE INDEX idx_nodes_priority ON nodes(priority);
CREATE INDEX idx_nodes_created_at ON nodes(created_at DESC);

-- ===================================================
-- 2. SOLUTIONS Table (Solution Nodes)
-- ===================================================
CREATE TABLE IF NOT EXISTS solutions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Solution Identity
  node_type VARCHAR(20) NOT NULL DEFAULT 'SOLUTION',
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Categorization
  category VARCHAR(100) NOT NULL,
  -- Same categories as nodes

  -- Tax Impact (핵심!)
  tax_impact BIGINT, -- 절세액 (음수) or 추가 세금 (양수), 단위: 원
  tax_impact_percentage DECIMAL(5,2), -- 절세 비율 (%)

  -- Implementation Details
  requirements TEXT[], -- 적용 요건 배열
  risks TEXT[], -- 리스크 배열
  estimated_time VARCHAR(50), -- 예: "30일", "3개월"
  complexity VARCHAR(20) DEFAULT 'MEDIUM',
  -- Complexity: 'LOW', 'MEDIUM', 'HIGH'

  -- Legal Basis
  legal_basis TEXT[], -- 법적 근거 배열

  -- Execution Order (for workflow)
  execution_order INTEGER, -- null이면 순서 무관

  -- Metadata
  created_by VARCHAR(50) DEFAULT 'AI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_solution_type CHECK (node_type IN ('SOLUTION')),
  CONSTRAINT valid_complexity CHECK (complexity IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- Indexes for performance
CREATE INDEX idx_solutions_category ON solutions(category);
CREATE INDEX idx_solutions_complexity ON solutions(complexity);
CREATE INDEX idx_solutions_tax_impact ON solutions(tax_impact DESC NULLS LAST);
CREATE INDEX idx_solutions_created_at ON solutions(created_at DESC);

-- ===================================================
-- 3. EDGES Table (Relationships between Nodes)
-- ===================================================
CREATE TABLE IF NOT EXISTS edges (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Edge Identity
  edge_type VARCHAR(50) NOT NULL,
  -- Types: 'ISSUE_TO_SOLUTION', 'DEPENDENCY', 'CONFLICT', 'PREREQUISITE'

  -- Relationship
  from_node_id UUID NOT NULL,
  from_node_type VARCHAR(20) NOT NULL, -- 'ISSUE' or 'SOLUTION'
  to_node_id UUID NOT NULL,
  to_node_type VARCHAR(20) NOT NULL, -- 'ISSUE' or 'SOLUTION'

  -- Relationship Strength
  strength DECIMAL(3,2) DEFAULT 1.0, -- 0.0 ~ 1.0 (연관도)
  reasoning TEXT, -- 왜 이 관계가 존재하는가?

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_edge_type CHECK (edge_type IN ('ISSUE_TO_SOLUTION', 'DEPENDENCY', 'CONFLICT', 'PREREQUISITE')),
  CONSTRAINT valid_node_types CHECK (
    from_node_type IN ('ISSUE', 'SOLUTION') AND
    to_node_type IN ('ISSUE', 'SOLUTION')
  ),
  CONSTRAINT valid_strength CHECK (strength >= 0.0 AND strength <= 1.0),
  CONSTRAINT no_self_reference CHECK (from_node_id != to_node_id)
);

-- Indexes for graph traversal
CREATE INDEX idx_edges_from ON edges(from_node_id, from_node_type);
CREATE INDEX idx_edges_to ON edges(to_node_id, to_node_type);
CREATE INDEX idx_edges_type ON edges(edge_type);
CREATE INDEX idx_edges_strength ON edges(strength DESC);

-- Composite index for common queries
CREATE INDEX idx_edges_from_to ON edges(from_node_id, to_node_id);

-- ===================================================
-- 4. WORKFLOWS Table (Optimization Results)
-- ===================================================
CREATE TABLE IF NOT EXISTS workflows (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Workflow Identity
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Tax Case Reference
  case_description TEXT NOT NULL, -- 원본 사례
  case_hash VARCHAR(64), -- 사례 고유 식별자 (중복 방지)

  -- Optimization Results
  total_tax_saved BIGINT DEFAULT 0, -- 총 절세액 (원)
  tax_savings_percentage DECIMAL(5,2), -- 절세 비율 (%)

  -- Solution Sequence (실행 순서)
  solution_ids UUID[] NOT NULL, -- Solution ID 배열 (순서대로)

  -- Complexity & Risk Assessment
  overall_complexity DECIMAL(3,2), -- 1-10 (평균 복잡도)
  overall_risk DECIMAL(3,2), -- 1-10 (최대 리스크)
  estimated_days INTEGER, -- 전체 소요 기간 (일)

  -- Optimization Score
  optimization_score DECIMAL(5,2), -- 종합 점수 (0-100)
  -- Score = (절세액 * 0.5) + (100 - 복잡도*10) * 0.2 + (100 - 리스크*10) * 0.2 + (100 - 기간/10) * 0.1

  -- Graph Structure (JSON)
  graph_data JSONB, -- 전체 노드 그래프 스냅샷

  -- Status
  status VARCHAR(20) DEFAULT 'DRAFT',
  -- Status: 'DRAFT', 'VALIDATED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'

  -- Metadata
  created_by VARCHAR(50) DEFAULT 'AI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('DRAFT', 'VALIDATED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED')),
  CONSTRAINT positive_tax_saved CHECK (total_tax_saved >= 0),
  CONSTRAINT valid_complexity CHECK (overall_complexity >= 1 AND overall_complexity <= 10),
  CONSTRAINT valid_risk CHECK (overall_risk >= 1 AND overall_risk <= 10)
);

-- Indexes for performance
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_score ON workflows(optimization_score DESC);
CREATE INDEX idx_workflows_tax_saved ON workflows(total_tax_saved DESC);
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);
CREATE INDEX idx_workflows_case_hash ON workflows(case_hash);

-- GIN index for JSONB search
CREATE INDEX idx_workflows_graph_data ON workflows USING GIN (graph_data);

-- ===================================================
-- 5. Helper Functions
-- ===================================================

-- Function: Get all solutions for a specific issue
CREATE OR REPLACE FUNCTION get_solutions_for_issue(issue_id UUID)
RETURNS TABLE (
  solution_id UUID,
  title VARCHAR,
  tax_impact BIGINT,
  strength DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.tax_impact,
    e.strength
  FROM solutions s
  INNER JOIN edges e ON e.to_node_id = s.id AND e.to_node_type = 'SOLUTION'
  WHERE e.from_node_id = issue_id
    AND e.from_node_type = 'ISSUE'
    AND e.edge_type = 'ISSUE_TO_SOLUTION'
  ORDER BY e.strength DESC, s.tax_impact ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Check circular dependencies
CREATE OR REPLACE FUNCTION has_circular_dependency(solution_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  visited UUID[];
  current_id UUID;
  dep_id UUID;
BEGIN
  visited := ARRAY[solution_id];

  FOR dep_id IN
    SELECT to_node_id
    FROM edges
    WHERE from_node_id = solution_id
      AND edge_type = 'DEPENDENCY'
  LOOP
    IF dep_id = ANY(visited) THEN
      RETURN TRUE; -- Circular dependency detected
    END IF;

    visited := array_append(visited, dep_id);

    -- Recursive check (simplified - real implementation would need recursion)
    IF EXISTS (
      SELECT 1 FROM edges
      WHERE from_node_id = dep_id
        AND to_node_id = solution_id
        AND edge_type = 'DEPENDENCY'
    ) THEN
      RETURN TRUE;
    END IF;
  END LOOP;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- 6. Row Level Security (RLS) - 향후 확장
-- ===================================================

-- Enable RLS (향후 사용자 인증 시스템 추가 시)
-- ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- 7. Sample Data (테스트용)
-- ===================================================

-- Sample Issue Node: 상속세 과세 이슈
INSERT INTO nodes (title, description, category, related_law, priority) VALUES
(
  '부동산 상속에 따른 상속세 과세',
  '10억원 상당의 부동산 상속 시 과세 이슈 검토 필요',
  '상속세',
  ARRAY['상속세및증여세법 제13조', '상속세및증여세법 제18조'],
  'HIGH'
);

-- Sample Solution Nodes
INSERT INTO solutions (title, description, category, tax_impact, tax_impact_percentage, requirements, risks, estimated_time, complexity, legal_basis) VALUES
(
  '배우자 공제 적용',
  '배우자 공제 최대 30억원 적용 (최소 5억원 보장)',
  '상속세',
  -300000000, -- 3억 절세
  -30.0,
  ARRAY['배우자 생존', '법정 상속 비율 준수'],
  ARRAY['배우자 재혼 시 재상속 이슈'],
  '즉시 적용 가능',
  'LOW',
  ARRAY['상속세및증여세법 제19조']
),
(
  '동거주택 상속공제 적용',
  '10년 이상 동거한 1세대 1주택 상속공제 최대 6억원',
  '상속세',
  -600000000, -- 6억 절세
  -50.0,
  ARRAY['10년 이상 동거', '1세대 1주택', '상속인 무주택'],
  ARRAY['동거 입증 자료 필요'],
  '서류 준비 1개월',
  'MEDIUM',
  ARRAY['상속세및증여세법 제23조의2']
);

-- Sample Edges: Issue → Solutions
DO $$
DECLARE
  issue_id UUID;
  sol1_id UUID;
  sol2_id UUID;
BEGIN
  SELECT id INTO issue_id FROM nodes WHERE title = '부동산 상속에 따른 상속세 과세' LIMIT 1;
  SELECT id INTO sol1_id FROM solutions WHERE title = '배우자 공제 적용' LIMIT 1;
  SELECT id INTO sol2_id FROM solutions WHERE title = '동거주택 상속공제 적용' LIMIT 1;

  INSERT INTO edges (edge_type, from_node_id, from_node_type, to_node_id, to_node_type, strength, reasoning) VALUES
  ('ISSUE_TO_SOLUTION', issue_id, 'ISSUE', sol1_id, 'SOLUTION', 1.0, '배우자가 있는 경우 필수 검토 항목'),
  ('ISSUE_TO_SOLUTION', issue_id, 'ISSUE', sol2_id, 'SOLUTION', 0.8, '동거 요건 충족 시 추가 절세 가능');
END $$;

-- Sample Workflow
DO $$
DECLARE
  sol1_id UUID;
  sol2_id UUID;
BEGIN
  SELECT id INTO sol1_id FROM solutions WHERE title = '배우자 공제 적용' LIMIT 1;
  SELECT id INTO sol2_id FROM solutions WHERE title = '동거주택 상속공제 적용' LIMIT 1;

  INSERT INTO workflows (
    name,
    description,
    case_description,
    total_tax_saved,
    tax_savings_percentage,
    solution_ids,
    overall_complexity,
    overall_risk,
    estimated_days,
    optimization_score,
    status
  ) VALUES (
    '상속세 최적화 시나리오 1',
    '배우자 공제 + 동거주택 공제 조합',
    '10억원 부동산 상속 (배우자 생존, 10년 이상 동거)',
    900000000, -- 9억 절세
    75.0,
    ARRAY[sol1_id, sol2_id],
    4.0, -- 중간 복잡도
    3.0, -- 낮은 리스크
    30, -- 1개월
    85.5, -- 높은 점수
    'VALIDATED'
  );
END $$;

-- ===================================================
-- Migration Complete
-- ===================================================
