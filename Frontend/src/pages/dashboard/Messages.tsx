import React, { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../../services/api';
import { Send, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';

interface Message {
    messageId: string;
    senderId: string;
    senderName: string;
    senderProfilePicture: string;
    receiverId: string;
    receiverName: string;
    receiverProfilePicture: string;
    propertyId?: string;
    propertyTitle?: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

interface Conversation {
    userId: string;
    userName: string;
    userProfilePicture: string;
    lastMessage: Message;
    unreadCount: number;
}

export const Messages: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const selectedUserRef = useRef<string | null>(null);

    // Keep a ref in sync so polling closure always sees latest selected user
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    const handleBackToDashboard = () => {
        if (!currentUser) {
            navigate(-1);
            return;
        }
        
        const role = currentUser.role?.toUpperCase() || currentUser.Role?.toUpperCase();
        if (role === 'BUYER') {
             navigate('/dashboard/buyer');
        } else if (role === 'SELLER') {
             navigate('/dashboard/seller');
        } else if (role === 'ADMIN') {
             navigate('/dashboard/admin');
        } else {
             navigate(-1);
        }
    };

    useEffect(() => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    // Load conversations + set up polling
    useEffect(() => {
        loadConversations();

        // Poll every 5 seconds for new messages + conversations
        pollIntervalRef.current = setInterval(async () => {
            await loadConversations();
            if (selectedUserRef.current) {
                try {
                    const data = await messagesApi.getChatHistory(selectedUserRef.current);
                    setMessages(data);
                } catch { }
            }
        }, 5000);

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []); // run once on mount

    const loadConversations = async () => {
        try {
            const data = await messagesApi.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (otherUserId: string) => {
        try {
            const data = await messagesApi.getChatHistory(otherUserId);
            setMessages(data);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Failed to load messages', error);
        }
    };

    const handleSelectUser = async (userId: string, userName: string) => {
        setSelectedUser(userId);
        setSelectedUserName(userName);
        await loadMessages(userId);
        // Refresh conversations to clear unread count for this conversation
        loadConversations();
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic UI update
        const tempMessage: Message = {
            messageId: 'temp-' + Date.now(),
            senderId: currentUser?.userId || '',
            receiverId: selectedUser,
            content: messageContent,
            isRead: false,
            createdAt: new Date().toISOString(),
            senderName: currentUser?.fullName || 'Me',
            senderProfilePicture: '',
            receiverName: selectedUserName,
            receiverProfilePicture: '',
            propertyTitle: ''
        };
        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();

        try {
            // Always use HTTP API — this guarantees the message is persisted to the database
            const saved = await messagesApi.send({
                receiverId: selectedUser,
                content: messageContent
            });

            // Replace the temp message with the real saved one
            setMessages(prev => prev.map(m => m.messageId === tempMessage.messageId ? saved : m));

            // Refresh conversations sidebar to show latest message
            await loadConversations();
        } catch (error) {
            console.error('Failed to send message', error);
            // Remove the optimistic temp message on failure
            setMessages(prev => prev.filter(m => m.messageId !== tempMessage.messageId));
            toast.error('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col md:static md:z-auto md:h-[calc(100vh-64px)] md:bg-gray-50 md:flex-row md:justify-center md:items-start md:p-4 lg:p-6">
            <div className="w-full h-full max-w-6xl bg-white md:rounded-lg overflow-hidden flex flex-col md:flex-row md:border md:border-gray-200 md:shadow-sm relative">
                {/* Conversations Sidebar */}
                <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-[350px] md:border-r border-gray-200 flex-col shrink-0 bg-white h-full`}>
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-col shrink-0">
                        <button onClick={handleBackToDashboard} className="flex items-center text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4 w-fit md:mb-3">
                            <ArrowLeft className="h-4 w-4 mr-1.5" />
                            Back to Dashboard
                        </button>
                        <h2 className="text-xl md:text-lg font-bold text-gray-900">Messages</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Your conversations</p>
                    </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Loading...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-6 text-center">
                            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-600 text-xs font-medium">No conversations yet</p>
                            <p className="text-gray-400 text-xs mt-1">Messages from buyers will appear here</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.userId}
                                onClick={() => handleSelectUser(conv.userId, conv.userName)}
                                className={`px-3 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${selectedUser === conv.userId ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-9 w-9 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                                        <img
                                            src={conv.userProfilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.userName)}&background=random`}
                                            alt={conv.userName}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xs font-semibold text-gray-900 truncate">{conv.userName}</h3>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                                                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {conv.lastMessage?.content || 'No messages yet'}
                                        </p>
                                        {conv.lastMessage?.propertyTitle && (
                                            <p className="text-[10px] text-blue-500 truncate">📍 {conv.lastMessage.propertyTitle}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-gray-50 overflow-hidden h-full z-10 w-full`}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3 shrink-0 shadow-sm min-h-[64px]">
                            <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 flex items-center justify-center rounded-full transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserName)}&background=random`}
                                    alt={selectedUserName}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-sm md:text-base font-semibold text-gray-900 truncate">{selectedUserName}</h2>
                                <p className="text-[10px] md:text-xs text-gray-400">Refreshes every 5 seconds</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <div className="text-center">
                                        <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm">No messages yet. Start the conversation!</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.senderId === currentUser?.userId;
                                    return (
                                        <div key={msg.messageId || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {!isMe && (
                                                <div className="h-6 w-6 rounded-full bg-gray-300 mr-2 flex-shrink-0 self-end overflow-hidden">
                                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'U')}&size=24`} alt="" className="h-full w-full" />
                                                </div>
                                            )}
                                            <div className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-2xl text-sm ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                                                {msg.propertyTitle && (
                                                    <p className={`text-xs mb-1.5 px-2 py-1 rounded-md ${isMe ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 text-gray-600'}`}>
                                                        📍 {msg.propertyTitle}
                                                    </p>
                                                )}
                                                <p>{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    {format(new Date(msg.createdAt), 'HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="px-4 py-3 bg-white border-t border-gray-200 shrink-0">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message ${selectedUserName}...`}
                                    disabled={sending}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-blue-600 text-white rounded-full p-2.5 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex-shrink-0"
                                >
                                    {sending
                                        ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <Send className="h-4 w-4" />
                                    }
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <MessageSquare className="h-16 w-16 mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-600 text-sm font-medium">Select a conversation</p>
                            <p className="text-gray-400 text-xs mt-1">Choose from your messages on the left</p>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};
