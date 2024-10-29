import { Controller, Post, Body, Param, Get, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { InviteUserDto } from './dtos/invite-user.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { SetMetadata } from '@nestjs/common';

@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post()
  @SetMetadata('accessLevel', 'creator')
  async createOrganization(@Body() createOrganizationDto: CreateOrganizationDto, @Req() req) {
    return this.organizationService.createOrganization(createOrganizationDto, req.user._id);
  }

  @Get(':organization_id')
  @SetMetadata('accessLevel', 'read-only')
  async getOrganizationById(@Param('organization_id') organization_id: string, @Req() req) {
    return this.organizationService.getOrganizationById(organization_id);
  }

  @Get()
  async getAllOrganizations(@Req() req) {
    return this.organizationService.getAllOrganizations(req.user._id);
  }

  @Put(':organization_id')
  @SetMetadata('accessLevel', 'creator')
  async updateOrganization(
    @Param('organization_id') organization_id: string,
    @Body() updateData: CreateOrganizationDto,
  ) {
    return this.organizationService.updateOrganization(organization_id, updateData);
  }

  @Delete(':organization_id')
  @SetMetadata('accessLevel', 'creator')
  async deleteOrganization(@Param('organization_id') organization_id: string) {
    return this.organizationService.deleteOrganization(organization_id);
  }

  @Post(':organization_id/invite')
  @SetMetadata('accessLevel', 'creator')
  async inviteUser(
    @Param('organization_id') organization_id: string,
    @Body() inviteUserDto: InviteUserDto
  ) {
    return this.organizationService.inviteUser(organization_id, inviteUserDto);
  }
}
