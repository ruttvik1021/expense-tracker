"use server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifySession } from "@/lib/session";
import SourcesModel from "@/models/SourcesModel";

export const getSources = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const sources = await SourcesModel.find({
    userId: decodedToken?.userId,
    deletedAt: null,
  });
  return sources;
};

export const getSourceById = async (sourceId: string) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const source = await SourcesModel.findOne({
    _id: sourceId,
    userId: decodedToken?.userId,
    deletedAt: null,
  });
  console.log("source", { source, sourceId });
  return source.toObject();
};

export const createSource = async (source: string) => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const findSource = await SourcesModel.findOne({
    source,
    userId: decodedToken?.userId,
  });
  if (findSource) {
    return { error: "Source already exists" };
  }

  const newSource = new SourcesModel({
    userId: decodedToken?.userId,
    source,
  });

  await newSource.save();
  return { message: "Source created successfully", source: newSource };
};

export const updateSource = async (sourceId: string, source: string) => {
  const decodedToken = await verifySession();

  await connectToDatabase();

  const updatedSource = await SourcesModel.findOneAndUpdate(
    { _id: sourceId, userId: decodedToken?.userId, deletedAt: null },
    { source },
    { new: true }
  );

  if (!updatedSource) {
    return { error: "Source not found" };
  }

  return { message: "Source updated successfully" };
};

export const removeSource = async (sourceId: string) => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const deletedSource = await SourcesModel.findOneAndUpdate(
    { _id: sourceId, userId: decodedToken?.userId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!deletedSource) {
    return { error: "Source not found" };
  }

  return { message: "Source deleted successfully" };
};
