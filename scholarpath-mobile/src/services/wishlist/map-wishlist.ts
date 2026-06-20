import type { WishlistApiItem, WishlistEntry } from '@/src/types/shared/wishlist-api';
import { toProgramCompositeId } from '@/src/services/explore/program-id';

export function mapWishlistApiItem(item: WishlistApiItem): WishlistEntry {
  const kind = item.program_type === 'Beasiswa' ? 'beasiswa' : 'olimpiade';
  return {
    programId: toProgramCompositeId(kind, item.program_id),
    wishlistId: item.wishlist_id,
  };
}

export function mapWishlistApiItems(items: WishlistApiItem[]): WishlistEntry[] {
  return items.map(mapWishlistApiItem);
}
