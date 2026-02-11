import Header from '../components/Header'
import Hero from '../components/Hero'
import PoweredBy from '../components/PoweredBy'
import Opportunities from '../components/Opportunities'
import WhyChooseUs from '../components/WhyChooseUs'
import Trainee from '../components/Trainee'
import LifeAtCage from '../components/LifeAtCage'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <main id="main" className="home-main" tabIndex={-1}>
        <Hero />
        <PoweredBy />
        <Opportunities />
        <WhyChooseUs />
        <Trainee />
        <LifeAtCage />
        <Footer />
      </main>
    </div>
  )
}

export default Home
