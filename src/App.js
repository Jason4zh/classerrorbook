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
      <nav>
        <h1>班级错题共享库</h1>
        <Link to="/">首页</Link>
        <Link to="/search">查找错题</Link>
        <Link to="/create">上传错题</Link>
        {user ? (
          <>
            <span style={{ marginLeft: 16, color: "white" }}>{username}</span>
            <button onClick={handleLogout} style={{ marginLeft: 10 }}>退出登录</button>
          </>
        ) : (
          <Link to="/login" style={{ marginLeft: 16 }}>登录</Link>
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