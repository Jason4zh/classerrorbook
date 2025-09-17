import React, { useState } from 'react'
import supabase from '../config/supabaseClient'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [theemail, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email:theemail,
      options:｛
        emailRedirectTo:"https://Jason4zh.github.io/classerrorbook"
      ｝
    })
    if (error) {
      setMessage('登录失败: ' + error.message)
    } else {
      setMessage('验证码已发送到邮箱，请查收并完成登录。')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', background: '#fff', padding: 32, borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>邮箱验证码登录</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="请输入邮箱"
          value={theemail}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10, background: '#3498db', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16 }}
        >
          {loading ? '发送中...' : '发送验证码'}
        </button>
      </form>
      {message && <p style={{ marginTop: 16, color: '#27ae60' }}>{message}</p>}
    </div>
  )
}

export default Login
