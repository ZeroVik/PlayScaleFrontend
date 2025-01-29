export interface ProductDTO {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    isSecondHand: boolean;
    categoryName: string; // If your backend provides the category name
    categoryId: number;   // Add this property for filtering by category
}
