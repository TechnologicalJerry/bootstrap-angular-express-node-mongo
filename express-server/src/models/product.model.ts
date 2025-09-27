import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        category: { type: String, required: true, trim: true },
        stock: { type: Number, required: true, default: 0 },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

export const Product = mongoose.model<IProduct>('Products', ProductSchema);
