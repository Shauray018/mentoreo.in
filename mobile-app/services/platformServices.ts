// import {
//     createExpoClipboardService,
//     createExpoFileService,
//     createExpoMediaService,
//     createExpoNotificationService,
//     createExpoPlayerService,
//     createExpoRecorderService,
//     SendbirdUIKitContainerProps,
// } from "@sendbird/uikit-react-native";

// import * as ExpoAudio from "expo-audio";
// import * as ExpoClipboard from "expo-clipboard";
// import * as ExpoDocumentPicker from "expo-document-picker";
// import * as ExpoFS from "expo-file-system";
// import * as ExpoImageManipulator from "expo-image-manipulator";
// import * as ExpoImagePicker from "expo-image-picker";
// import * as ExpoMediaLibrary from "expo-media-library";
// import * as ExpoNotifications from "expo-notifications";
// import * as ExpoVideo from "expo-video";
// import * as ExpoVideoThumbnail from "expo-video-thumbnails";

// export const platformServices: SendbirdUIKitContainerProps["platformServices"] =
//   {
//     clipboard: createExpoClipboardService(ExpoClipboard),
//     notification: createExpoNotificationService(ExpoNotifications),
//     file: createExpoFileService({
//       fsModule: ExpoFS,
//       imagePickerModule: ExpoImagePicker,
//       mediaLibraryModule: ExpoMediaLibrary,
//       documentPickerModule: ExpoDocumentPicker,
//     }),
//     media: createExpoMediaService({
//       avModule: ExpoVideo,
//       thumbnailModule: ExpoVideoThumbnail,
//       imageManipulator: ExpoImageManipulator,
//       fsModule: ExpoFS,
//     }),
//     player: createExpoPlayerService({
//       avModule: ExpoAudio,
//     }),
//     recorder: createExpoRecorderService({
//       avModule: ExpoAudio,
//     }),
//   };
import { SendbirdUIKitContainerProps } from "@sendbird/uikit-react-native";
import { Platform } from "react-native";

let platformServices: SendbirdUIKitContainerProps["platformServices"] | null =
  null;

if (Platform.OS !== "web") {
  const {
    createExpoClipboardService,
    createExpoFileService,
    createExpoMediaService,
    createExpoNotificationService,
    createExpoPlayerService,
    createExpoRecorderService,
  } = require("@sendbird/uikit-react-native");

  const ExpoAudio = require("expo-audio");
  const ExpoClipboard = require("expo-clipboard");
  const ExpoDocumentPicker = require("expo-document-picker");
  const ExpoFS = require("expo-file-system");
  const ExpoImageManipulator = require("expo-image-manipulator");
  const ExpoImagePicker = require("expo-image-picker");
  const ExpoMediaLibrary = require("expo-media-library");
  const ExpoNotifications = require("expo-notifications");
  const ExpoVideo = require("expo-video");
  const ExpoVideoThumbnail = require("expo-video-thumbnails");

  platformServices = {
    clipboard: createExpoClipboardService(ExpoClipboard),
    notification: createExpoNotificationService(ExpoNotifications),
    file: createExpoFileService({
      fsModule: ExpoFS,
      imagePickerModule: ExpoImagePicker,
      mediaLibraryModule: ExpoMediaLibrary,
      documentPickerModule: ExpoDocumentPicker,
    }),
    media: createExpoMediaService({
      avModule: ExpoVideo,
      thumbnailModule: ExpoVideoThumbnail,
      imageManipulator: ExpoImageManipulator,
      fsModule: ExpoFS,
    }),
    player: createExpoPlayerService({
      avModule: ExpoAudio,
    }),
    recorder: createExpoRecorderService({
      avModule: ExpoAudio,
    }),
  };
}

export { platformServices };
