import supabase from '../config/supabaseClient'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  // 这里获取来自supabase的数据
  const [fetchError, setFetchError] = useState(null)
  const [questions, setQuestions] = useState([])

  // 筛选条件（暂不实现筛选功能，仅展示UI）
  const [subject, setSubject] = useState('')
  const [type, setType] = useState('')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    // 这里获取supabase数据
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('question') // 你的表名，实际应为错题表
        .select()
      if (error) {
        setFetchError('Could not fetch the questions')
        setQuestions([])
      }
      if (data) {
        setQuestions(data)
        setFetchError(null)
      }
    }
    fetchQuestions()
  }, [])

  // 搜索按钮点击事件（仅做演示）
  const handleSearch = () => {
    // 这里只是演示，实际筛选功能未实现
    console.log(`筛选条件：${subject || '全部学科'}，${type || '全部题型'}，关键词：${keyword}`)
  }

  return (
    <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      {/* 导航 */}
      <div className="nav" style={{ marginBottom: 20 }}>
        <Link to='/' className="nav-link" style={{ color: '#3498db', textDecoration: 'none', fontSize: 16 }}>← 返回首页</Link>
      </div>

      {/* 标题 */}
      <h1 className="title" style={{ fontSize: 26, textAlign: 'center', marginBottom: 30, color: '#2c3e50' }}>查找错题</h1>

      {/* 筛选卡片 */}
      <div className="card" style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.06)', padding: 20, marginBottom: 25 }}>
        <h2 className="card-title" style={{ fontSize: 18, marginBottom: 15, color: '#2c3e50' }}>筛选条件</h2>
        <div className="filter" style={{ display: 'flex', flexWrap: 'wrap', gap: 15, alignItems: 'center' }}>
          <div className="filter-item" style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 15 }}>学科</label>
            <select className="input" value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}>
              <option value="">全部</option>
              <option value="chinese">语文</option>
              <option value="math">数学</option>
              <option value="english">英语</option>
              <option value="physics">物理</option>
              <option value="chemistry">化学</option>
              <option value="politics">政治</option>
              <option value="history">历史</option>
              <option value="biology">生物</option>
              <option value="geography">地理</option>
            </select>
          </div>
          <div className="filter-item" style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 15 }}>题型</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}>
              <option value="">全部</option>
              <option value="single">单选题</option>
              <option value="multiple">多选题</option>
              <option value="fill">填空题</option>
              <option value="essay">解答题</option>
            </select>
          </div>
          <div className="search-item" style={{ flex: 2, minWidth: 250 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 15 }}>搜索题干</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="input" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="输入关键词"
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }} />
              <button className="search-btn" onClick={handleSearch}
                style={{ padding: 10, background: '#3498db', color: 'white', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer' }}>
                搜索
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 错题展示卡片 */}
      <div className="card" style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.06)', padding: 20 }}>
        <h2 className="card-title" style={{ fontSize: 18, marginBottom: 15, color: '#2c3e50' }}>错题列表</h2>
        {fetchError && <p>{fetchError}</p>}
        <div className="question-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {questions && questions.length > 0 ? (
            questions.map((q, idx) => (
              <div className="question-card" key={q.id || idx} style={{ border: '1px solid #eee', borderRadius: 6, padding: 15, background: 'white' }}>
                <span className="subject-tag" style={{ display: 'inline-block', padding: '3px 10px', background: '#e3f2fd', color: '#3498db', borderRadius: 20, fontSize: 14, marginBottom: 10 }}>
                  {{
                    chinese: '语文',
                    math: '数学',
                    english: '英语',
                    physics: '物理',
                    chemistry: '化学',
                    politics: '政治',
                    history: '历史',
                    biology: '生物',
                    geography: '地理'
                  }[q.subject] || q.subject || '未知学科'}
                </span>
                <span className="type-tag" style={{
                  display: 'inline-block',
                  padding: '4px 14px',
                  background: '#ffe0b2',
                  color: '#ef6c00',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  {q.type === 'single' && '单选题'}
                  {q.type === 'multiple' && '多选题'}
                  {q.type === 'fill' && '填空题'}
                  {q.type === 'essay' && '解答题'}
                  {!['single', 'multiple', 'fill', 'essay'].includes(q.type) && (q.type || '未知题型')}
                </span>
                <div className="question" style={{ fontSize: 16, marginBottom: 10, lineHeight: 1.6 }}>
                  {q.content || '题干内容'}
                </div>
                <div className="answer" style={{ fontSize: 15, marginBottom: 8, color: '#666' }}>
                  <span style={{ fontWeight: 'bold', color: '#27ae60' }}>正确答案：</span>
                  {q.canswer || '无'}
                </div>
                <div className="answer" style={{ fontSize: 15, marginBottom: 8, color: '#666' }}>
                  <span style={{ fontWeight: 'bold', color: '#e67e22' }}>错误答案：</span>
                  {q.eanswer || '无'}
                </div>
                <div className="meta" style={{ fontSize: 14, color: '#999', marginTop: 10 }}>
                  {q.created_at.slice(0, 19) || '未知日期'} | 提交人：{q.author || '匿名'}
                </div>
              </div>
            ))
          ) : (
            <p>暂无错题数据</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home