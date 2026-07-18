// Page /app : l'atelier.
// Simple point d'entrée du routing : tout le contenu vit dans
// components/studio/Studio.jsx (composant client, car interactif).
import Studio from "@/components/studio/Studio";

export const metadata = {
  title: "L'atelier : ModeLmL",
};

export default function AppPage() {
  return <Studio />;
}
