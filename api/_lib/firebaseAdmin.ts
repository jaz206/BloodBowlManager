import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

type ServiceAccountConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

const parseServiceAccountFromEnv = (): ServiceAccountConfig | null => {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson) as Partial<ServiceAccountConfig>;
    if (parsed.projectId && parsed.clientEmail && parsed.privateKey) {
      return {
        projectId: parsed.projectId,
        clientEmail: parsed.clientEmail,
        privateKey: parsed.privateKey.replace(/\\n/g, '\n'),
      };
    }
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return null;
};

const ensureAdminApp = () => {
  if (getApps().length) {
    return getApps()[0]!;
  }

  const serviceAccount = parseServiceAccountFromEnv();
  if (!serviceAccount) {
    throw new Error(
      'Firebase Admin credentials are not configured. Define FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY.'
    );
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
};

export const verifyFirebaseIdToken = async (authorizationHeader?: string) => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw new Error('Missing bearer token.');
  }

  const idToken = authorizationHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    throw new Error('Missing bearer token.');
  }

  ensureAdminApp();
  return getAuth().verifyIdToken(idToken);
};
