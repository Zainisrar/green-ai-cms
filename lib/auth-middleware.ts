import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from './jwt';
import { db } from '@/db';
import { users, roles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface AuthenticatedUser {
    id: number;
    email: string;
    name: string;
    roleId: number;
    role?: {
        id: number;
        name: string;
        permissions: Record<string, any>;
    };
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser | NextResponse> {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const user = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
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
            .where(eq(users.id, userPayload.userId))
            .limit(1);

        if (!user[0] || !user[0].isActive) {
            return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
        }

        return user[0] as AuthenticatedUser;
    } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

export function checkPermission(user: AuthenticatedUser, resource: string, action: 'view' | 'edit' | 'delete'): boolean {
    // Super admin (role name 'admin') has all permissions
    if (user.role?.name === 'admin') {
        return true;
    }

    // Check specific permissions
    const permissions = user.role?.permissions;
    if (!permissions || !permissions[resource]) {
        return false;
    }

    return permissions[resource][action] === true;
}

export async function requirePermission(
    request: NextRequest, 
    resource: string, 
    action: 'view' | 'edit' | 'delete'
): Promise<AuthenticatedUser | NextResponse> {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    if (!checkPermission(authResult, resource, action)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return authResult;
}

export async function requireAdminRole(request: NextRequest): Promise<AuthenticatedUser | NextResponse> {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    if (authResult.role?.name !== 'admin') {
        return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    return authResult;
}

// Backward compatibility function for existing API routes
export async function authMiddleware(request: NextRequest): Promise<{ user?: AuthenticatedUser; error?: string; status?: number }> {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
        // Extract error info from NextResponse
        const response = authResult as NextResponse;
        return {
            error: 'Authentication required',
            status: response.status
        };
    }

    return { user: authResult };
}