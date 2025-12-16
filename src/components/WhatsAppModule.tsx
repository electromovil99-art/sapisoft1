
import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, CheckCheck, User, ArrowLeft, RotateCcw, Lock, Globe, QrCode } from 'lucide-react';
import { Product, Client, Chat, Message } from '../types';

interface WhatsAppModuleProps {
    products: Product[];
    clients: Client[];
    chats: Chat[]; 
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    initialContact?: { name: string, phone: string, message?: string };
}

const WhatsAppModule: React.FC<WhatsAppModuleProps> = ({ chats, setChats, initialContact }) => {
    const [step, setStep] = useState<'LOGIN' | 'APP'>('LOGIN');
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialContact) {
            setStep('APP');
            const exist = chats.find(c => c.name === initialContact.name);
            if (exist) {
                setActiveChatId(exist.id);
            } else {
                const newChat: Chat = {
                    id: Math.random().toString(),
                    name: initialContact.name,
                    phone: initialContact.phone,
                    avatar: initialContact.name.substring(0,2).toUpperCase(),
                    lastMessage: '',
                    lastMessageTime: 'Ahora',
                    unread: 0,
                    messages: []
                };
                setChats(prev => [newChat, ...prev]);
                setActiveChatId(newChat.id);
            }
            if (initialContact.message) setInputText(initialContact.message);
        }
    }, [initialContact]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatId, chats]);

    const handleSendMessage = () => {
        if (!inputText.trim() || !activeChatId) return;
        const newMsg: Message = {
            id: Math.random().toString(),
            text: inputText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            status: 'sent'
        };
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg], lastMessage: inputText, lastMessageTime: 'Ahora' } : c));
        setInputText('');
    };

    if (step === 'LOGIN') {
        return (
            <div className="flex flex-col h-full bg-[#d1d7db] relative overflow-hidden font-sans">
                <div className="h-[220px] bg-[#00a884] w-full absolute top-0 left-0 z-0"></div>
                <div className="z-10 flex-1 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-[900px] h-[70vh] flex overflow-hidden">
                        <div className="flex-1 p-12">
                            <h1 className="text-3xl font-light text-[#41525d] mb-10">Usar WhatsApp en tu computadora</h1>
                            <ol className="text-lg text-[#3b4a54] space-y-5 list-decimal list-inside">
                                <li>Abre WhatsApp en tu teléfono</li>
                                <li>Toca <strong>Menú</strong> o <strong>Configuración</strong></li>
                                <li>Vincula tu dispositivo escaneando el código</li>
                            </ol>
                        </div>
                        <div className="w-[400px] flex items-center justify-center border-l border-gray-100">
                            <div className="cursor-pointer group" onClick={() => setStep('APP')}>
                                <div className="border-4 border-white shadow-sm p-2 bg-white"><QrCode size={240}/></div>
                                <div className="text-center mt-4 text-[#00a884] font-bold animate-pulse">CLICK PARA ENTRAR</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f0f2f5] overflow-hidden rounded-xl border shadow-xl">
            <div className="flex flex-1 overflow-hidden">
                <div className="w-[350px] bg-white border-r flex flex-col">
                    <div className="h-16 bg-[#f0f2f5] flex items-center justify-between px-4 border-b">
                        <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-white"><User/></div>
                        <div className="flex gap-4 text-slate-500"><MoreVertical/></div>
                    </div>
                    <div className="p-2 border-b"><input className="w-full bg-[#f0f2f5] rounded-lg px-4 py-2 text-sm outline-none" placeholder="Busca un chat..."/></div>
                    <div className="flex-1 overflow-y-auto">
                        {chats.map(chat => (
                            <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`flex items-center px-3 py-3 cursor-pointer hover:bg-[#f5f6f6] ${activeChatId === chat.id ? 'bg-[#f0f2f5]' : ''}`}>
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 mr-3">{chat.avatar}</div>
                                <div className="flex-1 min-w-0 border-b border-slate-100 pb-3">
                                    <div className="flex justify-between"><span className="text-slate-800 font-medium">{chat.name}</span><span className="text-xs text-slate-400">{chat.lastMessageTime}</span></div>
                                    <div className="text-sm text-slate-500 truncate">{chat.lastMessage}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {activeChatId ? (
                    <div className="flex-1 flex flex-col bg-[#efeae2]">
                        <div className="h-16 bg-[#f0f2f5] flex items-center px-4 border-b">
                            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center font-bold text-white mr-3">{chats.find(c => c.id === activeChatId)?.avatar}</div>
                            <div className="font-medium text-slate-800">{chats.find(c => c.id === activeChatId)?.name}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-10">
                            {chats.find(c => c.id === activeChatId)?.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-lg px-3 py-1.5 shadow-sm text-sm ${msg.sender === 'me' ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                                        <div>{msg.text}</div>
                                        <div className="text-[10px] text-slate-500 text-right flex justify-end gap-1">{msg.time} <CheckCheck size={14} className="text-blue-500"/></div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="h-16 bg-[#f0f2f5] px-4 flex items-center gap-2">
                            <Smile className="text-slate-500"/>
                            <input className="flex-1 bg-white rounded-lg px-4 py-2 outline-none" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Escribe un mensaje"/>
                            <Send className="text-slate-500 cursor-pointer" onClick={handleSendMessage}/>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] text-slate-500">Selecciona un chat para comenzar</div>
                )}
            </div>
        </div>
    );
};
export default WhatsAppModule;
