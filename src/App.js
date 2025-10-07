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
      setUsername(data?.username || "未知用户")
    }
    return () => listener?.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUsername("")
    navigate("/login")
  }

  return (
    <>
      <nav
        style={{
          background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          borderRadius: '0 0 18px 18px',
          boxShadow: '0 2px 12px rgba(25,118,210,0.08)'
        }}
      >
        <h1 style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 2,
          marginRight: 32,
          textShadow: '0 2px 8px rgba(25,118,210,0.12)'
        }}>班级错题共享库</h1>
        <Link to="/" style={{
          color: '#fff',
          background: 'rgba(255,255,255,0.08)',
          padding: '7px 18px',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 500,
          textDecoration: 'none',
          marginRight: 6,
          transition: 'background 0.2s'
        }}>首页</Link>
        <Link to="/search" style={{
          color: '#fff',
          background: 'rgba(255,255,255,0.08)',
          padding: '7px 18px',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 500,
          textDecoration: 'none',
          marginRight: 6,
          transition: 'background 0.2s'
        }}>查找错题</Link>
        <Link to="/create" style={{
          color: '#fff',
          background: 'rgba(255,255,255,0.08)',
          padding: '7px 18px',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 500,
          textDecoration: 'none',
          marginRight: 6,
          transition: 'background 0.2s'
        }}>上传错题</Link>
        {user ? (
          <>
            <span style={{
              marginLeft: 16,
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              background: 'rgba(255,255,255,0.13)',
              padding: '7px 16px',
              borderRadius: 8,
              letterSpacing: 1
            }}>{username}</span>
            <button
              onClick={handleLogout}
              style={{
                marginLeft: 10,
                background: 'linear-gradient(90deg, #e74c3c 60%, #f39c12 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '7px 18px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(231,76,60,0.10)',
                transition: 'background 0.2s'
              }}
            >退出登录</button>
          </>
        ) : (
          <Link to="/login" style={{
            marginLeft: 16,
            color: '#fff',
            background: 'linear-gradient(90deg, #27ae60 60%, #2ecc71 100%)',
            padding: '7px 18px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.2s'
          }}>登录</Link>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/login" element={<Login />} />
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