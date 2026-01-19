import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { QuestData, QuestState } from '../../../eqf-parser';
import dagre from 'dagre';
import { toPng } from 'html-to-image';

interface QuestFlowDiagramProps {
  quest: QuestData;
  onQuestChange: (updates: Partial<QuestData>) => void;
  onNavigateToState?: (stateName: string) => void;
}

// Custom node component for quest states
const StateNode = ({ data }: { data: any }) => {
  const handleOpenInEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[StateNode] Open in editor clicked for state:', data.label);
    if (data.onNavigateToState) {
      console.log('[StateNode] Calling onNavigateToState with:', data.label);
      data.onNavigateToState(data.label);
    } else {
      console.warn('[StateNode] No onNavigateToState callback available');
    }
  };

  return (
    <div style={{
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid #0e7490',
      backgroundColor: '#1e293b',
      color: 'white',
      minWidth: '220px',
      maxWidth: '320px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      position: 'relative'
    }}>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} style={{ background: '#0e7490' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#0e7490' }} />
      
      {/* State Name with Open Icon */}
      <div style={{ 
        fontWeight: 600, 
        fontSize: '14px', 
        marginBottom: '4px', 
        color: '#38bdf8',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>{data.label}</span>
        <button
          onClick={handleOpenInEditor}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#38bdf8'}
          onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
          title="Open in text editor"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>
      
      {/* Description */}
      {data.description && (
        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontStyle: 'italic' }}>
          {data.description}
        </div>
      )}
      
      {/* Actions */}
      {data.actions && data.actions.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '11px' }}>
          <div style={{ color: '#22d3ee', fontWeight: 600, marginBottom: '4px' }}>Actions:</div>
          <div style={{ 
            maxHeight: '120px', 
            overflowY: 'auto', 
            paddingLeft: '8px',
            borderLeft: '2px solid #334155'
          }}>
            {data.actions
              .filter((action: any) => action.type !== 'End') // Filter out End() actions
              .map((action: any, idx: number) => (
                <div key={idx} style={{ 
                  marginBottom: '3px', 
                  color: '#cbd5e1',
                  fontSize: '10px',
                  wordBreak: 'break-word'
                }}>
                  {action.display}
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Rules */}
      {data.rules && data.rules.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '11px' }}>
          <div style={{ color: '#a78bfa', fontWeight: 600, marginBottom: '4px' }}>Rules:</div>
          <div style={{ 
            paddingLeft: '8px',
            borderLeft: '2px solid #334155'
          }}>
            {data.rules.map((rule: any, idx: number) => (
              <div 
                key={idx} 
                style={{ 
                  marginBottom: '3px', 
                  color: '#cbd5e1',
                  fontSize: '10px',
                  wordBreak: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{rule.display}</span>
                <span style={{ color: '#a78bfa', fontSize: '12px' }}>→ {rule.gotoState}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Special End node component
const EndNode = () => {
  return (
    <div style={{
      padding: '16px 24px',
      borderRadius: '50%',
      border: '3px solid #ef4444',
      backgroundColor: '#7f1d1d',
      color: 'white',
      minWidth: '100px',
      minHeight: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      fontWeight: 700,
      fontSize: '16px'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#ef4444' }} />
      END
    </div>
  );
};

const nodeTypes = {
  stateNode: StateNode,
  endNode: EndNode
};

// Helper to format action/rule display text
const formatActionDisplay = (action: any): string => {
  const paramStr = action.params.map((p: any) => 
    typeof p === 'string' ? `"${p}"` : p
  ).join(', ');
  return `${action.type}(${paramStr})`;
};

const formatRuleDisplay = (rule: any): string => {
  const paramStr = rule.params.map((p: any) => 
    typeof p === 'string' ? `"${p}"` : p
  ).join(', ');
  return `${rule.type}(${paramStr})`;
};

// Auto-layout using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 150 });

  nodes.forEach((node) => {
    // Calculate dynamic node height based on content
    const baseHeight = 80;
    const actionCount = typeof node.data.actionCount === 'number' ? node.data.actionCount : 0;
    const ruleCount = typeof node.data.ruleCount === 'number' ? node.data.ruleCount : 0;
    const actionHeight = actionCount * 15;
    const ruleHeight = ruleCount * 15;
    const height = Math.min(baseHeight + actionHeight + ruleHeight, 300);
    
    dagreGraph.setNode(node.id, { width: 260, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const nodeData = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeData.width / 2,
        y: nodeWithPosition.y - nodeData.height / 2
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function QuestFlowDiagram({ quest, onQuestChange, onNavigateToState }: QuestFlowDiagramProps) {
  // Check if any state has an End() action
  const hasEndAction = useMemo(() => {
    return quest.states.some(state => 
      state.actions.some(action => action.type === 'End')
    );
  }, [quest.states]);

  // Convert quest states to nodes
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = quest.states.map((state, index) => ({
      id: state.name,
      type: 'stateNode',
      data: {
        label: state.name,
        description: state.description,
        actionCount: state.actions.length,
        ruleCount: state.rules.length,
        actions: state.actions.map(action => ({
          ...action,
          display: formatActionDisplay(action)
        })),
        rules: state.rules.map(rule => ({
          ...rule,
          display: formatRuleDisplay(rule)
        })),
        stateIndex: index,
        onNavigateToState
      },
      position: { x: 0, y: 0 }
    }));

    // Add End node if any state has End() action
    if (hasEndAction) {
      nodes.push({
        id: '__END__',
        type: 'endNode',
        data: {} as any,
        position: { x: 0, y: 0 }
      });
    }

    return nodes;
  }, [quest.states, hasEndAction, onNavigateToState]);

  // Convert rules to edges (showing which rules lead to which states)
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    quest.states.forEach((state) => {
      // Create edges from rules
      state.rules.forEach((rule, ruleIdx) => {
        const targetState = rule.gotoState;
        
        // Check if target state exists
        if (quest.states.some(s => s.name === targetState)) {
          // Determine edge style based on rule type
          const isConditional = rule.type !== 'Always';
          
          edges.push({
            id: `${state.name}-rule${ruleIdx}-${targetState}`,
            source: state.name,
            target: targetState,
            animated: !isConditional,
            label: rule.type,
            style: { 
              stroke: isConditional ? '#a78bfa' : '#22d3ee', 
              strokeWidth: 2,
              strokeDasharray: isConditional ? '5,5' : '0'
            },
            labelStyle: {
              fill: '#e2e8f0',
              fontSize: 10,
              fontWeight: 500
            },
            labelBgStyle: {
              fill: '#1e293b',
              fillOpacity: 0.8
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isConditional ? '#a78bfa' : '#22d3ee'
            }
          });
        }
      });
      
      // Also handle SetState and Goto actions
      state.actions.forEach((action, actionIdx) => {
        if ((action.type === 'SetState' || action.type === 'Goto') && action.params.length > 0) {
          const targetState = action.params[0] as string;
          if (quest.states.some(s => s.name === targetState)) {
            edges.push({
              id: `${state.name}-action${actionIdx}-${targetState}`,
              source: state.name,
              target: targetState,
              animated: action.type === 'Goto',
              label: action.type,
              style: { stroke: '#0e7490', strokeWidth: 2 },
              labelStyle: {
                fill: '#e2e8f0',
                fontSize: 10,
                fontWeight: 500
              },
              labelBgStyle: {
                fill: '#1e293b',
                fillOpacity: 0.8
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#0e7490'
              }
            });
          }
        } else if (action.type === 'End') {
          // Create edge to End node
          edges.push({
            id: `${state.name}-action${actionIdx}-end`,
            source: state.name,
            target: '__END__',
            animated: true,
            label: 'End',
            style: { stroke: '#ef4444', strokeWidth: 3 },
            labelStyle: {
              fill: '#e2e8f0',
              fontSize: 10,
              fontWeight: 600
            },
            labelBgStyle: {
              fill: '#1e293b',
              fillOpacity: 0.8
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ef4444'
            }
          });
        }
      });
    });

    return edges;
  }, [quest.states]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Update nodes and edges when quest changes
  React.useEffect(() => {
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    setNodes(newLayoutedNodes);
    setEdges(newLayoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Clicked state:', node.data.label);
    // TODO: Open state editor panel
  }, []);

  const handleAddState = useCallback(() => {
    // Generate a new state name
    const existingStateNames = quest.states.map(s => s.name);
    let newStateName = 'NewState';
    let counter = 1;
    while (existingStateNames.includes(newStateName)) {
      newStateName = `NewState${counter}`;
      counter++;
    }

    // Create a new empty state
    const newState: QuestState = {
      name: newStateName,
      description: '',
      actions: [],
      rules: []
    };

    // Add the new state to the quest
    onQuestChange({
      states: [...quest.states, newState]
    });
  }, [quest.states, onQuestChange]);

  const handleExportPNG = useCallback(() => {
    if (nodes.length === 0) return;

    // Calculate bounds of all nodes
    const nodesBounds = nodes.reduce(
      (bounds, node) => ({
        x: Math.min(bounds.x, node.position.x),
        y: Math.min(bounds.y, node.position.y),
        x2: Math.max(bounds.x2, node.position.x + (node.width || 260)),
        y2: Math.max(bounds.y2, node.position.y + (node.height || 200)),
      }),
      { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity }
    );

    const width = nodesBounds.x2 - nodesBounds.x;
    const height = nodesBounds.y2 - nodesBounds.y;
    const padding = 100;

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    toPng(viewport, {
      backgroundColor: '#1e293b',
      width: width + padding * 2,
      height: height + padding * 2,
      style: {
        transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px)`,
      },
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `${quest.questName || 'quest'}-diagram.png`;
      link.href = dataUrl;
      link.click();
    }).catch((error) => {
      console.error('Failed to export PNG:', error);
    });
  }, [nodes, quest.questName]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Action Buttons */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 10,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={handleExportPNG}
          style={{
            padding: '8px 16px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
        >
          📷 Export PNG
        </button>
        <button
          onClick={handleAddState}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0e7490',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0e8aaa'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0e7490'}
        >
          <span style={{ fontSize: '16px' }}>+</span>
          Add State
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#334155" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
