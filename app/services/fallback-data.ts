export interface FallbackService {
  id: string
  service_name: string
  category: string
  service_type: "lvhf" | "hvlf"
  description: string
  hourly_rate: number
  base_price: number
  image_url?: string
  provider_id: string
  profiles: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string
    bio: string
    phone: string
  }
  provider_verification: {
    badge_level: "gold" | "silver" | "bronze"
    verification_status: string
  }[]
}

export const fallbackServices: FallbackService[] = [
  {
    id: "svc-01",
    service_name: "Premium Home Cleaning",
    category: "cleaning",
    service_type: "lvhf",
    description: "Deep cleaning for apartments and villas including kitchen, bathrooms, and living areas.",
    hourly_rate: 18,
    base_price: 120,
    provider_id: "prov-01",
    profiles: {
      id: "prov-01",
      first_name: "Neha",
      last_name: "Verma",
      avatar_url: "/placeholder-user.jpg",
      bio: "Experienced cleaning professional trusted by 500+ households across Bengaluru.",
      phone: "+91 98765 43210",
    },
    provider_verification: [
      {
        badge_level: "gold",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-02",
    service_name: "Wedding Photography Essentials",
    category: "photography",
    service_type: "hvlf",
    description: "Cinematic photography and videography package with two shooters and same-day edits.",
    hourly_rate: 45,
    base_price: 900,
    provider_id: "prov-02",
    profiles: {
      id: "prov-02",
      first_name: "Arjun",
      last_name: "Singh",
      avatar_url: "/placeholder-user.jpg",
      bio: "Award-winning wedding photographer specialising in candid storytelling.",
      phone: "+91 96543 28710",
    },
    provider_verification: [
      {
        badge_level: "silver",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-03",
    service_name: "Emergency Electrical Repairs",
    category: "electrical",
    service_type: "lvhf",
    description: "Certified electrician for quick repairs, appliance installation, and wiring diagnostics.",
    hourly_rate: 35,
    base_price: 150,
    provider_id: "prov-03",
    profiles: {
      id: "prov-03",
      first_name: "Sanjay",
      last_name: "Kulkarni",
      avatar_url: "/placeholder-user.jpg",
      bio: "Licensed electrician with 12 years of residential and commercial experience.",
      phone: "+91 91234 55678",
    },
    provider_verification: [
      {
        badge_level: "bronze",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-04",
    service_name: "Express Plumbing Leak Fix",
    category: "plumbing",
    service_type: "lvhf",
    description: "On-demand leak detection and pipe repair service with 30-minute response time.",
    hourly_rate: 28,
    base_price: 180,
    provider_id: "prov-04",
    profiles: {
      id: "prov-04",
      first_name: "Rohit",
      last_name: "Desai",
      avatar_url: "/placeholder-user.jpg",
      bio: "Master plumber specialising in high-rise residential maintenance.",
      phone: "+91 99876 44321",
    },
    provider_verification: [
      {
        badge_level: "gold",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-05",
    service_name: "Garden Landscaping Design",
    category: "landscaping",
    service_type: "lvhf",
    description: "Complete landscaping makeover including layout, planting, and irrigation planning.",
    hourly_rate: 32,
    base_price: 650,
    provider_id: "prov-05",
    profiles: {
      id: "prov-05",
      first_name: "Ishita",
      last_name: "Menon",
      avatar_url: "/placeholder-user.jpg",
      bio: "Landscape architect creating sustainable outdoor spaces for urban homes.",
      phone: "+91 93456 77889",
    },
    provider_verification: [
      {
        badge_level: "silver",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-06",
    service_name: "Corporate Event Planning Suite",
    category: "event-planning",
    service_type: "hvlf",
    description: "End-to-end corporate event planning including venue, vendors, and on-site coordination.",
    hourly_rate: 60,
    base_price: 1500,
    provider_id: "prov-06",
    profiles: {
      id: "prov-06",
      first_name: "Simran",
      last_name: "Khanna",
      avatar_url: "/placeholder-user.jpg",
      bio: "Event strategist delivering memorable corporate experiences for Fortune 500 clients.",
      phone: "+91 98770 11223",
    },
    provider_verification: [
      {
        badge_level: "gold",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-07",
    service_name: "Deluxe Wedding Catering",
    category: "catering",
    service_type: "hvlf",
    description: "Multi-cuisine catering for weddings including live counters and dessert bars.",
    hourly_rate: 55,
    base_price: 1300,
    provider_id: "prov-07",
    profiles: {
      id: "prov-07",
      first_name: "Ananya",
      last_name: "Roy",
      avatar_url: "/placeholder-user.jpg",
      bio: "Chef-led catering team crafting curated menus for premium celebrations.",
      phone: "+91 90123 44110",
    },
    provider_verification: [
      {
        badge_level: "gold",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-08",
    service_name: "Interior Painting Refresh",
    category: "other",
    service_type: "lvhf",
    description: "Professional painting crew delivering spotless interior finishes in record time.",
    hourly_rate: 25,
    base_price: 400,
    provider_id: "prov-08",
    profiles: {
      id: "prov-08",
      first_name: "Mahesh",
      last_name: "Patil",
      avatar_url: "/placeholder-user.jpg",
      bio: "Certified painting contractor with eco-friendly material expertise.",
      phone: "+91 94521 33660",
    },
    provider_verification: [
      {
        badge_level: "silver",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-09",
    service_name: "Split AC Service & Gas Refill",
    category: "electrical",
    service_type: "lvhf",
    description: "Annual maintenance package for split AC units including deep cleaning and gas refill.",
    hourly_rate: 30,
    base_price: 220,
    provider_id: "prov-09",
    profiles: {
      id: "prov-09",
      first_name: "Farhan",
      last_name: "Ali",
      avatar_url: "/placeholder-user.jpg",
      bio: "HVAC specialist handling residential and commercial climate control systems.",
      phone: "+91 98712 33445",
    },
    provider_verification: [
      {
        badge_level: "bronze",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-10",
    service_name: "Smart Home Setup",
    category: "other",
    service_type: "lvhf",
    description: "Smart lighting, security, and automation setup tailored for modern apartments.",
    hourly_rate: 38,
    base_price: 480,
    provider_id: "prov-10",
    profiles: {
      id: "prov-10",
      first_name: "Lavanya",
      last_name: "Pillai",
      avatar_url: "/placeholder-user.jpg",
      bio: "Home automation consultant integrating IoT solutions with existing infrastructure.",
      phone: "+91 97654 21098",
    },
    provider_verification: [
      {
        badge_level: "silver",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-11",
    service_name: "Modular Kitchen Deep Clean",
    category: "cleaning",
    service_type: "lvhf",
    description: "Degreasing, sanitising, and polishing complete modular kitchen installations.",
    hourly_rate: 22,
    base_price: 260,
    provider_id: "prov-11",
    profiles: {
      id: "prov-11",
      first_name: "Priyanka",
      last_name: "Ghosh",
      avatar_url: "/placeholder-user.jpg",
      bio: "Kitchen hygiene specialist certified in food-safe cleaning practices.",
      phone: "+91 90210 55660",
    },
    provider_verification: [
      {
        badge_level: "bronze",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-12",
    service_name: "Luxury Bridal Makeup",
    category: "other",
    service_type: "hvlf",
    description: "Airbrush bridal makeup with pre-wedding consultation and trial session.",
    hourly_rate: 50,
    base_price: 750,
    provider_id: "prov-12",
    profiles: {
      id: "prov-12",
      first_name: "Rhea",
      last_name: "Kapoor",
      avatar_url: "/placeholder-user.jpg",
      bio: "Celebrity makeup artist delivering timeless looks for premium events.",
      phone: "+91 93214 88990",
    },
    provider_verification: [
      {
        badge_level: "gold",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-13",
    service_name: "Home Theater Installation",
    category: "other",
    service_type: "lvhf",
    description: "Surround sound calibration and projector setup for immersive home entertainment.",
    hourly_rate: 40,
    base_price: 520,
    provider_id: "prov-13",
    profiles: {
      id: "prov-13",
      first_name: "Kabir",
      last_name: "Saxena",
      avatar_url: "/placeholder-user.jpg",
      bio: "Audio-visual engineer with Dolby certification for custom home theaters.",
      phone: "+91 98100 22554",
    },
    provider_verification: [
      {
        badge_level: "silver",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-14",
    service_name: "Poolside Party Planning",
    category: "event-planning",
    service_type: "hvlf",
    description: "Curated poolside parties including décor, entertainment, and themed menus.",
    hourly_rate: 58,
    base_price: 1400,
    provider_id: "prov-14",
    profiles: {
      id: "prov-14",
      first_name: "Tanya",
      last_name: "Mehta",
      avatar_url: "/placeholder-user.jpg",
      bio: "Lifestyle event planner crafting bespoke celebrations across India.",
      phone: "+91 90909 12345",
    },
    provider_verification: [
      {
        badge_level: "gold",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-15",
    service_name: "Eco-Friendly Pest Control",
    category: "other",
    service_type: "lvhf",
    description: "Non-toxic pest control treatments safe for children and pets.",
    hourly_rate: 27,
    base_price: 230,
    provider_id: "prov-15",
    profiles: {
      id: "prov-15",
      first_name: "Deepak",
      last_name: "Joshi",
      avatar_url: "/placeholder-user.jpg",
      bio: "Pest management expert certified in green extermination methods.",
      phone: "+91 90011 77665",
    },
    provider_verification: [
      {
        badge_level: "silver",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-16",
    service_name: "Luxury Car Chauffeur",
    category: "other",
    service_type: "hvlf",
    description: "Premium chauffeur-driven luxury cars for business travel and events.",
    hourly_rate: 65,
    base_price: 520,
    provider_id: "prov-16",
    profiles: {
      id: "prov-16",
      first_name: "Aleem",
      last_name: "Shaikh",
      avatar_url: "/placeholder-user.jpg",
      bio: "Professional chauffeur with fleet of luxury sedans and SUVs.",
      phone: "+91 95550 77882",
    },
    provider_verification: [
      {
        badge_level: "gold",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-17",
    service_name: "Quick Appliance Repair",
    category: "other",
    service_type: "lvhf",
    description: "Same-day repair for washing machines, refrigerators, and kitchen appliances.",
    hourly_rate: 33,
    base_price: 200,
    provider_id: "prov-17",
    profiles: {
      id: "prov-17",
      first_name: "Bhavesh",
      last_name: "Thakkar",
      avatar_url: "/placeholder-user.jpg",
      bio: "Certified technician handling multi-brand appliance repairs with genuine parts.",
      phone: "+91 90155 66542",
    },
    provider_verification: [
      {
        badge_level: "bronze",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-18",
    service_name: "Kids Birthday Party Décor",
    category: "event-planning",
    service_type: "hvlf",
    description: "Theme-based décor, entertainment, and cake coordination for kids parties.",
    hourly_rate: 42,
    base_price: 780,
    provider_id: "prov-18",
    profiles: {
      id: "prov-18",
      first_name: "Juhi",
      last_name: "Bajaj",
      avatar_url: "/placeholder-user.jpg",
      bio: "Creative planner bringing magical themes to life for children celebrations.",
      phone: "+91 88220 33445",
    },
    provider_verification: [
      {
        badge_level: "silver",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-19",
    service_name: "Professional Carpet Shampooing",
    category: "cleaning",
    service_type: "lvhf",
    description: "Industrial-grade carpet cleaning removing stains, odours, and allergens.",
    hourly_rate: 24,
    base_price: 210,
    provider_id: "prov-19",
    profiles: {
      id: "prov-19",
      first_name: "Sunita",
      last_name: "Rao",
      avatar_url: "/placeholder-user.jpg",
      bio: "Carpet care expert with advanced stain-removal certification.",
      phone: "+91 93333 55770",
    },
    provider_verification: [
      {
        badge_level: "bronze",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-20",
    service_name: "Destination Wedding Planning",
    category: "event-planning",
    service_type: "hvlf",
    description: "Complete destination wedding planning including travel, décor, and guest management.",
    hourly_rate: 70,
    base_price: 2200,
    provider_id: "prov-20",
    profiles: {
      id: "prov-20",
      first_name: "Vikram",
      last_name: "Iyer",
      avatar_url: "/placeholder-user.jpg",
      bio: "Destination wedding specialist managing luxury celebrations across Asia.",
      phone: "+91 88990 11223",
    },
    provider_verification: [
      {
        badge_level: "gold",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-21",
    service_name: "Fitness Bootcamp Coach",
    category: "other",
    service_type: "hvlf",
    description: "High-energy bootcamp sessions for corporate teams and private groups.",
    hourly_rate: 48,
    base_price: 360,
    provider_id: "prov-21",
    profiles: {
      id: "prov-21",
      first_name: "Mehul",
      last_name: "Parmar",
      avatar_url: "/placeholder-user.jpg",
      bio: "Certified fitness trainer with expertise in functional and strength training.",
      phone: "+91 90120 99887",
    },
    provider_verification: [
      {
        badge_level: "silver",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-22",
    service_name: "Professional Emcee Services",
    category: "event-planning",
    service_type: "hvlf",
    description: "Bilingual emcee hosting corporate events, product launches, and weddings.",
    hourly_rate: 52,
    base_price: 640,
    provider_id: "prov-22",
    profiles: {
      id: "prov-22",
      first_name: "Sasha",
      last_name: "Fernandes",
      avatar_url: "/placeholder-user.jpg",
      bio: "Dynamic host engaging audiences across 200+ live events.",
      phone: "+91 97000 22334",
    },
    provider_verification: [
      {
        badge_level: "silver",
        verification_status: "approved",
      },
    ],
  },
  {
    id: "svc-23",
    service_name: "Rooftop Solar Installation",
    category: "electrical",
    service_type: "lvhf",
    description: "Design, installation, and maintenance of rooftop solar systems for homes.",
    hourly_rate: 55,
    base_price: 1800,
    provider_id: "prov-23",
    profiles: {
      id: "prov-23",
      first_name: "Harish",
      last_name: "Nair",
      avatar_url: "/placeholder-user.jpg",
      bio: "Renewable energy engineer delivering efficient solar solutions.",
      phone: "+91 96500 66778",
    },
    provider_verification: [
      {
        badge_level: "gold",
        verification_status: "approved",
      },
    ],
  },
]

export const fallbackReviewsByProvider: Record<string, { id: string; rating: number; comment: string; created_at: string }[]> = {
  "prov-01": [
    {
      id: "prov-01-r1",
      rating: 5,
      comment: "Neha and her team were punctual, professional, and left our home sparkling clean!",
      created_at: "2024-02-18T10:00:00.000Z",
    },
    {
      id: "prov-01-r2",
      rating: 4,
      comment: "Reliable service with excellent attention to detail.",
      created_at: "2024-03-05T14:30:00.000Z",
    },
  ],
  "prov-02": [
    {
      id: "prov-02-r1",
      rating: 5,
      comment: "Arjun captured every moment beautifully. Highly recommended!",
      created_at: "2024-01-22T09:00:00.000Z",
    },
    {
      id: "prov-02-r2",
      rating: 5,
      comment: "The photos were stunning and delivered quickly.",
      created_at: "2024-02-11T16:15:00.000Z",
    },
  ],
  "prov-03": [
    {
      id: "prov-03-r1",
      rating: 4,
      comment: "Solved our wiring issues within an hour. Great work!",
      created_at: "2024-03-08T12:45:00.000Z",
    },
    {
      id: "prov-03-r2",
      rating: 5,
      comment: "Professional electrician with fair pricing.",
      created_at: "2024-04-02T18:20:00.000Z",
    },
  ],
  "prov-04": [
    {
      id: "prov-04-r1",
      rating: 5,
      comment: "Quick response and permanent fix for our kitchen leak.",
      created_at: "2024-02-28T08:30:00.000Z",
    },
    {
      id: "prov-04-r2",
      rating: 4,
      comment: "Explained the issue clearly and suggested preventive steps.",
      created_at: "2024-04-19T11:05:00.000Z",
    },
  ],
  "prov-05": [
    {
      id: "prov-05-r1",
      rating: 5,
      comment: "Our balcony garden is now a gorgeous green escape!",
      created_at: "2024-03-15T10:40:00.000Z",
    },
    {
      id: "prov-05-r2",
      rating: 4,
      comment: "Creative designs with sustainable plant choices.",
      created_at: "2024-04-07T15:55:00.000Z",
    },
  ],
  "prov-06": [
    {
      id: "prov-06-r1",
      rating: 5,
      comment: "Flawless execution of our annual conference.",
      created_at: "2024-01-30T09:15:00.000Z",
    },
    {
      id: "prov-06-r2",
      rating: 5,
      comment: "Great vendor coordination and creative team-building ideas.",
      created_at: "2024-03-12T13:30:00.000Z",
    },
  ],
  "prov-07": [
    {
      id: "prov-07-r1",
      rating: 5,
      comment: "The food was outstanding and presentation impeccable.",
      created_at: "2024-02-14T19:00:00.000Z",
    },
    {
      id: "prov-07-r2",
      rating: 4,
      comment: "Guests loved the live counters and dessert spread.",
      created_at: "2024-03-25T20:45:00.000Z",
    },
  ],
  "prov-08": [
    {
      id: "prov-08-r1",
      rating: 4,
      comment: "Smooth paint finish with zero mess left behind.",
      created_at: "2024-03-02T17:10:00.000Z",
    },
    {
      id: "prov-08-r2",
      rating: 5,
      comment: "Completed ahead of schedule with great colour suggestions.",
      created_at: "2024-04-09T09:50:00.000Z",
    },
  ],
  "prov-09": [
    {
      id: "prov-09-r1",
      rating: 5,
      comment: "AC cooling improved dramatically after the service.",
      created_at: "2024-03-19T14:00:00.000Z",
    },
    {
      id: "prov-09-r2",
      rating: 4,
      comment: "Technician explained maintenance tips patiently.",
      created_at: "2024-04-15T11:35:00.000Z",
    },
  ],
  "prov-10": [
    {
      id: "prov-10-r1",
      rating: 5,
      comment: "Our home is now fully automated and super convenient.",
      created_at: "2024-02-05T10:25:00.000Z",
    },
    {
      id: "prov-10-r2",
      rating: 4,
      comment: "Detailed walkthrough and documentation provided.",
      created_at: "2024-03-18T16:45:00.000Z",
    },
  ],
  "prov-11": [
    {
      id: "prov-11-r1",
      rating: 4,
      comment: "Kitchen looks brand new after the cleaning session.",
      created_at: "2024-02-26T08:50:00.000Z",
    },
    {
      id: "prov-11-r2",
      rating: 5,
      comment: "Very hygienic and professional team.",
      created_at: "2024-03-29T12:20:00.000Z",
    },
  ],
  "prov-12": [
    {
      id: "prov-12-r1",
      rating: 5,
      comment: "Makeup lasted all night and looked amazing in photos.",
      created_at: "2024-01-18T07:30:00.000Z",
    },
    {
      id: "prov-12-r2",
      rating: 5,
      comment: "Trial session helped finalise the perfect look.",
      created_at: "2024-02-27T15:05:00.000Z",
    },
  ],
  "prov-13": [
    {
      id: "prov-13-r1",
      rating: 5,
      comment: "Sound quality is phenomenal after the installation.",
      created_at: "2024-03-06T18:30:00.000Z",
    },
    {
      id: "prov-13-r2",
      rating: 4,
      comment: "Professional setup with neat cable management.",
      created_at: "2024-04-12T20:10:00.000Z",
    },
  ],
  "prov-14": [
    {
      id: "prov-14-r1",
      rating: 5,
      comment: "The pool party décor was vibrant and classy.",
      created_at: "2024-02-10T19:20:00.000Z",
    },
    {
      id: "prov-14-r2",
      rating: 4,
      comment: "Great coordination with entertainers and vendors.",
      created_at: "2024-03-21T22:00:00.000Z",
    },
  ],
  "prov-15": [
    {
      id: "prov-15-r1",
      rating: 5,
      comment: "Eco-friendly treatment solved our pest issue without harsh smells.",
      created_at: "2024-03-01T08:15:00.000Z",
    },
    {
      id: "prov-15-r2",
      rating: 4,
      comment: "Follow-up visit ensured pests were gone for good.",
      created_at: "2024-04-08T12:40:00.000Z",
    },
  ],
  "prov-16": [
    {
      id: "prov-16-r1",
      rating: 5,
      comment: "Executive travel was smooth and punctual.",
      created_at: "2024-03-14T09:00:00.000Z",
    },
    {
      id: "prov-16-r2",
      rating: 5,
      comment: "Cars were immaculate and drivers well-trained.",
      created_at: "2024-04-18T07:45:00.000Z",
    },
  ],
  "prov-17": [
    {
      id: "prov-17-r1",
      rating: 4,
      comment: "Fixed our washing machine the same day.",
      created_at: "2024-02-24T13:30:00.000Z",
    },
    {
      id: "prov-17-r2",
      rating: 5,
      comment: "Transparent pricing and genuine parts used.",
      created_at: "2024-03-31T16:55:00.000Z",
    },
  ],
  "prov-18": [
    {
      id: "prov-18-r1",
      rating: 5,
      comment: "Kids were thrilled with the themed décor and games.",
      created_at: "2024-03-09T11:20:00.000Z",
    },
    {
      id: "prov-18-r2",
      rating: 4,
      comment: "Seamless coordination with entertainers and cake vendor.",
      created_at: "2024-04-13T14:05:00.000Z",
    },
  ],
  "prov-19": [
    {
      id: "prov-19-r1",
      rating: 4,
      comment: "Carpets dried quickly and smelled fresh.",
      created_at: "2024-03-04T08:05:00.000Z",
    },
    {
      id: "prov-19-r2",
      rating: 5,
      comment: "Removed tough stains we thought were permanent.",
      created_at: "2024-04-20T10:50:00.000Z",
    },
  ],
  "prov-20": [
    {
      id: "prov-20-r1",
      rating: 5,
      comment: "Flawless destination wedding in Goa. Guests loved every detail.",
      created_at: "2024-01-27T18:20:00.000Z",
    },
    {
      id: "prov-20-r2",
      rating: 5,
      comment: "Handled travel logistics perfectly for 200 guests.",
      created_at: "2024-03-17T21:30:00.000Z",
    },
  ],
  "prov-21": [
    {
      id: "prov-21-r1",
      rating: 5,
      comment: "Bootcamp sessions boosted our team energy and morale.",
      created_at: "2024-02-12T06:45:00.000Z",
    },
    {
      id: "prov-21-r2",
      rating: 4,
      comment: "Challenging yet fun workouts tailored to our needs.",
      created_at: "2024-04-03T07:25:00.000Z",
    },
  ],
  "prov-22": [
    {
      id: "prov-22-r1",
      rating: 5,
      comment: "Sasha kept our product launch lively and engaging.",
      created_at: "2024-02-08T17:40:00.000Z",
    },
    {
      id: "prov-22-r2",
      rating: 5,
      comment: "Handled bilingual segments flawlessly.",
      created_at: "2024-03-27T19:15:00.000Z",
    },
  ],
  "prov-23": [
    {
      id: "prov-23-r1",
      rating: 5,
      comment: "Our electricity bills dropped significantly after the solar install.",
      created_at: "2024-02-01T09:55:00.000Z",
    },
    {
      id: "prov-23-r2",
      rating: 4,
      comment: "Clear ROI projections and professional maintenance support.",
      created_at: "2024-04-05T15:35:00.000Z",
    },
  ],
}
