import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';
import { hashPassword } from '@/lib/password';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        return NextResponse.json({
            success: true,
            data: {
                id: authResult.id,
                name: authResult.name,
                email: authResult.email,
                image: authResult.role?.name || null,
                role: authResult.role
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch profile' 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { name, password, image } = await request.json();

        // Prepare update data
        const updateData: any = {
            updatedAt: new Date()
        };

        if (name) updateData.name = name;
        if (image !== undefined) updateData.image = image;

        // Hash password if provided
        if (password) {
            updateData.password = await hashPassword(password);
        }

        // Update user
        const updatedUser = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, authResult.id))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: updatedUser[0].id,
                name: updatedUser[0].name,
                email: updatedUser[0].email,
                image: updatedUser[0].image
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update profile' 
        }, { status: 500 });
    }
}