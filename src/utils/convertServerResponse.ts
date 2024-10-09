"use server";

export const convertServerResponse = (response: string) => {
  try {
    return JSON.parse(response);
  } catch (error) {
    return response;
  }
};
