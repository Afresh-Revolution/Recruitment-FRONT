import { Star } from 'lucide-react'
import photographyWhite from '../image/photographyWhite.jpg'
import photographyBlack from '../image/photographyBlack.jpg'
import blacknative from '../image/blacknative.jpg'
import scaladev from '../image/scaladev.jpg'

interface Trainee {
  id: string
  name: string
  role: string
  rating: number
  image: string
}

const Trainee = () => {
  const trainees: Trainee[] = [
    {
      id: '1',
      name: 'Amara Okeke',
      role: 'Java Developer',
      rating: 5,
      image: photographyBlack,
    },
    {
      id: '2',
      name: 'Folake Adebayo',
      role: 'PHP Developer',
      rating: 4.9,
      image: photographyWhite,
    },
    {
      id: '3',
      name: 'Tunde Bakare',
      role: 'React Developer',
      rating: 5,
      image: scaladev,
    },
    {
      id: '4',
      name: 'Emeka Okafor',
      role: 'Full Stack',
      rating: 4.8,
      image: blacknative,
    },
  ]

  return (
    <section className="trainee-section">
      <div className="trainee-container">
        <h2 className="trainee-title">We have over 150+ Trainee</h2>
        <div className="trainees-grid">
          {trainees.map((trainee) => (
            <div key={trainee.id} className="trainee-card">
              <div className="trainee-avatar">
                <img src={trainee.image} alt={trainee.name} className="trainee-avatar-img" />
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








