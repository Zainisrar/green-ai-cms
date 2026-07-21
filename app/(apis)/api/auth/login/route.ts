import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, roles, userSessions } from '@/db/schema';
import { verifyPassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ 
                success: false, 
                error: 'Email and password are required' 
            }, { status: 400 });
        }

        // Find user with role
        const user = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                password: users.password,
                roleId: users.roleId,
                isActive: users.isActive,
                role: {
                    id: roles.id,
                    name: roles.name,
                    permissions: roles.permissions,
                }
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.email, email))
            .limit(1);

        if (!user[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid email or password' 
            }, { status: 401 });
        }

        if (!user[0].isActive) {
            return NextResponse.json({ 
                success: false, 
                error: 'Account is deactivated' 
            }, { status: 401 });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user[0].password);
        if (!isValidPassword) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid email or password' 
            }, { status: 401 });
        }

        // Generate JWT token
        const token = generateToken({
            userId: user[0].id,
            email: user[0].email,
            roleId: user[0].roleId || 0
        });

        // Store session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await db.insert(userSessions).values({
            userId: user[0].id,
            token,
            expiresAt
        });

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                role: user[0].role
            },
            token
        });

        // Set HTTP-only cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Login failed' 
        }, { status: 500 });
    }
}