import { Schema, Document, Types } from 'mongoose';

export interface IAdminInvitation extends Omit<Document, 'model'> {
  email: string;
  invitationToken: string;
  invitationExpires: Date;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: Types.ObjectId;
  acceptedAt?: Date;
}

const adminInvitationSchema = new Schema<IAdminInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      index: true,
    },
    invitationToken: {
      type: String,
      required: true,
    },
    invitationExpires: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending',
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default adminInvitationSchema;
