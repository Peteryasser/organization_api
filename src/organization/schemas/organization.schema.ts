import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Organization extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        roleId: { type: Types.ObjectId, ref: 'Role' },
      },
    ],
  })
  members: { userId: Types.ObjectId; roleId: Types.ObjectId }[];
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
