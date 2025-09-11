import { useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../config/supabaseClient"

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

  // 文件选择
  const handleFileChange = (e) => {
    setQuestionImg(e.target.files[0])
  }

  // 拖拽上传
  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setQuestionImg(e.dataTransfer.files[0])
    }
  }

  // 防止默认拖拽行为
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // 表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject || !questionType || !questionContent || !wrongAnswer || !correctAnswer) {
      setFormError('请完整填写带 * 的必填项')
      return
    }

    // 上传图片到 Supabase Storage（如有图片）
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
      imgUrl = uploadData?.path
    }

    // 插入数据库
    const { data, error } = await supabase
      .from('questions')
      .insert([{
        subject,
        type: questionType,
        content: questionContent,
        eanswer: wrongAnswer,
        canswer: correctAnswer,
        analysis,
        imageurl: imgUrl
      }])

    if (error) {
      setFormError('提交失败，请重试')
      return
    }
    setFormError(null)
    navigate('/')
  }

  return (
    <div className="container">
      <div className="nav-bar">
        <a href="search.html" className="nav-link">→ 去查找已上传的错题</a>
      </div>
      <h1 className="page-title">提交新错题</h1>
      <div className="card">
        <h2 className="card-title">填写错题信息</h2>
        <form id="questionForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject">选择学科 <span style={{color: "#e74c3c"}}>*</span></label>
            <select id="subject" className="form-control" required value={subject} onChange={e => setSubject(e.target.value)}>
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
          <div className="form-group">
            <label htmlFor="questionType">选择题型 <span style={{color: "#e74c3c"}}>*</span></label>
            <select id="questionType" className="form-control" required value={questionType} onChange={e => setQuestionType(e.target.value)}>
              <option value="">-- 请选择题型 --</option>
              <option value="single">单选题</option>
              <option value="multiple">多选题</option>
              <option value="fill">填空题</option>
              <option value="essay">解答题</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="questionContent">错题题干 <span style={{color: "#e74c3c"}}>*</span></label>
            <textarea id="questionContent" className="form-control" placeholder="请完整输入错题题干" required value={questionContent} onChange={e => setQuestionContent(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="wrongAnswer">你的错误答案 <span style={{color: "#e74c3c"}}>*</span></label>
            <input type="text" id="wrongAnswer" className="form-control" placeholder="输入你当时做错的答案" required value={wrongAnswer} onChange={e => setWrongAnswer(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="correctAnswer">正确答案 <span style={{color: "#e74c3c"}}>*</span></label>
            <textarea id="correctAnswer" className="form-control" placeholder="输入该题的正确答案及简要解析" required value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="analysis">错误分析（可选）</label>
            <textarea id="analysis" className="form-control" placeholder="说明做错的原因，帮助同学避坑" value={analysis} onChange={e => setAnalysis(e.target.value)} />
          </div>
          <div className="form-group">
            <label>上传错题照片（可选）</label>
            <div
              className="upload-area"
              id="uploadArea"
              onClick={() => document.getElementById('questionImg').click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="upload-text">
                {questionImg ? questionImg.name : "点击或拖拽文件到此处上传（支持JPG/PNG格式）"}
              </div>
              <input
                type="file"
                id="questionImg"
                accept="image/jpg,image/png"
                style={{display: "none"}}
                onChange={handleFileChange}
              />
            </div>
          </div>
          <button type="submit" className="btn submit-btn" id="submitBtn">确认提交错题</button>
          {formError && <p className="error" style={{color: "#e74c3c", marginTop: "10px"}}>{formError}</p>}
        </form>
      </div>
    </div>
  )
}

export default Upload