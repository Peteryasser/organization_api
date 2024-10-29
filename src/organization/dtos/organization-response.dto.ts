export class OrganizationMemberDto {
    name: string;
    email: string;
    accessLevel: 'creator' | 'read-only';
  }

export class OrganizationResponseDto {
  organization_id: string;
  name: string;
  description: string;
  members: OrganizationMemberDto[];
}

export class OrganizationUpdatedResponseDto {
    organization_id: string;
    name: string;
    description: string;
  }

  export type AllOrganizationsResponseDto = OrganizationResponseDto[];
