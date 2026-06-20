import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';

import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { ApiError } from '@/src/services/api/client';
import {
  addToWishlist,
  getWishlist,
  mapWishlistApiItems,
  removeFromWishlist,
} from '@/src/services/wishlist';
import { parseProgramCompositeId, parsedProgramIdToApiPayload } from '@/src/services/explore';
import type { WishlistEntry } from '@/src/types/shared/wishlist-api';

type WishlistContextValue = {
  entries: WishlistEntry[];
  wishlistIds: string[];
  isLoading: boolean;
  isUsingFallback: boolean;
  isWishlisted: (programId: string) => boolean;
  toggleWishlist: (programId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useStudentSession();
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!token) {
      setEntries([]);
      setIsUsingFallback(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await getWishlist(token);
      setEntries(mapWishlistApiItems(response.data ?? []));
      setIsUsingFallback(false);
    } catch {
      setEntries([]);
      setIsUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      void loadWishlist();
      return;
    }

    setEntries([]);
    setIsUsingFallback(false);
  }, [isAuthenticated, token, loadWishlist]);

  const toggleWishlist = useCallback(
    async (programId: string) => {
      if (!token) {
        Alert.alert('Login diperlukan', 'Silakan login untuk menyimpan wishlist.');
        return;
      }

      const existing = entries.find((entry) => entry.programId === programId);

      if (existing) {
        const previousEntries = entries;
        setEntries((prev) => prev.filter((entry) => entry.programId !== programId));

        try {
          await removeFromWishlist(token, existing.wishlistId);
        } catch (error) {
          setEntries(previousEntries);
          const message =
            error instanceof ApiError ? error.message : 'Gagal menghapus dari wishlist.';
          Alert.alert('Wishlist', message);
        }
        return;
      }

      const parsed = parseProgramCompositeId(programId);
      if (!parsed) {
        Alert.alert('Wishlist', 'Program tidak valid.');
        return;
      }

      const previousEntries = entries;
      const optimisticEntry: WishlistEntry = {
        programId,
        wishlistId: -Date.now(),
      };

      setEntries((prev) => [...prev, optimisticEntry]);

      try {
        const response = await addToWishlist(token, parsedProgramIdToApiPayload(parsed));
        setEntries((prev) =>
          prev.map((entry) =>
            entry.programId === programId
              ? { programId, wishlistId: response.data.id }
              : entry
          )
        );
      } catch (error) {
        setEntries(previousEntries);
        const message =
          error instanceof ApiError ? error.message : 'Gagal menambahkan ke wishlist.';
        Alert.alert('Wishlist', message);
      }
    },
    [entries, token]
  );

  const wishlistIds = useMemo(() => entries.map((entry) => entry.programId), [entries]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      entries,
      wishlistIds,
      isLoading,
      isUsingFallback,
      isWishlisted: (programId) => entries.some((entry) => entry.programId === programId),
      toggleWishlist,
      refresh: loadWishlist,
    }),
    [entries, isLoading, isUsingFallback, loadWishlist, toggleWishlist, wishlistIds]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
