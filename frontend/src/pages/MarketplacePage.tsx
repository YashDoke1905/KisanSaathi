import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { api } from '../services/api';
import type { CropListing } from '../types';

export const MarketplacePage: React.FC = () => {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [stats, setStats] = useState({ total_listings: 0, total_stock_kg: 0, total_orders: 0, categories: [] as string[] });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);

  // Modals
  const [selectedListingForOrder, setSelectedListingForOrder] = useState<CropListing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(25);
  const [buyerName, setBuyerName] = useState('FreshGrocer Hub');
  const [buyerContact, setBuyerContact] = useState('+1 (555) 234-8901');
  const [buyerAddress, setBuyerAddress] = useState('742 Evergreen Produce Market, Terminal 2');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // New Listing Modal
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    farmer_name: '',
    crop_name: '',
    variety: '',
    category: 'Vegetable',
    quantity_kg: 500,
    price_per_kg: 1.5,
    harvest_date: new Date().toISOString().split('T')[0],
    is_organic: true,
    description: '',
    location: 'GreenValley Farms, Sector 4',
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  });
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);

  const categories = ['All', 'Vegetable', 'Grain', 'Fruit', 'Pulse'];

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [listingsData, statsData] = await Promise.all([
        api.getListings({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          organicOnly: organicOnly || undefined,
          search: searchTerm || undefined,
        }),
        api.getMarketStats(),
      ]);
      setListings(listingsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, organicOnly, searchTerm]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingForOrder) return;
    setIsOrdering(true);
    try {
      await api.placeOrder({
        listing_id: selectedListingForOrder.id,
        buyer_name: buyerName,
        buyer_contact: buyerContact,
        buyer_address: buyerAddress,
        quantity_kg: orderQuantity,
      });
      setOrderSuccessMsg(`Successfully ordered ${orderQuantity} kg of ${selectedListingForOrder.crop_name}!`);
      setTimeout(() => {
        setSelectedListingForOrder(null);
        setOrderSuccessMsg(null);
        loadData();
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingListing(true);
    try {
      await api.createListing(newListing);
      setIsListingModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create listing');
    } finally {
      setIsSubmittingListing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Farm-to-Market Produce Portal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Direct transparent agricultural marketplace eliminating middleman markups.
          </p>
        </div>

        <button
          onClick={() => setIsListingModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          List Harvested Batch
        </button>
      </div>

      {/* Market Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Available Inventory</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {(stats.total_stock_kg / 1000).toFixed(1)} <span className="text-sm font-semibold text-slate-500">Metric Tons</span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">Fresh farm batches ready to ship</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Active Crop Batches</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats.total_listings} <span className="text-sm font-semibold text-slate-500">Listings</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified local farmers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Fulfilled Orders</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {stats.total_orders} <span className="text-sm font-semibold text-slate-500">Deliveries</span>
          </div>
          <span className="text-[11px] text-indigo-600 mt-1 block">100% On-time farm dispatch</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search crops, varieties, farmers, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Organic Only switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={organicOnly}
            onChange={(e) => setOrganicOnly(e.target.checked)}
            className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
          />
          <span>Certified Organic Only</span>
        </label>
      </div>

      {/* Produce Listings Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-500 animate-pulse">
          Loading market inventory...
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200/80">
          <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
          <p className="text-xs">No produce listings found matching your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                    alt={item.crop_name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-black/60 text-white backdrop-blur-md">
                      {item.category}
                    </span>
                    {item.is_organic && (
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 text-white backdrop-blur-md">
                        Organic
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-xl text-slate-900 font-black text-sm shadow-sm">
                    ${item.price_per_kg.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">/ kg</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{item.crop_name}</h4>
                      {item.variety && (
                        <p className="text-xs text-slate-500">{item.variety}</p>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{item.description}</p>
                  )}

                  <div className="mt-4 space-y-1.5 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location} ({item.farmer_name})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Harvested on: {item.harvest_date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer & Action */}
              <div className="p-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700">
                    Stock: <strong className="text-indigo-600">{item.quantity_kg.toLocaleString()} kg</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedListingForOrder(item);
                      setOrderQuantity(Math.min(50, item.quantity_kg));
                    }}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ORDER MODAL */}
      {selectedListingForOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setSelectedListingForOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {orderSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Order Confirmed!</h4>
                <p className="text-xs text-slate-600">{orderSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Direct Farm Order</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedListingForOrder.crop_name}</h3>
                  <p className="text-xs text-slate-500">Sold by {selectedListingForOrder.farmer_name} • ${selectedListingForOrder.price_per_kg.toFixed(2)}/kg</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Order Quantity (kg)</span>
                    <span className="text-indigo-600">Max: {selectedListingForOrder.quantity_kg} kg</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={selectedListingForOrder.quantity_kg}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Buyer / Organization Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone / Email</label>
                  <input
                    type="text"
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Delivery Destination</label>
                  <input
                    type="text"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Total Purchase Price:</span>
                  <span className="text-xl font-black text-slate-900">
                    ${(orderQuantity * selectedListingForOrder.price_per_kg).toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isOrdering}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isOrdering ? 'Confirming Dispatch...' : 'Place Secure Produce Order'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE LISTING MODAL */}
      {isListingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsListingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">List Harvested Crop Batch</h3>
                <p className="text-xs text-slate-500">Make your freshly harvested produce available to distributors and buyers.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Farmer / Farm Name</label>
                  <input
                    type="text"
                    value={newListing.farmer_name}
                    placeholder="e.g. Ramesh Patel"
                    onChange={(e) => setNewListing({ ...newListing, farmer_name: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Crop Name</label>
                  <input
                    type="text"
                    value={newListing.crop_name}
                    placeholder="e.g. Cherry Tomatoes"
                    onChange={(e) => setNewListing({ ...newListing, crop_name: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Variety / Cultivar</label>
                  <input
                    type="text"
                    value={newListing.variety}
                    placeholder="e.g. Sweet 100 F1"
                    onChange={(e) => setNewListing({ ...newListing, variety: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newListing.category}
                    onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Vegetable">Vegetable</option>
                    <option value="Grain">Grain</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Pulse">Pulse</option>
                    <option value="Cash Crop">Cash Crop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    min="1"
                    value={newListing.quantity_kg}
                    onChange={(e) => setNewListing({ ...newListing, quantity_kg: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Price ($ / kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={newListing.price_per_kg}
                    onChange={(e) => setNewListing({ ...newListing, price_per_kg: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={newListing.harvest_date}
                    onChange={(e) => setNewListing({ ...newListing, harvest_date: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Location / Zone</label>
                  <input
                    type="text"
                    value={newListing.location}
                    onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description / Quality Notes</label>
                <textarea
                  rows={2}
                  value={newListing.description}
                  placeholder="Grading, moisture levels, pesticide history..."
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={newListing.is_organic}
                  onChange={(e) => setNewListing({ ...newListing, is_organic: e.target.checked })}
                  className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
                />
                <span>Certified 100% Organic Produce</span>
              </label>

              <button
                type="submit"
                disabled={isSubmittingListing}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isSubmittingListing ? 'Publishing Batch...' : 'Publish Produce Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
