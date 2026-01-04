import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import { BadRequestException } from "../utils/appError";

export const verifyUserService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !user.password) {
    throw new BadRequestException("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new BadRequestException("Invalid email or password");
  }

  return user;
};

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  return { user };
};
