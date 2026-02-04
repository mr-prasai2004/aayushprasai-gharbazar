import React, { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../../services/api';
import { DashboardLayout } from '../../components/Layout';
import { Send, Search, User, MessageSquare } from 'lucide-react';
import type { UserRole } from '../../types';

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
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string>('buyer');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            const parsed = JSON.parse(user);
            setCurrentUser(parsed);
            if (parsed.role) {
                // Ensure role is a valid UserRole or fallback
                setUserRole(parsed.role as UserRole);
            }
        }
    }, []);

    useEffect(() => {
        loadConversations();
        const interval = setInterval(() => {
            loadConversations();
            if (selectedUser) {
                const fetchMsgs = async () => {
                    try {
                        const data = await messagesApi.getChatHistory(selectedUser);
                        setMessages(data);
                        // Don't scroll to bottom on poll unless at bottom?
                        // For now keep simple
                    } catch (e) { }
                };
                fetchMsgs();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedUser]);

    const loadConversations = async () => {
        try {
            const data = await messagesApi.getConversations();
            setConversations(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load conversations', error);
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

    const handleSelectUser = (userId: string, userName: string) => {
        setSelectedUser(userId);
        setSelectedUserName(userName);
        loadMessages(userId);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const tempMessage = {
                messageId: 'temp-' + Date.now(),
                senderId: currentUser?.userId,
                receiverId: selectedUser,
                content: newMessage,
                isRead: false,
                createdAt: new Date().toISOString(),
                senderName: currentUser?.fullName || 'Me',
                senderProfilePicture: '',
                receiverName: selectedUserName,
                receiverProfilePicture: '',
                propertyTitle: ''
            };

            // Optimistic update
            setMessages([...messages, tempMessage]);
            setNewMessage('');
            scrollToBottom();

            await messagesApi.send({
                receiverId: selectedUser,
                content: tempMessage.content
            });

            loadMessages(selectedUser);
            loadConversations();
        } catch (error) {
            console.error('Failed to send message', error);
            alert('Failed to send message');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <DashboardLayout role={userRole} title="Messages">
            <div className="h-[calc(100vh-140px)] bg-white rounded-xl shadow-lg overflow-hidden flex">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
                            Inbox
                        </h2>
                    </div>

                    <div className="overflow-y-auto grow">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No conversations yet.</p>
                                <p className="text-sm mt-2">Contact a seller or buyer to start chatting!</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.userId}
                                    onClick={() => handleSelectUser(conv.userId, conv.userName)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${selectedUser === conv.userId ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''}`}
                                >
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden shrink-0">
                                            <img
                                                src={conv.userProfilePicture || `https://ui-avatars.com/api/?name=${conv.userName}`}
                                                alt={conv.userName}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="ml-3 grow min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate">{conv.userName}</h3>
                                                <span className="text-xs text-gray-500">
                                                    {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{conv.lastMessage?.content || 'No messages yet'}</p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <div className="ml-2 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="p-4 border-t border-gray-200 text-xs text-gray-400 bg-gray-50">
                            <p>Logged in as: <span className="font-mono">{currentUser?.fullName}</span></p>
                            <p>ID: <span className="font-mono text-[10px] break-all">{currentUser?.userId}</span></p>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="w-2/3 flex flex-col bg-white">
                    {selectedUser ? (
                        <>
                            <div className="p-4 border-b border-gray-200 bg-white flex items-center shadow-sm z-10">
                                <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden mr-3">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${selectedUserName}`}
                                        alt={selectedUserName}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-800">{selectedUserName}</h3>
                            </div>

                            <div className="grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                                {messages.map((msg, index) => {
                                    const isMe = msg.senderId === currentUser?.userId;
                                    return (
                                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                                                <p className="text-sm">{msg.content}</p>
                                                {msg.propertyTitle && (
                                                    <div className="mt-1 text-xs opacity-75 border-t border-opacity-20 pt-1">
                                                        Ref: {msg.propertyTitle}
                                                    </div>
                                                )}
                                                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="grow border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition disabled:bg-gray-300"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="grow flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
