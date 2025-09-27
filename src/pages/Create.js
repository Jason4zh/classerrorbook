import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../config/supabaseClient';

const Create = () => {
  // 表单状态管理
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('');
  const [content, setContent] = useState('');
  const [canswer, setCanswer] = useState('');
  const [eanswer, setEanswer] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // 处理图片上传
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 限制图片类型和大小
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('请上传JPG、PNG或GIF格式的图片');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }
    
    setImage(file);
    setError(null);
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 表单验证
    if (!subject || !type || !content || !canswer || !eanswer) {
      setError('请填写必填字段（标*的字段）');
      setLoading(false);
      return;
    }

    try {
      // 1. 获取当前登录用户
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      const { data1 }= await supabase
        .from('profiles')
        .select('username')
        .eq('id', session?.user?.id)
        .single();
      const theauthor = data1?.username || '匿名';

      if (authError) throw authError;
      
      let uploadedImageUrl = null;
      
      // 2. 如果有图片，上传到Supabase存储
      if (image) {
        const fileName = `questions/${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('question-images')
          .upload(fileName, image);
          
        if (uploadError) throw uploadError;
        
        // 获取图片URL
        const { data: imageData } = supabase
          .storage
          .from('question-images')
          .getPublicUrl(fileName);
          
        uploadedImageUrl = imageData.publicUrl;
      }
      
      // 3. 保存错题数据到数据库（关联当前用户ID）
      const { error: insertError } = await supabase
        .from('question')
        .insert([
          {
            subject,
            type,
            content,
            canswer,
            eanswer,
            analysis,
            imageurl: uploadedImageUrl,
            user_id: session.user.id,
            author: theauthor,
          }
        ]);
        
      if (insertError) throw insertError;
      
      // 4. 提交成功，返回首页
      navigate('/');
      
    } catch (err) {
      setError('提交失败: ' + err.message);
      console.error('创建错题错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 700,
      margin: '0 auto',
      padding: '32px 16px',
      background: '#f7f9fb',
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: 28,
        color: '#1976d2',
        marginBottom: 32,
        textAlign: 'center'
      }}>添加新错题</h1>
      
      {error && (
        <div style={{
          background: 'rgba(231, 76, 60, 0.1)',
          color: '#e74c3c',
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: 32,
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.07)'
      }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 500,
            color: '#34495e'
          }}>
            学科 <span style={{ color: '#e74c3c' }}>*</span>
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #e3eaf2',
              borderRadius: 8,
              fontSize: 16,
              background: '#fafdff'
            }}
          >
            <option value="">请选择学科</option>
            <option value="chinese">语文</option>
            <option value="math">数学</option>
            <option value="english">英语</option>
            <option value="physics">物理</option>
            <option value="chemistry">化学</option>
            <option value="politics">政治</option>
            <option value="history">历史</option>
            <option value="biology">生物</option>
            <option value="geography">地理</option>
          </select>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 500,
            color: '#34495e'
          }}>
            题型 <span style={{ color: '#e74c3c' }}>*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #e3eaf2',
              borderRadius: 8,
              fontSize: 16,
              background: '#fafdff'
            }}
          >
            <option value="">请选择题型</option>
            <option value="single">单选题</option>
            <option value="multiple">多选题</option>
            <option value="fill">填空题</option>
            <option value="essay">解答题</option>
          </select>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 500,
            color: '#34495e'
          }}>
            题干内容 <span style={{ color: '#e74c3c' }}>*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="请输入题目内容"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #e3eaf2',
              borderRadius: 8,
              fontSize: 16,
              background: '#fafdff',
              minHeight: 100,
              resize: 'vertical'
            }}
          ></textarea>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 500,
            color: '#34495e'
          }}>
            题目图片（可选）
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              width: '100%',
              padding: 10,
              border: '1.5px dashed #e3eaf2',
              borderRadius: 8,
              backgroundColor: '#fafdff',
              cursor: 'pointer'
            }}
          />
          
          {imageUrl && (
            <div style={{ marginTop: 12 }}>
              <img
                src={imageUrl}
                alt="预览"
                style={{
                  maxWidth: '100%',
                  maxHeight: 250,
                  borderRadius: 8,
                  border: '1px solid #e3eaf2'
                }}
              />
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 500,
            color: '#34495e'
          }}>
            正确答案 <span style={{ color: '#e74c3c' }}>*</span>
          </label>
          <input
            type="text"
            value={canswer}
            onChange={(e) => setCanswer(e.target.value)}
            required
            placeholder="请输入正确答案"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #e3eaf2',
              borderRadius: 8,
              fontSize: 16,
              background: '#fafdff'
            }}
          />
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 500,
            color: '#34495e'
          }}>
            错误答案 <span style={{ color: '#e74c3c' }}>*</span>
          </label>
          <input
            type="text"
            value={eanswer}
            onChange={(e) => setEanswer(e.target.value)}
            required
            placeholder="请输入自己答错的答案"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #e3eaf2',
              borderRadius: 8,
              fontSize: 16,
              background: '#fafdff'
            }}
          />
        </div>
        
        <div style={{ marginBottom: 30 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 500,
            color: '#34495e'
          }}>
            错误分析（可选）
          </label>
          <textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            placeholder="请输入错误原因分析"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #e3eaf2',
              borderRadius: 8,
              fontSize: 16,
              background: '#fafdff',
              minHeight: 120,
              resize: 'vertical'
            }}
          ></textarea>
        </div>
        
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '12px 32px',
              background: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            取消
          </button>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 32px',
              background: loading ? '#95c7ed' : 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? '提交中...' : '保存错题'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Create;
