import supabase from '../config/supabaseClient'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Viewer from 'react-viewer';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const Home = () => {
  const [fetchError, setFetchError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [subject, setSubject] = useState('')
  const [type, setType] = useState('')
  const [keyword, setKeyword] = useState('')
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [allImages, setAllImages] = useState([]);

  // 处理LaTeX公式渲染
  const renderLatex = (content) => {
    if (!content) return null;
    
    // 处理块级公式（$$...$$）
    const blockRegex = /\$\$(.*?)\$\$/g;
    if (blockRegex.test(content)) {
      const parts = content.split(blockRegex);
      return parts.map((part, index) => 
        index % 2 === 1 ? (
          <BlockMath key={index} math={part} />
        ) : (
          // 处理行内公式（$...$）
          part.split(/\$(.*?)\$/g).map((inlinePart, i) => 
            i % 2 === 1 ? (
              <InlineMath key={i} math={inlinePart} />
            ) : (
              inlinePart
            )
          )
        )
      );
    }
    
    // 仅处理行内公式
    return content.split(/\$(.*?)\$/g).map((part, index) => 
      index % 2 === 1 ? (
        <InlineMath key={index} math={part} />
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('question')
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

  const handleSearch = () => {
    console.log(`筛选条件：${subject || '全部学科'}，${type || '全部题型'}，关键词：${keyword}`)
    let filtered = questions;

    if (subject || type) {
      filtered = questions.filter(q =>
        (subject ? q.subject === subject : true) &&
        (type ? q.type === type : true)
      )
    }
    if (keyword) {
      let score = 0;
      let ranking = [];
      let tkeyword = keyword.split('');
      filtered.forEach(q => {
        if (q.content.includes(keyword)) {
          score += 114514;
          return;
        }
        let tcontent = q.content.split('');
        for (var i = 0; i < tcontent.length; i++) {
          for (var j = 0; j < tkeyword.length; j++) {
            if (tcontent[i] === tkeyword[j]) {
              score++;
            }
          }
        }
        ranking.push({ id: q.id, score: score });
        score = 0;
      })
      ranking.sort((a, b) => b.score - a.score);
      ranking = ranking.filter(r => r.score > 0);
      filtered = ranking.map(rank => {
        return questions.find(q => q.id === rank.id);
      }).filter(Boolean);
    }

    setFilteredQuestions(filtered)
  }

  useEffect(() => {
    setFilteredQuestions(questions);
  }, [questions]);

  const handleImageClick = (id, imageUrl) => {
    console.log('Image clicked:', id, imageUrl);

    const allImages = filteredQuestions
      .filter(q => q.imageurl)
      .map(q => ({ src: q.imageurl }));
      
    setCurrentImage(imageUrl);
    setAllImages(allImages);
    console.log(allImages);
    setViewerVisible(true);
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '32px 12px 60px 12px',
        background: '#f7f9fb',
        minHeight: '100vh'
      }}
    >
      {/* 导航 */}
      <div className="nav" style={{ marginBottom: 20 }}>
        <Link to='/' className="nav-link" style={{ color: '#3498db', textDecoration: 'none', fontSize: 16 }}>← 返回首页</Link>
      </div>

      {/* 标题 */}
      <h1 className="title" style={{
        fontSize: 32,
        fontWeight: 700,
        color: '#1976d2',
        marginBottom: 28,
        textAlign: 'center',
        letterSpacing: 1
      }}>查找错题</h1>

      {/* 筛选卡片 */}
      <div className="card" style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.07)',
        padding: '32px 24px',
        marginBottom: 32
      }}>
        <h2 className="card-title" style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1976d2',
          marginBottom: 18
        }}>筛选条件</h2>
        <div className="filter" style={{ display: 'flex', flexWrap: 'wrap', gap: 15, alignItems: 'center' }}>
          <div className="filter-item" style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', marginBottom: 7, fontSize: 15, fontWeight: 500, color: '#34495e' }}>学科</label>
            <select className="input" value={subject} onChange={e => setSubject(e.target.value)} style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #e3eaf2',
              borderRadius: 8,
              fontSize: 16,
              background: '#fafdff',
              marginTop: 4
            }}>
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
            <label style={{ display: 'block', marginBottom: 7, fontSize: 15, fontWeight: 500, color: '#34495e' }}>题型</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)} style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #e3eaf2',
              borderRadius: 8,
              fontSize: 16,
              background: '#fafdff',
              marginTop: 4
            }}>
              <option value="">全部</option>
              <option value="single">单选题</option>
              <option value="multiple">多选题</option>
              <option value="fill">填空题</option>
              <option value="essay">解答题</option>
            </select>
          </div>
          <div className="search-item" style={{ flex: 2, minWidth: 250 }}>
            <label style={{ display: 'block', marginBottom: 7, fontSize: 15, fontWeight: 500, color: '#34495e' }}>搜索题干</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="input" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="输入关键词"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1.5px solid #e3eaf2',
                  borderRadius: 8,
                  fontSize: 16,
                  background: '#fafdff',
                  marginTop: 4
                }} />
              <button className="search-btn" onClick={handleSearch}
                style={{
                  background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 28px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                  marginTop: 4
                }} >
                搜索
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 错题展示卡片 */}
      <div className="card" style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.07)',
        padding: '32px 24px',
        marginBottom: 32
      }}>
        <h2 className="card-title" style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1976d2',
          marginBottom: 18
        }}>错题列表</h2>
        {fetchError && <p>{fetchError}</p>}
        <div className="question-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredQuestions && filteredQuestions.length > 0 ? (
            filteredQuestions.map((q, idx) => (
              <div className="question-card" key={q.id || idx} style={{
                border: '1.5px solid #e3eaf2',
                borderRadius: 12,
                padding: 18,
                background: '#fafdff',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)'
              }}>
                <span className="subject-tag" style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  background: '#e3f2fd',
                  color: '#3498db',
                  borderRadius: 20,
                  fontSize: 14,
                  marginBottom: 10,
                  fontWeight: 500
                }}>
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
                  fontWeight: 600,
                  marginLeft: 8
                }}>
                  {q.type === 'single' && '单选题'}
                  {q.type === 'multiple' && '多选题'}
                  {q.type === 'fill' && '填空题'}
                  {q.type === 'essay' && '解答题'}
                  {!['single', 'multiple', 'fill', 'essay'].includes(q.type) && (q.type || '未知题型')}
                </span>
                <div className="question" style={{ fontSize: 16, margin: '12px 0 10px 0', lineHeight: 1.7, color: '#34495e' }}>
                  {renderLatex(q.content) || '题干内容'}
                </div>
                {q.imageurl && (
                  <div className="question-image" style={{ marginBottom: 10 }}>
                    <img
                      id={q.id}
                      src={q.imageurl}
                      alt="题目图片"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 220,
                        borderRadius: 8,
                        border: '1.5px solid #e3eaf2',
                        display: 'block',
                        marginLeft: 0,
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleImageClick(q.id, q.imageurl)}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                )}
                <div className="answer" style={{ fontSize: 15, marginBottom: 8, color: '#666' }}>
                  <span style={{ fontWeight: 'bold', color: '#27ae60' }}>正确答案：</span>
                  {renderLatex(q.canswer) || '无'}
                </div>
                <div className="answer" style={{ fontSize: 15, marginBottom: 8, color: '#666' }}>
                  <span style={{ fontWeight: 'bold', color: '#e67e22' }}>错误答案：</span>
                  {renderLatex(q.eanswer) || '无'}
                </div>
                <div className="answer" style={{ fontSize: 15, marginBottom: 8, color: '#666' }}>
                  <span style={{ fontWeight: 'bold', color: '#2dbbceff' }}>错误分析：</span>
                  {renderLatex(q.analysis) || '无'}
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
      <Viewer
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        images={allImages}
        activeIndex={allImages.findIndex(img => img.src === currentImage)}
        zoomable={true}
        rotatable={true}
        scalable={true}
        onMaskClick={() => setViewerVisible(false)}
      />
    </div>

  )
}

export default Home