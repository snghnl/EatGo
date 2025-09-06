import mock from "@/mock-data/wishlists.json";

export type WishlistItem = {
    id: string;
    wishlist_id: string;
    place_name: string;
    place_id: string;
    lat?: number;
    lng?: number;
    added_at: string;
};

export type Wishlist = {
    id: string;
    user_id: string;
    title: string;
    description: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    items: WishlistItem[];
};

export async function fetchWishlists(): Promise<Wishlist[]> {
    try {
        // TODO: 서버가 준비되면 주석 해제
        // const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/wishlists`);
        // if (!res.ok) throw new Error('failed');
        // return await res.json();
        return mock as unknown as Wishlist[];
    } catch {
        return mock as unknown as Wishlist[];
    }
}
