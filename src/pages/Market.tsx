import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, addDoc, serverTimestamp, getDocs, where, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, MessageSquare, Sprout, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 8;

export default function Market() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loadingChat, setLoadingChat] = useState<string | null>(null);
  
  // Pagination & Loading state
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchCrops = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      let q = query(
        collection(db, 'crops'),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (isLoadMore && lastVisible) {
        q = query(
          collection(db, 'crops'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const cropsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (snapshot.docs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }

      if (isLoadMore) {
        setCrops(prev => [...prev, ...cropsData]);
      } else {
        setCrops(cropsData);
      }
    } catch (error) {
      console.error("Error fetching crops:", error);
      toast.error("Failed to load crops");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible]);

  useEffect(() => {
    fetchCrops();
  }, []); // Initial fetch

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = crop.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const handleContactFarmer = async (crop: any) => {
    if (!user || !profile) return;
    setLoadingChat(crop.id);

    try {
      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, 
        where('cropId', '==', crop.id),
        where('buyerId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Chat exists, navigate to it
        navigate(`/chat/${querySnapshot.docs[0].id}`);
      } else {
        // Create new chat
        const newChatRef = await addDoc(chatsRef, {
          cropId: crop.id,
          cropName: crop.name,
          farmerId: crop.farmerId,
          buyerId: user.uid,
          farmerName: crop.farmerName,
          buyerName: profile.name,
          lastMessage: '',
          updatedAt: serverTimestamp()
        });
        navigate(`/chat/${newChatRef.id}`);
      }
    } catch (error) {
      toast.error('Failed to start chat');
      console.error(error);
    } finally {
      setLoadingChat(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Mandi Market</h1>
        <p className="text-stone-600">Browse fresh produce directly from farmers</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <Input 
            placeholder="Search crops (e.g., Wheat, Rice)..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <Input 
            placeholder="Filter by location..." 
            className="pl-10"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden flex flex-col animate-pulse">
              <div className="w-full h-48 bg-stone-200"></div>
              <CardContent className="p-4 flex-1 flex flex-col space-y-4">
                <div className="h-6 bg-stone-200 rounded w-3/4"></div>
                <div className="h-4 bg-stone-200 rounded w-1/2"></div>
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-full"></div>
                  <div className="h-4 bg-stone-200 rounded w-2/3"></div>
                </div>
                <div className="h-10 bg-stone-200 rounded w-full mt-6"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredCrops.map((crop) => (
            <Card key={crop.id} className="overflow-hidden flex flex-col">
              {crop.imageUrl ? (
                <img src={crop.imageUrl} alt={crop.name} loading="lazy" className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-stone-100 flex items-center justify-center">
                  <Sprout className="w-12 h-12 text-stone-300" />
                </div>
              )}
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">{crop.name}</h3>
                    <div className="flex items-center text-sm text-stone-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" /> {crop.location}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ₹{crop.price}/Q
                  </Badge>
                </div>
                
                <div className="mt-4 pt-4 border-t border-stone-100 flex-1">
                  <p className="text-sm text-stone-600 mb-1">Farmer: <span className="font-medium text-stone-900">{crop.farmerName}</span></p>
                  <p className="text-sm text-stone-600">Available: <span className="font-medium text-stone-900">{crop.quantity} Quintals</span></p>
                </div>

                <Button 
                  className="w-full mt-6 gap-2" 
                  onClick={() => handleContactFarmer(crop)}
                  disabled={loadingChat === crop.id}
                >
                  <MessageSquare className="w-4 h-4" /> 
                  {loadingChat === crop.id ? 'Connecting...' : 'Contact Farmer'}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
        
        {!loading && filteredCrops.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-stone-500">No crops found matching your search.</p>
          </div>
        )}
      </div>

      {!loading && hasMore && filteredCrops.length > 0 && searchTerm === '' && locationFilter === '' && (
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => fetchCrops(true)} 
            disabled={loadingMore}
            className="w-full sm:w-auto"
          >
            {loadingMore ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
