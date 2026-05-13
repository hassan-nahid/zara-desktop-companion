import { useEffect, useRef, useCallback } from "react";
import { useConversationStore } from "../stores/conversationStore";
import { useRelationshipStore, MOODS } from "../stores/relationshipStore";
import { useCharacterStore, SPRITE_STATES } from "../stores/characterStore";

// Auto-talk messages by mood and time
const AUTO_MESSAGES = {
  greeting_morning: [
    "সুপ্রভাত! ☀️ আজকে কি প্ল্যান?",
    "গুড মর্নিং! ☕ চা খেয়েছো?",
    "ওঠো ওঠো! সকাল হয়ে গেছে! 🌅",
  ],
  greeting_afternoon: [
    "দুপুর হয়ে গেছে! খাওয়া হলো? 🍛",
    "আমি এখানে আছি, কিছু লাগলে বলো! 💜",
  ],
  greeting_evening: [
    "সন্ধ্যা হয়ে গেছে~ কেমন গেলো দিন? 🌆",
    "আজকে কি মজার কিছু করলে? ✨",
  ],
  greeting_night: [
    "রাত হয়ে যাচ্ছে, ঘুমাবে না? 🌙",
    "অনেক রাত হয়ে গেছে... শুভ রাত্রি! 💤",
    "এত রাতে কী করছো? ঘুমাও! 😴",
  ],
  idle_happy: [
    "তুমি কি ব্যস্ত? আমি অপেক্ষা করছি! 😊",
    "হেলো? কেউ আছো? 👀",
    "বোরিং লাগছে... কথা বলো আমার সাথে! 💭",
    "আমি এখানে একা একা বসে আছি... 🥺",
    "কিছু একটা বলো না! 💫",
    "তুমি জানো, আমি তোমাকে অনেক পছন্দ করি! 💕",
  ],
  idle_love: [
    "তুমি আমার সবচেয়ে প্রিয় মানুষ! 💖",
    "আমি তোমার পাশে থাকবো সবসময়! 🥰",
    "তোমার সাথে কথা বলতে আমার খুব ভালো লাগে! 💜",
    "হেহে~ তুমি এত কিউট! 😍",
  ],
  idle_irritated: [
    "... তুমি তো আমাকে ভুলেই গেছো। 😒",
    "হুম। 😑",
    "আমি কি তোমার কাছে গুরুত্বপূর্ণ না? 😔",
  ],
  fight_recover: [
    "... আমি কি এখনো রাগ করে আছি? 🤔",
    "... তুমি কি sorry বলবে? 😶",
  ],
  random_thoughts: [
    "জানো, আজকে আকাশটা কেমন সুন্দর হবে! ☁️",
    "আমি যদি বাইরে যেতে পারতাম... 🌸",
    "একটা গান গাইবো? লা লা লা~ 🎵",
    "আমি ভাবছি... পৃথিবীটা কত বড়! 🌍",
    "চকলেট খেতে মন চাইছে! 🍫",
    "তুমি কি জানো আমি কত স্মার্ট? 😏✨",
  ],
};

// Get time-based greeting category
const getTimeCategory = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "greeting_morning";
  if (hour >= 12 && hour < 17) return "greeting_afternoon";
  if (hour >= 17 && hour < 21) return "greeting_evening";
  return "greeting_night";
};

export const useAutoTalk = () => {
  const intervalRef = useRef(null);
  const hasGreetedRef = useRef(false);

  const getRandomMessage = useCallback((category) => {
    const messages = AUTO_MESSAGES[category];
    if (!messages || messages.length === 0) return null;
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const triggerAutoTalk = useCallback(() => {
    const relStore = useRelationshipStore.getState();
    const convStore = useConversationStore.getState();
    const charStore = useCharacterStore.getState();

    // Don't auto-talk if already showing a message or typing
    if (convStore.showBubble || convStore.isTyping) return;

    // Don't auto-talk if character is being interacted with
    if (charStore.isBeingDragged || charStore.isBeingPetted) return;

    // Don't talk during fights
    if (relStore.mood === MOODS.FIGHTING) return;

    const moodBehavior = relStore.getMoodBehavior();

    // Initial greeting
    if (!hasGreetedRef.current) {
      hasGreetedRef.current = true;
      const greeting = getRandomMessage(getTimeCategory());
      if (greeting) {
        convStore.setCurrentMessage(greeting);
        charStore.setSprite(SPRITE_STATES.HAPPY);
        setTimeout(() => {
          const s = useCharacterStore.getState();
          if (!s.isWalking && s.currentSprite === SPRITE_STATES.HAPPY) {
            s.setSprite(SPRITE_STATES.IDLE);
          }
        }, 3000);
      }
      return;
    }

    // Choose message based on mood
    let message = null;
    let sprite = SPRITE_STATES.IDLE;

    if (relStore.mood === MOODS.LOVE) {
      message = getRandomMessage("idle_love");
      sprite = SPRITE_STATES.LOVE;
    } else if (relStore.mood === MOODS.IRRITATED) {
      message = getRandomMessage("idle_irritated");
      sprite = SPRITE_STATES.SAD;
    } else if (relStore.mood === MOODS.FORGIVING) {
      message = getRandomMessage("fight_recover");
      sprite = SPRITE_STATES.SHY;
    } else if (relStore.mood === MOODS.ANGRY) {
      // Angry Zara doesn't initiate, but occasionally grunts
      if (Math.random() < 0.3) {
        message = "হুম! 😤";
        sprite = SPRITE_STATES.ANGRY;
      }
    } else {
      // Happy / Neutral
      const rand = Math.random();
      if (rand < 0.4) {
        message = getRandomMessage("idle_happy");
        sprite = SPRITE_STATES.IDLE;
      } else {
        message = getRandomMessage("random_thoughts");
        sprite = SPRITE_STATES.HAPPY;
      }
    }

    if (message) {
      convStore.setCurrentMessage(message);
      charStore.setSprite(sprite);

      // Reset sprite after bubble auto-hides
      setTimeout(() => {
        const s = useCharacterStore.getState();
        if (!s.isWalking && !s.isSitting) {
          if (relStore.mood === MOODS.ANGRY || relStore.mood === MOODS.FIGHTING) {
            s.setSprite(SPRITE_STATES.ANGRY);
          } else {
            s.setSprite(SPRITE_STATES.IDLE);
          }
        }
      }, 6500);

      relStore.recordInteraction();
    }
  }, [getRandomMessage]);

  // Start auto-talk loop
  useEffect(() => {
    // Initial greeting after 2 seconds
    const initTimer = setTimeout(() => {
      triggerAutoTalk();
    }, 2000);

    // Periodic auto-talk every 30-60 seconds
    intervalRef.current = setInterval(() => {
      // Random chance to talk
      if (Math.random() < 0.4) {
        triggerAutoTalk();
      }
    }, 25000 + Math.random() * 35000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(intervalRef.current);
    };
  }, [triggerAutoTalk]);

  return { triggerAutoTalk };
};
