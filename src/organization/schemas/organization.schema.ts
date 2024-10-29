import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema()
export class Organization {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [{ userId: { type: Types.ObjectId, ref: 'User' }, accessLevel: String }] })
  members: { userId: Types.ObjectId; accessLevel: 'creator' | 'read-only' }[];
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
