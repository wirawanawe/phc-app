const { v4: uuidv4 } = require("uuid");
// TypeScript interfaces aren't used at runtime, so we don't need to import them

// Generate 6 health programs with their associated tasks
const healthProgramSeeds = [
  {
    id: uuidv4(),
    name: "Diabetes Management Program",
    description:
      "A comprehensive program for managing diabetes through lifestyle changes, nutrition, and regular monitoring.",
    categoryId: uuidv4(),
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setMonth(new Date().getMonth() + 6)
    ).toISOString(),
    location: "Main Health Center",
    maxParticipants: 30,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Heart Health Initiative",
    description:
      "Program designed to improve cardiovascular health through exercise, diet, and regular checkups.",
    categoryId: uuidv4(),
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setMonth(new Date().getMonth() + 3)
    ).toISOString(),
    location: "Community Fitness Center",
    maxParticipants: 25,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Mental Wellness Workshop",
    description:
      "Series of workshops focusing on stress management, mindfulness, and mental health awareness.",
    categoryId: uuidv4(),
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setMonth(new Date().getMonth() + 2)
    ).toISOString(),
    location: "Wellness Center",
    maxParticipants: 20,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Weight Management Program",
    description:
      "A structured program to help participants achieve and maintain a healthy weight through balanced nutrition and physical activity.",
    categoryId: uuidv4(),
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setMonth(new Date().getMonth() + 4)
    ).toISOString(),
    location: "Nutrition Center",
    maxParticipants: 15,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Smoking Cessation Support",
    description:
      "Support program for individuals trying to quit smoking, including counseling, resources, and peer support.",
    categoryId: uuidv4(),
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setMonth(new Date().getMonth() + 3)
    ).toISOString(),
    location: "Health Education Center",
    maxParticipants: 12,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Senior Fitness Program",
    description:
      "Fitness program tailored for seniors to improve mobility, strength, and overall quality of life.",
    categoryId: uuidv4(),
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setMonth(new Date().getMonth() + 5)
    ).toISOString(),
    location: "Senior Community Center",
    maxParticipants: 20,
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

// Generate tasks for each health program
const taskSeeds = [
  // Tasks for Diabetes Management Program
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[0].id,
    title: "Blood Sugar Monitoring",
    description:
      "Monitor blood sugar levels twice daily and record in the health journal.",
    timePerformed: "08:00:00",
    status: "active",
    priority: "high",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[0].id,
    title: "Dietary Review Session",
    description:
      "One-on-one session with a nutritionist to review and adjust meal plans.",
    timePerformed: "14:00:00",
    status: "active",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },

  // Tasks for Heart Health Initiative
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[1].id,
    title: "Cardio Exercise Session",
    description: "Participate in a 30-minute guided cardio workout session.",
    timePerformed: "09:30:00",
    status: "active",
    priority: "high",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[1].id,
    title: "Blood Pressure Check",
    description:
      "Regular blood pressure monitoring and recording results in the health app.",
    timePerformed: "18:00:00",
    status: "active",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },

  // Tasks for Mental Wellness Workshop
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[2].id,
    title: "Mindfulness Meditation",
    description: "Practice guided mindfulness meditation for 15 minutes daily.",
    timePerformed: "07:00:00",
    status: "active",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[2].id,
    title: "Stress Journal Entry",
    description:
      "Maintain a daily journal entry identifying stress triggers and coping strategies.",
    timePerformed: "21:00:00",
    status: "active",
    priority: "low",
    createdAt: new Date().toISOString(),
  },

  // Tasks for Weight Management Program
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[3].id,
    title: "Weekly Weigh-In",
    description: "Record weight measurements weekly to track progress.",
    timePerformed: "08:00:00",
    status: "active",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[3].id,
    title: "Meal Planning Workshop",
    description:
      "Participate in a group workshop focused on meal planning and preparation.",
    timePerformed: "16:00:00",
    status: "active",
    priority: "high",
    createdAt: new Date().toISOString(),
  },

  // Tasks for Smoking Cessation Support
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[4].id,
    title: "Craving Management Exercise",
    description:
      "Practice breathing exercises and distraction techniques when cravings occur.",
    timePerformed: "12:00:00",
    status: "active",
    priority: "high",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[4].id,
    title: "Support Group Meeting",
    description:
      "Attend weekly support group meetings to share experiences and challenges.",
    timePerformed: "19:00:00",
    status: "active",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },

  // Tasks for Senior Fitness Program
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[5].id,
    title: "Chair Yoga Session",
    description:
      "Participate in gentle yoga exercises that can be done while seated.",
    timePerformed: "10:00:00",
    status: "active",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    healthProgramId: healthProgramSeeds[5].id,
    title: "Balance and Coordination Exercises",
    description:
      "Practice exercises designed to improve balance and coordination to prevent falls.",
    timePerformed: "15:30:00",
    status: "active",
    priority: "high",
    createdAt: new Date().toISOString(),
  },
];

// Export a function to get both programs and tasks
const getHealthProgramsWithTasks = () => {
  return healthProgramSeeds.map((program) => {
    const programTasks = taskSeeds.filter(
      (task) => task.healthProgramId === program.id
    );
    return {
      ...program,
      tasks: programTasks,
    };
  });
};

module.exports = {
  healthProgramSeeds,
  taskSeeds,
  getHealthProgramsWithTasks,
};
