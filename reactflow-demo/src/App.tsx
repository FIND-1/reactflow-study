import { useSyncExternalStore } from 'react'
import { lessons, type Lesson } from './lessons'
import { topics } from './topics'
import './App.css'

type Page = Lesson & { hash: string; notePath?: string; status?: string }

const topicPages: Page[] = topics.map((topic) => ({ ...topic, hash: `#topics/${topic.id}` }))
const lessonPages: Page[] = lessons.map((lesson) => ({ ...lesson, hash: `#lessons/${lesson.id}` }))
const pages = [...topicPages, ...lessonPages]
const navigationGroups = [
  { title: '知识点', pages: topicPages },
  { title: '基础示例', pages: lessonPages },
]

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getHash = () => window.location.hash
const getServerHash = () => ''

function App() {
  // hash 是页面选择的唯一来源；刷新、前进和后退都恢复对应页面，不引入路由库。
  // 空 hash 或未知地址显示第一个知识点，画布数据仍由各练习独立管理。
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash)
  const matchedIndex = pages.findIndex((page) => page.hash === hash)
  const pageIndex = matchedIndex < 0 ? 0 : matchedIndex
  const lesson = pages[pageIndex]
  const Demo = lesson.component

  return (
    <div className="learning-layout">
      <aside className="learning-sidebar">
        <p className="eyebrow">REACT FLOW / LEARN</p>
        <h2>学习与练习</h2>
        <p>按知识点阅读笔记、追踪源码，再完成对应练习。</p>
        {navigationGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3>{group.title}</h3>
            {group.pages.map((item, index) => (
              <a key={item.hash} href={item.hash} aria-current={item.hash === lesson.hash ? 'page' : undefined}>
                <small>{item.status ?? item.group}</small>
                {String(index + 1).padStart(2, '0')} · {item.title}
              </a>
            ))}
          </nav>
        ))}
        <p className="next-lesson">知识点编号对应 notes 与 topics 目录；基础示例保留原顺序。实现状态不代表学习已完成。</p>
      </aside>

      <main className="lesson-content">
        <section className="lesson-guide" aria-label={`${lesson.title} 学习指引`}>
          <div className="guide-heading">
            <h2>{lesson.title}</h2>
            <a href={lesson.url} target="_blank" rel="noreferrer">阅读官方章节 ↗</a>
          </div>
          <p><strong>学习目标：</strong>{lesson.goal}</p>
          <p><strong>练习文件：</strong><code>{lesson.file}</code></p>
          {lesson.notePath && <p><strong>笔记文件（相对 demo 根目录）：</strong><code>{lesson.notePath}</code></p>}
          {lesson.status && <p><strong>状态：</strong>{lesson.status}</p>}
          <ol>{lesson.exercises.map((exercise) => <li key={exercise}>{exercise}</li>)}</ol>
          <p><strong>预期现象：</strong>{lesson.expected}</p>
          <p className="lesson-boundary">{lesson.boundary} 切换章节会重新加载示例，画布操作不持久保存；代码修改保留在文件中。</p>
        </section>

        {/* key 让章节切换时重新创建画布，清除上一章的选中状态、视角和临时编辑。 */}
        <Demo key={lesson.id} />

        <nav className="lesson-pagination" aria-label="章节翻页">
          <button type="button" disabled={pageIndex === 0} onClick={() => { window.location.hash = pages[pageIndex - 1].hash }}>上一页</button>
          <span>{pageIndex + 1} / {pages.length} 个练习入口</span>
          <button type="button" disabled={pageIndex === pages.length - 1} onClick={() => { window.location.hash = pages[pageIndex + 1].hash }}>下一页</button>
        </nav>
      </main>
    </div>
  )
}

export default App
