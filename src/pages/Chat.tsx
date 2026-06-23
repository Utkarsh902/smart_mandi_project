import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat list
  useEffect(() => {
    if (!user || !profile) return;
    
    const roleField = profile.role === 'farmer' ? 'farmerId' : 'buyerId';
    const q = query(collection(db, 'chats'), where(roleField, '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort by updatedAt descending
      chatsData.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
      setChats(chatsData);
    });
    
    return () => unsubscribe();
  }, [user, profile]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user) return;

    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        senderId: user.uid,
        text,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const activeChat = chats.find(c => c.id === chatId);

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className={clsx(
        "w-full md:w-80 border-r border-stone-200 flex flex-col",
        chatId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <h2 className="font-bold text-lg text-stone-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-stone-500 text-sm mt-10">
              No conversations yet.
            </div>
          ) : (
            chats.map((chat) => {
              const otherName = profile?.role === 'farmer' ? chat.buyerName : chat.farmerName;
              return (
                <div 
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className={clsx(
                    "p-4 border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors",
                    chatId === chat.id && "bg-stone-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {otherName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-stone-900 truncate">{otherName}</h3>
                        {chat.updatedAt && (
                          <span className="text-xs text-stone-500">
                            {format(chat.updatedAt.toDate(), 'MMM d')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-green-600 font-medium truncate mb-1">{chat.cropName}</p>
                      <p className="text-sm text-stone-500 truncate">{chat.lastMessage || "Started a conversation"}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={clsx(
        "flex-1 flex flex-col bg-stone-50/50",
        !chatId ? "hidden md:flex items-center justify-center" : "flex"
      )}>
        {!chatId ? (
          <div className="text-center text-stone-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-stone-300" />
            <p>Select a conversation to start chatting</p>
          </div>
        ) : activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 border-b border-stone-200 bg-white flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate('/chat')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-green-100 text-green-700">
                  {(profile?.role === 'farmer' ? activeChat.buyerName : activeChat.farmerName)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-stone-900">
                  {profile?.role === 'farmer' ? activeChat.buyerName : activeChat.farmerName}
                </h3>
                <p className="text-xs text-stone-500">Regarding: {activeChat.cropName}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.uid;
                return (
                  <div key={msg.id} className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
                    <div className={clsx(
                      "max-w-[75%] rounded-2xl px-4 py-2",
                      isMe ? "bg-green-600 text-white rounded-br-sm" : "bg-white border border-stone-200 text-stone-900 rounded-bl-sm"
                    )}>
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 mx-1">
                      {msg.createdAt ? format(msg.createdAt.toDate(), 'h:mm a') : 'Sending...'}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-stone-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()} className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
