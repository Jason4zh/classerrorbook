import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../config/supabaseClient';
import { useParams } from 'react-router-dom';
import Viewer from 'react-viewer';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const QuestionPreview = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({}); // 新增不喜欢状态
  const { id } = useParams();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [imageList, setImageList] = useState([]);

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

  const openImageViewer = (imageUrl, allImages) => {
    setImageList(allImages);
    setCurrentImage(imageUrl);
    setViewerVisible(true);
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

        const initialLikes = {};
        const initialDislikes = {}; // 初始化不喜欢计数
        data.forEach(question => {
          initialLikes[question.id] = Math.max(0, Number(question.likes) || 0);
          initialDislikes[question.id] = Math.max(0, Number(question.dislikes) || 0); // 从数据库获取不喜欢数
        });

        setQuestions(data);
        setLikes(initialLikes);
        setDislikes(initialDislikes); // 设置不喜欢状态
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('获取错题失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // 简化的点赞处理，仅客户端计数+1，不调用API
  const handleLike = (questionId) => {
    setLikes(prev => ({
      ...prev,
      [questionId]: Math.max(0, prev[questionId] || 0) + 1
    }));
  };

  // 新增不喜欢处理，与点赞逻辑相同
  const handleDislike = (questionId) => {
    setDislikes(prev => ({
      ...prev,
      [questionId]: Math.max(0, prev[questionId] || 0) + 1
    }));
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150?text=图片加载失败';
  };

  const renderLatex = (content) => {
    if (!content) return null;
    
    // 分割文本和公式（假设公式用$$包裹块级公式，$包裹行内公式）
    const parts = content.split(/(\$\$.*?\$\$|\$.*?\$)/gs);
    
    return parts.map((part, index) => {
      // 块级公式（$$...$$）
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2).trim();
        return <BlockMath key={index} math={formula} />;
      }
      // 行内公式（$...$）
      else if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1).trim();
        return <InlineMath key={index} math={formula} />;
      }
      // 普通文本
      else {
        return <span key={index}>{part}</span>;
      }
    });
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
      <Viewer
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        images={imageList.map(url => ({ src: url }))}
        activeIndex={imageList.indexOf(currentImage)}
        zoomable={true}
        rotatable={true}
        scalable={true}
        onMaskClick={() => setViewerVisible(false)}
        downloadable={true}
      />

      <div style={styles.header}>
        <Link to="/search" style={styles.backLink}>← 返回查找错题页面</Link>
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
                    style={{ ...styles.questionImage, cursor: 'pointer' }}
                    onError={handleImageError}
                    onClick={() => openImageViewer(question.qimageurl, [
                      question.qimageurl,
                      question.aimageurl
                    ].filter(Boolean))}
                  />
                </div>
              )}
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>错误答案</h3>
              <div style={styles.contentText}>{renderLatex(question.eanswer)}</div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.correctTitle}>正确答案</h3>
              <p style={styles.contentText}>{renderLatex(question.canswer)}</p>

              {question.aimageurl && (
                <div style={styles.imageContainer}>
                  <img
                    src={question.aimageurl}
                    alt="答案图片"
                    style={{...styles.questionImage, cursor: 'pointer'}}
                    onError={handleImageError}
                    onClick={() => openImageViewer(question.aimageurl, [
                      question.qimageurl,
                      question.aimageurl
                    ].filter(Boolean))}
                  />
                </div>
              )}
            </div>

            {question.analysis && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>错误分析</h3>
                <p style={styles.contentText}>{renderLatex(question.analysis)}</p>
              </div>
            )}

            <div style={styles.authorInfo}>
              <span>贡献者: {question.author || '匿名'}</span>
              <span>
                {new Date(question.created_at).toLocaleString()}
              </span>
            </div>

            {/* 修改点赞和不喜欢按钮容器 */}
            <div style={styles.reactionContainer}>
              <button
                onClick={() => handleLike(question.id)}
                style={styles.likeButton}
                aria-label="点赞"
                className="like-button"
              >
                <i class="bi bi-hand-thumbs-up"></i>
                <span style={styles.reactionCount}>{likes[question.id] || 0}</span>
              </button>
              
              <button
                onClick={() => handleDislike(question.id)}
                style={styles.dislikeButton}
                aria-label="不喜欢"
                className="dislike-button"
              >
                <i class="bi bi-hand-thumbs-down"></i>
                <span style={styles.reactionCount}>{dislikes[question.id] || 0}</span>
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
    margin: 0,
    textAlign: 'center',
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
  // 新增反应容器样式，让两个按钮在同一行
  reactionContainer: {
    display: 'flex',
    gap: '12px', // 两个按钮之间的间距
    justifyContent: 'flex-start',
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
    fontWeight: 500,
    whiteSpace: 'nowrap', // 防止按钮内容换行
  },
  // 新增不喜欢按钮样式
  dislikeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: '1px solid #e74c3c',
    color: '#e74c3c',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 500,
    whiteSpace: 'nowrap', // 防止按钮内容换行
  },
  heartIcon: {
    fontSize: '18px'
  },
  dislikeIcon: {
    fontSize: '18px'
  },
  reactionCount: { // 统一计数样式
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

  .like-button, .dislike-button {
    transition: all 0.2s ease;
    width: auto; /* 确保按钮宽度由内容决定 */
  }
  
  .like-button:hover {
    background: #e3f2fd;
  }
  
  .dislike-button:hover {
    background: #fdedeb;
  }
  
  .like-button:active, .dislike-button:active {
    transform: scale(0.95);
  }
  
  .like-button:hover .heart-icon,
  .dislike-button:hover .dislike-icon {
    transform: scale(1.2);
    transition: transform 0.2s ease;
  }
  
  @media (max-width: 480px) {
    .question-card {
      padding: 18px !important;
    }
    
    .title {
      font-size: 24px !important;
    }
    
    .like-button, .dislike-button {
      padding: 5px 12px !important;
      font-size: 14px !important;
    }
  }
`;
document.head.appendChild(style);

export default QuestionPreview;