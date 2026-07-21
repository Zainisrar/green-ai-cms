// src/db/schema.ts
import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

//
// 1️⃣ Roles Table
//
export type RolePermission = {
    view: boolean;
    edit: boolean;
    delete: boolean;
};

export const roles = pgTable('roles', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    permissions: jsonb('permissions')
        .$type<Record<string, RolePermission>>()
        .default(sql`'{}'::jsonb`),
});

//
// 2️⃣ Users Table
//
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    image: text('image'),
    roleId: integer('role_id').references(() => roles.id),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 3️⃣ Navigation Table (Self-Referencing)
//
export const navigation = pgTable('navigation', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    top: boolean('top').default(false),
    accessor: text('accessor'), // For top-level items
    accesor: text('accesor'), // For nested items (handles typo in data)
    image: jsonb('image').$type<{ src: string; alt: string } | null>(),
    text: jsonb('text').$type<{ description: string; highlighted: string } | null>(),
    // 👇 Lazy self-reference: wrap in a function with explicit return type
    parentId: integer('parent_id').references((): any => navigation.id, { onDelete: 'cascade' }),
});

//
// 4️⃣ Insights Table
//
export type InsightKey = {
    icon: string;
    text: string;
};

export type InsightCTA = {
    text: string;
    link: string;
};

export const insights = pgTable('insights', {
    id: serial('id').primaryKey(),
    headline: text('headline').notNull(),
    subheadline: text('subheadline').notNull(),
    highlighted: text('highlighted').notNull(),
    description: text('description').notNull(),
    bgImg: text('bg_img').notNull(),
    keys: jsonb('keys').$type<InsightKey[]>().notNull(),
    cta1: jsonb('cta1').$type<InsightCTA>().notNull(),
    cta2: jsonb('cta2').$type<InsightCTA>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 5️⃣ Insight Details Table
//
export type NavItem = {
    name: string;
    link: string;
};

export type NavigationProps = {
    items: NavItem[];
};

export type Keypoint = {
    icon: string;
    text: string;
};

export const insightDetails = pgTable('insight_details', {
    id: serial('id').primaryKey(),
    bgImg: text('bg_img').notNull(), // Regular image path
    backgroundImg: text('background_img'), // CSS background class
    nav: jsonb('nav').$type<NavigationProps>().notNull(),
    title: text('title').notNull(),
    sub: text('sub').notNull(), // subheadline
    desc: text('desc').notNull(), // description
    name1: text('name1').notNull(),
    name2: text('name2').notNull(),
    cardTitle: text('card_title').notNull(),
    keys: jsonb('keys').$type<Keypoint[]>().notNull(), // keypoints
    slug: text('slug').unique(), // URL slug (optional)
    imageDirection: text('image_direction', { enum: ['left', 'right'] }).notNull().default('left'), // Image direction
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 6️⃣ Home Table
//
export type TextSection = {
    headline: string;
    description?: string;
};

export const home = pgTable('home', {
    id: serial('id').primaryKey(),
    text1: jsonb('text1').$type<TextSection>().notNull(),
    text2: jsonb('text2').$type<TextSection>().notNull(),
    text3: jsonb('text3').$type<TextSection>().notNull(),
    text4: jsonb('text4').$type<TextSection>().notNull(),
    text5: jsonb('text5').$type<TextSection>().notNull(),
    slug: text('slug').notNull(), // "/home/{dynamic}"
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 7️⃣ Expertise Table
//
export type ExpertiseImage = {
    src: string;
    alt: string;
};

export type ExpertiseIcon = {
    img: ExpertiseImage;
    title: string;
    description: string;
};

export type ExpertiseCarousel = {
    img: ExpertiseImage;
};

export type ExpertiseKey = {
    text: string;
};

export const expertise = pgTable('expertise', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull(),
    highlighted: text('highlighted').notNull(),
    description: text('description').notNull(),
    image: text('image').notNull(),
    slug: text('slug').notNull(), // "/expertise/{title}"
    highlightedTitle: text('highlighted_title').notNull(),
    subtitlePage: text('subtitle_page').notNull(),
    descriptionPage: text('description_page').notNull(),
    icons: jsonb('icons').$type<ExpertiseIcon[]>().notNull(),
    carousel: jsonb('carousel').$type<ExpertiseCarousel[]>().notNull(),
    keys: jsonb('keys').$type<ExpertiseKey[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 8️⃣ Energy Table
//
export type EnergyService = {
    title: string;
    description: string;
    shortDescription: string;
    keys: { text: string }[];
};

export type EnergyCTA = {
    text: string;
    href: string;
};

export const energy = pgTable('energy', {
    id: serial('id').primaryKey(),
    service1: jsonb('service1').$type<EnergyService>().notNull(),
    service2: jsonb('service2').$type<EnergyService>().notNull(),
    service3: jsonb('service3').$type<EnergyService>().notNull(),
    service4: jsonb('service4').$type<EnergyService>().notNull(),
    headline: text('headline').notNull(),
    subheadline: text('subheadline').notNull(),
    cta: jsonb('cta').$type<EnergyCTA>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 9️⃣ Explore About Us Table
//
export const exploreAboutUs = pgTable('explore_about_us', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    key: text('key').notNull().unique(), // Unique identifier for the content
    content: jsonb('content').$type<string>().notNull(), // HTML content as JSON string
    quote: jsonb('quote').$type<string>().notNull(), // HTML quote as JSON string
    bgImg: text('bg_img').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 🔟 Explore Why Green Table
//
export type ExploreWhyGreenKey = {
    text: string;
};

export type ExploreWhyGreenIcon = {
    text: string;
    img: {
        src: string;
        alt: string;
    };
    description: string;
};

export const exploreWhyGreen = pgTable('explore_why_green', {
    id: serial('id').primaryKey(),
    key: jsonb('key').$type<ExploreWhyGreenKey>().notNull(),
    content: jsonb('content').$type<string>().notNull(), // HTML content as JSON string
    icons: jsonb('icons').$type<ExploreWhyGreenIcon[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 1️⃣1️⃣ Fast Fact Stats Table
//
export type FastFactIcon = {
    src: string;
    alt: string;
};

export type FastFactBlockContent = {
    data: Record<string, string | number>;
    note: string;
};

export type FastFactBlock = {
    title: string;
    icon: FastFactIcon;
    content: FastFactBlockContent;
};

export type FastFactSection = {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    blocks: FastFactBlock[];
};

export type ImpactCard = {
    title: string;
    subtitle: string;
    details: string;
};

export type ImpactCTA = {
    text: string;
    link: string;
};

export type ImpactQuote = {
    headline: string;
    description: string;
};

export type ImpactSummarySection = {
    id: string;
    cards: ImpactCard[];
    cta: ImpactCTA[];
    quote: ImpactQuote;
};

export type FastFactStatsSection = FastFactSection | ImpactSummarySection;

export type FastFactStatsData = {
    sections: FastFactStatsSection[];
};

export const exploreFastFactStats = pgTable('explore_fast_fact_stats', {
    id: serial('id').primaryKey(),
    sections: jsonb('sections').$type<FastFactStatsSection[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 1️⃣2️⃣ Evolution Our Story Milestone Table
//
export type OurStoryMilestoneMap = {
    activeImg: string;
    secondaryImg: string;
};

export type OurStoryMilestone = {
    title: string;
    maps: OurStoryMilestoneMap;
};

export type EvolutionOurStoryMilestoneData = {
    key: string;
    title: string;
    description: string;
    ourMilestone: OurStoryMilestone;
};

export const evolutionOurStoryMilestone = pgTable('evolution_our_story_milestone', {
    id: serial('id').primaryKey(),
    key: text('key').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    ourMilestone: jsonb('our_milestone').$type<OurStoryMilestone>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 1️⃣3️⃣ Evolution Vision Mission Table
//
export type VisionMissionIcon = {
    src: string;
    alt: string;
};

export type VisionMissionContent = {
    description: string;
    quote: string;
};

export type VisionMissionBlock = {
    title: string;
    icon: VisionMissionIcon;
    content: VisionMissionContent;
};

export type VisionMissionFooter = {
    text: string;
};

export type VisionMissionSection = {
    id: string;
    title: string;
    blocks: VisionMissionBlock[];
    footer: VisionMissionFooter;
};

export type EvolutionVisionMissionData = {
    sections: VisionMissionSection[];
};

export const evolutionVisionMission = pgTable('evolution_vision_mission', {
    id: serial('id').primaryKey(),
    sections: jsonb('sections').$type<VisionMissionSection[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 1️⃣4️⃣ Evolution Leadership Team Table
//
export type LeadershipTeamImage = {
    src: string;
    alt: string;
};

export type LeadershipTeamMember = {
    name: string;
    designation: string;
    img: LeadershipTeamImage;
};

export type LeadershipTeamSection = {
    id: string;
    title: string;
    members: LeadershipTeamMember[];
};

export type EvolutionLeadershipTeamData = {
    sections: LeadershipTeamSection[];
};

export const evolutionLeadershipTeam = pgTable('evolution_leadership_team', {
    id: serial('id').primaryKey(),
    sections: jsonb('sections').$type<LeadershipTeamSection[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 1️⃣5️⃣ Explore Global Snapshot Table
//
export type GlobalSnapshotIcon = {
    type: 'image';
    src: string;
    alt: string;
    position?: 'left' | 'right';
};

export type GlobalSnapshotTitle = {
    main: string;
    highlight: string;
    text?: string;
};

export type GlobalSnapshotHeroSection = {
    id: string;
    type: 'hero-section';
    title: GlobalSnapshotTitle;
    subtitle: string;
    headline: string;
    description: string[];
};

export type GlobalSnapshotStatItem = {
    icon: GlobalSnapshotIcon;
    value: string;
    label: string;
};

export type GlobalSnapshotStatisticsGrid = {
    id: string;
    type: 'statistics-grid';
    items: GlobalSnapshotStatItem[];
};

export type GlobalSnapshotHighlightBox = {
    id: string;
    type: 'highlight-box';
    content: {
        lines: string[];
        style: string;
    };
};

export type GlobalSnapshotFeature = {
    icon: GlobalSnapshotIcon;
    text: string;
};

export type GlobalSnapshotContentBlock = {
    id: string;
    type: 'content-block';
    title: GlobalSnapshotTitle;
    features: GlobalSnapshotFeature[];
};

export type GlobalSnapshotLocationsSection = {
    id: string;
    type: 'locations-section';
    title: string;
    locations: string[];
    description: string;
    highlight: string;
};

export type GlobalSnapshotButton = {
    text: string;
    type?: 'primary' | 'secondary';
    link?: string;
    style?: string;
    icon?: GlobalSnapshotIcon;
};

export type GlobalSnapshotActionButtons = {
    id: string;
    type: 'action-buttons';
    buttons: GlobalSnapshotButton[];
};

export type GlobalSnapshotSection =
    | GlobalSnapshotHeroSection
    | GlobalSnapshotStatisticsGrid
    | GlobalSnapshotHighlightBox
    | GlobalSnapshotContentBlock
    | GlobalSnapshotLocationsSection
    | GlobalSnapshotActionButtons;

export type GlobalSnapshotData = {
    sections: GlobalSnapshotSection[];
};

export const exploreGlobalSnapshot = pgTable('explore_global_snapshot', {
    id: serial('id').primaryKey(),
    sections: jsonb('sections').$type<GlobalSnapshotSection[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 5️⃣ Relations
//
export const usersRelations = relations(users, ({ one, many }) => ({
    role: one(roles, {
        fields: [users.roleId],
        references: [roles.id],
    }),
    sessions: many(userSessions),
    notifications: many(userNotifications),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
    users: many(users),
}));

export const navigationRelations = relations(navigation, ({ one, many }) => ({
    parent: one(navigation, {
        fields: [navigation.parentId],
        references: [navigation.id],
    }),
    children: many(navigation),
}));

//
// 1️⃣6️⃣ Evolution Certifications Accreditations Table
//
export type CertificationsAccreditationsImage = {
    src: string;
    alt: string;
};

export type ESGPoint = {
    text: string;
};

export type ESGSection = {
    heading: string;
    description: string;
    points: string[];
};

export type Certificate = {
    name: string;
    year: string;
    title: string;
    description: string;
};

export type CertificateImage = {
    src: string;
    alt: string;
};

export type ISOSection = {
    heading: string;
    description: string;
    certificate1: CertificateImage;
    certificate2: CertificateImage;
    certificate3: CertificateImage;
    certificate4: CertificateImage;
    certificates: Certificate[];
};

export type CleanEnergySection = {
    heading: string;
    description: string;
    logo: CertificationsAccreditationsImage;
};

export type CertificationsAccreditationsCTA = {
    text: string;
    link: string;
};

export type CertificationsAccreditationsData = {
    title: string;
    tagline: string;
    esgSection: ESGSection;
    isoSection: ISOSection;
    cleanEnergySection: CleanEnergySection;
    cta: CertificationsAccreditationsCTA;
};

export const evolutionCertificationsAccreditations = pgTable('evolution_certifications_accreditations', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    tagline: text('tagline').notNull(),
    esgSection: jsonb('esg_section').$type<ESGSection>().notNull(),
    isoSection: jsonb('iso_section').$type<ISOSection>().notNull(),
    cleanEnergySection: jsonb('clean_energy_section').$type<CleanEnergySection>().notNull(),
    cta: jsonb('cta').$type<CertificationsAccreditationsCTA>().default({ text: '', link: '' }),
    certificate1: text('certificate1').default(''),
    certificate2: text('certificate2').default(''),
    certificate3: text('certificate3').default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 1️⃣7️⃣ Evolution Sustainability ESG Commitments Table
//
export type SustainabilityESGIcon = {
    src: string;
    alt: string;
};

export type SustainabilityESGSection = {
    id: string;
    heading: string;
    icon: SustainabilityESGIcon;
    points: string[];
};

export type SustainabilityESGHeader = {
    title: string;
    subtitle: string;
};

export type SustainabilityESGQuote = {
    text: string;
    attribution: string | null;
};

export type SustainabilityESGCallToAction = {
    text: string;
    href?: string;
};

export type SustainabilityESGData = {
    header: SustainabilityESGHeader;
    sections: SustainabilityESGSection[];
    quote: SustainabilityESGQuote;
    tagline: string;
    callToActions: SustainabilityESGCallToAction[];
};

export const evolutionSustainabilityESG = pgTable('evolution_sustainability_esg', {
    id: serial('id').primaryKey(),
    header: jsonb('header').$type<SustainabilityESGHeader>().notNull(),
    sections: jsonb('sections').$type<SustainabilityESGSection[]>().notNull(),
    quote: jsonb('quote').$type<SustainabilityESGQuote>().notNull(),
    tagline: text('tagline').notNull(),
    callToActions: jsonb('call_to_actions').$type<SustainabilityESGCallToAction[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 1️⃣8️⃣ Engineering Solar EPCM Services Table
//
export type SolarEPCMHeader = {
    title: string;
    subtitle: string;
};

export type SolarEPCMIntroduction = {
    text: string;
};

export type SolarEPCMService = {
    id: string;
    heading: string;
    points: string[];
};

export type SolarEPCMQuote = {
    text: string;
    attribution: string;
};

export type SolarEPCMTagline = {
    text: string;
};

export type SolarEPCMCallToAction = {
    text: string;
    href: string;
};

export type SolarEPCMData = {
    header: SolarEPCMHeader;
    introduction: SolarEPCMIntroduction;
    services: SolarEPCMService[];
    quote: SolarEPCMQuote;
    tagline: SolarEPCMTagline;
    callToActions: SolarEPCMCallToAction[];
};

export const engineeringSolarEPCM = pgTable('engineering_solar_epcm', {
    id: serial('id').primaryKey(),
    header: jsonb('header').$type<SolarEPCMHeader>().notNull(),
    introduction: jsonb('introduction').$type<SolarEPCMIntroduction>().notNull(),
    services: jsonb('services').$type<SolarEPCMService[]>().notNull(),
    quote: jsonb('quote').$type<SolarEPCMQuote>().notNull(),
    tagline: jsonb('tagline').$type<SolarEPCMTagline>().notNull(),
    callToActions: jsonb('call_to_actions').$type<SolarEPCMCallToAction[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 1️⃣9️⃣ Engineering Hybrid Microgrid Solutions Table
//
export type HybridMicrogridHeader = {
    title: string;
    subtitle: string;
    description: string;
};

export type HybridMicrogridSolution = {
    id: string;
    heading: string;
    points: string[];
};

export type HybridMicrogridUseCases = {
    heading: string;
    items: string[];
};

export type HybridMicrogridStatement = {
    text: string;
};

export type HybridMicrogridQuote = {
    text: string;
    attribution: string;
};

export type HybridMicrogridCallToAction = {
    text: string;
    href: string;
};

export type HybridMicrogridData = {
    header: HybridMicrogridHeader;
    solutions: HybridMicrogridSolution[];
    useCases: HybridMicrogridUseCases;
    statement: HybridMicrogridStatement;
    quote: HybridMicrogridQuote;
    callToActions: HybridMicrogridCallToAction[];
};

export const engineeringHybridMicrogrid = pgTable('engineering_hybrid_microgrid', {
    id: serial('id').primaryKey(),
    header: jsonb('header').$type<HybridMicrogridHeader>().notNull(),
    solutions: jsonb('solutions').$type<HybridMicrogridSolution[]>().notNull(),
    useCases: jsonb('use_cases').$type<HybridMicrogridUseCases>().notNull(),
    statement: jsonb('statement').$type<HybridMicrogridStatement>().notNull(),
    quote: jsonb('quote').$type<HybridMicrogridQuote>().notNull(),
    callToActions: jsonb('call_to_actions').$type<HybridMicrogridCallToAction[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 2️⃣0️⃣ Engineering Energy Storage Smart Grid Table
//
export type EnergyStorageHeader = {
    title: string;
    subtitle: string;
    description: string;
};

export type EnergyStorageArchitectureItem = {
    title: string;
    description: string;
};

export type EnergyStorageArchitecture = {
    heading: string;
    items: EnergyStorageArchitectureItem[];
};

export type EnergyStorageQuote = {
    text: string;
};

export type EnergyStorageStatement = {
    heading: string;
    description: string;
};

export type EnergyStorageCallToAction = {
    text: string;
    href: string;
};

export type EnergyStorageSmartGridData = {
    header: EnergyStorageHeader;
    architecture: EnergyStorageArchitecture;
    quote: EnergyStorageQuote;
    statement: EnergyStorageStatement;
    callToActions: EnergyStorageCallToAction[];
};

export const engineeringEnergyStorageSmartGrid = pgTable('engineering_energy_storage_smart_grid', {
    id: serial('id').primaryKey(),
    header: jsonb('header').$type<EnergyStorageHeader>().notNull(),
    architecture: jsonb('architecture').$type<EnergyStorageArchitecture>().notNull(),
    quote: jsonb('quote').$type<EnergyStorageQuote>().notNull(),
    statement: jsonb('statement').$type<EnergyStorageStatement>().notNull(),
    callToActions: jsonb('call_to_actions').$type<EnergyStorageCallToAction[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 2️⃣1️⃣ Engineering O&M Monitoring Table
//
export type OMMonitoringHeader = {
    title: string;
    subtitle: string;
    description: string;
};

export type OMMonitoringPhilosophyItem = {
    title: string;
    description: string;
};

export type OMMonitoringPhilosophy = {
    heading: string;
    items: OMMonitoringPhilosophyItem[];
};

export type OMMonitoringWhyMatters = {
    heading: string;
    points: string[];
};

export type OMMonitoringServiceItem = {
    title: string;
    description: string;
};

export type OMMonitoringServices = {
    items: OMMonitoringServiceItem[];
};

export type OMMonitoringCallToAction = {
    text: string;
    href: string;
};

export type OMMonitoringData = {
    header: OMMonitoringHeader;
    philosophy: OMMonitoringPhilosophy;
    whyMatters: OMMonitoringWhyMatters;
    services: OMMonitoringServices;
    callToActions: OMMonitoringCallToAction[];
};

export const engineeringOMMonitoring = pgTable('engineering_om_monitoring', {
    id: serial('id').primaryKey(),
    header: jsonb('header').$type<OMMonitoringHeader>().notNull(),
    philosophy: jsonb('philosophy').$type<OMMonitoringPhilosophy>().notNull(),
    whyMatters: jsonb('why_matters').$type<OMMonitoringWhyMatters>().notNull(),
    services: jsonb('services').$type<OMMonitoringServices>().notNull(),
    callToActions: jsonb('call_to_actions').$type<OMMonitoringCallToAction[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 2️⃣2️⃣ Engineering Grid Intel Table
//
export type GridIntelImage = {
    src: string;
    alt: string;
};

export type GridIntelFeature = {
    icon: GridIntelImage;
    text: string;
};

// Main Page Sections
export type EnergyIntelligencePlatform = {
    title: string;
    features: string[];
};

export type EnergyYouCanCountOn = {
    title: string;
    subtitle: string;
    description: string;
};

export type BuiltForIntelligence = {
    title: string;
    subtitle: string;
    runSmarter: string;
    operateWithConfidence: string;
    scaleWithoutUncertainty: string;
};

export type GridIntelCTA = {
    text: string;
    href: string;
    icon?: string;
};

export type GridIntelMainPage = {
    title: string;
    subtitle: string;
    description: string;
    heroImage: GridIntelImage;
    tagline: string;
    features: GridIntelFeature[];
    energyIntelligencePlatform: EnergyIntelligencePlatform;
    energyYouCanCountOn: EnergyYouCanCountOn;
    builtForIntelligence: BuiltForIntelligence;
    ctaButtons: GridIntelCTA[];
};

// Modal 1: Product Integration
export type ProductIntegrationItem = {
    icon: GridIntelImage;
    title: string;
    description: string;
};

export type ProductIntegrationModal = {
    title: string;
    subtitle: string;
    description: string;
    image: GridIntelImage;
    items: ProductIntegrationItem[];
    tagline: string;
};

// Modal 2: Technology Stack Overview
export type TechnologyStackFeature = {
    icon: GridIntelImage;
    text: string;
};

export type TechnologyStackModal = {
    title: string;
    subtitle: string;
    description: string;
    image: GridIntelImage;
    features: TechnologyStackFeature[];
};

// Modal 3: Built for These Scenarios
export type ScenarioItem = {
    icon: GridIntelImage;
    text: string;
};

export type ScenariosModal = {
    title: string;
    subtitle: string;
    description: string;
    image: GridIntelImage;
    scenarios: ScenarioItem[];
    tagline: string;
};

// Modal 4: Why Grid-Intel is Different
export type ComparisonFeature = {
    feature: string;
    gridIntel: string;
    conventional: string;
};

export type WhyDifferentModal = {
    title: string;
    subtitle: string;
    description: string;
    comparisonTable: ComparisonFeature[];
};

// Modal 5: What Grid-Intel Solves
export type SolutionItem = {
    icon: GridIntelImage;
    title: string;
    description: string;
};

export type WhatSolvesModal = {
    title: string;
    subtitle: string;
    description: string;
    solutions: SolutionItem[];
    tagline: string;
};

// Modal 6: The Challenge
export type ChallengeItem = {
    icon: GridIntelImage;
    text: string;
};

export type ChallengeModal = {
    title: string;
    subtitle: string;
    description: string;
    image: GridIntelImage;
    challenges: ChallengeItem[];
    resultText: string;
};

export type GridIntelData = {
    mainPage: GridIntelMainPage;
    productIntegration: ProductIntegrationModal;
    technologyStack: TechnologyStackModal;
    scenarios: ScenariosModal;
    whyDifferent: WhyDifferentModal;
    whatSolves: WhatSolvesModal;
    challenge: ChallengeModal;
};

export const engineeringGridIntel = pgTable('engineering_grid_intel', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<GridIntelMainPage>().notNull(),
    productIntegration: jsonb('product_integration').$type<ProductIntegrationModal>().notNull(),
    technologyStack: jsonb('technology_stack').$type<TechnologyStackModal>().notNull(),
    scenarios: jsonb('scenarios').$type<ScenariosModal>().notNull(),
    whyDifferent: jsonb('why_different').$type<WhyDifferentModal>().notNull(),
    whatSolves: jsonb('what_solves').$type<WhatSolvesModal>().notNull(),
    challenge: jsonb('challenge').$type<ChallengeModal>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 2️⃣3️⃣ Engineering Products Table
//
export type EngineeringProductImage = {
    src: string;
    alt: string;
};

export type EngineeringProductCTA = {
    text: string;
    href: string;
};

export type EngineeringProductKey = {
    icon: EngineeringProductImage;
    title: string;
    description: string;
};

export const engineeringProducts = pgTable('engineering_products', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    imgs: jsonb('imgs').$type<EngineeringProductImage[]>().notNull(),
    ctaButton: jsonb('cta_button').$type<EngineeringProductCTA>().notNull(),
    keys: jsonb('keys').$type<EngineeringProductKey[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 2️⃣4️⃣ Endeavors Projects Table
//
export const endeavorsProjects = pgTable('endeavors_projects', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    featuredImg: text('featured_img').default(''),
    numberofsystems: text('numberofsystems').default(''),
    noofdays: text('noofdays').default(''),
    totalgeneration: text('totalgeneration').default(''),
    battery: text('battery').default(''),
    coalA: text('coal_a').default(''),
    emissionreduction: text('emissionreduction').default(''),
    treesplanted: text('treesplanted').default(''),
    capacity: text('capacity').default(''),
    todateproduct: text('todateproduct').default(''),
    consumption: text('consumption').default(''),
    totalenergydaily: text('totalenergydaily').default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 2️⃣5️⃣ Endeavors Flagship Projects Table
//
export type FlagshipProjectImage = {
    src: string;
    alt: string;
};

export type FlagshipProjectIcon = {
    img: FlagshipProjectImage;
    title: string;
    description: string;
};

export type FlagshipProjectKey = {
    title: string;
    subtitle: string;
};

export type FlagshipProjectFooter = {
    title: string;
    subheadline: string;
};

export type FlagshipProjectCTA = {
    text: string;
    href: string;
};

export const endeavorsFlagshipProjects = pgTable('endeavors_flagship_projects', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    subheadline: text('subheadline').notNull(),
    key: jsonb('key').$type<FlagshipProjectKey>().notNull(),
    icons: jsonb('icons').$type<FlagshipProjectIcon[]>().notNull(),
    description: text('description').notNull(),
    footer: jsonb('footer').$type<FlagshipProjectFooter>().notNull(),
    cta: jsonb('cta').$type<FlagshipProjectCTA[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 2️⃣6️⃣ Enlighten Insights Articles Table
//
export type EnlightenArticleImage = {
    src: string;
    alt: string;
};

export type EnlightenArticleCTA = {
    text: string;
    href: string;
};

export type EnlightenArticleQuote = {
    text: string;
    highlighted: string;
};

export const enlightenInsightsArticles = pgTable('enlighten_insights_articles', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    slug: text('slug').notNull().unique(),
    featuredImg: jsonb('featured_img').$type<EnlightenArticleImage>().notNull(),
    cta: jsonb('cta')
        .$type<EnlightenArticleCTA>()
        .default(sql`'{"text":"","href":""}'::jsonb`),
    content: jsonb('content').$type<string>().notNull(), // JSON stringified Quill editor content
    quote: jsonb('quote').$type<EnlightenArticleQuote>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 2️⃣7️⃣ Enlighten Reports and Whitepapers Table
//
export type EnlightenReportImage = {
    src: string;
    alt: string;
};

export const enlightenReportsWhitepapers = pgTable('enlighten_reports_whitepapers', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull(),
    description: text('description'), // Optional description field
    featuredImg: jsonb('featured_img').$type<EnlightenReportImage | null>(),
    year: text('year').notNull(),
    pptx: text('pptx').notNull(), // File URL for PPTX/PDF upload
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 6️⃣ Inferred Types
//
export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Navigation = typeof navigation.$inferSelect;
export type Insight = typeof insights.$inferSelect;
export type InsightInsert = typeof insights.$inferInsert;
export type InsightDetail = typeof insightDetails.$inferSelect;
export type InsightDetailInsert = typeof insightDetails.$inferInsert;
export type Home = typeof home.$inferSelect;
export type HomeInsert = typeof home.$inferInsert;
export type Expertise = typeof expertise.$inferSelect;
export type ExpertiseInsert = typeof expertise.$inferInsert;
export type Energy = typeof energy.$inferSelect;
export type EnergyInsert = typeof energy.$inferInsert;
export type ExploreAboutUs = typeof exploreAboutUs.$inferSelect;
export type ExploreAboutUsInsert = typeof exploreAboutUs.$inferInsert;
export type ExploreWhyGreen = typeof exploreWhyGreen.$inferSelect;
export type ExploreWhyGreenInsert = typeof exploreWhyGreen.$inferInsert;
export type ExploreGlobalSnapshot = typeof exploreGlobalSnapshot.$inferSelect;
export type ExploreGlobalSnapshotInsert = typeof exploreGlobalSnapshot.$inferInsert;
export type ExploreFastFactStats = typeof exploreFastFactStats.$inferSelect;
export type ExploreFastFactStatsInsert = typeof exploreFastFactStats.$inferInsert;
export type EvolutionOurStoryMilestone = typeof evolutionOurStoryMilestone.$inferSelect;
export type EvolutionOurStoryMilestoneInsert = typeof evolutionOurStoryMilestone.$inferInsert;
export type EvolutionVisionMission = typeof evolutionVisionMission.$inferSelect;
export type EvolutionVisionMissionInsert = typeof evolutionVisionMission.$inferInsert;
export type EvolutionLeadershipTeam = typeof evolutionLeadershipTeam.$inferSelect;
export type EvolutionLeadershipTeamInsert = typeof evolutionLeadershipTeam.$inferInsert;
export type EvolutionCertificationsAccreditations = typeof evolutionCertificationsAccreditations.$inferSelect;
export type EvolutionCertificationsAccreditationsInsert = typeof evolutionCertificationsAccreditations.$inferInsert;
export type EvolutionSustainabilityESG = typeof evolutionSustainabilityESG.$inferSelect;
export type EvolutionSustainabilityESGInsert = typeof evolutionSustainabilityESG.$inferInsert;
export type EngineeringSolarEPCM = typeof engineeringSolarEPCM.$inferSelect;
export type EngineeringSolarEPCMInsert = typeof engineeringSolarEPCM.$inferInsert;
export type EngineeringHybridMicrogrid = typeof engineeringHybridMicrogrid.$inferSelect;
export type EngineeringHybridMicrogridInsert = typeof engineeringHybridMicrogrid.$inferInsert;
export type EngineeringEnergyStorageSmartGrid = typeof engineeringEnergyStorageSmartGrid.$inferSelect;
export type EngineeringEnergyStorageSmartGridInsert = typeof engineeringEnergyStorageSmartGrid.$inferInsert;
export type EngineeringOMMonitoring = typeof engineeringOMMonitoring.$inferSelect;
export type EngineeringOMMonitoringInsert = typeof engineeringOMMonitoring.$inferInsert;
export type EngineeringGridIntel = typeof engineeringGridIntel.$inferSelect;
export type EngineeringGridIntelInsert = typeof engineeringGridIntel.$inferInsert;
export type EngineeringProduct = typeof engineeringProducts.$inferSelect;
export type EngineeringProductInsert = typeof engineeringProducts.$inferInsert;
export type EndeavorsProject = typeof endeavorsProjects.$inferSelect;
export type EndeavorsProjectInsert = typeof endeavorsProjects.$inferInsert;
export type EndeavorsFlagshipProject = typeof endeavorsFlagshipProjects.$inferSelect;
export type EndeavorsFlagshipProjectInsert = typeof endeavorsFlagshipProjects.$inferInsert;
export type EnlightenInsightsArticle = typeof enlightenInsightsArticles.$inferSelect;
export type EnlightenInsightsArticleInsert = typeof enlightenInsightsArticles.$inferInsert;
export type EnlightenReportsWhitepaper = typeof enlightenReportsWhitepapers.$inferSelect;
export type EnlightenReportsWhitepaperInsert = typeof enlightenReportsWhitepapers.$inferInsert;

//
// 2️⃣8️⃣ Enlighten Events Webinars Table
//
export type EventImage = {
    src: string;
    alt: string;
};

export type EventCTA = {
    text: string;
    href: string;
};

export type UpcomingEvent = {
    title: string;
    description: string;
    featuredImg: EventImage;
    slug: string;
    year: string;
    location: string;
    cta: EventCTA;
};

export type EventsMainPage = {
    title: string;
    subHeadline: string;
    description: string;
    quote: {
        text: string;
        highlighted: string;
    };
    cta: EventCTA[];
};

export const enlightenEventsWebinars = pgTable('enlighten_events_webinars', {
    id: serial('id').primaryKey(),
    upcomingEvents: jsonb('upcoming_events').$type<UpcomingEvent[]>().notNull(),
    mainPage: jsonb('main_page').$type<EventsMainPage>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 2️⃣9️⃣ Enlighten Thought Leadership Table
//
export type EditorialImage = {
    src: string;
    alt: string;
};

export type EditorialCTA = {
    text: string;
    href: string;
};

export type Editorial = {
    title: string;
    description: string;
    featuredImg: EditorialImage;
    writer: number; // Reference to users table
    categories: string[];
    cta: EditorialCTA;
};

export type ThoughtLeadershipMainPage = {
    title: string;
    subTitle: string;
    description: string;
    editorialsTitle: string;
    quote: {
        text: string;
        highlighted: string;
    };
    cta: EditorialCTA[];
};

export const enlightenThoughtLeadership = pgTable('enlighten_thought_leadership', {
    id: serial('id').primaryKey(),
    editorials: jsonb('editorials').$type<Editorial[]>().notNull(),
    mainPage: jsonb('main_page').$type<ThoughtLeadershipMainPage>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 3️⃣0️⃣ User Sessions Table (for JWT management)
//
export const userSessions = pgTable('user_sessions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

//
// 3️⃣1️⃣ User Notifications Table
//
export const userNotifications = pgTable('user_notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type').notNull(), // 'info', 'warning', 'error', 'success'
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

//
// Relations for new tables
//
export const userSessionsRelations = relations(userSessions, ({ one }) => ({
    user: one(users, {
        fields: [userSessions.userId],
        references: [users.id],
    }),
}));

export const userNotificationsRelations = relations(userNotifications, ({ one }) => ({
    user: one(users, {
        fields: [userNotifications.userId],
        references: [users.id],
    }),
}));

// Updated inferred types
export type EnlightenEventsWebinars = typeof enlightenEventsWebinars.$inferSelect;
export type EnlightenEventsWebinarsInsert = typeof enlightenEventsWebinars.$inferInsert;
export type EnlightenThoughtLeadership = typeof enlightenThoughtLeadership.$inferSelect;
export type EnlightenThoughtLeadershipInsert = typeof enlightenThoughtLeadership.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type UserSessionInsert = typeof userSessions.$inferInsert;
export type UserNotification = typeof userNotifications.$inferSelect;
export type UserNotificationInsert = typeof userNotifications.$inferInsert;

//
// 3️⃣2️⃣ Empower Team Green Table
//
export type TeamGreenImage = {
    src: string;
    alt: string;
};

export type TeamGreenCTA = {
    text: string;
    href: string;
};

export type TeamGreenButton = {
    text: string;
    href: string;
};

export type TeamGreenDescription = {
    text: string;
    highlighted: string;
};

export type TeamGreenQuote = {
    text: string;
    highlighted: string;
};

export type TeamGreenKey = {
    title: string;
    description: string;
    button: TeamGreenButton;
};

export type TeamGreenMainPage = {
    title: string;
    subHeadline: string;
    description: TeamGreenDescription;
    quote1: TeamGreenQuote;
    quote2: TeamGreenQuote;
    cta: TeamGreenCTA[];
    keys: TeamGreenKey[];
};

export type WhoWeAreModal = {
    title: string;
    description: string;
    img: TeamGreenImage & { highlighted: string };
    title2: string;
    description2: string;
    quote: TeamGreenQuote;
};

export type LeadershipIcon = {
    text: string;
    keys: string[];
    img: TeamGreenImage;
};

export type OurLeadershipPhilosophy = {
    title: string;
    description: string;
    icon: LeadershipIcon[];
    quote: TeamGreenQuote;
};

export type TeamMember = {
    name: string;
    designation: string;
    img: TeamGreenImage;
};

export type JobTitle = {
    members: TeamMember[];
};

export type MeetTeamQuote = {
    text1: string;
    text2: string;
    highlighted: string;
};

export type MeetTeam = {
    title: string;
    description: string;
    quote: MeetTeamQuote;
    jobTitle: JobTitle[];
};

export type CultureKey = {
    text: string;
    icon: string;
    img: TeamGreenImage;
};

export type OurCultureActionModal = {
    title: string;
    description: string;
    img: TeamGreenImage;
    keys: CultureKey[];
    quote: TeamGreenQuote;
};

export type TeamGreenData = {
    mainPage: TeamGreenMainPage;
    whoWeAreModal: WhoWeAreModal;
    ourLeadershipPhilosophy: OurLeadershipPhilosophy;
    meetTeam: MeetTeam;
    ourCultureActionModal: OurCultureActionModal;
};

export const empowerTeamGreen = pgTable('empower_team_green', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<TeamGreenMainPage>().notNull(),
    whoWeAreModal: jsonb('who_we_are_modal').$type<WhoWeAreModal>().notNull(),
    ourLeadershipPhilosophy: jsonb('our_leadership_philosophy').$type<OurLeadershipPhilosophy>().notNull(),
    meetTeam: jsonb('meet_team').$type<MeetTeam>().notNull(),
    ourCultureActionModal: jsonb('our_culture_action_modal').$type<OurCultureActionModal>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 3️⃣3️⃣ Enlighten Media Mentions Table
//
export type MediaMentionImage = {
    src: string;
    alt: string;
};

export type MediaMentionCTA = {
    text: string;
    href: string;
};

export type MediaMentionKey = {
    text: string;
    highlighted: string;
};

export type MediaMentionHighlight = {
    title: string;
    description: string;
    featuredImg: MediaMentionImage;
    video: string;
    year: string;
    datetime: string;
};

export type MediaMentionMainPage = {
    title: string;
    subHeadline: string;
    description: string;
    key: MediaMentionKey;
    cta: MediaMentionCTA[];
    recentHighlights: MediaMentionHighlight[];
};

export const enlightenMediaMentions = pgTable('enlighten_media_mentions', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<MediaMentionMainPage>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 3️⃣4️⃣ Empower Careers at Green Table
//
export type CareersImage = {
    src: string;
    alt: string;
};

export type CareersCTA = {
    text: string;
    href: string;
};

export type CareersDescription = {
    text: string;
    highlighted: string;
};

export type CareersQuote = {
    text: string;
    highlighted: string;
};

export type CareersKey = {
    text: string;
    cta: {
        text: string;
    };
};

export type CareersMainPage = {
    title: string;
    subHeadline: string;
    description: CareersDescription;
    quote1: CareersQuote;
    quote2: CareersQuote;
    keys: CareersKey[];
    cta: CareersCTA[];
};

export type WhyWorkWithGreenIcon = {
    img: CareersImage;
    title: string;
    description: string;
};

export type WhyWorkWithGreenQuote = {
    text1: string;
    text2: string;
    highlighted1: string;
    highlighted2?: string;
};

export type WhyWorkWithGreenModal = {
    title: string;
    description: string;
    icons: WhyWorkWithGreenIcon[];
    quote: WhyWorkWithGreenQuote;
};

export type CareerRole = {
    type: string;
    description: string;
};

export type CareerTrackSupport = {
    title: string;
    role: CareerRole[];
};

export type KeyPoint = {
    text1: string;
    text2: string;
};

export type WhatMakesGreenDifferent = {
    title: string;
    featuredImg: CareersImage;
    keyPoints: KeyPoint[];
};

export type OpenRole = {
    name: string;
    place: string;
    closing: string;
};

export type OpenRoles = {
    title: string;
    roles: OpenRole[];
};

export type CareersAtGreenData = {
    mainPage: CareersMainPage;
    whyWorkWithGreenModal: WhyWorkWithGreenModal;
    careerTrackSupport: CareerTrackSupport;
    whatMakesGreenDifferent: WhatMakesGreenDifferent;
    openRoles: OpenRoles;
};

export const empowerCareersAtGreen = pgTable('empower_careers_at_green', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<CareersMainPage>().notNull(),
    whyWorkWithGreenModal: jsonb('why_work_with_green_modal').$type<WhyWorkWithGreenModal>().notNull(),
    careerTrackSupport: jsonb('career_track_support').$type<CareerTrackSupport>().notNull(),
    whatMakesGreenDifferent: jsonb('what_makes_green_different').$type<WhatMakesGreenDifferent>().notNull(),
    openRoles: jsonb('open_roles').$type<OpenRoles>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EmpowerTeamGreen = typeof empowerTeamGreen.$inferSelect;
export type EmpowerTeamGreenInsert = typeof empowerTeamGreen.$inferInsert;
export type EnlightenMediaMention = typeof enlightenMediaMentions.$inferSelect;
export type EnlightenMediaMentionInsert = typeof enlightenMediaMentions.$inferInsert;
export type EmpowerCareersAtGreen = typeof empowerCareersAtGreen.$inferSelect;
export type EmpowerCareersAtGreenInsert = typeof empowerCareersAtGreen.$inferInsert;

//
// 3️⃣5️⃣ Empower Join Us Table
//
export type JoinUsImage = {
    src: string;
    alt: string;
};

export type JoinUsCTA = {
    text: string;
    href: string;
};

export type JoinUsQuote = {
    text: string;
    link: string;
};

export type JoinUsKeyItem = {
    text: string;
    description?: string;
};

export type JoinUsKey = {
    title: string;
    items: JoinUsKeyItem[];
};

export type JoinUsDataPolicyEthics = {
    title: string;
    description: string;
};

export type JoinUsContact = {
    text: string;
    href: string;
};

export type JoinUsData = {
    title: string;
    subHeadline: string;
    description: string;
    existingUsersCtaLink: string;
    newUsersCtaLink: string;
    quote: JoinUsQuote;
    cta: JoinUsCTA[];
    keys: JoinUsKey[];
    dataPolicyEthics: JoinUsDataPolicyEthics;
    email: JoinUsContact;
    phone: JoinUsContact;
};

export const empowerJoinUs = pgTable('empower_join_us', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    subHeadline: text('sub_headline').notNull(),
    description: text('description').notNull(),
    existingUsersCtaLink: text('existing_users_cta_link').notNull(),
    newUsersCtaLink: text('new_users_cta_link').notNull(),
    quote: jsonb('quote').$type<JoinUsQuote>().notNull(),
    cta: jsonb('cta').$type<JoinUsCTA[]>().notNull(),
    keys: jsonb('keys').$type<JoinUsKey[]>().notNull(),
    dataPolicyEthics: jsonb('data_policy_ethics').$type<JoinUsDataPolicyEthics>().notNull(),
    email: jsonb('email').$type<JoinUsContact>().notNull(),
    phone: jsonb('phone').$type<JoinUsContact>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EmpowerJoinUs = typeof empowerJoinUs.$inferSelect;
export type EmpowerJoinUsInsert = typeof empowerJoinUs.$inferInsert;

//
// 3️⃣6️⃣ Empower Green Talent Incubator Table
//
export type GreenTalentImage = {
    src: string;
    alt: string;
};

export type GreenTalentCTA = {
    text: string;
    href: string;
};

export type GreenTalentDescription = {
    text: string;
    headline: string;
};

export type GreenTalentQuote = {
    text: string;
    highlighted: string;
};

export type GreenTalentMainPage = {
    title: string;
    subHeadline: string;
    description: GreenTalentDescription;
    quote1: GreenTalentQuote;
    quote2: GreenTalentQuote;
    cta: GreenTalentCTA[];
};

// Modal Types
export type WhyWeBuiltThisModal = {
    title: string;
    description: string;
    key: {
        title: string;
        items: string[];
    };
    quote: GreenTalentQuote;
};

export type WhatWeOfferItem = {
    title: string;
    description: {
        text: string;
        highlighted: string;
    };
};

export type WhatWeOfferModal = {
    title: string;
    items: WhatWeOfferItem[];
};

export type OurModelTitle = {
    step1: string;
    step2: string;
    step3: string;
};

export type OurModelKey = {
    title: string;
    description: string;
};

export type OurModelModal = {
    title: OurModelTitle;
    description: string;
    key: OurModelKey[];
    quote: GreenTalentQuote;
};

export type GreenTalentPartnerKey = {
    title: string;
    description: string;
};

export type PartnerWithUsModal = {
    title: string;
    description: string;
    keys: GreenTalentPartnerKey[];
};

export type AlumniVoice = {
    text1: string;
    text2: string;
};

export type AlumniVoicesModal = {
    title: string;
    voices: AlumniVoice;
};

export type GreenTalentModals = {
    whyWeBuiltThis: WhyWeBuiltThisModal;
    whatWeOffer: WhatWeOfferModal;
    ourModel: OurModelModal;
    partnerWithUs: PartnerWithUsModal;
    alumniVoices: AlumniVoicesModal;
};

export type GreenTalentIncubatorData = {
    mainPage: GreenTalentMainPage;
    modals: GreenTalentModals;
};

export const empowerGreenTalentIncubator = pgTable('empower_green_talent_incubator', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<GreenTalentMainPage>().notNull(),
    modals: jsonb('modals').$type<GreenTalentModals>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EmpowerGreenTalentIncubator = typeof empowerGreenTalentIncubator.$inferSelect;
export type EmpowerGreenTalentIncubatorInsert = typeof empowerGreenTalentIncubator.$inferInsert;

//
// 3️⃣7️⃣ Empower Women in Energy Table
//
export type WomenInEnergyImage = {
    src: string;
    alt: string;
};

export type WomenInEnergyCTA = {
    text: string;
    href: string;
};

export type WomenInEnergyDescription = {
    text: string;
    highlighted: string;
};

export type WomenInEnergyQuote = {
    text: string;
    highlighted: string;
};

export type WomenInEnergyMainPage = {
    title: string;
    subHeadline: string;
    description: WomenInEnergyDescription;
    quote1: WomenInEnergyQuote;
    quote2: WomenInEnergyQuote;
    cta: WomenInEnergyCTA[];
};

// Modal Types
export type WhyThisMattersModal = {
    title: string;
    subHeadline: string;
    description: string;
    img: WomenInEnergyImage;
    keys: string[];
    quote: WomenInEnergyQuote;
};

export type InitiativesUnderwayProgram = {
    program: string;
    description: string;
};

export type InitiativesUnderwayModal = {
    title: string;
    subHeadline: string;
    key: InitiativesUnderwayProgram[];
    quote: WomenInEnergyQuote;
};

export type VoicesOfPowerItem = {
    img: WomenInEnergyImage;
    title: string;
    description: string;
};

export type VoicesOfPowerModal = {
    title: string;
    items: VoicesOfPowerItem[];
};

export type WomenInEnergyPartnerWithUsModal = {
    title: string;
    description: string;
    keys: string[];
    quote: WomenInEnergyQuote;
    img: WomenInEnergyImage;
};

export type WomenInEnergyModals = {
    whyThisMatters: WhyThisMattersModal;
    initiativesUnderway: InitiativesUnderwayModal;
    voicesOfPower: VoicesOfPowerModal;
    partnerWithUs: WomenInEnergyPartnerWithUsModal;
};

export type WomenInEnergyData = {
    mainPage: WomenInEnergyMainPage;
    modal: WomenInEnergyModals;
};

export const empowerWomenInEnergy = pgTable('empower_women_in_energy', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<WomenInEnergyMainPage>().notNull(),
    modal: jsonb('modal').$type<WomenInEnergyModals>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EmpowerWomenInEnergy = typeof empowerWomenInEnergy.$inferSelect;
export type EmpowerWomenInEnergyInsert = typeof empowerWomenInEnergy.$inferInsert;

//
// 3️⃣8️⃣ Empower Community Voices Table
//
export type CommunityVoicesImage = {
    src: string;
    alt: string;
};

export type CommunityVoicesCTA = {
    text: string;
    href: string;
};

export type CommunityVoicesDescription = {
    text: string;
    highlighted: string;
};

export type CommunityVoicesQuote1 = {
    text1: string;
    highlighted1: string;
    text2: string;
    highlighted2: string;
};

export type CommunityVoicesQuote2 = {
    text: string;
    highlighted: string;
};

export type CommunityVoicesModalItem = {
    img: CommunityVoicesImage;
    cta: string;
};

export type CommunityVoicesMainPage = {
    title: string;
    subHeadline: string;
    description: CommunityVoicesDescription;
    quote1: CommunityVoicesQuote1;
    quote2: CommunityVoicesQuote2;
    cta: CommunityVoicesCTA[]; // CHANGED: cta now an array
    modals: CommunityVoicesModalItem[];
};

// Modal Types
export type VoicesFromFieldItem = {
    img: CommunityVoicesImage;
    title: string;
    description: string;
};

export type VoicesFromFieldModal = {
    title: string;
    items: VoicesFromFieldItem[];
};

export type WhatMakesOurImpactDifferentKey = {
    title: string;
    items: string[];
};

export type WhatMakesOurImpactDifferentModal = {
    title: string;
    key1: WhatMakesOurImpactDifferentKey;
    key2: WhatMakesOurImpactDifferentKey;
};

export type CommunityVoicesModals = {
    voicesFromField: VoicesFromFieldModal;
    whatMakesOurImpactDifferent: WhatMakesOurImpactDifferentModal;
};

export type CommunityVoicesData = {
    mainPage: CommunityVoicesMainPage;
    modals: CommunityVoicesModals;
};

export const empowerCommunityVoices = pgTable('empower_community_voices', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<CommunityVoicesMainPage>().notNull(),
    modals: jsonb('modals').$type<CommunityVoicesModals>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EmpowerCommunityVoices = typeof empowerCommunityVoices.$inferSelect;
export type EmpowerCommunityVoicesInsert = typeof empowerCommunityVoices.$inferInsert;

//
// 3️⃣9️⃣ Engage Partner With Us Table
//
export type PartnerWithUsImage = {
    src: string;
    alt: string;
};

export type PartnerWithUsCTA = {
    text: string;
    href: string;
};

export type PartnerWithUsDescription = {
    text: string;
    highlighted: string;
};

export type PartnerWithUsQuote = {
    text: string;
    highlighted: string;
};

export type PartnerWithUsKey = {
    title: string;
    description: string;
    cta: string;
};

export type PartnerWithUsMainPage = {
    title: string;
    subHeadline: string;
    description: PartnerWithUsDescription;
    key: PartnerWithUsKey[];
    quote: PartnerWithUsQuote;
    img: PartnerWithUsImage;
    cta: PartnerWithUsCTA[];
};

// Modal Types
export type WhyGreenModal = {
    title: string;
    subHeadline: string;
    key: Array<{
        title: string;
        description: string;
    }>;
    quote: PartnerWithUsQuote;
};

export type PartnershipTypesModal = {
    title: string;
    subHeadline: string;
    keys: Array<{
        icon: PartnerWithUsImage;
        title: string;
        description: string;
    }>;
};

export type WhatYouCanExpectModal = {
    title: string;
    subHeadline: string;
    keys: string[];
};

export type AbortionChannelsModal = {
    title: string;
    subHeadline: string;
    key1: {
        title: string;
        items: string[];
    };
    key2: {
        title: string;
        items: string[];
    };
};

export type TrustedByModal = {
    title: string;
    subHeadline: string;
    icons: PartnerWithUsImage[];
};

export type PartnerWithUsModals = {
    whyGreen: WhyGreenModal;
    partnerShipTypes: PartnershipTypesModal;
    whatYouCanExpect: WhatYouCanExpectModal;
    abortionChannels: AbortionChannelsModal;
    trustedBy: TrustedByModal;
};

export type PartnerWithUsData = {
    mainPage: PartnerWithUsMainPage;
    modal: PartnerWithUsModals;
};

export const engagePartnerWithUs = pgTable('engage_partner_with_us', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<PartnerWithUsMainPage>().notNull(),
    modal: jsonb('modal').$type<PartnerWithUsModals>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EngagePartnerWithUs = typeof engagePartnerWithUs.$inferSelect;
export type EngagePartnerWithUsInsert = typeof engagePartnerWithUs.$inferInsert;
//
// 4️⃣0️⃣ Engage Become a Supplier Table
//
export type BecomeSupplierImage = {
    src: string;
    alt: string;
};

export type BecomeSupplierCTA = {
    text: string;
    href: string;
};

export type BecomeSupplierDescription = {
    text: string;
    highlighted: string;
};

export type BecomeSupplierQuote = {
    text: string;
    highlighted: string;
};

export type BecomeSupplierMainPage = {
    title: string;
    subHeadline: string;
    description: BecomeSupplierDescription;
    quote1: BecomeSupplierQuote;
    quote2: BecomeSupplierQuote;
    cta: BecomeSupplierCTA[];
};

// Modal Types
export type WhatWeLookForModal = {
    title: string;
    headline: string;
    keys: string[];
    quote: BecomeSupplierQuote;
};

export type BecomeSupplierKeySupplyCategoriesModal = {
    title: string;
    headline: string;
    category: {
        title: string;
        items: string[];
    };
    examples: {
        title: string;
        items: string[];
    };
};

export type HowGetStartedStep = {
    step: string;
    action: string;
};

export type HowGetStartedModal = {
    title: string;
    items: HowGetStartedStep[];
};

export type BecomeSupplierModals = {
    whatWeLookFor: WhatWeLookForModal;
    keySupplyCategories: BecomeSupplierKeySupplyCategoriesModal;
    howGetStarted: HowGetStartedModal;
};

export type BecomeSupplierData = {
    mainPage: BecomeSupplierMainPage;
    modals: BecomeSupplierModals;
};

export const engageBecomeSupplier = pgTable('engage_become_supplier', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<BecomeSupplierMainPage>().notNull(),
    modals: jsonb('modals').$type<BecomeSupplierModals>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EngageBecomeSupplier = typeof engageBecomeSupplier.$inferSelect;
export type EngageBecomeSupplierInsert = typeof engageBecomeSupplier.$inferInsert;

//
// 4️⃣1️⃣ Engage Investor Relations Table
//
export type InvestorRelationsImage = {
    src: string;
    alt: string;
};

export type InvestorRelationsCTA = {
    text: string;
    href: string;
};

export type InvestorRelationsDescription = {
    text: string;
    highlighted: string;
};

export type InvestorRelationsQuote = {
    text: string;
    highlighted: string;
};

export type InvestorRelationsMainPage = {
    title: string;
    subHeadline: string;
    description: InvestorRelationsDescription;
    quote1: InvestorRelationsQuote;
    quote2: InvestorRelationsQuote;
    cta: InvestorRelationsCTA[];
};

// Modal Types
export type WhyInvestGreenKey = {
    icon: InvestorRelationsImage;
    text: string;
};

export type WhyInvestGreen = {
    title: string;
    headline: string;
    key: WhyInvestGreenKey[];
    quote: InvestorRelationsQuote;
};

export type InvestmentInstrumentsKey = {
    icon: InvestorRelationsImage;
    text: string;
};

export type InvestmentInstruments = {
    title: string;
    headline: string;
    key: InvestmentInstrumentsKey[];
    quote: InvestorRelationsQuote;
};

export type InvestmentFocusArea = {
    title: string;
    headline: string;
    focusArea: {
        items: string[];
    };
    capitalUse: {
        items: string[];
    };
    returnProfile: {
        items: string[];
    };
};

export type PerformanceSnapshots = {
    title: string;
    headline: string;
    metric: {
        items: string[];
    };
    value: {
        items: string[];
    };
};

export type InvestorRelationsData = {
    mainPage: InvestorRelationsMainPage;
    whyInvestGreen: WhyInvestGreen;
    investmentInstruments: InvestmentInstruments;
    investmentFocusArea: InvestmentFocusArea;
    performanceSnapshots: PerformanceSnapshots;
};

export const engageInvestorRelations = pgTable('engage_investor_relations', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<InvestorRelationsMainPage>().notNull(),
    whyInvestGreen: jsonb('why_invest_green').$type<WhyInvestGreen>().notNull(),
    investmentInstruments: jsonb('investment_instruments').$type<InvestmentInstruments>().notNull(),
    investmentFocusArea: jsonb('investment_focus_area').$type<InvestmentFocusArea>().notNull(),
    performanceSnapshots: jsonb('performance_snapshots').$type<PerformanceSnapshots>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EngageInvestorRelations = typeof engageInvestorRelations.$inferSelect;
export type EngageInvestorRelationsInsert = typeof engageInvestorRelations.$inferInsert;

//
// 4️⃣2️⃣ Engage Media Press Table
//
export type MediaPressImage = {
    src: string;
    alt: string;
};

export type MediaPressCTA = {
    text: string;
    href: string;
};

export type MediaPressDescription = {
    text: string;
    highlighted: string;
};

export type MediaPressQuote = {
    text: string;
    highlighted: string;
};

export type MediaPressMainPage = {
    title: string;
    subHeadline: string;
    description: MediaPressDescription;
    quote: MediaPressQuote;
    cta: MediaPressCTA[];
};

// Modal Types
export type PressReleaseItem = {
    img: MediaPressImage;
    title: string;
    date: string;
    datetime: string;
    cta: MediaPressCTA;
};

export type LatestPressReleases = {
    title: string;
    items: PressReleaseItem[];
};

export type MediaContactRequests = {
    title: string;
    contactType: string[];
    email: string[];
    phoneNumber: {
        src: string;
        text: string;
    };
    timings: string;
};

export type MediaKitItem = {
    src: string;
    title: string;
};

export type MediaKitDownload = {
    title: string;
    kits: MediaKitItem[];
};

export type GreenNewsItem = {
    title: string;
    description: string;
    cta: MediaPressCTA;
    img: MediaPressImage;
};

export type GreenNews = {
    title: string;
    items: GreenNewsItem[];
};

export type SpokesPerson = {
    img: MediaPressImage;
    title: string;
    video: string;
    member: {
        name: string;
        designation: string;
    };
};

export type OfficialSpokesPeople = {
    title: string;
    items: SpokesPerson[];
};

export type MediaPressData = {
    mainPage: MediaPressMainPage;
    latestPressReleases: LatestPressReleases;
    mediaContactRequests: MediaContactRequests;
    mediaKitDownload: MediaKitDownload;
    greenNews: GreenNews;
    officialSpokesPeople: OfficialSpokesPeople;
};

export const engageMediaPress = pgTable('engage_media_press', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<MediaPressMainPage>().notNull(),
    latestPressReleases: jsonb('latest_press_releases').$type<LatestPressReleases>().notNull(),
    mediaContactRequests: jsonb('media_contact_requests').$type<MediaContactRequests>().notNull(),
    mediaKitDownload: jsonb('media_kit_download').$type<MediaKitDownload>().notNull(),
    greenNews: jsonb('green_news').$type<GreenNews>().notNull(),
    officialSpokesPeople: jsonb('official_spokes_people').$type<OfficialSpokesPeople>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EngageMediaPress = typeof engageMediaPress.$inferSelect;
export type EngageMediaPressInsert = typeof engageMediaPress.$inferInsert;
//
// 4️⃣3️⃣ Engage Public Events Volunteering Table
//
export type PublicEventsVolunteeringImage = {
    src: string;
    alt: string;
};

export type PublicEventsVolunteeringCTA = {
    text: string;
    href: string;
};

export type PublicEventsVolunteeringDescription = {
    text: string;
    highlighted: string;
};

export type PublicEventsVolunteeringQuote = {
    text: string;
    highlighted: string;
};

export type PublicEventsVolunteeringMainPage = {
    title: string;
    subHeadline: string;
    description: PublicEventsVolunteeringDescription;
    quote: PublicEventsVolunteeringQuote;
    cta: PublicEventsVolunteeringCTA[];
};

// Modal Types
export type WhyWeEngageModal = {
    title: string;
    subHeadline: string;
    img: PublicEventsVolunteeringImage;
    quote: PublicEventsVolunteeringQuote;
    content: string; // Rich text content from Quill editor
};

export type WaysGetInvolvedItem = {
    title: string;
    description: string;
    cta: PublicEventsVolunteeringCTA;
    img: PublicEventsVolunteeringImage;
};

export type WaysGetInvolvedModal = {
    title: string;
    download: {
        text: string;
        href: string; // File upload URL from Cloudinary
    };
    items: WaysGetInvolvedItem[];
};

export type WhoCanJoinItem = {
    title: string;
    description: string;
    optionalimg: PublicEventsVolunteeringImage;
};

export type WhoCanJoinModal = {
    title: string;
    items: WhoCanJoinItem[];
};

export type VolunteerSignUpStep = {
    step: string;
    action: string;
};

export type VolunteerSignUpModal = {
    title: string;
    items: VolunteerSignUpStep[];
    quote: PublicEventsVolunteeringQuote;
};

export type PastHighlightItem = {
    img: PublicEventsVolunteeringImage;
    title: string;
    description: string;
    year: string;
};

export type PastHighlightsModal = {
    title: string;
    items: PastHighlightItem[];
    browse: {
        text: string;
        highlighted: string;
    };
};

export type PublicEventsVolunteeringModals = {
    whyWeEngage: WhyWeEngageModal;
    waysGetInvolved: WaysGetInvolvedModal;
    whoCanJoin: WhoCanJoinModal;
    volunteerSignUp: VolunteerSignUpModal;
    pastHighlights: PastHighlightsModal;
};

export type PublicEventsVolunteeringData = {
    mainPage: PublicEventsVolunteeringMainPage;
    modals: PublicEventsVolunteeringModals;
};

export const engagePublicEventsVolunteering = pgTable('engage_public_events_volunteering', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<PublicEventsVolunteeringMainPage>().notNull(),
    modals: jsonb('modals').$type<PublicEventsVolunteeringModals>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated inferred types
export type EngagePublicEventsVolunteering = typeof engagePublicEventsVolunteering.$inferSelect;
export type EngagePublicEventsVolunteeringInsert = typeof engagePublicEventsVolunteering.$inferInsert;
//

// 4️⃣4️⃣ Engage Book a Consultation Table
//
export type BookConsultationDescription = {
    text: string;
    highlighted: string;
};

export type BookConsultationFocusArea = {
    benefit: string;
    description: string;
};

export type BookConsultationTimings = {
    text1: string;
    text2: string;
};

export type BookConsultationQuote = {
    text: string;
    highlighted: string;
};

export type BookConsultationCTA = {
    text: string;
    href: string;
};

export type BookConsultationData = {
    title: string;
    subHeadline: string;
    description: BookConsultationDescription;
    consultationFocusAreas: BookConsultationFocusArea[];
    bookingDetails: string[];
    timings: BookConsultationTimings;
    quote: BookConsultationQuote;
    cta: BookConsultationCTA[];
};

export const engageBookConsultation = pgTable('engage_book_consultation', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    subHeadline: text('sub_headline').notNull(),
    description: jsonb('description').$type<BookConsultationDescription>().notNull(),
    consultationFocusAreas: jsonb('consultation_focus_areas').$type<BookConsultationFocusArea[]>().notNull(),
    bookingDetails: jsonb('booking_details').$type<string[]>().notNull(),
    timings: jsonb('timings').$type<BookConsultationTimings>().notNull(),
    quote: jsonb('quote').$type<BookConsultationQuote>().notNull(),
    cta: jsonb('cta').$type<BookConsultationCTA[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EngageBookConsultation = typeof engageBookConsultation.$inferSelect;
export type EngageBookConsultationInsert = typeof engageBookConsultation.$inferInsert;
//
// 4️⃣5️⃣ Engage Newsletter Signup Table
//
export type NewsletterSignupDescription = {
    text: string;
    highlighted: string;
};

export type NewsletterSignupWhySubscribe = {
    benefit: string;
    description: string;
};

export type NewsletterSignupQuote = {
    text: string;
    highlighted: string;
};

export type NewsletterSignupCTA = {
    text: string;
    href: string;
};

export type NewsletterSignupData = {
    title: string;
    subHeadline: string;
    description: NewsletterSignupDescription;
    whySubscribe: NewsletterSignupWhySubscribe[];
    contact: string;
    whatYouReceive: string[];
    quote: NewsletterSignupQuote;
    cta: NewsletterSignupCTA[];
};

export const engageNewsletterSignup = pgTable('engage_newsletter_signup', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    subHeadline: text('sub_headline').notNull(),
    description: jsonb('description').$type<NewsletterSignupDescription>().notNull(),
    whySubscribe: jsonb('why_subscribe').$type<NewsletterSignupWhySubscribe[]>().notNull(),
    contact: text('contact').notNull(),
    whatYouReceive: jsonb('what_you_receive').$type<string[]>().notNull(),
    quote: jsonb('quote').$type<NewsletterSignupQuote>().notNull(),
    cta: jsonb('cta').$type<NewsletterSignupCTA[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EngageNewsletterSignup = typeof engageNewsletterSignup.$inferSelect;
export type EngageNewsletterSignupInsert = typeof engageNewsletterSignup.$inferInsert;

//
// 4️⃣6️⃣ Engage Request a Proposal Table
//
export type RequestProposalDescription = {
    text: string;
    highlighted: string;
};

export type RequestProposalWhoShouldUseThis = {
    title: string;
    items: string[];
};

export type RequestProposalEmail = {
    text: string;
    href: string;
};

export type RequestProposalQuote = {
    text: string;
    highlighted: string;
};

export type RequestProposalCTA = {
    text: string;
    href: string;
};

export type RequestProposalData = {
    title: string;
    subHeadline: string;
    description: RequestProposalDescription;
    whoShouldUseThis: RequestProposalWhoShouldUseThis;
    whatGreenDeliversProposal: string[];
    email: RequestProposalEmail;
    quote: RequestProposalQuote;
    cta: RequestProposalCTA[];
};

export const engageRequestProposal = pgTable('engage_request_proposal', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    subHeadline: text('sub_headline').notNull(),
    description: jsonb('description').$type<RequestProposalDescription>().notNull(),
    whoShouldUseThis: jsonb('who_should_use_this').$type<RequestProposalWhoShouldUseThis>().notNull(),
    whatGreenDeliversProposal: jsonb('what_green_delivers_proposal').$type<string[]>().notNull(),
    email: jsonb('email').$type<RequestProposalEmail>().notNull(),
    quote: jsonb('quote').$type<RequestProposalQuote>().notNull(),
    cta: jsonb('cta').$type<RequestProposalCTA[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EngageRequestProposal = typeof engageRequestProposal.$inferSelect;
export type EngageRequestProposalInsert = typeof engageRequestProposal.$inferInsert;

//
// 4️⃣7️⃣ Ecosystem Our Value Chain Table
//
export type ValueChainImage = {
    src: string;
    alt: string;
};

export type ValueChainDescription = {
    text: string;
    highlighted: string;
};

export type ValueChainQuote = {
    text: string;
    highlighted: string;
};

export type ValueChainCTA = {
    text: string;
    href: string;
};

export type ValueChainStripItem = {
    img: ValueChainImage;
    title: string;
    description: string;
};

export type EcosystemOurValueChainData = {
    title: string;
    subHeadline: string;
    description: ValueChainDescription;
    quote: ValueChainQuote[];
    cta: ValueChainCTA[];
    valueChainStrip: ValueChainStripItem[];
};

export const ecosystemOurValueChain = pgTable('ecosystem_our_value_chain', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    subHeadline: text('sub_headline').notNull(),
    description: jsonb('description').$type<ValueChainDescription>().notNull(),
    quote: jsonb('quote').$type<ValueChainQuote[]>().notNull(),
    cta: jsonb('cta').$type<ValueChainCTA[]>().notNull(),
    valueChainStrip: jsonb('value_chain_strip').$type<ValueChainStripItem[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemOurValueChain = typeof ecosystemOurValueChain.$inferSelect;
export type EcosystemOurValueChainInsert = typeof ecosystemOurValueChain.$inferInsert;

//
// 4️⃣8️⃣ Ecosystem Supply Partners Table
//
export type SupplyPartnersImage = {
    src: string;
    alt: string;
};

export type SupplyPartnersDescription = {
    text: string;
    highlighted: string;
};

export type SupplyPartnersQuote = {
    text: string;
    highlighted: string;
};

export type SupplyPartnersCTA = {
    text: string;
    href: string;
};

export type SupplyPartnersPartnerSpotlight = {
    icons: SupplyPartnersImage[];
    text: string;
};

export type SupplyPartnersMainPage = {
    title: string;
    subHeadline: string;
    description: SupplyPartnersDescription;
    quote: SupplyPartnersQuote;
    cta: SupplyPartnersCTA[];
    partnerSpotlight: SupplyPartnersPartnerSpotlight;
};

export type SupplyPartnersGlobalSourcingStrategy = {
    title: string;
    headline: string;
    description: string;
    keyPoints: string[];
};

export type SupplyPartnersWhatWeProcureItem = {
    category: string;
    example: string;
};

export type SupplyPartnersWhatWeProcure = {
    title: string;
    item: SupplyPartnersWhatWeProcureItem[];
};

export type SupplyPartnersHowBecomeSupplierItem = {
    step: string;
    action: string;
};

export type SupplyPartnersHowBecomeGreenSupplier = {
    title: string;
    subHeadline: string;
    item: SupplyPartnersHowBecomeSupplierItem[];
};

export type EcosystemSupplyPartnersData = {
    mainPage: SupplyPartnersMainPage;
    globalSourcingStrategy: SupplyPartnersGlobalSourcingStrategy;
    whatWeProcure: SupplyPartnersWhatWeProcure;
    howBecomeGreenSupplier: SupplyPartnersHowBecomeGreenSupplier;
};

export const ecosystemSupplyPartners = pgTable('ecosystem_supply_partners', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<SupplyPartnersMainPage>().notNull(),
    globalSourcingStrategy: jsonb('global_sourcing_strategy').$type<SupplyPartnersGlobalSourcingStrategy>().notNull(),
    whatWeProcure: jsonb('what_we_procure').$type<SupplyPartnersWhatWeProcure>().notNull(),
    howBecomeGreenSupplier: jsonb('how_become_green_supplier').$type<SupplyPartnersHowBecomeGreenSupplier>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemSupplyPartners = typeof ecosystemSupplyPartners.$inferSelect;
export type EcosystemSupplyPartnersInsert = typeof ecosystemSupplyPartners.$inferInsert;

//
// 4️⃣9️⃣ Ecosystem Our Procurement Philosophy Table
//
export type ProcurementPhilosophyImage = {
    src: string;
    alt: string;
};

export type ProcurementPhilosophyCTA = {
    text: string;
    href: string;
};

export type ProcurementPhilosophyQuote = {
    text: string;
    highlighted: string;
};

export type ProcurementPhilosophyMainPage = {
    title: string;
    subHeadline: string;
    description: string;
    quote: ProcurementPhilosophyQuote[];
    cta: ProcurementPhilosophyCTA[];
};

export type ProcurementPhilosophyCorePrinciple = {
    principle: string;
    statement: string;
};

export type ProcurementPhilosophyCorePrinciples = {
    title: string;
    subHeadline: string;
    items: ProcurementPhilosophyCorePrinciple[];
};

export type ProcurementPhilosophyWhatWeWontCompromise = {
    title: string;
    img: ProcurementPhilosophyImage;
    keys: string[];
    quote: ProcurementPhilosophyQuote;
};

export type ProcurementPhilosophyProcurementAlignedImpact = {
    title: string;
    description: string;
    keys: string[];
    img: ProcurementPhilosophyImage;
    quote: ProcurementPhilosophyQuote;
};

export type ProcurementPhilosophyStrategicVendorKey = {
    text: string;
    highlighted: string;
};

export type ProcurementPhilosophyStrategicVendorRelationships = {
    title: string;
    keys: ProcurementPhilosophyStrategicVendorKey[];
    img: ProcurementPhilosophyImage;
};

export type EcosystemOurProcurementPhilosophyData = {
    mainPage: ProcurementPhilosophyMainPage;
    corePrinciples: ProcurementPhilosophyCorePrinciples;
    whatWeWontCompromise: ProcurementPhilosophyWhatWeWontCompromise;
    procurementAlignedImpact: ProcurementPhilosophyProcurementAlignedImpact;
    strategicVendorRelationships: ProcurementPhilosophyStrategicVendorRelationships;
};

export const ecosystemOurProcurementPhilosophy = pgTable('ecosystem_our_procurement_philosophy', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<ProcurementPhilosophyMainPage>().notNull(),
    corePrinciples: jsonb('core_principles').$type<ProcurementPhilosophyCorePrinciples>().notNull(),
    whatWeWontCompromise: jsonb('what_we_wont_compromise').$type<ProcurementPhilosophyWhatWeWontCompromise>().notNull(),
    procurementAlignedImpact: jsonb('procurement_aligned_impact').$type<ProcurementPhilosophyProcurementAlignedImpact>().notNull(),
    strategicVendorRelationships: jsonb('strategic_vendor_relationships').$type<ProcurementPhilosophyStrategicVendorRelationships>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemOurProcurementPhilosophy = typeof ecosystemOurProcurementPhilosophy.$inferSelect;
export type EcosystemOurProcurementPhilosophyInsert = typeof ecosystemOurProcurementPhilosophy.$inferInsert;

//
// 5️⃣0️⃣ Ecosystem Key Supply Categories Table
//
export type KeySupplyCategoriesDescription = {
    text: string;
    highlighted: string;
};

export type KeySupplyCategoriesQuote = {
    text: string;
    highlighted: string;
};

export type KeySupplyCategoriesCTA = {
    text: string;
    href: string;
};

export type KeySupplyCategoriesMainPage = {
    title: string;
    subHeadline: string;
    description: KeySupplyCategoriesDescription;
    quote: KeySupplyCategoriesQuote;
    cta: KeySupplyCategoriesCTA[];
};

export type KeySupplyCategoriesModalItem = {
    component: string;
    technicalNotes: string;
};

export type KeySupplyCategoriesModal = {
    title: string;
    item: KeySupplyCategoriesModalItem[];
};

export type EcosystemKeySupplyCategoriesData = {
    mainPage: KeySupplyCategoriesMainPage;
    modals: KeySupplyCategoriesModal[];
};

export const ecosystemKeySupplyCategories = pgTable('ecosystem_key_supply_categories', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<KeySupplyCategoriesMainPage>().notNull(),
    modals: jsonb('modals').$type<KeySupplyCategoriesModal[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemKeySupplyCategories = typeof ecosystemKeySupplyCategories.$inferSelect;
export type EcosystemKeySupplyCategoriesInsert = typeof ecosystemKeySupplyCategories.$inferInsert;

//
// 5️⃣1️⃣ Ecosystem Become a Supplier Table
//
export type EcosystemBecomeSupplierImage = {
    src: string;
    alt: string;
};

export type EcosystemBecomeSupplierDescription = {
    text: string;
    highlighted: string;
};

export type EcosystemBecomeSupplierQuote = {
    text: string;
    highlighted: string;
};

export type EcosystemBecomeSupplierCTA = {
    text: string;
    href: string;
};

export type EcosystemBecomeSupplierMainPage = {
    title: string;
    subHeadline: string;
    description: EcosystemBecomeSupplierDescription;
    quote: EcosystemBecomeSupplierQuote[];
    cta: EcosystemBecomeSupplierCTA[];
};

export type EcosystemBecomeSupplierWhatYouNeed = {
    title: string;
    keys: string[];
};

export type EcosystemBecomeSupplierWhyGreen = {
    title: string;
    img: EcosystemBecomeSupplierImage;
    keys: string[];
};

export type EcosystemBecomeSupplierData = {
    mainPage: EcosystemBecomeSupplierMainPage;
    whatYouNeed: EcosystemBecomeSupplierWhatYouNeed;
    whyGreen: EcosystemBecomeSupplierWhyGreen;
};

export const ecosystemBecomeSupplier = pgTable('ecosystem_become_supplier', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<EcosystemBecomeSupplierMainPage>().notNull(),
    whatYouNeed: jsonb('what_you_need').$type<EcosystemBecomeSupplierWhatYouNeed>().notNull(),
    whyGreen: jsonb('why_green').$type<EcosystemBecomeSupplierWhyGreen>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemBecomeSupplier = typeof ecosystemBecomeSupplier.$inferSelect;
export type EcosystemBecomeSupplierInsert = typeof ecosystemBecomeSupplier.$inferInsert;

//
// 5️⃣2️⃣ Ecosystem Handbook Table
//
export type EcosystemHandbookQuote = {
    text: string;
    highlighted: string;
};

export type EcosystemHandbookCTA = {
    text: string;
    href: string;
};

export type EcosystemHandbookMainPage = {
    title: string;
    subHeadline: string;
    description: string;
    quote: EcosystemHandbookQuote[];
    cta: EcosystemHandbookCTA[];
};

export type EcosystemHandbookImage = {
    src: string;
    alt: string;
};

export type EcosystemHandbookOurProcurementEthos = {
    title: string;
    description: string;
    img: EcosystemHandbookImage;
    keys: string[];
};

export type EcosystemHandbookCodeOfConductItem = {
    category: string;
    requiredStandard: string;
};

export type EcosystemHandbookCodeOfConduct = {
    title: string;
    item: EcosystemHandbookCodeOfConductItem[];
};

export type EcosystemHandbookData = {
    mainPage: EcosystemHandbookMainPage;
    ourProcurementEthos: EcosystemHandbookOurProcurementEthos;
    codeOfConduct: EcosystemHandbookCodeOfConduct;
};

export const ecosystemHandbook = pgTable('ecosystem_handbook', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<EcosystemHandbookMainPage>().notNull(),
    ourProcurementEthos: jsonb('our_procurement_ethos').$type<EcosystemHandbookOurProcurementEthos>().notNull(),
    codeOfConduct: jsonb('code_of_conduct').$type<EcosystemHandbookCodeOfConduct>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemHandbook = typeof ecosystemHandbook.$inferSelect;
export type EcosystemHandbookInsert = typeof ecosystemHandbook.$inferInsert;

//
// 5️⃣3️⃣ Ecosystem Client Partnerships Table
//
export type ClientPartnershipsImage = {
    src: string;
    alt: string;
};

export type ClientPartnershipsCTA = {
    text: string;
    href: string;
};

export type ClientPartnershipsQuote1 = {
    text1: string;
    text2: string;
};

export type ClientPartnershipsMainPage = {
    title: string;
    subHeadline: string;
    description: string;
    quote1: ClientPartnershipsQuote1;
    quote2: string;
    cta: ClientPartnershipsCTA[];
};

export type ClientPartnershipsWhoWePartnerWithItem = {
    clientType: string;
    valueDelivered: string;
};

export type ClientPartnershipsWhoWePartnerWith = {
    title: string;
    subHeadline: string;
    items: ClientPartnershipsWhoWePartnerWithItem[];
};

export type ClientPartnershipsOurClientPartnershipItem = {
    title: string;
    description: string;
};

export type ClientPartnershipsOurClientPartnership = {
    title: string;
    subHeadline: string;
    description: string;
    img: ClientPartnershipsImage;
    quote: {
        text: string;
        highlighted: string;
    };
    items: ClientPartnershipsOurClientPartnershipItem[];
};

export type ClientPartnershipsWhatSetsGreenApartItem = {
    greenDelivers: string;
    othersPromise: string;
};

export type ClientPartnershipsWhatSetsGreenApart = {
    title: string;
    subHeadline: string;
    items: ClientPartnershipsWhatSetsGreenApartItem[];
};

export type ClientPartnershipsUseCasesItem = {
    img: ClientPartnershipsImage;
    title: string;
    reference: string;
};

export type ClientPartnershipsUseCases = {
    title: string;
    items: ClientPartnershipsUseCasesItem[];
};

export type ClientPartnershipsTrustedBy = {
    title: string;
    subHeadline: string;
    icons: ClientPartnershipsImage[];
};

export type EcosystemClientPartnershipsData = {
    mainPage: ClientPartnershipsMainPage;
    whoWePartnerWith: ClientPartnershipsWhoWePartnerWith;
    ourClientPartnership: ClientPartnershipsOurClientPartnership;
    whatSetsGreenApart: ClientPartnershipsWhatSetsGreenApart;
    useCases: ClientPartnershipsUseCases;
    trustedBy: ClientPartnershipsTrustedBy;
};

export const ecosystemClientPartnerships = pgTable('ecosystem_client_partnerships', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<ClientPartnershipsMainPage>().notNull(),
    whoWePartnerWith: jsonb('who_we_partner_with').$type<ClientPartnershipsWhoWePartnerWith>().notNull(),
    ourClientPartnership: jsonb('our_client_partnership').$type<ClientPartnershipsOurClientPartnership>().notNull(),
    whatSetsGreenApart: jsonb('what_sets_green_apart').$type<ClientPartnershipsWhatSetsGreenApart>().notNull(),
    useCases: jsonb('use_cases').$type<ClientPartnershipsUseCases>().notNull(),
    trustedBy: jsonb('trusted_by').$type<ClientPartnershipsTrustedBy>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemClientPartnerships = typeof ecosystemClientPartnerships.$inferSelect;
export type EcosystemClientPartnershipsInsert = typeof ecosystemClientPartnerships.$inferInsert;

//
// 5️⃣4️⃣ Ecosystem Collaboration Innovation Table
//
export type CollaborationInnovationImage = {
    src: string;
    alt: string;
};

export type CollaborationInnovationCTA = {
    text: string;
    href: string;
};

export type CollaborationInnovationDescription = {
    text: string;
    highlighted: string;
};

export type CollaborationInnovationQuote = {
    text: string;
    highlighted: string;
};

export type CollaborationInnovationMainPage = {
    title: string;
    subHeadline: string;
    description: CollaborationInnovationDescription;
    quote: CollaborationInnovationQuote[];
    cta: CollaborationInnovationCTA[];
};

export type CollaborationInnovationOurPhilosophy = {
    title: string;
    subHeadline: string;
    img: CollaborationInnovationImage;
    description: CollaborationInnovationDescription;
    keys: string[];
};

export type CollaborationInnovationWhoWeCelebrateWithItem = {
    partnerType: string;
    engagementScope: string;
};

export type CollaborationInnovationWhoWeCelebrateWith = {
    title: string;
    items: CollaborationInnovationWhoWeCelebrateWithItem[];
};

export type CollaborationInnovationInnovationSpotlightKey = {
    title: string;
    description: string;
};

export type CollaborationInnovationInnovationSpotlight = {
    title: string;
    keys: CollaborationInnovationInnovationSpotlightKey[];
};

export type EcosystemCollaborationInnovationData = {
    mainPage: CollaborationInnovationMainPage;
    ourPhilosophy: CollaborationInnovationOurPhilosophy;
    whoWeCelebrateWith: CollaborationInnovationWhoWeCelebrateWith;
    innovationSpotlight: CollaborationInnovationInnovationSpotlight;
};

export const ecosystemCollaborationInnovation = pgTable('ecosystem_collaboration_innovation', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<CollaborationInnovationMainPage>().notNull(),
    ourPhilosophy: jsonb('our_philosophy').$type<CollaborationInnovationOurPhilosophy>().notNull(),
    whoWeCelebrateWith: jsonb('who_we_celebrate_with').$type<CollaborationInnovationWhoWeCelebrateWith>().notNull(),
    innovationSpotlight: jsonb('innovation_spotlight').$type<CollaborationInnovationInnovationSpotlight>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemCollaborationInnovation = typeof ecosystemCollaborationInnovation.$inferSelect;
export type EcosystemCollaborationInnovationInsert = typeof ecosystemCollaborationInnovation.$inferInsert;

//
// 5️⃣5️⃣ Ecosystem Industry Affiliations Certifications Table
//
export type IndustryAffiliationsCertificationsImage = {
    src: string;
    alt: string;
};

export type IndustryAffiliationsCertificationsCTA = {
    text: string;
    href: string;
};

export type IndustryAffiliationsCertificationsQuote = {
    text: string;
    highlighted: string;
};

export type IndustryAffiliationsCertificationsMainPage = {
    title: string;
    subHeadline: string;
    description: {
        text:string
    };
    quote: IndustryAffiliationsCertificationsQuote[];
    cta: IndustryAffiliationsCertificationsCTA[];
};

export type WhyCertificationAffiliationMatterKey = {
    text: string;
    highlighted: string;
};

export type WhyCertificationAffiliationMatter = {
    title: string;
    description: string;
    img: IndustryAffiliationsCertificationsImage;
    keys: WhyCertificationAffiliationMatterKey[];
    quote: IndustryAffiliationsCertificationsQuote;
};

export type OurCurrentCertificationItem = {
    certification: string;
    issuingBody: string;
    scope: string;
};

export type OurCurrentCertifications = {
    title: string;
    items: OurCurrentCertificationItem[];
};

export type IndustryAffiliationKey = {
    organization: string;
    purpose: string;
};

export type IndustryAffiliations = {
    title: string;
    quote: IndustryAffiliationsCertificationsQuote;
    keys: IndustryAffiliationKey[];
};

export type WhatThisMeansClientsKey = {
    title: string;
    description: string;
};

export type WhatThisMeansClients = {
    title: string;
    img: IndustryAffiliationsCertificationsImage;
    keys: WhatThisMeansClientsKey[];
};

export type EcosystemIndustryAffiliationsCertificationsData = {
    mainPage: IndustryAffiliationsCertificationsMainPage;
    whyCertificationAffiliationMatter: WhyCertificationAffiliationMatter;
    ourCurrentCertifications: OurCurrentCertifications;
    industryAffiliations: IndustryAffiliations;
    whatThisMeansClients: WhatThisMeansClients;
};

export const ecosystemIndustryAffiliationsCertifications = pgTable('ecosystem_industry_affiliations_certifications', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<IndustryAffiliationsCertificationsMainPage>().notNull(),
    whyCertificationAffiliationMatter: jsonb('why_certification_affiliation_matter').$type<WhyCertificationAffiliationMatter>().notNull(),
    ourCurrentCertifications: jsonb('our_current_certifications').$type<OurCurrentCertifications>().notNull(),
    industryAffiliations: jsonb('industry_affiliations').$type<IndustryAffiliations>().notNull(),
    whatThisMeansClients: jsonb('what_this_means_clients').$type<WhatThisMeansClients>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemIndustryAffiliationsCertifications = typeof ecosystemIndustryAffiliationsCertifications.$inferSelect;
export type EcosystemIndustryAffiliationsCertificationsInsert = typeof ecosystemIndustryAffiliationsCertifications.$inferInsert;

//
// 5️⃣6️⃣ Ecosystem Community Impact Loop Table
//
export type CommunityImpactLoopImage = {
    src: string;
    alt: string;
};

export type CommunityImpactLoopCTA = {
    text: string;
    href: string;
};

export type CommunityImpactLoopQuote = {
    text: string;
    highlighted: string;
};

export type CommunityImpactLoopMainPage = {
    title: string;
    subHeadline: string;
    description: string;
    quote: CommunityImpactLoopQuote;
    cta: CommunityImpactLoopCTA[];
};

export type GreenCommunityImpactLoopDescription = {
    text1: string;
    text2: string;
};

export type GreenCommunityImpactLoop = {
    title: string;
    description: GreenCommunityImpactLoopDescription;
    keys: string[];
};

export type HowLoopWorksItem = {
    title: string;
    description: string;
};

export type HowLoopWorks = {
    title: string;
    items: HowLoopWorksItem[];
};

export type MeasuredImpactItem = {
    title: string;
    description: string;
};

export type MeasuredImpact = {
    title: string;
    items: MeasuredImpactItem[];
    quote: CommunityImpactLoopQuote;
};

export type JoinTheLoop = {
    title: string;
    img: CommunityImpactLoopImage;
    quote: CommunityImpactLoopQuote;
};

export type EcosystemCommunityImpactLoopData = {
    mainPage: CommunityImpactLoopMainPage;
    greenCommunityImpactLoop: GreenCommunityImpactLoop;
    howLoopWorks: HowLoopWorks;
    measuredImpact: MeasuredImpact;
    joinTheLoop: JoinTheLoop;
};

export const ecosystemCommunityImpactLoop = pgTable('ecosystem_community_impact_loop', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<CommunityImpactLoopMainPage>().notNull(),
    greenCommunityImpactLoop: jsonb('green_community_impact_loop').$type<GreenCommunityImpactLoop>().notNull(),
    howLoopWorks: jsonb('how_loop_works').$type<HowLoopWorks>().notNull(),
    measuredImpact: jsonb('measured_impact').$type<MeasuredImpact>().notNull(),
    joinTheLoop: jsonb('join_the_loop').$type<JoinTheLoop>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//
// 5️⃣7️⃣ Chatbot Training Table
//
export const chatbotTraining = pgTable('chatbot_training', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    fileName: text('file_name').notNull(),
    filePath: text('file_path').notNull(),
    fileSize: integer('file_size').notNull(),
    chunks: integer('chunks').default(0),
    status: text('status').notNull().default('processing'), // 'processing', 'completed', 'failed'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type ChatbotTraining = typeof chatbotTraining.$inferSelect;
export type ChatbotTrainingInsert = typeof chatbotTraining.$inferInsert;
export type EcosystemCommunityImpactLoop = typeof ecosystemCommunityImpactLoop.$inferSelect;
export type EcosystemCommunityImpactLoopInsert = typeof ecosystemCommunityImpactLoop.$inferInsert;

//
// 5️⃣7️⃣ Ecosystem Impact Measurement ESG Table
//
export type ImpactMeasurementESGImage = {
    src: string;
    alt: string;
};

export type ImpactMeasurementESGCTA = {
    text: string;
    href: string;
};

export type ImpactMeasurementESGDescription = {
    text: string;
    highlighted: string;
};

export type ImpactMeasurementESGQuote = {
    text: string;
    highlighted: string;
};

export type ImpactMeasurementESGKey = {
    text: string;
    highlighted: string;
};

export type ImpactMeasurementESGMainPage = {
    title: string;
    subHeadline: string;
    description: ImpactMeasurementESGDescription;
    quote: ImpactMeasurementESGQuote;
    cta: ImpactMeasurementESGCTA[];
};

export type WhyESGMattersGreenKey = {
    text: string;
    highlighted: string;
};

export type WhyESGMattersGreen = {
    title: string;
    subHeadline: string;
    description: string;
    keys: WhyESGMattersGreenKey[];
};

export type ESGIntegrationProjectLifeCycleItem = {
    title: string;
    description: string;
};

export type ESGIntegrationProjectLifeCycle = {
    title: string;
    items: ESGIntegrationProjectLifeCycleItem[];
    quote: ImpactMeasurementESGQuote;
};

export type TrustSignals = {
    title: string;
    items: string[];
    quote: ImpactMeasurementESGQuote;
};

export type SampleMetricsSnapshotKey = {
    text: string;
    highlighted: string;
};

export type SampleMetricsSnapshot = {
    title: string;
    description: ImpactMeasurementESGDescription;
    keys: SampleMetricsSnapshotKey[];
};

export type HowWeMeasureImpactMetric = {
    category: string;
    keyMetricsTracked: string;
};

export type HowWeMeasureImpact = {
    metrics: HowWeMeasureImpactMetric[];
    quote: {
        text: string;
        highlighted: string;
    };
};

export type EcosystemImpactMeasurementESGData = {
    mainPage: ImpactMeasurementESGMainPage;
    whyEsgMattersGreen: WhyESGMattersGreen;
    esgIntegrationProjectLifeCycle: ESGIntegrationProjectLifeCycle;
    trustSignals: TrustSignals;
    sampleMetricsSnapshot: SampleMetricsSnapshot;
    howWeMeasureImpact: HowWeMeasureImpact;
};

export const ecosystemImpactMeasurementESG = pgTable('ecosystem_impact_measurement_esg', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<ImpactMeasurementESGMainPage>().notNull(),
    whyEsgMattersGreen: jsonb('why_esg_matters_green').$type<WhyESGMattersGreen>().notNull(),
    esgIntegrationProjectLifeCycle: jsonb('esg_integration_project_life_cycle').$type<ESGIntegrationProjectLifeCycle>().notNull(),
    trustSignals: jsonb('trust_signals').$type<TrustSignals>().notNull(),
    sampleMetricsSnapshot: jsonb('sample_metrics_snapshot').$type<SampleMetricsSnapshot>().notNull(),
    howWeMeasureImpact: jsonb('how_we_measure_impact').$type<HowWeMeasureImpact>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemImpactMeasurementESG = typeof ecosystemImpactMeasurementESG.$inferSelect;
export type EcosystemImpactMeasurementESGInsert = typeof ecosystemImpactMeasurementESG.$inferInsert;

//
// 5️⃣8️⃣ Ecosystem Technology Innovation Alliances Table
//
export type TechnologyInnovationAlliancesImage = {
    src: string;
    alt: string;
};

export type TechnologyInnovationAlliancesCTA = {
    text: string;
    href: string;
};

export type TechnologyInnovationAlliancesDescription = {
    text: string;
    highlighted: string;
};

export type TechnologyInnovationAlliancesQuote = {
    text: string;
    highlighted: string;
};

export type TechnologyInnovationAlliancesMainPage = {
    title: string;
    subHeadline: string;
    description: TechnologyInnovationAlliancesDescription;
    quote: TechnologyInnovationAlliancesQuote[];
    cta: TechnologyInnovationAlliancesCTA[];
};



export type TechnologyInnovationAlliancesModalKey = {
    text: string;
    highlighted: string;
};

export type TechnologyInnovationAlliancesModal = {
    title: string;
    subHeadline: string;
    description: string;
    img: TechnologyInnovationAlliancesImage;
    keys: TechnologyInnovationAlliancesModalKey[];
    quote: TechnologyInnovationAlliancesQuote;
};

export type EcosystemTechnologyInnovationAlliancesData = {
    mainPage: TechnologyInnovationAlliancesMainPage;
    modals: TechnologyInnovationAlliancesModal[];
};

export const ecosystemTechnologyInnovationAlliances = pgTable('ecosystem_technology_innovation_alliances', {
    id: serial('id').primaryKey(),
    mainPage: jsonb('main_page').$type<TechnologyInnovationAlliancesMainPage>().notNull(),
    modals: jsonb('modals').$type<TechnologyInnovationAlliancesModal[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type EcosystemTechnologyInnovationAlliances = typeof ecosystemTechnologyInnovationAlliances.$inferSelect;

//
// 📁 Media Files Table (for non-image/video files stored on server)
//
export const mediaFiles = pgTable('media_files', {
    id: serial('id').primaryKey(),
    // File identification
    originalFilename: text('original_filename').notNull(), // e.g., "report.pdf"
    storedFilename: text('stored_filename').notNull(), // e.g., "abc123.pdf"
    cloudinaryPublicId: text('cloudinary_public_id'), // Cloudinary reference if used
    cloudinaryUrl: text('cloudinary_url'), // Cloudinary secure URL
    
    // File metadata
    fileExtension: text('file_extension').notNull(), // e.g., "pdf", "docx", "zip"
    mimeType: text('mime_type').notNull(), // e.g., "application/pdf"
    fileSize: integer('file_size').notNull(), // Size in bytes (max 100MB = 104857600 bytes)
    
    // Storage info
    storageType: text('storage_type').notNull().default('database'), // 'cloudinary', 'server', or 'database'
    serverPath: text('server_path'), // Path if stored on server (deprecated - use fileData instead)
    fileData: text('file_data'), // Base64 encoded file content stored in database
    
    // Categorization
    category: text('category').default('document'), // 'document', 'archive', 'data', 'other'
    folder: text('folder'), // Organizational folder
    
    // Additional metadata
    uploadedBy: integer('uploaded_by').references(() => users.id), // User who uploaded
    description: text('description'), // Optional description
    tags: jsonb('tags').$type<string[]>().default(sql`'[]'::jsonb`), // Searchable tags
    
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Inferred types
export type MediaFile = typeof mediaFiles.$inferSelect;
export type NewMediaFile = typeof mediaFiles.$inferInsert;
export type EcosystemTechnologyInnovationAlliancesInsert = typeof ecosystemTechnologyInnovationAlliances.$inferInsert;
