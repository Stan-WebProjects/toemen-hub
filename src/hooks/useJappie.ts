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
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
          content: 'Hoi! Ik ben Jappie, de assistent van Toemen Modelsport. Waarmee kan ik je helpen?',
          metadata: { type: 'welcome' },
        })
        .select('*')
        .single();

      if (welcomeMsg) {
        setMessages([{
          id: welcomeMsg.id,
          role: 'assistant',
          content: welcomeMsg.content,
          metadata: welcomeMsg.metadata as Record<string, unknown>,
          created_at: welcomeMsg.created_at,
        }]);
      }
      return data.id;
    }
    return null;
  }, [options.channel, options.pageContext]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel('chat-' + conversationId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hub_messages',
          filter: 'conversation_id=eq.' + conversationId,
        },
        (payload) => {
          const msg = payload.new as {
            id: string; role: string; content: string;
            metadata: Record<string, unknown>; created_at: string;
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, {
              id: msg.id,
              role: msg.role as ChatMessage['role'],
              content: msg.content,
              metadata: msg.metadata,
              created_at: msg.created_at,
            }];
          });
          if (msg.role === 'assistant') setIsTyping(false);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;
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
      .insert({
        tenant_id: TENANT_ID,
        conversation_id: convId,
        role: 'user',
        content: content.trim(),
      })
      .select('*')
      .single();

    if (userMsg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === userMsg.id)) return prev;
        return [...prev, {
          id: userMsg.id, role: 'user', content: userMsg.content,
          metadata: userMsg.metadata as Record<string, unknown>,
          created_at: userMsg.created_at,
        }];
      });
    }

    // Placeholder AI response (replace with n8n webhook / Edge Function)
    setTimeout(async () => {
      await supabase.from('hub_messages').insert({
        tenant_id: TENANT_ID,
        conversation_id: convId,
        role: 'assistant',
        content: getPlaceholderResponse(content),
        metadata: { model: 'placeholder', processed: false },
      });
    }, 1200);
  }, [conversationId, startConversation]);

  return { messages, sendMessage, isTyping, isConnected, conversationId, startConversation };
};

function getPlaceholderResponse(input: string): string {
  const l = input.toLowerCase();
  if (l.includes('pakket') || l.includes('track') || l.includes('bezorg'))
    return 'Ik kan je helpen met tracking! Geef me je ordernummer en ik zoek het op. (Binnenkort verbonden met PostNL/DHL)';
  if (l.includes('order') || l.includes('bestel'))
    return 'Ik zoek je bestelstatus op. Wat is je ordernummer? (Binnenkort verbonden met WooCommerce)';
  if (l.includes('voorraad') || l.includes('op voorraad'))
    return 'Ik check de voorraad! Welk product zoek je? (Binnenkort verbonden met de webshop)';
  if (l.includes('openingstijd') || l.includes('open'))
    return 'Toemen Modelsport — Dorpsstraat 17, Oisterwijk\n\nMa-Vr: 10:00 - 18:00\nZa: 10:00 - 17:00\nZo: Gesloten';
  if (l.includes('inruil') || l.includes('trade'))
    return 'Wil je iets inruilen? Ga naar inruil.toemen.nl of vertel me hier wat je wilt inruilen.';
  return 'Bedankt voor je bericht! Ik kan helpen met:\n\n📦 Bestelling & tracking\n🏪 Openingstijden & adres\n📋 Voorraad checken\n🔄 Inruil\n🛡️ Garantie\n🏎️ Productadvies\n\nWaar kan ik je mee helpen?';
}
