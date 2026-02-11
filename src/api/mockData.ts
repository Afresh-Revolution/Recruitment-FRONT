import type { PartnerCompany, RoleDetail } from './types'

export const MOCK_PARTNERS: PartnerCompany[] = [
  {
    id: 'cbrilliance',
    name: 'Cbrilliance',
    logo: '/cbrilliance.png',
    tagline: 'Building the infrastructure for the next generation of cloud',
    description:
      'Building the infrastructure for the next generation of cloud computing. Join us to solve complex distributed systems problems.',
    openRoles: 12,
    selectLink: '/cbrilliance-roles',
  },
  {
    id: 'afresh',
    name: 'AfrESH',
    logo: '/afresh.png',
    tagline: 'A digital product studio crafting award-winning experiences',
    description:
      'A digital product studio crafting award-winning experiences for global brands. We value creativity, speed, and precision.',
    openRoles: 8,
    selectLink: '/afresh-roles',
  },
]

export const MOCK_AFRESH_ROLES: RoleDetail[] = [
  { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', jobType: 'Full-time', location: 'Remote', deadline: 'Oct 25' },
  { id: '2', title: 'Product Designer', department: 'Design', jobType: 'Full-time', location: 'Hybrid', deadline: 'Oct 30' },
  { id: '3', title: 'DevOps Specialist', department: 'Engineering', jobType: 'Contract', location: 'Remote', deadline: 'Nov 05' },
  { id: '4', title: 'UX Researcher', department: 'Design', jobType: 'Full-time', location: 'Remote', deadline: 'Nov 10' },
  { id: '5', title: 'Product Manager', department: 'Product', jobType: 'Full-time', location: 'Hybrid', deadline: 'Nov 12' },
  { id: '6', title: 'Backend Engineer', department: 'Engineering', jobType: 'Full-time', location: 'Remote', deadline: 'Nov 15' },
  { id: '7', title: 'Brand Designer', department: 'Design', jobType: 'Contract', location: 'Remote', deadline: 'Nov 18' },
  {
    id: '8',
    title: 'Growth Marketing Lead',
    department: 'Marketing',
    jobType: 'Full-time',
    location: 'Remote',
    deadline: 'Nov 20',
    applicationDeadline: 'Nov 12, 2026',
    description: 'The Managing Director is responsible for providing strategic leadership and overall management of the organization. This role oversees business operations, drives growth, ensures financial sustainability, and represents the company to stakeholders. The Managing Director works closely with senior management to set goals, make key decisions, and ensure the company\'s vision and objectives are achieved efficiently and ethically.',
    requirements: [
      'Proven experience in a senior leadership role, preferably as a Managing Director, CEO, or Operations Manager',
      'Strong strategic planning and business development skills',
      'Ability to manage teams and operations remotely using digital collaboration tools',
      'Excellent decision-making, leadership, and problem-solving abilities',
      'Strong communication and presentation skills for virtual meetings and stakeholder engagement',
      'Financial management and budgeting experience',
      'High level of integrity, professionalism, and accountability',
      'Proficiency in online tools such as email, video conferencing, project management, and cloud-based systems',
    ],
    qualificationsIntro: 'Unemployed individuals seeking leadership and management experience.',
    qualifications: [
      'Undergraduate or postgraduate students',
      'Graduates of recognized institutions',
      'NYSC members or recent NYSC graduates',
      'Others with relevant interest, experience, or leadership capacity',
    ],
  },
]

export const MOCK_CBRILLIANCE_ROLES: RoleDetail[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    jobType: 'Full-time',
    location: 'Remote',
    deadline: 'Oct 25',
    description: 'Build and maintain high-performance web applications for cloud infrastructure. You will work with modern frameworks, design systems, and collaborate with backend and design teams to deliver exceptional user experiences.',
    requirements: [
      '5+ years of experience with React, TypeScript, or similar',
      'Strong understanding of responsive design and accessibility',
      'Experience with cloud platforms and distributed systems',
      'Excellent problem-solving and code review skills',
    ],
    qualificationsIntro: 'Ideal for engineers passionate about cloud-scale frontend.',
    qualifications: [
      'BS/MS in Computer Science or equivalent experience',
      'Portfolio of production React applications',
      'Experience with testing and CI/CD',
    ],
    applicationDeadline: 'Oct 25, 2026',
  },
  { id: '2', title: 'Product Designer', department: 'Design', jobType: 'Full-time', location: 'Hybrid', deadline: 'Oct 30' },
  { id: '3', title: 'DevOps Specialist', department: 'Engineering', jobType: 'Contract', location: 'Remote', deadline: 'Nov 05' },
  { id: '4', title: 'UX Researcher', department: 'Design', jobType: 'Full-time', location: 'Remote', deadline: 'Nov 10' },
  { id: '5', title: 'Product Manager', department: 'Product', jobType: 'Full-time', location: 'Hybrid', deadline: 'Nov 12' },
  { id: '6', title: 'Backend Engineer', department: 'Engineering', jobType: 'Full-time', location: 'Remote', deadline: 'Nov 15' },
  { id: '7', title: 'Brand Designer', department: 'Design', jobType: 'Contract', location: 'Remote', deadline: 'Nov 18' },
  { id: '8', title: 'Technical Marketing Lead', department: 'Marketing', jobType: 'Full-time', location: 'Remote', deadline: 'Nov 22' },
]
