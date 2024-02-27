export const createMediasDirectory = (
  uploadPath: string,
  userId: string,
  dispositiveId: string,
  folder: string
) => `${uploadPath}/${userId}/${dispositiveId}/${folder}`;
