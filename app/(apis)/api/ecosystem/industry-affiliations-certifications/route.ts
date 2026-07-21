import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemIndustryAffiliationsCertifications, EcosystemIndustryAffiliationsCertificationsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';


export async function GET() {
    try {
        const data = await db.select().from(ecosystemIndustryAffiliationsCertifications).orderBy(ecosystemIndustryAffiliationsCertifications.createdAt).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ 
                message: 'No industry affiliations & certifications data found' 
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

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body = await request.json();
        
        const insertData: EcosystemIndustryAffiliationsCertificationsInsert = {
            mainPage: body.mainPage,
            whyCertificationAffiliationMatter: body.whyCertificationAffiliationMatter,
            ourCurrentCertifications: body.ourCurrentCertifications,
            industryAffiliations: body.industryAffiliations,
            whatThisMeansClients: body.whatThisMeansClients,
        };

        const result = await db.insert(ecosystemIndustryAffiliationsCertifications).values(insertData).returning();
        
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error('Error creating industry affiliations & certifications:', error);
        return NextResponse.json({ 
            message: 'Failed to create industry affiliations & certifications data' 
        }, { status: 500 });
    }
}