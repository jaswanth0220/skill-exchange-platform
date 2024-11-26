export interface Skill {
    id: string;
    name: string; // Skill name, e.g., "Graphic Design"
    description: string; // Brief about the skill
    offeredBy: string; // User offering the skill
    location: string; // User's location
    level: string; // Beginner, Intermediate, or Expert
    availableTimes: string[]; // Timeslots for skill exchange
    userId:string;
  }
  