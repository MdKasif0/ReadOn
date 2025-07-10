import { Globe, Landmark, Rocket, Palette, Atom, HeartPulse, Scale, Shirt, Briefcase, GraduationCap } from "lucide-react";

export const newsCategories = [
    { name: "Top Stories", slug: "top", icon: Globe },
    { name: "General", slug: "general", icon: Globe },
    { name: "World", slug: "world", icon: Globe },
    { name: "Nation", slug: "nation", icon: Landmark },
    { name: "Business", slug: "business", icon: Landmark },
    { name: "Technology", slug: "technology", icon: Rocket },
    { name: "Entertainment", slug: "entertainment", icon: Palette },
    { name: "Sports", slug: "sports", icon: Atom },
    { name: "Science", slug: "science", icon: Atom },
    { name: "Health", slug: "health", icon: HeartPulse },
    { name: "Politics", slug: "politics", icon: Scale },
    { name: "Finance", slug: "business", icon: Briefcase }, // Re-using business for finance as API may not have finance
    { name: "Fashion", slug: "entertainment", icon: Shirt }, // Re-using entertainment
    { name: "Education", slug: "science", icon: GraduationCap } // Re-using science
];
