export interface PolaroidMemory {
  id: string;
  title: string;
  date: string;
  location: string;
  caption: string;
  imageSrc: string;
  rotation: number; // slight degrees offset for natural scrapbook feel
  tapeAngle: number;
}

export interface StoryData {
  recipientName: string;
  petName: string;
  coverTitle: string;
  coverSubtitle: string;
  // Chapter 1: Creator's message & 3 polaroids of me & her
  chapter1Headline: string;
  chapter1LetterBody: string[];
  chapter1Polaroids: PolaroidMemory[];
  // Chapter 2: Fredricka & Caroline ("The Twins") message & 3 polaroids
  chapter2FriendTribute: {
    friendName: string;
    relationship: string;
    headline: string;
    letterBody: string[];
    polaroids: PolaroidMemory[];
  };
  // Chapter 3: The Grand Scrapbook Memory Wall (9 on left, 9 on right)
  chapter3Headline: string;
  chapter3Subheadline: string;
  chapter3LeftPolaroids: PolaroidMemory[];
  chapter3RightPolaroids: PolaroidMemory[];
  // Chapter 4: Polaroids & Finale
  chapter4Polaroids?: PolaroidMemory[];
  futureWishesHeadline: string;
  futureWishes: string[];
  finalQuote: string;
  closingNote: string;
}

const storyImageAssets = import.meta.glob<string>(
  [
    '../assets/images/*.jpg',
    '../assets/images/*.jpeg',
    '../assets/images/*.png',
    '../assets/images/*.mp4',
  ],
  { eager: true, query: '?url', import: 'default' },
);

export const defaultCarolineStory: StoryData = {
  recipientName: "Caroline",
  petName: "Hammer headed foodian",
  coverTitle: "Chronicles of Caroline",
  coverSubtitle: "An intimate memory album crafted for our beloved Hammer Headed Foodian",

  // Chapter 1: My message to her & 3 polaroids of me & her
  chapter1Headline: "",
  chapter1LetterBody: [
    "Happy Birthday, Caroline! 🥳❤️",
    "Another year older, wiser… hopefully 😂. Honestly, you’re such a beautiful person, and I’m genuinely glad I got to know you.",
    "I pray this new chapter brings you plenty of happiness, peace, success, and most importantly, plenty plenty money 💰😂. May you become so rich that you’ll start forgetting the prices of things.",
    "And please try your best not to accidentally kill anybody along the way 😭😂. We’re trusting you with our lives ooo, so no pressure 😂🧪.",
    "And when you finally become rich, please don’t forget me wai. Remember that I knew you before the money and the fancy life 😭😂❤️.",
    "Enjoy your day, birthday girl. Keep being the slightly annoying Carol that you are 😂❤️.",
    "Happy Birthday once again! 🥂❤️",
    "… and please remember your poor friend when you make it big 😭💰😂"
  ],
  chapter1Polaroids: [
    {
      id: "c1-p1",
      title: "Highway 1 Roadtrip",
      date: "Golden Summer",
      location: "Pacific Coast",
      caption: "Windows rolled down, ocean breeze in our hair, singing at the top of our lungs.",
      imageSrc: "/src/assets/images/chap 101.jpg",
      rotation: -2.5,
      tapeAngle: 3
    },
    {
      id: "c1-p2",
      title: "Rooftop Cake & Stars",
      date: "Midnight Celebration",
      location: "Skyline Veranda",
      caption: "Sneaking the very first slice of cake before anyone else even noticed!",
      imageSrc: "/src/assets/images/chap 102.jpg",
      rotation: 2.2,
      tapeAngle: -4
    },
    {
      id: "c1-p3",
      title: "Uncontrolled Giggles",
      date: "Rainy Tuesday",
      location: "Corner Bakery",
      caption: "Caught mid-laugh right when neither of us could even remember what was so funny.",
      imageSrc: "/src/assets/images/chap 103.png",
      rotation: -1.2,
      tapeAngle: 2
    }
  ],

  // Chapter 2: Message from her very close friend Fredricka ("The Twins") & 3 polaroids
  chapter2FriendTribute: {
    friendName: "Fredricka",
    relationship: "Your Twin & Soul Sister",
    headline: "From Your Twin, Fredricka",
    letterBody: [
      "Happy Birthday to my Twin, Carolrrr! 🥹❤️",
      "How did I get so lucky to have a Twin like you? You’re beautiful, amazing, dramatic, and somehow still my favourite person 😂❤️",
      "You’re not just my friend, you’re my person, my partner in crime, my gossip partner, and my forever Twin. No refunds 😭😂",
      "I pray this new chapter brings you everything you’ve been hoping for—more joy, more laughter, more love, and more beautiful memories. I love you, Twin. Not in a weird way 👀",
      "Okay, maybe a little weird 🤭😂❤️ Happy Birthday, my Twin! 🥂❤️",
      "Here’s to more memories, more nonsense, and many more years of me being stuck with you. 🫶🏽"
    ],
    polaroids: [
      {
        id: "c2-p1",
        title: "Twin Heart Sign",
        date: "Sisterhood Forever",
        location: "Courtyard Moments",
        caption: "Joined hands in our signature heart symbol — connected at the soul, laughing through life side by side.",
        imageSrc: "/src/assets/images/twin 1.jpeg",
        rotation: -3.0,
        tapeAngle: 4
      },
      {
        id: "c2-p2",
        title: "Pout & Peace",
        date: "Golden Afternoon",
        location: "Stone Walkway",
        caption: "A playful pout, a bright peace sign, matching confidence, and endless laughter that turns every path into our runway.",
        imageSrc: "/src/assets/images/twin 2.jpeg",
        rotation: 2.5,
        tapeAngle: -3
      },
      {
        id: "c2-p3",
        title: "Double the Grace",
        date: "Celebration Day",
        location: "Under the Canopy",
        caption: "Dressed up to celebrate! Afro puff crown, bow elegance, sharp leopard chic, and unforgettable sisterly joy.",
        imageSrc: "/src/assets/images/twin 3.jpeg",
        rotation: -1.5,
        tapeAngle: 2
      }
    ]
  },

  // Chapter 3: The Grand Scrapbook Memory Wall (9 images on left side, 9 images on right side = 18 total)
  chapter3Headline: "Moments Pinned in Memory",
  chapter3Subheadline: "Tap any polaroid to gently unpin and focus · Tap again to return and pin back",
  chapter3LeftPolaroids: [
    {
      id: "c3-l1",
      title: "Memory 1",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 1.jpg",
      rotation: -2,
      tapeAngle: 3
    },
    {
      id: "c3-l2",
      title: "Memory 2",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 2.jpg",
      rotation: 3,
      tapeAngle: -2
    },
    {
      id: "c3-l3",
      title: "Memory 3",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 3.jpg",
      rotation: -1,
      tapeAngle: 4
    },
    {
      id: "c3-l4",
      title: "Memory 4",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 4.jpg",
      rotation: 2,
      tapeAngle: -3
    },
    {
      id: "c3-l5",
      title: "Memory 5",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 5.jpg",
      rotation: -3,
      tapeAngle: 2
    },
    {
      id: "c3-l6",
      title: "Memory 6",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 6.jpg",
      rotation: 1.5,
      tapeAngle: -4
    },
    {
      id: "c3-l7",
      title: "Memory 7",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 7.mp4",
      rotation: -2.5,
      tapeAngle: 3
    },
    {
      id: "c3-l8",
      title: "Memory 8",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 8.jpg",
      rotation: 2,
      tapeAngle: -2
    },
    {
      id: "c3-l9",
      title: "Memory 9",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 9.mp4",
      rotation: -1.5,
      tapeAngle: 3
    }
  ],
  chapter3RightPolaroids: [
    {
      id: "c3-r1",
      title: "Memory 10",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 10.mp4",
      rotation: 2.5,
      tapeAngle: -3
    },
    {
      id: "c3-r2",
      title: "Memory 11",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 11.mp4",
      rotation: -2,
      tapeAngle: 4
    },
    {
      id: "c3-r3",
      title: "Memory 12",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 12.mp4",
      rotation: 1.8,
      tapeAngle: -2
    },
    {
      id: "c3-r4",
      title: "Memory 13",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 13.mp4",
      rotation: -3,
      tapeAngle: 3
    },
    {
      id: "c3-r5",
      title: "Memory 14",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 14.mp4",
      rotation: 2.2,
      tapeAngle: -4
    },
    {
      id: "c3-r6",
      title: "Memory 15",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 15.mp4",
      rotation: -1.8,
      tapeAngle: 2
    },
    {
      id: "c3-r7",
      title: "Memory 16",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 16.mp4",
      rotation: 3,
      tapeAngle: -3
    },
    {
      id: "c3-r8",
      title: "Memory 17",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 17.mp4",
      rotation: -2.2,
      tapeAngle: 3
    },
    {
      id: "c3-r9",
      title: "Memory 18",
      date: "Archive",
      location: "Chapter 3",
      caption: "Collected memory",
      imageSrc: "/src/assets/images/mem 18.mp4",
      rotation: 1.5,
      tapeAngle: -2
    }
  ],

  // Chapter 4: Polaroids & Finale
  chapter4Polaroids: [
    {
      id: "c4-p1",
      title: "Rooftop Starlight & Toast",
      date: "Midnight Celebration",
      location: "Skyline Veranda",
      caption: "Raising a glass to Caroline and all the wonderful chapters yet to unfold.",
      imageSrc: "/src/assets/images/caroline_creator_rooftop_1790655257682.jpg",
      rotation: -2.5,
      tapeAngle: 3
    },
    {
      id: "c4-p2",
      title: "Golden Smiles & Laughter",
      date: "Everlasting Joy",
      location: "Sunlit Moments",
      caption: "Pure radiant happiness that lights up every room and every heart.",
      imageSrc: "/src/assets/images/polaroid_spontaneous_laugh_1790653175993.jpg",
      rotation: 2.8,
      tapeAngle: -4
    },
    {
      id: "c4-p3",
      title: "To Future Horizons",
      date: "Sunset Magic",
      location: "Pacific Coast",
      caption: "May every tomorrow bring new reasons to celebrate, explore, and rejoice.",
      imageSrc: "/src/assets/images/polaroid_sunset_horizon_1790653186538.jpg",
      rotation: -1.5,
      tapeAngle: 2
    }
  ],
  futureWishesHeadline: "Wishes for the Next Horizon",
  futureWishes: [
    "May your year be filled with passport stamps to places that smell like sea salt and freshly baked bread.",
    "May every dining table you sit at be surrounded by warmth, clinking glasses, and people who adore you.",
    "May your bold dreams expand, your courage never waver, and your joy remain stubbornly infectious.",
    "And above all, may you always remember how deeply cherished you are, every single day."
  ],
  finalQuote: "“Count your age by friends, not years. Count your life by smiles, not tears.”",
  closingNote: "Until the next chapter unfolds..."
};

const storyPolaroidGroups = [
  defaultCarolineStory.chapter1Polaroids,
  defaultCarolineStory.chapter2FriendTribute.polaroids,
  defaultCarolineStory.chapter3LeftPolaroids,
  defaultCarolineStory.chapter3RightPolaroids,
  defaultCarolineStory.chapter4Polaroids ?? [],
];

for (const polaroids of storyPolaroidGroups) {
  for (const polaroid of polaroids) {
    const assetPath = polaroid.imageSrc.replace(
      '/src/assets/images/',
      '../assets/images/',
    );
    polaroid.imageSrc = storyImageAssets[assetPath] ?? polaroid.imageSrc;
  }
}
