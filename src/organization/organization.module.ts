import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from './schemas/organization.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
      MongooseModule.forFeature([{
      name: Organization.name,
      schema: OrganizationSchema
    }]),
    AuthModule
  ],
  
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
