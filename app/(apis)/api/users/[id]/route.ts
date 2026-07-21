import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, roles } from '@/db/schema';
import { requireAdminRole } from '@/lib/auth-middleware';
import { hashPassword } from '@/lib/password';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requireAdminRole(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const userId = parseInt(params.id);
        
        const user = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                role: {
                    id: roles.id,
                    name: roles.name,
                    permissions: roles.permissions,
                }
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.id, userId))
            .limit(1);

        if (!user[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'User not found' 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch user' 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requireAdminRole(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const userId = parseInt(params.id);
        const { name, email, password, roleId, image, isActive } = await request.json();

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!existingUser[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'User not found' 
            }, { status: 404 });
        }

        // Prepare update data
        const updateData: any = {
            updatedAt: new Date()
        };

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (roleId !== undefined) updateData.roleId = roleId;
        if (image !== undefined) updateData.image = image;
        if (isActive !== undefined) updateData.isActive = isActive;

        // Hash password if provided
        if (password) {
            updateData.password = await hashPassword(password);
        }

        // Update user
        const updatedUser = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'User updated successfully',
            data: {
                id: updatedUser[0].id,
                name: updatedUser[0].name,
                email: updatedUser[0].email,
                image: updatedUser[0].image,
                isActive: updatedUser[0].isActive
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update user' 
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requireAdminRole(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const userId = parseInt(params.id);

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!existingUser[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'User not found' 
            }, { status: 404 });
        }

        // Delete user (this will cascade delete sessions and notifications)
        await db.delete(users).where(eq(users.id, userId));

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to delete user' 
        }, { status: 500 });
    }
}