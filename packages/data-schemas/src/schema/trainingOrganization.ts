import { Document, Schema, Types } from 'mongoose';

export interface ITrainingOrganization extends Omit<Document, 'model'> {
  name: string;
  administrators: Array<{
    userId?: Types.ObjectId;
    email: string;
    invitationToken?: string;
    invitationExpires?: Date;
    invitedAt?: Date;
    activatedAt?: Date;
  }>;
  trainers: Array<{
    userId?: Types.ObjectId;
    email: string;
    invitationToken?: string;
    invitationExpires?: Date;
    invitedAt?: Date;
    activatedAt?: Date;
  }>;
}

const OrgAdminSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    invitationToken: {
      type: String,
      required: false,
    },
    invitationExpires: {
      type: Date,
      required: false,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    activatedAt: {
      type: Date,
      required: false,
    },
  },
  { _id: false },
);

const trainingOrganizationSchema = new Schema<ITrainingOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      validate: {
        validator: function (value: string): boolean {
          return !!value && value.trim().length > 0;
        },
        message: 'Name cannot be empty',
      },
    },
    administrators: {
      type: [OrgAdminSchema],
      default: [],
    },
    trainers: {
      type: [OrgAdminSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default trainingOrganizationSchema;
