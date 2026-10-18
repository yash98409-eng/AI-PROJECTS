export interface PresetAvatar {
  id: string;
  name: string;
  category: 'educator' | 'mascot' | 'illustrated' | 'badge';
  url: string;
  description?: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  // Educators & School Leaders
  {
    id: 'av-edu-1',
    name: 'Dr. Jenkins (Academic Leader)',
    category: 'educator',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    description: 'Executive Director & Senior Scholar',
  },
  {
    id: 'av-edu-2',
    name: 'Rajesh Nair (Principal)',
    category: 'educator',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    description: 'Principal & Operations Lead',
  },
  {
    id: 'av-edu-3',
    name: 'Dr. Ramesh Verma (STEM Dean)',
    category: 'educator',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    description: 'Mathematics & Science Educator',
  },
  {
    id: 'av-edu-4',
    name: 'Prof. Ananya Sen (Humanities)',
    category: 'educator',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    description: 'Languages & Literature Chair',
  },
  {
    id: 'av-edu-5',
    name: 'Marcus Chen (Technology Coordinator)',
    category: 'educator',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
    description: 'AI & Educational Tech Specialist',
  },
  {
    id: 'av-edu-6',
    name: 'Elena Rostova (Fine Arts Director)',
    category: 'educator',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    description: 'Creative Arts & Cultural Dean',
  },
  {
    id: 'av-edu-7',
    name: 'David Okafor (Sports Director)',
    category: 'educator',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    description: 'Athletics & Physical Wellbeing Lead',
  },
  {
    id: 'av-edu-8',
    name: 'Priya Sundaram (Counselor)',
    category: 'educator',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&h=200&fit=crop&crop=face',
    description: 'Student Wellbeing & Career Mentor',
  },

  // School Mascots & Emblems
  {
    id: 'av-mascot-owl',
    name: 'Wisdom Owl',
    category: 'mascot',
    url: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=200&h=200&fit=crop&crop=faces',
    description: 'Emblem of Insight & Knowledge',
  },
  {
    id: 'av-mascot-falcon',
    name: 'Golden Falcon',
    category: 'mascot',
    url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=200&h=200&fit=crop&crop=faces',
    description: 'Focus, Speed & Academic Vision',
  },
  {
    id: 'av-mascot-lion',
    name: 'Royal Lion',
    category: 'mascot',
    url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=200&h=200&fit=crop&crop=faces',
    description: 'Courage, Honor & Leadership',
  },
  {
    id: 'av-mascot-wolf',
    name: 'Timber Wolf',
    category: 'mascot',
    url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?w=200&h=200&fit=crop&crop=faces',
    description: 'Teamwork & Loyalty',
  },

  // Illustrated Characters
  {
    id: 'av-ill-1',
    name: 'Cyber Scholar',
    category: 'illustrated',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SchoolLeader&backgroundColor=6366f1',
    description: 'Futuristic AI & Robotics Mentor',
  },
  {
    id: 'av-ill-2',
    name: 'Pixel Mentor',
    category: 'illustrated',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MathPro&backgroundColor=06b6d4',
    description: 'Digital Logic & Computing Guide',
  },
  {
    id: 'av-ill-3',
    name: 'Campus Fellow',
    category: 'illustrated',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
    description: 'Campus Coordinator & Mentor',
  },
  {
    id: 'av-ill-4',
    name: 'Academic Scholar',
    category: 'illustrated',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf',
    description: 'Research & Scholarly Fellow',
  },
  {
    id: 'av-ill-5',
    name: 'Science Guru',
    category: 'illustrated',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack&backgroundColor=c0aede',
    description: 'Experimental Sciences & Discovery',
  },
  {
    id: 'av-ill-6',
    name: 'Dean of Arts',
    category: 'illustrated',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella&backgroundColor=ffd5dc',
    description: 'Creative Visionary & Curator',
  },

  // Academic Badges & Icons
  {
    id: 'av-badge-crest',
    name: 'Oakridge Crest',
    category: 'badge',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop&crop=faces',
    description: 'Official Academy Crest & Seal',
  },
  {
    id: 'av-badge-library',
    name: 'Grand Library',
    category: 'badge',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=200&h=200&fit=crop',
    description: 'Symbol of Lifelong Learning',
  },
  {
    id: 'av-badge-astronomy',
    name: 'Cosmos Explorer',
    category: 'badge',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop',
    description: 'Astronomy & Scientific Frontier',
  },
  {
    id: 'av-badge-laboratory',
    name: 'Innovation Lab',
    category: 'badge',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=200&fit=crop',
    description: 'Modern Research Laboratory',
  },
];

export const MONOGRAM_PALETTES = [
  { id: 'indigo', name: 'Royal Indigo', bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-400', gradient: 'from-indigo-600 to-violet-700' },
  { id: 'emerald', name: 'Emerald Forest', bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-400', gradient: 'from-emerald-600 to-teal-700' },
  { id: 'amber', name: 'Warm Amber', bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-400', gradient: 'from-amber-500 to-orange-600' },
  { id: 'rose', name: 'Crimson Rose', bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-400', gradient: 'from-rose-600 to-pink-700' },
  { id: 'cyan', name: 'Ocean Cyan', bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-400', gradient: 'from-cyan-600 to-blue-700' },
  { id: 'purple', name: 'Deep Violet', bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-400', gradient: 'from-purple-600 to-indigo-800' },
  { id: 'slate', name: 'Executive Slate', bg: 'bg-slate-800', text: 'text-white', border: 'border-slate-500', gradient: 'from-slate-800 to-slate-950' },
];
