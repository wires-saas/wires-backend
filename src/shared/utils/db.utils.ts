import mongoose from 'mongoose';

export const randomId = (): string => {
  return new mongoose.Types.ObjectId().toString('hex');
};
