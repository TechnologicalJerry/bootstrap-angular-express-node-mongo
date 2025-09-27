import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    brand?: string;
    stock: number;
    sku?: string;
    tags?: string[];
    images?: string[];
    specifications?: Record<string, string>;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        category: { type: String, required: true, trim: true },
        brand: { type: String, trim: true },
        stock: { type: Number, required: true, default: 0 },
        sku: { type: String, unique: true, sparse: true, trim: true },
        tags: [{ type: String, trim: true }],
        images: [{ type: String, trim: true }],
        specifications: { type: Map, of: String },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

export const Product = mongoose.model<IProduct>('Products', ProductSchema);
