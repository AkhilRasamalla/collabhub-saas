import mongoose from "mongoose";
import MemberModel from "../models/member.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import { Roles } from "../enums/role.enum";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";

/* ===============================
   GET MEMBER ROLE IN WORKSPACE
   =============================== */
export const getMemberRoleInWorkspace = async (
  userId: mongoose.Types.ObjectId,
  workspaceId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  }).populate("role");

  if (!member) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  return { role: member.role?.name };
};

/* ===============================
   JOIN WORKSPACE BY INVITE
   =============================== */
export const joinWorkspaceByInviteService = async (
  userId: mongoose.Types.ObjectId,
  inviteCode: string
) => {
  const workspace = await WorkspaceModel.findOne({ inviteCode });
  if (!workspace) {
    throw new NotFoundException("Invalid invite link");
  }

  const existingMember = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  });

  if (existingMember) {
    // already a member → just return
    const role = await RoleModel.findById(existingMember.role);
    return {
      workspaceId: workspace._id,
      role: role?.name,
    };
  }

  const memberRole = await RoleModel.findOne({ name: Roles.MEMBER });
  if (!memberRole) {
    throw new NotFoundException("Member role not found");
  }

  await new MemberModel({
    userId,
    workspaceId: workspace._id,
    role: memberRole._id,
  }).save();

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save();

  return {
    workspaceId: workspace._id,
    role: memberRole.name,
  };
};
