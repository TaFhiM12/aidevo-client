import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search,
  MessageCircle,
  Send,
  Plus,
  GraduationCap,
  MapPin,
  Building2,
  ChevronLeft,
  Menu,
  User,
  Users,
  Mail,
  Calendar,
  Smile,
  CheckCheck,
  Check,
  Paperclip,
  X,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import socketService from "../../../utils/Socket";
import useAuth from "../../../hooks/useAuth";
import API from "../../../utils/api";
import { getOtherParticipant } from '../../../utils/chatParticipant';
import { uploadChatAttachment } from "../../../utils/uploadToCloudinary";
import useInfiniteScrollSlice from "../../../hooks/useInfiniteScrollSlice";

const MychatList = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [myOrganizations, setMyOrganizations] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState("sidebar");
  const [activeTab, setActiveTab] = useState("chats");
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentUserObjectId, setCurrentUserObjectId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [messageSearchTerm, setMessageSearchTerm] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentMeta, setAttachmentMeta] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const QUICK_REPLIES = ["Hello!", "Thanks for the update", "Can we discuss this today?", "Sure, sounds good"];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && mobileView === 'sidebar') {
        setMobileView('sidebar');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileView]);

  const currentUserQuery = useQuery({
    queryKey: ["chat-current-user", user?.uid],
    enabled: Boolean(user?.uid),
    queryFn: async () => {
      const response = await API.get(`/users/uid/${user.uid}`);
      return response?.data?._id || null;
    },
    staleTime: 1000 * 60 * 10,
  });

  const conversationsQuery = useQuery({
    queryKey: ["chat-conversations", user?.uid],
    enabled: Boolean(user?.uid),
    queryFn: async () => {
      const response = await API.get(`/conversations/user/${user.uid}`);
      return Array.isArray(response?.data) ? response.data : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const organizationsQuery = useQuery({
    queryKey: ["chat-organizations"],
    queryFn: async () => {
      const response = await API.get("/organizations");
      return Array.isArray(response?.data) ? response.data : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const myOrganizationsQuery = useQuery({
    queryKey: ["chat-my-organizations", currentUserObjectId],
    enabled: Boolean(currentUserObjectId),
    queryFn: async () => {
      const response = await API.get(`/students/${currentUserObjectId}/organizations`);
      return Array.isArray(response?.data) ? response.data : [];
    },
    staleTime: 1000 * 60 * 3,
  });

  const handleNewMessage = useCallback(
    (message) => {
      const normalizedConversationId =
        typeof message.conversationId === "object" &&
        message.conversationId !== null &&
        "$oid" in message.conversationId
          ? message.conversationId.$oid
          : String(message.conversationId);

      const selectedConversationId = selectedConversation?._id
        ? String(selectedConversation._id)
        : null;

      if (
        selectedConversationId &&
        normalizedConversationId === selectedConversationId
      ) {
        setMessages((prev) => [...prev, message]);

        setConversations((prev) =>
          prev.map((conv) =>
            String(conv._id) === normalizedConversationId
              ? {
                  ...conv,
                  lastMessage: message.text || (message.attachment ? `Attachment: ${message.attachment.name}` : ""),
                  lastMessageTime: message.timestamp,
                  unreadCount:
                    String(conv._id) === selectedConversationId
                      ? 0
                      : (conv.unreadCount || 0) + 1,
                }
              : conv
          )
        );
      } else {
        setConversations((prev) =>
          prev.map((conv) =>
            String(conv._id) === normalizedConversationId
              ? {
                  ...conv,
                  lastMessage: message.text || (message.attachment ? `Attachment: ${message.attachment.name}` : ""),
                  lastMessageTime: message.timestamp,
                  unreadCount: (conv.unreadCount || 0) + 1,
                }
              : conv
          )
        );
      }
    },
    [selectedConversation]
  );

  const handleMessageDeliveryUpdated = useCallback(
    ({ conversationId, messageId, delivered, deliveredAt }) => {
      if (String(conversationId) !== String(selectedConversation?._id)) return;

      setMessages((prev) =>
        prev.map((message) =>
          String(message._id) === String(messageId)
            ? {
                ...message,
                delivered: Boolean(delivered),
                deliveredAt: deliveredAt || message.deliveredAt || null,
              }
            : message
        )
      );
    },
    [selectedConversation]
  );

  const handleMessagesRead = useCallback(
    ({ conversationId, userId }) => {
      if (String(conversationId) !== String(selectedConversation?._id)) return;
      if (String(userId) === String(currentUserObjectId)) return;

      setMessages((prev) =>
        prev.map((message) => {
          const isOwnMessage = String(message.senderId) === String(currentUserObjectId);
          if (!isOwnMessage) return message;
          return {
            ...message,
            read: true,
            delivered: true,
            readAt: new Date().toISOString(),
          };
        })
      );
    },
    [currentUserObjectId, selectedConversation]
  );

  useEffect(() => {
    const socket = socketService.connect();

    socket.on("connect", () => {
      setSocketConnected(true);
      socketService.registerUser(user?.uid);
      socketService.requestOnlineUsers();

      if (selectedConversation?._id) {
        socket.emit("join_conversation", selectedConversation._id);
      }
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    socket.on("receive_message", handleNewMessage);
    socket.on("message_delivery_updated", handleMessageDeliveryUpdated);
    socket.on("messages_read", handleMessagesRead);
    socket.on("online_users", (uids) => setOnlineUsers(Array.isArray(uids) ? uids : []));
    socket.on("user_status_changed", ({ uid, online }) => {
      setOnlineUsers((prev) => {
        if (online && !prev.includes(uid)) return [...prev, uid];
        if (!online) return prev.filter((item) => item !== uid);
        return prev;
      });
    });
    socket.on("typing_started", ({ conversationId, userId, userName }) => {
      if (String(conversationId) !== String(selectedConversation?._id)) return;
      setTypingUsers((prev) => ({ ...prev, [userId]: userName || "Typing..." }));
    });
    socket.on("typing_stopped", ({ userId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    // If the shared socket is already connected before this screen mounts,
    // the "connect" event won't fire again. Sync presence explicitly.
    if (socket.connected) {
      setSocketConnected(true);
      socketService.registerUser(user?.uid);
      socketService.requestOnlineUsers();

      if (selectedConversation?._id) {
        socket.emit("join_conversation", selectedConversation._id);
      }
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("receive_message", handleNewMessage);
      socket.off("message_delivery_updated", handleMessageDeliveryUpdated);
      socket.off("messages_read", handleMessagesRead);
      socket.off("online_users");
      socket.off("user_status_changed");
      socket.off("typing_started");
      socket.off("typing_stopped");
    };
  }, [handleMessageDeliveryUpdated, handleNewMessage, handleMessagesRead, selectedConversation, user?.uid]);

  useEffect(() => {
    setCurrentUserObjectId(currentUserQuery.data || null);
  }, [currentUserQuery.data]);

  useEffect(() => {
    if (Array.isArray(conversationsQuery.data)) {
      setConversations(conversationsQuery.data);
    }
  }, [conversationsQuery.data]);

  useEffect(() => {
    if (Array.isArray(organizationsQuery.data)) {
      setOrganizations(organizationsQuery.data);
    }
  }, [organizationsQuery.data]);

  useEffect(() => {
    if (Array.isArray(myOrganizationsQuery.data)) {
      setMyOrganizations(myOrganizationsQuery.data);
    }
  }, [myOrganizationsQuery.data]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation?._id) {
      fetchMessages(selectedConversation._id);
      joinConversation(selectedConversation._id);

      if (isMobile) {
        setMobileView("chat");
      }
    }
  }, [selectedConversation, currentUserObjectId, isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (conversationId) => {
    try {
      const response = await API.get(`/conversations/${conversationId}/messages`);
      setMessages(Array.isArray(response.data) ? response.data : []);

      const socket = socketService.getSocket();
      if (socket && conversationId && currentUserObjectId) {
        socket.emit("mark_as_read", {
          conversationId,
          userId: currentUserObjectId,
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const joinConversation = (conversationId) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("join_conversation", conversationId);
    }
  };

  const startNewChat = async (organization) => {
    try {
      setLoading(true);

      if (!currentUserObjectId) {
        throw new Error("Current user ID not found");
      }

      const response = await API.post("/conversations", {
        participantAId: currentUserObjectId,
        participantBId: organization._id,
      });

      const conversation = response.data;

      setSelectedConversation(conversation);
      setShowNewChat(false);
      setSearchTerm("");
      setActiveTab("chats");

      setConversations((prev) => {
        const exists = prev.find((conv) => String(conv._id) === String(conversation._id));
        return exists ? prev : [conversation, ...prev];
      });
    } catch (error) {
      console.error("Error starting new chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const socket = socketService.getSocket();
    const trimmedText = newMessage.trim();

    if (
      (!trimmedText && !attachmentMeta) ||
      !selectedConversation ||
      !socket ||
      !currentUserObjectId
    ) {
      return;
    }

    const messageData = {
      conversationId: selectedConversation._id,
      senderId: currentUserObjectId,
      senderName: user.displayName || user.name,
      senderUid: user?.uid || "",
      senderRole: "student",
      senderPhoto: user.photoURL,
      text: trimmedText,
      attachment: attachmentMeta,
    };

    setIsSending(true);
    socket.emit("send_message", messageData);
    socket.emit("typing_stop", {
      conversationId: selectedConversation._id,
      userId: currentUserObjectId,
    });
    isTypingRef.current = false;
    setNewMessage("");
    setAttachmentFile(null);
    setAttachmentMeta(null);
    setTimeout(() => setIsSending(false), 250);
    inputRef.current?.focus();
  };

  const handleAttachmentPick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    const uploaded = await uploadChatAttachment(file);
    setUploadingAttachment(false);

    if (!uploaded) {
      toast.error("Attachment upload failed");
      return;
    }

    setAttachmentFile(file);
    setAttachmentMeta(uploaded);
    toast.success("Attachment ready to send");
    inputRef.current?.focus();
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTyping = (value) => {
    setNewMessage(value);

    const socket = socketService.getSocket();
    if (!socket || !selectedConversation?._id || !currentUserObjectId) return;

    if (value.trim() && !isTypingRef.current) {
      socket.emit("typing_start", {
        conversationId: selectedConversation._id,
        userId: currentUserObjectId,
        userName: user?.displayName || user?.name || "Student",
      });
      isTypingRef.current = true;
    }

    if (!value.trim()) {
      socket.emit("typing_stop", {
        conversationId: selectedConversation._id,
        userId: currentUserObjectId,
      });
      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", {
        conversationId: selectedConversation._id,
        userId: currentUserObjectId,
      });
      isTypingRef.current = false;
    }, 1200);
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (newMessage.trim()) {
        sendMessage(event);
      }
    }
  };

  const getMessageTimestamp = (message) => {
    return message.timestamp || message.createdAt || new Date().toISOString();
  };

  const getOwnMessageTick = (message) => {
    if (message.read) {
      return <CheckCheck className="w-3 h-3 text-blue-200" />;
    }

    if (message.delivered) {
      return <CheckCheck className="w-3 h-3" />;
    }

    return <Check className="w-3 h-3" />;
  };

  const formatDateLabel = (value) => {
    const date = new Date(value);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) return "Today";

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredConversationMessages = useMemo(() => {
    const term = messageSearchTerm.trim().toLowerCase();
    if (!term) return messages;

    return messages.filter((message) => {
      const text = String(message.text || "").toLowerCase();
      const fileName = String(message.attachment?.name || "").toLowerCase();
      return text.includes(term) || fileName.includes(term);
    });
  }, [messages, messageSearchTerm]);

  const unreadDividerIndex = useMemo(() => {
    if (messageSearchTerm.trim()) return -1;
    const unreadCount = Number(selectedConversation?.unreadCount || 0);
    if (unreadCount <= 0 || unreadCount >= filteredConversationMessages.length) return -1;
    return filteredConversationMessages.length - unreadCount;
  }, [selectedConversation?.unreadCount, filteredConversationMessages, messageSearchTerm]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatJoinDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organization?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherParticipant(conv, currentUserObjectId);
    if (!other) return false;

    return (
      other.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      other.meta?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      other.meta?.campus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      other.meta?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredMyOrganizations = myOrganizations.filter(
    (org) =>
      org.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organizationEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organizationInfo?.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    visibleItems: visibleConversations,
    hasMore: hasMoreConversations,
    loadMoreRef: loadMoreConversationsRef,
  } = useInfiniteScrollSlice(filteredConversations, {
    pageSize: 12,
    resetDeps: [activeTab, searchTerm, filteredConversations.length],
  });

  const {
    visibleItems: visibleMyOrganizations,
    hasMore: hasMoreMyOrganizations,
    loadMoreRef: loadMoreMyOrganizationsRef,
  } = useInfiniteScrollSlice(filteredMyOrganizations, {
    pageSize: 10,
    resetDeps: [activeTab, searchTerm, filteredMyOrganizations.length],
  });

  const {
    visibleItems: visibleModalOrganizations,
    hasMore: hasMoreModalOrganizations,
    loadMoreRef: loadMoreModalOrganizationsRef,
  } = useInfiniteScrollSlice(filteredOrganizations, {
    pageSize: 12,
    resetDeps: [searchTerm, showNewChat, filteredOrganizations.length],
  });

  const selectedOtherParticipant = selectedConversation
    ? getOtherParticipant(selectedConversation, currentUserObjectId)
    : null;

  const selectedIsOnline = selectedOtherParticipant?.uid
    ? onlineUsers.includes(selectedOtherParticipant.uid)
    : false;

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="flex h-full max-h-[calc(100vh-130px)] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm">
        {/* Sidebar - Fixed */}
        <div className={`
          ${sidebarOpen ? 'w-80 lg:w-72' : 'w-20'} 
          flex-shrink-0 border-r border-slate-200 bg-white/98 backdrop-blur-xl 
          transition-all duration-300 ease-in-out
          ${isMobile && mobileView === 'chat' ? 'hidden' : 'flex flex-col'}
        `}>
          {/* Sidebar Header - Fixed */}
          <div className="p-3 lg:p-4 border-b border-slate-200/70 bg-white/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              {sidebarOpen ? (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg lg:text-xl font-bold text-slate-900">Messages</h2>
                    {/* ADD CONNECTION STATUS INDICATOR */}
                    <div className="flex items-center gap-1 text-xs">
                      <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                      <span className={socketConnected ? 'text-emerald-600 hidden sm:inline' : 'text-slate-500 hidden sm:inline'}>
                        {socketConnected ? 'Connected' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowNewChat(true)}
                      className="bg-gradient-to-r from-sky-500 to-blue-500 text-white p-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 mx-auto w-full">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewChat(true)}
                    className="bg-gradient-to-r from-sky-500 to-blue-500 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Menu className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
            
            {sidebarOpen && (
              <>
                {/* Tabs */}
                <div className="grid grid-cols-2 gap-1 bg-slate-100/60 p-1 rounded-2xl mt-3 mx-0.5">
                  <button
                    onClick={() => setActiveTab('chats')}
                    aria-label="Chats"
                    title="Chats"
                    className={`relative min-w-0 py-1.5 lg:py-2 px-1.5 lg:px-3 text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-200 ${
                      activeTab === 'chats'
                        ? 'bg-white text-sky-600 shadow-sm border border-sky-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-0.5 lg:gap-1 whitespace-nowrap">
                      <MessageCircle className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('my-organizations')}
                    aria-label="My Organizations"
                    title="My Organizations"
                    className={`relative min-w-0 py-1.5 lg:py-2 px-1.5 lg:px-3 text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-200 ${
                      activeTab === 'my-organizations'
                        ? 'bg-white text-sky-600 shadow-sm border border-sky-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-0.5 lg:gap-1 whitespace-nowrap">
                      <span className="relative inline-flex">
                        <Users className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                        {myOrganizations.length > 0 && (
                          <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-emerald-500 text-white text-[9px] leading-[14px] text-center shadow-sm">
                            {myOrganizations.length}
                          </span>
                        )}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mt-3 px-0.5 relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={
                      activeTab === 'chats' 
                        ? "Search conversations..." 
                        : "Search organizations..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100/60 border border-slate-200/70 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all duration-200"
                  />
                </div>
              </>
            )}
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {sidebarOpen ? (
              <>
                {/* Chats Tab */}
                {activeTab === 'chats' && (
                  <div>
                    <AnimatePresence>
                      {visibleConversations.map((conversation, index) => {
                        const other = getOtherParticipant(conversation, currentUserObjectId);
                        if (!other) return null;

                        return (
                          <motion.div
                            key={conversation._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                              setConversations((prev) =>
                                prev.map((conv) =>
                                  String(conv._id) === String(conversation._id)
                                    ? { ...conv, unreadCount: 0 }
                                    : conv
                                )
                              );
                              setSelectedConversation({ ...conversation, unreadCount: 0 });
                              setMessageSearchTerm("");
                              if (isMobile) setMobileView('chat');
                            }}
                            className={`p-3 border-b border-gray-100 cursor-pointer transition-all duration-200 group ${
                              selectedConversation?._id === conversation._id
                                ? 'bg-blue-50 border-blue-200'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={other.photo || `https://ui-avatars.com/api/?name=${other.name}&background=4bbeff&color=fff`}
                                  alt={other.name}
                                  className="w-12 h-12 rounded-xl object-cover"
                                />
                                {conversation.unreadCount > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                                    {other.name}
                                  </h3>
                                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                    {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ""}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 truncate mt-1">
                                  {conversation.lastMessage || 'No messages yet'}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <span className="text-xs text-gray-500 truncate">
                                    {other.meta?.type || other.role}
                                  </span>
                                  {other.meta?.campus && (
                                    <>
                                      <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs text-gray-500 truncate">
                                        {other.meta.campus}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {hasMoreConversations && filteredConversations.length > 0 && (
                      <div ref={loadMoreConversationsRef} className="py-4 text-center text-xs text-gray-500">
                        Loading more chats...
                      </div>
                    )}

                    {filteredConversations.length === 0 && (
                      <div className="text-center py-8 px-4">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No conversations found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Start a conversation with organizations
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* My Organizations Tab */}
                {activeTab === 'my-organizations' && (
                  <div>
                    <div className="p-3 bg-green-50 border-b border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-900">
                          My Organizations
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {myOrganizations.length}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {visibleMyOrganizations.map((org, index) => {
                        // Fix: Match by userId instead of name for reliability
                        const existingConv = conversations.find((conv) => {
                          const other = getOtherParticipant(conv, currentUserObjectId);
                          return String(other?.userId) === String(org.organizationId);
                        });

                        return (
                          <motion.div
                            key={org._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 group"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={org.organizationPhoto || `https://ui-avatars.com/api/?name=${org.organizationName}&background=4bbeff&color=fff`}
                                alt={org.organizationName}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                                    {org.organizationName}
                                  </h3>
                                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Member
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 truncate">
                                    {org.organizationEmail}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <Building2 className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {org.organizationInfo?.type}
                                  </span>
                                  {org.organizationInfo?.campus && (
                                    <>
                                      <MapPin className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">
                                        {org.organizationInfo.campus}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    Joined {formatJoinDate(org.joinedAt)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      if (existingConv) {
                                        setSelectedConversation(existingConv);
                                        if (isMobile) setMobileView('chat');
                                      } else {
                                        startNewChat({ 
                                          _id: org.organizationId,
                                          name: org.organizationName,
                                          email: org.organizationEmail,
                                          photoURL: org.organizationPhoto,
                                          organization: org.organizationInfo
                                        });
                                      }
                                    }}
                                    className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                  >
                                    Message
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {hasMoreMyOrganizations && filteredMyOrganizations.length > 0 && (
                      <div ref={loadMoreMyOrganizationsRef} className="py-4 text-center text-xs text-gray-500">
                        Loading more organizations...
                      </div>
                    )}

                    {filteredMyOrganizations.length === 0 && (
                      <div className="text-center py-8 px-4">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No organizations found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchTerm ? 'Try adjusting your search' : 'You are not a member of any organizations yet'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Collapsed sidebar view
              <div className="flex flex-col items-center py-4 space-y-4">
                <button
                  onClick={() => {
                    setActiveTab('chats');
                    setSidebarOpen(true);
                  }}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'chats' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('my-organizations');
                    setSidebarOpen(true);
                  }}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'my-organizations' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area - Flexible */}
        <div className={`
          flex-1 flex flex-col min-h-0
          ${isMobile && mobileView === 'sidebar' ? 'hidden' : 'flex'}
        `}>
          {selectedConversation ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="p-3 lg:p-4 border-b border-slate-200/70 bg-white/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isMobile && (
                      <button
                        onClick={() => setMobileView('sidebar')}
                        className="p-1.5 lg:p-2 hover:bg-slate-100 rounded-lg transition-colors mr-2"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                    <img
                      src={selectedOtherParticipant?.photo || `https://ui-avatars.com/api/?name=${selectedOtherParticipant?.name || "User"}&background=4bbeff&color=fff`}
                      alt={selectedOtherParticipant?.name || "User"}
                      className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {selectedOtherParticipant?.name || "Unknown User"}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{selectedOtherParticipant?.meta?.type || selectedOtherParticipant?.role}</span>
                        </div>
                        {selectedOtherParticipant?.meta?.campus && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{selectedOtherParticipant.meta.campus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {/* ADD CONNECTION STATUS INDICATOR */}
                    <div className="flex items-center gap-2 text-xs justify-end mb-1">
                      <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                      <span className={socketConnected ? 'text-emerald-600' : 'text-slate-500'}>
                        {socketConnected ? 'Connected' : 'Connecting'}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${selectedIsOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <p className={`text-xs mt-1 ${selectedIsOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {selectedIsOnline ? 'Active now' : 'Away'}
                    </p>
                  </div>
                </div>
                {Object.keys(typingUsers).length > 0 && (
                  <p className="text-xs text-sky-600 mt-2 ml-13">
                    {Object.values(typingUsers)[0]} is typing...
                  </p>
                )}
                <div className="mt-2.5 lg:mt-3 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={messageSearchTerm}
                    onChange={(e) => setMessageSearchTerm(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-8 pr-3 py-1.5 lg:py-2 text-xs lg:text-sm bg-slate-100/60 border border-slate-200/70 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                  />
                </div>
              </div>

              {/* Messages Area - Scrollable */}
              <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-blue-50/20 p-3 lg:p-4">
                <div className="space-y-2 lg:space-y-3 max-w-3xl">
                  {filteredConversationMessages.map((message, index) => {
                    const isOwnMessage = String(message.senderId) === String(currentUserObjectId);
                    const previousMessage = filteredConversationMessages[index - 1];
                    const currentTimestamp = getMessageTimestamp(message);
                    const previousTimestamp = previousMessage
                      ? getMessageTimestamp(previousMessage)
                      : null;

                    const showDateDivider =
                      !previousTimestamp ||
                      new Date(currentTimestamp).toDateString() !==
                        new Date(previousTimestamp).toDateString();

                    const previousIsOwn = previousMessage
                      ? String(previousMessage.senderId) === String(currentUserObjectId)
                      : false;
                    const showAvatar = !isOwnMessage && (!previousMessage || previousIsOwn);
                    
                    return (
                      <React.Fragment key={message._id || index}>
                        {unreadDividerIndex === index && (
                          <div className="flex items-center gap-3 py-2">
                            <div className="h-px bg-red-200 flex-1" />
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                              New messages
                            </span>
                            <div className="h-px bg-red-200 flex-1" />
                          </div>
                        )}

                        {showDateDivider && (
                          <div className="flex items-center justify-center py-2">
                            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                              {formatDateLabel(currentTimestamp)}
                            </span>
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end gap-2`}
                        >
                          {!isOwnMessage && (
                            <div className="w-7">
                              {showAvatar ? (
                                <img
                                  src={selectedOtherParticipant?.photo || `https://ui-avatars.com/api/?name=${selectedOtherParticipant?.name || "User"}&background=4bbeff&color=fff`}
                                  alt={selectedOtherParticipant?.name || "User"}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                              ) : null}
                            </div>
                          )}

                          <div
                            className={`max-w-xs lg:max-w-md rounded-2xl px-3 py-2.5 ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-200'
                            }`}
                          >
                            {message.text ? (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                            ) : null}

                            {message.attachment?.url && (
                              <div className={`${message.text ? "mt-2" : ""}`}>
                                {message.attachment.type === "image" ? (
                                  <a href={message.attachment.url} target="_blank" rel="noreferrer">
                                    <img
                                      src={message.attachment.url}
                                      alt={message.attachment.name || "Attachment"}
                                      className="max-h-52 rounded-lg border border-black/10"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={message.attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
                                      isOwnMessage ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span className="truncate max-w-[180px]">{message.attachment.name || "Attachment"}</span>
                                  </a>
                                )}
                              </div>
                            )}

                            <div className={`flex items-center justify-end space-x-1 mt-1 text-[11px] ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span>{formatTime(currentTimestamp)}</span>
                              {isOwnMessage && getOwnMessageTick(message)}
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {filteredConversationMessages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{messageSearchTerm ? "No matching messages" : "No messages yet"}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {messageSearchTerm
                        ? "Try another search keyword"
                        : `Start a conversation with ${selectedOtherParticipant?.name || "this user"}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input - Fixed */}
              <div className="p-2.5 lg:p-4 border-t border-slate-200/70 bg-white/50 backdrop-blur-sm flex-shrink-0 sticky bottom-0 z-20">
                <div className="space-y-2 lg:space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] lg:text-xs text-slate-500 inline-flex items-center gap-1 flex-shrink-0">
                      <Smile className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                      <span className="hidden sm:inline">Quick</span>
                    </span>
                    {QUICK_REPLIES.slice(0, 2).map((reply) => (
                      <button
                        key={reply}
                        type="button"
                        onClick={() => handleTyping(reply)}
                        className="text-[10px] lg:text-xs px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        {reply.length > 12 ? `${reply.substring(0, 12)}...` : reply}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={sendMessage} className="flex items-end gap-2 lg:gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentPick}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAttachment}
                      className="p-2 lg:p-2.5 rounded-lg border border-slate-200/70 bg-slate-100/60 hover:bg-slate-100 text-slate-600 disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                      <Paperclip className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
                    </button>

                    <textarea
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      rows={2}
                      placeholder="Message..."
                      className="flex-1 px-3 lg:px-4 py-2 lg:py-2.5 resize-none bg-slate-100/60 border border-slate-200/70 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all duration-200 text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={(!newMessage.trim() && !attachmentMeta) || !socketConnected || isSending || uploadingAttachment}
                      className="bg-gradient-to-r from-sky-500 to-blue-500 text-white p-2 lg:p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
                    </motion.button>
                  </form>

                  {(attachmentFile || uploadingAttachment) && (
                    <div className="rounded-lg border border-slate-200/70 bg-slate-100/40 px-2.5 lg:px-3 py-1.5 lg:py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="truncate">
                          {uploadingAttachment
                            ? "Uploading attachment..."
                            : attachmentFile?.name || attachmentMeta?.name}
                        </span>
                      </div>
                      {!uploadingAttachment && (
                        <button
                          type="button"
                          onClick={removeAttachment}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50/50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'chats' ? 'Select a conversation' : 'My Organizations'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {activeTab === 'chats' 
                    ? 'Choose a conversation from the list or start a new one'
                    : 'View and manage your organization memberships'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">New Chat</h3>
                  <button
                    onClick={() => {
                      setShowNewChat(false);
                      setSearchTerm('');
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {visibleModalOrganizations.map((org) => (
                  <motion.button
                    key={org._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => startNewChat(org)}
                    disabled={loading}
                    className="w-full p-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={org.photoURL || `https://ui-avatars.com/api/?name=${org.organization?.name}&background=4bbeff&color=fff`}
                        alt={org.organization?.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm text-left">
                          {org.organization?.name}
                        </h4>
                        <p className="text-xs text-gray-500 text-left">{org.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{org.organization?.type}</span>
                          {org.organization?.campus && (
                            <>
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{org.organization.campus}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}

                {hasMoreModalOrganizations && filteredOrganizations.length > 0 && (
                  <div ref={loadMoreModalOrganizationsRef} className="py-3 text-center text-xs text-gray-500">
                    Loading more organizations...
                  </div>
                )}

                {filteredOrganizations.length === 0 && (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No organizations found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MychatList;