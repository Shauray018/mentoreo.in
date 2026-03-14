'use client';
import { useEffect, useRef } from 'react';

const CONV = [
  { from: 'user', text: "Is IIT Bombay CS worth the hype?" },
  { from: 'bot',  text: "Honestly? Brand is real but placements vary. What track are you looking at?" },
  { from: 'user', text: "AI/ML. What's the scene?" },
  { from: 'bot',  text: "Top notch. Get into an IDP lab early — that's where the real action is 🔥" },
  { from: 'user', text: "What about hostel life?" },
  { from: 'bot',  text: "Best part of IITB, no cap. The fests, the culture — nothing like it." },
];
const DELAYS = [0, 1300, 2800, 4100, 5700, 7000];

export function ChatBubbles() {
  const chatRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;

    function clearAll() {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      chat!.innerHTML = '';
    }

    function addRow(from: 'user' | 'bot', content: string, isTyping = false) {
      const row = document.createElement('div');
      row.className = `bubble-row ${from}`;

      const bubble = document.createElement('div');
      bubble.className = `bubble ${from}`;

      if (isTyping) {
        bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
      } else {
        bubble.textContent = content;
      }

      row.appendChild(bubble);
      chat!.appendChild(row);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        row.classList.add('visible');
      }));

      return { row, bubble };
    }

    function revealText(bubble: HTMLElement, text: string) {
      const words = text.split(' ');
      bubble.innerHTML = '';
      bubble.classList.add('text-reveal');

      const spans = words.map((w, i) => {
        const s = document.createElement('span');
        s.textContent = (i === 0 ? '' : ' ') + w;
        bubble.appendChild(s);
        return s;
      });

      spans.forEach((s, i) => {
        const t = setTimeout(() => s.classList.add('shown'), i * 38);
        timersRef.current.push(t);
      });
    }

    function run() {
      clearAll();

      CONV.forEach((m, i) => {
        const t = setTimeout(() => {
          if (m.from === 'bot') {
            const { bubble } = addRow('bot', '', true);
            const t2 = setTimeout(() => {
              bubble.innerHTML = '';
              bubble.classList.remove('text-reveal');
              revealText(bubble, m.text);
            }, 850);
            timersRef.current.push(t2);
          } else {
            addRow('user', m.text);
          }
        }, DELAYS[i]);
        timersRef.current.push(t);
      });

      const last = DELAYS[DELAYS.length - 1];
      timersRef.current.push(setTimeout(() => {
        const rows = chat!.querySelectorAll('.bubble-row');
        rows.forEach((r, i) => {
          setTimeout(() => {
            const el = r as HTMLElement;
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            el.style.opacity = '0';
            el.style.transform = 'translateY(-6px)';
          }, i * 60);
        });
        timersRef.current.push(setTimeout(run, rows.length * 60 + 500));
      }, last + 3200));
    }

    run();
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  return (
    <>
      <style>{`
        .bubble-row {
          display: flex;
          opacity: 0;
          transform: translateY(10px) scale(0.97);
          transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          margin-bottom: 10px;
        }
        .bubble-row.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .bubble-row.user { justify-content: flex-end; }
        .bubble-row.bot  { justify-content: flex-start; }

        .bubble {
          max-width: 78%;
          padding: 10px 15px;
          font-size: 14px;
          line-height: 1.55;
          border-radius: 18px;
        }
        .bubble.user {
          background: #FF8000;
          color: #fff;
          border-bottom-right-radius: 5px;
        }
        .bubble.bot {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          color: #1F2937;
          border-bottom-left-radius: 5px;
        }

        .typing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9CA3AF;
          opacity: 0.5;
          margin: 0 2px;
          animation: tdot 0.8s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.30s; }
        @keyframes tdot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          45%       { transform: translateY(-4px); opacity: 0.9; }
        }

        .text-reveal span {
          display: inline;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .text-reveal span.shown { opacity: 1; }
      `}</style>

      <div
        ref={chatRef}
        className="flex flex-col w-full max-w-md"
      />
    </>
  );
}