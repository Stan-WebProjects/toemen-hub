import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, TENANT_ID } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface UseJappieOptions {
  channel?: string;
  pageContext?: string;
}

export const useJappie = (options: UseJappieOptions = {}) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const startConversation = useCallback(async () => {
    const { data, error } = await supabase
      .from('hub_conversations')
      .insert({
        tenant_id: TENANT_ID,
        channel: options.channel || 'web_chat',
        status: 'active',
        ai_handled: true,
        page_context: options.pageContext || window.location.href,
      })
      .select('id')
      .single();

    if (!error && data) {
      setConversationId(data.id);
      const { data: welcomeMsg } = await supabase
        .from('hub_messages')
        .insert({
          tenant_id: TENANT_ID,
          conversation_id: data.id,
          role: 'assistant',
          content: 'Hoi! Ik ben Jappie, de assistent van Toemen Modelsport.',
          metadata: { type: 'welcome' },
        })
        .select('*')
        .single();

      if (welcomeMsg) {
        setMessages([{
          id: welcomeMsg.id, role: 'assistant', content: welcomeMsg.content,
          metadata: welcomeMsg.metadata as Record<string, unknown>,
          created_at: welcomeMsg.created_at,
        }]);
      }
      return data.id;
    }
    return null;
  }, [options.channel, options.pageContext]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel('chat-' + conversationId)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'hub_messages',
        filter: 'conversation_id=eq.' + conversationId,
      }, (payload) => {
        const msg = payload.new as any;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, {
            id: msg.id, role: msg.role, content: msg.content,
            metadata: msg.metadata, created_at: msg.created_at,
          }];
        });
        if (msg.role === 'assistant') setIsTyping(false);
      })
      .subscribe((status) => setIsConnected(status === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    let convId = conversationId;
    if (!convId) {
      convId = await startConversation();
      if (!convId) return;
    }
    setIsTyping(true);

    const { data: userMsg } = await supabase
      .from('hub_messages')
      .insert({ tenant_id: TENANT_ID, conversation_id: convId, role: 'user', content: content.trim() })
      .select('*').single();

    if (userMsg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === userMsg.id)) return prev;
        return [...prev, { id: userMsg.id, role: 'user', content: userMsg.content, metadata: userMsg.metadata as any, created_at: userMsg.created_at }];
      });
    }

    // Generate AI response
    setTimeout(async () => {
      const response = generateResponse(content);
      await supabase.from('hub_messages').insert({
        tenant_id: TENANT_ID, conversation_id: convId, role: 'assistant',
        content: response.content, metadata: response.metadata,
      });
    }, 800 + Math.random() * 800);
  }, [conversationId, startConversation]);

  return { messages, sendMessage, isTyping, isConnected, conversationId, startConversation };
};

function generateResponse(input: string): { content: string; metadata: Record<string, unknown> } {
  const l = input.toLowerCase();

  // Tracking
  if (l.includes('pakket') || l.includes('track') || l.includes('bezorg') || l.includes('verzend'))
    return { content: 'Ik kan je pakket opzoeken! Vul hieronder je ordernummer of trackingcode in.', metadata: { type: 'tracking_prompt' } };

  // Tracking code entered (looks like a code)
  if (/^[A-Z0-9]{6,}$/i.test(input.trim()) || /^3S/.test(input.trim()) || /^\d{10,}$/.test(input.trim()) || l.startsWith('ord'))
    return {
      content: 'Ik heb je pakket gevonden!',
      metadata: {
        type: 'tracking_result',
        tracking: {
          code: input.trim().toUpperCase(),
          carrier: 'PostNL',
          status: 'Onderweg',
          estimatedDelivery: 'Morgen, 12:00 - 14:00',
          steps: [
            { label: 'Besteld', done: true, time: '16 mrt, 14:22' },
            { label: 'Verwerkt', done: true, time: '16 mrt, 16:05' },
            { label: 'Verzonden', done: true, time: '17 mrt, 09:30' },
            { label: 'Onderweg', done: true, time: '18 mrt, 08:15' },
            { label: 'Bezorgd', done: false, time: 'Verwacht morgen' },
          ]
        }
      }
    };

  // Order status
  if (l.includes('bestel') || l.includes('order') || l.includes('status'))
    return { content: 'Ik zoek je bestelling op. Wat is je ordernummer of het e-mailadres waarmee je besteld hebt?', metadata: { type: 'order_prompt' } };

  // Openingstijden
  if (l.includes('open') || l.includes('dicht') || l.includes('sluit') || l.includes('wanneer'))
    return {
      content: 'Dit zijn onze openingstijden:',
      metadata: {
        type: 'hours',
        hours: {
          address: 'Dorpsstraat 17, 5061 HH Oisterwijk',
          phone: '+31 13 528 0000',
          schedule: [
            { day: 'Maandag', time: '10:00 - 18:00', open: true },
            { day: 'Dinsdag', time: '10:00 - 18:00', open: true },
            { day: 'Woensdag', time: '10:00 - 18:00', open: true },
            { day: 'Donderdag', time: '10:00 - 18:00', open: true },
            { day: 'Vrijdag', time: '10:00 - 18:00', open: true },
            { day: 'Zaterdag', time: '10:00 - 17:00', open: true },
            { day: 'Zondag', time: 'Gesloten', open: false },
          ]
        }
      }
    };

  // Voorraad
  if (l.includes('voorraad') || l.includes('op voorraad') || l.includes('hebben jullie'))
    return { content: 'Ik check de voorraad! Welk product zoek je? Typ een naam, merk of artikelnummer.', metadata: { type: 'stock_prompt' } };

  // Product search (when they type a product name)
  if (l.includes('traxxas') || l.includes('arrma') || l.includes('dji') || l.includes('slash') || l.includes('maxx') || l.includes('drone'))
    return {
      content: 'Ik heb een paar opties voor je gevonden:',
      metadata: {
        type: 'products',
        products: [
          { name: 'Traxxas Slash 4x4 VXL', price: 469.95, stock: true, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop', url: 'https://toemen.nl' },
          { name: 'Traxxas X-Maxx 8S', price: 1199.00, stock: true, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop', url: 'https://toemen.nl' },
          { name: 'Traxxas TRX-4 Defender', price: 579.00, stock: false, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop', url: 'https://toemen.nl' },
        ]
      }
    };

  // Inruil
  if (l.includes('inruil') || l.includes('trade') || l.includes('ruil'))
    return { content: 'Wil je iets inruilen? Top! Ik heb een paar gegevens nodig.', metadata: { type: 'trade_in_prompt' } };

  // Garantie
  if (l.includes('garantie') || l.includes('kapot') || l.includes('defect') || l.includes('rma'))
    return { content: 'Vervelend dat er iets mis is! Ik help je met je garantieclaim. Wat is je ordernummer?', metadata: { type: 'warranty_prompt' } };

  // Default: show action cards
  return { content: 'Waarmee kan ik je helpen?', metadata: { type: 'actions' } };
}
