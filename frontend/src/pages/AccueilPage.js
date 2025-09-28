import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

export default function AccueilPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}