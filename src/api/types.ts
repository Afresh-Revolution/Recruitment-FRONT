export interface PartnerCompany {
  id: string
  name: string
  logo: string
  tagline: string
  description: string
  openRoles: number
  /** Route or URL for "Select" (e.g. /afresh-roles or /roles/:companyId) */
  selectLink?: string
}

export interface RoleDetail {
  id: string
  title: string
  department: string
  jobType: string
  location: string
  deadline: string
  description?: string
  requirements?: string[]
  qualificationsIntro?: string
  qualifications?: string[]
  applicationDeadline?: string
}

export interface ApplicationPayload {
  companyId: string
  roleId: string
  jobTitle: string
  fullName: string
  email: string
  phone: string
  address: string
  education: string[]
  role: string
  workingDaysTime: string
  motivation: string
  workRemotely: boolean
  resume?: File
}

/** Backend destination company (inside GET /api/destination data.companies[]) */
export interface DestinationCompany {
  _id: string
  name: string
  logo: string
  description: string
  backgroundImage?: string
  partnerTag?: string
  openRolesCount: number
  selectLink: string
}

/** Backend role (inside GET /api/role or GET /api/role?companyId= data.roles[]) */
export interface BackendRole {
  _id: string
  title: string
  department: string
  type: string
  location: string
  deadline: string
  description?: string
  requirements?: string[]
  qualifications?: string[]
  isActive?: boolean
  applyByLabel?: string
  applyLink?: string
  /** Populated by backend: { _id, name, logo } */
  companyId?: string | { _id: string; name?: string; logo?: string | null }
  createdAt?: string
  updatedAt?: string
}

/** Backend hero (GET /api/hero) */
export interface HeroData {
  _id?: string
  companyId?: string
  navigation?: {
    logo: string
    links: Array<{ label: string; path: string; active?: boolean }>
  }
  headline?: {
    main: string
    highlight: string
    highlightIcon?: string
  }
  description?: string
  cta?: { text: string; link: string }
  features?: Array<{ label: string; icon: string | null; highlighted?: boolean }>
  panels?: {
    topLeft?: { imageUrl: string; alt?: string }
    topRight?: {
      label: string
      count: string
      monthLabels?: string[]
      backgroundImage?: string
      overlayColor?: string
    }
    bottomLeft?: {
      title: string
      iconUrl?: string
      backgroundImage?: string
      overlayColor?: string
    }
    bottomRight?: { imageUrl: string; alt?: string }
  }
  isActive?: boolean
}

/** Backend powered (GET /api/powered) */
export interface PoweredData {
  _id?: string
  title?: string
  partners?: Array<{
    name: string
    logoUrl: string
    logoText?: string
    link?: string
    order?: number
  }>
  companyId?: string
}

/** Backend opportunities role (GET /api/opportunities data.roles[]) */
export interface OpportunityRole {
  _id: string
  title: string
  department: string
  type: string
  location: string
  deadline: string
  company?: { name: string; logo?: string }
  companyId?: string
}

/** Backend opportunities (GET /api/opportunities) */
export interface OpportunitiesData {
  _id?: string
  trendingLabel?: string
  sectionTitle?: string
  roles?: OpportunityRole[]
  viewMoreButton?: { text: string; link: string }
}

/** Backend why choose us (GET /api/whychooseus) */
export interface WhyChooseUsData {
  _id?: string
  headline?: string
  description?: string
  rating?: { score: number; label: string }
  features?: string[]
  previewImages?: string[]
  trainees?: unknown
  gallery?: unknown
  isActive?: boolean
}

/** Backend trainee (GET /api/trainee) */
export interface TraineeItem {
  _id: string
  name: string
  role: string
  avatar: string
  rating: number
}

export interface TraineeSectionData {
  sectionTitle?: string
  trainees?: TraineeItem[]
}

/** Backend gallery (GET /api/gallery) */
export interface GalleryImage {
  url: string
  alt?: string
  order?: number
}

export interface GalleryData {
  _id?: string
  categoryTag?: string
  title?: string
  subtitle?: string
  images?: GalleryImage[]
  copyright?: string
}

/** Admin login response (POST /api/admin/login) */
export interface AdminLoginResponse {
  admin: { _id: string; email: string; name: string; role: string; companyId?: string; companyName?: string }
  token: string
}

/** Application from GET /api/admin/applications */
export interface AdminApplication {
  _id: string
  /** String (ObjectId) or populated { _id, name } */
  companyId?: string | { _id: string; name?: string; logo?: string | null }
  roleId?: string | { _id: string; title?: string }
  data?: {
    fullName?: string
    email?: string
    phone?: string
    address?: string
    educationStatus?: string
    role?: string
    motivation?: string
    attachmentUrl?: string
    attachmentName?: string
    /** Some backends use resumeUrl instead of attachmentUrl */
    resumeUrl?: string
    attachment?: string
  }
  /** Some backends put attachment URL at root */
  attachmentUrl?: string
  resumeUrl?: string
  status?: string
  reviewedAt?: string
  createdAt?: string
  updatedAt?: string
  company?: { _id?: string; name?: string; logo?: string | null }
  role?: { _id?: string; title?: string }
}
