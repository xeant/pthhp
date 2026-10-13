import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const normalizePrivateKey = (value: string) => value.replace(/\\n/g, "\n");

const readServiceAccount = () => {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (encoded) {
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return JSON.parse(json);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) return null;

  return {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
  };
};

export const getFirebaseMessaging = () => {
  if (getApps().length === 0) {
    const serviceAccount = readServiceAccount();

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      return null;
    }
  }

  return getMessaging();
};
