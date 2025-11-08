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
  const [dislikes, setDislikes] = useState({});
  const { id } = useParams();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [imageList, setImageList] = useState([]);
  
  // 新增评论相关状态
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [commentError, setCommentError] = useState(null);

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

  // 获取用户名
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
          setUserName('匿名用户');
        }
      } else {
        setUserName('匿名用户');
      }
    };

    getUsername();
  }, []);

  // 获取评论数据
  const fetchComments = async (questionId) => {
    try {
      const { data, error } = await supabase
        .from('question')
        .select('comments, comment_authors')
        .eq('id', questionId)
        .single();

      if (error) throw error;

      if (data && data.comments && data.comment_authors) {
        // 将评论和作者组合成对象数组
        const commentsList = data.comments.map((comment, index) => ({
          id: index,
          content: comment,
          author: data.comment_authors[index] || '匿名用户',
          timestamp: new Date().toLocaleString() // 这里可以添加真实的时间戳如果数据库有存储的话
        }));
        setComments(commentsList);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('获取评论失败:', err);
      setComments([]);
    }
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
        const initialDislikes = {};
        data.forEach(question => {
          initialLikes[question.id] = Math.max(0, Number(question.likes) || 0);
          initialDislikes[question.id] = Math.max(0, Number(question.dislikes) || 0);
        });

        setQuestions(data);
        setLikes(initialLikes);
        setDislikes(initialDislikes);

        // 获取第一个问题的评论
        if (data && data.length > 0) {
          await fetchComments(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('获取错题失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [id]);

  // 提交评论
  const handleCommentSubmit = async (questionId) => {
    if (!newComment.trim()) {
      setCommentError('评论内容不能为空');
      return;
    }

    setCommentLoading(true);
    setCommentError(null);

    try {
      // 获取当前的评论数据
      const { data: currentData, error: fetchError } = await supabase
        .from('question')
        .select('comments, comment_authors')
        .eq('id', questionId)
        .single();

      if (fetchError) throw fetchError;

      // 构建新的评论和作者数组
      const currentComments = currentData?.comments || [];
      const currentAuthors = currentData?.comment_authors || [];
      
      const updatedComments = [...currentComments, newComment.trim()];
      const updatedAuthors = [...currentAuthors, userName];

      // 更新数据库
      const { error: updateError } = await supabase
        .from('question')
        .update({
          comments: updatedComments,
          comment_authors: updatedAuthors
        })
        .eq('id', questionId);

      if (updateError) throw updateError;

      // 更新本地状态
      const newCommentObj = {
        id: comments.length,
        content: newComment.trim(),
        author: userName,
        timestamp: new Date().toLocaleString()
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      
    } catch (err) {
      console.error('提交评论失败:', err);
      setCommentError('评论提交失败，请重试');
    } finally {
      setCommentLoading(false);
    }
  };

  const openImageViewer = (imageUrl, allImages) => {
    setImageList(allImages);
    setCurrentImage(imageUrl);
    setViewerVisible(true);
  };

  const handleLike = (questionId) => {
    setLikes(prev => ({
      ...prev,
      [questionId]: Math.max(0, prev[questionId] || 0) + 1
    }));
  };

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
    
    const parts = content.split(/(\$\$.*?\$\$|\$.*?\$)/gs);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2).trim();
        return <BlockMath key={index} math={formula} />;
      }
      else if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1).trim();
        return <InlineMath key={index} math={formula} />;
      }
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

            <div style={styles.reactionContainer}>
              <button
                onClick={() => handleLike(question.id)}
                style={styles.likeButton}
                aria-label="点赞"
                className="like-button"
              >
                <i className="bi bi-hand-thumbs-up"></i>
                <span style={styles.reactionCount}>{likes[question.id] || 0}</span>
              </button>
              
              <button
                onClick={() => handleDislike(question.id)}
                style={styles.dislikeButton}
                aria-label="不喜欢"
                className="dislike-button"
              >
                <i className="bi bi-hand-thumbs-down"></i>
                <span style={styles.reactionCount}>{dislikes[question.id] || 0}</span>
              </button>
            </div>

            {/* 评论区域 */}
            <div style={styles.commentsSection}>
              <h3 style={styles.commentsTitle}>
                评论 {comments.length > 0 && `(${comments.length})`}
              </h3>
              
              {/* 评论列表 */}
              <div style={styles.commentsList}>
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} style={styles.commentItem}>
                      <div style={styles.commentHeader}>
                        <span style={styles.commentAuthor}>{comment.author}</span>
                        <span style={styles.commentTime}>{comment.timestamp}</span>
                      </div>
                      <div style={styles.commentContent}>
                        {comment.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.noComments}>
                    <i className="bi bi-chat-left" style={styles.noCommentsIcon}></i>
                    <p>暂无评论，快来发表第一条评论吧</p>
                  </div>
                )}
              </div>

              {/* 评论输入框 */}
              <div style={styles.commentForm}>
                <div style={styles.commentInputContainer}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="写下你的评论..."
                    style={styles.commentInput}
                    rows="3"
                    maxLength="500"
                  />
                  <div style={styles.commentActions}>
                    <span style={styles.charCount}>
                      {newComment.length}/500
                    </span>
                    <button
                      onClick={() => handleCommentSubmit(question.id)}
                      disabled={commentLoading || !newComment.trim()}
                      style={{
                        ...styles.commentSubmitBtn,
                        ...(commentLoading || !newComment.trim() ? styles.commentSubmitBtnDisabled : {})
                      }}
                    >
                      {commentLoading ? (
                        <>
                          <i className="bi bi-arrow-clockwise" style={styles.loadingIcon}></i>
                          发布中...
                        </>
                      ) : (
                        '发布评论'
                      )}
                    </button>
                  </div>
                </div>
                {commentError && (
                  <div style={styles.commentError}>{commentError}</div>
                )}
              </div>
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
  reactionContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: '20px',
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
    whiteSpace: 'nowrap',
  },
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
    whiteSpace: 'nowrap',
  },
  reactionCount: {
    minWidth: '20px',
    textAlign: 'center'
  },
  
  // 评论区域样式
  commentsSection: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '2px solid #f0f0f0'
  },
  commentsTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#2c3e50',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  commentsList: {
    marginBottom: '20px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  commentItem: {
    padding: '16px',
    marginBottom: '12px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e3eaf2',
    transition: 'background-color 0.2s ease'
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  commentAuthor: {
    fontWeight: 600,
    color: '#1976d2',
    fontSize: '14px'
  },
  commentTime: {
    fontSize: '12px',
    color: '#7f8c8d'
  },
  commentContent: {
    fontSize: '15px',
    lineHeight: '1.5',
    color: '#2c3e50',
    wordBreak: 'break-word'
  },
  noComments: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#7f8c8d'
  },
  noCommentsIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    color: '#bdc3c7'
  },
  commentForm: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e3eaf2',
    padding: '16px'
  },
  commentInputContainer: {
    marginBottom: '12px'
  },
  commentInput: {
    width: '100%',
    border: '1px solid #e3eaf2',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    minHeight: '80px'
  },
  commentInputFocus: {
    borderColor: '#3498db',
    outline: 'none'
  },
  commentActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px'
  },
  charCount: {
    fontSize: '13px',
    color: '#7f8c8d'
  },
  commentSubmitBtn: {
    background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  commentSubmitBtnDisabled: {
    background: '#bdc3c7',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  commentError: {
    color: '#e74c3c',
    fontSize: '14px',
    marginTop: '8px'
  },
  loadingIcon: {
    animation: 'spin 1s linear infinite'
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
    width: auto;
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
  
  .comment-item:hover {
    background: #f1f8fe;
  }
  
  .comment-input:focus {
    border-color: #3498db !important;
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
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
    
    .comment-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    
    .comment-actions {
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }
  }
`;
document.head.appendChild(style);

export default QuestionPreview;