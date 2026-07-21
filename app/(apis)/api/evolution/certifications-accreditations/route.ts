import { NextRequest, NextResponse } from 'next/server';
import { 
  getCertificationsAccreditations, 
  createCertificationsAccreditations, 
  updateCertificationsAccreditations, 
  deleteCertificationsAccreditations
} from '@/lib/api/evolutionCertificationsAccreditations';
import { type EvolutionCertificationsAccreditationsInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getCertificationsAccreditations();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching certifications accreditations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications accreditations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EvolutionCertificationsAccreditationsInsert = await request.json();
    
    // Validate required fields
    if (!body.title || !body.tagline) {
      return NextResponse.json(
        { error: 'Title and tagline are required' },
        { status: 400 }
      );
    }

    if (!body.esgSection || !body.isoSection || !body.cleanEnergySection) {
      return NextResponse.json(
        { error: 'All sections (esgSection, isoSection, cleanEnergySection) are required' },
        { status: 400 }
      );
    }

    // Set default values for certificate fields if not provided
    body.certificate1 = body.certificate1 || '';
    body.certificate2 = body.certificate2 || '';
    body.certificate3 = body.certificate3 || '';

    // Validate ESG section
    if (!body.esgSection.heading || !body.esgSection.description || !Array.isArray(body.esgSection.points)) {
      return NextResponse.json(
        { error: 'ESG section must have heading, description, and points array' },
        { status: 400 }
      );
    }

    // Validate ISO section
    if (!body.isoSection.heading || !body.isoSection.description || !Array.isArray(body.isoSection.certificates)) {
      return NextResponse.json(
        { error: 'ISO section must have heading, description, and certificates array' },
        { status: 400 }
      );
    }

    // Validate certificates
    for (const cert of body.isoSection.certificates) {
      if (!cert.name || !cert.year || !cert.title || !cert.description) {
        return NextResponse.json(
          { error: 'Each certificate must have name, year, title, and description' },
          { status: 400 }
        );
      }
    }

    // Validate Clean Energy section
    if (!body.cleanEnergySection.heading || !body.cleanEnergySection.description || !body.cleanEnergySection.logo) {
      return NextResponse.json(
        { error: 'Clean Energy section must have heading, description, and logo' },
        { status: 400 }
      );
    }

    if (!body.cleanEnergySection.logo.src || !body.cleanEnergySection.logo.alt) {
      return NextResponse.json(
        { error: 'Clean Energy logo must have src and alt' },
        { status: 400 }
      );
    }

    const data = await createCertificationsAccreditations(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating certifications accreditations:', error);
    return NextResponse.json(
      { error: 'Failed to create certifications accreditations' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      );
    }

    const data = await updateCertificationsAccreditations(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating certifications accreditations:', error);
    return NextResponse.json(
      { error: 'Failed to update certifications accreditations' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for deletion' },
        { status: 400 }
      );
    }

    await deleteCertificationsAccreditations(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting certifications accreditations:', error);
    return NextResponse.json(
      { error: 'Failed to delete certifications accreditations' },
      { status: 500 }
    );
  }
}