import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { InviteUserDto } from './dtos/invite-user.dto';
import { OrganizationResponseDto, AllOrganizationsResponseDto, OrganizationUpdatedResponseDto } from './dtos/organization-response.dto';
import { Organization } from './schemas/organization.schema';
import { AuthService } from 'src/auth/auth.service';
import { RoleService } from '@src/role/role.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name) private organizationModel: Model<Organization>,
    private userService: AuthService,
    private roleService: RoleService
  ) {}

  async createOrganization(createOrganizationDto: CreateOrganizationDto, userId: string): Promise<{ organization_id: string }> {
    const creatorRole = await this.roleService.getRoleByName('creator');
    const organization = new this.organizationModel({
      ...createOrganizationDto,
      members: [{ userId, roleId: creatorRole._id }],
    });
    const savedOrganization = await organization.save();
    return { organization_id: savedOrganization._id.toString() };
  }

  async getOrganizationById(organization_id: string): Promise<OrganizationResponseDto> {
    if (!Types.ObjectId.isValid(organization_id)) {
      throw new BadRequestException('Invalid organization ID');
    }

    const organization = await this.organizationModel
      .findById(organization_id)
      .populate('members.userId', 'name email')
      .populate('members.roleId', 'name'); // Populate roleId with role name

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return {
      organization_id: organization._id.toString(),
      name: organization.name,
      description: organization.description,
      members: organization.members.map((member) => ({
        name: member.userId['name'],
        email: member.userId['email'],
        accessLevel: member.roleId['name'], // Use role name as access level
      })),
    };
  }

  async getAllOrganizations(userId: string): Promise<AllOrganizationsResponseDto> {
    const organizations = await this.organizationModel
      .find({ 'members.userId': userId })
      .populate('members.userId', 'name email')
      .populate('members.roleId', 'name'); // Populate roleId with role name

    return organizations.map((organization) => ({
      organization_id: organization._id.toString(),
      name: organization.name,
      description: organization.description,
      members: organization.members.map((member) => ({
        name: member.userId['name'],
        email: member.userId['email'],
        accessLevel: member.roleId['name'], // Use role name as access level
      })),
    }));
  }

  async updateOrganization(organization_id: string, updateData: CreateOrganizationDto): Promise<OrganizationUpdatedResponseDto> {
    const updatedOrganization = await this.organizationModel.findByIdAndUpdate(
      organization_id,
      { $set: updateData },
      { new: true },
    )

    if (!updatedOrganization) {
      throw new NotFoundException('Organization not found');
    }

    return {
      organization_id: updatedOrganization._id.toString(),
      name: updatedOrganization.name,
      description: updatedOrganization.description,
    };
  }

  async deleteOrganization(organization_id: string): Promise<{ message: string }> {
    const organization = await this.organizationModel.findByIdAndDelete(organization_id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return { message: 'Organization deleted successfully' };
  }

  async inviteUser(organization_id: string, inviteUserDto: InviteUserDto): Promise<{ message: string }> {
    const userEmail = inviteUserDto.user_email;
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const organization = await this.organizationModel.findById(organization_id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.members.some((member) => member.userId.equals(user._id))) {
      throw new NotFoundException('User is already a member of this organization');
    }

    const readOnlyRole = await this.roleService.getRoleByName('read-only');
    organization.members.push({ userId: user._id, roleId: readOnlyRole._id });
    await organization.save();

    return { message: 'User invited successfully' };
  }
}
