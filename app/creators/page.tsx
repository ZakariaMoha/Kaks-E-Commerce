import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CreatorLanding from '@/components/creators/CreatorLanding';

export const metadata = {
  title: 'Creator Program - Kaks Naturals',
  description: 'Join our creator community and earn rewards by sharing Kaks Naturals products with your audience.',
};

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CreatorLanding />
      <Footer />
    </div>
  );
}