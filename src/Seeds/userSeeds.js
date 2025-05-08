import { config } from "dotenv";
import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import connectDb from './../Database/databaseConfig.js';

config();

const seedUsers = [
  // Female Users
  {
    email: "emma.clark@example.com",
    fullname: "Emma Clark",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    email: "olivia.johnson@example.com",
    fullname: "Olivia Johnson",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/11.jpg",
  },
  {
    email: "sophia.williams@example.com",
    fullname: "Sophia Williams",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    email: "ava.brown@example.com",
    fullname: "Ava Brown",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/13.jpg",
  },
  {
    email: "isabella.davis@example.com",
    fullname: "Isabella Davis",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  {
    email: "mia.miller@example.com",
    fullname: "Mia Miller",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/15.jpg",
  },
  {
    email: "charlotte.wilson@example.com",
    fullname: "Charlotte Wilson",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/16.jpg",
  },
  {
    email: "amelia.taylor@example.com",
    fullname: "Amelia Taylor",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/17.jpg",
  },
  // Male Users
  {
    email: "james.smith@example.com",
    fullname: "James Smith",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    email: "liam.jones@example.com",
    fullname: "Liam Jones",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    email: "noah.garcia@example.com",
    fullname: "Noah Garcia",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    email: "william.martinez@example.com",
    fullname: "William Martinez",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/13.jpg",
  },
  {
    email: "benjamin.rodriguez@example.com",
    fullname: "Benjamin Rodriguez",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/14.jpg",
  },
  {
    email: "lucas.thompson@example.com",
    fullname: "Lucas Thompson",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/15.jpg",
  },
  {
    email: "oliver.white@example.com",
    fullname: "Oliver White",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/16.jpg",
  },
];

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const seedDatabase = async () => {
  try {
    await connectDb();
    const existingUsers = await User.countDocuments();

    if (existingUsers <= 5) {
      const hashedUsers = await Promise.all(
        seedUsers.map(async (user) => {
          const hashedPassword = await hashPassword(user.password);
          return {
            ...user,
            password: hashedPassword,
          };
        })
      );

      await User.insertMany(hashedUsers);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
