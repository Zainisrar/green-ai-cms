import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemIndustryAffiliationsCertifications, EcosystemIndustryAffiliationsCertificationsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '@/lib/auth-middleware';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
        }

        const data = await db
            .select()
            .from(ecosystemIndustryAffiliationsCertifications)
            .where(eq(ecosystemIndustryAffiliationsCertifications.id, id))
            .limit(1);

        if (data.length === 0) {
            return NextResponse.json({ 
                message: 'Industry affiliations & certifications data not found' 
            }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching industry affiliations & certifications:', error);
        return NextResponse.json({ 
            message: 'Failed to fetch industry affiliations & certifications data' 
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
        }

        const body = await request.json();
        
        const updateData: Partial<EcosystemIndustryAffiliationsCertificationsInsert> = {
            mainPage: body.mainPage,
            whyCertificationAffiliationMatter: body.whyCertificationAffiliationMatter,
            ourCurrentCertifications: body.ourCurrentCertifications,
            industryAffiliations: body.industryAffiliations,
            whatThisMeansClients: body.whatThisMeansClients,
        };

        const result = await db
            .update(ecosystemIndustryAffiliationsCertifications)
            .set(updateData)
            .where(eq(ecosystemIndustryAffiliationsCertifications.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ 
                message: 'Industry affiliations & certifications data not found' 
            }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating industry affiliations & certifications:', error);
        return NextResponse.json({ 
            message: 'Failed to update industry affiliations & certifications data' 
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
        }

        const result = await db
            .delete(ecosystemIndustryAffiliationsCertifications)
            .where(eq(ecosystemIndustryAffiliationsCertifications.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ 
                message: 'Industry affiliations & certifications data not found' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Industry affiliations & certifications data deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting industry affiliations & certifications:', error);
        return NextResponse.json({ 
            message: 'Failed to delete industry affiliations & certifications data' 
        }, { status: 500 });
    }
}