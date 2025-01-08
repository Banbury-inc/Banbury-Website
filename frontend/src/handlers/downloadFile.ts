import axios from "axios";

import { getDeviceInfo } from "./getDeviceInfo";
import { webSocketService } from "../websockets";



// Function to get total requests processed
export async function downloadFile(username: string, fileInfo: any): Promise<any | null> {

  // get device id from fileInfo
  const device_id = fileInfo.device_id;

  // get file id from fileInfo
  const file_id = fileInfo._id;

  // get device info from device id
  const device_info = await getDeviceInfo(username, device_id);
  console.log(device_info);

  // look to see if device is online
  const online = device_info.online;
  // if device is online, send request (websocket) to download file
  if (online) {
    console.log("Device is online");

    try {
      // Wait for WebSocket connection with timeout
      const connectionTimeout = 5000; // 5 seconds timeout
      await Promise.race([
        webSocketService.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('WebSocket connection timeout')), connectionTimeout)
        )
      ]);

      // Check if connection is actually established
      if (webSocketService.isConnected()) {
        console.log("Sending request to download file");
        webSocketService.send({
          message: "Download Request",
          username: username,
          file_name: fileInfo.file_name,
          file_path: fileInfo.file_path,
          requesting_device_name: device_info.device_name,
        });
        console.log("Request sent to download file");
      } else {
        throw new Error('WebSocket connection failed');
      }
    } catch (error) {
      console.error('Failed to send download request:', error);
      throw error;
    }
  } else {
    console.log("Device is offline");
  }
  return;

}
