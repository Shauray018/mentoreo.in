import { getCometChatSDK } from "@/lib/cometchat-sdk";

let initPromise: Promise<void> | null = null;
let loginPromise: Promise<void> | null = null;

function getCometConfig() {
  const appId = process.env.NEXT_PUBLIC_COMET_APP_ID;
  const region = process.env.NEXT_PUBLIC_COMET_REGION;
  if (!appId || !region) {
    throw new Error("Missing NEXT_PUBLIC_COMET_APP_ID or NEXT_PUBLIC_COMET_REGION");
  }
  return { appId, region };
}

export function initCometChat() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const { appId, region } = getCometConfig();
    const { CometChat } = await getCometChatSDK();
    const settings = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();
    await CometChat.init(appId, settings);
  })();
  return initPromise;
}

export async function ensureCometChatLogin(authToken: string) {
  if (loginPromise) return loginPromise;
  loginPromise = (async () => {
    const { CometChat } = await getCometChatSDK();
    const loggedIn = await CometChat.getLoggedinUser();
    if (loggedIn) return;
    await CometChat.login(authToken);
  })();
  return loginPromise;
}
