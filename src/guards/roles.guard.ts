import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private organizationService: OrganizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAccessLevel = this.reflector.get<string>(
      'accessLevel',
      context.getHandler(),
    );

    const accessLevels = {
      'read-only': 1,
      creator: 2,
    };

    const request = context.switchToHttp().getRequest();
    const userEmail = request.user.email;
    const orgId = request.params.organization_id;

    if (!orgId) {
      return true; 
    }

    const organization = await this.organizationService.getOrganizationById(orgId);
    const member = organization.members.find(
      (member) => member.email === userEmail,
    );

    if (!member) {
      throw new ForbiddenException('Access denied. You are not a member of this organization.');
    }

    if (
      requiredAccessLevel &&
      accessLevels[member.accessLevel] < accessLevels[requiredAccessLevel]
    ) {
      throw new ForbiddenException(`Access denied. ${requiredAccessLevel} access required.`);
    }

    request.organization = organization;
    return true;
  }
}
