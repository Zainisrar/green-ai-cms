import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { enlightenInsightsArticles } from '@/db/schema';
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
        const articles = await db.select().from(enlightenInsightsArticles).orderBy(enlightenInsightsArticles.createdAt);
        return NextResponse.json(articles);
    } catch (error) {
        console.error('Error fetching insights articles:', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, slug, featuredImg, cta, content, quote } = body;

        if (!title || !description || !content) {
            return NextResponse.json({ error: 'Title, description, and content are required' }, { status: 400 });
        }

        // Generate slug from title if not provided
        const articleSlug = slug || generateSlug(title);

        const newArticle = await db
            .insert(enlightenInsightsArticles)
            .values({
                title,
                description,
                slug: articleSlug,
                featuredImg: featuredImg || { src: '', alt: '' },
                cta: cta || { text: '', href: '' },
                content: typeof content === 'string' ? content : JSON.stringify(content),
                quote: quote || { text: '', highlighted: '' },
            })
            .returning();

        return NextResponse.json(newArticle[0], { status: 201 });
    } catch (error) {
        console.error('Error creating insights article:', error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return NextResponse.json({ error: 'An article with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, slug, featuredImg, cta, content, quote } = body;

        if (!id) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
        }

        if (!title || !description || !content) {
            return NextResponse.json({ error: 'Title, description, and content are required' }, { status: 400 });
        }

        // Generate slug from title if not provided
        const articleSlug = slug || generateSlug(title);

        const updatedArticle = await db
            .update(enlightenInsightsArticles)
            .set({
                title,
                description,
                slug: articleSlug,
                featuredImg: featuredImg || { src: '', alt: '' },
                cta: cta || { text: '', href: '' },
                content: typeof content === 'string' ? content : JSON.stringify(content),
                quote: quote || { text: '', highlighted: '' },
                updatedAt: new Date(),
            })
            .where(eq(enlightenInsightsArticles.id, id))
            .returning();

        if (updatedArticle.length === 0) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json(updatedArticle[0]);
    } catch (error) {
        console.error('Error updating insights article:', error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return NextResponse.json({ error: 'An article with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
        }

        const deletedArticle = await db
            .delete(enlightenInsightsArticles)
            .where(eq(enlightenInsightsArticles.id, parseInt(id)))
            .returning();

        if (deletedArticle.length === 0) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting insights article:', error);
        return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }
}