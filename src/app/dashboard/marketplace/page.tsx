'use client';

import { useState } from 'react';
import { Search, TrendingUp, Star, Download, ExternalLink } from 'lucide-react';

const marketplaceItems = [
  {
    id: '1',
    name: 'Todo App with Sync',
    type: 'app',
    description: 'A modern todo application with cloud sync and real-time updates',
    developer: '0x123...456',
    rating: 4.8,
    reviews: 124,
    installs: 1250,
    price: 50,
    category: 'Productivity',
    trending: true,
  },
  {
    id: '2',
    name: 'Crypto Portfolio Tracker',
    type: 'app',
    description: 'Track your crypto portfolio with real-time prices and charts',
    developer: '0x789...abc',
    rating: 4.9,
    reviews: 89,
    installs: 890,
    price: 75,
    category: 'DeFi',
    trending: true,
  },
  {
    id: '3',
    name: 'Social Media Dashboard',
    type: 'app',
    description: 'Manage multiple social media accounts from one place',
    developer: '0xdef...123',
    rating: 4.6,
    reviews: 67,
    installs: 560,
    price: 0,
    category: 'Social',
    trending: false,
  },
  {
    id: '4',
    name: 'E-commerce Starter',
    type: 'app',
    description: 'Complete e-commerce store with cart and checkout',
    developer: '0x456...789',
    rating: 4.7,
    reviews: 203,
    installs: 2100,
    price: 100,
    category: 'E-commerce',
    trending: true,
  },
  {
    id: '5',
    name: 'Blog Platform',
    type: 'app',
    description: 'Full-featured blog with markdown support and SEO',
    developer: '0xabc...def',
    rating: 4.5,
    reviews: 45,
    installs: 430,
    price: 25,
    category: 'Content',
    trending: false,
  },
  {
    id: '6',
    name: 'Weather Widget',
    type: 'connector',
    description: 'Fetch real-time weather data for any location',
    developer: '0x789...456',
    rating: 4.8,
    reviews: 156,
    installs: 1800,
    price: 10,
    category: 'Data',
    trending: false,
  },
  {
    id: '7',
    name: 'Email Sender',
    type: 'connector',
    description: 'Send transactional emails via multiple providers',
    developer: '0x321...654',
    rating: 4.6,
    reviews: 89,
    installs: 920,
    price: 15,
    category: 'Communication',
    trending: false,
  },
  {
    id: '8',
    name: 'Analytics Dashboard',
    type: 'app',
    description: 'Track user analytics with beautiful charts',
    developer: '0x987...321',
    rating: 4.9,
    reviews: 178,
    installs: 1650,
    price: 60,
    category: 'Analytics',
    trending: true,
  },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [type, setType] = useState('all');

  const categories = ['all', 'Productivity', 'DeFi', 'Social', 'E-commerce', 'Content', 'Analytics', 'Data', 'Communication'];

  const filteredItems = marketplaceItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'all' || item.category === filter;
    const matchesType = type === 'all' || item.type === type;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Marketplace
        </h1>
        <p className="text-gray-400">
          Discover apps and connectors created by the community
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps and connectors..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">All Types</option>
              <option value="app">Apps</option>
              <option value="connector">Connectors</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MarketplaceCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No items found
          </h3>
          <p className="text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

function MarketplaceCard({ item }: { item: any }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-400/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">
              {item.name}
            </h3>
            {item.trending && (
              <TrendingUp className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            item.type === 'app' 
              ? 'bg-blue-400/20 text-blue-400'
              : 'bg-green-400/20 text-green-400'
          }`}>
            {item.type}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {item.description}
      </p>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4" />
          <span>{item.rating}</span>
        </div>
        <div className="text-gray-400">
          {item.reviews} reviews
        </div>
        <div className="text-gray-400">
          {item.installs} installs
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div>
          <div className="text-xs text-gray-500">
            Developer
          </div>
          <div className="text-sm text-gray-400 font-mono">
            {item.developer}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {item.price === 0 ? 'Free' : `${item.price} credits`}
          </div>
          <div className="text-xs text-gray-500">
            One-time purchase
          </div>
        </div>
      </div>

      <button className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <Download className="w-4 h-4" />
        Get {item.type}
      </button>
    </div>
  );
}
