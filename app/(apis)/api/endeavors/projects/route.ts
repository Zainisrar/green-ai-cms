import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { endeavorsProjects } from '@/db/schema';
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
        const projects = await db.select().from(endeavorsProjects).orderBy(endeavorsProjects.createdAt);
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching endeavors projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            title, 
            slug, 
            featuredImg,
            numberofsystems, 
            noofdays, 
            totalgeneration, 
            battery, 
            coalA, 
            emissionreduction, 
            treesplanted, 
            capacity, 
            todateproduct, 
            consumption, 
            totalenergydaily 
        } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Generate slug from title if not provided
        const projectSlug = slug || generateSlug(title);

        const newProject = await db
            .insert(endeavorsProjects)
            .values({
                title,
                slug: projectSlug,
                featuredImg: featuredImg || '',
                numberofsystems: numberofsystems || '',
                noofdays: noofdays || '',
                totalgeneration: totalgeneration || '',
                battery: battery || '',
                coalA: coalA || '',
                emissionreduction: emissionreduction || '',
                treesplanted: treesplanted || '',
                capacity: capacity || '',
                todateproduct: todateproduct || '',
                consumption: consumption || '',
                totalenergydaily: totalenergydaily || '',
            })
            .returning();

        return NextResponse.json(newProject[0], { status: 201 });
    } catch (error) {
        console.error('Error creating endeavors project:', error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            id, 
            title, 
            slug, 
            featuredImg,
            numberofsystems, 
            noofdays, 
            totalgeneration, 
            battery, 
            coalA, 
            emissionreduction, 
            treesplanted, 
            capacity, 
            todateproduct, 
            consumption, 
            totalenergydaily 
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Generate slug from title if not provided
        const projectSlug = slug || generateSlug(title);

        const updatedProject = await db
            .update(endeavorsProjects)
            .set({
                title,
                slug: projectSlug,
                featuredImg: featuredImg || '',
                numberofsystems: numberofsystems || '',
                noofdays: noofdays || '',
                totalgeneration: totalgeneration || '',
                battery: battery || '',
                coalA: coalA || '',
                emissionreduction: emissionreduction || '',
                treesplanted: treesplanted || '',
                capacity: capacity || '',
                todateproduct: todateproduct || '',
                consumption: consumption || '',
                totalenergydaily: totalenergydaily || '',
                updatedAt: new Date(),
            })
            .where(eq(endeavorsProjects.id, id))
            .returning();

        if (updatedProject.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(updatedProject[0]);
    } catch (error) {
        console.error('Error updating endeavors project:', error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const deletedProject = await db
            .delete(endeavorsProjects)
            .where(eq(endeavorsProjects.id, parseInt(id)))
            .returning();

        if (deletedProject.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting endeavors project:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}