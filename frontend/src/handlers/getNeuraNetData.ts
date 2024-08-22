
import { MongoClient, Collection, Document } from 'mongodb';

interface Server extends Document {
  total_data_processed?: number;
  total_number_of_requests?: number;
}

// Function to get the MongoDB client
async function getClient(): Promise<MongoClient> {
  const uri = 'mongodb+srv://mmills6060:Dirtballer6060@banbury.fx0xcqk.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

// Function to get total data processed
export async function getTotalDataProcessed(): Promise<number | null> {
  try {
    const client = await getClient();
    const myColl: Collection<Server> = client.db('myDatabase').collection('server');
    const result = await myColl.findOne({ total_data_processed: { $exists: true } });

    if (result && result.total_data_processed) {
      console.log(`Total Data Processed: ${formatBytes(result.total_data_processed)}`);
      return result.total_data_processed;
    } else {
      console.log("No document found with 'total_data_processed' field.");
      return null;
    }
  } catch (error) {
    console.error('Error fetching total data processed:', error);
    return null;
  }
}

// Function to get total requests processed
export async function getTotalRequestsProcessed(): Promise<number | null> {
  try {
    const client = await getClient();
    const myColl: Collection<Server> = client.db('myDatabase').collection('server');
    const result = await myColl.findOne({ total_number_of_requests: { $exists: true } });

    if (result && result.total_number_of_requests) {
      console.log(`Total Requests Processed: ${result.total_number_of_requests}`);
      return result.total_number_of_requests;
    } else {
      console.log("No document found with 'total_number_of_requests' field.");
      return null;
    }
  } catch (error) {
    console.error('Error fetching total requests processed:', error);
    return null;
  }
}

// Helper function to format bytes (if needed, similar to Rust's format_bytes function)
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
