'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface TeamGreenImage {
    src: string;
    alt: string;
}

interface TeamGreenCTA {
    text: string;
    href: string;
}

interface TeamGreenDescription {
    text: string;
    highlighted: string;
}

interface TeamGreenQuote {
    text: string;
    highlighted: string;
}

interface TeamGreenKey {
    title: string;
    description: string;
    button: TeamGreenCTA;
}

interface TeamGreenMainPage {
    title: string;
    subHeadline: string;
    description: TeamGreenDescription;
    quote1: TeamGreenQuote;
    quote2: TeamGreenQuote;
    cta: TeamGreenCTA[];
    keys: TeamGreenKey[];
}

interface TeamMember {
    name: string;
    designation: string;
    img: TeamGreenImage;
}

interface TeamGreenData {
    id?: number;
    mainPage: TeamGreenMainPage;
    whoWeAreModal: any;
    ourLeadershipPhilosophy: any;
    meetTeam: {
        title: string;
        description: string;
        quote: {
            text1: string;
            text2: string;
            highlighted: string;
        };
        jobTitle: {
            members: TeamMember[];
        }[];
    };
    ourCultureActionModal: any;
}

const TeamGreenPage = () => {
    const router = useRouter();
    const [teamGreenData, setTeamGreenData] = useState<TeamGreenData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamGreenData();
    }, []);

    const fetchTeamGreenData = async () => {
        try {
            const result = await apiClient.get('/api/empower/team-green');
            if (result.success) {
                setTeamGreenData(result.data);
            }
        } catch (error: any) {
            console.error('Fetch team green data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (jobTitleIndex: number, memberIndex: number) => {
        if (!teamGreenData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Delete this team member? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const updatedJobTitles = [...teamGreenData.meetTeam.jobTitle];
                updatedJobTitles[jobTitleIndex].members = updatedJobTitles[jobTitleIndex].members.filter((_, index) => index !== memberIndex);

                const updatedMeetTeam = {
                    ...teamGreenData.meetTeam,
                    jobTitle: updatedJobTitles
                };

                const payload = {
                    id: teamGreenData.id,
                    mainPage: teamGreenData.mainPage,
                    whoWeAreModal: teamGreenData.whoWeAreModal,
                    ourLeadershipPhilosophy: teamGreenData.ourLeadershipPhilosophy,
                    meetTeam: updatedMeetTeam,
                    ourCultureActionModal: teamGreenData.ourCultureActionModal
                };

                const updateResult = await apiClient.put('/api/empower/team-green', payload);
                if (updateResult.success) {
                    Swal.fire('Deleted!', 'Team member has been deleted.', 'success');
                    fetchTeamGreenData();
                } else {
                    Swal.fire('Error', updateResult.error || 'Failed to delete team member', 'error');
                }
            } catch (error: any) {
                console.error('Delete team member error:', error);
                Swal.fire('Error', error.message || 'Failed to delete team member', 'error');
            }
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'view' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'view' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Team Green</h5>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => router.push('/empower/team-green/edit-main-page')}
                            className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit Main Page
                        </button>
                        <button
                            onClick={() => router.push('/empower/team-green/edit-who-we-are')}
                            className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit Who We Are
                        </button>
                        <button
                            onClick={() => router.push('/empower/team-green/edit-leadership-philosophy')}
                            className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit Leadership
                        </button>
                        <button
                            onClick={() => router.push('/empower/team-green/edit-culture-action')}
                            className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit Culture
                        </button>
                        <button
                            onClick={() => router.push('/empower/team-green/edit-meet-team')}
                            className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit Meet Team
                        </button>
                        <button
                            onClick={() => router.push('/empower/team-green/add-member')}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-5 h-5 mr-2" />
                            Add Team Member
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Main Page Info */}
                        {teamGreenData?.mainPage && (teamGreenData.mainPage.title || teamGreenData.mainPage.subHeadline) ? (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                {teamGreenData.mainPage.title && (
                                    <h3 className="text-lg font-semibold mb-2">{teamGreenData.mainPage.title}</h3>
                                )}
                                {teamGreenData.mainPage.subHeadline && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{teamGreenData.mainPage.subHeadline}</p>
                                )}
                                {(teamGreenData.mainPage.description.text || teamGreenData.mainPage.description.highlighted) && (
                                    <div className="text-sm mb-2">
                                        {teamGreenData.mainPage.description.text} {teamGreenData.mainPage.description.highlighted && <span className="font-semibold">{teamGreenData.mainPage.description.highlighted}</span>}
                                    </div>
                                )}
                                {(teamGreenData.mainPage.quote1.text || teamGreenData.mainPage.quote2.text) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {teamGreenData.mainPage.quote1.text && (
                                            <div className="text-sm italic">
                                                Quote 1: "{teamGreenData.mainPage.quote1.text}" {teamGreenData.mainPage.quote1.highlighted && <span className="font-semibold">- {teamGreenData.mainPage.quote1.highlighted}</span>}
                                            </div>
                                        )}
                                        {teamGreenData.mainPage.quote2.text && (
                                            <div className="text-sm italic">
                                                Quote 2: "{teamGreenData.mainPage.quote2.text}" {teamGreenData.mainPage.quote2.highlighted && <span className="font-semibold">- {teamGreenData.mainPage.quote2.highlighted}</span>}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {teamGreenData.mainPage.cta.length > 0 && (
                                    <div className="flex gap-2 mt-4">
                                        {teamGreenData.mainPage.cta.map((cta, index) => (
                                            cta.text && cta.href && (
                                                <a 
                                                    key={index}
                                                    href={cta.href}
                                                    className="btn btn-sm btn-outline-primary"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {cta.text}
                                                </a>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                <p className="text-gray-500">No main page content available. Click "Edit Main Page" to add content.</p>
                            </div>
                        )}

                        {/* Key Features */}
                        {teamGreenData?.mainPage?.keys && teamGreenData.mainPage.keys.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-4">Key Features</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {teamGreenData.mainPage.keys.map((key, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                            <h5 className="font-semibold mb-2">{key.title}</h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{key.description}</p>
                                            {key.button.text && (
                                                <a 
                                                    href={key.button.href}
                                                    className="btn btn-sm btn-primary bg-green-600 hover:bg-green-700"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {key.button.text}
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Team Members */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold">Meet Our Team</h4>
                            </div>
                            
                            {teamGreenData?.meetTeam && (teamGreenData.meetTeam.title || teamGreenData.meetTeam.description || teamGreenData.meetTeam.quote.text1) ? (
                                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    {teamGreenData.meetTeam.title && (
                                        <h5 className="font-semibold mb-2">{teamGreenData.meetTeam.title}</h5>
                                    )}
                                    {teamGreenData.meetTeam.description && (
                                        <p className="text-sm mb-2">{teamGreenData.meetTeam.description}</p>
                                    )}
                                    {(teamGreenData.meetTeam.quote.text1 || teamGreenData.meetTeam.quote.text2) && (
                                        <div className="text-sm italic">
                                            "{teamGreenData.meetTeam.quote.text1} {teamGreenData.meetTeam.quote.text2}" {teamGreenData.meetTeam.quote.highlighted && <span className="font-semibold">- {teamGreenData.meetTeam.quote.highlighted}</span>}
                                        </div>
                                    )}
                                </div>
                            ) : null}

                                {teamGreenData?.meetTeam?.jobTitle?.map((jobTitle, jobIndex) => (
                                    <div key={jobIndex} className="mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {jobTitle.members.map((member, memberIndex) => (
                                                <div key={memberIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                                    {member.img.src && (
                                                        <img 
                                                            src={member.img.src} 
                                                            alt={member.img.alt}
                                                            className="w-full h-48 object-cover"
                                                        />
                                                    )}
                                                    <div className="p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-lg font-semibold">{member.name}</h3>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{member.designation}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteMember(jobIndex, memberIndex)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Delete Member"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                            {teamGreenData?.meetTeam?.jobTitle && teamGreenData.meetTeam.jobTitle.length > 0 && teamGreenData.meetTeam.jobTitle.some(jt => jt.members.length > 0) ? null : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">No team members available. Add your first team member!</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default TeamGreenPage;