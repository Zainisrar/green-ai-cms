import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, roles } from '@/db/schema';
import { hashPassword } from '@/lib/password';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ 
                success: false, 
                error: 'Name, email, and password are required' 
            }, { status: 400 });
        }

        // Check if any users exist
        const existingUsers = await db.select().from(users).limit(1);
        if (existingUsers.length > 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Super admin already exists or users already exist in the system' 
            }, { status: 400 });
        }

        // Create admin role if it doesn't exist
        let adminRole = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
        
        if (adminRole.length === 0) {
            const newRole = await db.insert(roles).values({
                name: 'admin',
                permissions: {
                    users: { view: true, edit: true, delete: true },
                    roles: { view: true, edit: true, delete: true },
                    content: { view: true, edit: true, delete: true },
                    system: { view: true, edit: true, delete: true }
                }
            }).returning();
            adminRole = newRole;
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create super admin user
        const newUser = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            roleId: adminRole[0].id,
            isActive: true
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Super admin created successfully',
            user: {
                id: newUser[0].id,
                name: newUser[0].name,
                email: newUser[0].email,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Create super admin error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create super admin' 
        }, { status: 500 });
    }
}