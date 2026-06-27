import { useState, useReducer, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Howl } from "howler";
import { THEMES } from "../components/create/ThemeSelector.jsx";
import ExperienceOrchestrator from "../components/experience/ExperienceOrchestrator.jsx";
import AudioController from "../components/experience/AudioController.jsx";
import ErrorState from "../components/experience/ErrorState.jsx";

// State machine phases — simplified 2-phase
const STATUS = {
  IDLE: "IDLE",
  GIFT_BOX: "GIFT_BOX",
  MAIN: "MAIN",
};

// Initial state for the reducer
const initialState = {
  status: STATUS.IDLE,
  playCount: 0,
  isMusicPlaying: false,
};

// State machine reducer
function reducer(state, action) {
  switch (action.type) {
    case "SET_DATA_LOADED":
      return { ...state, status: STATUS.GIFT_BOX };
    case "OPEN":
      return { ...state, status: STATUS.MAIN, isMusicPlaying: true };
    case "REPLAY":
      return {
        ...initialState,
        status: STATUS.GIFT_BOX,
        playCount: state.playCount + 1,
      };
    case "SET_MUSIC_PLAYING":
      return { ...state, isMusicPlaying: action.value };
    default:
      return state;
  }
}

export default function WishPage() {
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [wishData, setWishData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const musicRef = useRef(null);
  const sfxWhooshRef = useRef(null);
  const sfxConfettiRef = useRef(null);

  // Fetch wish data on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchWish() {
      try {
        const res = await fetch(`/api/wish/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("not_found");
          }
          throw new Error("network");
        }
        const data = await res.json();
        if (!cancelled) {
          setWishData(data);
          setLoading(false);
          dispatch({ type: "SET_DATA_LOADED" });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message === "not_found" ? "not_found" : "network");
          setLoading(false);
        }
      }
    }

    fetchWish();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Initialize Howl instances (eager creation, deferred play — Rule 8)
  useEffect(() => {
    musicRef.current = new Howl({
      src: ["/assets/audio/happy-birthday.mp3"],
      html5: true,
      volume: 0.5,
      loop: true,
      onloaderror: () => {
        musicRef.current = null;
      },
    });

    sfxWhooshRef.current = new Howl({
      src: ["/assets/audio/whoosh.mp3"],
      html5: true,
      volume: 0.8,
      onloaderror: () => {
        sfxWhooshRef.current = null;
      },
    });

    sfxConfettiRef.current = new Howl({
      src: ["/assets/audio/confetti-sound.mp3"],
      html5: true,
      volume: 0.6,
      onloaderror: () => {
        sfxConfettiRef.current = null;
      },
    });

    return () => {
      if (musicRef.current) {
        musicRef.current.unload();
        musicRef.current = null;
      }
      if (sfxWhooshRef.current) {
        sfxWhooshRef.current.unload();
        sfxWhooshRef.current = null;
      }
      if (sfxConfettiRef.current) {
        sfxConfettiRef.current.unload();
        sfxConfettiRef.current = null;
      }
    };
  }, []);

  // Handle gift box tap — starts music + whoosh, transitions to MAIN
  const handleGiftBoxOpen = useCallback(() => {

    if (musicRef.current) {
      musicRef.current.play();
    }

    if (sfxConfettiRef.current) {
      sfxConfettiRef.current.play();
    }
    dispatch({ type: "OPEN" });
  }, []);

  // Handle music toggle (pause/resume)
  const handleMusicToggle = useCallback(() => {
    if (!musicRef.current) return;

    if (state.isMusicPlaying) {
      musicRef.current.pause();
      dispatch({ type: "SET_MUSIC_PLAYING", value: false });
    } else {
      musicRef.current.play();
      dispatch({ type: "SET_MUSIC_PLAYING", value: true });
    }
  }, [state.isMusicPlaying]);

  // Handle replay — reset everything back to gift box
  const handleReplay = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.stop();
      musicRef.current.seek(0);
    }
    dispatch({ type: "REPLAY" });
  }, []);

  // Get theme data
  const themeId = wishData?.theme || "sunrise";
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  // Loading state — skeleton shimmer
  if (loading) {
    return (
      <div className="page wish-page">
        <div className="flex flex-col items-center gap-4 pt-20">
          <div className="skeleton-shimmer w-16 h-16 rounded-full" />
          <div className="skeleton-shimmer h-4 rounded-lg w-[40%]" style={{ animationDelay: "0.1s" }} />
          <div className="skeleton-shimmer h-4 rounded-lg w-[75%]" style={{ animationDelay: "0.2s" }} />
          <div className="skeleton-shimmer h-4 rounded-lg w-[55%]" style={{ animationDelay: "0.3s" }} />
          <div className="skeleton-shimmer w-[120px] h-[120px] rounded-2xl mt-6" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page wish-page">
        <ErrorState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!wishData) return null;

  // Prepare sentences
  const sentences = wishData.sentences || (wishData.message ? [wishData.message] : []);
  const surfaceStyle = { "--wish-surface": theme.surface };

  return (
    <div
      className=" wish-page"
      style={surfaceStyle}
    >
      {/* Audio controller — only after gift box is opened */}
      {state.status === STATUS.MAIN && (
        <AudioController
          isPlaying={state.isMusicPlaying}
          onToggle={handleMusicToggle}
          theme={theme}
        />
      )}

      <ExperienceOrchestrator
        wish={wishData}
        sentences={sentences}
        state={state}
        dispatch={dispatch}
        theme={theme}
        onGiftBoxOpen={handleGiftBoxOpen}
        onReplay={handleReplay}
      />
    </div>
  );
}
