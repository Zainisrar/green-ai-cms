import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import '../styles/green-theme.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';

export const metadata: Metadata = {
    title: {
        template: '%s | Green Future CMS',
        default: 'Green Future CMS',
    },
    icons: {
        icon: '/g-logo.png',
        shortcut: '/g-logo.png',
        apple: '/g-logo.png',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={nunito.variable}>
                <ProviderComponent>{children}</ProviderComponent>
            </body>
        </html>
    );
}
