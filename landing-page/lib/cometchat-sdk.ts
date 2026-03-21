let sdkPromise: Promise<any> | null = null;

export function getCometChatSDK() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("CometChat SDK is client-only"));
  }
  if (!sdkPromise) {
    sdkPromise = import("@cometchat/chat-sdk-javascript");
  }
  return sdkPromise;
}
