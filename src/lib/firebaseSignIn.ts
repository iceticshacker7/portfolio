// Google sign-in through Firebase Authentication (free on the Spark plan). Loaded on
// demand from the login page so the Firebase SDK never ships to regular visitors.
// We only use Firebase to prove who the user is; the API then issues its own session.
export async function signInWithGoogleViaFirebase(): Promise<string> {
  const [{ initializeApp, getApps }, { getAuth, GoogleAuthProvider, signInWithPopup, signOut }] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: import.meta.env.VITE_APP_API_KEY,
      authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_APP_PROJECT_ID,
      appId: import.meta.env.VITE_APP_APP_ID,
    });
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  await signOut(auth);
  return idToken;
}

export const firebaseConfigured = Boolean(import.meta.env.VITE_APP_API_KEY && import.meta.env.VITE_APP_PROJECT_ID);
