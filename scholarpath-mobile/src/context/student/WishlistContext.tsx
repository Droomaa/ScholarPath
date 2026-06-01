import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type WishlistContextValue = {
  wishlistIds: string[];
  isWishlisted: (programId: string) => boolean;
  toggleWishlist: (programId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistIds,
      isWishlisted: (programId) => wishlistIds.includes(programId),
      toggleWishlist: (programId) =>
        setWishlistIds((prev) =>
          prev.includes(programId)
            ? prev.filter((id) => id !== programId)
            : [...prev, programId]
        ),
    }),
    [wishlistIds]
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
