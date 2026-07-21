import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { roles } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    // Allow GET requests for all users (no authentication required)
    try {
        const allRoles = await db
            .select()
            .from(roles)
            .orderBy(desc(roles.id));

        return NextResponse.json({
            success: true,
            data: allRoles
        });

    } catch (error) {
        console.error('Get roles error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch roles' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authResult = await requirePermission(request, 'roles', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { name, permissions } = await request.json();

        if (!name) {
            return NextResponse.json({ 
                success: false, 
                error: 'Role name is required' 
            }, { status: 400 });
        }

        // Create role
        const newRole = await db.insert(roles).values({
            name,
            permissions: permissions || {}
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Role created successfully',
            data: newRole[0]
        });

    } catch (error) {
        console.error('Create role error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create role' 
        }, { status: 500 });
    }
}