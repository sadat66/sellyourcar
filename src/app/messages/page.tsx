"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";
import {
    MessageSquare,
    Send,
    ArrowLeft,
    User,
    Car,
} from "lucide-react";

interface Conversation {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    carId: string;
    sender: { id: string; fullName: string | null; avatar: string | null; email?: string };
    receiver: { id: string; fullName: string | null; avatar: string | null; email?: string };
    car: { id: string; title: string; images: string[]; price: number };
    createdAt: string;
    unreadCount: number;
}

interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    sender: { id: string; fullName: string | null; avatar: string | null };
    createdAt: string;
}

export default function MessagesPage() {
    const router = useRouter();
    const supabase = createClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [userId, setUserId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const init = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            setUserId(user.id);

            try {
                const res = await fetch("/api/messages");
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                }
            } catch {
                toast.error("Failed to load messages");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const openConversation = async (conv: Conversation) => {
        setSelectedConv(conv);
        const otherUserId =
            conv.senderId === userId ? conv.receiverId : conv.senderId;

        try {
            const res = await fetch(
                `/api/messages?carId=${conv.carId}&otherUserId=${otherUserId}`
            );
            if (res.ok) {
                const data = await res.json();
                setChatMessages(data);
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } catch {
            toast.error("Failed to load conversation");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConv || !userId) return;

        setSending(true);
        const otherUserId =
            selectedConv.senderId === userId
                ? selectedConv.receiverId
                : selectedConv.senderId;

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: newMessage,
                    receiverId: otherUserId,
                    carId: selectedConv.carId,
                }),
            });

            if (res.ok) {
                const msg = await res.json();
                setChatMessages((prev) => [...prev, msg]);
                setNewMessage("");
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } catch {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const getOtherUser = (conv: Conversation) => {
        return conv.senderId === userId ? conv.receiver : conv.sender;
    };

    if (loading) {
        return (
            <div className="pt-20 pb-12 min-h-screen">
                <div className="container-custom">
                    <div className="skeleton h-8 w-48 mb-6" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-20 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-12 min-h-screen">
            <div className="container-custom">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <MessageSquare size={28} className="text-[var(--accent)]" />
                    Messages
                </h1>

                <div
                    className="glass-card rounded-2xl overflow-hidden"
                    style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
                >
                    <div className="flex h-full">
                        {/* Conversation List */}
                        <div
                            className={`w-full md:w-96 border-r border-[var(--border)] flex flex-col ${selectedConv ? "hidden md:flex" : "flex"
                                }`}
                        >
                            <div className="p-4 border-b border-[var(--border)]">
                                <h2 className="text-sm font-semibold text-white">
                                    Conversations ({conversations.length})
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {conversations.length > 0 ? (
                                    conversations.map((conv) => {
                                        const other = getOtherUser(conv);
                                        const isSelected = selectedConv?.carId === conv.carId &&
                                            (selectedConv?.senderId === conv.senderId || selectedConv?.receiverId === conv.receiverId);

                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => openConversation(conv)}
                                                className={`w-full p-4 text-left border-b border-[var(--border)] transition-colors hover:bg-white/5 ${isSelected ? "bg-white/5" : ""
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Avatar */}
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center shrink-0">
                                                        <User size={16} className="text-white" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-white truncate">
                                                                {other?.fullName || other?.email || "User"}
                                                            </span>
                                                            <span className="text-xs text-[var(--muted)] shrink-0">
                                                                {timeAgo(conv.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[var(--accent)] truncate mt-0.5">
                                                            {conv.car?.title}
                                                        </p>
                                                        <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                                                            {conv.content}
                                                        </p>
                                                    </div>

                                                    {conv.unreadCount > 0 && (
                                                        <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                        <MessageSquare
                                            size={40}
                                            className="text-[var(--muted)] mb-3 opacity-40"
                                        />
                                        <p className="text-sm text-[var(--muted)]">
                                            No messages yet
                                        </p>
                                        <p className="text-xs text-[var(--muted)] mt-1">
                                            Contact a seller to start a conversation
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div
                            className={`flex-1 flex flex-col ${selectedConv ? "flex" : "hidden md:flex"
                                }`}
                        >
                            {selectedConv ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedConv(null)}
                                            className="md:hidden btn-ghost"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center">
                                            <User size={14} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {getOtherUser(selectedConv)?.fullName || "User"}
                                            </p>
                                            <p className="text-xs text-[var(--accent)] truncate">
                                                {selectedConv.car?.title} • {formatPrice(selectedConv.car?.price)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {chatMessages.map((msg) => {
                                            const isOwn = msg.senderId === userId;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn
                                                                ? "bg-[var(--accent)] text-white rounded-br-md"
                                                                : "bg-[var(--card-hover)] text-white rounded-bl-md border border-[var(--border)]"
                                                            }`}
                                                    >
                                                        <p className="text-sm">{msg.content}</p>
                                                        <p
                                                            className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-[var(--muted)]"
                                                                }`}
                                                        >
                                                            {timeAgo(msg.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-[var(--border)]">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="input-field flex-1"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        sendMessage();
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={sendMessage}
                                                disabled={sending || !newMessage.trim()}
                                                className="btn-primary"
                                            >
                                                {sending ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Send size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // No conversation selected
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                    <div
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                                        style={{
                                            background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                                            opacity: 0.2,
                                        }}
                                    >
                                        <MessageSquare size={36} className="text-[var(--accent)]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Select a Conversation
                                    </h3>
                                    <p className="text-sm text-[var(--muted)]">
                                        Choose a conversation from the list to start messaging
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
