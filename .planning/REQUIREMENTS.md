# Requirements: Birthday Wish Generator

**Defined:** 2026-06-20
**Core Value:** Turning a personal message into a magical, memorable experience. Real human sentiment, beautifully delivered.

## v1 Requirements

### Wish Creation

- [x] **WISH-01**: Generator can write a free-text wish message and submit with name, relationship, birth date, photos, and theme
- [x] **WISH-02**: System generates a unique shareable link for each wish (UUID-based, unguessable)
- [x] **WISH-03**: Generator can preview the wish, copy the link, and open it in a new tab

### Photo Upload

- [x] **PHOTO-01**: Generator can upload 1-5 photos, max 5MB each, with drag-and-drop support
- [x] **PHOTO-02**: Photos stored on server filesystem with UUID filenames, paths in SQLite

### Recipient Experience

- [ ] **PAGE-01**: Birthday person sees a dedicated page at /wish/:id with sender name shown upfront
- [ ] **PAGE-02**: Animated gift box in center — tap to open with animation and soft sound
- [ ] **PAGE-03**: Wish sentences appear one at a time, each tap reveals the next
- [ ] **PAGE-04**: Uploaded photos appear between wish sections with gentle transitions
- [ ] **PAGE-05**: Final sentence triggers confetti, sparkles, and "Happy Birthday!" animation
- [ ] **PAGE-06**: After confetti, all photos shown together in a gallery finale
- [ ] **PAGE-07**: Background music plays during the experience (tied to gift box tap for mobile unlock)
- [ ] **PAGE-08**: Replay button to experience the wish again
- [ ] **PAGE-09**: Emoji reactions (❤️ 😭 😂 🥰 etc.) and multi-tap heart button
- [ ] **PAGE-10**: Birthday page auto-enhanced with zodiac/birthstone/flower accents

### Tracking

- [ ] **TRACK-01**: System tracks wish opens (count and timestamps)
- [ ] **TRACK-02**: Generator can view a status page showing open count and reactions

### Themes

- [x] **THEME-01**: Generator selects from visual themes that change colors, backgrounds, animations
- [ ] **THEME-02**: Themes auto-incorporate flair data (birthstone color, zodiac symbol)

## v2 Requirements

### Enhanced Features

- **ENH-01**: Additional themes beyond initial set
- **ENH-02**: Photo lightbox in gallery finale
- **ENH-03**: More emoji reactions based on usage data
- **ENH-04**: Background music track selection (3-5 tracks)
- **ENH-05**: Animation polish pass (easings, timings, sparkle patterns)
- **ENH-06**: Photo reordering via drag-and-drop in form

### Future Features

- **FUT-01**: User accounts and authentication
- **FUT-02**: Full dashboard with wish history
- **FUT-03**: Social sharing from recipient page (with opt-in privacy controls)
- **FUT-04**: Reply/thank-you notes from birthday person
- **FUT-05**: Audio recording alongside wish text
- **FUT-06**: Video upload support
- **FUT-07**: Scheduled delivery (future date for wish to become accessible)
- **FUT-08**: Printable PDF version

## Out of Scope

| Feature | Reason |
|---------|--------|
| AI-generated wishes | Contradicts core value of authentic, human words. Adds API cost and latency. |
| Tone selector (funny/sincere/poetic/roast) | Sender's natural voice IS the tone. No override needed. |
| Public gallery / feed of wishes | Privacy nightmare. Wishes contain personal photos and private sentiments. |
| Real-time notifications | Requires WebSockets/push. Generator checks status page when curious. |
| Link expiry / view once | Infuriating UX. Birthday people want to revisit. Permanent links by design. |
| Group/collaborative wishes | Different product category. GroupGreeting/Kudoboard own this space. |
| Rich text editor | Plain text beautifully delivered is more powerful. Delivery IS the formatting. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| WISH-01 | Phase 1 | Complete |
| WISH-02 | Phase 1 | Complete |
| WISH-03 | Phase 2 | Complete |
| PHOTO-01 | Phase 2 | Complete |
| PHOTO-02 | Phase 2 | Complete |
| PAGE-01 | Phase 3 | Pending |
| PAGE-02 | Phase 3 | Pending |
| PAGE-03 | Phase 3 | Pending |
| PAGE-04 | Phase 3 | Pending |
| PAGE-05 | Phase 4 | Pending |
| PAGE-06 | Phase 4 | Pending |
| PAGE-07 | Phase 3 | Pending |
| PAGE-08 | Phase 4 | Pending |
| PAGE-09 | Phase 4 | Pending |
| PAGE-10 | Phase 5 | Pending |
| TRACK-01 | Phase 5 | Pending |
| TRACK-02 | Phase 5 | Pending |
| THEME-01 | Phase 2 | Complete |
| THEME-02 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-20*
*Last updated: 2026-06-20 after initial definition*
