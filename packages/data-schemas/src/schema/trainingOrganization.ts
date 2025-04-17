import { Schema, Document } from 'mongoose';

export interface ITrainingOrganization extends Omit<Document, 'model'> {
  name: string;
}

const trainingOrganizationSchema = new Schema<ITrainingOrganization>(
  {
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default trainingOrganizationSchema;
