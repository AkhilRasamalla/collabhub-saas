import mongoose from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";
import MemberModel from "../models/member.model";
import { Roles } from "../enums/role.enum";
import { ProviderEnum } from "../enums/account-provider.enum";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";

/* ================= LOGIN ================= */

export const verifyUserService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const account = await AccountModel.findOne({
    provider: ProviderEnum.EMAIL,
    providerId: email,
  });

  if (!account) throw new UnauthorizedException("Invalid credentials");

  const user = await UserModel.findById(account.userId);
  if (!user) throw new UnauthorizedException("Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedException("Invalid credentials");

  return user.omitPassword();
};

/* ================= GOOGLE LOGIN ================= */

export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  providerId: string;
  picture?: string;
  email?: string;
}) => {
  const { provider, providerId, displayName, email, picture } = data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let user = await UserModel.findOne({ email }).session(session);

    if (!user) {
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save({ session });

      await new AccountModel({
        userId: user._id,
        provider,
        providerId,
      }).save({ session });

      const workspace = await new WorkspaceModel({
        name: "My Workspace",
        owner: user._id,
      }).save({ session });

      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      }).session(session);

      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      await new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
      }).save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save({ session });
    }

    await session.commitTransaction();
    return { user };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* ================= REGISTER ================= */

export const registerUserService = async ({
  email,
  name,
  password,
  inviteWorkspaceId,
}: {
  email: string;
  name: string;
  password: string;
  inviteWorkspaceId?: string;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const exists = await UserModel.findOne({ email }).session(session);
    if (exists) throw new BadRequestException("Email already exists");

    const user = new UserModel({ email, name, password });
    await user.save({ session });

    await new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    }).save({ session });

    /* ===== INVITE SIGNUP ===== */
    if (inviteWorkspaceId) {
      const workspace = await WorkspaceModel.findById(
        inviteWorkspaceId
      ).session(session);

      if (!workspace) {
        throw new NotFoundException("Invited workspace not found");
      }

      const memberRole = await RoleModel.findOne({
        name: Roles.MEMBER,
      }).session(session);

      if (!memberRole) {
        throw new NotFoundException("Member role not found");
      }

      await new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: memberRole._id,
      }).save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save({ session });
    }

    /* ===== NORMAL SIGNUP ===== */
    if (!inviteWorkspaceId) {
      const workspace = await new WorkspaceModel({
        name: "My Workspace",
        owner: user._id,
      }).save({ session });

      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      }).session(session);

      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      await new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
      }).save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save({ session });
    }

    await session.commitTransaction();
    return user;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
