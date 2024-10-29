import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { InviteUserDto } from './dtos/invite-user.dto';
import { OrganizationResponseDto, AllOrganizationsResponseDto, OrganizationUpdatedResponseDto } from './dtos/organization-response.dto';
import { Organization } from './schemas/organization.schema';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name) private organizationModel: Model<Organization>,
    private userService: AuthService,
  ) {}

  async createOrganization(createOrganizationDto: CreateOrganizationDto, userId: string): Promise<{ organization_id: string }> {
    const newOrganization = new this.organizationModel({
      ...createOrganizationDto,
      members: [{ userId: userId, accessLevel: 'creator' }],
    });
    const savedOrganization = await newOrganization.save();
    return { organization_id: savedOrganization._id.toString() };
  }

  async getOrganizationById(organization_id: string): Promise<OrganizationResponseDto> {

    // Check if the provided ID is valid
    if (!Types.ObjectId.isValid(organization_id)) {
        throw new BadRequestException('Invalid organization ID');
    }
    const organization = await this.organizationModel
        .findById(organization_id)
        .populate('members.userId', 'name email');

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
            accessLevel: member.accessLevel,
        })),
    };
  }

  async getAllOrganizations(userId: string): Promise<AllOrganizationsResponseDto> {
    const organizations = await this.organizationModel
      .find({ 'members.userId': userId })
      .populate('members.userId', 'name email');
      
      return organizations.map((organization) => ({
        organization_id: organization._id.toString(),
        name: organization.name,
        description: organization.description,
        members: organization.members.map((member) => ({
            name: member.userId['name'],
            email: member.userId['email'],
            accessLevel: member.accessLevel,
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
    const user_email = inviteUserDto.user_email;
  
    // Find the organization
    const organization = await this.organizationModel.findById(organization_id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
  
    // Find the user by email
    const user = await this.userService.findByEmail(user_email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Check if the user is already a member of the organization
    const isMember = organization.members.some(
      (member) => member.userId.toString() === user._id.toString(),
    );
    if (isMember) {
      throw new BadRequestException('User is already a member of this organization');
    }
    
    
  
    // Add the user as a 'read-only' member
    organization.members.push({
      userId: user._id as Types.ObjectId,
      accessLevel: 'read-only',
    });
  
    await organization.save();
    return { message: 'User invited successfully' };
  }
}
