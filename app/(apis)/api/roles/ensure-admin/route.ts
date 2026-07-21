import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { roles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        // Check if admin role exists
        let adminRole = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
        
        const allPermissions = {
            users: { view: true, edit: true, delete: true },
            roles: { view: true, edit: true, delete: true },
            content: { view: true, edit: true, delete: true },
            system: { view: true, edit: true, delete: true },
            endeavors: { view: true, edit: true, delete: true },
            energy: { view: true, edit: true, delete: true },
            engineering: { view: true, edit: true, delete: true },
            enlighten: { view: true, edit: true, delete: true },
            evolution: { view: true, edit: true, delete: true },
            expertise: { view: true, edit: true, delete: true },
            explore: { view: true, edit: true, delete: true }
        };

        if (adminRole.length === 0) {
            // Create admin role with all permissions
            const newRole = await db.insert(roles).values({
                name: 'admin',
                permissions: allPermissions
            }).returning();
            
            return NextResponse.json({
                success: true,
                message: 'Admin role created successfully',
                data: newRole[0]
            });
        } else {
            // Update existing admin role to ensure it has all permissions
            const updatedRole = await db
                .update(roles)
                .set({
                    permissions: allPermissions
                })
                .where(eq(roles.name, 'admin'))
                .returning();

            return NextResponse.json({
                success: true,
                message: 'Admin role updated with all permissions',
                data: updatedRole[0]
            });
        }

    } catch (error) {
        console.error('Ensure admin role error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to ensure admin role' 
        }, { status: 500 });
    }
}