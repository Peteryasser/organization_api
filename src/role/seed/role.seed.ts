import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';

@Injectable()
export class RoleSeed implements OnModuleInit {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async onModuleInit() {
    const roles = ['creator', 'read-only'];
    for (const roleName of roles) {
      const roleExists = await this.roleModel.findOne({ name: roleName });
      if (!roleExists) {
        await new this.roleModel({ name: roleName }).save();
      }
    }
  }
}
