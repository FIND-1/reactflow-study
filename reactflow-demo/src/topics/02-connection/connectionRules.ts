import type { Connection, Edge, Node } from '@xyflow/react'

export type ExerciseNode = Node<{ label: string; role: 'start' | 'task' | 'end' }, 'connectionLesson'>
export type RuleVerdict = 'pass' | 'fail'

type ValidationContext = {
  connection: Connection
  nodes: readonly ExerciseNode[]
  edges: readonly Edge[]
}

// 规则只看候选连接和当前图，返回 pass / fail。
// 五条规则都会执行，所以允许「多条同时 fail」——拒绝原因不会被前一条挡住。

// 端点查不到时返回 undefined：库内已经保证拖出来的端点存在，
// 这里不做「节点不存在」判断，免得规则和数据探针的容错逻辑混在一起。
function getNodeRole(nodes: readonly ExerciseNode[], nodeId: string) {
  return nodes.find((node) => node.id === nodeId)?.data.role
}

function checkEndOutgoing({ connection, nodes }: ValidationContext): RuleVerdict {
  // R1：End 是流程终点，只能是连线结束的地方，不能当输出端。
  // 输出端就是 connection.source；End 的 data.role 是 'end'。
  return getNodeRole(nodes, connection.source) === 'end' ? 'fail' : 'pass'
}

function checkStartIncoming({ connection, nodes }: ValidationContext): RuleVerdict {
  // R2：Start 是流程起点，只能往外连，不能当输入端。
  // 输入端是 connection.target；Start 的 data.role 是 'start'。
  return getNodeRole(nodes, connection.target) === 'start' ? 'fail' : 'pass'
}

function checkSelfConnection({ connection }: ValidationContext): RuleVerdict {
  // R3：自己连自己（哪怕换成同一个节点的另一个 Handle）都是无意义的边。
  return connection.source === connection.target ? 'fail' : 'pass'
}

// 从 startNodeId 出发，沿现有边的 source → target 方向能走到哪些节点。
// 迭代式深度优先，只读取 edges，不修改传入的图。
function collectReachableNodes(startNodeId: string, edges: readonly Edge[]): Set<string> {
  const reachable = new Set<string>()
  const stack = [startNodeId]

  while (stack.length > 0) {
    const currentId = stack.pop() as string
    for (const edge of edges) {
      if (edge.source !== currentId || reachable.has(edge.target)) continue
      reachable.add(edge.target)
      stack.push(edge.target)
    }
  }

  return reachable
}

function checkCycle({ connection, edges }: ValidationContext): RuleVerdict {
  // R4：候选 a → b 加上去会不会成环，等价于问「现有图里 b 能不能走到 a」。
  // 能走到，就说明 b → … → a 已经存在，再加上 a → b 就闭合成有向环。
  // 从 target 出发做一次可达性遍历，天然支持跨多个节点的环（A→B→C→A），
  // 也顺带覆盖了反向候选：候选是 C → A 时，检查的是「A 能否走到 C」。
  const reachableFromTarget = collectReachableNodes(connection.target, edges)
  return reachableFromTarget.has(connection.source) ? 'fail' : 'pass'
}

function checkDuplicatePair({ connection, edges }: ValidationContext): RuleVerdict {
  // R5：相同 source → target 只允许一条边，故意忽略 Handle ——
  // 符合「同一对节点只连一次」的业务约定，也是 addEdge 内置查重（比较两端 Handle 的
  // connectionExists）拦不住的情况：A 的底部输出点 → B 会被当成另一条边放进来。
  const duplicated = edges.some(
    (edge) => edge.source === connection.source && edge.target === connection.target,
  )
  return duplicated ? 'fail' : 'pass'
}

// 反馈线路已接好：每条规则都会执行，避免前一条失败后看不到后面的练习结果。
export function evaluateConnection(context: ValidationContext) {
  return [
    { rule: 'R1 · End 禁止输出', verdict: checkEndOutgoing(context) },
    { rule: 'R2 · Start 禁止输入', verdict: checkStartIncoming(context) },
    { rule: 'R3 · 禁止自连', verdict: checkSelfConnection(context) },
    { rule: 'R4 · 禁止有向环', verdict: checkCycle(context) },
    { rule: 'R5 · 禁止重复节点对', verdict: checkDuplicatePair(context) },
  ]
}
