const ProfileInitialValues = {
  name: "",
  budget: 0,
};

const UpdatePasswordSchema = {
  currentPassword: "",
  newPassword: "",
};

export type UpdateProfilePayload = typeof ProfileInitialValues;

export type UpdatePasswordPayload = typeof UpdatePasswordSchema;
