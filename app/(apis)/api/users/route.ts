import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, roles } from '@/db/schema';
import { requireAdminRole } from '@/lib/auth-middleware';
import { hashPassword } from '@/lib/password';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const authResult = await requireAdminRole(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const allUsers = await db
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
                }
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .orderBy(desc(users.createdAt));

        return NextResponse.json({
            success: true,
            data: allUsers
        });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch users' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authResult = await requireAdminRole(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { name, email, password, roleId, image } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ 
                success: false, 
                error: 'Name, email, and password are required' 
            }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Email already exists' 
            }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const newUser = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            roleId: roleId || null,
            image: image || null,
            isActive: true
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            data: {
                id: newUser[0].id,
                name: newUser[0].name,
                email: newUser[0].email,
                image: newUser[0].image,
                isActive: newUser[0].isActive
            }
        });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create user' 
        }, { status: 500 });
    }
}