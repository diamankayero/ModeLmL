// Page / : la vitrine.
// Grandes lignes :
// - assemble les sections dans l'ordre du récit : promesse (Hero),
//   fonctionnalités, parcours en trois étapes, open source, appel final ;
// - data-theme="light" force le mode clair : la vitrine est volontairement
//   lumineuse (style Notion), quel que soit le thème du système ;
// - aucune interactivité ici : tout est rendu côté serveur, la page est
//   rapide et indexable par les moteurs de recherche.
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import OpenSource from "@/components/landing/OpenSource";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div data-theme="light" className="bg-white text-neutral-900">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <OpenSource />
      </main>
      <Footer />
    </div>
  );
}
