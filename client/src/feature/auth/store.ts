import { create } from "zustand";
import type { AuthAction, AuthState } from "./type";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

//Interface authState và authAction

export const useAuthStore = create<AuthState & AuthAction>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        role: null,

        setToken: (accessToken, role) => set({ accessToken: accessToken, role: role }),

        clearToken: () => set({ accessToken: null, role: null })
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
)