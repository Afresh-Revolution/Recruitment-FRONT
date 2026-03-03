import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getImagePath } from '../lib/assets'
import { getTrainee } from '../api/trainee'

const photographyWhite = getImagePath('image/photographyWhite.jpg')
const photographyBlack = getImagePath('image/photographyBlack.jpg')
const sanderson = getImagePath('image/sanderson.jpg')
const designer = getImagePath('image/designerrrr.png')
const DEFAULT_TRAINEES: Array<{ id: string; name: string; role: string; rating: number; image: string }> = [
  { id: '1', name: 'Amara Okeke', role: 'Java Developer', rating: 5, image: photographyBlack },
  { id: '2', name: 'Sanderson Stephen', role: 'Software Developer', rating: 5, image: sanderson },
  { id: '3', name: 'Emmanuel Ola', role: 'UI/UX Designer', rating: 4.8, image: designer },
  { id: '4', name: 'Folake Adebayo', role: 'PHP Developer', rating: 4.9, image: photographyWhite },
]

const Trainee = () => {
  const [sectionTitle, setSectionTitle] = useState('We have over 150+ Trainee')
  const [trainees, setTrainees] = useState<Array<{ id: string; name: string; role: string; rating: number; image: string }>>(DEFAULT_TRAINEES)

  useEffect(() => {
    getTrainee().then((data) => {
      if (data?.sectionTitle) setSectionTitle(data.sectionTitle)
      if (data?.trainees?.length) {
        setTrainees(
          data.trainees.map((t) => ({
            id: t._id,
            name: t.name,
            role: t.role,
            rating: t.rating,
            image: t.avatar || '',
          }))
        )
      }
    })
  }, [])

  return (
    <section className="trainee-section">
      <div className="trainee-container">
        <h2 className="trainee-title">{sectionTitle}</h2>
        <div className="trainees-grid">
          {trainees.map((trainee) => (
            <div key={trainee.id} className="trainee-card">
              <div className="trainee-avatar">
                <img
                  src={trainee.image}
                  alt={trainee.name}
                  className="trainee-avatar-img"
                />
              </div>
              <h3 className="trainee-name">{trainee.name}</h3>
              <p className="trainee-role">{trainee.role}</p>
              <div className="trainee-rating">
                <Star className="star-icon" size={16} fill="#fbbf24" color="#fbbf24" />
                <span className="rating-number">{trainee.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Trainee
