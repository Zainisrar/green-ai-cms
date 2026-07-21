import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engineeringProducts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Function to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
}

export async function GET() {
    try {
        const products = await db.select().from(engineeringProducts).orderBy(engineeringProducts.createdAt);
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching engineering products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, slug, description, imgs, ctaButton, keys } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        // Generate slug from title if not provided
        const productSlug = slug || generateSlug(title);

        const newProduct = await db
            .insert(engineeringProducts)
            .values({
                title,
                slug: productSlug,
                description,
                imgs: imgs || [],
                ctaButton: ctaButton || { text: '', href: '' },
                keys: keys || [],
            })
            .returning();

        return NextResponse.json(newProduct[0], { status: 201 });
    } catch (error) {
        console.error('Error creating engineering product:', error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, slug, description, imgs, ctaButton, keys } = body;

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        // Generate slug from title if not provided
        const productSlug = slug || generateSlug(title);

        const updatedProduct = await db
            .update(engineeringProducts)
            .set({
                title,
                slug: productSlug,
                description,
                imgs: imgs || [],
                ctaButton: ctaButton || { text: '', href: '' },
                keys: keys || [],
                updatedAt: new Date(),
            })
            .where(eq(engineeringProducts.id, id))
            .returning();

        if (updatedProduct.length === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(updatedProduct[0]);
    } catch (error) {
        console.error('Error updating engineering product:', error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const deletedProduct = await db
            .delete(engineeringProducts)
            .where(eq(engineeringProducts.id, parseInt(id)))
            .returning();

        if (deletedProduct.length === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting engineering product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
