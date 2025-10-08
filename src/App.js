import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import supabase from "./config/supabaseClient"
import Index from "./pages/Index"
import Home from "./pages/Home"
import Create from "./pages/Create"
import Update from "./pages/Update"
import Login from "./pages/Login"

function AppRoutes() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        getUsername(user.id)
      }
    }
    getInitialUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        getUsername(currentUser.id)
      } else {
        setUsername("")
      }
    })

    async function getUsername(userId) {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single()
      setUsername(data?.username || "暂无名称")
    }
    return () => listener?.subscription.unsubscribe()
  }, [refreshTrigger])

  const refreshUser = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUsername("")
    navigate("/login")
  }

  return (
    <>
      {/* 添加 CSS 动画 */}
      <style>
        {`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
      `}
      </style>

      <nav
        style={{
          background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '0 0 18px 18px',
          boxShadow: '0 2px 12px rgba(25,118,210,0.08)',
          flexWrap: 'wrap'
        }}
      >
        <h1 style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: 'clamp(18px, 5vw, 26px)',
          letterSpacing: 2,
          margin: '0 0 8px 0',
          textShadow: '0 2px 8px rgba(25,118,210,0.12)',
          width: '100%',
          textAlign: 'center'
        }}>班级错题共享库</h1>
        <Link to="/" style={{
          color: '#fff',
          background: 'rgba(255,255,255,0.08)',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 'clamp(14px, 3vw, 16px)',
          fontWeight: 500,
          textDecoration: 'none',
          margin: '0 3px 8px 3px',
          transition: 'background 0.2s',
          flexGrow: 1,
          textAlign: 'center'
        }}>首页</Link>
        <Link to="/search" style={{
          color: '#fff',
          background: 'rgba(255,255,255,0.08)',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 'clamp(14px, 3vw, 16px)',
          fontWeight: 500,
          textDecoration: 'none',
          margin: '0 3px 8px 3px',
          transition: 'background 0.2s',
          flexGrow: 1,
          textAlign: 'center'
        }}>查找错题</Link>
        <Link to="/create" style={{
          color: '#fff',
          background: 'rgba(255,255,255,0.08)',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 'clamp(14px, 3vw, 16px)',
          fontWeight: 500,
          textDecoration: 'none',
          margin: '0 3px 8px 3px',
          transition: 'background 0.2s',
          flexGrow: 1,
          textAlign: 'center'
        }}>上传错题</Link>
        {user ? (
          <>
            <span style={{
              margin: '0 5px 8px 5px',
              color: "#fff",
              fontWeight: 600,
              fontSize: 'clamp(14px, 3vw, 16px)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '8px 16px',
              borderRadius: '12px',
              letterSpacing: 1,
              flexGrow: 1,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              用户：{username}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                transform: 'rotate(45deg)',
                animation: 'shimmer 3s infinite'
              }}></div>
            </span>
            <button
              onClick={handleLogout}
              style={{
                margin: '0 5px 8px 5px',
                background: 'linear-gradient(90deg, #e74c3c 60%, #f39c12 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 'clamp(14px, 3vw, 16px)',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(231,76,60,0.10)',
                transition: 'background 0.2s',
                flexGrow: 1
              }}
            >退出登录</button>
          </>
        ) : (
          <Link to="/login" style={{
            margin: '0 5px 8px 5px',
            color: '#fff',
            background: 'linear-gradient(90deg, #27ae60 60%, #2ecc71 100%)',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 'clamp(14px, 3vw, 16px)',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.2s',
            flexGrow: 1,
            textAlign: 'center'
          }}>登录</Link>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/login" element={<Login onLoginSuccess={refreshUser} />} />
        <Route path="/:id" element={<Update />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App