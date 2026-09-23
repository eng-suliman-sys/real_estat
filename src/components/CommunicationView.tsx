import React, { useState, useEffect } from 'react';
import { ChatMessage, IntegrationStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  Building,
  Radio,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Key,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const CommunicationView: React.FC = () => {
  const { currentUser, role, refreshTrigger } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [activeConversation, setActiveConversation] = useState('conv_elena_karim');
  const [inputText, setInputText] = useState('');
  const [testServiceKey, setTestServiceKey] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; msg: string }>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [msgs, ints] = await Promise.all([api.getMessages(), api.getIntegrations()]);
        setMessages(msgs);
        setIntegrations(ints);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [refreshTrigger]);

  const conversationList = [
    {
      id: 'conv_elena_karim',
      name: 'Elena Rostova (Client)',
      property: 'OCTA Luminar Sky Residences · Unit 1202',
      role: 'CLIENT',
    },
    {
      id: 'conv_investor_soraya',
      name: 'Tariq Al-Sabah (Investor)',
      property: 'OCTA Elysium Private Island · Mansion 01',
      role: 'INVESTOR',
    },
    {
      id: 'conv_general',
      name: 'Internal Sales & Executive Operations',
      property: 'OCTA Properties Executive Board',
      role: 'MANAGEMENT',
    },
  ];

  const currentConvMessages = messages.filter(
    (m) => m.conversationId === activeConversation
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentConv = conversationList.find((c) => c.id === activeConversation);

    const res = await api.sendMessage({
      conversationId: activeConversation,
      text: inputText.trim(),
      propertyContext: currentConv?.property,
      senderId: currentUser?.id,
      senderName: currentUser?.name,
      senderRole: currentUser?.role,
    });

    if (res.success) {
      setMessages((prev) => [...prev, res.message]);
      setInputText('');
    }
  };

  const handleTestIntegration = async (serviceName: string) => {
    const key = testServiceKey[serviceName];
    const res = await api.testIntegration(serviceName, key || '');
    setTestResult((prev) => ({
      ...prev,
      [serviceName]: {
        success: res.success,
        msg: res.success ? res.message || 'Connected' : res.error || 'Connection failed',
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            OCTA Communications Center
          </span>
          <span className="text-[11px] font-mono text-[#64748B]">· REAL-TIME IN-APP MESSAGING</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
          Client & Investor Conversations
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Encrypted messaging with dedicated property & unit context attachments.
        </p>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Channels */}
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-4 space-y-2 text-xs">
          <div className="text-[10px] uppercase font-mono text-[#64748B] mb-2">
            Secure Channels ({conversationList.length})
          </div>
          {conversationList.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`p-3 rounded cursor-pointer transition-colors border ${
                activeConversation === conv.id
                  ? 'bg-[#151E28] border-[#D4AF37]/50 text-[#F3F4F6]'
                  : 'bg-[#090D11] border-[#1A232E] text-[#94A3B8] hover:border-[#2A3749]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#E2E8F0]">{conv.name}</span>
                <span className="text-[10px] font-mono text-[#C5A880]">{conv.role}</span>
              </div>
              <div className="text-[10px] text-[#64748B] truncate mt-1 flex items-center gap-1">
                <Building className="w-3 h-3 text-[#D4AF37]" />
                {conv.property}
              </div>
            </div>
          ))}
        </div>

        {/* Center/Right: Chat Thread */}
        <div className="lg:col-span-2 bg-[#0F151C] border border-[#1E293B] rounded-lg flex flex-col h-[520px] text-xs">
          {/* Thread Header with Property Context */}
          <div className="p-3.5 border-b border-[#1E293B] bg-[#090D11] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#F3F4F6]">
                {conversationList.find((c) => c.id === activeConversation)?.name}
              </div>
              <div className="text-[10px] text-[#D4AF37] font-mono flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3" />
                {conversationList.find((c) => c.id === activeConversation)?.property}
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Realtime
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {currentConvMessages.length === 0 ? (
              <div className="py-20 text-center text-[#64748B]">No messages in this channel yet.</div>
            ) : (
              currentConvMessages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-[#64748B] mb-0.5">
                      {msg.senderName} ({msg.senderRole})
                    </div>
                    <div
                      className={`max-w-md p-3 rounded-lg text-xs ${
                        isMe
                          ? 'bg-[#D4AF37] text-[#0B0F12] font-medium rounded-br-none'
                          : 'bg-[#151E28] text-[#E2E8F0] border border-[#2A3749] rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] font-mono text-[#475569] mt-0.5">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1E293B] bg-[#090D11] flex items-center gap-2">
            <input
              type="text"
              placeholder={`Reply to ${conversationList.find((c) => c.id === activeConversation)?.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#121820] border border-[#2A3749] text-[#E2E8F0] px-3 py-2 rounded focus:outline-none focus:border-[#D4AF37] text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#D4AF37] text-[#0B0F12] font-semibold rounded hover:brightness-110 flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>
      </div>

      {/* EXTERNAL INTEGRATIONS ARCHITECTURE (STRICT ADHERENCE TO NO-FAKE-DATA RULE) */}
      <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-cinzel text-lg font-bold text-[#F3F4F6]">
              External Communication & Provider Integrations
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/30">
              STRICT ACCURACY ENFORCED
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            In accordance with OCTA security policy, external messaging and gateway services require explicit credentials before real traffic is transmitted. Simulated or fake sending is permanently prohibited.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {integrations.map((item) => (
            <div
              key={item.serviceName}
              className="bg-[#090D11] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#F3F4F6]">{item.serviceName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/40 text-amber-400 border border-amber-500/30">
                    {item.status}
                  </span>
                </div>
                <p className="text-[#94A3B8] text-[11px] mt-1.5">{item.description}</p>

                <div className="mt-3 p-2 bg-[#121820] border border-[#1A232E] rounded text-[10px] text-[#64748B] space-y-1">
                  <div>Required Environment Keys:</div>
                  <div className="font-mono text-[#C5A880]">
                    {item.requiredKeys.join(' · ')}
                  </div>
                </div>
              </div>

              {/* API Key Connection Test Box */}
              <div className="mt-4 pt-3 border-t border-[#1E293B]">
                <label className="block text-[10px] text-[#64748B] mb-1 font-mono">
                  Test API Credential Handshake:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="Enter API Token..."
                    value={testServiceKey[item.serviceName] || ''}
                    onChange={(e) =>
                      setTestServiceKey({ ...testServiceKey, [item.serviceName]: e.target.value })
                    }
                    className="flex-1 bg-[#0B0F12] border border-[#2A3749] text-[#E2E8F0] px-2 py-1 rounded text-xs"
                  />
                  <button
                    onClick={() => handleTestIntegration(item.serviceName)}
                    className="px-3 py-1 bg-[#1E293B] hover:bg-[#D4AF37] hover:text-[#0B0F12] text-[#E2E8F0] rounded font-medium transition-colors cursor-pointer"
                  >
                    Test Ping
                  </button>
                </div>

                {testResult[item.serviceName] && (
                  <div
                    className={`mt-2 p-2 rounded text-[11px] flex items-center gap-1.5 ${
                      testResult[item.serviceName].success
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {testResult[item.serviceName].success ? (
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{testResult[item.serviceName].msg}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
