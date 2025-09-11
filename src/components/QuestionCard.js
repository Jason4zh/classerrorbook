const questionCard = ({ question }) => {
  return (
    <div className="question-card">
      <h3>{question.title}</h3>
      <p>{question.method}</p>
      <div className="rating">{question.rating}</div>
    </div>
  )
}

export default questionCard