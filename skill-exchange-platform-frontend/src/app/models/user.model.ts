import { Skill } from './skill.model';
export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  location: string;
  bio: string;
  offeredSkills: Skill[]; // Skills they can teach
  desiredSkills: string[]; // Skills they want to learn
  profilePicture: string; // Profile picture URL
  password: string; // User password
  notifications?: {
    message: string;
    from: {
      _id: string;
      name: string;
    };
    read: boolean;
    createdAt: Date;
  }[];
}