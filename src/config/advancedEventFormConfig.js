// config/advancedEventFormConfig.js
export const ADVANCED_EVENT_FORM_CONFIG = {
  // Academic Departments
  "Computer Science and Engineering": {
    pageTitle: "CSE Department Event",
    pageDescription: "Organize hackathons, coding competitions, seminars, and academic events",
    icon: "💻",
    color: "from-blue-500 to-cyan-500",
    defaultValues: {
      category: "academic",
      type: "hybrid",
      visibility: "public",
      registrationRequired: true,
      fee: "0",
      targetAudience: "cse-students",
      tags: "computer-science, engineering, technology"
    },
    extraFields: [
      {
        name: "eventType",
        label: "Event Type",
        type: "select",
        required: true,
        options: [
          "Hackathon",
          "Coding Competition",
          "Technical Seminar",
          "Workshop",
          "Project Showcase",
          "Guest Lecture",
          "Industry Visit",
          "Research Symposium",
          "Career Fair",
          "Alumni Meetup"
        ]
      },
      {
        name: "technologyStack",
        label: "Technology Stack",
        type: "multiselect",
        options: ["React", "Node.js", "Python", "Java", "AI/ML", "Cloud Computing", "Blockchain", "IoT", "Cybersecurity", "Mobile Development"]
      },
      {
        name: "difficultyLevel",
        label: "Difficulty Level",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced", "All Levels"]
      },
      {
        name: "teamSize",
        label: "Team Size",
        type: "number",
        min: 1,
        max: 10
      },
      {
        name: "prizePool",
        label: "Prize Pool (BDT)",
        type: "number",
        min: 0
      },
      {
        name: "mentors",
        label: "Mentors/Speakers",
        type: "textarea",
        placeholder: "List of mentors and their expertise"
      },
      {
        name: "certificateProvided",
        label: "Certificate Provided",
        type: "checkbox"
      },
      {
        name: "githubRepo",
        label: "GitHub Repository Link",
        type: "url",
        placeholder: "https://github.com/..."
      }
    ]
  },

  "Electrical and Electronic Engineering": {
    pageTitle: "EEE Department Event",
    pageDescription: "Organize robotics competitions, circuit design contests, and technical workshops",
    icon: "⚡",
    color: "from-yellow-500 to-orange-500",
    defaultValues: {
      category: "academic",
      type: "on-campus",
      visibility: "public",
      registrationRequired: true,
      fee: "0",
      targetAudience: "eee-students",
      tags: "electrical, electronics, robotics"
    },
    extraFields: [
      {
        name: "eventType",
        label: "Event Type",
        type: "select",
        required: true,
        options: [
          "Robotics Competition",
          "Circuit Design Contest",
          "Project Exhibition",
          "Technical Workshop",
          "Industrial Training",
          "Power Systems Seminar",
          "Embedded Systems Workshop",
          "Research Conference"
        ]
      },
      {
        name: "equipmentProvided",
        label: "Equipment Provided",
        type: "multiselect",
        options: ["Arduino Kits", "Raspberry Pi", "Sensors", "Microcontrollers", "Oscilloscopes", "Power Supplies", "Soldering Kits", "PCB Materials"]
      },
      {
        name: "softwareTools",
        label: "Software Tools",
        type: "multiselect",
        options: ["MATLAB", "AutoCAD", "Proteus", "LTspice", "KiCad", "Eagle", "Arduino IDE", "Python"]
      },
      {
        name: "projectComponents",
        label: "Project Components Required",
        type: "textarea"
      },
      {
        name: "industryPartners",
        label: "Industry Partners",
        type: "textarea"
      }
    ]
  },

  // Clubs
  "Robotics Club": {
    pageTitle: "Robotics Club Event",
    pageDescription: "Build, compete, and innovate with robotics challenges and workshops",
    icon: "🤖",
    color: "from-green-500 to-teal-500",
    defaultValues: {
      category: "competition",
      type: "on-campus",
      visibility: "public",
      registrationRequired: true,
      fee: "500",
      targetAudience: "all-students",
      tags: "robotics, automation, ai"
    },
    extraFields: [
      {
        name: "competitionType",
        label: "Competition Type",
        type: "select",
        required: true,
        options: [
          "Line Follower",
          "Maze Solver",
          "Robo Soccer",
          "Sumo Wrestling",
          "Drone Racing",
          "Pick and Place",
          "Obstacle Avoidance",
          "Innovation Challenge"
        ]
      },
      {
        name: "robotSpecs",
        label: "Robot Specifications",
        type: "textarea",
        placeholder: "Dimensions, weight, motor limits, etc."
      },
      {
        name: "kitProvided",
        label: "Kit Provided",
        type: "checkbox"
      },
      {
        name: "kitDetails",
        label: "Kit Details",
        type: "textarea",
        placeholder: "Components included in the kit"
      },
      {
        name: "practiceSessions",
        label: "Practice Sessions",
        type: "checkbox"
      },
      {
        name: "practiceSchedule",
        label: "Practice Schedule",
        type: "textarea"
      }
    ]
  },

  "Programming Club": {
    pageTitle: "Programming Club Event",
    pageDescription: "Code, compete, and collaborate in programming contests and workshops",
    icon: "💻",
    color: "from-purple-500 to-pink-500",
    defaultValues: {
      category: "competition",
      type: "online",
      visibility: "public",
      registrationRequired: true,
      fee: "0",
      targetAudience: "all-students",
      tags: "programming, algorithms, coding"
    },
    extraFields: [
      {
        name: "contestType",
        label: "Contest Type",
        type: "select",
        required: true,
        options: [
          "Code Challenge",
          "Algorithm Contest",
          "Debugging Challenge",
          "Project Building",
          "Open Source Contribution",
          "Web Development",
          "App Development",
          "Competitive Programming"
        ]
      },
      {
        name: "platform",
        label: "Platform",
        type: "select",
        options: ["Codeforces", "HackerRank", "LeetCode", "Custom Platform", "GitHub", "Replit"]
      },
      {
        name: "languages",
        label: "Allowed Languages",
        type: "multiselect",
        options: ["C", "C++", "Java", "Python", "JavaScript", "Go", "Rust", "PHP", "Ruby"]
      },
      {
        name: "problemsCount",
        label: "Number of Problems",
        type: "number",
        min: 1,
        max: 20
      },
      {
        name: "duration",
        label: "Duration (hours)",
        type: "number",
        min: 1,
        max: 48
      },
      {
        name: "prizeDetails",
        label: "Prize Details",
        type: "textarea"
      }
    ]
  },

  "Sports Club": {
    pageTitle: "Sports Tournament",
    pageDescription: "Organize competitive sports events, tournaments, and fitness activities",
    icon: "⚽",
    color: "from-green-500 to-lime-500",
    defaultValues: {
      category: "sports",
      type: "on-campus",
      visibility: "public",
      registrationRequired: true,
      fee: "500",
      targetAudience: "all-students",
      tags: "sports, tournament, fitness"
    },
    extraFields: [
      {
        name: "sportType",
        label: "Sport Type",
        type: "select",
        required: true,
        options: [
          "Football",
          "Cricket",
          "Basketball",
          "Volleyball",
          "Badminton",
          "Table Tennis",
          "Chess",
          "Carrom",
          "Athletics",
          "Swimming"
        ]
      },
      {
        name: "tournamentFormat",
        label: "Tournament Format",
        type: "select",
        options: ["Knockout", "League", "Group Stage + Knockout", "Round Robin"]
      },
      {
        name: "teamSize",
        label: "Team Size",
        type: "number",
        min: 1,
        max: 25
      },
      {
        name: "maxTeams",
        label: "Maximum Teams",
        type: "number",
        min: 2,
        max: 64
      },
      {
        name: "rules",
        label: "Rules & Regulations",
        type: "textarea",
        placeholder: "Detailed rules of the tournament"
      },
      {
        name: "prizeMoney",
        label: "Prize Money",
        type: "text",
        placeholder: "Champion: 10,000 BDT, Runner-up: 5,000 BDT"
      },
      {
        name: "equipmentProvided",
        label: "Equipment Provided",
        type: "textarea",
        placeholder: "List of equipment that will be provided"
      },
      {
        name: "requiredEquipment",
        label: "Required Equipment (to bring)",
        type: "textarea"
      }
    ]
  },

  "Cultural Club": {
    pageTitle: "Cultural Event",
    pageDescription: "Celebrate arts, music, dance, and cultural diversity",
    icon: "🎭",
    color: "from-pink-500 to-rose-500",
    defaultValues: {
      category: "cultural",
      type: "on-campus",
      visibility: "public",
      registrationRequired: true,
      fee: "300",
      targetAudience: "all-students",
      tags: "culture, music, dance, arts"
    },
    extraFields: [
      {
        name: "programType",
        label: "Program Type",
        type: "select",
        required: true,
        options: [
          "Concert",
          "Drama",
          "Dance Competition",
          "Music Competition",
          "Recitation",
          "Art Exhibition",
          "Fashion Show",
          "Talent Hunt",
          "Cultural Night",
          "International Culture Day"
        ]
      },
      {
        name: "performances",
        label: "Performances",
        type: "textarea",
        placeholder: "List of performances and artists"
      },
      {
        name: "auditions",
        label: "Auditions Required",
        type: "checkbox"
      },
      {
        name: "auditionDate",
        label: "Audition Date",
        type: "datetime-local"
      },
      {
        name: "rehearsalSchedule",
        label: "Rehearsal Schedule",
        type: "textarea"
      },
      {
        name: "judges",
        label: "Judges (for competitions)",
        type: "textarea"
      },
      {
        name: "awards",
        label: "Awards & Prizes",
        type: "textarea"
      }
    ]
  },

  // Social Service
  "Blood Bank": {
    pageTitle: "Blood Donation Camp",
    pageDescription: "Save lives through blood donation drives and awareness programs",
    icon: "🩸",
    color: "from-red-500 to-rose-500",
    defaultValues: {
      category: "charity",
      type: "on-campus",
      visibility: "public",
      registrationRequired: true,
      fee: "0",
      targetAudience: "all-students",
      tags: "blood-donation, healthcare, social-service"
    },
    extraFields: [
      {
        name: "bloodDriveType",
        label: "Blood Drive Type",
        type: "select",
        required: true,
        options: [
          "Regular Blood Donation",
          "Emergency Blood Drive",
          "Blood Group Awareness",
          "Thalassemia Awareness",
          "Blood Donor Registration",
          "Mobile Blood Bank"
        ]
      },
      {
        name: "medicalTeam",
        label: "Medical Team Present",
        type: "checkbox",
        defaultChecked: true
      },
      {
        name: "bloodBags",
        label: "Target Blood Bags",
        type: "number",
        min: 10,
        max: 500
      },
      {
        name: "eligibilityCriteria",
        label: "Eligibility Criteria",
        type: "textarea",
        placeholder: "Age, weight, health conditions, etc."
      },
      {
        name: "registrationProcess",
        label: "Registration Process",
        type: "textarea",
        placeholder: "Step by step registration process"
      },
      {
        name: "postDonationCare",
        label: "Post-Donation Care",
        type: "textarea",
        placeholder: "Food, drinks, rest area information"
      }
    ]
  },

  "Unnotomomoshir": {
    pageTitle: "Volunteer Service Event",
    pageDescription: "Join volunteer activities and make a difference in the community",
    icon: "🤝",
    color: "from-emerald-500 to-green-500",
    defaultValues: {
      category: "social",
      type: "off-campus",
      visibility: "public",
      registrationRequired: true,
      fee: "0",
      targetAudience: "all-students",
      tags: "volunteer, community-service, social-impact"
    },
    extraFields: [
      {
        name: "serviceType",
        label: "Service Type",
        type: "select",
        required: true,
        options: [
          "Community Cleaning",
          "Tree Plantation",
          "Teaching Underprivileged",
          "Elderly Care",
          "Disaster Relief",
          "Food Distribution",
          "Clothing Donation",
          "Awareness Campaign"
        ]
      },
      {
        name: "volunteersNeeded",
        label: "Volunteers Needed",
        type: "number",
        min: 1,
        max: 1000
      },
      {
        name: "tasks",
        label: "Tasks Description",
        type: "textarea",
        placeholder: "Detailed description of volunteer tasks"
      },
      {
        name: "trainingProvided",
        label: "Training Provided",
        type: "checkbox"
      },
      {
        name: "equipmentProvided",
        label: "Equipment Provided",
        type: "textarea",
        placeholder: "Gloves, masks, tools, etc."
      },
      {
        name: "transportation",
        label: "Transportation Provided",
        type: "checkbox"
      },
      {
        name: "certificate",
        label: "Volunteer Certificate",
        type: "checkbox"
      }
    ]
  },

  // Associations
  "Sylhet Association": {
    pageTitle: "Sylhet Association Event",
    pageDescription: "Celebrate Sylheti culture, connect with fellow Sylhetis, and organize cultural programs",
    icon: "🏔️",
    color: "from-indigo-500 to-purple-500",
    defaultValues: {
      category: "cultural",
      type: "on-campus",
      visibility: "public",
      registrationRequired: true,
      fee: "200",
      targetAudience: "all-students",
      tags: "sylhet, culture, association"
    },
    extraFields: [
      {
        name: "eventType",
        label: "Event Type",
        type: "select",
        required: true,
        options: [
          "Cultural Program",
          "Language Festival",
          "Food Festival",
          "Music Night",
          "Poetry Session",
          "Traditional Dance",
          "Art Exhibition",
          "Pitha Utshob"
        ]
      },
      {
        name: "culturalItems",
        label: "Cultural Items",
        type: "textarea",
        placeholder: "List of performances and activities"
      },
      {
        name: "traditionalFood",
        label: "Traditional Food Available",
        type: "checkbox"
      },
      {
        name: "foodMenu",
        label: "Food Menu",
        type: "textarea"
      },
      {
        name: "specialGuest",
        label: "Special Guests",
        type: "textarea"
      },
      {
        name: "dressCode",
        label: "Dress Code",
        type: "select",
        options: ["Traditional", "Formal", "Casual", "No Dress Code"]
      }
    ]
  },

  "Dhaka Association": {
    pageTitle: "Dhaka Association Event",
    pageDescription: "Connect with Dhakaites, organize city tours, and celebrate Dhaka's heritage",
    icon: "🏙️",
    color: "from-orange-500 to-red-500",
    defaultValues: {
      category: "cultural",
      type: "hybrid",
      visibility: "public",
      registrationRequired: true,
      fee: "300",
      targetAudience: "all-students",
      tags: "dhaka, heritage, association"
    },
    extraFields: [
      {
        name: "eventType",
        label: "Event Type",
        type: "select",
        required: true,
        options: [
          "City Tour",
          "Heritage Walk",
          "Food Festival",
          "Cultural Night",
          "Business Networking",
          "Alumni Meetup",
          "Seminar",
          "Career Fair"
        ]
      },
      {
        name: "tourSpots",
        label: "Tour Spots (if applicable)",
        type: "textarea",
        placeholder: "List of places to visit"
      },
      {
        name: "transportation",
        label: "Transportation",
        type: "checkbox"
      },
      {
        name: "accommodation",
        label: "Accommodation Provided",
        type: "checkbox"
      },
      {
        name: "foodIncluded",
        label: "Food Included",
        type: "checkbox"
      },
      {
        name: "mealPlan",
        label: "Meal Plan",
        type: "textarea"
      }
    ]
  }
};

// Helper function to get config for any organization
export const getEventFormConfig = (organizationType, roleType = null) => {
  // First try to get specific config
  if (roleType && ADVANCED_EVENT_FORM_CONFIG[roleType]) {
    return ADVANCED_EVENT_FORM_CONFIG[roleType];
  }
  
  // Then try organization type
  if (ADVANCED_EVENT_FORM_CONFIG[organizationType]) {
    return ADVANCED_EVENT_FORM_CONFIG[organizationType];
  }
  
  // Return default config based on organization type category
  const categoryConfigs = {
    "Club": getDefaultClubConfig(),
    "Social Service": getDefaultSocialServiceConfig(),
    "Association": getDefaultAssociationConfig()
  };
  
  return categoryConfigs[organizationType] || getDefaultEventConfig();
};

// DEFAULT CONFIGS - UPDATED to use eventFormat for Clubs (matching backend)
const getDefaultClubConfig = () => ({
  pageTitle: "Club Event",
  pageDescription: "Organize club activities, competitions, and member engagement events",
  icon: "🎯",
  color: "from-blue-500 to-purple-500",
  defaultValues: {
    category: "club",
    type: "on-campus",
    visibility: "public",
    registrationRequired: true,
    fee: "0",
    targetAudience: "all-students",
    tags: "club, activity, student-life"
  },
  extraFields: [
    {
      name: "eventFormat",  // FIXED: Changed from "eventType" to "eventFormat"
      label: "Event Format",
      type: "select",
      required: true,
      options: ["Meeting", "Workshop", "Competition", "Social Gathering", "Training Session", "Awareness Program"]
    },
    {
      name: "membershipRequired",
      label: "Membership Required",
      type: "checkbox"
    },
    {
      name: "materialsProvided",
      label: "Materials Provided",
      type: "textarea"
    }
  ]
});

const getDefaultSocialServiceConfig = () => ({
  pageTitle: "Social Service Event",
  pageDescription: "Organize community service, awareness, and charitable events",
  icon: "🤝",
  color: "from-green-500 to-emerald-500",
  defaultValues: {
    category: "social",
    type: "mixed",
    visibility: "public",
    registrationRequired: true,
    fee: "0",
    targetAudience: "all-students",
    tags: "service, charity, community"
  },
  extraFields: [
    {
      name: "serviceType",
      label: "Service Type",
      type: "select",
      required: true,
      options: ["Blood Donation", "Relief Distribution", "Awareness Campaign", "Tree Plantation", "Teaching", "Healthcare Camp"]
    },
    {
      name: "volunteersNeeded",
      label: "Volunteers Needed",
      type: "number",
      min: 1
    },
    {
      name: "beneficiaries",
      label: "Target Beneficiaries",
      type: "textarea"
    }
  ]
});

const getDefaultAssociationConfig = () => ({
  pageTitle: "Association Event",
  pageDescription: "Organize networking, cultural, and professional development events",
  icon: "🏛️",
  color: "from-indigo-500 to-blue-500",
  defaultValues: {
    category: "networking",
    type: "hybrid",
    visibility: "public",
    registrationRequired: true,
    fee: "200",
    targetAudience: "all-students",
    tags: "association, networking, culture"
  },
  extraFields: [
    {
      name: "eventType",
      label: "Event Type",
      type: "select",
      required: true,
      options: ["Cultural Program", "Networking Session", "Seminar", "Reunion", "Festival Celebration", "Sports Competition"]
    },
    {
      name: "districtFocus",
      label: "District Focus",
      type: "text",
      placeholder: "e.g., Sylhet, Dhaka, Chittagong"
    },
    {
      name: "traditionalElements",
      label: "Traditional Elements",
      type: "textarea"
    }
  ]
});

const getDefaultEventConfig = () => ({
  pageTitle: "Create Event",
  pageDescription: "Organize and manage your event",
  icon: "📅",
  color: "from-gray-500 to-gray-700",
  defaultValues: {
    category: "general",
    type: "on-campus",
    visibility: "public",
    registrationRequired: true,
    fee: "0",
    targetAudience: "all-students",
    tags: "event"
  },
  extraFields: []
});