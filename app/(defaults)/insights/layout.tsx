import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Banner Insights',
    description: 'Explore banner insights and data',
};

export default function InsightsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-8">
            {children}
        </div>
    );
}