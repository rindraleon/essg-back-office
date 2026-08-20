import Header from "./Header";
import Footer from "./Footer";
import type { LayoutProps } from '../../types/layout.types';

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 w-full">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;