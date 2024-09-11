import mongoose from 'mongoose';

export async function connectToDatabase() {

  if(mongoose.connections[0].readyState){
    return true
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully');
  } catch (error) {
    console.log('Database connection failed:', error);
  }
}

