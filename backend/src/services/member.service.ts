import { ErrorCodeEnum } from "../enums/error-code.enum";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";

/* ===============================
   GET MEMBER ROLE IN WORKSPACE
   =============================== */
export const getMemberRoleInWorkspace = async (
  userId: string,
  workspaceId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({
    userId,
    workspaceId,
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
  userId: string,
  inviteCode: string
) => {
  // 1️⃣ Find workspace using invite code
  const workspace = await WorkspaceModel.findOne({ inviteCode }).exec();
  if (!workspace) {
    throw new NotFoundException("Invalid invite code or workspace not found");
  }

  // 2️⃣ Check if already a member
  const existingMember = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  }).exec();

  if (existingMember) {
    throw new BadRequestException("You are already a member of this workspace");
  }

  // 3️⃣ Get MEMBER role
  const role = await RoleModel.findOne({ name: Roles.MEMBER });
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  // 4️⃣ Add user as member
  const newMember = new MemberModel({
    userId,
    workspaceId: workspace._id,
    role: role._id,
    joinedAt: new Date(),
  });
  await newMember.save();

  // 🔥 5️⃣ CRITICAL FIX — set user's current workspace
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  user.currentWorkspace = workspace._id;
  await user.save();

  return {
    workspaceId: workspace._id,
    role: role.name,
  };
};
