import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';

export async function requestNotificationPermission() {
  let permission = await isPermissionGranted();
  
  if (!permission) {
    const result = await requestPermission();
    permission = result === 'granted';
  }
  
  return permission;
}

export async function showNotification(title, body) {
  const permission = await isPermissionGranted();
  
  if (permission) {
    sendNotification({ title, body });
  }
}