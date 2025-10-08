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
          padding: '16px 0',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 18,
          textDecoration: 'none',
          marginBottom: 10,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
        }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)';
          }}>
          上传错题
        </Link>
        <Link to="/search" className="main-btn search-btn" style={{
          padding: '16px 0',
          backgroundColor: '#2ecc71',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 18,
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)'
        }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(46, 204, 113, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(46, 204, 113, 0.3)';
          }}>
          查找错题
        </Link>

        {/* 新增的更新页面按钮 */}
        <Link to="/update" className="update-btn" style={{
          padding: '16px 0',
          background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 18,
          textDecoration: 'none',
          marginTop: 10,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(155, 89, 182, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(155, 89, 182, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(155, 89, 182, 0.3)';
          }}>
          <span style={{
            display: 'inline-block',
            animation: 'pulse 2s infinite'
          }}>
            🔔 更新公告
          </span>
        </Link>
      </div>

      {/* 添加CSS动画 */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  )
}

export default Index