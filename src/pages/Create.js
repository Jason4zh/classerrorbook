import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../config/supabaseClient"
import { Link } from "react-router-dom"
import 'bootstrap-icons/font/bootstrap-icons.css'


const Upload = () => {
  const navigate = useNavigate()

  const [selectedSubjects, setSelectedSubjects] = useState([])
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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [DeploySuccess, setDeploySuccess] = useState(null);
  const [reasoningContent, setReasoningContent] = useState(null)
  const [typeHover, setTypeHover] = useState(false)
  const [typeFocus, setTypeFocus] = useState(false)

  const subjects = [
    { value: 'chinese', label: '语文' },
    { value: 'math', label: '数学' },
    { value: 'english', label: '英语' },
    { value: 'physics', label: '物理' },
    { value: 'chemistry', label: '化学' },
    { value: 'politics', label: '政治' },
    { value: 'history', label: '历史' },
    { value: 'biology', label: '生物' },
    { value: 'geography', label: '地理' }
  ]

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

  const handleSubjectChange = (subjectValue) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectValue)
        ? prev.filter(s => s !== subjectValue)
        : [...prev, subjectValue]
    )
  }

  const handleQuestionFileChange = (e) => {
    setQuestionImg(e.target.files[0])
  }
  const handleAnswerFileChange = (e) => {
    setAnswerImg(e.target.files[0])
  }

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

  const handleDragOver = (e) => {
    e.preventDefault()
  }
  const handleAnswerDragOver = (e) => {
    e.preventDefault()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedSubjects.length === 0 || !questionType || !questionContent || !wrongAnswer || !correctAnswer) {
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

    const { data, error } = await supabase
      .from('question')
      .insert([{
        subject: selectedSubjects.join("&"),
        type: questionType,
        content: questionContent,
        eanswer: wrongAnswer,
        canswer: correctAnswer,
        analysis,
        qimageurl: imgUrl,
        aimageurl: answerImgUrl,
        author: userName || '匿名'
      }])
      .select()

    if (error) {
      setFormError('提交失败，请重试')
      return
    }

    const questionid = data[0].id;
    console.log("Submitted question ID:", questionid);

    try {
      setFormError(null);
      setUploadSuccess(true);
      const isDeployed = await reviewQuestion(questionid);
      setDeploySuccess(isDeployed);
      console.log('isDeployed returned:', isDeployed);
      if (isDeployed) {
        setTimeout(() => {
          navigate('/search');
        }, 3000);
      }
      else {
        setTimeout(() => {
          navigate('/');
        }, 30000);
      }
    } catch (err) {
      setFormError('提交成功，但审核过程出错')
    }

  }

  const reviewQuestion = async (questionId) => {
    try {
      const questionData = {
        subject: selectedSubjects.join("&"),
        type: questionType,
        content: questionContent,
        wrongAnswer: wrongAnswer,
        correctAnswer: correctAnswer,
        analysis: analysis,
      };
      const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer sk-iysspznbiomjccbkyrkzjcnorqyvuazhldmykzxzqrlcmrtl`
        },
        body: JSON.stringify({
          model: "Qwen/Qwen3-8B",
          messages: [
            {
              role: "system",
              content: "请审核以下错题信息是否完整合规，重点检查是否包含敏感内容，学科匹配性，和其是否符合一个学生的错题内容所应该有的，不需要深究题型问题和题目答案是否正确，如若审核通过，则输出字符串'是'，否则输出字符串'不是'"
            },
            {
              role: "user",
              content: `请审核以下错题数据：${JSON.stringify(questionData, null, 2)}`
            }
          ],
          enable_thinking: true,
          temperature: 0.3,
          max_tokens: 1024,
          top_p: 0.9,
          stream: false,
          stop: ["###"]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API错误: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const processedResult = result.choices?.[0]?.message?.content || "";
      const thinkingResult = result.choices?.[0]?.message?.reasoning_content || "";
      const isDeployed = !processedResult.trim().includes("不是");
      setDeploySuccess(isDeployed);
      console.log('reviewQuestion determined isDeployed:', isDeployed);
      setReasoningContent(thinkingResult)

      // --- Changed: use .select() and inspect returned data/error, add logs and explicit checks ---
      const { data: updateData, error: updateError } = await supabase
        .from('question')
        .update({ deployed: isDeployed })
        .eq('id', questionId)
        .select();

      console.log('supabase.update result:', { questionId, isDeployed, updateData, updateError });

      if (updateError) {
        // 如果有错误，抛出以便上层捕获并提示
        throw new Error(`数据更新失败: ${updateError.message}`);
      }
      // 如果没有错误但返回的数据为空，说明没有匹配到行或权限问题
      if (!updateData || updateData.length === 0) {
        throw new Error('更新返回为空，可能未找到记录或没有权限更新该记录（请检查 RLS 和 questionId）');
      }
      // --- end changed ---

      console.log(processedResult, thinkingResult);
      // 返回布尔结果，供调用处立即使用
      return isDeployed;

    } catch (error) {
      console.error("审核接口调用失败:", error);
      setFormError("审核过程出错，请稍后重试");
      throw error;
    }
  };

  const selectStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e3eaf2',
    borderRadius: '12px',
    fontSize: '16px',
    background: '#fafdff',
    marginTop: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 16px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    paddingRight: '48px'
  }

  const selectHoverStyle = {
    ...selectStyle,
    borderColor: '#3498db',
    boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)',
    background: '#ffffff'
  }

  const selectFocusStyle = {
    ...selectStyle,
    borderColor: '#1976d2',
    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)',
    background: '#ffffff',
    outline: 'none'
  }

  return (
    uploadSuccess ? (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        background: '#f7f9fb',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          padding: '40px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(25, 118, 210, 0.1)'
        }}>
          {typeof DeploySuccess === 'boolean' ? (
            DeploySuccess ? (
              <div>
                <div style={{
                  fontSize: '48px',
                  color: '#2ecc71',
                  marginBottom: '20px'
                }}>✔</div>
                <p style={{
                  color: '#2c3e50',
                  fontSize: '20px',
                  lineHeight: '1.6',
                  fontWeight: 500
                }}>
                  审核已通过，请在“查找错题”查看，将在3s后返回首页...
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  fontSize: '48px',
                  color: '#ff2323',
                  marginBottom: '20px'
                }}>✘</div>
                <p style={{
                  color: '#2c3e50',
                  fontSize: '20px',
                  lineHeight: '1.6',
                  fontWeight: 500
                }}>
                  审核未通过，请尝试重新上传，失败理由：<br />
                  {reasoningContent}<br />
                  将在15s后返回首页...
                </p>
              </div>
            )
          ) : (
            <div>
              <i className="bi bi-arrow-clockwise" style={{
                fontSize: '100px',
                marginBottom: '20px',
                animation: 'spin 1.5s linear infinite',
                color: '#1976d2'
              }}></i>
              <p style={{
                color: '#2c3e50',
                fontSize: '20px',
                lineHeight: '1.6',
                fontWeight: 500,
              }}>
                正在审核，请耐心等待，不要退出页面
              </p>
              <style jsx global>{`
          @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
        }`}
              </style>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div
        className="container"
        style={{
          maxWidth: '100%',
          margin: '0 auto',
          padding: '32px 20px 60px',
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
        }}>上传错题</h1>
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
              <label style={{
                fontWeight: 500,
                marginBottom: 12,
                display: 'block',
                color: '#34495e'
              }}>选择学科 <span style={{ color: "#e74c3c" }}>*</span></label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                marginTop: 6
              }}>
                {subjects.map(subject => (
                  <label key={subject.value} style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `2px solid ${selectedSubjects.includes(subject.value) ? '#1976d2' : '#e3eaf2'}`,
                    background: selectedSubjects.includes(subject.value) ? '#e3f2fd' : '#fafdff',
                    transition: 'all 0.2s ease',
                  }}>
                    <input
                      type="checkbox"
                      value={subject.value}
                      checked={selectedSubjects.includes(subject.value)}
                      onChange={() => handleSubjectChange(subject.value)}
                      style={{
                        marginRight: 8,
                        width: 18,
                        height: 18,
                        accentColor: '#1976d2'
                      }}
                    />
                    <span style={{
                      fontSize: 16,
                      color: selectedSubjects.includes(subject.value) ? '#1976d2' : '#34495e',
                      fontWeight: selectedSubjects.includes(subject.value) ? 500 : 'normal'
                    }}>
                      {subject.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 22 }}>
              <label htmlFor="questionType" style={{
                fontWeight: 500,
                marginBottom: 7,
                display: 'block',
                color: '#34495e'
              }}>选择题型 <span style={{ color: "#e74c3c" }}>*</span></label>
              <select
                id="questionType"
                className="form-control"
                required
                value={questionType}
                onChange={e => setQuestionType(e.target.value)}
                onMouseEnter={() => setTypeHover(true)}
                onMouseLeave={() => setTypeHover(false)}
                onFocus={() => setTypeFocus(true)}
                onBlur={() => setTypeFocus(false)}
                style={
                  typeFocus ? selectFocusStyle :
                    typeHover ? selectHoverStyle :
                      selectStyle
                }
              >
                <option value="">请选择题型</option>
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
  )
}

export default Upload