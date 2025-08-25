import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-8">
        <h1 className="text-5xl font-bold mb-6 text-center text-gray-900">About Us</h1>
        <p className="text-lg text-gray-700 mb-4">
          Welcome to Kaks Naturals! We are dedicated to providing you with the finest natural skincare and wellness products. Our mission is to harness the power of nature to enhance your beauty and well-being.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Our products are crafted with love and care, using only the highest quality ingredients sourced from nature. We believe in transparency and sustainability, ensuring that our products are not only good for you but also good for the planet.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Thank you for choosing Kaks Naturals. We are excited to be a part of your journey towards natural beauty and wellness!
        </p>
        <div className="text-center mt-8">
          <button className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition duration-300">
            Shop Our Products
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
