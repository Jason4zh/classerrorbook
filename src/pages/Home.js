import supabase from '../config/supabaseClient'
import { useEffect, useState } from 'react'

// components
import questionCard from '../components/questionCard'

const Home = () => {
  const [fetchError, setFetchError] = useState(null)
  const [questions, setquestions] = useState(null)

  useEffect(() => {
    const fetchquestions = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select()
      
      if (error) {
        setFetchError('Could not fetch the questions')
        setquestions(null)
      }
      if (data) {
        setquestions(data)
        setFetchError(null)
      }
    }

    fetchquestions()

  }, [])

  return (
    <div className="page home">
      {fetchError && (<p>{fetchError}</p>)}
      {questions && (
        <div className="questions">
          {/* order-by buttons */}
          <div className="question-grid">
            {questions.map(question => (
              <questionCard key={question.id} question={question} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home