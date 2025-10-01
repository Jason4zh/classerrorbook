import React, { useState } from 'react'
import supabase from '../config/supabaseClient'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [theemail, setEmail] = useState('')
  const [theusername, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email: theemail,
    })
    if (error) {
      setMessage('登录失败: ' + error.message)
    } else {
      setMessage('验证码已发送到邮箱，请查收并输入验证码。')
      setStep(2)
    }
    setLoading(false)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error, data } = await supabase.auth.verifyOtp({
      email: theemail,
      token: otp,
      type: 'email',
    })
    if (error) {
      setMessage('验证码错误或已过期，请重试。')
    } else {
      const userID = data.user.id
      const {error :userError} = await supabase.from('profiles').upsert({
        id: userID, 
        username: theusername, 
        email: theemail 
      })
      if(userError){
        setMessage('用户信息保存失败: ' + userError.message)
        setLoading(false)
        return
      }
      setMessage('登录成功，正在跳转...')
      setTimeout(() => {
        navigate('/')
      }, 1200)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', background: '#fff', padding: 32, borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>邮箱验证码登录</h2>
      {step === 1 && (
        <form onSubmit={handleLogin}>
          <input
            type="username"
            placeholder="请输入用户名"
            value={theusername}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 6, border: '1px solid #ccc' }}
          />
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
      )}
      {step === 2 && (
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="请输入邮箱收到的验证码"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 10, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16 }}
          >
            {loading ? '验证中...' : '验证并登录'}
          </button>
        </form>
      )}
      {message && <p style={{ marginTop: 16, color: '#27ae60' }}>{message}</p>}
    </div>
  )
}

export default Login
