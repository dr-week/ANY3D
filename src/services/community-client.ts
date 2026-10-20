export interface CommunityModel {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  downloads: number;
  likes: number;
  license: string;
  source: 'thingiverse' | 'printables';
  category: string;
  stlUrl: string;
  tags: string[];
}

export const COMMUNITY_MODELS: CommunityModel[] = [
  {
    id: '3dbenchy',
    title: '#3DBenchy - The Jolly 3D Printing Benchmark',
    author: 'CreativeTools',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    downloads: 1420500,
    likes: 85200,
    license: 'CC-BY-ND',
    source: 'printables',
    category: 'Calibration',
    stlUrl: 'mock/benchy.stl',
    tags: ['calibration', 'kobra2', 'benchmark', 'hull']
  },
  {
    id: 'cali-cat',
    title: 'Cali Cat - The Friendly Calibration Cat',
    author: 'Dezign',
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    downloads: 650200,
    likes: 42100,
    license: 'CC-BY',
    source: 'thingiverse',
    category: 'Calibration',
    stlUrl: 'mock/cali_cat.stl',
    tags: ['cat', 'test', 'dimensional-accuracy']
  },
  {
    id: 'kobra2-filament-guide',
    title: 'Anycubic Kobra 2 Low-Friction Filament Guide',
    author: '3DMaker_Pro',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    downloads: 48900,
    likes: 3120,
    license: 'CC-BY-SA',
    source: 'printables',
    category: 'Upgrades',
    stlUrl: 'mock/kobra2_guide.stl',
    tags: ['kobra2', 'anycubic', 'direct-drive', 'upgrade']
  },
  {
    id: 'voronoi-pencil-holder',
    title: 'Twisted Voronoi Desktop Vessel',
    author: 'RomanH',
    thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
    downloads: 185000,
    likes: 12400,
    license: 'CC-BY-NC',
    source: 'thingiverse',
    category: 'Art & Decor',
    stlUrl: 'mock/voronoi_vase.stl',
    tags: ['voronoi', 'vase-mode', 'decor']
  },
  {
    id: 'articulated-dragon',
    title: 'Articulated Print-in-Place Flexi Dragon',
    author: 'McGybeer',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    downloads: 920000,
    likes: 78900,
    license: 'CC-BY-NC-SA',
    source: 'printables',
    category: 'Toys & Games',
    stlUrl: 'mock/dragon.stl',
    tags: ['print-in-place', 'articulated', 'toy']
  }
];

export class CommunityDiscoveryClient {
  public async searchModels(query: string = '', source?: 'thingiverse' | 'printables'): Promise<CommunityModel[]> {
    await new Promise(r => setTimeout(r, 60)); // Simulate async network call
    let results = [...COMMUNITY_MODELS];

    if (source) {
      results = results.filter(m => m.source === source);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return results;
  }
}

export const communityClient = new CommunityDiscoveryClient();
