import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async getRoleByName(name: string): Promise<Role> {
    const role = await this.roleModel.findOne({ name });
    if (!role) {
      throw new NotFoundException(`Role ${name} not found`);
    }
    return role;
  }

  async getRoleById(roleId: string): Promise<Role> {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const role = new this.roleModel(roleData);
    return await role.save();
  }
}
