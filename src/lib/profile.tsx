import { createContext, useContext, type ReactNode } from "react";
import type { Profile } from "@shared/schemas";
import { seedProfile } from "@shared/seed-data";
import myImage from "@/assets/myimage.jpeg";
import { useApi } from "./api";

interface ProfileState {
  profile: Profile;
  loading: boolean;
  reload: () => void;
}

const ProfileContext = createContext<ProfileState>({ profile: seedProfile, loading: false, reload: () => {} });

/** Loads the profile once for the header, home page, footer and contact modal. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data, loading, reload } = useApi<Profile | null>("/profile", null);
  const profile = data ?? seedProfile;
  return (
    <ProfileContext.Provider value={{ profile: { ...profile, avatar: profile.avatar || myImage }, loading, reload }}>
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => useContext(ProfileContext);
