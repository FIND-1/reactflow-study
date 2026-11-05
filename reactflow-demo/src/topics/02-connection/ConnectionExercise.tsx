import { useCallback, useRef } from 'react'
import {
  Background,
  ConnectionMode,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useConnection,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type IsValidConnection,
  type NodeProps,
  type NodeTypes,
  type OnConnect,
} from '@xyflow/react'
import { evaluateConnection, type ExerciseNode, type RuleVerdict } from './connectionRules'
import './connections.css'

const initialNodes: ExerciseNode[] = [
  { id: 'start', type: 'connectionLesson', position: { x: 0, y: 120 }, data: { label: 'Start', role: 'start' } },
  { id: 'a', type: 'connectionLesson', position: { x: 220, y: 0 }, data: { label: 'A', role: 'task' } },
  { id: 'b', type: 'connectionLesson', position: { x: 440, y: 0 }, data: { label: 'B', role: 'task' } },
  { id: 'c', type: 'connectionLesson', position: { x: 440, y: 220 }, data: { label: 'C', role: 'task' } },
  { id: 'end', type: 'connectionLesson', position: { x: 660, y: 120 }, data: { label: 'End', role: 'end' } },
]

const defaultEdgeOptions = { markerEnd: { type: MarkerType.ArrowClosed } }
// 预置 A → B → C，便于在 TODO 完成前就尝试重复边和跨三节点的环。
const initialEdges: Edge[] = [
  { id: 'a-b', source: 'a', sourceHandle: 'out-main', target: 'b', targetHandle: 'in' },
  { id: 'b-c', source: 'b', sourceHandle: 'out-main', target: 'c', targetHandle: 'in' },
]

function ConnectionLessonNode({ data, isConnectable }: NodeProps<ExerciseNode>) {
  // 只订阅“是否正在拖线”，用于在缺少对应端口的节点上显示结构限制。
  const inProgress = useConnection((connection) => connection.inProgress)

  return (
    <div className="connection-lesson-node" data-role={data.role}>
      {data.role !== 'start' && (
        <Handle type="target" position={Position.Left} id="in" isConnectable={isConnectable} />
      )}
      <strong>{data.label}</strong>
      <small>{data.role === 'start' ? '只有输出点 · 禁止输入' : data.role === 'end' ? '只有输入点 · 禁止输出' : '左侧输入 · 右侧输出'}</small>
      {data.role !== 'end' && (
        <Handle type="source" position={Position.Right} id="out-main" isConnectable={isConnectable} />
      )}
      {data.role === 'task' && (
        <Handle type="source" position={Position.Bottom} id="out-alt" isConnectable={isConnectable} />
      )}
      {inProgress && data.role !== 'task' && (
        <span className="connection-structure-hint">
          {data.role === 'start' ? '结构提示：此处没有输入 Handle' : '结构提示：此处没有输出 Handle'}
        </span>
      )}
    </div>
  )
}

const nodeTypes = { connectionLesson: ConnectionLessonNode } satisfies NodeTypes
const verdictLabels: Record<RuleVerdict, string> = { pass: '通过', fail: '拒绝', pending: '待实现' }

// 这些是合成数据探针，不经过 Handle 命中和库内校验，也不会创建边。
// End → A 与 A → Start 在正常端口布局里无法构造，需单独检查规则函数。
const probes: { label: string; connection: Connection }[] = [
  { label: 'End → A', connection: { source: 'end', target: 'a', sourceHandle: null, targetHandle: 'in' } },
  { label: 'A → Start', connection: { source: 'a', target: 'start', sourceHandle: 'out-main', targetHandle: null } },
  { label: 'A → A', connection: { source: 'a', target: 'a', sourceHandle: 'out-main', targetHandle: 'in' } },
  { label: 'C → A（环）', connection: { source: 'c', target: 'a', sourceHandle: 'out-main', targetHandle: 'in' } },
  { label: 'A → B（换端口）', connection: { source: 'a', target: 'b', sourceHandle: 'out-alt', targetHandle: 'in' } },
  { label: 'Start → A（正例）', connection: { source: 'start', target: 'a', sourceHandle: 'out-main', targetHandle: 'in' } },
]

export default function ConnectionExercise() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  // TODO C1：取出边的 setter，并自行导入 addEdge，供 onConnect 使用。
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const lastReport = useRef('')

  const inspectConnection = useCallback((connection: Connection, origin: '拖线校验' | '数据探针') => {
    const results = evaluateConnection({ connection, nodes, edges })
    const reportKey = JSON.stringify({ connection, results })
    // 同一候选和结果只打印一次；每次拖线开始重置，避免鼠标移动时刷屏。
    if (origin === '数据探针' || reportKey !== lastReport.current) {
      console.group(`[连线 / ${origin}] ${connection.source} → ${connection.target}`)
      console.log('候选连接', connection)
      console.table(results.map(({ rule, verdict }) => ({ 规则: rule, 结果: verdictLabels[verdict] })))
      console.groupEnd()
      lastReport.current = reportKey
    }
    // 未填写的规则不能伪装成成功；补齐规则后反馈线路不需要重写。
    return results.every(({ verdict }) => verdict === 'pass')
  }, [nodes, edges])

  const isValidConnection = useCallback<IsValidConnection>(
    (connection) => inspectConnection({
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
    }, '拖线校验'),
    [inspectConnection],
  )

  const onConnect = useCallback<OnConnect>((connection) => {
    console.log('[连线 / onConnect] 收到候选，尚未写入 edges', connection)
    // TODO C2：使用 addEdge 和边的 setter 保存新边；考虑连续连线时的最新状态。
    // 完成后同步调整上面的日志文案与依赖数组，不要在校验函数里创建边。
  }, [])

  return (
    <section className="app connection-exercise">
      <header>
        <p className="eyebrow">ADDING INTERACTIVITY / CONNECTIONS</p>
        <h1>连线：先观察，再填写规则</h1>
        <p className="description">预置 A → B → C。先完成 connectionRules.ts 的 R1–R5，再完成此文件的 C1/C2。</p>
        <p className="description">当前所有规则为“待实现”，新连线统一拒绝；这不表示五条业务规则已经实现。</p>
      </header>
      <details className="connection-probes">
        <summary>候选数据探针（输出到控制台，不是真实拖线）</summary>
        <p>用于测试没有对应 Handle 的非法数据；结果取决于你填写的规则。Start/End 的结构提示不等于业务校验通过。</p>
        <div className="header-actions">
          {probes.map(({ label, connection }) => (
            <button key={label} type="button" onClick={() => inspectConnection(connection, '数据探针')}>{label}</button>
          ))}
        </div>
      </details>
      <section className="flow-container" aria-label="连线校验练习">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          connectionMode={ConnectionMode.Strict}
          connectOnClick={false}
          onConnectStart={(_, params) => {
            lastReport.current = ''
            console.log('[连线 / 开始]', params, '端口结构：Start 无输入，End 无输出；这不等于业务校验已完成。')
          }}
          onConnectEnd={(_, state) => {
            console.log('[连线 / 结束]', { isValid: state.isValid, from: state.fromHandle, to: state.toHandle })
            if (!lastReport.current) console.info('[连线] 本次没有进入业务规则回调，请记录落点、Handle 类型及库内限制，先不要断定原因。')
          }}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </section>
      <p className="app-footer">连接点：绿色＝整体通过，橙色＝未通过或待实现，具体规则看控制台表格。普通节点底部是第二个输出点；换端口仍按同一 source → target 判重。切换章节或刷新恢复起始图。</p>
    </section>
  )
}
