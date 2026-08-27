import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import type { LayoutProps } from '@/types';

const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = false,
  showSidebar = false,
}) => {
  return (
    <div className="min-h-screen flex bg-ink-50 text-ink-900">
      {showSidebar && <Sidebar />}

      <div className={`flex min-w-0 flex-1 flex-col ${showSidebar ? 'lg:ml-64' : ''}`}>
        {showHeader && <Header />}

        <main className="min-w-0 flex-1 w-full">
          <div
            className={
              showSidebar
                ? 'w-full min-w-0 px-3 py-4 sm:px-5 lg:px-8 lg:py-6 lg:pb-8'
                : 'container mx-auto px-4 py-4'
            }
          >
            <Breadcrumb />
            {children}
          </div>
        </main>

        {showFooter && <Footer />}
      </div>
    </div>
  );
};

export default Layout;
