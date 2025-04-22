import { Schema, Document } from 'mongoose';

export interface ITrainingOrganization extends Omit<Document, 'model'> {
  name: string;
}

const trainingOrganizationSchema = new Schema<ITrainingOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      validate: {
        validator: function(value: string): boolean {
          return !!value && value.trim().length > 0;
        },
        message: 'Name cannot be empty',
      },
    },
  },
  {
    timestamps: true,
  },
);

export default trainingOrganizationSchema;
