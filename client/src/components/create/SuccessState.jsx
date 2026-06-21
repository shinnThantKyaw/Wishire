import { useState } from "react";
import { THEMES } from "./ThemeSelector.jsx";

export default function SuccessState({ wish, onReset }) {
  const [copied, setCopied] = useState(false);

  function getWishUrl() {
    return `${window.location.origin}/wish/${wish.id}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getWishUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = getWishUrl();
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function openLink() {
    window.open(getWishUrl(), "_blank");
  }

  const firstLine =
    wish.message.split(/(?<=[.!?])\s+/)[0] || wish.message;

  const themePrimary =
    THEMES.find((t) => t.id === wish.theme)?.primary || "#ff6f59";

  return (
    <div className="success-state">
      <div
        className="success-state__icon"
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--mint)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        &#10003;
      </div>

      <h1 className="success-state__heading">Wish Created!</h1>

      <p className="success-state__body">
        Your birthday wish for{" "}
        <strong>{wish.recipientName}</strong> is ready to share.
      </p>

      {/*<div*/}
      {/*  className="success-state__preview"*/}
      {/*  style={{ borderColor: themePrimary }}*/}
      {/*>*/}
      {/*  <span className="success-state__preview-name">*/}
      {/*    {wish.recipientName}*/}
      {/*  </span>*/}
      {/*  <span className="success-state__preview-message">{firstLine}</span>*/}
      {/*  <span*/}
      {/*    className="success-state__preview-swatch"*/}
      {/*    style={{ backgroundColor: themePrimary }}*/}
      {/*  />*/}
      {/*</div>*/}

      <div className="success-state__link-box">
        <code>{getWishUrl()}</code>
      </div>

      <div className="success-state__actions">
        <button
          className="success-state__btn success-state__btn--primary"
          onClick={openLink}
          aria-label="Open wish in new tab"
        >
          Open Link
        </button>
        <button
          className="success-state__btn success-state__btn--secondary"
          onClick={copyLink}
          aria-label="Copy wish link to clipboard"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <button className="success-state__back" onClick={onReset}>
        Create another wish
      </button>
    </div>
  );
}
