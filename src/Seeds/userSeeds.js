import { config } from "dotenv";
import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import connectDb from './../Database/databaseConfig.js';

config();

const seedUsers = [
  // Female Users
  {
    email: "kaviya.sundari@example.com",
    fullname: "Kaviya Sundari",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    email: "meena.rani@example.com",
    fullname: "Meena Rani",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/11.jpg",
  },
  {
    email: "nandhini.elango@example.com",
    fullname: "Nandhini Elango",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    email: "divya.murugan@example.com",
    fullname: "Divya Murugan",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/13.jpg",
  },
  {
    email: "sowmiya.raj@example.com",
    fullname: "Sowmiya Raj",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  {
    email: "shruthi.ananthan@example.com",
    fullname: "Shruthi Ananthan",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/15.jpg",
  },
  {
    email: "keerthana.selvam@example.com",
    fullname: "Keerthana Selvam",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/16.jpg",
  },
  {
    email: "preethi.kumar@example.com",
    fullname: "Preethi Kumar",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/women/17.jpg",
  },

  // Male Users
  {
    email: "arun.kumar@example.com",
    fullname: "Arun Kumar",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    email: "vignesh.natarajan@example.com",
    fullname: "Vignesh Natarajan",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    email: "prakash.venkat@example.com",
    fullname: "Prakash Venkat",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    email: "sathish.babu@example.com",
    fullname: "Sathish Babu",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/13.jpg",
  },
  {
    email: "karthik.muthu@example.com",
    fullname: "Karthik Muthu",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/14.jpg",
  },
  {
    email: "dinesh.raja@example.com",
    fullname: "Dinesh Raja",
    password: "User/123",
    profilePic: "https://randomuser.me/api/portraits/men/15.jpg",
  },
  {
    email: "saravanan.perum@example.com",
    fullname: "Saravanan Perumal",
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
