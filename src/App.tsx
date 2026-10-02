/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { defaultCarolineStory } from './types/story';
import { TheatricalCurtainStage } from './components/TheatricalCurtainStage';
import { AudioControl } from './components/AudioControl';

export default function App() {
  const story = defaultCarolineStory;

  return (
    <div className="min-h-screen bg-[#0C0806] text-[#E8D4BE] relative overflow-hidden select-none">
      {/* Theatrical Curtain & Book Stand Experience */}
      <TheatricalCurtainStage story={story} />

      {/* Floating Glass Music Controller (Persistent) */}
      <AudioControl />
    </div>
  );
}
