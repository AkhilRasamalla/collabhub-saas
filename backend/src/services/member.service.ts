import mongoose from "mongoose";
import MemberModel from "../models/member.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";
import { Roles } from "../enums/role.enum";
import {
  BadRequestException,
  NotFoundException,
} from "../utils/appError";

export const joinWorkspaceByInviteService = async (
  userId: mongoose.Types.ObjectId,
  inviteCode: string
) => {
  const workspace = await WorkspaceModel.findOne({ inviteCode });
  if (!workspace) throw new NotFoundException("Invalid invite link");

  const exists = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  });

  if (exists) {
    return { workspaceId: workspace._id };
  }

  const role = await RoleModel.findOne({ name: Roles.MEMBER });
  if (!role) throw new NotFoundException("Role not found");

  await new MemberModel({
    userId,
    workspaceId: workspace._id,
    role: role._id,
  }).save();

  return { workspaceId: workspace._id };
};
