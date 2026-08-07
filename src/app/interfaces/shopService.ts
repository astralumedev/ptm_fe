
export interface Category{
    name: string;
    subcategories: string[]
}

export interface ShopService {
    id: number;
    name: string;
    categories: Category[];
    logo: string;
    coverImage: string;
    excerpt: string;
    link: string; // Add a link property
}

export interface Business {
    title: string;
    description: string;
    image: string;
    logo: string;
    slug: string;
    categories: Category[];
} 