import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  // 状态管理
  const [formData, setFormData] = useState({
    email: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    text: '',
    type: '' // 'success' | 'error' | ''
  });
  const navigate = useNavigate();

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 表单提交处理
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ text: '请输入有效的邮箱地址', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
      });

      const {} = await supabase
        .from('profiles')
        .upsert({ email: formData.email, username: formData.username || null }, { onConflict: 'email' });
      
      if (error) {
        throw error;
      }

      localStorage.setItem('pendingUsername', formData.username);

      setMessage({
        text: '验证码已发送到邮箱，请查收并完成登录',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: '登录失败: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 样式优化
  const styles = {
    container: {
      maxWidth: 400,
      margin: '60px auto',
      background: '#fff',
      padding: 32,
      borderRadius: 8,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    },
    title: {
      textAlign: 'center',
      marginBottom: 24,
      color: '#333'
    },
    input: {
      width: '100%',
      padding: 12,
      marginBottom: 16,
      borderRadius: 6,
      border: '1px solid #ddd',
      fontSize: 16,
      transition: 'border 0.3s ease'
    },
    inputFocus: {
      borderColor: '#3498db',
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(52, 152, 219, 0.2)'
    },
    button: {
      width: '100%',
      padding: 12,
      background: '#3498db',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      fontSize: 16,
      cursor: 'pointer',
      transition: 'background 0.3s ease'
    },
    buttonDisabled: {
      background: '#95c7ed',
      cursor: 'not-allowed'
    },
    message: {
      marginTop: 16,
      padding: 10,
      borderRadius: 6,
      textAlign: 'center'
    },
    successMessage: {
      backgroundColor: 'rgba(46, 204, 113, 0.1)',
      color: '#27ae60'
    },
    errorMessage: {
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      color: '#e74c3c'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>邮箱验证码登录</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          name="username"
          placeholder="请输入用户名（可不填）"
          value={formData.username}
          onChange={handleInputChange}
          style={styles.input}
          onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
          onBlur={(e) => e.target.style = styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="请输入邮箱"
          value={formData.email}
          onChange={handleInputChange}
          required
          style={styles.input}
          onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
          onBlur={(e) => e.target.style = styles.input}
        />
        <button
          type="submit"
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? '发送中...' : '发送验证码'}
        </button>
      </form>
      {message.text && (
        <p style={{
          ...styles.message,
          ...(message.type === 'success' ? styles.successMessage : styles.errorMessage)
        }}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default Login;