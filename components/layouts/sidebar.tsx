'use client';
import PerfectScrollbar from './perfect-scrollbar-wrapper';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuChat from '@/components/icon/menu/icon-menu-chat';
import IconMenuMailbox from '@/components/icon/menu/icon-menu-mailbox';
import IconMenuTodo from '@/components/icon/menu/icon-menu-todo';
import IconMenuNotes from '@/components/icon/menu/icon-menu-notes';
import IconMenuScrumboard from '@/components/icon/menu/icon-menu-scrumboard';
import IconMenuContacts from '@/components/icon/menu/icon-menu-contacts';
import IconMenuInvoice from '@/components/icon/menu/icon-menu-invoice';
import IconMenuCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconMenuComponents from '@/components/icon/menu/icon-menu-components';
import IconMenuElements from '@/components/icon/menu/icon-menu-elements';
import IconMenuCharts from '@/components/icon/menu/icon-menu-charts';
import IconMenuWidgets from '@/components/icon/menu/icon-menu-widgets';
import IconMenuFontIcons from '@/components/icon/menu/icon-menu-font-icons';
import IconMenuDragAndDrop from '@/components/icon/menu/icon-menu-drag-and-drop';
import IconMenuTables from '@/components/icon/menu/icon-menu-tables';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconMenuPages from '@/components/icon/menu/icon-menu-pages';
import IconMenuAuthentication from '@/components/icon/menu/icon-menu-authentication';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };
  
    
    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-40 flex-none" src="/assets/images/logo.png" alt="logo" />
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <IconMinus className="hidden h-5 w-4 flex-none" />
                                <span>{t('apps')}</span>
                            </h2>

                            <li className="nav-item">
                                <ul>
                                    <li className="nav-item">
                                        <Link href="/" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Navigation</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/chatbot" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">ChatBot Training</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/apps/media" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Media Library</span>
                                            </div>
                                        </Link>
                                    </li>
                              
                                </ul>
                            </li>

                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <IconMinus className="hidden h-5 w-4 flex-none" />
                                <span>{t('user_interface')}</span>
                            </h2>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'insights' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('insights')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Insight')}</span>
                                    </div>

                                    <div className={currentMenu !== 'insights' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'insights' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/insights">{t('Banner Insights')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/insights/details">{t('Banner Details')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'element' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('element')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Home')}</span>
                                    </div>

                                    <div className={currentMenu !== 'element' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'element' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/home">{t('Manage Home Pages')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/home/create">{t('Create New Page')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/expertise" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Expertise')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/energy" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Energy')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'explore' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('explore')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Explore')}</span>
                                    </div>

                                    <div className={currentMenu !== 'explore' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'explore' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/explore/about-us">{t('About Us')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/explore/why-green">{t('Why Green')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/explore/global-snapshot">{t('Global Snapshot')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/explore/fast-fact-stats">{t('Fast Fact Stats')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'evolution' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('evolution')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Evolution')}</span>
                                    </div>

                                    <div className={currentMenu !== 'evolution' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'evolution' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/evolution/our-story-milestone">{t('Our Story & Milestone')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/evolution/vision-mission">{t('Vision & Mission')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/evolution/leadership-team">{t('Leadership Team')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/evolution/certifications-accreditations">{t('Certifications &  Accreditations')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/evolution/sustainability-esg-commitments">{t('Sustainability  & ESG  Commitments')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'engineering' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('engineering')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Engineering')}</span>
                                    </div>

                                    <div className={currentMenu !== 'engineering' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'engineering' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/engineering/solar-epcm-services">{t('Solar EPCM Services')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engineering/hybrid-microgrid-solutions">{t('Hybrid & Microgrid Solutions')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engineering/energy-storage-smart-grid">{t('Energy Storage & Smart Grid')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engineering/om-monitoring">{t('O&M & Monitoring')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engineering/grid-intel">{t('GRID-INTEL')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engineering/products">{t('Products')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'endeavors' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('endeavors')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Endeavors')}</span>
                                    </div>

                                    <div className={currentMenu !== 'endeavors' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'endeavors' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/endeavors/projects">{t('Projects')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/endeavors/flagship-projects">{t('Flagship Projects')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'enlighten' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('enlighten')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Enlighten')}</span>
                                    </div>

                                    <div className={currentMenu !== 'enlighten' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'enlighten' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/enlighten/insights-articles">{t('Insights & Articles')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/enlighten/reports-whitepapers">{t('Reports & Whitepapers')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/enlighten/events-webinars">{t('Events & Webinars')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/enlighten/thought-leadership">{t('Thought Leadership')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/enlighten/media-mentions">{t('Media & Mentions')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'ecosystem' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('ecosystem')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Ecosystem')}</span>
                                    </div>

                                    <div className={currentMenu !== 'ecosystem' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'ecosystem' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/ecosystem/our-value-chain">{t('Our Value Chain')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/supply-partners">{t('Supply Partners')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/our-procurement-philosophy">{t('Our Procurement Philosophy')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/key-supply-categories">{t('Key Supply Categories')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/become-a-supplier">{t('Become a Supplier')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/handbook">{t('Supplier Code of Conduct / Handbook')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/client-partnerships">{t('Client Partnerships')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/collaboration-innovation">{t('Collaboration & Innovation')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/industry-affiliations">{t('Industry Affiliations & Certifications')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/community-impact-loop">{t('Community Impact Loop - What is the GREEN Community Impact Loop?')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/impact-measurement">{t('Impact Measurement & ESG - Why ESG Matters to GREEN')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/ecosystem/technology-innovation-alliances">{t('Technology & Innovation Alliances')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'empower' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('empower')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Empower')}</span>
                                    </div>

                                    <div className={currentMenu !== 'empower' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'empower' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/empower/team-green">{t('Team GREEN')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/empower/careers-at-green">{t('Careers at GREEN')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/empower/join-us">{t('Join Us')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/empower/green-talent-incubator">{t('GREEN Talent Incubator - Why We Built This')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/empower/women-in-energy">{t('Women in Energy')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/empower/community-voices">{t('Community Voices')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'engage' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('engage')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Engage')}</span>
                                    </div>

                                    <div className={currentMenu !== 'engage' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'engage' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/engage/partner-with-us">{t('Partner With Us')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engage/become-a-supplier">{t('Become a Supplier')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engage/investor-relations">{t('Investor Relations')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engage/media-press">{t('Media & Press')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engage/public-events-volunteering">{t('Public Events & Volunteering')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engage/book-consultation">{t('Book a Consultation')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engage/request-a-proposal">{t('Request a Proposal (RFP)')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/engage/newsletter-signup">{t('Newsletter Signup')}</Link>
                                        </li>
                                     
                                    </ul>
                                </AnimateHeight>
                            </li>

                       
                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <span>{t('Users Management')}</span>
                            </h2>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'users' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('users')}>
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('users')}</span>
                                    </div>

                                    <div className={currentMenu !== 'users' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'users' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/users/profile">{t('profile')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/users/manage-users">{t('Manage Users')}</Link>
                                        </li>
                                        {/* <li>
                                            <Link href="/users/user-account-settings">{t('account_settings')}</Link>
                                        </li> */}
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/users/roles-permissions" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Roles & Permissions')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/users/notifications" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Notifications')}</span>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
