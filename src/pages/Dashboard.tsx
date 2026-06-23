import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { compressImage } from '../lib/imageUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Sprout, TrendingUp, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, profile } = useAuthStore();
  const [crops, setCrops] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState(profile?.location || '');
  const [image, setImage] = useState<File | null>(null);
  
  // AI Suggestion State
  const [priceData, setPriceData] = useState<{minPrice: number, maxPrice: number, modalPrice: number, recommendedPrice: number, source?: string} | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'crops'), where('farmerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cropsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCrops(cropsData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleGetSuggestion = async () => {
    if (!name || !location) {
      toast.error("Please fill crop name and location first");
      return;
    }
    setSuggesting(true);
    try {
      // 1. Check Firestore Cache
      const cacheKey = `${name.toLowerCase()}_${location.toLowerCase()}`.replace(/\s+/g, '_');
      const cacheRef = doc(db, 'price_cache', cacheKey);
      const cacheSnap = await getDoc(cacheRef);

      if (cacheSnap.exists()) {
        const data = cacheSnap.data();
        // Cache valid for 24 hours
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          setPriceData(data as any);
          setPrice(data.recommendedPrice.toString());
          toast.success("Price loaded from cache!");
          setSuggesting(false);
          return;
        }
      }

      // 2. Fetch from API if not cached or expired
      const res = await fetch('/api/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: name, location })
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // 3. Save to Firestore Cache
      const cacheData = {
        ...data,
        timestamp: Date.now()
      };
      await setDoc(cacheRef, cacheData);

      setPriceData(cacheData);
      setPrice(cacheData.recommendedPrice.toString());
      toast.success("Real-time price fetched and cached!");
    } catch (error) {
      toast.error("Failed to get suggestion");
      console.error(error);
    } finally {
      setSuggesting(false);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);

    try {
      let imageUrl = '';
      if (image) {
        toast.loading('Compressing image...', { id: 'upload' });
        const compressedBlob = await compressImage(image, 200);
        const imageRef = ref(storage, `crops/${user.uid}/${Date.now()}_${image.name.split('.')[0]}.webp`);
        toast.loading('Uploading image...', { id: 'upload' });
        const snapshot = await uploadBytes(imageRef, compressedBlob);
        imageUrl = await getDownloadURL(snapshot.ref);
        toast.dismiss('upload');
      }

      await addDoc(collection(db, 'crops'), {
        farmerId: user.uid,
        farmerName: profile.name,
        name,
        quantity: Number(quantity),
        price: Number(price),
        location,
        imageUrl,
        createdAt: serverTimestamp()
      });

      toast.success('Crop added successfully');
      setIsAddOpen(false);
      setName('');
      setQuantity('');
      setPrice('');
      setImage(null);
      setPriceData(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add crop');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cropId: string) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    try {
      await deleteDoc(doc(db, 'crops', cropId));
      toast.success('Crop deleted');
    } catch (error) {
      toast.error('Failed to delete crop');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-gradient-to-r from-emerald-100 via-lime-50 to-yellow-50 p-6 shadow-[0_30px_80px_-40px_rgba(16,185,129,0.3)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Farm Dashboard</h1>
            <p className="mt-2 text-slate-600 max-w-xl">Add crops, check prices, and manage orders with the Smart Mandi dashboard.</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white gap-2 py-3 px-6 rounded-full shadow-lg shadow-emerald-300/30" />}>
              <Plus className="w-4 h-4" /> Add Crop
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-[2rem] border border-emerald-100 shadow-[0_40px_120px_-50px_rgba(16,185,129,0.35)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">List a New Crop</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCrop} className="space-y-5 mt-4">
            <div className="space-y-3">
              <Label>Crop Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Wheat, Rice" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <Label>Quantity (Quintals)</Label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="1" />
              </div>
              <div className="space-y-3">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Expected Price (₹ / Quintal)</Label>
                <Button type="button" variant="ghost" size="sm" onClick={handleGetSuggestion} disabled={suggesting} className="h-7 text-xs text-emerald-700">
                  <TrendingUp className="w-3 h-3 mr-1" /> Get AI Price
                </Button>
              </div>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="1" />

              {priceData && (
                <div className="rounded-3xl bg-emerald-50 p-4 border border-emerald-100 shadow-sm mt-2">
                  <div className="flex flex-col gap-3 text-sm text-slate-700">
                    <p className="font-semibold text-emerald-700">Market Insights {priceData.source ? `(source: ${priceData.source})` : ''}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-2xl bg-white p-3 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Min</p>
                        <p className="mt-1 font-bold text-slate-900">₹{priceData.minPrice}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Modal</p>
                        <p className="mt-1 font-bold text-slate-900">₹{priceData.modalPrice}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Max</p>
                        <p className="mt-1 font-bold text-slate-900">₹{priceData.maxPrice}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Recommended Selling Price: ₹{priceData.recommendedPrice}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Label>Crop Image (Optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            </div>
            <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-3xl py-3" disabled={loading}>
              {loading ? 'Listing...' : 'List Crop'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {crops.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-10 border border-dashed border-emerald-100 text-center shadow-sm">
          <Sprout className="w-14 h-14 text-emerald-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900">No crops listed yet</h3>
          <p className="mt-2 text-slate-500">Add your first crop and start selling directly to buyers.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {crops.map((crop) => (
            <Card key={crop.id} className="overflow-hidden rounded-[1.75rem] border border-emerald-100 shadow-[0_20px_60px_-30px_rgba(16,185,129,0.22)] transition-transform duration-300 hover:-translate-y-1">
              {crop.imageUrl ? (
                <img src={crop.imageUrl} alt={crop.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-emerald-50 flex items-center justify-center">
                  <Sprout className="w-12 h-12 text-emerald-300" />
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{crop.name}</h3>
                    <p className="text-sm text-slate-500">{crop.location}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(crop.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
                  <div className="rounded-3xl bg-emerald-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Quantity</p>
                    <p className="mt-2 font-semibold text-slate-900">{crop.quantity} Q</p>
                  </div>
                  <div className="rounded-3xl bg-yellow-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Price</p>
                    <p className="mt-2 font-semibold text-emerald-800">₹{crop.price} / Q</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
