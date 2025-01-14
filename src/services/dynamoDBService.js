// src/services/dynamoDBService.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  UpdateCommand 
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1", // or your preferred region
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const SCORE_ID = 'HIGH_SCORE'; // We'll use this as our single record identifier

export const getHighScore = async () => {
  const command = new GetCommand({
    TableName: "MemoryGameHighScore",
    Key: {
      id: SCORE_ID
    }
  });

  try {
    const response = await docClient.send(command);
    return response.Item?.score || 0;
  } catch (error) {
    console.error("Error getting high score:", error);
    return 0;
  }
};

export const updateHighScore = async (newScore) => {
  const command = new UpdateCommand({
    TableName: "MemoryGameHighScore",
    Key: {
      id: SCORE_ID
    },
    UpdateExpression: "set score = :s",
    ExpressionAttributeValues: {
      ":s": newScore
    },
    ReturnValues: "UPDATED_NEW"
  });

  try {
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error("Error updating high score:", error);
    return false;
  }
};
