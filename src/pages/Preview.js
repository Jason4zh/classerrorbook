import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../config/supabaseClient';
import { useParams } from 'react-router-dom';

const QuestionPreview = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState({});
  // 添加点赞状态锁，防止重复点击
  const [isLiking, setIsLiking] = useState({});
  const { id } = useParams();

  const subjectMap = {
    'chinese': '语文',
    'math': '数学',
    'english': '英语',
    'physics': '物理',
    'chemistry': '化学',
    'politics': '政治',
    'history': '历史',
    'biology': '生物',
    'geography': '地理'
  };

  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'essay': '解答题'
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('question')
          .select('*')
          .eq('deployed', true)
          .eq("id", id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // 从数据库获取点赞数并初始化
        const initialLikes = {};
        data.forEach(question => {
          // 确保点赞数为非负数字
          initialLikes[question.id] = Math.max(0, Number(question.likes) || 0);
        });
        
        setQuestions(data);
        setLikes(initialLikes);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('获取错题失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleLike = async (questionId) => {
    // 如果正在点赞中，阻止重复点击
    if (isLiking[questionId]) return;

    try {
      setIsLiking(prev => ({ ...prev, [questionId]: true }));
      
      // 获取当前点赞数并确保其为非负
      const currentLikes = Math.max(0, likes[questionId] || 0);
      const newLikesCount = currentLikes + 1;
      
      // 先更新本地状态，提升用户体验
      setLikes(prev => ({ ...prev, [questionId]: newLikesCount }));

      // 更新数据库中的点赞数
      const { error } = await supabase
        .from('question')
        .update({ likes: newLikesCount })
        .eq('id', questionId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating likes:', err);
      // 出错时回滚本地状态
      setLikes(prev => ({ 
        ...prev, 
        [questionId]: Math.max(0, prev[questionId] || 0) 
      }));
    } finally {
      // 解除点赞状态锁
      setIsLiking(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150?text=图片加载失败';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>加载错题中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={styles.retryBtn}
        >
          重试
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p>暂无错题数据</p>
          <Link to="/create" style={styles.primaryBtn}>
            上传第一道错题
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/" style={styles.backLink}>← 返回首页</Link>
        <h1 style={styles.title}>错题预览</h1>
      </div>

      <div style={styles.questionsContainer}>
        {questions.map((question) => (
          <div key={question.id} className="question-card" style={styles.questionCard}>
            <div style={styles.tagsContainer}>
              {question.subject?.split('&').map(subj => (
                <span key={subj} style={styles.subjectTag}>
                  {subjectMap[subj] || subj}
                </span>
              ))}
              <span style={styles.typeTag}>
                {typeMap[question.type] || question.type}
              </span>
            </div>

            <div style={styles.questionContent}>
              <h3 style={styles.questionTitle}>题干</h3>
              <p style={styles.contentText}>{question.content}</p>
              
              {question.qimageurl && (
                <div style={styles.imageContainer}>
                  <img 
                    src={question.qimageurl} 
                    alt="题目图片" 
                    style={styles.questionImage}
                    onError={handleImageError}
                  />
                </div>
              )}
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>错误答案</h3>
              <p style={styles.contentText}>{question.eanswer}</p>
            </div>

            <div style={styles.section}>
              <h3 style={styles.correctTitle}>正确答案</h3>
              <p style={styles.contentText}>{question.canswer}</p>
              
              {question.aimageurl && (
                <div style={styles.imageContainer}>
                  <img 
                    src={question.aimageurl} 
                    alt="答案图片" 
                    style={styles.questionImage}
                    onError={handleImageError}
                  />
                </div>
              )}
            </div>

            {question.analysis && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>错误分析</h3>
                <p style={styles.contentText}>{question.analysis}</p>
              </div>
            )}

            <div style={styles.authorInfo}>
              <span>贡献者: {question.author || '匿名'}</span>
              <span>
                {new Date(question.created_at).toLocaleString()}
              </span>
            </div>

            <div style={styles.likeContainer}>
              <button 
                onClick={() => handleLike(question.id)}
                style={styles.likeButton}
                aria-label="点赞"
                className="like-button"
                disabled={isLiking[question.id]}
              >
                <span style={styles.heartIcon}>❤</span>
                <span style={styles.likeCount}>{likes[question.id] || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '100%',
    minHeight: '100vh',
    margin: '0 auto',
    padding: '20px',
    background: '#f7f9fb',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e3eaf2'
  },
  backLink: {
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 500
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1976d2',
    margin: 0
  },
  questionsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  questionCard: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.07)',
    padding: '24px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  tagsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  subjectTag: {
    background: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500
  },
  typeTag: {
    background: '#f1f8e9',
    color: '#558b2f',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500
  },
  questionContent: {
    marginBottom: '20px'
  },
  section: {
    marginBottom: '20px',
    paddingTop: '10px',
    borderTop: '1px solid #f0f0f0'
  },
  questionTitle: {
    fontSize: '18px',
    color: '#34495e',
    margin: '0 0 10px 0'
  },
  sectionTitle: {
    fontSize: '17px',
    color: '#34495e',
    margin: '10px 0'
  },
  correctTitle: {
    fontSize: '17px',
    color: '#2ecc71',
    margin: '10px 0'
  },
  contentText: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#2c3e50',
    margin: '0 0 10px 0'
  },
  imageContainer: {
    marginTop: '10px',
    marginBottom: '10px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e3eaf2'
  },
  questionImage: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  authorInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '15px',
    paddingTop: '10px',
    borderTop: '1px dashed #e3eaf2'
  },
  likeContainer: {
    display: 'flex',
    justifyContent: 'flex-start', // 仅保留点赞按钮，调整对齐方式
    alignItems: 'center',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #f0f0f0'
  },
  likeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: '1px solid #3498db',
    color: '#3498db',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 500
  },
  heartIcon: {
    fontSize: '18px'
  },
  likeCount: {
    minWidth: '20px',
    textAlign: 'center'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '15px'
  },
  error: {
    color: '#e74c3c',
    fontSize: '16px',
    textAlign: 'center',
    margin: '20px 0'
  },
  retryBtn: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'block',
    margin: '0 auto'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.07)'
  },
  primaryBtn: {
    display: 'inline-block',
    background: '#3498db',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '16px',
    marginTop: '15px'
  }
};

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .like-button {
    transition: all 0.2s ease;
  }
  
  .like-button:hover {
    background: #e3f2fd;
  }
  
  .like-button:active {
    transform: scale(0.95);
  }
  
  .like-button:hover .heart-icon {
    transform: scale(1.2);
    transition: transform 0.2s ease;
  }
  
  .like-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    .question-card {
      padding: 18px !important;
    }
    
    .title {
      font-size: 24px !important;
    }
    
    .like-button {
      padding: 5px 12px !important;
      font-size: 14px !important;
    }
  }
`;
document.head.appendChild(style);

export default QuestionPreview;