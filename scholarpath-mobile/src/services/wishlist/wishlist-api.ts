import { apiRequest } from '@/src/services/api/client';
import type {
  AddWishlistRequest,
  AddWishlistResponse,
  DeleteWishlistResponse,
  GetWishlistResponse,
} from '@/src/types/shared/wishlist-api';

export async function getWishlist(token: string) {
  return apiRequest<GetWishlistResponse>('/api/user/wishlist', { token });
}

export async function addToWishlist(token: string, body: AddWishlistRequest) {
  return apiRequest<AddWishlistResponse>('/api/user/wishlist', {
    method: 'POST',
    body,
    token,
  });
}

export async function removeFromWishlist(token: string, wishlistId: number) {
  return apiRequest<DeleteWishlistResponse>(`/api/user/wishlist/${wishlistId}`, {
    method: 'DELETE',
    token,
  });
}
