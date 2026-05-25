import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getImagePath } from '../lib/assets'
import { getTrainee } from '../api/trainee'

const plangnan = getImagePath('image/plangnan.jpg')
const sanderson = getImagePath('image/sandersonstep-original.jpg')
const designer = getImagePath('image/designerrrr.png')
const willy = getImagePath('image/willy.jpg')
const DEFAULT_TRAINEES: Array<{ id: string; name: string; role: string; rating: number; image: string }> = [
  { id: '1', name: 'Plangnan Samuel', role: 'Frontend Developer', rating: 5, image: plangnan },
  { id: '2', name: 'Sanderson Stephen', role: 'Software Developer', rating: 5, image: sanderson },
  { id: '3', name: 'Emmanuel Ola', role: 'UI/UX Designer', rating: 4.8, image: designer },
  { id: '4', name: 'William Onoja', role: 'Full Stack Developer', rating: 4.9, image: willy },
]

const Trainee = () => {
  const [trainees, setTrainees] = useState<Array<{ id: string; name: string; role: string; rating: number; image: string }>>(DEFAULT_TRAINEES)

  useEffect(() => {
    getTrainee().then((data) => {
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
