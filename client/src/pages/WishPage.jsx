import { useState, useReducer, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Howl } from "howler";
import { THEMES } from "../components/create/ThemeSelector.jsx";
import ExperienceOrchestrator from "../components/experience/ExperienceOrchestrator.jsx";
import AudioController from "../components/experience/AudioController.jsx";
import ErrorState from "../components/experience/ErrorState.jsx";

// State machine phases
const STATUS = {
  IDLE: "IDLE",
  GIFT_BOX: "GIFT_BOX",
  UNWRAPPING: "UNWRAPPING",
  REVEALING: "REVEALING",
  PHOTOS: "PHOTOS",
  FINALE: "FINALE",
  COMPLETE: "COMPLETE",
};

// Initial state for the reducer
const initialState = {
  status: STATUS.IDLE,
  sentenceIndex: 0,
  playCount: 0,
  photoIndex: 0,
  isTyping: false,
  isMusicPlaying: false,
};

// State machine reducer
function reducer(state, action) {
  switch (action.type) {
    case "OPEN_BOX":
      return { ...state, status: STATUS.UNWRAPPING };
    case "BOX_OPENED":
      return { ...state, status: STATUS.REVEALING };
    case "NEXT_SENTENCE":
      return {
        ...state,
        sentenceIndex: state.sentenceIndex + 1,
        isTyping: true,
      };
    case "SKIP_TYPING":
      return { ...state, isTyping: false };
    case "ALL_SENTENCES_DONE":
      if (action.hasPhotos) {
        return { ...state, status: STATUS.PHOTOS, photoIndex: 0 };
      }
      return { ...state, status: STATUS.FINALE };
    case "NEXT_PHOTO":
      return { ...state, photoIndex: state.photoIndex + 1 };
    case "PREV_PHOTO":
      return { ...state, photoIndex: Math.max(0, state.photoIndex - 1) };
    case "PHOTOS_DONE":
      return { ...state, status: STATUS.FINALE };
    case "START_FINALE":
      return { ...state, status: STATUS.FINALE };
    case "FINALE_DONE":
      return { ...state, status: STATUS.COMPLETE };
    case "REPLAY":
      return {
        ...initialState,
        playCount: state.playCount + 1,
        isMusicPlaying: true,
      };
    case "SET_MUSIC_PLAYING":
      return { ...state, isMusicPlaying: action.value };
    case "SET_DATA_LOADED":
      return { ...state, status: STATUS.GIFT_BOX };
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
        // Graceful fallback — experience works without music
        musicRef.current = null;
      },
    });

    sfxWhooshRef.current = new Howl({
      src: ["/assets/audio/whoosh.mp3"],
      volume: 0.6,
      onloaderror: () => {
        sfxWhooshRef.current = null;
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
    };
  }, []);

  // Handle gift box tap — starts music (Pitfall 8: user gesture unlocks AudioContext)
  const handleGiftBoxOpen = useCallback(() => {
    // Play background music
    if (musicRef.current) {
      musicRef.current.play();
      dispatch({ type: "SET_MUSIC_PLAYING", value: true });
    }
    // Play whoosh SFX
    if (sfxWhooshRef.current) {
      sfxWhooshRef.current.play();
    }
    // Advance directly to REVEALING after the lid animation (~1s)
    // We skip UNWRAPPING because AnimatePresence would unmount GiftBox,
    // killing its internal timeout. WishPage stays mounted so the
    // timeout survives.
    setTimeout(() => {
      dispatch({ type: "BOX_OPENED" });
    }, 1200);
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

  // Handle replay — reset music
  const handleReplay = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.seek(0);
      musicRef.current.play();
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
        <div className="skeleton">
          <div className="skeleton__avatar" />
          <div className="skeleton__line skeleton__line--short" />
          <div className="skeleton__line skeleton__line--long" />
          <div className="skeleton__line skeleton__line--medium" />
          <div className="skeleton__gift" />
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

  return (
    <div
      className="page wish-page"
      style={{ backgroundColor: theme.surface }}
    >
      {/* Audio controller — visible during entire experience */}
      {state.status !== STATUS.IDLE && (
        <AudioController
          isPlaying={state.isMusicPlaying}
          onToggle={handleMusicToggle}
        />
      )}

      {/* Experience orchestrator */}
      <ExperienceOrchestrator
        wish={wishData}
        sentences={sentences}
        state={state}
        dispatch={dispatch}
        theme={theme}
        onGiftBoxOpen={handleGiftBoxOpen}
        onBoxOpened={handleBoxOpened}
        onReplay={handleReplay}
      />
    </div>
  );
}
