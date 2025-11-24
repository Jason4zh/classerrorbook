import supabase from '../config/supabaseClient'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Viewer from 'react-viewer';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const Undeployed = () => {
	const [fetchError, setFetchError] = useState(null)
	const [questions, setQuestions] = useState([])
	const [subject, setSubject] = useState('')
	const [type, setType] = useState('')
	const [keyword, setKeyword] = useState('')
	const [filteredQuestions, setFilteredQuestions] = useState([])
	const [viewerVisible, setViewerVisible] = useState(false);
	const [currentImage, setCurrentImage] = useState('');
	const [allImages, setAllImages] = useState([]);
	const [uploaders, setUploaders] = useState([]);
	const [selectedUploader, setSelectedUploader] = useState('');
	const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
	const [deleteQuestionId, setDeleteQuestionId] = useState(null);
	const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

	const deleteConfirmMessages = [
		"确认要删除这条错题吗？",
		"删除后将无法恢复，确定要继续吗？",
		"请再次确认，这将是不可逆的操作",
		"真的要删除这条宝贵的错题记录吗？",
		"删除后其他同学将无法看到这条错题",
		"这是最后一次学习机会，确定要放弃吗？",
		"删除操作会影响数据完整性，请三思",
		"错题是进步的阶梯，真的要删除吗？",
		"知识无价，删除请谨慎考虑",
		"错题是学习路上的宝贵财富，请珍惜",
		"删除意味着永远失去这份学习资料",
		"您的删除操作将影响知识库的完整性",
		"请确认这不是一时冲动的决定",
		"错题回顾能避免重复犯错，确定要删除吗？",
		"删除后无法找回，建议先备份再操作",
		"这条错题可能对其他同学有帮助，确定删除？",
		"学习成长需要积累，删除请三思而行",
		"错题是检验学习成果的镜子，请慎重",
		"删除操作不可撤销，请再次确认",
		"知识积累不易，删除前请深思熟虑",
		"这条记录可能在未来复习时用到",
		"删除错题等于放弃了一次改进机会",
		"请确保已充分理解这道题目的知识点",
		"错题本的价值在于反复学习，确定删除？",
		"删除后相关学习数据将永久丢失",
		"这是您辛勤整理的学习成果，请珍惜",
		"错题是通往成功的垫脚石，请谨慎处理",
		"删除前请考虑是否已掌握相关知识",
		"学习是一个循环过程，错题很重要",
		"密码的，你tm真的要删除吗？",
		"666这么坚决是人我吃",
		"他妈的你还真点到最后了",
		"卧槽你真狠啊",
		"你这是要和错题说再见吗？",
		"你确定你不想再考虑一下吗？",
		"你这是在和知识作对啊！",
		"你这是在自毁前程啊！",
		"你这是在断送自己的未来啊！",
		"你这是在放弃提升自己的机会啊！",
		"你这是在和学习说拜拜啊！",
		"你这是在和进步说再见啊！",
		"你这是在和成功说拜拜啊！",
		"你这是在和未来说再见啊！",
		"你这是在和希望说拜拜啊！",
		"你这是在和梦想说再见啊！",
		"最终确认：确定要永久删除这条错题吗？"
	];

	const renderLatex = (content) => {
		if (!content) return null;
		const blockRegex = /\$\$(.*?)\$\$/g;
		if (blockRegex.test(content)) {
			const parts = content.split(blockRegex);
			return parts.map((part, index) =>
				index % 2 === 1 ? (
					<BlockMath key={index} math={part} />
				) : (
					part.split(/\$(.*?)\$/g).map((inlinePart, i) =>
						i % 2 === 1 ? (
							<InlineMath key={i} math={inlinePart} />
						) : (
							inlinePart
						)
					)
				)
			);
		}

		return content.split(/\$(.*?)\$/g).map((part, index) =>
			index % 2 === 1 ? (
				<InlineMath key={index} math={part} />
			) : (
				part
			)
		);
	};

	useEffect(() => {
		const fetchQuestions = async () => {
			const { data, error } = await supabase
				.from('question')
				.select()
				.eq('deployed', false)
				.order('id', { ascending: false })
			if (error) {
				setFetchError('Could not fetch the questions')
				setQuestions([])
			}
			if (data) {
				setQuestions(data)
				setFetchError(null)
				const uniqueUploaders = [...new Set(data.map(q => q.author).filter(Boolean))];
				setUploaders(uniqueUploaders);
			}
		}

		fetchQuestions()
	}, [])

	const handleSearch = () => {
		let filtered = [...questions];

		if (subject || type || selectedUploader) {
			filtered = filtered.filter(q =>
				(subject ? q.subject === subject : true) &&
				(type ? q.type === type : true) &&
				(selectedUploader ? q.author === selectedUploader : true)
			);
		}

		if (keyword.trim()) {
			const keywordStr = keyword.trim();
			const ranked = filtered.map(q => {
				let score = 0;
				const content = q.content || '';
				if (content.includes(keywordStr)) {
					score += 114514;
				}
				const keywordParts = keywordStr.split(/\s+/);
				keywordParts.forEach(part => {
					if (content.includes(part)) {
						score += 100;
					}
				});
				const charScore = [...keywordStr].reduce((acc, char) => {
					return acc + (content.includes(char) ? 1 : 0);
				}, 0);
				return { ...q, score: score + charScore };
			});
			filtered = ranked
				.filter(item => item.score > 0)
				.sort((a, b) => b.score - a.score)
				.map(item => {
					const { score, ...rest } = item;
					return rest;
				});
		}
		setFilteredQuestions(filtered);
	};

	const generateRandomPosition = () => {
		const popupWidth = 500;
		const popupHeight = 300;

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		const maxLeft = viewportWidth - popupWidth;
		const maxTop = viewportHeight - popupHeight;

		const randomLeft = Math.max(0, Math.min(maxLeft, Math.random() * maxLeft));
		const randomTop = Math.max(0, Math.min(maxTop, Math.random() * maxTop));

		setPopupPosition({
			top: randomTop,
			left: randomLeft
		});
	};

	const startDeleteConfirm = (id) => {
		setDeleteQuestionId(id);
		setDeleteConfirmStep(1);
		generateRandomPosition();
	};

	const cancelDelete = () => {
		setDeleteConfirmStep(0);
		setDeleteQuestionId(null);
	};

	const confirmDelete = async () => {
		if (deleteConfirmStep < deleteConfirmMessages.length) {
			generateRandomPosition();
			setDeleteConfirmStep(prev => prev + 1);
		} else {
			await handledelete(deleteQuestionId);
			setDeleteConfirmStep(0);
			setDeleteQuestionId(null);
		}
	};

	const handledelete = async (id) => {
		const { data, error } = await supabase
			.from('question')
			.delete()
			.eq('id', id)
		if (error) {
			console.log('删除错题时出错:', error);
		} else {
			console.log('错题已删除:', data);
			setQuestions(questions.filter(q => q.id !== id));
		}
	};

	useEffect(() => {
		setFilteredQuestions(questions);
	}, [questions]);

	const handleImageClick = (id, imageUrl) => {
		const allImages = filteredQuestions
			.filter(q => q.qimageurl)
			.map(q => ({ src: q.qimageurl }));

		setCurrentImage(imageUrl);
		setAllImages(allImages);
		setViewerVisible(true);
	};

	return (
		<div
			className="container"
			style={{
				maxWidth: '100%',
				margin: '0 auto',
				padding: '32px 20px 60px',
				background: '#f7f9fb',
				minHeight: '100vh',
				wordWrap: 'break-word',
				wordBreak: 'break-all'
			}}
		>
			{deleteConfirmStep > 0 && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(0, 0, 0, 0.7)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 1000
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							e.stopPropagation();
							return false;
						}
					}}
					tabIndex={0}
				>
					<div style={{
						position: 'absolute',
						top: `${popupPosition.top}px`,
						left: `${popupPosition.left}px`,
						background: '#fff',
						borderRadius: '16px',
						padding: '32px',
						maxWidth: '500px',
						width: '90%',
						boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
						textAlign: 'center'
					}}>
						<div style={{
							fontSize: '48px',
							color: deleteConfirmStep === deleteConfirmMessages.length ? '#e74c3c' : '#f39c12',
							marginBottom: '20px'
						}}>
							{deleteConfirmStep === deleteConfirmMessages.length ? '⚠️' : '❓'}
						</div>

						<h3 style={{
							color: '#2c3e50',
							fontSize: '20px',
							marginBottom: '16px',
							fontWeight: 600
						}}>
							删除确认
						</h3>

						<p style={{
							color: '#34495e',
							fontSize: '16px',
							lineHeight: '1.6',
							marginBottom: '24px'
						}}>
							{deleteConfirmMessages[deleteConfirmStep - 1]}
						</p>

						<div style={{
							display: 'flex',
							gap: '12px',
							justifyContent: 'center'
						}}>
							<button
								onClick={cancelDelete}
								style={{
									padding: '12px 24px',
									border: '2px solid #bdc3c7',
									background: 'transparent',
									color: '#7f8c8d',
									borderRadius: '8px',
									fontSize: '16px',
									fontWeight: 600,
									cursor: 'pointer',
									transition: 'all 0.2s'
								}}
								onMouseOver={(e) => {
									e.target.style.background = '#ecf0f1';
									e.target.style.borderColor = '#95a5a6';
								}}
								onMouseOut={(e) => {
									e.target.style.background = 'transparent';
									e.target.style.borderColor = '#bdc3c7';
								}}
							>
								取消删除
							</button>

							<button
								onClick={confirmDelete}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										e.stopPropagation();
										return false;
									}
								}}
								style={{
									padding: '12px 24px',
									background: deleteConfirmStep === deleteConfirmMessages.length
										? 'linear-gradient(90deg, #e74c3c 60%, #c0392b 100%)'
										: 'linear-gradient(90deg, #3498db 60%, #2980b9 100%)',
									color: '#fff',
									border: 'none',
									borderRadius: '8px',
									fontSize: '16px',
									fontWeight: 600,
									cursor: 'pointer',
									transition: 'all 0.2s',
									boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
								}}
								onMouseOver={(e) => {
									e.target.style.transform = 'translateY(-2px)';
									e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
								}}
								onMouseOut={(e) => {
									e.target.style.transform = 'translateY(0)';
									e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
								}}
							>
								{deleteConfirmStep === deleteConfirmMessages.length ? '最终确认删除' : '继续确认'}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="nav" style={{ marginBottom: 20 }}>
				<Link to='/' className="nav-link" style={{ color: '#3498db', textDecoration: 'none', fontSize: 16 }}>← 返回首页</Link>
			</div>

			<h1 className="title" style={{
				fontSize: 32,
				fontWeight: 700,
				color: '#1976d2',
				marginBottom: 28,
				textAlign: 'center',
				letterSpacing: 1
			}}>审核未通过的错题</h1>

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
				}}>筛选条件</h2>
				<div className="filter" style={{ display: 'flex', flexWrap: 'wrap', gap: 15, alignItems: 'center' }}>
					<div className="filter-item" style={{ flex: 1, minWidth: 180 }}>
						<label style={{ display: 'block', marginBottom: 7, fontSize: 15, fontWeight: 500, color: '#34495e' }}>学科</label>
						<select className="input" value={subject} onChange={e => setSubject(e.target.value)} style={{
							width: '100%',
							padding: '12px 14px',
							border: '1.5px solid #e3eaf2',
							borderRadius: 8,
							fontSize: 16,
							background: '#fafdff',
							marginTop: 4
						}}>
							<option value="">全部</option>
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
					<div className="filter-item" style={{ flex: 1, minWidth: 180 }}>
						<label style={{ display: 'block', marginBottom: 7, fontSize: 15, fontWeight: 500, color: '#34495e' }}>题型</label>
						<select className="input" value={type} onChange={e => setType(e.target.value)} style={{
							width: '100%',
							padding: '12px 14px',
							border: '1.5px solid #e3eaf2',
							borderRadius: 8,
							fontSize: 16,
							background: '#fafdff',
							marginTop: 4
						}}>
							<option value="">全部</option>
							<option value="single">单选题</option>
							<option value="multiple">多选题</option>
							<option value="fill">填空题</option>
							<option value="essay">解答题</option>
						</select>
					</div>
					<div className="filter-item" style={{ flex: 1, minWidth: 180 }}>
						<label style={{ display: 'block', marginBottom: 7, fontSize: 15, fontWeight: 500, color: '#34495e' }}>上传者</label>
						<select
							className="input"
							value={selectedUploader}
							onChange={e => setSelectedUploader(e.target.value)}
							style={{
								width: '100%',
								padding: '12px 14px',
								border: '1.5px solid #e3eaf2',
								borderRadius: 8,
								fontSize: 16,
								background: '#fafdff',
								marginTop: 4
							}}>
							<option value="">全部</option>
							{uploaders.map((uploader, index) => (
								<option key={index} value={uploader}>
									{uploader}
								</option>
							))}
						</select>
					</div>
					<div className="search-item" style={{ flex: 2, minWidth: 250 }}>
						<label style={{ display: 'block', marginBottom: 7, fontSize: 15, fontWeight: 500, color: '#34495e' }}>搜索题干</label>
						<div style={{ display: 'flex', gap: 8 }}>
							<input type="text" className="input" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="输入关键词"
								style={{
									width: '100%',
									padding: '12px 14px',
									border: '1.5px solid #e3eaf2',
									borderRadius: 8,
									fontSize: 16,
									background: '#fafdff',
									marginTop: 4
								}} />
							<button className="search-btn" onClick={handleSearch}
								style={{
									background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
									color: '#fff',
									border: 'none',
									borderRadius: 8,
									padding: '12px 28px',
									fontSize: 16,
									fontWeight: 600,
									cursor: 'pointer',
									transition: 'background 0.2s, box-shadow 0.2s',
									boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
									marginTop: 4
								}} >
								搜索
							</button>
						</div>
					</div>
				</div>
			</div>

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
				}}>错题列表</h2>
				{fetchError && <p>{fetchError}</p>}
				<div className="question-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
					{filteredQuestions && filteredQuestions.length > 0 ? (
						filteredQuestions.map((q, idx) => (

							<div className="question-card" key={q.id || idx} style={{
								border: '1.5px solid #e3eaf2',
								borderRadius: 12,
								padding: 18,
								background: '#fafdff',
								boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)'
							}}>
								<span className="subject-tag" style={{
									display: 'inline-block',
									padding: '3px 10px',
									background: '#e3f2fd',
									color: '#3498db',
									borderRadius: 20,
									fontSize: 15,
									marginBottom: 10,
									fontWeight: 600,
								}}>
									{
										(() => {
											const subjectMap = {
												chinese: '语文',
												math: '数学',
												english: '英语',
												physics: '物理',
												chemistry: '化学',
												politics: '政治',
												history: '历史',
												biology: '生物',
												geography: '地理'
											};
											return q.subject
												? q.subject.split('&').map(s => subjectMap[s] || s).join('&')
												: '未知学科';
										})()
									}
								</span>
								<span className="type-tag" style={{
									display: 'inline-block',
									padding: '4px 14px',
									background: '#ffe0b2',
									color: '#ef6c00',
									borderRadius: 20,
									fontSize: 14,
									fontWeight: 600,
									marginLeft: 8
								}}>
									{q.type === 'single' && '单选题'}
									{q.type === 'multiple' && '多选题'}
									{q.type === 'fill' && '填空题'}
									{q.type === 'essay' && '解答题'}
									{!['single', 'multiple', 'fill', 'essay'].includes(q.type) && (q.type || '未知题型')}
								</span>
								<Link
									to={`/preview/${q.id}`}
									style={{ textDecoration: 'none' }}
									key={q.id || idx}
								>
									<div className="question" style={{ fontSize: 16, margin: '12px 0 10px 0', lineHeight: 1.7, color: '#34495e' }}>
										{renderLatex(q.content) || '题干内容'}
									</div>
								</Link>
								{q.qimageurl && (
									<div className="question-image" style={{ marginBottom: 10 }}>
										<img
											id={q.id}
											src={q.qimageurl}
											alt="题目图片"
											style={{
												maxWidth: '100%',
												maxHeight: 220,
												borderRadius: 8,
												border: '1.5px solid #e3eaf2',
												display: 'block',
												marginLeft: 0,
												transition: 'transform 0.2s',
												cursor: 'pointer'
											}}
											onClick={() => handleImageClick(q.id, q.qimageurl)}
											onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
											onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
										/>
									</div>
								)}
								<div className="answer" style={{ fontSize: 15, marginBottom: 8, color: '#666' }}>
									<span style={{ fontWeight: 'bold', color: '#27ae60' }}>正确答案：</span>
									{renderLatex(q.canswer) || '无'}
									{q.aimageurl && (
										<div style={{ marginTop: 8 }}>
											<img
												src={q.aimageurl}
												alt="正确答案图片"
												style={{
													maxWidth: '100%',
													maxHeight: 180,
													borderRadius: 8,
													border: '1.5px solid #e3eaf2',
													display: 'block',
													marginLeft: 0,
													transition: 'transform 0.2s',
													cursor: 'pointer'
												}}
												onClick={() => {
													setCurrentImage(q.aimageurl);
													setAllImages([{ src: q.aimageurl }]);
													setViewerVisible(true);
												}}
												onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
												onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
											/>
										</div>
									)}
								</div>
								<div className="answer" style={{ fontSize: 15, marginBottom: 8, color: '#666' }}>
									<span style={{ fontWeight: 'bold', color: '#e67e22' }}>错误答案：</span>
									{renderLatex(q.eanswer) || '无'}
								</div>
								<div className="answer" style={{ fontSize: 15, marginBottom: 8, color: '#666' }}>
									<span style={{ fontWeight: 'bold', color: '#2dbbceff' }}>错误分析：</span>
									{renderLatex(q.analysis) || '无'}
								</div>
								<div className="meta" style={{ fontSize: 14, color: '#999', marginTop: 10 }}>
									{q.created_at?.slice(0, 19) || '未知日期'} | 提交人：{q.author || '匿名'}
								</div>
								<div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
									<Link to={`/edit/${q.id}`} style={{
										padding: '8px 12px',
										background: '#1976d2',
										color: '#fff',
										borderRadius: 8,
										textDecoration: 'none',
										fontWeight: 600,
										fontSize: 14
									}}>编辑</Link>
									<button onClick={() => startDeleteConfirm(q.id)} style={{
										padding: '8px 12px',
										background: '#e74c3c',
										color: '#fff',
										borderRadius: 8,
										textDecoration: 'none',
										fontWeight: 600,
										fontSize: 14,
										cursor: 'pointer',
										border: 'none'
									}}>删除</button>

								</div>
							</div>
						))
					) : (
						<p>暂无错题数据</p>
					)}
				</div>
			</div>
			<Viewer
				visible={viewerVisible}
				onClose={() => setViewerVisible(false)}
				images={allImages}
				activeIndex={allImages.findIndex(img => img.src === currentImage)}
				zoomable={true}
				rotatable={true}
				scalable={true}
				onMaskClick={() => setViewerVisible(false)}
				downloadable={true}
			/>
		</div>

	)
}

export default Undeployed

