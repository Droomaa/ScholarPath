export type WishlistApiItem = {
  wishlist_id: number;
  program_type: 'Beasiswa' | 'Olimpiade' | string;
  program_title: string;
  program_id: number;
};

export type WishlistRecord = {
  id: number;
  user_id: number;
  beasiswa_id: number | null;
  olimpiade_id: number | null;
  created_at?: string;
  updated_at?: string;
};

export type AddWishlistRequest = {
  beasiswa_id?: number;
  olimpiade_id?: number;
};

export type GetWishlistResponse = {
  data: WishlistApiItem[];
};

export type AddWishlistResponse = {
  message: string;
  data: WishlistRecord;
};

export type DeleteWishlistResponse = {
  message: string;
};

export type WishlistEntry = {
  programId: string;
  wishlistId: number;
};
