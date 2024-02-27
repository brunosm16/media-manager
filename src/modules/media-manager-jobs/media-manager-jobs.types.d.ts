import type Bull from 'bull';

export type JobRegistrationResult = {
  jobId: Bull.JobId;
};

export type MediaPaths = {
  destinationPath: string;
  originalPath: string;
};
