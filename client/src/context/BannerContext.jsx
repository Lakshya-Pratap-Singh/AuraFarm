// BannerContext — site-wide hero banner image, customizable from Settings.
//
// Every page's hero (Dashboard, Missions, Objectives, Intelligence, Relics,
// Settings) reads its background image from here instead of hardcoding one,
// so a single upload in Settings re-skins every page at once.
//
// Persistence follows the same pattern as XPContext: localStorage, read
// once on mount, written on every change. The uploaded image is stored as
// a base64 data URL, which means it lives entirely in the browser (no
// backend/upload endpoint exists yet) and is subject to localStorage's
// ~5-10MB per-origin quota — comfortably enough for one banner image, not
// enough for many. If that quota is ever exceeded the write silently no-ops
// and the previous banner stays in place (see saveStoredBanner below).

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import defaultBannerImage from "../assets/banners/default-banner.jpg";

const BANNER_STORAGE_KEY = "dailywise_hero_banner";

// Basic guardrails for what a person can upload from Settings.
export const MAX_BANNER_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_BANNER_TYPES = ["image/png", "image/jpeg", "image/webp"];

function loadStoredBanner() {
  try {
    const raw = localStorage.getItem(BANNER_STORAGE_KEY);
    return raw || defaultBannerImage;
  } catch {
    return defaultBannerImage;
  }
}

function saveStoredBanner(dataUrl) {
  try {
    localStorage.setItem(BANNER_STORAGE_KEY, dataUrl);
    return true;
  } catch {
    // Most likely QuotaExceededError — the image was too large to persist.
    // Caller decides how to surface this; state itself already updated
    // in memory so the banner still applies for the current session.
    return false;
  }
}

const BannerContext = createContext(null);

// Shared inline-style object for a page's hero element. The dark overlay
// (--hero-bg-overlay, defined in index.css) keeps heading text legible
// regardless of what's in the uploaded photo; size/position/repeat are
// static and live in each page's own CSS instead of being repeated here.
export function getHeroBackgroundStyle(bannerUrl) {
  return {
    backgroundImage: `var(--hero-bg-overlay), url(${bannerUrl})`,
  };
}

export function BannerProvider({ children }) {
  const [bannerUrl, setBannerUrl] = useState(loadStoredBanner);
  const [isCustom, setIsCustom] = useState(
    () => loadStoredBanner() !== defaultBannerImage
  );
  const [persistError, setPersistError] = useState(false);

  useEffect(() => {
    if (bannerUrl === defaultBannerImage) {
      // Default doesn't need to occupy a localStorage slot.
      try {
        localStorage.removeItem(BANNER_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setPersistError(false);
      return;
    }
    const ok = saveStoredBanner(bannerUrl);
    setPersistError(!ok);
  }, [bannerUrl]);

  // file: a File from an <input type="file"> change event.
  const setCustomBanner = useCallback((file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided."));
        return;
      }
      if (!ACCEPTED_BANNER_TYPES.includes(file.type)) {
        reject(new Error("Please upload a PNG, JPEG, or WebP image."));
        return;
      }
      if (file.size > MAX_BANNER_BYTES) {
        reject(new Error("Image is too large — please use one under 5MB."));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setBannerUrl(reader.result);
        setIsCustom(true);
        resolve();
      };
      reader.onerror = () => reject(new Error("Couldn't read that file."));
      reader.readAsDataURL(file);
    });
  }, []);

  const resetToDefaultBanner = useCallback(() => {
    setBannerUrl(defaultBannerImage);
    setIsCustom(false);
  }, []);

  const value = {
    bannerUrl,
    isCustom,
    persistError,
    setCustomBanner,
    resetToDefaultBanner,
    defaultBannerImage,
  };

  return <BannerContext.Provider value={value}>{children}</BannerContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBanner() {
  const ctx = useContext(BannerContext);
  if (!ctx) {
    throw new Error("useBanner must be used within a BannerProvider");
  }
  return ctx;
}
