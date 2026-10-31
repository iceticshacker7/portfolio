import { createContext, useContext, type ReactNode } from "react";
import type { Profile } from "@shared/schemas";
import { seedProfile } from "@shared/seed-data";
import { useApi } from "./api";

interface ProfileState {
  profile: Profile;
  loading: boolean;
  reload: () => void;
}

const ProfileContext = createContext<ProfileState>({ profile: seedProfile, loading: false, reload: () => {} });

/**
 * The profile the build embedded in the page (scripts/prerender.ts), so the first paint
 * already has the current photo and headline instead of swapping them in after a fetch.
 */
function embeddedProfile(): Profile | null {
  try {
    const text = document.getElementById("initial-profile")?.textContent;
    return text ? (JSON.parse(text) as Profile) : null;
  } catch {
    return null;
  }
}
const initialProfile = embeddedProfile();

/** Loads the profile once for the header, home page, footer and contact modal. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data, loading, reload } = useApi<Profile | null>("/profile", initialProfile);
  // Until real data arrives the avatar stays empty (a placeholder), never an outdated photo.
  const profile = data ?? { ...seedProfile, avatar: "" };
  return (
    <ProfileContext.Provider value={{ profile, loading, reload }}>
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => useContext(ProfileContext);
