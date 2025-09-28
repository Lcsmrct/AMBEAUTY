import React from 'react';
import Header from '../components/Header';
import Reviews from '../components/Reviews';
import Footer from '../components/Footer';

export default function AvisPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}