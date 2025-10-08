import { useNavigate } from "react-router-dom";

const Update = () => {
  const navigate = useNavigate();

  const containerStyle = {
    height: 'calc(100vh - 125.6px)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative',
    overflow: 'hidden',
    maxWidth: '100vw',
    margin: '0 auto',
    borderRadius: '20px'
  };

  // 添加背景动画元素
  const backgroundElements = Array.from({ length: 5 }, (_, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        width: `${Math.random() * 100 + 50}px`,
        height: `${Math.random() * 100 + 50}px`,
        background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)`,
        borderRadius: '50%',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animation: `float ${Math.random() * 20 + 10}s infinite ease-in-out`,
        animationDelay: `${Math.random() * 5}s`
      }}
    />
  ));

  const contentStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    zIndex: 2
  };

  const titleStyle = {
    fontSize: '2.2rem',
    fontWeight: '700',
    marginBottom: '30px',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const textStyle = {
    color: '#555',
    fontSize: '1.1rem',
    lineHeight: '1.8',
    marginBottom: '15px'
  };

  const linkStyle = {
    display: 'inline-block',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: '600',
    margin: '20px 0',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  };

  const signatureStyle = {
    color: '#888',
    fontSize: '0.9rem',
    marginTop: '30px',
    fontStyle: 'italic'
  };

  const startPromptStyle = {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    color: 'white',
    padding: '20px 30px',
    borderRadius: '15px',
    margin: '30px 0',
    fontSize: '1.4rem',
    fontWeight: '700',
    boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    animation: 'pulse 2s infinite, glow 1.5s ease-in-out infinite alternate'
  };

  const startPromptBeforeStyle = {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
    transform: 'rotate(45deg)',
    animation: 'shimmer 3s infinite'
  };

  const handleHover = (e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
  };

  const handleHoverOut = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
  };

  const handleStartHover = (e) => {
    e.target.style.transform = 'translateY(-3px) scale(1.02)';
    e.target.style.boxShadow = '0 12px 30px rgba(255, 107, 107, 0.6)';
  };

  const handleStartHoverOut = (e) => {
    e.target.style.transform = 'translateY(0) scale(1)';
    e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4)';
  };

  const handleStartClick = () => {
    console.log('导航到首页');
    navigate('/');
  };

  // 添加 CSS 动画
  const styleSheet = `
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    
    @keyframes glow {
      from { box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4); }
      to { box-shadow: 0 8px 30px rgba(255, 107, 107, 0.7); }
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%) rotate(45deg); }
      100% { transform: translateX(100%) rotate(45deg); }
    }
  `;

  return (
    <div className="page update" style={containerStyle}>
      <style>{styleSheet}</style>
      {backgroundElements}

      <div style={contentStyle}>
        <h2 style={titleStyle}>🚀 网站更新公告</h2>

        {/* 新增的开始提示 */}
        <div
          style={startPromptStyle}
          onMouseEnter={handleStartHover}
          onMouseLeave={handleStartHoverOut}
          onClick={handleStartClick}
        >
          🎯 点击首页以开始探索
          <div style={startPromptBeforeStyle}></div>
        </div>

        <div style={textStyle}>
          <p>✨ 本网站当前版本：1.1.2fix-2</p>
          <p>🎯 新功能正在陆续添加中，敬请期待~</p>
          <p>🔮 前面的区域以后再来探索吧~</p>
        </div>

        <p style={textStyle}>
          欢迎在GitHub上提出建议和反馈~
        </p>

        <a
          href="https://github.com/Jason4zh/classerrorbook/issues"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleHoverOut}
        >
          📝 前往 GitHub 提交反馈
        </a>

        <p style={textStyle}>
          点击 New Issues 提交你的反馈。感谢你的支持！
        </p>

        <div style={signatureStyle}>
          by Jason4zh • 15322313759@163.com
        </div>
      </div>
    </div>
  )
}

export default Update