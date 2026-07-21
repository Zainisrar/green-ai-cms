import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { db } from '@/db';
import { endeavorsFlagshipProjects } from '@/db/schema';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        // Prevent caching
        noStore();
        
        // Use request parameter to signal dynamic behavior
        const url = new URL(request.url);
        const timestamp = url.searchParams.get('t') || Date.now();
        
        const projects = await db.select().from(endeavorsFlagshipProjects).limit(1);
        const project = projects[0] || null;

        const response = NextResponse.json(project);

        // Disable caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('X-Timestamp', timestamp.toString());

        return response;
    } catch (error) {
        console.error('Error fetching flagship project:', error);
        return NextResponse.json({ error: 'Failed to fetch flagship project' }, { status: 500 });
    }
}
