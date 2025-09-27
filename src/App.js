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
  const [author, setAuthor] = useState('匿名')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      // 获取当前登录用户
      const {
        data: { session }
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        // 直接从 profiles 表读取 username
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .single();
        if (error) {
          setAuthor('');
        } else {
          setAuthor(data?.username || '');
        }
        setUser(session.user);
      } else {
        setUser(null);
        setAuthor('');
      }
    };
    // 监听登录状态变化
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // 获取用户名（可通过 localStorage 或其他方式传递）
        const username = localStorage.getItem('pendingUsername') || '';
        await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            username: username
          });
        localStorage.removeItem('pendingUsername');
        fetchProfile();
      }
    });
    fetchProfile();
    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate("/login")
  }

  return (
    <>
      <nav>
        <h1>班级错题共享库</h1>
        <Link to="/">首页</Link>
        <Link to="/search">查找错题</Link>
        <Link to="/create">上传错题</Link>
        {(user && author && author !== '匿名') ? (
          <>
            <span style={{ marginLeft: 16, color: "white"}}>{author}</span>
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