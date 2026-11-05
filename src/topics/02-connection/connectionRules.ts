import type { Connection, Edge, Node } from '@xyflow/react'

export type ExerciseNode = Node<{ label: string; role: 'start' | 'task' | 'end' }, 'connectionLesson'>
export type RuleVerdict = 'pass' | 'fail' | 'pending'

type ValidationContext = {
  connection: Connection
  nodes: readonly ExerciseNode[]
  edges: readonly Edge[]
}

// 返回 pass / fail；pending 只表示还没填写，不代表已经通过业务校验。
// _context 是当前候选连接、节点与边；开始实现时可以改名或解构。
function checkEndOutgoing(_context: ValidationContext): RuleVerdict {
  // TODO R1：End 不能作为连接的输出端。自行返回 pass 或 fail。
  return 'pending'
}

function checkStartIncoming(_context: ValidationContext): RuleVerdict {
  // TODO R2：Start 不能作为连接的输入端。自行返回 pass 或 fail。
  return 'pending'
}

function checkSelfConnection(_context: ValidationContext): RuleVerdict {
  // TODO R3：不允许节点连接自己。自行返回 pass 或 fail。
  return 'pending'
}

function checkCycle(_context: ValidationContext): RuleVerdict {
  // TODO R4：判断加入这条候选连接后是否出现有向环。
  // 要能处理跨多个节点的环；请自行选择并实现判断方法，不修改传入的图。
  return 'pending'
}

function checkDuplicatePair(_context: ValidationContext): RuleVerdict {
  // TODO R5：相同 source → target 不允许再连一次，即使换了 Handle 也不允许。
  return 'pending'
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
