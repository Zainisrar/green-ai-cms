import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { roles } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requirePermission(request, 'roles', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const roleId = parseInt(params.id);
        const { name, permissions } = await request.json();

        if (!name) {
            return NextResponse.json({ 
                success: false, 
                error: 'Role name is required' 
            }, { status: 400 });
        }

        // Check if role exists
        const existingRole = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
        if (!existingRole[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'Role not found' 
            }, { status: 404 });
        }

        // Prevent editing admin role
        if (existingRole[0].name === 'admin') {
            return NextResponse.json({ 
                success: false, 
                error: 'Admin role cannot be edited' 
            }, { status: 400 });
        }

        // Update role
        const updatedRole = await db
            .update(roles)
            .set({
                name,
                permissions: permissions || {}
            })
            .where(eq(roles.id, roleId))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Role updated successfully',
            data: updatedRole[0]
        });

    } catch (error) {
        console.error('Update role error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update role' 
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requirePermission(request, 'roles', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const roleId = parseInt(params.id);

        // Check if role exists
        const existingRole = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
        if (!existingRole[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'Role not found' 
            }, { status: 404 });
        }

        // Prevent deletion of admin role
        if (existingRole[0].name === 'admin') {
            return NextResponse.json({ 
                success: false, 
                error: 'Cannot delete admin role' 
            }, { status: 400 });
        }

        // Delete role
        await db.delete(roles).where(eq(roles.id, roleId));

        return NextResponse.json({
            success: true,
            message: 'Role deleted successfully'
        });

    } catch (error) {
        console.error('Delete role error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to delete role' 
        }, { status: 500 });
    }
}