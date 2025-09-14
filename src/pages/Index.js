import React from 'react'
import { Link } from 'react-router-dom'

const Index = () => {
  return (
    <div className="container" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 20 }}>
      {/* 标题 */}
      <h1 className="page-title" style={{ fontSize: 32, color: '#2c3e50', marginBottom: 60, fontWeight: 600 }}>
        班级错题共享库
      </h1>
      {/* 功能按钮区 */}
      <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
        <Link to="/create" className="main-btn" style={{
          padding: '16px 0', backgroundColor: '#3498db', color: 'white', border: 'none',
          borderRadius: 8, fontSize: 18, textDecoration: 'none', marginBottom: 10
        }}>
          上传错题
        </Link>
        <Link to="/search" className="main-btn search-btn" style={{
          padding: '16px 0', backgroundColor: '#2ecc71', color: 'white', border: 'none',
          borderRadius: 8, fontSize: 18, textDecoration: 'none'
        }}>
          查找错题
        </Link>
      </div>
    </div>
  )
}

export default Index