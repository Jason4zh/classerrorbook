import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../config/supabaseClient"
import { Link } from "react-router-dom"


const Upload = () => {
  const navigate = useNavigate()

  // 表单各字段 state
  const [subject, setSubject] = useState('')
  const [questionType, setQuestionType] = useState('')
  const [questionContent, setQuestionContent] = useState('')
  const [wrongAnswer, setWrongAnswer] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [questionImg, setQuestionImg] = useState(null)
  const [formError, setFormError] = useState(null)
  const [answerImg, setAnswerImg] = useState(null)
  const [answerImgUrl, setAnswerImgUrl] = useState(null)
  const [userName, setUserName] = useState('')
  useEffect(() => {
  const getUsername = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .single();
      if (data) {
        setUserName(data.username);
      } else {
        setUserName('匿名');
      }
    } else {
      setUserName('匿名');
    }
  };
  

  getUsername();
}, []);

  // 文件选择
  const handleQuestionFileChange = (e) => {
    setQuestionImg(e.target.files[0])
  }
  const handleAnswerFileChange = (e) => {
    setAnswerImg(e.target.files[0])
  }

  // 拖拽上传
  const handleQuestionDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setQuestionImg(e.dataTransfer.files[0])
    }
  }
  const handleAnswerDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAnswerImg(e.dataTransfer.files[0])
    }
  }

  // 防止默认拖拽行为
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  const handleAnswerDragOver = (e) => {
    e.preventDefault()
  }


  // 表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject || !questionType || !questionContent || !wrongAnswer || !correctAnswer) {
      setFormError('请完整填写带 * 的必填项')
      return
    }

    let imgUrl = null
    if (questionImg) {
      const fileExt = questionImg.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('questionimg')
        .upload(fileName, questionImg)
      if (uploadError) {
        setFormError('图片上传失败，请重试')
        return
      }
      imgUrl = "https://hqzemultusietooosnxt.supabase.co/storage/v1/object/public/questionimg/" + uploadData?.path
    }
    let answerImgUrl = null
    if (answerImg) {
      const fileExt = answerImg.name.split('.').pop()
      const fileName = `${Date.now()}_answer.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('answerimg')
        .upload(fileName, answerImg)
      if (uploadError) {
        setFormError('正确答案图片上传失败，请重试')
        return
      }
      answerImgUrl = "https://hqzemultusietooosnxt.supabase.co/storage/v1/object/public/answerimg/" + uploadData?.path
      setAnswerImgUrl(answerImgUrl)
    }

    // 插入数据库
    const { error } = await supabase
      .from('question')
      .insert([{
        subject,
        type: questionType,
        content: questionContent,
        eanswer: wrongAnswer,
        canswer: correctAnswer,
        analysis,
        qimageurl: imgUrl,
        aimageurl: answerImgUrl,
        author: userName || '匿名'
      }])

    if (error) {
      setFormError('提交失败，请重试')
      return
    }
    setFormError(null)
    navigate('/')
  }
  return (
    <div
      className="container"
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '32px 12px 60px 12px',
        background: '#f7f9fb',
        minHeight: '100vh'
      }}
    >
      <div className="nav" style={{ marginBottom: 20 }}>
        <Link to='/' className="nav-link" style={{ color: '#3498db', textDecoration: 'none', fontSize: 16 }}>← 返回首页</Link>
      </div>
      <h1 className="page-title" style={{
        fontSize: 32,
        fontWeight: 700,
        color: '#1976d2',
        marginBottom: 28,
        textAlign: 'center',
        letterSpacing: 1
      }}>提交新错题</h1>
      <div className="card" style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.07)',
        padding: '32px 24px',
        marginBottom: 32
      }}>
        <h2 className="card-title" style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1976d2',
          marginBottom: 18
        }}>填写错题信息</h2>
        <form id="questionForm" onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label htmlFor="subject" style={{
              fontWeight: 500,
              marginBottom: 7,
              display: 'block',
              color: '#34495e'
            }}>选择学科 <span style={{ color: "#e74c3c" }}>*</span></label>
            <select id="subject" className="form-control" required value={subject} onChange={e => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e3eaf2',
                borderRadius: 8,
                fontSize: 16,
                background: '#fafdff',
                marginTop: 4
              }}>
              <option value="">-- 请选择学科 --</option>
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
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label htmlFor="questionType" style={{
              fontWeight: 500,
              marginBottom: 7,
              display: 'block',
              color: '#34495e'
            }}>选择题型 <span style={{ color: "#e74c3c" }}>*</span></label>
            <select id="questionType" className="form-control" required value={questionType} onChange={e => setQuestionType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e3eaf2',
                borderRadius: 8,
                fontSize: 16,
                background: '#fafdff',
                marginTop: 4
              }}>
              <option value="">-- 请选择题型 --</option>
              <option value="single">单选题</option>
              <option value="multiple">多选题</option>
              <option value="fill">填空题</option>
              <option value="essay">解答题</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label htmlFor="questionContent" style={{
              fontWeight: 500,
              marginBottom: 7,
              display: 'block',
              color: '#34495e'
            }}>错题题干 <span style={{ color: "#e74c3c" }}>*</span></label>
            <textarea id="questionContent" className="form-control" placeholder="请完整输入错题题干" required value={questionContent} onChange={e => setQuestionContent(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e3eaf2',
                borderRadius: 8,
                fontSize: 16,
                background: '#fafdff',
                marginTop: 4,
                minHeight: 70,
                resize: 'vertical'
              }} />
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label htmlFor="wrongAnswer" style={{
              fontWeight: 500,
              marginBottom: 7,
              display: 'block',
              color: '#34495e'
            }}>你的错误答案 <span style={{ color: "#e74c3c" }}>*</span></label>
            <textarea id="wrongAnswer" className="form-control" placeholder="输入你当时做错的答案" required value={wrongAnswer} onChange={e => setWrongAnswer(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e3eaf2',
                borderRadius: 8,
                fontSize: 16,
                background: '#fafdff',
                marginTop: 4
              }} />
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label htmlFor="correctAnswer" style={{
              fontWeight: 500,
              marginBottom: 7,
              display: 'block',
              color: '#34495e'
            }}>正确答案 <span style={{ color: "#e74c3c" }}>*</span></label>
            <textarea id="correctAnswer" className="form-control" placeholder="输入该题的正确答案及简要解析" required value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e3eaf2',
                borderRadius: 8,
                fontSize: 16,
                background: '#fafdff',
                marginTop: 4,
                minHeight: 50,
                resize: 'vertical'
              }} />
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label style={{
              fontWeight: 500,
              marginBottom: 7,
              display: 'block',
              color: '#34495e'
            }}>上传正确答案照片（可选）</label>
            <div
              className="upload-area"
              id="answerUploadArea"
              onClick={() => document.getElementById('answerImg').click()}
              onDrop={handleAnswerDrop}
              onDragOver={handleAnswerDragOver}
              style={{
                border: '2px dashed #90caf9',
                borderRadius: 10,
                background: '#f1f8fe',
                padding: '32px 0',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border 0.2s, background 0.2s',
                marginTop: 6,
                color: '#1976d2',
                fontSize: 17,
                fontWeight: 500
              }}
            >
              <div className="upload-text">
                {answerImg ? answerImg.name : "点击或拖拽文件到此处上传（支持JPG/PNG格式）"}
              </div>
              <input
                type="file"
                id="answerImg"
                accept="image/jpg,image/png"
                style={{ display: "none" }}
                onChange={handleAnswerFileChange}
              />
            </div>
            {answerImgUrl && (
              <div style={{ marginTop: 10 }}>
                <img src={answerImgUrl} alt="正确答案图片" style={{ maxWidth: '100%', borderRadius: 8, border: '1.5px solid #e3eaf2' }} />
              </div>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label htmlFor="analysis" style={{
              fontWeight: 500,
              marginBottom: 7,
              display: 'block',
              color: '#34495e'
            }}>错误分析（可选）</label>
            <textarea id="analysis" className="form-control" placeholder="说明做错的原因" value={analysis} onChange={e => setAnalysis(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e3eaf2',
                borderRadius: 8,
                fontSize: 16,
                background: '#fafdff',
                marginTop: 4,
                minHeight: 50,
                resize: 'vertical'
              }} />
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label style={{
              fontWeight: 500,
              marginBottom: 7,
              display: 'block',
              color: '#34495e'
            }}>上传错题照片（可选）</label>
            <div
              className="upload-area"
              id="uploadArea"
              onClick={() => document.getElementById('questionImg').click()}
              onDrop={handleQuestionDrop}
              onDragOver={handleDragOver}
              style={{
                border: '2px dashed #90caf9',
                borderRadius: 10,
                background: '#f1f8fe',
                padding: '32px 0',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border 0.2s, background 0.2s',
                marginTop: 6,
                color: '#1976d2',
                fontSize: 17,
                fontWeight: 500
              }}
            >
              <div className="upload-text">
                {questionImg ? questionImg.name : "点击或拖拽文件到此处上传（支持JPG/PNG格式）"}
              </div>
              <input
                type="file"
                id="questionImg"
                accept="image/jpg,image/png"
                style={{ display: "none" }}
                onChange={handleQuestionFileChange}
              />
            </div>
          </div>
          <button type="submit" className="btn submit-btn" id="submitBtn"
            style={{
              background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
              marginTop: 8
            }}
          >确认提交错题</button>
          {formError && <p className="error" style={{ color: "#e74c3c", marginTop: "10px", fontSize: 16 }}>{formError}</p>}
        </form>
      </div>
    </div>
  )
}

export default Upload