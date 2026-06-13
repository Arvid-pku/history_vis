# Findings

## Stepwise Commit / Push Cleanup
- The dirty tree after v314 contained one coherent runtime state across `app.js`, `index.html`, `styles.css`, and `print.css`; because the changes were accumulated without intermediate commits, reconstructing many small feature commits would require inventing unverified intermediate states.
- The safe split is therefore by artifact layer: runtime source first, README second, and project iteration records third.
- Static checks before committing passed with `node --check app.js` and `git diff --check`.
- Commit 1 pushed to `origin/main`: `d3cb9dd feat: expand timeline model and interactions`.
- Commit 2 pushed to `origin/main`: `f4bdf4d docs: update timeline usage guide`.
- The remaining untracked files are project iteration records (`feedback.md`, `next_prompt.md`, `task_plan.md`, `findings.md`, `progress.md`) and should be committed separately from runtime changes.

## v314 Detail Wiki-Link Coverage Audit
- User reported that famous entities in detail pages are missing inline wiki links, with Kangxi, Qianlong, and Guangxu as examples. This pass must check the linker and both Chinese / English descriptions, not just the named examples.
- Current working tree already contains the prior large static-site changes and planning files. Treat them as existing project state and avoid reverting unrelated changes.
- Root cause was twofold: detail descriptions used the inline linker, but `Notable Rulers`, achievements, and connection lists were rendered as raw list text; additionally English ruler data did not actually merge `entity.rulers` with `ENTITY_DETAILS[id].rulers`, so `Guangxu` was absent from the English Qing panel.
- v314 adds context-aware inline wiki candidates for rulers / ruler-like known entities, explicit disambiguation for high-value ambiguous names, and safe escaped rendering for ruler, achievement, and connection-list text.
- Data audit after the fix: 2501 merged ruler entries checked across English and Chinese, 2394 produce wiki URLs, and the 107 intentionally unlinked entries are mostly generic group labels such as "Goguryeo kings", "Ming commanders", "officials", "authorities", or Chinese equivalents.
- Browser verification on `app.js/styles.css/print.css?v=314` confirmed Chinese Qing links for 康熙 / 乾隆 / 光绪 and English Qing links for Kangxi / Qianlong / Guangxu, with 0 browser warning/error logs.
- Follow-up existence audit corrected the earlier standard: "URL generated" is not enough. Four subagents were assigned disjoint batches, and the main thread used MediaWiki API checks for actual page existence, redirects, and disambiguation flags.
- The broad audit found many missing pages caused by the automatic ruler-name fallback, especially Chinese transliterations and group labels. v314 now disables that fallback: known ruler terms only link when an explicit or contextual mapping exists.
- Confirmed generated-link audit after tightening: 382 actual link instances, 171 unique wiki targets, 0 missing pages, and 0 disambiguation pages. English targets: 96 unique, 0 missing. Chinese targets: 75 unique, 0 missing.
- Subagent findings incorporated: English non-East-Asia override batch had 45/45 valid targets; English East-Asia/context batch had 79 valid override entries; Chinese explicit override batch had 68/69 valid and flagged `威廉一世_(德意志帝国)` as missing.
- `威廉一世` required semantic correction, not only existence correction. The global Chinese mapping was removed; `england_medieval|威廉一世` now maps to `征服者威廉`, while `north_german_confed|威廉一世`, `german_empire|威廉一世`, and `poland_partition_prussian|威廉一世` map to `威廉一世 (德国)`.
- Browser verification after the correction confirmed Qing CN/EN links, English/Chinese William/Wilhelm context links, `v314` assets, and 0 warning/error logs.

## v313 Initial Event/Ruler/Wiki-Link Audit
- Current world-event layer has 176 events. Distribution by primary region is uneven but understandable after prior East Asia / Europe passes: East Asia 58, Europe 45, Middle East 22, South Asia 13, Southeast Asia 13, Americas 12, Central Asia 8, Africa 5.
- Event types are dominated by political and conquest markers: political 78, conquest 33, conflict 23, cultural 16, invention 13, exploration 5, construction 4, disaster 3, trade 1.
- The clearest event-coverage candidates are Africa, Central Asia, Americas, and selected global/Indian Ocean nodes; East Asia and Europe already risk over-density and should only receive exceptionally important additions.
- Existing detail panels render descriptions as raw string interpolation in `showDetail()` and `showEventDetail()`. Any inline wiki-link pass should first escape text, then link known terms from existing entity/wiki mappings to avoid introducing HTML injection.
- A horizontal movable ruler should be a display layer alongside Events / Links / Labels / Eras, because it is visual context rather than data. It should preserve state in URLs like other display layers.

## v313 Subagent Results
- Event-coverage subagent confirmed the structure is `HISTORICAL_EVENTS`, not `WORLD_EVENTS`, and recommended avoiding broad event inflation. It identified 8 high-value additions, all structural rather than local: Bantu Expansion, Arab Conquest of Egypt, Srivijaya Emerges, Delhi Sultanate Founded, Timurid Empire Founded, Inca Expansion under Pachacuti, Transatlantic Slave Trade Begins, and Industrial Revolution Begins.
- Detail-link subagent confirmed the safest low-blast-radius scope is the entity/event description paragraphs, not every fact/list item. It also recommended a distinct inline-link class rather than reusing `.wiki-link`, because `.wiki-link` is already used for the bottom Wikipedia CTA and focus restoration.
- v313 implementation follows those findings: detail descriptions now use escaped text plus `.inline-wiki-link` anchors, event count is 184, and the new time ruler state is encoded as `ruler` / `rulerYear`.

## Prior Session Context
- Previous work committed and pushed `590abc0 overhaul: flat minimalist redesign + data fixes` to `origin/main`.
- The repository currently has no tracked source diff before this pass.
- Development screenshots are intentionally ignored by `.gitignore`.

## Project shape — auto-detected (2026-06-11)
- Project type: static HTML/CSS/JavaScript history visualization.
- File-kit mapping:
  - feedback    -> feedback.md
  - task_plan   -> task_plan.md
  - findings    -> findings.md
  - progress    -> progress.md
  - next_prompt -> next_prompt.md
  - changelog   -> progress.md
- Naming style: lowercase.md / mixed source files.
- Commit message style: mixed.
- Language of prior notes: English with Chinese user feedback.
- Unsure about: none blocking; the current work can proceed through scoped data/model updates and browser verification.

## v185 Current-State Audit
- Data integrity before the v185 edit was structurally healthy: 765 entities, 612 connections, no duplicate IDs, no missing connection endpoints, no unknown categories, and no invalid territory owner references.
- The aggregate weak-metadata score ranked `middleEast` highest. The most concentrated issue was near-modern interpretability: late Ottoman, British/Mandate, Turkey, Egypt, Iraq, Pahlavi/Iran, and modern Levant blocks lacked enough descriptions, centers, details, relationships, or accurate phase labels.
- The highest-value correction was not another decorative shape pass. The misleading cases were chronological/semantic: `British Egypt` covered 1914-1952 despite the 1922 kingdom transition, and `Iraq` was labeled as a republic starting in 1932 despite the Hashemite kingdom lasting to 1958.
- The simplified Levant lane also had a mandate-era knowledge gap: Palestine and Transjordan were visible, but French Syria-Lebanon and the 1946-48 independent Syria/Lebanon and Jordan bridges were absent.

## v185 Modern Middle East Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=185`, `print.css?v=185`, and `app.js?v=185`.
- VM data integrity passed with 770 entities, 630 connections, 0 duplicate IDs, 0 missing endpoints, 0 unknown categories, 0 invalid owner references, 0 Middle East slot overlaps, and all v185 target descriptions/details/capitals/territory notes/relationship links present.
- In-app browser desktop rendered 770 polity blocks and 315 owner-fill pieces, loaded only `v185` resources, confirmed the Palestine / French Syria-Lebanon / Transjordan strips are adjacent without overlap, found no target label overflow, and captured 0 console/runtime errors.
- English and Chinese detail checks passed for `iraq_kingdom`: the panel opens from search, explains the Hashemite kingdom and `Territorial Reading` / `疆域语义`, links to the correct English and Chinese Wikipedia targets, and captured 0 console/runtime errors.
- 390px mobile verification rendered all 770 blocks with no body-level horizontal overflow, no target label overflow for the narrow mandate and independence strips, and 0 console/runtime errors.

## v185 Modern Middle East Source Notes
- Britannica supports Ataturk, the Turkish Republic, and the post-Ottoman Turkish transition (`https://www.britannica.com/biography/Kemal-Ataturk`, `https://www.britannica.com/place/Turkey/Declaration-of-the-Turkish-republic`).
- Britannica supports Egypt's British occupation/protectorate, 1922 independence/kingdom transition, and 1952 revolution/republic framing (`https://www.britannica.com/place/Egypt/World-War-I-and-independence`, `https://www.britannica.com/place/Egypt/The-revolution-and-the-Republic`).
- Britannica supports Iraq's British occupation/mandate, 1932 independence, Hashemite kingdom, and 1958 republic transition (`https://www.britannica.com/place/Iraq/British-occupation-and-the-mandatory-regime`, `https://www.britannica.com/place/Iraq/Independence-1932-39`, `https://www.britannica.com/place/Iraq/The-Republic-of-Iraq`).
- Britannica and the US Office of the Historian support the Palestine / French Syria-Lebanon / Transjordan mandate split, the post-1946 independent bridge, and the 1948 Israel/Arab-Israeli transition (`https://www.britannica.com/place/Palestine/World-War-I-and-after`, `https://www.britannica.com/place/Syria/The-French-mandate`, `https://www.britannica.com/place/Lebanon/French-mandate`, `https://history.state.gov/milestones/1945-1952/creation-israel`, `https://history.state.gov/historicaldocuments/frus1946v07/d620`).
- Britannica supports the Pahlavi dynasty and 1979 Iranian Revolution split (`https://www.britannica.com/topic/Pahlavi-dynasty`, `https://www.britannica.com/event/Iranian-Revolution`).

## v186 Afghan-Route Owner-Chain Findings
- The current-state weak-metadata audit ranked `afghan_islamic_early` as the highest-scoring single debt: 651-821, no category, no detail metadata, no capital/center, no territory note, no relationship links, and a misleading label that implied instant full Islamic ownership.
- The stronger correction is not a decorative polygon. The Afghanistan lane had a real owner gap after 821, and the label itself flattened a frontier process. v186 replaces it with a continuous chain: `afghan_turkic` -> `kabul_zabul_frontier` -> `saffarid_afghan` -> `ghaznavid_ca`.
- This removes the former 821-977 blank interval in slot 4. Kabul Shahis / Zunbils, Saffarid expansion from Sistan, and Ghaznavid Ghazna now each carry the lane with explicit relationship links and territory notes.
- The browser QA caught existing label overflow on `ghaznavid_ca` and `samanid_south`; v186 fixes that with short face labels while preserving full names in search, accessibility, and details.

## v186 Source Notes
- Encyclopaedia Iranica supports the Sistan-to-Zabul/Kabul frontier: Arabs appeared in Sistan in 652, then raids reached Arachosia/Rokkhaj, Zamindawar, the Zunbils, and the Kabulshahs (`https://www.iranicaonline.org/articles/sistan-ii-islamic-period/`).
- Britannica supports the broader Afghanistan summary that Islam became entrenched under the Saffarids around 870 (`https://www.britannica.com/summary/Afghanistan`).
- Britannica supports the first Muslim dynasties sequence: Tahirids in Khorasan, Saffarids from Sistan around 867-869, and Samanid Balkh/Bukhara/Samarkand context (`https://www.britannica.com/place/Afghanistan/The-first-Muslim-dynasties`).
- Britannica supports the Ghaznavid transition from Sebuktigin at Ghazna in 977 and the Ghaznavid dynasty's rule over Khorasan, Afghanistan, and northern India (`https://www.britannica.com/topic/Ghaznavid-dynasty`, `https://www.britannica.com/biography/Sebuktigin`, `https://www.britannica.com/place/Ghazni`).

## v186 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=186`, `print.css?v=186`, and `app.js?v=186`.
- VM data integrity passed with 771 entities, 635 connections, 0 duplicate IDs, 0 missing endpoints, 0 unknown categories, 0 invalid owner references, 0 Central Asia slot overlaps, old `afghan_islamic_early` absent, and all v186 target descriptions/details/capitals/territory notes/relationship links present.
- In-app browser desktop rendered 771 blocks and 315 owner-fill pieces, loaded only `v186` resources, confirmed the Afghan-route chain is vertically continuous, found no target label overflow after shortening `ghaznavid_ca` and `samanid_south`, and captured 0 console/runtime errors.
- English and Chinese detail checks passed for `kabul_zabul_frontier`: the panel opens from search, explains Kabul Shahis / Zunbils and the difference between raids/tribute and full owner replacement, shows `Territorial Reading` / `疆域语义`, and links to the expected English and Chinese Wikipedia targets.
- 390px mobile verification rendered all 771 blocks with no body-level horizontal overflow, no target label overflow, and 0 console/runtime errors.

## Initial Repository Shape
- Static site files: `index.html`, `styles.css`, `app.js`, `print.css`, `README.md`.
- `app.js` contains the data model and all rendering/interaction logic.
- `index.html` includes several inline styles for category chips and toolbar spacing, which are candidates for polish.

## Initial Risk Areas
- Large single-file JavaScript means regressions are most likely around shared render state.
- Several UI actions update URL state or rerender, so browser verification is required after edits.
- Export depends on remote `html2canvas`; it should fail gracefully when unavailable.

## Browser Audit
- Desktop load succeeds without console errors.
- Initial render produces 529 polity blocks, 91 left-rail event medallions, and 91 right-rail global markers.
- Turning `Events` off updates the URL and checkbox state but leaves both event marker sets visible.
- Chinese mode changes block names but not the year scale or search placeholder.
- `flashYearBeacon()` uses `var(--vermilion)`, which is undefined in the current palette.

## Code Audit
- Keyboard navigation uses `.timeline-container.scrollTop/scrollLeft`, but vertical scrolling is page-level and horizontal scrolling belongs to `.timeline-wrapper`.
- Double-click zoom also assumes `.timeline-container` is the vertical scroll container, so it cannot reliably keep the clicked year centered.
- Several dynamic display strings are hardcoded in English despite language mode.

## Implemented Fixes
- Removed duplicate left-rail event medallion rendering; retained the right-side global event rail.
- Fixed `Events` toggle so it rerenders timeline state and clears/hides global event markers.
- Added centralized UI text tables for English/Chinese controls, placeholders, tooltips, stats labels, toast text, and category labels.
- Made `formatYear()` language-aware and added missing year-scale rerender on language switch.
- Reworked zoom anchoring, keyboard navigation, double-click zoom, year cursor math, and jump-to-year scrolling around page-level vertical scroll plus timeline-wrapper horizontal scroll.
- Added Chinese year parsing for inputs such as `公元前500`.
- Replaced undefined `--vermilion` beacon color with `--accent`.
- Added category filter state to shareable URLs.
- Removed relevant inline category/header/search styles from HTML and moved them to CSS.
- Fixed mobile horizontal overflow by allowing region/category tool groups to wrap.
- Made the large mobile header non-sticky to avoid permanently covering the timeline.
- Improved keyboard accessibility: category chips are real buttons, global event markers are buttons, polity blocks expose `role="button"`/`tabIndex`, Enter/Space opens detail panels, compare options expose `aria-pressed`, and dialogs move focus to the close button.

## Verification Results
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Desktop browser: `app.js?v=25`, 529 polity blocks, 0 duplicate medallions, 91 global event markers, no console warnings/errors, no document-level horizontal overflow.
- Event toggle: turning events off leaves 0 event medallions and 0 global markers, with the global event track hidden.
- Chinese mode: document title, HTML lang, search placeholder, toolbar labels, stats labels, event titles, and year scale switch to Chinese.
- Jump-to-year: Chinese input `公元前500` shows the localized toast and scrolls after smooth animation settles.
- Mobile 390x844: document/body width remains 390px; timeline keeps horizontal scrolling inside `#timelineWrapper`; stats chip is hidden; header is `position: static`.
- Accessibility regression: category chips and event markers are buttons; a focused polity block opens the detail panel with Enter and focus lands on the close button.

## Residual Opportunities
- Export uses `html2canvas` only when the user asks for a PNG; fallback to print remains in place when the renderer cannot load.
- Compare mode still needs URL-state hardening: the rendered region pair can be shared via `regions=...`, but the active Compare-mode semantics (`aria-pressed`, "click Compare to exit") are currently held in local setup state and are lost on refresh.

## Compare URL State Fix
- Promoted Compare mode to the existing `CONFIG.compareMode` / `CONFIG.compareRegions` state instead of keeping it only as a local variable inside `setupCompareMode()`.
- Added `compare=` URL encoding for active two-region comparisons while preserving the existing `regions=` visible-region state.
- Added URL parsing so `?compare=eastAsia,europe` restores Compare button active/pressed state, checks only the selected region boxes, and renders only the comparison pair.
- Manual region checkbox changes now clear Compare mode, remove `compare=` from the URL, and keep the resulting region selection as an ordinary filter.
- Updated README share documentation and bumped source references to `app.js?v=45`, `styles.css?v=45`, and `print.css?v=45`.

## Compare URL State Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v45` and no `compareModeActive` local state remains.
- Local Chrome via CDP: direct `?compare=eastAsia,europe&lang=cn&zoom=0.25` restored Compare as active/pressed, left only East Asia and Europe checked, rendered 164 polity blocks, and loaded `v45` resources.
- Local Chrome via CDP: clicking Compare while active exited comparison, removed `compare=`, restored all eight regions, rendered 529 polity blocks, and showed the localized exit toast.
- Local Chrome via CDP: applying East Asia + Europe through the chooser wrote both `regions=eastAsia,europe` and `compare=eastAsia,europe`; manually checking Africa removed `compare=` and left a normal three-region filter.
- Mobile 390x844 `?compare=eastAsia,europe`: Compare stayed active/pressed, only two regions were checked, document/body width stayed 390px, and no console/runtime errors were captured.

## Help Dialog Trigger Audit
- The Help button exposes `aria-haspopup="dialog"` and `aria-controls="eventPanel"`, but it does not expose `aria-expanded`; Compare already has this state, so the two dialog triggers are inconsistent.
- Because the same `#eventPanel` is reused for Help, event details, and polity details, the Help button should only be expanded while the Help dialog content is active, not when any detail panel happens to be open.

## Help Dialog Trigger Fix
- Added initial `aria-expanded="false"` to the Help trigger.
- Added `activePanelKind` tracking so the shared detail/help dialog can distinguish Help content from event and polity detail content.
- Updated `showPanel()` callers to label the open panel as `help`, `event`, or `detail`; Help now reports expanded only for the Help dialog.
- Updated README accessibility copy and bumped source references to `app.js?v=46`, `styles.css?v=46`, and `print.css?v=46`.

## Help Dialog Trigger Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v46` and all `showPanel()` callers pass an explicit panel kind.
- Local Chrome via CDP: Chinese page loaded `v46` resources with Help `aria-expanded=false` and localized label `键盘快捷键`.
- Local Chrome via CDP: clicking Help set `aria-expanded=true`, opened `#eventPanel`, kept `aria-labelledby="panelTitle"`, moved focus to `#panelClose`, and showed title `键盘快捷键`.
- Local Chrome via CDP: closing Help reset `aria-expanded=false`, hid the panel, and restored focus to `#helpBtn`.
- Local Chrome via CDP: opening a world event detail and a polity detail kept Help `aria-expanded=false` while the shared panel was open.
- Mobile 390x844 `?lang=cn`: Help stayed collapsed/localized, document/body width stayed 390px, and no console/runtime errors were captured.

## Legend Disclosure Audit
- The Legend toggle behaves like a disclosure control, but the static button markup lacks initial `aria-expanded` and `aria-controls`.
- The legend content is visually clipped when collapsed via `max-height`/`overflow`, but the content region itself does not receive `aria-hidden`, so visual and assistive states can diverge.

## Legend Disclosure Fix
- Added `aria-expanded="false"` and `aria-controls="legendContent"` to the static Legend toggle.
- Added `id="legendContent"` and initial `aria-hidden="true"` to the legend content region.
- Synchronized legend button text, expanded state, label/title, and content hidden state through `updateLegendToggleLabel()`.
- Updated README accessibility copy and bumped source references to `app.js?v=47`, `styles.css?v=47`, and `print.css?v=47`.

## Legend Disclosure Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v47`, the Legend button controls `legendContent`, and the content region exposes `aria-hidden`.
- Local Chrome via CDP: initial Legend state is collapsed with `aria-expanded=false`, `aria-controls=legendContent`, and `legendContent aria-hidden=true`, loading `v47` resources.
- Local Chrome via CDP: opening Legend sets `aria-expanded=true`, `legendContent aria-hidden=false`, shows `×`, and renders 8 region legend groups plus 8 category items.
- Local Chrome via CDP: switching to Chinese while Legend is open keeps it expanded with localized label `切换图例`; closing it shows `图例` and restores `aria-hidden=true`.
- Mobile 390x844 `?lang=cn`: Legend stays collapsed/localized, document/body width stays 390px, and no console/runtime errors were captured.

## Exit Full Page Focus Audit
- The Exit Full Page control is visually hidden and `aria-hidden=true` while inactive, but the static markup does not explicitly remove it from sequential focus.
- Because the Full Page flow intentionally moves focus to the exit control while active, the inactive state should also explicitly set `tabindex="-1"` and restore normal focusability only while full-page mode is enabled.

## Exit Full Page Focus Fix
- Added `type="button"` and initial `tabindex="-1"` to the static Exit Full Page control.
- Synchronized Exit Full Page `tabindex` with full-page state: `0` while full-page mode is active, `-1` while inactive.
- Kept localized Exit Full Page text/label and full-mode focus transfer behavior intact.
- Updated README accessibility copy and bumped source references to `app.js?v=48`, `styles.css?v=48`, and `print.css?v=48`.

## Exit Full Page Focus Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v48` and Exit Full Page has initial `aria-hidden=true` plus `tabindex="-1"`.
- Local Chrome via CDP: initial Chinese page loads `v48` resources, Exit Full Page is hidden with `tabindex=-1`, and Full Page reports `aria-pressed=false`.
- Local Chrome via CDP: clicking Full Page sets body full-page mode, exposes Exit Full Page with `aria-hidden=false` and `tabindex=0`, hides the header, and moves focus to `#exitFullPage`.
- Local Chrome via CDP: exiting by Escape and by clicking Exit Full Page restores `aria-hidden=true`, `tabindex=-1`, `aria-pressed=false`, and focus to `#fullPageBtn`.
- Mobile 390x844 `?lang=cn`: Exit Full Page stays hidden with `tabindex=-1`, document/body width stays 390px, and no console/runtime errors were captured.

## Region Filter Name Audit
- Region checkboxes use abbreviated visible labels such as `E. Asia`, `M. East`, and `C. Asia` to fit the dense toolbar.
- Those abbreviations are efficient visually but weak accessible names; the inputs should expose full localized region names while preserving the compact visible labels.

## Region Filter Name Fix
- Added static full English `aria-label` values to all region checkboxes.
- Updated language refresh logic so region checkbox accessible names and hover titles use full localized region names from `WORLD_HISTORY`.
- Preserved the compact visible labels from `REGION_SHORT_LABELS` so the toolbar layout stays dense.
- Updated README accessibility copy and bumped source references to `app.js?v=49`, `styles.css?v=49`, and `print.css?v=49`.

## Region Filter Name Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v49`, region checkboxes have static English `aria-label`s, and runtime code sets localized full names.
- Local Chrome via CDP: English region controls expose full accessible names/titles such as `East Asia`, `Southeast Asia`, `Middle East`, while visible labels remain compact (`E. Asia`, `SE. Asia`, `M. East`).
- Local Chrome via CDP: switching to Chinese sets group label `地区`, document language `zh-CN`, and full localized region names/titles such as `东亚`, `东南亚`, `中东`.
- Local Chrome via CDP: toggling Middle East off preserves its Chinese accessible name, writes a `regions=` URL without `middleEast`, and renders 439 polity blocks.
- Mobile 390x844 `?lang=cn`: region labels remain localized, document/body width stays 390px, and no console/runtime errors were captured.

## Era Jump Name Audit
- Era jump buttons use compact visible labels such as `Bronze`, `Classical`, `青铜`, and `古典`.
- They already have localized title text at runtime, but they lack explicit accessible names, so their readable names can remain less complete than the conceptual destination.

## Era Jump Name Fix
- Added static full English `aria-label` values to the four era jump buttons.
- Updated language refresh logic so era jump buttons set localized full `aria-label`s alongside their localized title text.
- Preserved compact visible labels (`Bronze`, `Classical`, `青铜`, `古典`) to keep the toolbar stable.
- Updated README accessibility copy and bumped source references to `app.js?v=50`, `styles.css?v=50`, and `print.css?v=50`.

## Era Jump Name Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v50`, era buttons have static English `aria-label`s, and runtime code sets localized labels from existing title strings.
- Local Chrome via CDP: English era controls expose full labels/titles such as `Bronze Age`, `Classical Antiquity`, and `Early Modern`, while visible labels stay compact.
- Local Chrome via CDP: switching to Chinese sets group label `跳转时代`, document language `zh-CN`, and full localized labels/titles such as `青铜时代`, `古典时代`, and `近代早期`.
- Local Chrome via CDP: clicking the Classical/古典 button scrolls the page and shows the localized toast `已跳转到 公元前500年`.
- Mobile 390x844 `?lang=cn`: era labels remain localized, document/body width stays 390px, and no console/runtime errors were captured.

## Display Layer Toggle Name Audit
- Display layer toggles use compact visible labels (`Events`, `Links`, `Eras`; `大事`, `联系`, `时代`).
- `Links` in particular is ambiguous out of context; the checkbox accessible names should describe the actual layer (`Historical connections`) while keeping the toolbar labels compact.

## Display Layer Toggle Name Fix
- Added static full English `aria-label` values to the Events, Links, and Eras checkboxes.
- Added localized full labels for world events, historical connections, and era backgrounds.
- Updated language refresh logic so the checkboxes and their label titles use the full localized layer names while visible toolbar labels remain compact.
- Updated README accessibility copy and bumped source references to `app.js?v=51`, `styles.css?v=51`, and `print.css?v=51`.

## Display Layer Toggle Name Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v51` and static layer checkbox labels are present.
- Local Chrome via CDP: English display toggles expose full labels/titles `World events`, `Historical connections`, and `Era backgrounds`, while visible labels remain `Events`, `Links`, and `Eras`.
- Local Chrome via CDP: switching to Chinese sets group label `显示图层` and full labels/titles `世界大事`, `历史联系`, and `时代背景`, while visible labels remain compact.
- Local Chrome via CDP: turning off Historical connections writes `connections=0`, keeps the localized accessible name, and removes all `.connection-line` SVGs.
- Mobile 390x844 `?lang=cn`: display-layer labels remain localized, document/body width stays 390px, and no console/runtime errors were captured.

## Command Button Name Audit
- Utility buttons use compact visible text (`Compare`, `Export`, `Share`, `Dark`, `Full`; Chinese equivalents) and mostly rely on `title` attributes for fuller descriptions.
- The year jump `Go` button is also compact and lacks an explicit accessible name.
- These command buttons should expose complete localized `aria-label`s while keeping their concise visual labels and existing pressed/expanded state.

## Command Button Name Fix
- Added static English `aria-label`s to the year jump and utility command buttons.
- Updated language refresh logic so `Go`, Compare, Export, Share, Dark Mode, and Full Page expose complete localized `title` and `aria-label` values while keeping compact visible text.
- Kept Compare `aria-expanded` / `aria-pressed`, Dark `aria-pressed`, and Full Page `aria-pressed` state separate from their stable command names.
- Fixed Full Page focus restoration so entering through the Full Page command records `#fullPageBtn` as the return target instead of inheriting whichever control happened to be focused.
- Updated README accessibility copy and bumped source references to `app.js?v=53`, `styles.css?v=53`, and `print.css?v=53`.

## Command Button Name Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v53` and runtime text refresh sets command button `aria-label`s from localized UI strings.
- Local Chrome via CDP: English command buttons expose complete names/titles (`Go to year`, `Compare two regions`, `Export as PNG`, `Copy shareable link`, `Toggle dark mode`, `Distraction-free view`) while visible labels remain compact.
- Local Chrome via CDP: switching to Chinese localizes visible labels and accessible names (`前往年份`, `对比两个地区`, `导出为 PNG`, `复制可分享链接`, `切换深色模式`, `无干扰视图`).
- Local Chrome via CDP: Dark Mode keeps `aria-label="切换深色模式"` while changing visible text to `浅色` and `aria-pressed=true`.
- Local Chrome via CDP: opening Compare keeps the localized command name, sets `aria-expanded=true`, leaves `aria-pressed=false`, exposes the panel, and moves focus to the first compare option.
- Local Chrome via CDP: entering and exiting Full Page keeps the localized command name, exposes Exit Full Page with `tabindex=0` while active, then restores focus to `#fullPageBtn` and returns Exit Full Page to `tabindex=-1`.
- Mobile 390x844 `?lang=cn`: command labels remain localized, 529 timeline blocks render, document/body width stays 390px, and no console/runtime errors were captured.

## Mobile Toolbar Disclosure Audit
- The mobile Controls button already had `aria-expanded` and `aria-controls="toolbarRows"`, but the controlled toolbar rows did not expose matching `aria-hidden`.
- The toolbar rows are always visible on desktop and collapsed only under the mobile breakpoint, so the hidden state needs to be viewport-aware instead of tied only to the open class.
- The mobile Controls button also needed synchronized localized `title` and `aria-label` values while toggling between Controls and Hide controls.

## Mobile Toolbar Disclosure Fix
- Added initial static `aria-hidden="false"` to `#toolbarRows` and a static `title` / `aria-label` to the mobile Controls button.
- Added viewport-aware mobile toolbar state syncing: desktop keeps `#toolbarRows aria-hidden=false`; mobile collapsed sets it to `true`; mobile expanded restores it to `false`.
- Synchronized mobile Controls button visible text, title, accessible name, and expanded state during clicks, language changes, and breakpoint changes.
- Updated README accessibility copy and bumped source references to `app.js?v=54`, `styles.css?v=54`, and `print.css?v=54`.

## Mobile Toolbar Disclosure Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v54`, `#toolbarRows` has initial `aria-hidden="false"`, and runtime code synchronizes mobile toolbar hidden state.
- Local Chrome via CDP: desktop 1440px loads `v54`, hides the mobile toggle visually, keeps toolbar rows displayed, and keeps `#toolbarRows aria-hidden=false`.
- Local Chrome via CDP: resizing to 390px collapses the toolbar rows visually and sets `aria-hidden=true` with no document-level horizontal overflow.
- Local Chrome via CDP: opening mobile controls sets button text/title/label to `Hide controls`, `aria-expanded=true`, and `#toolbarRows aria-hidden=false`.
- Local Chrome via CDP: switching to Chinese while open updates the button to `收起控制` with matching title/label and keeps toolbar rows exposed.
- Local Chrome via CDP: closing Chinese mobile controls sets button text/title/label to `控制`, `aria-expanded=false`, and `#toolbarRows aria-hidden=true`.
- Local Chrome via CDP: widening back to desktop restores `#toolbarRows aria-hidden=false` while the mobile toggle is visually hidden, and no console/runtime errors were captured.

## Search Clear Focus Audit
- Search clearing already updated `CONFIG.searchQuery`, rerendered results, and removed `search=` from the URL.
- Clicking the clear button immediately hides that same focused button, which can leave keyboard focus on a disappearing control or fall back to browser-defined focus behavior.
- The search icon is decorative but was exposed as literal text in the DOM instead of being hidden from assistive technologies.

## Search Clear Focus Fix
- Marked the decorative search icon with `aria-hidden="true"`.
- Added optional focus restoration to `clearSearch()`.
- Wired clear-button clicks to clear the query and return focus to the search input, while preserving the existing Escape behavior that clears and blurs the input.
- Updated README search behavior and bumped source references to `app.js?v=55`, `styles.css?v=55`, and `print.css?v=55`.

## Search Clear Focus Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v55`, the search icon is hidden from assistive tech, and clear-button clicks call `clearSearch({ restoreFocus: true })`.
- Local Chrome via CDP: typing `Aztec` updates the URL with `search=Aztec`, shows the clear button, creates one visible `.search-match`, and keeps focus in the search input.
- Local Chrome via CDP: clicking Clear removes `search=` from the URL, hides the clear button, clears matches, and restores focus to `#searchInput`.
- Local Chrome via CDP: pressing Escape from the search input removes `search=` and hides the clear button while preserving the existing blur behavior.
- Mobile 390x844 `?search=Aztec&lang=cn`: the restored search shows the localized match, localized clear label `清除搜索`, document/body width stays 390px, and clicking Clear restores focus to the search input.
- No console/runtime errors were captured.

## URL Zoom Bounds Audit
- Runtime zoom controls clamp zoom through `setZoom()`, but URL restoration accepted raw `?zoom=` values before first render.
- Oversized URLs such as `?zoom=999` could create an extremely tall timeline, while negative values could invert year math before any runtime control had a chance to correct it.
- Invalid zoom values should fall back to the default scale, and copied/share-normalized URLs should reflect the effective clamped zoom.

## URL Zoom Bounds Fix
- Added `clampZoomValue()` so URL parsing and runtime `setZoom()` use the same finite `0.1` to `15` bounds.
- Updated URL `zoom` parsing to clamp oversized/negative values and fall back to the default zoom for non-numeric values.
- Hardened `setZoom()` against `NaN` by preserving the current finite zoom as fallback.
- Updated README share behavior and bumped source references to `app.js?v=56`, `styles.css?v=56`, and `print.css?v=56`.

## URL Zoom Bounds Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v56`, URL zoom parsing uses `clampZoomValue()`, and the old raw `parseFloat(params.get('zoom'))` path is gone.
- Local Chrome via CDP: `?zoom=999` loads `v56`, renders 529 blocks, and clamps the slider/value/config zoom to `15.00 px/yr`.
- Local Chrome via CDP: calling `updateURLState()` after `?zoom=999` rewrites the URL to `zoom=15`; after `?zoom=-4`, it rewrites to `zoom=0.1`.
- Local Chrome via CDP: `?zoom=abc` falls back to `0.25 px/yr` and marks the All preset active/pressed.
- Local Chrome via CDP: `setZoom(NaN)` preserves the current finite zoom instead of corrupting render state.
- Mobile 390x844 `?zoom=999&lang=cn`: zoom clamps to `15.00 px/yr`, document/body width stays 390px, and no console/runtime errors were captured.

## Malformed Region URL Audit
- Intentional all-regions-off state is encoded as `regions=none` and legacy blank `regions=`.
- Unknown-only region URLs such as `regions=notARegion` were filtered to an empty array, making a malformed URL behave like the intentional all-regions-off state.
- Mixed URLs such as `regions=notARegion,eastAsia` should keep the known region while dropping unknown tokens.

## Malformed Region URL Fix
- Added `parseVisibleRegionsParam()` to distinguish explicit empty region state from malformed unknown-only region lists.
- Unknown-only `regions=` parameters now leave the default all-regions-visible state intact.
- Mixed known/unknown `regions=` parameters keep only known region keys and normalize when URL state is rewritten.
- Updated README share behavior and bumped source references to `app.js?v=57`, `styles.css?v=57`, and `print.css?v=57`.

## Malformed Region URL Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v57` and region URL parsing routes through `parseVisibleRegionsParam()`.
- Local Chrome via CDP: `?regions=notARegion` loads `v57`, keeps all eight regions checked, renders 529 blocks, and normalizes away the unknown token on URL rewrite.
- Local Chrome via CDP: `?regions=notARegion,eastAsia` keeps only East Asia checked, renders 83 blocks, and normalizes to `regions=eastAsia`.
- Local Chrome via CDP: `?regions=none` and blank `?regions=` still intentionally uncheck all regions and render 0 blocks.
- Mobile 390x844 `?regions=notARegion&lang=cn`: all eight regions remain checked, 529 blocks render, document/body width stays 390px, and no console/runtime errors were captured.

## Malformed Layer Flag URL Audit
- Layer visibility flags (`events=`, `connections=`, `eras=`) were parsed as `value === '1'`, so any present malformed value behaved like explicit off.
- This made URLs such as `events=maybe` hide world events even though only `events=0` should express the user's intent to turn the layer off.
- Mixed valid/malformed flags should apply the valid flags and preserve defaults for malformed ones.

## Malformed Layer Flag URL Fix
- Added `parseBooleanURLFlag()` so layer URL flags accept only explicit `1` and `0`.
- Updated events, connections, and eras URL parsing to ignore malformed values instead of treating them as false.
- Kept URL normalization behavior: rewriting state emits the effective `1` / `0` values and drops malformed tokens.
- Updated README share behavior and bumped source references to `app.js?v=58`, `styles.css?v=58`, and `print.css?v=58`.

## Malformed Layer Flag URL Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v58` and layer flag parsing routes through `parseBooleanURLFlag()`.
- Local Chrome via CDP: `?events=maybe&connections=maybe&eras=maybe` keeps all three layer checkboxes checked, renders 91 event markers, connection lines, and 8 era backgrounds.
- Local Chrome via CDP: calling `updateURLState()` normalizes malformed layer flags to the effective `events=1&connections=1&eras=1`.
- Local Chrome via CDP: explicit `events=0&connections=0&eras=0` still unchecks all three toggles and removes the visual layers.
- Local Chrome via CDP: mixed `events=1&connections=0&eras=maybe` applies Events on, Connections off, preserves Eras on, and normalizes to `eras=1`.
- Mobile 390x844 with malformed layer flags preserves all layers, document/body width stays 390px, and no console/runtime errors were captured.

## Follow-up Audit
- `renderEventMedallions()` is obsolete after retaining only the global events rail.
- `eventsOverlay`, `connectionsSvg`, and minimap references are empty legacy surfaces.
- `setupEraNavigation()` duplicates the active era navigation logic in `setupSmoothEraNavigation()`.
- Startup `console.log()` calls add production console noise without helping the user experience.
- README is broadly correct, but keyboard/accessibility behavior is now richer than documented.

## Follow-up Fixes
- Removed obsolete event medallion rendering, empty event/connection DOM layers, minimap stubs, duplicate era setup, and production startup logs.
- Removed old `.event-medallion` CSS and stale print selectors for removed UI layers.
- Updated README to document category filters, Chinese year input, keyboard navigation, keyboard-openable details, and mobile timeline behavior.
- Bumped source references to `app.js?v=26`, `styles.css?v=26`, and `print.css?v=26`.

## Follow-up Verification
- `node --check app.js`: passed after cleanup.
- `git diff --check`: passed after cleanup.
- Browser desktop `v26`: 529 blocks, 91 global event markers when events are on, 0 event medallions, no `#eventsOverlay`, `#connectionsSvg`, or `#minimap` nodes.
- Browser event toggle `v26`: clicking Events off leaves 0 global markers and hides the global event rail.
- Browser Chinese mode `v26`: Chinese document title, HTML language, toolbar labels, search placeholder, and year scale render correctly.
- Browser logs filtered to `app.js?v=26`: no log/warn/error entries.
- Browser mobile 390x844 `v26`: document/body width remains 390px and timeline horizontal overflow stays inside `#timelineWrapper`.

## Second Follow-up Fixes
- Added localized event type labels so event tooltips/details show Chinese categories such as `发明与发现`.
- Added a mobile disclosure control for the full toolbar: collapsed mobile header is about 116px tall, and expanded controls remain available when needed.
- Hardened detail panel state with `data-open`, `aria-hidden`, and explicit open styles so event and polity detail panels are visually open before focus moves to the close button.
- Bumped source references to `app.js?v=30`, `styles.css?v=30`, and `print.css?v=30`.

## Second Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- In-app Browser confirmed `v30` resources, Chinese mode, 91 global event markers, mobile collapsed toolbar text `控制`, expanded toolbar text `收起控制`, no horizontal document overflow, and no `app.js?v=30` console warnings/errors.
- In-app Browser CDP produced contradictory computed styles for the open detail panel despite correct DOM state; a fresh local Chrome run was used as the authoritative behavior check.
- Local Chrome with `puppeteer-core`: event detail panel opens visibly (`opacity: 1`, `visibility: visible`), close button receives focus, Chinese facts render correctly, and mobile 390x844 collapsed/expanded toolbar states both keep `bodyWidth`/`docWidth` at 390px with 8 category chips and 8 region toggles.

## Third Follow-up Audit
- Detail panels moved focus to the close button, but closing did not restore focus to the timeline element that opened the panel.
- Open detail panels did not trap `Tab`/`Shift+Tab`, so keyboard focus could leave the dialog while it remained visible.
- The detail panel close button aria label was still English in Chinese mode.

## Third Follow-up Fixes
- Added detail-panel focus memory and restore-on-close for event markers and polity blocks.
- Added a panel-level keyboard handler that closes on `Escape` and cycles `Tab`/`Shift+Tab` through focusable controls inside the open panel.
- Avoided restoring focus to stale links when jumping from a panel's contemporaries list to another polity detail panel.
- Localized the detail close button aria label (`Close detail panel` / `关闭详情面板`).
- Bumped source references to `app.js?v=31`, `styles.css?v=31`, and `print.css?v=31`.

## Third Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Local Chrome with `puppeteer-core`: event detail opens with focus on `#panelClose`, close restores focus to the original event marker, Chinese close label is `关闭详情面板`, Chinese event facts remain correct, polity detail opened by keyboard traps `Shift+Tab`/`Tab` inside the dialog, and `Escape` restores focus to the original polity block.
- Mobile 390x844 `v31`: collapsed toolbar remains about 116px tall, document width stays 390px, and 8 category chips / 8 region toggles remain available.

## Fourth Follow-up Audit
- The compare chooser was visually a panel but not semantically a dialog: no `role=dialog`, `aria-hidden`, `aria-labelledby`, or trigger `aria-expanded`.
- Opening compare left focus on the Compare toolbar button, so `Tab` could move behind the panel instead of through the chooser.
- Applying or closing compare did not consistently express the distinction between panel-expanded state and compare-mode-active state.

## Fourth Follow-up Fixes
- Added dialog semantics to the compare panel and explicit `aria-haspopup`, `aria-expanded`, `aria-pressed`, and `aria-controls` on the Compare button.
- Added compare-panel focus entry, `Tab`/`Shift+Tab` focus containment, Escape close behavior, and focus restoration to the Compare button.
- Kept compare-mode active state separate from chooser open state: `aria-expanded` tracks the panel, `aria-pressed` tracks active comparison.
- Bumped source references to `app.js?v=32`, `styles.css?v=32`, and `print.css?v=32`.

## Fourth Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Local Chrome with `puppeteer-core`: compare panel opens as `role=dialog`, localized title is `选择两个地区进行对比`, focus moves to the first region option, `Shift+Tab` wraps to close, `Tab` wraps back to the first option, and Escape closes with focus restored to Compare.
- Applying two selected regions closes the panel, leaves `aria-expanded=false`, sets `aria-pressed=true`, activates compare mode, and limits visible regions to the selected pair without desktop horizontal overflow.
- Mobile 390x844 `v32`: collapsed header remains about 116px, document width stays 390px, compare panel keeps `role=dialog`, and no `app.js?v=32` console/page errors were captured.

## Fifth Follow-up Audit
- `html2canvas` was loaded on initial page load even though it is only needed when the user exports PNG.
- Export clicked before or without the renderer available went straight to print without trying to load the renderer on demand.
- Share relied on `navigator.clipboard.writeText(...).then(...)` without a rejection path, so permission failures could leave the user without feedback.

## Fifth Follow-up Fixes
- Removed the startup `html2canvas` script tag and added lazy loading from the export action.
- Added renderer-load timeout/error fallback to the print dialog without logging app-level console errors for expected dependency failure.
- Added a resilient share copy helper: try Clipboard API, fall back to a hidden textarea plus `execCommand('copy')`, restore focus, and show a localized failure message if both paths fail.
- Bumped source references to `app.js?v=33`, `styles.css?v=33`, and `print.css?v=33`.

## Fifth Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Local Chrome with `puppeteer-core`: initial page load has zero `html2canvas` script tags; share handles Clipboard API rejection with legacy-copy success (`链接已复制到剪贴板！`) and legacy-copy failure (`无法复制链接`) while restoring focus to Share.
- Export fallback path: with the CDN request blocked, clicking Export appends one `html2canvas` script, calls print fallback, shows `使用打印对话框另存为 PDF`, and records no `app.js?v=33` console/page errors.
- Export success path: with a renderer already available, export targets `#timelineContainer`, produces a dated PNG download, does not call print, and does not insert a duplicate renderer script.
- Mobile 390x844 `v33`: collapsed header remains about 116px, document width stays 390px, and no renderer script is loaded on startup.

## Sixth Follow-up Audit
- Help dialog content was stale: it still referenced old gold medallions instead of the current numbered event rail.
- The help dialog's `aria-labelledby="panelTitle"` pointed to no element because its heading lacked `id="panelTitle"`.
- Help dataset copy said roughly 80 events even though the current data contains 91 events and 54 connections.
- Help tool descriptions did not reflect recent compare-dialog, export fallback, and share-state behavior.

## Sixth Follow-up Fixes
- Added `id="panelTitle"` to the help heading so the shared detail dialog is labelled correctly.
- Updated help copy for keyboard-openable polities/events, numbered event markers, panel focus cycling, compare dialog behavior, export fallback, and share state preservation.
- Made help dataset counts derive from the live data arrays: 529 polities, 91 world events, and 54 historical connections.
- Added dialog relationship metadata to the Help button and bumped source references to `app.js?v=34`, `styles.css?v=34`, and `print.css?v=34`.

## Sixth Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Local Chrome with `puppeteer-core`: Chinese and English help dialogs open with `aria-labelledby="panelTitle"`, focus lands on `#panelClose`, old gold-medallion copy is absent, numbered-event-marker copy is present, export/print fallback and share-state copy are present, and no `app.js?v=34` console/page errors were captured.
- Local Chrome confirmed exact dataset lines: `529 polities · 91 world events · 54 connections` and `529 个政体、91 个世界大事、54 条历史联系`.
- Mobile 390x844 `v34`: collapsed header remains about 116px, document width stays 390px, and category/region controls remain available behind the disclosure.

## Seventh Follow-up Audit
- Dark Mode and Full Page buttons did not expose `aria-pressed`, so assistive technologies could not tell whether each mode was active.
- Entering Full Page hid the header containing the triggering button, but focus was not guaranteed to move to the visible exit control.
- Exit Full Page was visually hidden when inactive but did not expose an `aria-hidden` state.

## Seventh Follow-up Fixes
- Added `aria-pressed` to Dark Mode and Full Page controls and kept it synchronized with visual active state.
- Added localStorage-safe dark-mode initialization and toggle handling.
- Added Full Page focus memory: entering focuses the visible Exit Full Page button after it appears; exiting by click or Escape restores focus to the Full button.
- Added `aria-hidden` and localized aria label management for Exit Full Page.
- Bumped source references to `app.js?v=35`, `styles.css?v=35`, and `print.css?v=35`.

## Seventh Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Local Chrome with `puppeteer-core`: Dark Mode toggles `aria-pressed`, text, active class, and localStorage in Chinese mode; Full Page toggles `aria-pressed`, hides the header, exposes Exit Full Page, moves focus to `#exitFullPage`, and restores focus to `#fullPageBtn` after Escape or exit click.
- Mobile 390x844 `v35`: document width remains 390px, collapsed toolbar remains about 116px, and Dark/Full pressed states initialize as false with Exit Full Page aria-hidden.

## Eighth Follow-up Audit
- Language toggle buttons used only visual `.active` state, not `aria-pressed`, so the current language was not explicit to assistive tech.
- Symbol/abbreviation controls (`+`, `−`, `?`, `1ky`, `300y`, `100y`) relied mostly on visible glyphs or title attributes instead of robust accessible names.
- The legend toggle changes to `×` when expanded but did not expose a stable localized accessible label.

## Eighth Follow-up Fixes
- Added localized `aria-pressed` and accessible labels to the language toggle buttons.
- Added localized accessible names for zoom out, zoom in, zoom slider, zoom presets, Help, and Legend toggle.
- Kept language button `active` class and `aria-pressed` synchronized during URL-state initialization and language switching.
- Bumped source references to `app.js?v=36`, `styles.css?v=36`, and `print.css?v=36`.

## Eighth Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Local Chrome with `puppeteer-core`: English mode reports Language group, English pressed true, Chinese pressed false; Chinese mode reports `语言`, English pressed false, Chinese pressed true.
- Local Chrome confirmed localized accessible labels for zoom buttons, zoom slider, zoom presets, Help, and Legend; expanded Legend shows text `×` but keeps aria label `切换图例`.
- Mobile 390x844 `v36`: document width remains 390px, collapsed toolbar remains about 116px, and localized Help/Zoom labels remain present without `app.js?v=36` console/page errors.

## Ninth Follow-up Audit
- Document-level shortcuts (`/`, arrows, Page Up/Down, Home/End) could still run while a detail/help dialog or compare dialog was open.
- Ctrl/Cmd zoom shortcuts could still change the background timeline while a dialog was open.
- This contradicted the dialog focus model added in earlier passes: focus stayed inside the panel, but global shortcuts could still mutate the page behind it.

## Ninth Follow-up Fixes
- Added a shared `isDialogOpen()` guard for modal state.
- Prevented global timeline navigation and search focus shortcuts from running while detail/help or compare dialogs are open.
- Prevented global Ctrl/Cmd zoom shortcuts from mutating the background timeline while a dialog is open.
- Bumped source references to `app.js?v=37`, `styles.css?v=37`, and `print.css?v=37`.

## Ninth Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Local Chrome with `puppeteer-core`: with Help/detail dialog open, `/` does not focus Search and Ctrl/Cmd+ does not change `0.25 px/yr`; focus remains on `#panelClose`.
- Local Chrome with Compare dialog open: `/` does not focus Search and Ctrl/Cmd+ does not change `0.25 px/yr`; focus remains on the first compare option.
- After dialogs close, `/` focuses Search and Ctrl/Cmd+ changes zoom to `0.50 px/yr`, proving shortcuts still work outside dialogs.
- Mobile 390x844 `v37`: document width remains 390px and no `app.js?v=37` console/page errors were captured.

## Tenth Follow-up Audit
- Mobile pinch zoom rounded fractional zoom values with `Math.round()`, so a normal pinch from `0.25 px/yr` could jump to an integer-like scale instead of a smooth slider-step value.
- Pinch zoom did not write the final zoom state to the URL when the gesture ended.
- HTML loaded Google Fonts that the current CSS did not actually use, adding avoidable external font requests and making the real font stack less deterministic.
- Several headings/block labels used negative letter spacing, which worked against the current compact UI constraints.
- Browser screenshots showed Chinese year labels clipped at the left edge because the year-scale gutter was sized for shorter English labels.

## Tenth Follow-up Fixes
- Added `roundZoomToStep()` so mobile pinch zoom preserves the same `0.05` fractional step as the slider.
- Added pinch-end URL synchronization so the address reflects the final touch zoom state.
- Removed unused Google Fonts preconnect/link tags and switched CSS/SVG connection labels to deterministic system font stacks.
- Removed negative letter spacing from title, dynasty, and panel heading styles.
- Widened the Chinese year-scale gutter on desktop and mobile so labels such as `公元前3000年` remain fully visible.
- Updated source references to `app.js?v=39`, `styles.css?v=39`, and `print.css?v=39`.

## Tenth Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan found no old `v37`/`v38` asset references, Google Fonts links, negative letter spacing, old integer pinch rounding, or stale `Inter` SVG label font usage.
- Local Chrome via direct CDP: desktop loaded `app.js?v=39`, `styles.css?v=39`, and `print.css?v=39`; rendered 529 polity blocks and 91 event markers with no runtime errors or console warnings.
- Local Chrome via CDP: no `fonts.googleapis.com` or `fonts.gstatic.com` requests were made, and the DOM contained no Google font links.
- Simulated pinch gesture changed zoom from `0.25 px/yr` to `0.30 px/yr`, called `preventDefault()` twice, and wrote `zoom=0.3` into the URL.
- Desktop Chinese year labels stayed inside the viewport with minimum left bound about `9px`; mobile 390x844 stayed inside with minimum left bound about `1px`.
- Mobile 390x844 `v39`: document/body width remained 390px, header stayed about 116px tall, and no horizontal page overflow was introduced.

## Eleventh Follow-up Audit
- Data contains one `confederation` polity (`Barangays` / `巴朗盖`), and the legend/style system includes `Confederation`, but the top category filter omitted that category.
- Filtering by this sparse category via URL or click produced one valid result, but the result could sit outside the initial horizontal viewport, making the page look empty despite the stats saying `1`.

## Eleventh Follow-up Fixes
- Added a `Confederation` / `联邦` chip to the category filter, using the existing `cat-dot-confederation` styling and localization pipeline.
- Updated README category-filter documentation to include confederation entities.
- Added `scrollToFirstRenderedBlock()` and wired sparse category filters to move the viewport to the first rendered result on URL restoration and after filter clicks.
- Updated source references to `app.js?v=41`, `styles.css?v=41`, and `print.css?v=41`.

## Eleventh Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v41`, the filter contains `data-category="confederation"`, and the project records current `v41`.
- Local Chrome via CDP: `category=confederation` in a Chinese URL loaded `app.js?v=41`, showed 9 category chips, marked the `联邦` chip pressed, rendered exactly one block (`巴朗盖`), and showed stats `1`.
- Local Chrome via CDP: URL restoration auto-scrolled to the result (`scrollLeft` about `2019`, `scrollY` about `721`), with the block visible in the desktop viewport.
- Local Chrome via CDP: clicking the `联邦` chip from the default view rendered `巴朗盖`, wrote `category=confederation` to the URL, showed `筛选: 联邦`, and scrolled the result into view.
- Mobile 390x844 `v41`: the same filtered result was visible, document/body width remained 390px, and no console/runtime errors were captured.

## Twelfth Follow-up Audit
- Search highlighted matches and updated stats, but did not move the viewport to the first match. For matches far outside the initial horizontal view, this made search feel like a passive filter instead of a locate action.
- Shared URLs with `search=` restored the query and highlight state but could leave the user looking at a different region/year until they manually scrolled.

## Twelfth Follow-up Fixes
- Extended `scrollToFirstRenderedBlock()` with an optional selector so it can target `.dynasty-block.search-match` as well as sparse category results.
- Wired `handleSearch()` to scroll to the first search match after rendering results.
- Wired URL restoration with `search=` to jump to the first restored search match on initial load.
- Updated README search documentation and bumped source references to `app.js?v=42`, `styles.css?v=42`, and `print.css?v=42`.

## Twelfth Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Local Chrome via CDP: `?search=Aztec` loaded `app.js?v=42`, restored the search input value, showed the clear button, rendered one `.search-match`, and positioned `Aztec Empire` in the desktop viewport.
- Local Chrome via CDP: manual input of `Aztec` from the default view wrote `search=Aztec` to the URL, showed stats `1 / 529`, and scrolled the same match into view.
- Mobile 390x844 `v42`: `?search=Aztec` positioned `Aztec Empire` inside the viewport with document/body width still 390px.
- Browser screenshots confirmed the match was visible and non-matching polities were dimmed; no console/runtime errors were captured.

## Thirteenth Follow-up Audit
- Zoom preset buttons had a visual `.active` class only after direct preset clicks.
- URL-restored zoom values such as `?zoom=3` did not mark the matching preset active or `aria-pressed=true`.
- Slider changes and keyboard reset could leave a stale preset active, so the button state could contradict the actual `CONFIG.yearHeight`.

## Thirteenth Follow-up Fixes
- Added `updateZoomPresetState()` to derive preset `.active` and `aria-pressed` state from the current zoom value.
- Called the state sync from `setZoom()`, initial URL-state restoration, static text refresh, and preset setup.
- Removed click-only manual active toggling from `setupZoomPresets()`.
- Added initial `aria-pressed` attributes to preset buttons in HTML and updated README zoom documentation.
- Updated source references to `app.js?v=43`, `styles.css?v=43`, and `print.css?v=43`.

## Thirteenth Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Local Chrome via CDP: default load marks `All` active/pressed with `0.25 px/yr`.
- Local Chrome via CDP: `?zoom=3` marks only `300y` active/pressed with `3.00 px/yr`.
- Local Chrome via CDP: clicking `100y` marks only `100y` active/pressed and writes `zoom=8`.
- Local Chrome via CDP: moving the slider to `0.30` clears all preset active/pressed states because no preset matches.
- Local Chrome via CDP: keyboard reset (`Cmd/Ctrl+0`) returns to `All` active/pressed; no console/runtime errors were captured.

## Fourteenth Follow-up Audit
- The region filter allowed users to turn all eight regions off, but `updateURLState()` encoded active regions as a comma-separated list and then dropped empty strings.
- As a result, the all-regions-off state was reachable in the UI but not shareable: refreshing or sharing that URL restored the default all-regions-on state.
- Manually opened `regions=` URLs were also ambiguous and should be treated as an intentionally empty region set.

## Fourteenth Follow-up Fixes
- Changed URL state encoding so zero active regions writes `regions=none`.
- Updated URL state parsing so both `regions=none` and blank `regions=` restore all region checkboxes as unchecked.
- Updated README share documentation and bumped source references to `app.js?v=44`, `styles.css?v=44`, and `print.css?v=44`.

## Fourteenth Follow-up Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v44` and share documentation mentions empty region selections.
- Local Chrome via CDP: turning all regions off wrote `regions=none`, left all eight region checkboxes unchecked, rendered 0 polity blocks, and reported stats `0` polities / `0` regions.
- Local Chrome via CDP: direct `?regions=none` and legacy blank `?regions=` both restored all regions unchecked.
- Mobile 390x844 `?regions=none`: all regions remained unchecked, no polity blocks rendered, document/body width stayed 390px, and no console/runtime errors were captured.

## URL Search Whitespace Audit
- Runtime search input trimmed user text before updating render state, but URL restoration assigned `search=` directly into `CONFIG.searchQuery`.
- Whitespace-only shared links such as `?search=%20%20` could therefore create a truthy invisible search, dim or filter the timeline, show the clear affordance, and report an empty result state without a real query.
- Restored search links should use the same normalization as typed search: trim surrounding whitespace and treat blank strings as no active search.

## URL Search Whitespace Fix
- Added `normalizeSearchQuery()` and routed both `handleSearch()` and `loadURLState()` through it.
- Whitespace-only `search=` URLs now recover to the default non-search state, while meaningful padded queries still restore as trimmed terms.
- Updated README search behavior and bumped source references to `app.js?v=59`, `styles.css?v=59`, and `print.css?v=59`.

## URL Search Whitespace Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v59`, URL-restored search routes through `normalizeSearchQuery()`, and the old raw `CONFIG.searchQuery = params.get('search')` path is gone.
- Local Chrome via CDP: `?search=%20%20` loads `app.js?v=59`, leaves the search input blank, keeps the clear button hidden, does not add `search-active`, renders 529 blocks, reports stats `529`, and normalizes away `search=` after `updateURLState()`.
- Local Chrome via CDP: `?search=%20Aztec%20` restores the input as `Aztec`, shows the clear button, renders one `.search-match`, reports `1 / 529`, places `Aztec Empire` in the visible desktop viewport, and normalizes the URL to `search=Aztec`.
- Mobile 390x844 `?search=%20%20&lang=cn`: restores a blank search, renders 529 blocks, keeps document/body width at 390px, removes `search=` on URL rewrite, and captures no console/runtime errors.

## Category URL Alias Audit
- Category chips write canonical lowercase category keys to the URL, but URL restoration accepted only exact internal keys.
- Human-edited or translated links such as `category=%20Empire%20` or `category=帝国` failed back to the unfiltered state even though they describe a valid category in the UI.
- Invalid category values should still recover to the default unfiltered view rather than creating an empty or stale category state.

## Category URL Alias Fix
- Added `parseCategoryParam()` so restored category URLs trim surrounding whitespace, accept canonical keys case-insensitively, and accept English or Chinese category labels.
- Category URL normalization still emits canonical internal keys through `updateURLState()`.
- Updated README category-filter behavior and bumped source references to `app.js?v=60`, `styles.css?v=60`, and `print.css?v=60`.

## Category URL Alias Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v60`, category URL parsing routes through `parseCategoryParam()`, and the old exact-key-only assignment path is gone.
- Local Chrome via CDP: `?category=%20Empire%20` loads `app.js?v=60`, restores the Empire chip as active/pressed, renders 118 empire blocks, reports stats `118`, and normalizes to `category=empire`.
- Local Chrome via CDP: `?category=帝国&lang=cn` restores the localized `帝国` chip as active/pressed, renders 118 empire blocks, and normalizes to `category=empire`.
- Local Chrome via CDP: `?category=notAType` restores the All chip as active/pressed, renders 529 blocks, reports stats `529`, and removes `category=` on URL rewrite.
- Mobile 390x844 `?category=联邦&lang=cn`: restores the `联邦` chip, renders the single `巴朗盖` block, normalizes to `category=confederation`, keeps document/body width at 390px, and captures no console/runtime errors.

## Region URL Alias Audit
- Region and Compare URLs still accepted only exact internal region keys, even after category URLs became tolerant of human-readable labels.
- Links such as `regions=East Asia,Europe`, `regions=东亚,欧洲`, or `compare=East Asia,Europe` describe valid visible UI choices but previously failed to restore as intended.
- Unknown-only region lists should still recover to the default all-regions state, while explicit empty-region states such as `regions=none` remain intentional.

## Region URL Alias Fix
- Added `normalizeURLAlias()` and `parseRegionToken()` so region URL tokens can match internal keys, full English names, full Chinese names, compact English labels, and compact Chinese labels.
- Routed both `regions=` and `compare=` parsing through the normalized region list path.
- Kept URL normalization behavior: rewritten state emits canonical internal region keys, and malformed unknown-only region lists still preserve defaults.
- Updated README region/compare behavior and bumped source references to `app.js?v=61`, `styles.css?v=61`, and `print.css?v=61`.

## Region URL Alias Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v61`, `regions=` and `compare=` both route through `parseRegionList()`, and `parseRegionToken()` handles normalized region aliases.
- Local Chrome via CDP: `?regions=East%20Asia,Europe` restores only East Asia and Europe checked, reports 2 active regions, renders 164 blocks, and normalizes to `regions=eastAsia,europe`.
- Local Chrome via CDP: `?regions=E.%20Asia,M.%20East` restores East Asia and Middle East from compact labels and normalizes to `regions=eastAsia,middleEast`.
- Local Chrome via CDP: `?regions=东亚,欧洲&lang=cn` restores East Asia and Europe from Chinese labels and normalizes to `regions=eastAsia,europe`.
- Local Chrome via CDP: padded `?regions=%20None%20` still restores the intentional all-regions-off state, renders 0 blocks, reports 0 active regions, and normalizes to `regions=none`.
- Local Chrome via CDP: `?regions=notARegion` still preserves the default all-regions state, renders 529 blocks, reports 8 active regions, and removes the unknown token on URL rewrite.
- Local Chrome via CDP: `?compare=East%20Asia,Europe` restores Compare mode active/pressed with East Asia and Europe checked, then normalizes both `regions=` and `compare=` to `eastAsia,europe`.
- Mobile 390x844 `?compare=东亚,欧洲&lang=cn`: restores Compare mode from Chinese region names, normalizes to `compare=eastAsia,europe`, keeps document/body width at 390px, and captures no console/runtime errors.

## Language URL Alias Audit
- Language URL restoration still accepted only the internal `cn` key; every other present value fell back to English.
- Common user-facing forms such as `lang=zh-CN`, `lang=zh`, `lang=中文`, or `lang=Chinese` describe the existing Chinese UI mode but previously restored English instead.
- Unknown language values should still recover predictably to the default language and normalize to an internal key on URL rewrite.

## Language URL Alias Fix
- Added `parseLanguageParam()` so restored language URLs match common English and Chinese aliases through the same normalized URL alias path used by region aliases.
- Kept runtime language buttons unchanged; only URL restoration accepts the broader alias set.
- Updated README bilingual behavior and bumped source references to `app.js?v=62`, `styles.css?v=62`, and `print.css?v=62`.

## Language URL Alias Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v62`, language URL parsing routes through `parseLanguageParam()`, and the old exact `params.get('lang') === 'cn'` path is gone.
- Local Chrome via CDP: `?lang=zh-CN` loads `app.js?v=62`, restores Chinese mode with `html lang="zh-CN"`, Chinese title/search/region labels, Chinese button pressed, and normalizes to `lang=cn`.
- Local Chrome via CDP: `?lang=中文` restores the same Chinese mode and normalizes to `lang=cn`.
- Local Chrome via CDP: `?lang=English` restores English mode with English labels and normalizes to `lang=en`.
- Local Chrome via CDP: `?lang=klingon` recovers to default English mode, renders 529 blocks, and normalizes to `lang=en`.
- Mobile 390x844 `?lang=zh`: restores Chinese mode, normalizes to `lang=cn`, keeps document/body width at 390px, and captures no console/runtime errors.

## Dark Mode URL State Audit
- Dark Mode was a core toolbar state and already exposed `aria-pressed`, but it was only persisted through `localStorage`.
- Shared links could not express whether the view was dark or light, and the same link could render differently across devices depending on each browser's saved local preference.
- URL state should take precedence when explicit, while preserving the existing local preference fallback when no valid dark-mode URL flag is present.

## Dark Mode URL State Fix
- Added `CONFIG.darkMode` as an explicit URL-restored mode state.
- Added `dark=1/0` to shared URL state and restored it through the existing strict boolean flag parser.
- Updated Dark Mode initialization so valid URL flags override `localStorage`; missing or malformed flags keep the existing local preference behavior.
- Updated the Dark Mode click handler to rewrite URL state after toggling.
- Updated README share/Dark Mode behavior and bumped source references to `app.js?v=63`, `styles.css?v=63`, and `print.css?v=63`.

## Dark Mode URL State Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v63`, URL state includes `dark=1/0`, and Dark Mode restoration routes through the strict boolean URL parser.
- Local Chrome via CDP: `?dark=1&cache=v63` overrides a saved light preference, loads `app.js?v=63`, enables `.dark-mode`, marks the Dark button pressed, stores `localStorage.darkMode=true`, renders 529 blocks, and normalizes URL state to `dark=1`.
- Local Chrome via CDP: `?dark=0&cache=v63` overrides a saved dark preference, disables `.dark-mode`, clears pressed state, stores `localStorage.darkMode=false`, and normalizes URL state to `dark=0`.
- Local Chrome via CDP: malformed `?dark=maybe&cache=v63` preserves the saved dark preference rather than forcing light mode, then normalizes the active state to `dark=1`.
- Local Chrome via CDP: missing `dark` with saved dark preference preserves local state and writes `dark=1` when URL state is refreshed.
- Local Chrome via CDP: clicking the Dark button from default light mode immediately updates the URL to include `dark=1`, stores the preference, and updates pressed state.
- Mobile 390x844 `?dark=1&lang=cn&cache=v63`: restores Chinese dark mode, keeps document/body width at 390px, and captures no console/runtime errors.

## Category Filter Accessible Name Audit
- Category chips already exposed visual text and `aria-pressed`, but their command meaning depended on the group label plus visible chip text.
- The color dot inside each chip is decorative and should not participate in accessible naming.
- Language changes should update category chip accessible names in the same pass that updates visible category labels.

## Category Filter Accessible Name Fix
- Added localized action-oriented labels for category chips: "Show all categories" for the reset chip and "Filter by category: <name>" for each category.
- Reused the existing category label source so English and Chinese accessible names stay synchronized with visible chip labels.
- Marked category color dots as `aria-hidden` and bumped source references to `app.js?v=64`, `styles.css?v=64`, and `print.css?v=64`.

## Category Filter Accessible Name Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v64` and the category accessible-name audit entry is the only new verification section.
- Headless Chrome via CDP: `?category=Empire&cache=v64` loads `app.js?v=64`, `styles.css?v=64`, and `print.css?v=64`; restores the Empire category; exposes `aria-label` / `title` as `Filter by category: Empire`; keeps the All chip labeled `Show all categories`; marks decorative chip dots `aria-hidden=true`; and renders 118 filtered blocks with no console/runtime errors.
- Headless Chrome via CDP: switching from English to Chinese keeps the active Empire filter and updates chip text and accessible labels to `帝国`, `按类型筛选: 帝国`, and `显示全部类型`.
- Mobile 390x844 `?lang=cn&category=联邦&cache=v64`: restores the Chinese Confederation filter from a Chinese category alias, labels the chip `按类型筛选: 联邦`, keeps document/body width at 390px, renders the filtered result, and captures no console/runtime errors.

## Detail Panel Label Audit
- A DOM accessibility audit found that the hidden `#eventPanel` declared `aria-labelledby="panelTitle"` before any `#panelTitle` element existed.
- The missing label target resolved once detail/help content was opened, but the default and mobile-collapsed DOM still contained an invalid ARIA reference.
- The panel needs a stable label target that exists before dynamic content is injected, while visible panel headings should remain normal content.

## Detail Panel Label Fix
- Added a static visually hidden `#panelTitle` inside the dialog and introduced a reusable `.sr-only` utility.
- Added localized default panel-label text for the hidden, unpopulated dialog state.
- Removed duplicate dynamic `id="panelTitle"` headings from detail, event, and help content, then copied the active visible heading text into the static hidden label when each panel opens.
- Updated README help behavior and bumped source references to `app.js?v=65`, `styles.css?v=65`, and `print.css?v=65`.

## Detail Panel Label Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v65`, only the static hidden `#panelTitle` remains in HTML, and dynamic detail/event/help headings no longer duplicate that id.
- Headless Chrome via CDP: default English load uses `app.js?v=65` and `styles.css?v=65`; hidden `#eventPanel` keeps `aria-labelledby="panelTitle"` with existing hidden label text `Detail panel`; there are no missing `aria-labelledby` targets or duplicate IDs.
- Headless Chrome via CDP: opening Help updates the static hidden label and visible heading to `Keyboard Shortcuts`, opens the dialog with `aria-hidden=false`, and moves focus to `#panelClose`.
- Headless Chrome via CDP: opening a polity detail updates both hidden label and visible heading to the active polity name, keeps focus on `#panelClose`, and leaves no duplicate heading IDs.
- Mobile 390x844 `?lang=cn&cache=v65`: default hidden panel label localizes to `详情面板`, opening Help updates it to `键盘快捷键`, keeps document/body width at 390px, and captures no console/runtime errors.

## Keyboard Preview Parity Audit
- Help and README copy implied that focusing timeline items was useful, but pointer hover was the only way to get the compact preview tooltip.
- Keyboard users could activate focused polities with Enter/Space, and event markers were native buttons, but focus did not reveal the same preview information as pointer hover.
- The help text should distinguish preview on focus from activation by click or Enter/Space.

## Keyboard Preview Parity Fix
- Added focus/blur tooltip parity for polity blocks and numbered world-event markers.
- Added explicit Enter/Space activation for numbered world-event markers so their keyboard behavior matches polity blocks.
- Updated polity tooltip action hints to say click or Enter/Space, not click-only.
- Updated Help and README copy to describe focus-preview and explicit activation behavior, and bumped source references to `app.js?v=66`, `styles.css?v=66`, and `print.css?v=66`.

## Keyboard Preview Parity Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v66`, Help copy describes focus preview plus click/Enter/Space activation, and numbered world-event markers have an explicit keydown path.
- Headless Chrome via CDP: default English load uses `app.js?v=66`, `styles.css?v=66`, and `print.css?v=66`; renders 529 polity blocks and 91 world-event markers with no console/runtime errors.
- Headless Chrome via CDP: focusing a polity block shows the tooltip with the active polity name, dates, and `click or press Enter/Space for details`; pressing Enter opens the matching detail panel and moves focus to `#panelClose`.
- Headless Chrome via CDP: focusing a numbered world-event marker shows its tooltip; pressing Enter opens the matching event detail panel and moves focus to `#panelClose`.
- Headless Chrome via CDP: closing a detail panel restores focus to the triggering polity block, and the new focus-preview tooltip appears as expected.
- Headless Chrome via CDP: English Help contains the new polity and event-marker focus-preview copy.
- Mobile 390x844 `?lang=cn&cache=v66`: Chinese Help contains the new focus-preview copy, keeps document/body width at 390px, and captures no console/runtime errors.

## Event Tooltip Activation Hint Audit
- Polity focus/hover tooltips now told users they could click or press Enter/Space for details.
- Numbered world-event tooltips showed the event description but did not include the same activation hint, even though event markers now support click and Enter/Space.
- Event tooltip copy should match the actual activation contract described in Help.

## Event Tooltip Activation Hint Fix
- Appended the localized click-or-Enter/Space action hint to numbered world-event tooltip metadata while preserving event descriptions.
- Bumped source references to `app.js?v=67`, `styles.css?v=67`, and `print.css?v=67`.

## Event Tooltip Activation Hint Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v67` and both polity/event tooltip paths include localized click-or-Enter/Space activation hints.
- Headless Chrome via CDP: default English load uses `app.js?v=67`, `styles.css?v=67`, and `print.css?v=67`; renders 529 polity blocks and 91 world-event markers with no console/runtime errors.
- Headless Chrome via CDP: focusing a numbered world-event marker shows the event title, date, description, and `click or press Enter/Space for details`; pressing Enter opens the matching event detail panel and moves focus to `#panelClose`.
- Mobile 390x844 `?lang=cn&cache=v67`: focusing a numbered world-event marker shows the localized tooltip with `点击或按 Enter/Space 查看详情`, keeps document/body width at 390px, and captures no console/runtime errors.

## Connection Tooltip Stale Metadata Audit
- The tooltip element is shared by polity blocks, numbered world events, and connection lines.
- Event and polity previews write `tooltip-meta`, but connection previews only updated title, alternate title, date, and type.
- Hovering a connection after an event or polity preview could therefore display stale event descriptions or activation hints under the connection title.

## Connection Tooltip Stale Metadata Fix
- Cleared `tooltip-meta` inside `showConnectionTooltip()` so connection previews fully reset the shared tooltip fields they display.
- Bumped source references to `app.js?v=68`, `styles.css?v=68`, and `print.css?v=68`.

## Connection Tooltip Stale Metadata Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v68` and `showConnectionTooltip()` explicitly clears `tooltip-meta`.
- Initial Headless Chrome/CDP verifier expected 54 rendered connection paths, but the current rendered set is 49; the verifier was corrected to assert that connection paths exist and that tooltip behavior is valid rather than hard-coding an outdated count.
- Headless Chrome via CDP: default English load uses `app.js?v=68`, `styles.css?v=68`, and `print.css?v=68`; renders 529 polity blocks, 91 world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: after focusing a world-event marker to populate event tooltip metadata, dispatching hover on a connection line updates the connection title/date/type and leaves `tooltip-meta` empty.
- Mobile 390x844 `?lang=cn&cache=v68`: keeps document/body width at 390px and captures no console/runtime errors.

## Focus Tooltip Description Audit
- Focus previews are now visible for polity blocks and numbered world-event markers, but the focused control did not expose the shared tooltip through `aria-describedby`.
- Assistive technologies could read the base control name, but not the same preview metadata and activation hint that sighted keyboard users saw in the tooltip.
- The relationship should be temporary because the tooltip is shared across polities, events, and connection previews.

## Focus Tooltip Description Fix
- Added a tooltip-owner manager that appends the shared tooltip id to the focused control's `aria-describedby` during focus-triggered previews.
- Preserved any pre-existing `aria-describedby` tokens and removed only the tooltip token when the preview is no longer current.
- Cleared the temporary relationship for mouse-only previews and connection-line previews so the shared tooltip never describes the wrong focused element.
- Bumped source references to `app.js?v=69`, `styles.css?v=69`, and `print.css?v=69`.

## Focus Tooltip Description Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v69` and the tooltip-owner helpers add/remove only the shared tooltip id.
- Headless Chrome via CDP: default English load uses `app.js?v=69`, `styles.css?v=69`, and `print.css?v=69`; renders 529 polity blocks, 91 world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: focusing a polity block shows its tooltip and adds `aria-describedby="tooltip"` to that block without adding it to event markers.
- Headless Chrome via CDP: moving focus to a world-event marker removes the polity relationship, shows the event tooltip, and adds `aria-describedby="tooltip"` to the marker.
- Headless Chrome via CDP: moving focus away removes the temporary relationship and hides the tooltip.
- Headless Chrome via CDP: hovering a connection line after focusing an event marker clears the event marker's temporary description relationship and keeps connection `tooltip-meta` empty.
- Mobile 390x844 `?lang=cn&cache=v69`: keeps document/body width at 390px and captures no console/runtime errors.

## Tooltip Viewport Clamp Audit
- Connection previews positioned the shared tooltip directly at `clientX + 10` / `clientY + 10`, so a hover near the right or bottom viewport edge could push the preview partially off-screen.
- Event and polity previews had partial viewport guards, but they used duplicated hard-coded dimensions and did not share the same positioning contract.
- Because the tooltip is shared across event, polity, and connection previews, all tooltip entry points should use one viewport-safe positioning helper.

## Tooltip Viewport Clamp Fix
- Added `positionTooltip()` with shared viewport margins and actual tooltip dimensions where available.
- Routed polity, numbered world-event, and connection previews through the shared helper.
- Bumped source references to `app.js?v=70`, `styles.css?v=70`, and `print.css?v=70`.

## Tooltip Viewport Clamp Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v70`, old hard-coded tooltip edge guards are gone, and direct tooltip coordinate writes are centralized in `positionTooltip()`.
- Headless Chrome via CDP: default English load uses `app.js?v=70`, `styles.css?v=70`, and `print.css?v=70`; renders 529 polity blocks, 91 world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: hovering a connection path at the bottom-right desktop viewport edge clamps the tooltip to `left=1228`, `right=1428`, `top=793`, and `bottom=890` inside a 1440x900 viewport while keeping connection `tooltip-meta` empty.
- Headless Chrome via CDP: polity focus still adds `aria-describedby="tooltip"`, event-marker focus transfers the relationship, and connection hover clears the focused marker relationship.
- Mobile 390x844 `?lang=cn&cache=v70`: loads Chinese mode, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, and clamps a bottom-right connection tooltip inside the viewport with no console/runtime errors.

## Mobile Toolbar Focus Order Audit
- A rendered DOM audit found that collapsed mobile toolbar rows used `aria-hidden="true"` while their descendant checkboxes, inputs, and buttons retained their default tab stops.
- The visual collapse uses `display: none`, but the ARIA state should still be paired with deterministic focus-order management so keyboard focus and assistive state cannot diverge.
- The mobile Controls toggle is hidden on desktop and should also leave the sequential focus order outside the mobile breakpoint.

## Mobile Toolbar Focus Order Fix
- Added a shared toolbar focusability helper that stores each toolbar control's original `tabindex`, applies `tabindex="-1"` while the mobile toolbar is collapsed, and restores the original state when reopened or returning to desktop.
- Synchronized the mobile Controls toggle with the active breakpoint by setting `aria-hidden` and `tabindex` from the same mobile query used for toolbar collapse.
- If viewport changes collapse the toolbar while focus is inside it, focus is moved back to the visible mobile Controls toggle.
- Bumped source references to `app.js?v=71`, `styles.css?v=71`, and `print.css?v=71`.

## Mobile Toolbar Focus Order Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Initial Headless Chrome/CDP verification found focus returning to `body` after a programmatic mobile-toolbar collapse; this was fixed by capturing whether focus was inside toolbar rows before toggling the collapsed class.
- Headless Chrome via CDP: desktop 1440x900 loads `app.js?v=71`, `styles.css?v=71`, and `print.css?v=71`; renders 529 polity blocks, 91 world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: desktop keeps toolbar rows exposed with `aria-hidden=false`, restores all 39 toolbar controls to normal tab order, and removes the hidden mobile Controls toggle from the tab order with `tabindex=-1` / `aria-hidden=true`.
- Headless Chrome via CDP: mobile 390x844 Chinese mode keeps the Controls toggle focusable and visible to assistive tech, keeps collapsed rows at `aria-hidden=true`, and sets all 39 toolbar controls to `tabindex=-1` with no leaked tab stops.
- Headless Chrome via CDP: opening mobile Controls restores all 39 toolbar controls to their original tabindex state and updates the localized toggle label to `收起控制`; closing while focus is inside the toolbar restores focus to `#mobileToolbarToggle`.
- Headless Chrome via CDP: widening from mobile to 900px restores toolbar rows to `aria-hidden=false`, clears all temporary toolbar `tabindex=-1` values, removes the mobile Controls toggle from tab order, and keeps document width equal to viewport width.

## Hidden Dialog Focus Order Audit
- The rendered DOM audit also found focusable controls inside hidden dialogs: `#compareClose`, `#compareApply`, and `#panelClose` remained default tab stops under containers with `aria-hidden="true"`.
- CSS visibility usually keeps hidden panels out of practical keyboard navigation, but the ARIA state and focus-order state should be synchronized explicitly.
- The same saved-tabindex pattern used for mobile toolbar rows can be generalized for hidden dialogs so Compare and Detail/Help panels have a consistent open/closed focus contract.

## Hidden Dialog Focus Order Fix
- Added a generic `setContainerFocusability()` helper that preserves each descendant control's original `tabindex`, applies `tabindex="-1"` while a container is hidden, and restores the original state when visible again.
- Reused the helper for mobile toolbar rows and added `setDialogFocusability()` for `#eventPanel` and `#comparePanel`.
- Disabled descendant focus for hidden dialogs at startup, on normal close, and on the global Escape close path; re-enabled descendants immediately before moving focus into an opened dialog.
- Bumped source references to `app.js?v=72`, `styles.css?v=72`, and `print.css?v=72`.

## Hidden Dialog Focus Order Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v72` and dialog focus management routes through `setContainerFocusability()` / `setDialogFocusability()`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=72`, `styles.css?v=72`, and `print.css?v=72`; renders 529 polity blocks, 91 world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: initial hidden `#eventPanel` sets `#panelClose tabindex="-1"`, initial hidden `#comparePanel` sets `#compareClose` and `#compareApply` to `tabindex="-1"`, and no focusable descendants remain under `aria-hidden="true"` dialogs.
- Headless Chrome via CDP: opening Help restores `#panelClose` to its default focusability and moves focus there; closing Help restores focus to `#helpBtn` and returns `#panelClose` to `tabindex="-1"`.
- Headless Chrome via CDP: opening Compare restores the close/apply controls plus 8 region options to normal focusability; closing Compare returns all 10 descendants to `tabindex="-1"` while keeping `aria-expanded=false`.
- Mobile 390x844 `?lang=cn&cache=v72`: keeps the collapsed mobile toolbar focus fix intact, has no hidden-dialog focus leaks, keeps document/body width at 390px, and captures no console/runtime errors.

## Compare Escape Close Path Audit
- Compare already had a local `closeComparePanel()` routine that synchronizes visibility, `aria-hidden`, `aria-expanded`, descendant focusability, and focus restoration.
- The global Escape handler still duplicated part of that close logic by directly mutating `#comparePanel` state.
- That duplicate path was functionally close, but it could diverge from the canonical Compare close behavior, especially for focus restoration when Escape is handled outside the panel's own keydown listener.

## Compare Escape Close Path Fix
- Added a `closeComparePanelHandler` reference that points to the canonical Compare close routine created in `setupCompareMode()`.
- Updated the global Escape fallback to call that handler instead of directly mutating Compare panel DOM state.
- Bumped source references to `app.js?v=73`, `styles.css?v=73`, and `print.css?v=73`.

## Compare Escape Close Path Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v73` and the global Escape handler now calls `closeComparePanelHandler` instead of duplicating Compare DOM mutations.
- Headless Chrome via CDP: default desktop load uses `app.js?v=73`, `styles.css?v=73`, and `print.css?v=73`; renders 529 polity blocks, 91 world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: pressing Escape from a focused Compare option closes the Compare dialog, restores focus to `#compareBtn`, sets `aria-hidden=true`, `data-open=false`, `aria-expanded=false`, and returns all 10 Compare controls to `tabindex="-1"`.
- Headless Chrome via CDP: dispatching the global Escape fallback while Compare is open but focus is outside the panel now uses the same close behavior, restoring focus to `#compareBtn` and disabling all 10 Compare controls.
- Headless Chrome via CDP: Help dialog Escape behavior still restores focus to `#helpBtn` and returns `#panelClose` to `tabindex="-1"`.
- Mobile 390x844 `?lang=cn&cache=v73`: keeps the collapsed toolbar focus fix and hidden-dialog focus fix intact, has no hidden focus leaks, keeps document/body width at 390px, and captures no console/runtime errors.

## Search Clear Focus State Audit
- The search clear button started hidden and became visible only when a search query was active.
- Its visual state used the `hidden` attribute, but it did not explicitly synchronize `tabindex`, unlike the newer toolbar and dialog focus-management paths.
- The clear button should keep the same deterministic contract: hidden means out of sequential focus order, visible means restored to native button focus behavior.

## Search Clear Focus State Fix
- Added initial `tabindex="-1"` to the hidden `#searchClear` button.
- Added `syncSearchClearState()` so URL-restored searches, typed searches, language refreshes, and clearing all synchronize `hidden` with the clear button's `tabindex`.
- Preserved the existing clear-click behavior that returns focus to the search input after clearing.
- Bumped source references to `app.js?v=74`, `styles.css?v=74`, and `print.css?v=74`.

## Search Clear Focus State Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v74`, `#searchClear` starts with `tabindex="-1"`, and search clear visibility routes through `syncSearchClearState()`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=74`, `styles.css?v=74`, and `print.css?v=74`; renders 529 polity blocks, 91 world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: default empty search keeps `#searchClear hidden=true` and `tabindex="-1"`.
- Headless Chrome via CDP: typing `Aztec` keeps focus in `#searchInput`, writes `search=Aztec`, shows one match, and restores `#searchClear` to native button focusability with no explicit `tabindex`.
- Headless Chrome via CDP: clicking Clear removes `search=`, clears matches, returns focus to `#searchInput`, and sets `#searchClear hidden=true` plus `tabindex="-1"`.
- Headless Chrome via CDP: direct `?search=Aztec&cache=v74` restores a visible clear button with no explicit `tabindex` and one active search match.
- Mobile 390x844 `?lang=cn&cache=v74`: keeps `#searchClear hidden=true` / `tabindex="-1"`, preserves the collapsed toolbar focus fix, has no hidden focus leaks, keeps document/body width at 390px, and captures no console/runtime errors.

## Compare Open Language Sync Audit
- `updateStaticText()` updated Compare's header, trigger, close, and apply text when language changed.
- The Compare region option buttons were only labeled when the chooser opened, so an already-open Compare panel could keep stale English region names after switching to Chinese or vice versa.
- The fix should refresh option labels without rebuilding the buttons, because rebuilding would discard in-progress selections that have not yet been applied.

## Compare Open Language Sync Fix
- Added `refreshCompareOptionLabelsHandler`, wired to a local Compare option-label refresh routine in `setupCompareMode()`.
- Called the handler from `updateStaticText()` so already-rendered Compare options relabel on language changes while preserving `selected` classes and `aria-pressed` state.
- Bumped source references to `app.js?v=75`, `styles.css?v=75`, and `print.css?v=75`.

## Compare Open Language Sync Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Initial Headless Chrome/CDP verifier assumed a different Compare option order; assertions were corrected to check options by `data-region` instead of by position.
- Static scan confirmed source references use `v75` and open Compare option relabeling routes through `refreshCompareOptionLabelsHandler`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=75`, `styles.css?v=75`, and `print.css?v=75`; renders 529 polity blocks, 91 world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: opening Compare in English renders region options such as `East Asia`, `Europe`, and `Southeast Asia` with zero disabled tab stops while visible.
- Headless Chrome via CDP: selecting East Asia and Europe, then switching to Chinese relabels those options to `东亚` and `欧洲` while preserving `selected` class and `aria-pressed=true`.
- Headless Chrome via CDP: switching back to English relabels the same open options back to `East Asia` and `Europe` without losing selection state.
- Headless Chrome via CDP: applying the comparison after returning to Chinese writes `compare=eastAsia,europe`, renders 164 filtered blocks, closes the dialog with all 10 controls disabled, restores focus to `#compareBtn`, and shows the Chinese toast `对比: 东亚 ↔ 欧洲`.
- Mobile 390x844 `?lang=cn&cache=v75`: keeps the collapsed toolbar focus fix and hidden focus leak checks intact, keeps document/body width at 390px, and captures no console/runtime errors.

## Open Panel Language Sync Audit
- Detail, world-event, and Help panel bodies were generated only when opened.
- `updateStaticText()` refreshed toolbar controls, dialog chrome, and Compare options, but did not rerender the already-open Detail/Event/Help content.
- This left visible panel headings, facts, action links, and hidden `#panelTitle` labels in the old language after toggling English/Chinese.

## Open Panel Language Sync Fix
- Added an `activePanelContext` record for the currently open Detail, Event, or Help panel.
- Added a shared open-panel refresh path that rerenders the current panel body from the current language without reopening the dialog.
- Preserved recoverable in-panel focus for contemporary jump links and the Wikipedia link when language changes replace panel content.
- Bumped source references to `app.js?v=76`, `styles.css?v=76`, and `print.css?v=76`.

## Open Panel Language Sync Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Initial Headless Chrome/CDP Help verifier opened Help while an Event dialog was still active, which is not a reachable keyboard flow; the verifier was corrected to close the prior dialog and focus `#helpBtn` before opening Help.
- Follow-up CDP connection checks initially queried obsolete `.connection-path` selectors; the verifier was corrected to assert the current `.connection-line path` SVG contract.
- Static scan confirmed source references use `v76` and open-panel refresh routes through `activePanelContext`, `refreshOpenPanelContent()`, and `renderHelpContent()`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=76`, `styles.css?v=76`, and `print.css?v=76`; renders 529 polity blocks, 91 world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: opening Roman Empire in English, focusing its Wikipedia link, switching to Chinese, and switching back to English rerenders panel headings/fact labels/title text and swaps the Wikipedia URL between `zh.wikipedia.org` and `en.wikipedia.org` while preserving focus on `.wiki-link`.
- Headless Chrome via CDP: opening `Cuneiform Invented`, focusing a contemporaries jump link, then switching to Chinese rerenders event title/region/fact labels and preserves the focused `data-jump-id` link.
- Headless Chrome via CDP: opening Help from `#helpBtn`, switching to Chinese, and closing keeps `aria-expanded` synchronized, localizes Help content and close-label text, restores focus to `#helpBtn`, and leaves no focusable descendants under hidden dialogs.
- Mobile 390x844 `?lang=cn&cache=v76`: loads `app.js?v=76`, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, keeps the collapsed toolbar controls out of tab order, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Dialog Trigger Rerender Focus Audit
- Detail and world-event panels restored focus only when `lastPanelTrigger.isConnected` remained true.
- Switching language while a detail/event panel is open rerenders timeline blocks and event markers, replacing the original trigger node.
- Closing the panel after that rerender could therefore skip focus restoration instead of returning keyboard users to the equivalent polity block or event marker.

## Dialog Trigger Rerender Focus Fix
- Added a lightweight panel-trigger descriptor for entity blocks, numbered world-event markers, and ordinary id-based trigger buttons.
- Added stable `data-event-index` attributes to rendered world-event markers so a rerendered marker can be found again.
- Updated panel close restoration to use the still-connected trigger when available, or fall back to the equivalent rerendered trigger from the descriptor.
- Bumped source references to `app.js?v=77`, `styles.css?v=77`, and `print.css?v=77`.

## Dialog Trigger Rerender Focus Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v77`, panel trigger restoration routes through `lastPanelTriggerDescriptor`, and every world-event marker gets a stable `data-event-index`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=77`, `styles.css?v=77`, and `print.css?v=77`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: opening Roman Empire from keyboard, switching to Chinese while the detail dialog is open, and closing the dialog restores focus to the newly rendered `.dynasty-block[data-id="roman_empire"]` after the original trigger node is disconnected.
- Headless Chrome via CDP: opening `Cuneiform Invented` from keyboard, switching to Chinese while the event dialog is open, and closing the dialog restores focus to the newly rendered `.global-event-marker[data-event-index="0"]` after the original marker node is disconnected.
- Headless Chrome via CDP: hidden Detail/Help and Compare dialogs have no focusable descendants after close.
- Mobile 390x844 `?lang=cn&cache=v77`: loads `app.js?v=77`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## In-Panel Jump Focus Audit
- Contemporaries links inside detail/event panels call `hidePanel({ restoreFocus: false })`, scroll to the target year, then open a new detail panel for the clicked entity.
- Because focus remains inside the old panel during that transition, `showPanel()` intentionally does not treat the hidden panel link as an external trigger.
- The new detail panel therefore inherited the older panel trigger descriptor, so closing after an in-panel jump could return keyboard focus to the previous timeline entity instead of the newly viewed entity.

## In-Panel Jump Focus Fix
- Updated the shared `wirePanelJumpLinks()` path to clear the stale trigger node and set `lastPanelTriggerDescriptor` to the jumped-to entity before hiding the old panel.
- The existing rerender-resilient restore path can now focus the newly viewed timeline block when the jumped-to detail panel closes.
- Made the dialog close-button focus delay cancellable and guarded it on the panel still being open, so a quick close cannot move focus back into a hidden panel.
- Bumped source references to `app.js?v=79`, `styles.css?v=79`, and `print.css?v=79`.

## In-Panel Jump Focus Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Initial Headless Chrome/CDP verifier found that the delayed panel-close focus from the newly opened detail panel could still fire after a quick close; `showPanel()` focus is now cancellable and guarded by `data-open`.
- Static scan confirmed source references use `v79`, in-panel jumps set `lastPanelTriggerDescriptor` to the jumped-to entity, and delayed panel focus routes through `panelFocusTimer`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=79`, `styles.css?v=79`, and `print.css?v=79`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: opening Roman Empire from keyboard, following its `Parthian Empire` contemporaries link, and quickly closing the new detail panel restores focus to `.dynasty-block[data-id="parthia"]`, not to the old Roman block or hidden `#panelClose`.
- Headless Chrome via CDP: hidden Detail/Help and Compare dialogs have no focusable descendants after close.
- Mobile 390x844 `?lang=cn&cache=v79`: loads `app.js?v=79`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Compare Quick Close Focus Audit
- Compare opening used a delayed focus to move into the first region option after the panel animation.
- Closing Compare before that timer fired could allow the delayed callback to focus a hidden `.compare-option` after `aria-hidden="true"` and descendant `tabindex="-1"` had already been applied.
- The Detail/Help panel already had a cancellable guarded focus timer; Compare should use the same contract.

## Compare Quick Close Focus Fix
- Added `compareFocusTimer`.
- `closeComparePanel()` now clears any pending Compare focus timer before hiding descendants.
- `openComparePanel()` now clears prior timers and only focuses the first option if `#comparePanel` is still open when the timer fires.
- Bumped source references to `app.js?v=80`, `styles.css?v=80`, and `print.css?v=80`.

## Compare Quick Close Focus Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v80` and Compare delayed focus routes through `compareFocusTimer`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=80`, `styles.css?v=80`, and `print.css?v=80`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: opening Compare then immediately dispatching Escape closes the dialog before the 160ms option-focus delay fires; after 360ms focus remains on `#compareBtn`, `aria-expanded=false`, `aria-hidden=true`, all 10 Compare controls are disabled from sequential focus, and no active element is inside the hidden Compare panel.
- Mobile 390x844 `?lang=cn&cache=v80`: loads `app.js?v=80`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Full Page Quick Exit Focus Audit
- Full Page mode used a delayed focus to move into `#exitFullPage` after the transition.
- Exiting Full Page before that timer fired could allow the delayed callback to focus the visually hidden exit control after `aria-hidden="true"` and `tabindex="-1"` were restored.
- This is the same hidden-focus race fixed for Detail/Help and Compare delayed focus paths.

## Full Page Quick Exit Focus Fix
- Added `fullPageFocusTimer`.
- `toggleFullPage()` now clears any pending Full Page focus timer whenever the mode changes.
- The delayed focus only moves to `#exitFullPage` if `body.full-page-mode` is still active when the timer fires.
- Bumped source references to `app.js?v=81`, `styles.css?v=81`, and `print.css?v=81`.

## Full Page Quick Exit Focus Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v81` and Full Page delayed focus routes through `fullPageFocusTimer`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=81`, `styles.css?v=81`, and `print.css?v=81`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: clicking Full and immediately dispatching Escape exits before the 220ms exit-button focus delay fires; after 420ms focus remains on `#fullPageBtn`, `body.full-page-mode=false`, `aria-pressed=false`, and `#exitFullPage` is `aria-hidden=true` / `tabindex="-1"`.
- Mobile 390x844 `?lang=cn&cache=v81`: loads `app.js?v=81`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, keeps inactive `#exitFullPage` hidden from focus, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Toast Timer Supersession Audit
- `showToast()` created a new hide timeout for each message but did not cancel any earlier timeout.
- Rapid sequential feedback could let an older timeout remove `.visible` from a newer toast before the newer toast's own duration elapsed.
- This could make command feedback appear flaky when users quickly jump, filter, share, or toggle modes.

## Toast Timer Supersession Fix
- Added `toastTimer`.
- `showToast()` now clears any pending hide timer before writing the next message.
- The active hide timer clears itself after removing `.visible`, so only the newest toast controls its own lifetime.
- Bumped source references to `app.js?v=82`, `styles.css?v=82`, and `print.css?v=82`.

## Toast Timer Supersession Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v82`, source files no longer reference old `v80` / `v81` cache versions, and `showToast()` routes hide scheduling through `toastTimer`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=82`, `styles.css?v=82`, and `print.css?v=82`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: firing `showToast('first', 180)`, then `showToast('second', 600)` after 80ms keeps the second toast visible after the first toast's old 180ms deadline, then hides it after its own duration.
- Mobile 390x844 `?lang=cn&cache=v82`: loads `app.js?v=82`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, keeps inactive `#exitFullPage` hidden from focus, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Search Debounce Clear Audit
- Search input events used a 300ms debounce stored as a local timer inside `init()`.
- `clearSearch()` could not cancel that local timer, so typing a query and immediately pressing Escape could clear the field first, then reapply the stale typed query when the old debounce fired.
- This could desynchronize the search input, URL state, match highlighting, and clear-button visibility from the user's most recent action.

## Search Debounce Clear Fix
- Added `searchDebounceTimer`.
- Added `queueSearch()` and `clearPendingSearchDebounce()` so every queued search is cancellable.
- `clearSearch()` now cancels any pending debounce before clearing the input and applying the empty search state.
- Bumped source references to `app.js?v=83`, `styles.css?v=83`, and `print.css?v=83`.

## Search Debounce Clear Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v83`, source files no longer reference old `v81` / `v82` cache versions, and search debounce scheduling routes through `searchDebounceTimer`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=83`, `styles.css?v=83`, and `print.css?v=83`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: typing `rome`, dispatching Escape after 80ms, then waiting beyond the old 300ms debounce leaves the input empty, `CONFIG.searchQuery` empty, the clear button hidden with `tabindex="-1"`, zero `.search-match` blocks, and no `search=` parameter in the URL.
- Mobile 390x844 `?lang=cn&cache=v83`: loads `app.js?v=83`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, keeps inactive `#exitFullPage` hidden from focus, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Double-Click Interactive Target Audit
- Background double-click zoom only ignored `.dynasty-block` targets.
- Numbered world-event markers are native buttons inside the timeline container; double-clicking one can open the event detail and then bubble a `dblclick` to the timeline container, also changing zoom.
- Background zoom should only be triggered from blank timeline space, not from event buttons, connection previews, links, buttons, or focusable timeline controls.

## Double-Click Interactive Target Fix
- Added `isInteractiveTimelineTarget()` to centralize the timeline controls that should be excluded from background double-click zoom.
- `setupDoubleClickZoom()` now returns early for dynasty blocks, global event markers, connection SVGs, links, buttons, form controls, role-button controls, and explicit tabindex elements.
- Bumped source references to `app.js?v=84`, `styles.css?v=84`, and `print.css?v=84`.

## Double-Click Interactive Target Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v84`, source files no longer reference old `v82` / `v83` cache versions, and double-click filtering routes through `isInteractiveTimelineTarget()`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=84`, `styles.css?v=84`, and `print.css?v=84`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: double-clicking the first numbered world-event marker opens the event detail panel with focus on `#panelClose`, but leaves zoom at `0.25` and does not add a new zoom URL state.
- Headless Chrome via CDP: double-clicking blank timeline grid space still changes zoom from `0.25` to `0.5`, updates the slider/value text, and writes `zoom=0.5` into the URL.
- Mobile 390x844 `?lang=cn&cache=v84`: loads `app.js?v=84`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, keeps inactive `#exitFullPage` hidden from focus, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Language Switch Stats Audit
- `renderTimeline()` updates the stats chip with the current visible entity count and search match count.
- `switchLanguage()` called `renderTimeline()` and then called `updateStatsChip()` again without counts.
- With a category filter active, that second parameterless call could overwrite the correct filtered polity count with `undefined` after a language switch.

## Language Switch Stats Fix
- Removed the redundant parameterless `updateStatsChip()` call from `switchLanguage()`.
- The language switch now keeps the stats value produced by the timeline render, including category-filtered counts.
- Bumped source references to `app.js?v=85`, `styles.css?v=85`, and `print.css?v=85`.

## Language Switch Stats Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v85`, source files no longer reference old `v83` / `v84` cache versions, and `switchLanguage()` no longer calls `updateStatsChip()` without counts.
- Headless Chrome via CDP: default desktop load uses `app.js?v=85`, `styles.css?v=85`, and `print.css?v=85`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: applying the Empire category filter renders 118 blocks and shows `118` in the stats chip; switching to Chinese keeps the same active category, localizes the chip label to `帝国`, keeps the URL at `category=empire`, and keeps the stats chip at `118` instead of `undefined`.
- Mobile 390x844 `?lang=cn&cache=v85`: loads `app.js?v=85`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, keeps inactive `#exitFullPage` hidden from focus, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Compare Trigger Toggle Audit
- The Compare trigger exposes `aria-expanded` and controls the compare dialog.
- When compare mode was not active, clicking Compare always re-rendered and opened the chooser, even if the chooser was already open.
- A trigger with `aria-expanded=true` should be able to collapse its controlled chooser without requiring users to move to the close button or press Escape.

## Compare Trigger Toggle Fix
- Preserved the existing active-compare behavior: when `CONFIG.compareMode` is true, clicking Compare still exits comparison and restores all regions.
- Added a chooser-open branch so clicking Compare while `#comparePanel` is open closes the chooser through the canonical close routine.
- Bumped source references to `app.js?v=86`, `styles.css?v=86`, and `print.css?v=86`.

## Compare Trigger Toggle Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v86`, source files no longer reference old `v84` / `v85` cache versions, and Compare trigger clicks now branch on `#comparePanel.dataset.open`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=86`, `styles.css?v=86`, and `print.css?v=86`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: clicking Compare opens the chooser with `aria-expanded=true`, `aria-pressed=false`, and focus on a compare option; clicking Compare again closes the chooser through the canonical close routine, restores focus to `#compareBtn`, sets `aria-expanded=false`, keeps `aria-pressed=false`, hides the panel, and leaves zero focusable descendants inside the hidden chooser.
- Headless Chrome via CDP: after applying East Asia ↔ Europe comparison, clicking Compare still exits compare mode, restores all eight region checkboxes, renders 529 blocks, removes `compare=` from the URL, and shows the Compare-off toast.
- Mobile 390x844 `?lang=cn&cache=v86`: loads `app.js?v=86`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, keeps inactive `#exitFullPage` hidden from focus, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Compare Modal Backdrop Audit
- `#comparePanel` declares `aria-modal="true"` and traps keyboard focus while open.
- Unlike the Detail/Help modal, the Compare chooser had no backdrop, so pointer users could still click toolbar controls behind the modal panel.
- A modal chooser should intercept background pointer interaction and route outside clicks through the same canonical close routine that restores ARIA state, descendant focusability, and focus.

## Compare Modal Backdrop Fix
- Added a lazily created `.compare-backdrop` behind the Compare panel and above header/legend/stats controls.
- Opening Compare shows the backdrop before focusing the first option.
- Closing Compare through any existing path hides the backdrop through `closeComparePanel()`.
- Clicking the Compare backdrop closes the chooser through the canonical close routine.
- Bumped source references to `app.js?v=87`, `styles.css?v=87`, and `print.css?v=87`.

## Compare Modal Backdrop Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v87`, source files no longer reference old `v85` / `v86` cache versions, and Compare backdrop lifecycle routes through `.compare-backdrop`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=87`, `styles.css?v=87`, and `print.css?v=87`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: opening Compare makes `.compare-backdrop` visible; `document.elementFromPoint()` at the East Asia checkbox coordinates returns the backdrop, not the checkbox.
- Headless Chrome via CDP: clicking that backdrop closes the chooser through the canonical close routine, restores focus to `#compareBtn`, hides the panel and backdrop, leaves zero focusable descendants in the hidden chooser, and keeps all eight region checkboxes unchanged.
- Mobile 390x844 `?lang=cn&cache=v87`: loads `app.js?v=87`, keeps document/body width at 390px, renders 529 blocks / 91 indexed markers / 49 connection paths, keeps collapsed toolbar controls out of tab order, keeps inactive `#exitFullPage` hidden from focus, has no hidden-dialog focus leaks, and captures no console/runtime errors.

## Layer Tooltip Cleanup Audit
- Shared tooltip state is owned outside individual timeline nodes, while event markers and connection paths are destroyed or hidden during layer toggles and rerenders.
- `toggleEvents()` and `toggleConnections()` are the next likely residual-state risk because they can remove the currently hovered or focused preview target without a normal `mouseleave` / `blur` cleanup event.

## Layer Tooltip Cleanup Fix
- Added `clearActiveTimelinePreview()` and call it at the start of `renderTimeline()` before replacing timeline nodes.
- The shared cleanup hides the tooltip and clears any temporary `aria-describedby="tooltip"` owner, covering Events, Links, region filters, language switches, search, category filters, zoom, and other timeline rerenders through the same path.
- Bumped source references to `app.js?v=88`, `styles.css?v=88`, and `print.css?v=88`.

## Layer Tooltip Cleanup Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v88`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=88`, `styles.css?v=88`, and `print.css?v=88`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no page errors.
- Headless Chrome via CDP: focusing a world-event marker shows the shared tooltip and adds `aria-describedby="tooltip"`; programmatically toggling Events off removes all event markers, hides the tooltip, clears the removed marker's temporary description, and leaves no document tooltip description owners.
- Headless Chrome via CDP: hovering a connection path shows its tooltip; programmatically toggling Links off removes all connection paths, hides the tooltip, and writes `connections=0`.
- Mobile 390x844 `?lang=cn&cache=v88`: loads `v88` assets, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## Panel Open Tooltip Cleanup Audit
- Timeline tooltip previews can be active from pointer hover or keyboard focus immediately before a detail/event modal opens.
- `showPanel()` captured and restored trigger focus, but it did not explicitly clear the shared tooltip before showing the panel backdrop and moving focus into the dialog.
- A modal detail/help panel should not leave background preview UI or temporary `aria-describedby="tooltip"` relationships alive behind the dialog.

## Panel Open Tooltip Cleanup Fix
- Added `clearActiveTimelinePreview()` to `showPanel()` immediately after preserving the trigger descriptor and before exposing the modal panel.
- This keeps detail, event, and Help panel opening paths from carrying stale timeline tooltip UI or temporary tooltip ownership into the modal state.
- Added an explicit `showPanel()` trigger option and pass the Help button from the Help click handler so Help focus restoration does not depend on programmatic or browser-specific click focus behavior.
- Bumped source references to `app.js?v=90`, `styles.css?v=90`, and `print.css?v=90`.

## Panel Open Tooltip Cleanup Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v90`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=90`, `styles.css?v=90`, and `print.css?v=90`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no page errors or horizontal overflow.
- Headless Chrome via CDP: focusing a world-event marker shows the shared tooltip and `aria-describedby="tooltip"`; pressing Enter opens the event modal, hides the tooltip, clears the marker description owner, focuses `#panelClose`, and closing restores focus to the marker.
- Headless Chrome via CDP: focusing a polity block shows the shared tooltip and `aria-describedby="tooltip"`; pressing Enter opens the detail modal, hides the tooltip, clears the block description owner, focuses `#panelClose`, and closing restores focus to the block.
- Headless Chrome via CDP: programmatic Help clicks now open the Help modal with focus on `#panelClose`, and closing restores focus to `#helpBtn` with `aria-expanded=false`.
- Mobile 390x844 `?lang=cn&cache=v90`: loads `v90` assets, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## Compare Open Tooltip Cleanup Audit
- Compare is also a modal dialog, but its open path still used `document.activeElement` as the close-restore target and did not explicitly clear active timeline tooltip previews.
- If a timeline marker or polity block is focused with a preview and Compare is opened programmatically or by a browser path that does not focus the button first, the chooser can inherit stale preview state and restore focus to the wrong timeline item.

## Compare Open Tooltip Cleanup Fix
- Added an explicit trigger option to `openComparePanel()` and pass `#compareBtn` from the Compare button handler.
- Compare opening now clears active timeline previews before showing its modal backdrop and chooser, matching the detail/event/help dialog contract.
- Bumped source references to `app.js?v=91`, `styles.css?v=91`, and `print.css?v=91`.

## Compare Open Tooltip Cleanup Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v91`.
- Initial CDP verifier used obsolete `.region-checkbox` selectors for checked regions; re-run used the current `.region-toggle input:checked` DOM contract.
- Headless Chrome via CDP: default desktop load uses `app.js?v=91`, `styles.css?v=91`, and `print.css?v=91`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no page errors or horizontal overflow.
- Headless Chrome via CDP: focusing a world-event marker shows the shared tooltip and `aria-describedby="tooltip"`; clicking Compare opens the chooser, hides the tooltip, clears the marker description owner, focuses the first compare option, and closing restores focus to `#compareBtn`.
- Headless Chrome via CDP: applying East Asia ↔ Europe comparison closes the chooser, sets Compare pressed/active state, checks only those two region filters, renders 164 blocks and 15 connection paths, and writes `compare=eastAsia,europe`.
- Mobile 390x844 `?lang=cn&cache=v91`: loads `v91` assets, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## Contemporary Highlight Cleanup Audit
- Contemporaneous highlighting is another temporary timeline preview state, but it was only removed on `mouseout`.
- Opening Detail/Event/Help or Compare while a block is highlighted can leave `.contemporary-highlight` classes visible behind the modal backdrop.
- Because `clearActiveTimelinePreview()` now owns tooltip cleanup for rerenders and modal openings, it should also own temporary highlight cleanup.

## Contemporary Highlight Cleanup Fix
- Added `clearContemporaryHighlights()` and call it from `clearActiveTimelinePreview()`.
- New block hover previews clear any previous `.contemporary-highlight` classes before applying the next overlap set.
- Existing mouseout cleanup now reuses the same helper.
- Bumped source references to `app.js?v=92`, `styles.css?v=92`, and `print.css?v=92`.

## Contemporary Highlight Cleanup Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v92`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=92`, `styles.css?v=92`, and `print.css?v=92`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no page errors or horizontal overflow.
- Headless Chrome via CDP: hovering South Korea creates 63 `.contemporary-highlight` blocks; opening Compare clears them before the chooser is active, and closing Compare leaves zero highlights while restoring focus to `#compareBtn`.
- Headless Chrome via CDP: hovering South Korea creates 63 `.contemporary-highlight` blocks; opening the detail panel clears them before focus lands on `#panelClose`, and closing restores focus to the original block with zero highlights.
- Mobile 390x844 `?lang=cn&cache=v92`: loads `v92` assets, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, starts with zero highlights, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## Global Escape Preview Cleanup Audit
- The global Escape fallback still called `hideTooltip()` directly after active preview cleanup began owning both tooltip state and contemporaneous highlight state.
- Pressing Escape outside a modal could hide the tooltip but leave `.contemporary-highlight` classes alive until the next mouseout or rerender.
- Keyboard dismissal should use the same preview cleanup path as timeline rerenders and modal openings.

## Global Escape Preview Cleanup Fix
- Replaced the global Escape fallback's direct `hideTooltip()` call with `clearActiveTimelinePreview()`.
- Escape now clears tooltip visibility, temporary `aria-describedby="tooltip"` ownership, and contemporaneous highlight classes together.
- Bumped source references to `app.js?v=93`, `styles.css?v=93`, and `print.css?v=93`.

## Global Escape Preview Cleanup Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Initial CDP verifier in Node REPL failed because that runtime did not expose `WebSocket`; re-run through the system `node` binary with native WebSocket support.
- Headless Chrome via CDP: default desktop load uses `app.js?v=93`, `styles.css?v=93`, and `print.css?v=93`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no page errors or horizontal overflow.
- Headless Chrome via CDP: hovering South Korea creates 63 `.contemporary-highlight` blocks; focusing a world-event marker shows the tooltip and one `aria-describedby="tooltip"` owner; pressing Escape clears all highlights, hides the tooltip, and leaves zero tooltip owners.
- Headless Chrome via CDP: opening Compare then pressing Escape closes the chooser, restores focus to `#compareBtn`, resets `aria-expanded=false`, and leaves zero focusable descendants inside the hidden chooser.
- Mobile 390x844 `?lang=cn&cache=v93`: loads `v93` assets, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, starts with zero highlights, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## Contemporary Highlight Internal-Move Audit
- Contemporaneous highlighting used delegated `mouseover` / `mouseout` listeners without checking `relatedTarget`.
- Moving the pointer between a block's own child elements can fire `mouseout` while the pointer is still inside the same `.dynasty-block`, which clears highlights unnecessarily.
- The hover preview should only clear when leaving the source block or switching to a different timeline block.

## Contemporary Highlight Internal-Move Fix
- Added `contemporaryHighlightSource` to track the block that owns the active highlight preview.
- Added `applyContemporaryHighlights()` so applying a new source validates dates, clears stale classes once, and avoids recomputing when the source has not changed.
- Updated delegated `mouseover` / `mouseout` handling to ignore internal same-block transitions via `relatedTarget`.
- Bumped source references to `app.js?v=94`, `styles.css?v=94`, and `print.css?v=94`.

## Contemporary Highlight Internal-Move Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v94` and the highlight flow routes through `contemporaryHighlightSource` / `applyContemporaryHighlights()`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=94`, `styles.css?v=94`, and `print.css?v=94`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no page errors or horizontal overflow.
- Headless Chrome via CDP: hovering South Korea creates 63 `.contemporary-highlight` blocks; synthetic `mouseout` / `mouseover` transitions between South Korea child elements keep the count at 63 instead of clearing; leaving the next block clears highlights to 0.
- Mobile 390x844 `?lang=cn&cache=v94`: loads `v94` assets, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, starts with zero highlights, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## Keyboard Contemporary Highlight Audit
- The quality bar already requires keyboard focus on timeline blocks to provide the same preview affordance as pointer hover.
- Polity block focus showed the shared tooltip and temporary `aria-describedby="tooltip"`, but contemporaneous highlights were still pointer-only.
- Keyboard users should get the same contemporaneous context when tabbing through polity blocks, and that context should clear on blur just like tooltip ownership.

## Keyboard Contemporary Highlight Fix
- Added `handleBlockFocus()` so focusing a polity block shows its tooltip and applies contemporaneous highlights through the same `applyContemporaryHighlights()` helper used by pointer hover.
- Added `handleBlockBlur()` so leaving a polity block hides its tooltip and clears contemporaneous highlights together.
- Bumped source references to `app.js?v=95`, `styles.css?v=95`, and `print.css?v=95`.

## Keyboard Contemporary Highlight Focus-Transfer Audit
- Initial CDP regression confirmed focusing South Korea now creates 63 contemporaneous highlights, shows the tooltip, and sets `aria-describedby="tooltip"`.
- Moving focus from that block to a world-event marker still left the 63 contemporaneous highlights active, even though tooltip ownership moved to the marker.
- The test also checked detail-panel focus before the existing 250ms delayed focus timer had fired; the rerun should wait past that delay.

## Keyboard Contemporary Highlight Focus-Transfer Fix
- Added a `focusin` fallback in `setupContemporaryHighlight()` that clears active contemporaneous highlights when focus enters anything outside `.dynasty-block`.
- This keeps keyboard highlight state synchronized when focus moves to event markers, toolbar controls, or dialogs, regardless of browser focus/blur ordering.
- Bumped source references to `app.js?v=96`, `styles.css?v=96`, and `print.css?v=96`.

## Non-Polity Preview Highlight Cleanup Fix
- The `v96` rerun showed the `focusin` fallback was not enough for the synthetic world-event marker focus path; South Korea's 63 highlights still remained while the marker owned the tooltip.
- Added explicit `clearContemporaryHighlights()` calls to `showEventTooltip()` and `showConnectionTooltip()`, so non-polity timeline previews clear polity contemporaneous context before displaying their own tooltip.
- Bumped source references to `app.js?v=97`, `styles.css?v=97`, and `print.css?v=97`.

## Keyboard Contemporary Highlight Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v97` and non-polity tooltip entry points clear contemporaneous highlights.
- Headless Chrome via CDP: default desktop load uses `app.js?v=97`, `styles.css?v=97`, and `print.css?v=97`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no page errors or horizontal overflow.
- Headless Chrome via CDP: focusing South Korea creates 63 `.contemporary-highlight` blocks, shows the tooltip, and assigns `aria-describedby="tooltip"` to the block.
- Headless Chrome via CDP: moving focus from South Korea to a world-event marker clears highlights to 0, moves tooltip ownership to the marker, and keeps the old block without `aria-describedby`.
- Headless Chrome via CDP: showing a connection preview after block focus clears highlights to 0 and leaves zero tooltip description owners, matching pointer-only connection preview behavior.
- Headless Chrome via CDP: pressing Enter from focused South Korea opens the detail panel, lands focus on `#panelClose` after the 250ms focus delay, clears highlights to 0, hides the background tooltip, and leaves zero tooltip owners.
- Mobile 390x844 `?lang=cn&cache=v97`: loads `v97` assets, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, starts with zero highlights, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## Full Page Preview Cleanup Audit
- Full Page mode hides surrounding controls and moves focus to the Exit control, but its enter path did not explicitly clear the active timeline preview first.
- If a polity block was focused or hovered immediately before Full Page entry, the shared tooltip and contemporaneous highlights could be visible during the mode transition.
- Help content also still described contemporaries as hover-only, even after keyboard focus gained the same highlight behavior.

## Full Page Preview Cleanup Fix
- Added `clearActiveTimelinePreview()` when entering Full Page mode before the exit-control focus timer starts.
- Updated Help copy in English and Chinese to state that hovering or focusing a polity highlights contemporaries.
- Bumped source references to `app.js?v=98`, `styles.css?v=98`, and `print.css?v=98`.

## Full Page Preview Cleanup Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v98`, Full Page entry calls `clearActiveTimelinePreview()`, and Help copy says hover or focus highlights contemporaries.
- Headless Chrome via CDP: default desktop load uses `app.js?v=98`, `styles.css?v=98`, and `print.css?v=98`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no page errors or horizontal overflow.
- Headless Chrome via CDP: focusing South Korea creates 63 contemporaneous highlights, visible tooltip, and one tooltip owner; clicking Full immediately clears highlights to 0, hides the tooltip, and leaves zero tooltip owners while entering Full Page mode.
- Headless Chrome via CDP: after the Full Page focus delay, focus lands on `#exitFullPage`; pressing Escape exits Full Page, restores focus to `#fullPageBtn`, and returns `#exitFullPage` to `aria-hidden=true` / `tabindex="-1"`.
- Headless Chrome via CDP: English and Chinese Help text both mention focus-based contemporaries highlighting.
- Mobile 390x844 `?lang=cn&cache=v98`: loads `v98` assets, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, starts with zero highlights, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## README Interaction Copy Audit
- Help copy was updated for focus-based contemporaries highlighting, but README still only described focus previews generically.
- README keyboard shortcuts also still said `Enter` / `Space` opens only focused polity details, even though numbered world-event markers are keyboard-activatable too.
- The Full Page control description did not mention that active timeline previews clear when entering the mode.

## README Interaction Copy Fix
- Updated README's interactive feature summary to say hover or focus on a polity previews it and highlights contemporaries, while numbered events also have focus previews.
- Updated Full Page documentation to mention active preview cleanup, visible exit-control focus, and return focus.
- Updated keyboard shortcuts to include world-event detail activation and dialog focus movement across detail, event, Help, and Compare dialogs.

## README Interaction Copy Verification
- `git diff --check`: passed.
- Static scan confirmed README now mentions hover/focus contemporaries highlighting, world-event detail activation, Full Page active-preview cleanup, and focus movement across detail, event, Help, and Compare dialogs.
- Static scan found no remaining README text saying only focused polity details open or implying contemporaries highlighting is hover-only.

## Focused Block Pointer-Exit Highlight Audit
- `hideTooltip()` intentionally keeps the tooltip visible when a pointer leaves a block that still has keyboard focus.
- The document-level contemporaneous `mouseout` handler did not have the same focus guard, so pointer exit from a focused block could clear contemporaneous highlights while the focus tooltip remained active.
- That leaves the keyboard preview inconsistent: the focused block still owns the tooltip, but no longer shows its contemporaries.

## Focused Block Pointer-Exit Highlight Fix
- Added a focus guard to the contemporaneous `mouseout` handler so it does not clear highlights when the source block is still `document.activeElement`.
- Blur, Escape, modal opening, Full Page entry, non-polity previews, and rerenders still clear highlights through their existing cleanup paths.
- Bumped source references to `app.js?v=99`, `styles.css?v=99`, and `print.css?v=99`.

## Focused Block Pointer-Exit Highlight Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v99` and the contemporaneous `mouseout` handler guards on `document.activeElement === block`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=99`, `styles.css?v=99`, and `print.css?v=99`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no page errors or horizontal overflow.
- Headless Chrome via CDP: focusing South Korea creates 63 highlights, visible tooltip, and one tooltip owner; dispatching pointer exit while South Korea remains focused keeps 63 highlights and preserves tooltip ownership.
- Headless Chrome via CDP: blurring the focused block then clears highlights to 0, hides the tooltip, and removes the tooltip owner.
- Headless Chrome via CDP: pure pointer hover still clears highlights to 0 on pointer exit when no block owns keyboard focus.
- Mobile 390x844 `?lang=cn&cache=v99`: loads `v99` assets, keeps document/body width at 390px, renders 529 blocks / 91 markers / 49 connection paths, starts with zero highlights, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.
- Cleanup after context compaction: previous verification session handles were unavailable, but `lsof` confirmed no listeners on 8765 or 9231 and curl to the local server exited 7.

## Share View-Year Audit
- Share URLs currently preserve zoom, language, filters, category, dark mode, compare mode, and layer state.
- They do not preserve the vertical time position, so a copied "current view" can reopen at the top of the 5000-year timeline even when the user was centered on a much later era.
- Existing helpers already compute the year at a viewport point and scroll to a year, so the smallest robust fix is to serialize a clamped center-year parameter and restore it after the timeline has rendered.

## Share View-Year Fix
- Added `CONFIG.viewYear`, `clampYearValue()`, `timelineFocusClientY()`, and `currentViewYear()` so URL state can include a bounded `year=` value derived from the same visual focus line used by `scrollToYear()`.
- `loadURLState()` now accepts `year=` and the initial render restores it before falling back to search/category auto-positioning.
- `updateURLState()` serializes `year=` and accepts explicit target-year overrides for search, category, jump-to-year, era buttons, and double-click zoom paths where the intended destination is known before smooth scrolling completes.
- Added `scrollWindowToTop()` so `smooth=false` programmatic year restoration is genuinely instant even though the document has global CSS smooth scrolling.
- Updated Help and README Share copy to mention center-year preservation.
- Bumped source references to `app.js?v=100`, `styles.css?v=100`, and `print.css?v=100`.

## Share View-Year Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v100`, `year=` parsing is present, and view-year writes route through `updateURLState({ viewYear: ... })` where target years are known.
- Headless Chrome via CDP: default desktop load uses `app.js?v=100`, `styles.css?v=100`, and `print.css?v=100`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no horizontal document overflow.
- Headless Chrome via CDP: `scrollToYear(1066, false)` followed by URL serialization writes the actual center year (`1068` at fit-all scale, a pixel-rounding difference) and makes `currentViewYear()` match it.
- Headless Chrome via CDP: loading `?year=1492&zoom=1&cache=v100` restores `currentViewYear()` to 1492.
- Headless Chrome via CDP: typing search `Ming` writes `search=Ming` and `year=1414`, matching the first rendered search-result midpoint.
- Headless Chrome via CDP: choosing category `confederation` writes `category=confederation` and `year=1233`, matching the single rendered category-result midpoint.
- Headless Chrome via CDP: clicking Share after a year scroll writes the actual current center year (`1781` in the filtered zoomed view) and shows copy feedback.
- Mobile 390x844 `?lang=cn&year=1644&zoom=1&cache=v100`: loads Chinese v100 assets, renders 529 blocks / 91 markers / 49 connection paths, restores `currentViewYear()` to 1644, keeps document/body width at 390px, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## Share Horizontal View Audit
- The timeline's horizontal position lives only on `#timelineWrapper.scrollLeft`.
- Share URLs now preserve vertical center year, but they still do not preserve horizontal position across the region columns.
- This means a shared view centered on later regions such as Europe, Africa, or the Americas can reopen at the left edge of the timeline even though the vertical year and filters restore correctly.
- A normalized `x=` scroll ratio is more robust than a raw pixel offset because the available horizontal scroll width changes across desktop/mobile viewports, language gutters, and filtered region sets.

## Share Horizontal View Fix
- Added `CONFIG.viewX` plus horizontal scroll-ratio helpers so URL state can serialize and restore `#timelineWrapper` position as a normalized `x=` value.
- `loadURLState()` now accepts `x=`, and initial render restores that ratio after vertical year/search/category positioning.
- `updateURLState()` now includes `x=` when the current horizontal ratio is greater than zero; omitted `x` remains equivalent to the left edge.
- Search and category auto-positioning now return both target year and target `x` ratio, so shared URLs describe the destination rather than the pre-animation horizontal position.
- Updated Help and README Share copy to mention horizontal-position preservation.
- Bumped source references to `app.js?v=101`, `styles.css?v=101`, and `print.css?v=101`.

## Share Horizontal View Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v101`, `x=` parsing is present, and horizontal target writes route through `updateURLState({ viewX: ... })`.
- Headless Chrome via CDP: default desktop load uses `app.js?v=101`, `styles.css?v=101`, and `print.css?v=101`; renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no horizontal document overflow.
- Headless Chrome via CDP: setting horizontal ratio to about `0.62` and serializing URL writes `x=0.6198`; loading `?year=1492&x=0.62&zoom=1&cache=v101` restores `currentViewX()` to about `0.62` and restores the center year to 1492.
- Headless Chrome via CDP: search `Ming` writes the first result target year 1414 and omits `x` because the target horizontal ratio is 0, which is equivalent to the left edge.
- Headless Chrome via CDP: category `confederation` writes target year 1233 and `x=1`, matching the single rendered result at the far right of the filtered layout.
- Headless Chrome via CDP: clicking Share writes the actual current horizontal ratio (`x=0.8054` in the filtered layout), the actual current center year, and copy feedback.
- Mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1&cache=v101`: loads Chinese v101 assets, restores `currentViewYear()` to 1644 and `currentViewX()` to about `0.55`, keeps document/body width at 390px, keeps collapsed toolbar controls and hidden dialogs out of tab order, keeps inactive `#exitFullPage` hidden from focus, and captures no console/runtime errors.

## Zoom Anchor Consistency Audit
- `currentViewYear()` and `scrollToYear()` use `timelineFocusClientY()`, which accounts for the sticky header and centers the year in the visible timeline area.
- `setZoom()` still captured its anchor from raw `window.innerHeight / 2`, so zooming preserved a different vertical line than the one written to `year=` and used by restored shared links.
- All zoom entry points (buttons, slider, presets, keyboard shortcuts, pinch, and background double-click) route through `setZoom()`, so aligning this one anchor keeps zoom behavior consistent across controls.

## Zoom Anchor Consistency Fix
- Changed `setZoom()` to capture its anchor with `yearAtViewportY(timelineFocusClientY())`, matching `currentViewYear()` and `scrollToYear()`.
- Bumped source references to `app.js?v=102`, `styles.css?v=102`, and `print.css?v=102`.

## Zoom Anchor Consistency Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v102` and `setZoom()` now anchors on `timelineFocusClientY()`.
- Headless Chrome via CDP: desktop `?year=1492&x=0.62&zoom=1&cache=v102` loads v102 assets, renders 529 blocks / 91 markers / 49 connection paths, restores `currentViewYear()` to 1492 and `currentViewX()` to about 0.62, and has no horizontal document overflow.
- Headless Chrome via CDP: the raw viewport midpoint year was 1401 while the timeline visual focus year was 1492, proving the old and new anchor lines differ materially under the sticky header.
- Headless Chrome via CDP: zoom-in button changes zoom from 1 to 1.5 while preserving `currentViewYear()` at 1492 and keeping URL `year=1492`.
- Headless Chrome via CDP: zoom slider changes zoom to 3 while preserving `currentViewYear()` at 1066 and keeping URL `year=1066`.
- Headless Chrome via CDP: keyboard zoom-out changes zoom from 3 to 2.5 while preserving `currentViewYear()` at 800 and keeping URL `year=800`.
- Mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1&cache=v102`: loads Chinese v102 assets, zoom-in preserves `currentViewYear()` at 1644 and `currentViewX()` around 0.55, keeps document/body width at 390px, keeps hidden controls out of tab order, and captures no console/runtime errors.

## Explicit Horizontal URL Priority Audit
- Initial restoration has two independent positioning inputs: explicit shared view state (`year=` / `x=`) and search/category auto-positioning.
- `x=` was parsed into `CONFIG.viewX`, but when a shared URL also had `search=` or `category=` and no explicit `year=`, `scrollToFirstRenderedBlock()` overwrote `CONFIG.viewX` before `restoreHorizontalView()` ran.
- That made valid explicit horizontal view state lose to a convenience auto-positioning fallback, even though explicit URL state should be the higher-priority user intent.

## Explicit Horizontal URL Priority Fix
- Added URL-provided view-state flags so initialization can distinguish a valid explicit `year=` / `x=` from runtime-derived `CONFIG.viewYear` / `CONFIG.viewX`.
- `loadURLState()` now marks those flags only for finite, clamped values; malformed `year=` or `x=` values remain ignored.
- Initial restoration now snapshots explicit `x=`, runs the appropriate vertical restoration or search/category fallback, then reapplies explicit `x=` before restoring the horizontal scroll ratio.
- Bumped source references to `app.js?v=103`, `styles.css?v=103`, and `print.css?v=103`.

## Explicit Horizontal URL Priority Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v103`, URL view-state flags are present, and no trailing whitespace was introduced.
- Headless Chrome via CDP: default desktop load uses v103 assets, renders 529 blocks / 91 markers / 49 connection paths, has no document-level horizontal overflow, and captures no console/runtime errors.
- Headless Chrome via CDP: `?search=Ming&x=0.62&zoom=1` restores two search matches, vertical focus year 1414, and `currentViewX()` about 0.6198, proving explicit `x=` survives search auto-positioning.
- Headless Chrome via CDP: `?search=Ming&zoom=1` without `x=` still auto-positions horizontally to the left-edge first match with `currentViewX()` at 0.
- Headless Chrome via CDP: `?category=confederation&x=0.2&zoom=1` restores the category filter, vertical focus year 1233, and `currentViewX()` about 0.1998, proving explicit `x=` survives category auto-positioning.
- Headless Chrome via CDP: `?category=confederation&zoom=1` without `x=` still auto-positions to the far-right category result with `currentViewX()` at 1.
- Headless Chrome via CDP: `?category=confederation&x=not-a-number&zoom=1` ignores malformed `x=` and falls back to the category target at `currentViewX()` 1.
- Mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1&cache=v103`: loads Chinese v103 assets, restores year 1644 and `currentViewX()` about 0.5502, zoom-in preserves both values, keeps document/body width at 390px, keeps hidden controls out of tab order, and captures no console/runtime errors.

## Keyboard Navigation URL Sync Audit
- Keyboard shortcuts are documented as first-class navigation controls, but the Arrow, PageUp/PageDown, Home, and End branches only changed scroll position.
- Share clicks still computed the current view before copying, but the visible address bar could remain stale after keyboard navigation until another state-changing control was used.
- Because the app now treats `year=` and `x=` as durable view state, keyboard navigation should write those values after the scroll settles.

## Keyboard Navigation URL Sync Fix
- Added a debounced view-state URL sync scheduler that listens for a one-shot `scrollend` event and falls back to a timeout when `scrollend` is unavailable or no scroll event fires.
- Wired ArrowUp/Down, PageUp/PageDown, Home, and End to update URL state after vertical smooth scrolling settles.
- Wired ArrowLeft/Right to update URL state after horizontal wrapper scrolling settles, with a shorter fallback because those scroll changes are immediate.
- Continuous repeated key presses cancel older pending syncs so only the last settled keyboard navigation writes the address bar.
- Bumped source references to `app.js?v=104`, `styles.css?v=104`, and `print.css?v=104`.

## Keyboard Navigation URL Sync Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v104`, the keyboard sync scheduler is present, and no trailing whitespace was introduced.
- Headless Chrome via CDP: desktop `?year=1492&x=0.62&zoom=1&cache=v104` loads v104 assets, renders 529 blocks / 91 markers / 49 connection paths, restores year 1492 and `currentViewX()` about 0.6198, has no document-level horizontal overflow, and captures no console/runtime errors.
- Headless Chrome via CDP: pressing ArrowDown updates the URL to `year=1592&x=0.6198`, matching `currentViewYear()` and `currentViewX()` after scrolling settles.
- Headless Chrome via CDP: pressing ArrowRight twice updates the URL to `x=0.7244`, matching the final `currentViewX()` and proving repeated key presses collapse to the last settled state.
- Headless Chrome via CDP: pressing PageDown updates the URL to `year=1838&x=0.7244`, matching the final vertical and horizontal view state.
- Mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1&cache=v104`: loads Chinese v104 assets, restores year 1644 and `currentViewX()` about 0.5502, keeps document/body width at 390px, keeps hidden controls out of tab order, and captures no console/runtime errors.

## Resize View-State Preservation Audit
- Share links restore `year=` and `x=` across different viewport widths, but an already-open page did not preserve those view anchors when the viewport changed.
- Reproduction in Headless Chrome: desktop `?year=1492&x=0.62&zoom=1&cache=v104` restored `currentViewYear()` 1492 and `currentViewX()` about 0.6198; resizing the same page to 390px changed `currentViewX()` to about 0.4033 and `currentViewYear()` to about -2662.
- The root cause is that the browser preserves raw pixel scroll offsets during resize, while the timeline's horizontal max scroll and sticky/header geometry change. No resize path restored the logical view state after layout settled.

## Resize View-State Preservation Fix
- Added view-state memory that tracks the current center year and horizontal ratio during normal window and timeline-wrapper scrolling.
- Added a resize restoration path that freezes the last stable view state at the start of a resize, waits briefly for layout to settle, then restores the center year and horizontal ratio.
- Resize restoration uses the same `scrollToYear()` and `setTimelineHorizontalRatio()` geometry as normal navigation, but suppresses the explicit jump beacon so orientation changes do not look like user-triggered year jumps.
- `updateURLState()` now refreshes the remembered view state from the same clamped values it writes to the URL.
- Updated README responsive behavior and bumped source references to `app.js?v=105`, `styles.css?v=105`, and `print.css?v=105`.

## Resize View-State Preservation Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed source references use `v105`, resize view-state restoration is present, and no trailing whitespace was introduced.
- Headless Chrome via CDP: desktop `?year=1492&x=0.62&zoom=1&cache=v105` loads v105 assets, renders 529 blocks / 91 markers / 49 connection paths, restores year 1492 and `currentViewX()` about 0.6198, has no document-level horizontal overflow, and captures no console/runtime errors.
- Headless Chrome via CDP: resizing that same page to 390x844 preserves `currentViewYear()` 1492 and `currentViewX()` about 0.6198, updates URL state to `year=1492&x=0.6198`, keeps document/body width at 390px, keeps hidden controls out of tab order, and creates no resize-related year beacon.
- Headless Chrome via CDP: resizing back to 1440x900 preserves year 1492 and `currentViewX()` about 0.6198 with no document-level horizontal overflow.
- Headless Chrome via CDP: a manually positioned view at year 1000 and `x` about 0.35 survives desktop-to-mobile resize, updates URL state to `year=1000&x=0.3499`, keeps hidden controls out of tab order, and creates no resize-related year beacon.

## In-Panel Entity Jump Audit
- Detail panels expose contemporaries/related entities as in-panel jump links.
- Those links only called `scrollToYear()` before opening the target detail, so cross-region targets could open while the background timeline remained horizontally centered on the previous region.
- The same path also skipped URL synchronization, leaving visible `year=` / `x=` state behind the actual target after the jump.

## In-Panel Entity Jump Fix
- Added shared entity/block positioning helpers so search/category and in-panel jumps use the same horizontal centering math.
- Added `scrollToEntity()` to center a rendered target block horizontally, scroll to the entity midpoint vertically, and return the target `year` / `x` values.
- Updated in-panel entity jumps to call `scrollToEntity()` and immediately synchronize URL state before opening the target detail panel.
- Bumped source references to `app.js?v=106`, `styles.css?v=106`, and `print.css?v=106`.

## In-Panel Entity Jump Verification
- `node --check app.js`: passed before browser regression.
- `git diff --check`: passed before browser regression.
- Static scan confirmed current source references use `v106` and stale source `v105` references remain only in historical planning notes.
- Headless Chrome via CDP: desktop `?year=1414&x=0&zoom=1&cache=v106` loads v106 assets, renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no document-level horizontal overflow.
- Headless Chrome via CDP: opened the Ming detail panel, scrolled the offscreen in-panel jump list enough to expose the selected Ayutthaya link, and activated it with a mouse click.
- Headless Chrome via CDP: the jump opened Ayutthaya detail, wrote `year=1559&x=1` to the URL, restored `currentViewYear()` to 1559, and moved `currentViewX()` to about 0.9984, matching the target block's right-edge-clamped horizontal destination.
- Headless Chrome via CDP: pressing Escape closed the target detail panel and restored focus to the Ayutthaya timeline block.
- Mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1&cache=v106`: loads Chinese v106 assets, restores year 1644 and `currentViewX()` about 0.5502, keeps document/body width at 390px, keeps hidden controls out of tab order, and captures no console/runtime errors.

## Manual Scroll URL Sync Audit
- Keyboard navigation already synchronizes `year=` / `x=` after scroll settles, but pointer, wheel, touchpad, or scrollbar navigation only refreshes in-memory `CONFIG.viewYear` / `CONFIG.viewX`.
- Headless Chrome via CDP reproduced the gap on v106: loading `?year=1492&x=0.62&zoom=1`, then manually scrolling the page and timeline wrapper to actual `currentViewYear()` 1838 and `currentViewX()` 1, left the address bar at stale `year=1492&x=0.62`.
- This weakens the current-view URL contract because the visible address bar can lag behind the actual timeline view until another explicit control or Share click runs `updateURLState()`.

## Manual Scroll URL Sync Fix
- Routed normal window and timeline-wrapper scroll events through the existing scroll-settled URL sync scheduler after refreshing in-memory view state.
- Delayed activation of manual scroll URL syncing until initial URL restoration has completed, so search/category restoration scrolls do not rewrite the incoming link during page load.
- Updated README Share copy to state that horizontal timeline position stays current after manual scrolling.
- Bumped source references to `app.js?v=107`, `styles.css?v=107`, and `print.css?v=107`.

## Manual Scroll URL Sync Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v107`, while `v106` references remain only in historical planning notes.
- Headless Chrome via CDP: desktop `?year=1492&x=0.62&zoom=1&cache=v107` loads v107 assets, renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: manual vertical and horizontal scrolling changed the actual view to `currentViewYear()` 1838 and `currentViewX()` 1, then the address bar updated to matching `year=1838&x=1` after scrolling settled.
- Headless Chrome via CDP: initial `?search=Ming&zoom=1&cache=v107-search` restored two search matches and centered the first result, but did not rewrite the incoming URL with `year=` or `x=` during initial restoration.
- Mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1&cache=v107`: loads Chinese v107 assets, restores year 1644 and `currentViewX()` about 0.5502, keeps document/body width at 390px, keeps hidden controls out of tab order, and captures no console/runtime errors.
- Mobile 390x844 after manual vertical and horizontal scrolling updates the URL to the actual view (`year=1885&x=0.6579`) while preserving 390px document/body width.

## Language Switch View-State Audit
- Language switching changes `body.lang-cn`, widening the year-scale gutter and timeline wrapper margin; it can also slightly change header height.
- Headless Chrome via CDP on v107: loading `?year=1492&x=0.62&zoom=1`, then switching to Chinese changed the actual view to `currentViewYear()` 1489 and `currentViewX()` about 0.6096 because raw `scrollY` / `scrollLeft` were preserved across the layout change.
- Display-layer toggles did not introduce additional drift in the same run, but language switching wrote the drifted `year=1489&x=0.6096` values into the URL.

## Language Switch View-State Fix
- `switchLanguage()` now snapshots the current `year=` / `x=` view state before changing language and rerendering timeline content.
- After the language-specific layout is applied, it restores the same center year and horizontal scroll ratio using `scrollToYear()` and `setTimelineHorizontalRatio()`, suppressing the jump beacon.
- Updated README bilingual behavior copy and bumped source references to `app.js?v=108`, `styles.css?v=108`, and `print.css?v=108`.

## Language Switch View-State Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v108`, while `v107` references remain only in historical planning notes.
- Headless Chrome via CDP: desktop `?year=1492&x=0.62&zoom=1&cache=v108` loads v108 assets, renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths.
- Headless Chrome via CDP: switching from English to Chinese preserves `currentViewYear()` at 1492 and `currentViewX()` at about 0.6199, then writes matching `year=1492&x=0.6199` to the URL despite the gutter/header layout change.
- Headless Chrome via CDP: Events and Connections toggles after the language switch preserve the same `year=` / `x=` view state while correctly reducing markers/paths to 0.
- Mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1&cache=v108`: loads Chinese v108 assets, restores year 1644 and `currentViewX()` about 0.5502, keeps document/body width at 390px, keeps hidden controls out of tab order, and captures no console/runtime errors.
- Mobile 390x844 switching from Chinese to English preserves year 1644 and `currentViewX()` about 0.55 with no document/body overflow.

## Region Filter View-State Audit
- Region filtering changes the horizontal column layout by removing entire region groups, so preserving raw `scrollLeft` can convert the same pixel offset into a very different normalized `x=` ratio.
- Headless Chrome via CDP on v108: loading `?year=1492&x=0.62&zoom=1`, then turning off East Asia left the raw `scrollLeft` at 1185 while max scroll shrank from 1912 to 1520, changing actual `currentViewX()` from about 0.6198 to 0.7796 and writing `x=0.7796`.
- Turning off Americas after that clamped the raw horizontal scroll to the new max and changed `currentViewX()` to 1, even though the user had not intentionally jumped to the far-right edge.

## Region Filter View-State Fix
- Added shared current-view capture and restore helpers for layout-changing rerender paths.
- Updated `toggleRegion()` to preserve the current center year and horizontal ratio across region-column layout changes before the region-filter URL state is written.
- Kept language switching on the same shared helper so future view-state behavior stays consistent.
- Updated README region-filter copy and bumped source references to `app.js?v=109`, `styles.css?v=109`, and `print.css?v=109`.

## Region Filter View-State Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v109`, while `v108` references remain only in historical planning notes.
- Headless Chrome via CDP: desktop `?year=1492&x=0.62&zoom=1&cache=v109` loads v109 assets, renders 529 polity blocks, 91 indexed world-event markers, and 49 connection paths with no console/runtime errors.
- Headless Chrome via CDP: turning off East Asia reduces rendered blocks to 446 and connection paths to 24 while preserving `currentViewYear()` 1492 and `currentViewX()` about 0.6197, then writes matching `year=1492&x=0.6197` to the URL.
- Headless Chrome via CDP: turning off Americas after East Asia reduces rendered blocks to 405 and connection paths to 22 while preserving `currentViewYear()` 1492 and `currentViewX()` about 0.6197 instead of clamping to `x=1`.
- Headless Chrome via CDP: switching to Chinese after those region changes preserves the same view state, proving the shared restore helper still covers language layout changes.
- Mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1&cache=v109`: loads Chinese v109 assets, restores year 1644 and `currentViewX()` about 0.5502, keeps document/body width at 390px, keeps hidden controls out of tab order, and captures no console/runtime errors.
- Mobile 390x844 turning off East Asia reduces rendered blocks to 446 and connection paths to 24 while preserving year 1644 and `currentViewX()` about 0.55 with no document/body overflow.

## Mobile Controls View-State Audit
- Mobile Controls expansion changes `.toolbar-rows` from `display:none` to `display:block`, increasing the header height and shifting the timeline's visual focus line.
- Headless Chrome via CDP on v109: mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1` starts with header height about 116px and `currentViewYear()` 1644.
- Opening Controls increases header height to about 384px, moves actual `currentViewYear()` to 1778, and writes stale-drifted `year=1778&x=0.5502` to the URL even though the user only expanded controls.
- Closing Controls returns the header height and year to 1644, but the open-state drift is visible and shareable while the panel is open.

## Mobile Controls View-State Fix
- Mobile Controls clicks now capture the current view state before toggling `mobile-controls-open`.
- After focusability/ARIA state is synchronized, the click path restores the preserved center year and horizontal ratio, then writes the preserved view state back to the URL.
- Updated README responsive behavior copy and bumped source references to `app.js?v=110`, `styles.css?v=110`, and `print.css?v=110`.

## Mobile Controls View-State Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v110`, while `v109` references remain only in historical planning notes.
- Initial CDP verifier over-constrained programmatic-click focus, then a mouse-event attempt did not activate the mobile button under emulation; the final verifier used explicit focus plus DOM click to exercise the app click path while separately validating focusability and hidden-state invariants.
- Headless Chrome via CDP: mobile 390x844 `?lang=cn&year=1644&x=0.55&zoom=1&cache=v110` loads Chinese v110 assets, renders 529 polity blocks, 91 event markers, and 49 connection paths.
- Headless Chrome via CDP: opening Controls grows the header to about 384px but preserves `currentViewYear()` 1644 and `currentViewX()` about 0.5502, leaves no hidden focusable controls, and writes matching `year=1644&x=0.5502` to the URL.
- Headless Chrome via CDP: closing Controls restores the collapsed header height while preserving `currentViewYear()` 1644 and `currentViewX()` about 0.5502, keeps focus on the Controls button, and keeps document/body width at 390px.
- Headless Chrome via CDP: desktop `?year=1492&x=0.62&zoom=1&cache=v110` keeps the mobile Controls button out of tab order, exposes toolbar rows to assistive tech, restores year 1492 and `currentViewX()` about 0.6198, and captures no console/runtime errors.

## Full Page View-State Audit
- Full Page hides `.chronicle-header`, `.legend`, footer, and ornaments, while `timelineFocusClientY()` switches from a header-aware visual focus line to a near-top full-page focus line.
- Headless Chrome via CDP on v110: desktop `?year=1492&x=0.62&zoom=1` restored `currentViewYear()` 1492 and `currentViewX()` about 0.6198 before entry.
- Clicking Full Page changed the actual visual center to `currentViewYear()` 1575 while leaving the URL at stale `year=1492&x=0.62`; `x` stayed stable because the horizontal layout width did not change.
- Exiting Full Page returned the visual center to 1492, but the active Full Page state was still shareable with stale URL state while open.

## Full Page View-State Fix
- `toggleFullPage()` now captures the current center year and horizontal ratio before toggling `body.full-page-mode`.
- After Full Page ARIA, pressed state, hidden state, and exit-control focusability are synchronized, the same logical view is restored with the shared view-state helper.
- The timeline now has global bottom scroll padding equal to the focus line's lower viewport space, so late years near AD 2000 can reach the visual focus line in both normal and Full Page modes.
- The Full Page toggle path now writes the preserved `year=` / `x=` values back to the URL, matching the behavior of language, region, resize, mobile controls, and other layout-changing paths.
- Updated Help and README Full Page copy and bumped source references to `app.js?v=113`, `styles.css?v=113`, and `print.css?v=113`.

## Full Page View-State Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v113`, while `v112` and `v111` references remain only in historical planning notes.
- Headless Chrome via CDP: desktop `?year=1492&x=0.62&zoom=1&cache=v113` loads v113 assets, renders 529 polity blocks, 91 event markers, and 49 connection paths.
- Headless Chrome via CDP: entering Full Page preserves `currentViewYear()` 1492 and `currentViewX()` about 0.6198, moves focus to `#exitFullPage`, exposes it with `tabindex=0`, and writes matching `year=1492&x=0.6198` to the URL.
- Headless Chrome via CDP: exiting Full Page with Escape restores normal mode, returns focus to `#fullPageBtn`, hides `#exitFullPage` with `tabindex=-1`, and keeps year/x unchanged.
- Headless Chrome via CDP: scrolling while in Full Page changes the actual view to year 1812, and clicking Exit preserves year 1812 / `x=0.6198` after normal header restoration.
- Headless Chrome via CDP: desktop `?year=1900&x=0.62&zoom=1&cache=v113` now restores to actual `currentViewYear()` 1900 in normal mode and preserves 1900 when entering Full Page.
- Headless Chrome via CDP: mobile 390x844 Chinese `?year=1644&x=0.55&zoom=1&cache=v113` restores year 1644 / `x=0.5502`, opens Controls without drift, enters Full Page with 414px timeline bottom padding and no drift, exits back to the Full button, keeps document/body width at 390px, and leaves no hidden focusable controls.
- No console warnings, runtime exceptions, or baseline count regressions were captured in the v113 browser run.

## Top Boundary View-State Audit
- v113 added enough bottom scroll range for late years, but the top boundary still had no equivalent space above the first timeline year.
- Headless Chrome via CDP on v113: desktop `?year=-3000&x=0.62&zoom=1` loaded v113 assets but actual `currentViewYear()` was -2660 because `scrollToYear(-3000)` clamped to `scrollY=0`.
- Headless Chrome via CDP on v113: desktop `?year=-2500&x=0.62&zoom=1` restored correctly because that year had enough distance from the top boundary.
- Headless Chrome via CDP on v113: clicking the Bronze era button wrote `year=-3000` to the URL, but the actual view stayed at -2660, so the visible URL and visual focus line disagreed.

## Top Boundary View-State Fix
- Added a shared `--timeline-edge-pad` CSS variable and applied it to both the top and bottom of `.timeline-container`, so first and last timeline years can both reach the visual focus line.
- Shifted `.year-scale` down by the same edge padding so its labels remain aligned with the timeline grid.
- Added `timelineContentOffsetTop()` and updated `yearAtViewportY()` / `scrollToYear()` to compute years from the padded timeline content origin rather than the outer container edge.
- Added a default-load positioning helper so pages without explicit `year=`, `search=`, or `category=` skip the top edge padding and do not open on an empty-looking viewport.
- Bumped source references to `app.js?v=115`, `styles.css?v=115`, and `print.css?v=115`.

## Top Boundary View-State Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v115`, the shared `--timeline-edge-pad` is present, and year geometry routes through `timelineContentOffsetTop()`.
- Headless Chrome via CDP: default desktop load with no explicit `year=`, `search=`, or `category=` loads v115 assets, renders 529 blocks / 91 markers / 49 connection paths, keeps the URL free of an auto-added `year=`, and places the first visible year mark around 211px instead of the earlier empty-looking 637px position.
- Headless Chrome via CDP: desktop `?year=-3000&x=0.62&zoom=1&cache=v115` restores actual `currentViewYear()` -3000 and `currentViewX()` about 0.6198.
- Headless Chrome via CDP: clicking the Bronze era button now writes `year=-3000` and leaves actual `currentViewYear()` at -3000 instead of -2660.
- Headless Chrome via CDP: desktop `?year=1900&x=0.62&zoom=1&cache=v115` still restores actual `currentViewYear()` 1900, proving the v113 bottom-boundary fix survived the top-boundary change.
- Headless Chrome via CDP: desktop Full Page entry/exit preserves year 1492 / `x=0.6198`, moves focus to `#exitFullPage`, and restores focus to `#fullPageBtn` on Escape.
- Headless Chrome via CDP: mobile 390x844 Chinese `?year=-3000&x=0.55&zoom=1&cache=v115` restores -3000 / `x=0.5502`, opening Controls and then Full Page preserves the same view, document/body width remains 390px, and no hidden focusable controls leak.
- No console warnings, runtime exceptions, or baseline count regressions were captured in the v115 browser run.

## Mobile Default Viewport Audit
- Screenshot evidence on v115 showed the desktop default viewport remained usable after edge padding, but mobile Chinese default loading auto-scrolled past the title/search/Controls header and opened directly inside the timeline.
- On 390x844 mobile Chinese v115, the default page had `scrollY` about 398, header bottom at -282px, first year mark around 161px, and the header context was no longer visible.
- Manually returning that same mobile page to the top showed the title/search/Controls context and still kept the first year mark visible in the viewport, so the default auto-scroll was harming orientation more than it helped on mobile.
- Added `shouldAutoScrollDefaultTimelineStart()` so default-load timeline-start auto-scroll only runs when the header remains sticky/fixed, preserving mobile header context while keeping the desktop first viewport compact.
- Reduced mobile `--timeline-edge-pad` to `calc((100vh - 170px) / 2)`, which trims the mobile default blank gap while still giving explicit `year=-3000` links enough top scroll range to reach the focus line.
- Bumped source references to `app.js?v=117`, `styles.css?v=117`, and `print.css?v=117`.

## Mobile Default Viewport Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed current source references use `v117`, and the default auto-scroll guard is present.
- Headless Chrome via CDP: desktop default v117 still loads 529 blocks / 91 markers / 49 connection paths, keeps the sticky header visible, has no horizontal overflow, and places the first year mark around 211px.
- Headless Chrome via CDP: mobile 390x844 Chinese default v117 keeps `scrollY=0`, header bottom around 116px, title/search/Controls context visible, reduced edge padding around 337px, first year mark around 482px, 529/91/49 counts, no horizontal overflow, and no hidden focusable controls.
- Headless Chrome via CDP: mobile 390x667 Chinese default v117 keeps header context visible, reduced edge padding around 249px, and the first year mark around 393px.
- Headless Chrome via CDP: explicit mobile top-boundary links still restore `year=-3000` and `x≈0.55` at both 390x844 and 390x667; mobile late-boundary `year=1900` also restores correctly.
- Desktop search `?search=Ming&x=0.62` and sparse category `?category=confederation` auto-positioning still work after the mobile padding change.

## Updated Goal: Data and Territory Semantics
- The next optimization line should treat historical data richness as a first-class quality bar, not only UI mechanics.
- The current shape model appears to render every polity as rectangular blocks positioned by region, column, start, end, and category; this is too coarse for cases where a polity contracts, fragments, or partially overlaps another polity.
- Hittite Empire and Egyptian Empire are a useful audit case because any visual overlap needs to distinguish "coexisting in neighboring territories" from "territorial loss, vassalage, or conquest"; plain rectangle overlap can be misleading if users read width/overlap as territorial extent.

## Hittite / Egyptian Territory-Semantics Audit
- Current Middle East slots are `0=Mesopotamia/Iraq`, `1=Persia/Iran`, `2=Anatolia/Turkey`, `3=Egypt`, `4=Levant`, `5=Arabia`.
- The prior Hittite record used `slot: 2, width: 2`, which mathematically covered Anatolia plus Egypt in this slot order. That was semantically wrong for a Hittite polity and matched the user's concern about misleading rectangle overlap.
- New Kingdom Egypt previously used `slot: 3, width: 2`, correctly pointing toward Egypt plus Levant in broad terms, but it was still too coarse because it implied a full-width uniform block rather than a frontier sphere.
- Reference check: World History Encyclopedia summarizes Hittites as an Anatolian people who expanded into an empire rivaling Egypt; Britannica's Kadesh entry places the battle in the path of Egyptian expansion in Syria and describes the outcome as a truce; Met chronology material gives New Kingdom Dynasties 18-20 as 1550-1070 BC. These support splitting core territories from Levant/Syrian frontier zones.

## Hittite / Egyptian Territory-Semantics Fix
- Split Hittite data into `hittite_kingdom` (Anatolian kingdom), `hittite_empire` (Anatolian imperial core), and `hittite_syria` (half-width northern Syrian frontier fragment).
- Split Egyptian New Kingdom data into `egypt_new` (Nile core) and `egypt_levant` (half-width southern Levantian hegemony/tribute fragment).
- Added the Kadesh connection from `egypt_levant` to `hittite_syria`, making the conflict explicit rather than relying on rectangular overlap.
- Added optional `shape`, `territoryNote`, and `territoryNoteCN` fields. Shape classes such as `shape-taper-left` and `shape-taper-right` render clipped polygon fragments; territory notes appear in tooltips and detail panels.
- Updated README to state that frontier spheres and contested regions can be drawn as separate/narrowed fragments.
- Bumped source references to `app.js?v=118`, `styles.css?v=118`, and `print.css?v=118`.

## Hittite / Egyptian Territory-Semantics Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed v118 source references and the new `hittite_kingdom`, `hittite_empire`, `hittite_syria`, `egypt_levant`, shape, note, and Kadesh connection entries.
- Headless Chrome via CDP: desktop `?year=-1274&x=0.55&zoom=3&cache=v118-kadesh` loads v118 assets, renders 532 polity blocks, 91 event markers, and 50 connection paths with no document-level horizontal overflow.
- Geometry assertion: `hittite_empire.right <= egypt_new.left`, so the Hittite core no longer overlaps the Egyptian Nile core.
- Geometry assertion: `egypt_levant.right <= hittite_syria.left`, so Egyptian southern Levant and Hittite northern Syria appear side by side as half-width frontier fragments instead of covering one another.
- Both frontier fragments expose CSS `clip-path: polygon(...)`, proving the narrowed polygon styling is active.
- Tooltip verification: focusing `hittite_syria` shows the Northern Syrian territorial note and temporarily wires `aria-describedby="tooltip"`.
- Detail-panel verification: opening `egypt_levant` shows a `Territorial Reading` section, the southern Levant note, and the Kadesh connection.
- Mobile 390x844 Chinese `?year=-1274&x=0.55&zoom=3&cache=v118-mobile-kadesh` renders 532/91/50, restores the requested year/x, keeps width at 390px, and leaves no hidden focusable controls.

## Napoleonic / Spain Territory-Semantics Audit
- Current Europe slots are `0=Greece/Balkans`, `1=Italy`, `2=France`, `3=Iberia`, `4=Britain`, `5=Germany`, `6=Poland`, `7=Russia`.
- The v118 `napoleon` record uses `slot: 1, width: 5`, which visually covers Italy, France, Iberia, Britain, and Germany. That is too coarse and semantically wrong because it implies British territorial inclusion inside the Napoleonic Empire.
- The existing `spain` record is a single continuous full-width block from 1492 to 2000, so it cannot express the 1808-1814 Peninsular War period when French occupation/Bonapartist Spain and Spanish resistance/restoration claims coexisted.
- Reference check: Britannica dates the Peninsular War to 1808-1814 and describes French opposition by British, Spanish, and Portuguese forces in Iberia; Britannica dates the Confederation of the Rhine to 1806-1813 under Napoleon's aegis; Britannica summarizes Napoleon as emperor of France in 1804-1814/15. Napoleon.org / Napoleon Series material supports the Kingdom of Italy as a Napoleonic client monarchy beginning in 1805.
- The fix should preserve the French imperial core, separate Italian and German client/satellite structures, split Spain around the occupation/resistance period, and remove any visual implication that Britain is part of Napoleon's territory.

## Napoleonic / Spain Territory-Semantics Fix
- Changed `napoleon` from a five-slot rectangle into the `First French Empire` French core at Europe slot 2.
- Added `napoleon_italy` for Napoleonic Italy, `napoleon_rhine` for the Confederation of the Rhine, and `napoleon_iberia` for French-occupied / Bonapartist Spain.
- Split Spain into `spain` (1492-1808), `spain_peninsular` (1808-1814 half-width resistance / Cadiz / Bourbon legitimacy), and `spain_restored` (1814-2000).
- Added the Peninsular War conflict connection between `spain_peninsular` and `napoleon_iberia`, plus the Rhine Confederation succession connection from `hre_germany` to `napoleon_rhine`.
- Updated descriptions, entity details, Wikipedia slugs, README territorial semantics copy, and source references to `v119`.

## Napoleonic / Spain Territory-Semantics Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Data integrity script: current dataset has 537 entities and 57 connection records; the five dangling connection records are pre-existing legacy references, not introduced by v119.
- Data integrity script: 1812 Europe now has no slot overlap among `napoleon`, `spain_peninsular`, `napoleon_iberia`, `great_britain`, and `napoleon_rhine`.
- Headless Chrome via CDP: desktop `?year=1812&x=0.38&zoom=8&cache=v119-napoleon` loads v119 assets, renders 537 polity blocks, 91 event markers, and 52 connection paths with no document-level horizontal overflow.
- Geometry assertion: the French core ends before the Spanish resistance fragment, Spanish resistance ends before French-occupied Spain, French-occupied Spain ends before Great Britain, and Great Britain ends before the Rhine Confederation fragment. Napoleon no longer visually covers Britain or Spain.
- Polygon assertion: `napoleon_italy`, `spain_peninsular`, `napoleon_iberia`, and `napoleon_rhine` expose active CSS `clip-path` values.
- Tooltip verification: focusing `napoleon_iberia` shows the Bonapartist occupation territory note and wires `aria-describedby="tooltip"`.
- Detail-panel verification: opening `spain_peninsular` shows a `Territorial Reading` section, the Bourbon/Cadiz resistance note, and the Peninsular War connection.
- Mobile 390x844 Chinese `?lang=cn&year=1812&x=0.38&zoom=8&cache=v119-mobile-napoleon` renders 537/91/52, restores the requested year/x, keeps width at 390px, keeps the Iberian fragments side by side, and leaves no hidden focusable controls.

## Hellenistic Middle East Territory-Semantics Audit
- Current Middle East slots are `0=Mesopotamia/Iraq`, `1=Persia/Iran`, `2=Anatolia/Turkey`, `3=Egypt`, `4=Levant`, `5=Arabia`.
- v119 `seleucid` uses `slot: 0, width: 4` from 330-140 BC, which visually covers Mesopotamia, Persia, Anatolia, and Egypt. That is too broad and misleading because the Seleucids did not rule Ptolemaic Egypt, and the main western dispute was Coele-Syria / southern Syria.
- v119 `ptolemaic` uses `slot: 3, width: 2` from 332-30 BC, which visually covers Egypt plus the Levant as one uniform block. The dynasty proper begins in 305 BC, while the Levantine holdings were contested and later lost, so the core and frontier need separate representation.
- v119 `parthia` uses `slot: 0, width: 2` from 247 BC onward, implying full Parthian control of Mesopotamia from the start. Britannica and Met/Iranica material describe Parthia as beginning in northeastern Iran/Parthia, with Mesopotamian/Babylonian control coming later as Seleucid power receded.
- v119 `roman_east` begins in 64 BC as a three-slot block over Anatolia, Egypt, and Levant, which incorrectly covers Egypt for 64-30 BC while Ptolemaic Egypt was still independent until Cleopatra's death and Roman takeover in 30 BC.
- Reference check: Britannica dates the Seleucid empire to 312-64 BC and says it extended east/west under Seleucus; Britannica Syrian Wars identifies southern Syria as the Seleucid/Ptolemaic dispute and the Fifth War (202-200 BC) as the decisive Seleucid takeover; Met describes the Seleucid eastern provinces and notes losses in Parthia/Bactria around 246 BC plus Palestine ceded after 200 BC; Britannica and Met date Ptolemaic rule in Egypt to 305/332-30 BC depending on dynasty vs period; Britannica places Parthia first in Khorasan/northeastern Iran and as an empire from 247 BC to 224 AD.

## Hellenistic Middle East Territory-Semantics Fix
- Narrowed `achaemenid` from six slots to five slots so it no longer implies full control of Arabia.
- Changed `seleucid` to the early Mesopotamia-Persia core, dated 312-247 BC rather than 330-140 BC.
- Added `seleucid_mesopotamia`, `seleucid_anatolia`, and `seleucid_syria` to represent contraction after Parthian detachment plus separate Anatolian and Syrian frontiers.
- Changed `ptolemaic` to the Nile/Egyptian core, dated 305-30 BC, and added `ptolemaic_levant` as the half-width Coele-Syria / Phoenicia / Palestine frontier during the Syrian Wars.
- Changed `parthia` to an Iranian core and added `parthia_mesopotamia` from 141 BC onward.
- Split `roman_east` into Anatolia, `roman_levant`, and `roman_egypt`, with Roman Egypt beginning only in 30 BC.
- Added Hellenistic transition connections for the Syrian Wars, Parthian breakaway, Fifth Syrian War, Parthian Babylonia, and Roman annexation of Egypt.
- Updated descriptions, entity details, Wikipedia slugs, README territorial semantics copy, and source references to `v120`.

## Hellenistic Middle East Territory-Semantics Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static source scan confirmed v120 asset references in `index.html`.
- Data integrity script: current dataset has 544 entities and 62 connection records; the five dangling connection records are pre-existing legacy references, not introduced by v120.
- Data integrity script: Middle East years -301, -274, -240, -200, -140, -100, -64, -30, and 53 now have no slot overlaps among the audited Seleucid, Ptolemaic, Parthian, and Roman eastern entities.
- Headless Chrome via CDP: desktop `?year=-274&x=0.55&zoom=4&cache=v120-hellenistic` loads v120 assets, renders 544 polity blocks, 91 event markers, and 57 connection paths with no document-level horizontal overflow.
- Geometry assertion: Seleucid core / Anatolia end before Ptolemaic Egypt, Ptolemaic Egypt ends before Ptolemaic Levant, and Ptolemaic Levant ends before Seleucid Syria. The Coele-Syria frontier appears as side-by-side half-width polygon fragments.
- Tooltip verification: focusing `ptolemaic_levant` shows the Southern Syria / Palestine / Phoenician contested territory note and wires `aria-describedby="tooltip"`.
- Detail-panel verification: opening `seleucid_syria` shows a `Territorial Reading` section, the northern Syrian frontier note, and the Syrian Wars / Coele-Syria connection.
- Headless Chrome via CDP: desktop `?year=-64&x=0.55&zoom=4&cache=v120-roman-pre-egypt` shows Roman East ending before Ptolemaic Egypt and Roman Syria starting after Ptolemaic Egypt, so Rome no longer covers Egypt before 30 BC.
- Headless Chrome via CDP: desktop `?year=-30&x=0.55&zoom=4&cache=v120-roman-egypt` shows Roman Egypt between Roman East and Roman Syria.
- Mobile 390x844 Chinese `?lang=cn&year=-274&x=0.55&zoom=4&cache=v120-mobile-hellenistic` renders 544/91/57, restores the requested year/x, keeps Coele-Syria fragments side by side, keeps width at 390px, and leaves no hidden focusable controls.

## v121 Data Integrity / South Asia Audit
- Session catchup found an older commit/push context, but the current source baseline remains the uncommitted v120 data/semantics work recorded above.
- Current data scan: 544 entities, 62 connection records, and 5 missing connection endpoints.
- Missing connection endpoints are legacy shorthand IDs, not absent historical topics: `ghana` should map to `ghana_empire`, `mali` should map to `mali_empire`, and `dai_viet` needs a real Southeast Asia entity because the description/wiki tables already contain Dai Viet text but no timeline entity exists.
- Sampled overlap scan identifies South Asia as the next highest-risk territory-semantics region: `indus_valley / south_prehistoric`, `south_prehistoric / vedic`, `maurya / sangam_early`, `kushan / satavahana`, `gupta / pallava_early`, and `delhi_sultanate / vijayanagara` all have full-slot visual overlap despite representing distinct north/south/regional spaces.
- Next implementation direction: fix dangling connection IDs, add a real `dai_viet` timeline entity, and split or narrow broad South Asian imperial/cultural blocks so northwestern/northern/Bengal cores do not visually swallow southern polities.

## v121 Data Integrity / South Asia Fix
- Fixed all five dangling historical connection endpoints:
  - `ghana -> abbasid` became `ghana_empire -> abbasid_core` for the gold-salt trade.
  - `mali -> abbasid` at AD 1300 became `mali_empire -> mamluk`, avoiding a post-1258 Abbasid anachronism.
  - `mali -> mamluk` at AD 1324 became `mali_empire -> mamluk`.
  - `ming -> mali` became `ming -> swahili_coast` because Zheng He's African voyages reached the East African / Swahili coast, not inland West African Mali.
  - `khmer -> dai_viet` became `dai_viet -> champa` for the AD 1471 conquest of Champa.
- Added `swahili_coast` as an Indian Ocean city-state network fragment so East African contact has a real timeline entity.
- Added `champa` and `dai_viet` as half-width Vietnam-column fragments; the Khmer node no longer stands in for Champa-Viet conflict.
- South Asia now uses narrower region fragments:
  - `indus_valley` moved to the Indus/Punjab-Sindh core, with `indus_fringe` for eastern/southern Harappan outliers.
  - `vedic` and `mahajanapadas` no longer cover Bengal or the south.
  - `maurya`, `gupta`, `delhi_sultanate`, and `mughal_peak` are split from Bengal, northwest, Deccan, and southern-polity fragments where needed.
  - `sangam_early`, `satavahana`, `delhi_deccan`, and `pandya` use half-width tapered polygons so coexistence and pressure are visible without false full absorption.
- Removed six duplicate entity IDs by renaming regional projections: `gokturk_mongolia`, `uyghur_mongolia`, `samanid_iran`, `ghaznavid_iran`, `hephthalite_india`, `ghaznavid_india`, and `durrani_punjab`.

## v121 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static scan confirmed asset references are `v121` and legacy `v120` references are gone.
- Data integrity script: 556 unique entities, 62 connection records, 0 duplicate IDs, and 0 missing connection endpoints.
- South Asia slot-overlap audit: 0 overlaps after the v121 split.
- Headless Chrome via CDP: desktop South Asia view rendered 556 polity blocks, 91 event markers, and 62 connection paths; Maurya/Gupta/Delhi/Mughal fragments and southern/Bengal entities are side by side rather than overlapping.
- Tooltip verification: `delhi_deccan` exposes the Khalji/Tughluq Deccan territory note and `aria-describedby`.
- Detail verification: `bengal_sultanate` opens with a `Territorial Reading` section and the independent Bengal delta note.
- Southeast Asia verification: `champa` and `dai_viet` render as side-by-side tapered polygons; the `dai_viet` detail panel includes the `Đại Việt Conquers Champa` connection.
- Africa verification: `swahili_coast` renders as a polygon fragment, its tooltip explains Zheng He's East African contact, and all 62 connections render.
- Mobile 390x844 Chinese verification: 556/91/62 counts, document width equals viewport width (390px), Delhi Deccan and Pandya remain side by side, and hidden focusable controls list is empty.

## v122 Southeast Asia / Africa Territory-Semantics Audit
- Southeast Asia source direction: Britannica describes Srivijaya as a Palembang/Sumatran maritime and commercial power controlling the Strait of Malacca, so it should not visually cover Javanese Mataram/Kediri as a full Indonesia+Malaysia rectangle. Majapahit is based in eastern Java with wide maritime memory/claims, which should not erase Malacca as a separate Malay trading state.
- Mainland Southeast Asia source direction: Dvaravati belongs to the lower Chao Phraya / Mon-Thai zone, while the Khmer Empire has an Angkor/Cambodian core plus broad mainland influence. Khmer Thai-basin influence should be a separate fragment, not a single two-slot rectangle over Cambodia and Thailand.
- Thai/Myanmar transition source direction: Bayinnaung/Toungoo conquered Ayutthaya in 1569 and briefly made Siam subordinate, but that is better represented as a short Siam fragment and a paired Ayutthaya-vassal fragment than as a broad Toungoo rectangle covering Myanmar, Thailand, and the Philippines.
- Africa source direction: Axum should be an Ethiopian/Eritrean and Red Sea trade core rather than a Horn+Nubia block. Almoravid and Almohad power is Maghreb/Saharan or Maghreb/Andalusian in this visualization; Ghana/Mali Sahel transitions should remain separately visible.
- West Africa source direction: Mali and Songhai are upper Niger / Sahelian trading empires, while Benin, Oyo, and Ashanti/Asante are distinct forest/coastal Guinea Coast polities. Sokoto is a northern Nigeria / Hausaland-Fulani caliphate, not a full coastal West Africa rectangle.

## v123 Americas Territory-Semantics Audit
- Pre-fix all-region overlap scan still showed 14 Americas overlaps, concentrated in one overloaded Caribbean/Central America/Maya slot: `carib_prehistoric / olmec`, `teotihuacan / maya_classic`, `toltec / maya_post`, `maya_post / aztec`, `new_spain / colonial_carib`, `colonial_carib / mexico_early`, `colonial_carib / central_america`, and `native_nations / new_france`.
- Reference direction: Britannica describes Olmec as a Gulf Coast lowland civilization in southern Veracruz and Tabasco, while early Maya development shows Olmec influence rather than direct Olmec rule over Maya territory.
- Reference direction: Teotihuacan was a Basin of Mexico urban core whose cultural and trade influence spread through Mesoamerica; its influence into the Maya world should be a narrow contact fragment beside Maya Classic city-states, not a full-width empire covering them.
- Reference direction: Toltec/Tula belongs to central Mexico roughly in the 10th-12th centuries; Yucatan / Chichen Itza-style Toltec-Maya links are better represented as contact/exchange than as a single Toltec rectangle over the Maya lane.
- Reference direction: Aztec dominance after 1428 centered on central Mexico and operated heavily through tribute and frontier pressure, so the visual model should not erase surviving Postclassic Maya polities.
- Reference direction: New Spain's Mexico-centered colonial core, the Central American captaincy-general sphere, and the Caribbean island world have different spatial semantics. The Caribbean begins with Columbus in 1492, becomes multi-imperial after seventeenth-century partition, and should not share the Central America lane.
- Reference direction: Central America becomes independent from Spain in 1821, passes through a brief Mexican imperial interlude, and the United Provinces / later republics begin in 1823; the old 1848 start left a misleading gap and made Mexico/Caribbean rectangles hide the region.

## v123 Americas Territory-Semantics Fix
- Moved `carib_prehistoric`, `spanish_carib`, `colonial_carib`, and `caribbean` to a separate Caribbean lane (`slot: 6`).
- Narrowed `olmec`, `teotihuacan`, `toltec`, and `aztec` to the central Mexican / Gulf Coast core lanes and added narrow polygon fragments: `olmec_maya_influence`, `teotihuacan_maya_contact`, `toltec_maya_contact`, and `aztec_southern_tribute`.
- Narrowed Maya phases into adjacent half-lanes so `maya_preclassic`, `maya_classic`, and `maya_post` survive beside influence/tribute fragments instead of being covered by them.
- Split `new_spain` into a Mexico-centered colonial core and `new_spain_central_america`, narrowed `mexico_early`, moved `central_america` to start in 1823, and kept the Caribbean island world out of the mainland lane.
- Narrowed `native_nations` from a two-slot block to the North America/United States lane so it no longer visually covers New France / Canada.
- Updated descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, and static asset references to `v123`.

## v123 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static stale-reference scan confirmed `index.html` uses `v123` asset references and no `v120`/`v121`/`v122` references remain in source docs.
- Data integrity script: 566 unique entities, 65 connection records, 0 duplicate IDs, and 0 missing connection endpoints.
- Region overlap scan: Americas overlap count is now 0; South Asia, Southeast Asia, and Africa remain 0.
- Headless Chrome via CDP desktop verification: `?year=1492&x=0.75&zoom=6&cache=v123-americas` rendered 566 polity blocks, 91 world-event markers, and 65 connection paths with `app.js?v=123` and `styles.css?v=123`.
- Desktop geometry assertions passed for Olmec/influence/Maya Preclassic, Teotihuacan/contact/Maya Classic, Toltec/contact/Maya Postclassic, Aztec/tribute/Maya Postclassic, New Spain/Central America/Caribbean, modern Central America/Caribbean, and Native Nations/New France.
- Polygon assertions passed for all new Americas influence/contact/tribute fragments; tooltip verification passed for `teotihuacan_maya_contact`, and detail-panel verification passed for `new_spain_central_america` with a `Territorial Reading` section.
- Mobile 390x844 Chinese verification passed with 566/91/65 counts, document width equal to viewport width, Aztec tribute beside Maya Postclassic, Central America left of the Caribbean lane, active polygon clipping, and no hidden focusable controls.
- Temporary local server and Chrome validation session were stopped; ports 8765 and 9231 had no listeners and curl returned connection failure.

## v124 Central Asia Territory-Semantics Audit
- Pre-fix all-region overlap scan showed six Central Asia overlap pairs: `hephthalite / gokturk`, `samanid_south / ghaznavid_ca`, `gokturk / umayyad_ca`, `yuezhi / kangju`, `kangju / kidarites_steppe`, and `ghurid_ca / khwarazm_south`.
- Reference direction: Britannica describes the Hephthalites as a 5th-6th century power active in Persia and India that ceased to exist as a separate people after mid-6th-century Turk attacks; the visualization should therefore separate a Bactria/Tokharistan/Afghanistan core from the northern Turkic steppe.
- Reference direction: Britannica's Central Asia and Turkic peoples material describes the first Turkic empire as a 6th-century steppe power stretching from Mongolia/northern China toward the Black Sea, with western centers around the Ili/Chu area and a 560 attack that destroyed Hephthalite power in alliance with the Sasanians.
- Reference direction: Britannica places the Samanids in Transoxiana and Khorasan with Bukhara as capital, while the Ghaznavids begin from Ghazna/Afghanistan and divide former Samanid territory around the Oxus/Qarakhanid frontier. These should not share one full-width Khorasan rectangle.
- Reference direction: Britannica places Ghur in the mountain zone southeast of Herat / northwest of Helmand; Ghurid power expanded into Afghanistan/eastern Iran/Turkmenistan by 1200 and was taken by Khwarezm-Shah around 1215. The Ghurid core, Khwarazmian Khorasan, and short Ghur takeover need distinct fragments.
- Source pages checked: Britannica Hephthalite, Turkic peoples, Central Asia, History of Central Asia: The Middle Ages, Samanid dynasty, Ghaznavid dynasty, Ghurid Sultanate, and Khwarezm-Shah dynasty.

## v124 Central Asia Territory-Semantics Fix
- Narrowed `yuezhi` into a pre-Kangju migration phase and made `kangju` / `kidarites_steppe` adjacent half-width steppe fragments instead of one lane overlap.
- Split `hephthalite` into a Bactria/Tokharistan/Afghanistan core fragment and `gokturk` into a northern/Ili-Chu steppe fragment, with an added Turk-Sasanian defeat-of-Hephthalites connection.
- Renamed/narrowed `samanid` and `samanid_south` to Transoxiana and Khorasan semantics, then moved `ghaznavid_ca` to a separate Ghazna/Afghanistan core lane with a Samanid-Khorasan split connection.
- Narrowed `ghurid_ca` and `khwarazm_south`, then added `khwarazm_afghan` as a short post-1215 takeover fragment so Khwarazmian expansion does not visually cover the Ghurid core for the whole period.
- Added Central Asia descriptions, entity details, capital coordinates, Wikipedia slug mappings, four historical connections, README territorial semantics copy, and static asset references to `v124`.

## v124 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static stale-reference scan confirmed no `v120`/`v121`/`v122`/`v123` references remain in `index.html`, `README.md`, or `app.js`.
- Data integrity script: 567 unique entities, 69 connection records, 0 duplicate IDs, and 0 missing connection endpoints.
- Region overlap scan: Central Asia overlap count is now 0; South Asia, Southeast Asia, Africa, and Americas remain 0.
- Headless Chrome via CDP desktop verification: `?year=560&x=0.55&zoom=6&cache=v124-central-asia` rendered 567 polity blocks, 91 world-event markers, and 69 connection paths with `v124` assets.
- Desktop geometry assertions passed for Kangju/Kidarite Steppe, Gokturk/Hephthalite, Samanid Khorasan/Ghaznavid Core, Khwarazmian Khorasan/Ghurid Core, and the post-1215 Khwarazmian Ghur takeover fragment.
- Polygon assertions passed for the audited Central Asia fragments; tooltip verification passed for `hephthalite`, and detail-panel verification passed for `ghaznavid_ca` with a `Territorial Reading` section and the Samanid-Khorasan split connection.
- Mobile 390x844 Chinese verification passed with 567/91/69 counts, document width equal to viewport width, Samanid/Ghaznavid fragments side by side, active polygon clipping, and no hidden focusable controls.
- Temporary local server and Chrome validation session were stopped; ports 8765 and 9231 had no listeners and curl returned connection failure.

## v125 Middle East Transition-Semantics Audit
- Current post-v124 Middle East overlap scan reports 23 overlaps. Ten are ancient or late-Bronze/Iron-Age cases that need a separate pass; the clearest high-impact cluster is post-classical transition overlap from the Sasanian-Byzantine collapse through Rashidun, Abbasid fragmentation, Crusader/Mamluk reconquest, Ottoman-Safavid Iraq, and modern mandate/Saudi boundaries.
- Reference direction: Britannica's Caliphate and Egypt material describes the 630s conquests of Syria, Palestine, and Iraq, Egypt's takeover from Byzantine control around 641-645, and Persia as a separate eastern conquest. A single Rashidun rectangle from Iraq through Arabia incorrectly covers surviving Byzantine Anatolia and Sasanian Persia during the conquest process.
- Reference direction: Met and Britannica material on Sasanian/Iranian history supports Sasanian survival until 651 while Iraq/Mesopotamia was lost earlier; therefore Sasanian Mesopotamia and Sasanian Persia should be separate fragments.
- Reference direction: Britannica's Abbasid and Iranian Intermezzo pages place Tahirid government in Khorasan from 821 and describe Abbasid power increasingly as Baghdad-centered or suzerain/figurehead authority. Abbasid Persia after 821 should not sit underneath a full Abbasid rectangle.
- Reference direction: Britannica's Fatimid, Ayyubid/Saladin, Crusades, Crusader States, and Mamluk pages support Egypt-centered Fatimid and Mamluk cores plus contested/coastal Levant fragments; the fall of Acre in 1291 is the clean terminal point for Crusader rule in the Middle East.
- Reference direction: Britannica's Il-Khanid, Iraq/Safavid, Battle of Baghdad 1534, Palestine mandate, and Saudi Arabia pages support Mongol/Ilkhanate Persia before Baghdad in 1258, Safavid Baghdad/Iraq until Ottoman capture in 1534, a Palestine/Transjordan mandate rather than a mandate covering Saudi Arabia, and Saudi Arabia's independent establishment in 1932.

## v125 Middle East Transition-Semantics Fix
- Split Sasanian and Byzantine late-antique blocks into Mesopotamia/Persia and Anatolia/Egypt/Levant fragments so the Rashidun conquest fronts no longer render as one instant all-region overlay.
- Split the Rashidun phase into Arabia, Iraq, Levant, Egypt, and post-651 Persia fragments with polygon shapes for conquest fronts.
- Split early Abbasid Baghdad, Abbasid Persia, Abbasid Egypt-Levant, Arabia, and later Abbasid Baghdad; Tahirid Khorasan now begins after the Abbasid Persia fragment rather than underneath it.
- Split Fatimid Egypt from Fatimid Levant, Ayyubid Egypt from Ayyubid Levant, and Crusader pre-Hattin / reduced coastal phases; Mamluk Levant now starts after Acre in 1291.
- Moved Mongol Middle East pressure to Persia before 1256, split Ilkhanate Persia from post-1258 Iraq, and kept Abbasid Baghdad visible until the sack.
- Split late Seljuk Rum and the Ottoman beylik into adjacent half-lanes, then added an Ottoman Anatolia bridge before 1453.
- Moved Ottoman Iraq to begin with Baghdad in 1534, leaving Safavid Iraq visible until then.
- Narrowed Palestine Mandate, added Transjordan Mandate, split Saudi Arabia into a half-lane 1932-1946 and full Arabia lane after 1946.
- Added descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, six historical connections, README territorial semantics copy, and static asset references to `v125`.

## v125 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static stale-reference scan confirmed no `v120`/`v121`/`v122`/`v123`/`v124` references remain in `index.html`, `README.md`, or `app.js`.
- Data integrity script: 583 unique entities, 75 connection records, 0 duplicate IDs, and 0 missing connection endpoints.
- Region overlap scan: Middle East overlap count dropped from 23 to 11. The remaining Middle East overlaps are the ancient Akkad/Elam, Old Babylon/Elam, Late Bronze/Iron Age Levant, Assyria/Neo-Babylonian, Lydia/Achaemenid, and Neo-Babylonian/Achaemenid transition cluster reserved for a dedicated ancient Middle East pass.
- Other zero-overlap regions stayed stable: South Asia, Central Asia, Africa, Americas, and Southeast Asia all remain 0.
- Headless Chrome via CDP desktop verification: `?year=636&x=0.55&zoom=6&cache=v125-middleeast-rerun` rendered 583 polity blocks, 91 world-event markers, and 75 connection paths with `v125` assets.
- Desktop geometry assertions passed for Sasanian/Rashidun, Byzantine/Rashidun, Abbasid/Tahirid, Fatimid/Crusader/Ayyubid/Mamluk, Abbasid/Mongol/Ilkhanate, Seljuk Rum/Ottoman, Safavid/Ottoman Iraq, and Palestine/Transjordan/Saudi fragments.
- Polygon assertions passed for the audited Middle East transition fragments; tooltip verification passed for `rashidun`, and detail-panel verification passed for `crusader_coast` with `Territorial Reading` and `Fall of Acre`.
- Mobile 390x844 Chinese verification passed with 583/91/75 counts, document width equal to viewport width, Palestine Mandate / Transjordan / Saudi fragments side by side, active polygon clipping, and no hidden focusable controls.
- Temporary local server and Chrome validation session were stopped; ports 8765 and 9231 had no listeners and curl returned connection failure.

## v126 Ancient Middle East Territory-Semantics Audit
- Session catchup surfaced an older commit/push transcript only; current authority remains the v125 uncommitted source and planning state.
- Data scan confirms the v125 baseline has 583 entities, 75 connection records, 0 duplicate IDs, 0 missing connection endpoints, and 11 remaining Middle East slot overlaps.
- Remaining Middle East overlaps are concentrated in the ancient-transition cluster: Akkad/Elam, Old Babylon/Elam, late Egyptian/Hittite Levant versus Iron Age Levant, Babylon/Assyria, Elam/Neo-Babylon, Assyria/Neo-Babylon, and Achaemenid versus Egypt/Lydia/Neo-Babylonian Mesopotamia/Levant.
- Reference direction: Britannica and the Met describe Akkad as a southern Mesopotamian empire whose kings united Sumerian city-states and campaigned east/north; Britannica describes Elam as southwestern Iran/Khuzestan with Susa, Anshan, Awan, and Simash, closely tied to Mesopotamia but not simply identical with it. Akkad should therefore be Mesopotamian core plus a narrowed eastern pressure fragment, while Elam remains visible beside it.
- Reference direction: Britannica's ancient Iran material says Elam's Old Elamite period involved recurring Mesopotamian conflict, Hammurabi crushed Elam in 1764 BCE, and Elam reasserted independence after Babylon weakened. Old Babylon should be a Mesopotamian core plus a short Elam/Zagros campaign fragment, not a 300-year full-width block over Elam.
- Reference direction: Britannica's Canaan and Palestine material places the Late Bronze to Early Iron transition around the late 13th and early 12th centuries BCE: Egyptian domination in southern Canaan waned, the Hittites collapsed, Israelites and Philistines emerged over time. The chart should not let a full Iron Age Levant rectangle cover still-visible Egyptian and Hittite frontier fragments.
- Reference direction: Britannica's Neo-Babylonian page gives 626 BCE for Nabopolassar's Babylonian dynasty, Nineveh in 612, Assyrian collapse in or shortly after 610, and Babylonian control of much of Southwest Asia until Cyrus in 539. This supports a Babylonian revolt/core fragment beside a surviving Assyrian remnant before a broader post-Harran Neo-Babylonian phase.
- Reference direction: Britannica's Achaemenid/Cyrus pages give Cyrus's Persian base from 559/550, Sardis/Lydia captured in 546, Babylon in 539, and Egypt prepared for conquest under Cambyses after Cyrus. The Achaemenid block should expand by region over time rather than covering Lydia, Babylon, the Levant, and Egypt from 550.
- Source pages checked: Britannica Mesopotamia / Sumer and Akkad, Met Akkadian Period, Britannica Elam, Britannica ancient Iran, Britannica Code of Hammurabi, Britannica Canaan, Britannica Palestine Iron Age, Britannica Neo-Babylonian Empire, Britannica Cyrus the Great, and Britannica Achaemenid Empire.

## v126 Ancient Middle East Territory-Semantics Fix
- Split `akkad` into a Mesopotamian core, `akkad_elam_pressure`, and adjacent `elam_akkad`, so Akkadian eastward campaigns no longer render as full Persian-lane control.
- Split `old_babylon` from Elam by keeping Babylon in the Mesopotamian lane, adding `old_babylon_elam_campaign`, and separating `elam_old` from `elam_old_reasserted`.
- Ended the Egyptian Levant fragment at the Late Bronze transition and added `levant_transition`, narrowed `levant_iron`, and added `neo_hittite_syria` for northern Syrian / Syro-Hittite states.
- Split Babylonia and Assyria into `babylon_dark`, `babylon_assyrian_vassal`, narrowed `assyria`, `neo_babylon_revolt`, and post-Assyrian `neo_babylon`.
- Shortened `elam_neo` before Assyrian devastation and added adjacent `persis_anshan` plus `elam_susiana` to show Persian emergence beside reduced Susiana.
- Replaced the single broad `achaemenid` rectangle with Achaemenid Persia plus dated `achaemenid_anatolia`, `achaemenid_mesopotamia`, `achaemenid_levant`, `achaemenid_egypt`, `egypt_late_independent`, and `achaemenid_egypt_late`.
- Added descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, eight ancient conquest/transition connections, README territorial semantics copy, and static asset references to `v126`.

## v126 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static stale-reference scan confirmed no `v120`/`v121`/`v122`/`v123`/`v124`/`v125` references remain in `index.html`, `README.md`, or `app.js`; `index.html` uses `styles.css?v=126`, `print.css?v=126`, and `app.js?v=126`.
- Data integrity script: 598 unique entities, 83 connection records, 0 duplicate IDs, and 0 missing connection endpoints.
- Region overlap scan: Middle East overlap count is now 0; South Asia, Central Asia, Africa, Americas, and Southeast Asia remain 0. East Asia and Europe still have pre-existing sampled overlaps for later passes.
- Headless Chrome via CDP desktop verification: `?year=-539&x=0.55&zoom=6&cache=v126-ancient` rendered 598 polity blocks, 91 world-event markers, and 83 connection paths with `v126` assets.
- Desktop geometry assertions passed for Akkad/Elam, Old Babylon/Elam campaign, Egyptian/Hittite/Levant transition, Assyria/Babylonia/Neo-Babylon, Neo-Elam/Persis/Susiana, and staged Achaemenid Lydia/Babylon/Levant/Egypt transitions.
- Polygon assertions passed for the audited ancient Middle East pressure/conquest fragments; tooltip verification passed for `akkad_elam_pressure`, and detail-panel verification passed for `achaemenid_mesopotamia` with `Territorial Reading` and `Fall of Babylon`.
- Mobile 390x844 Chinese verification passed with 598/91/83 counts, `zh-CN`, document width equal to viewport width, v126 assets, and no hidden focusable controls.
- Temporary local server and headless Chrome validation session were stopped; ports 8765 and 9231 had no listeners and curl returned connection failure.

## v127 Europe Territory-Semantics Audit
- Current v126 data scan: 598 entities, 83 connection records, 0 duplicate IDs, 0 missing connection endpoints.
- Europe sampled overlaps are now eight pairs: `celtic_gaul / roman_republic_2`, `celtic_britain / roman_empire`, `w_roman / sub_roman`, `poland_republic / nazi_germany`, `france_post / nazi_peak`, `spain_restored / nazi_peak`, `italy_kingdom / nazi_peak`, and `ussr / poland_mod`.
- Reference direction: Britannica's Roman Republic / ancient Rome pages place Rome's core in Italy, then formal Roman rule in Spain after the Second Punic War, Gaul through Caesar's 58-50 BCE campaigns and earlier Transalpine pressure, and Roman Britain only from Claudius's conquest in 43 CE to Honorius's withdrawal of imperial authority in 410 CE. The old `roman_republic_2` and `roman_empire` rectangles therefore overstate direct control of Gaul and Britain.
- Reference direction: Britannica's Roman Britain material says imperial authority withdrew in 410 and Romano-Britons were left to themselves; Western Rome should not keep covering Britain from 410 to 476.
- Reference direction: Britannica and USHMM material date Germany's invasion of Poland to September 1, 1939, and Vichy France to July 1940-September 1944; Britannica's Battle of France page confirms the 1940 German defeat of France. Nazi Germany should not cover Poland before the invasion, and France should show occupation/parallel French authority rather than one hidden rectangle.
- Reference direction: Britannica's Italy World War II material distinguishes Fascist Italy as an Axis power from later German occupation/Italian collapse after 1943. Spain under Franco had Axis sympathy but remained formally neutral according to Britannica, so a Nazi occupation rectangle must not cover Spain.
- Reference direction: Britannica's Warsaw Pact, Communist Poland, Solidarity, and Soviet collapse pages support treating Poland as a Soviet-aligned satellite / Warsaw Pact state before 1989, then a separate post-communist republic, while the USSR itself remains the Russian/Soviet core until 1991 rather than a full Poland+Russia rectangle.
- Source pages checked: Britannica Roman Republic, ancient Rome western Mediterranean expansion, Gallic Wars, Julius Caesar/Gaul, Roman Britain, Roman Britain end, Invasion of Poland, Vichy France, Battle of France, Italy in World War II, Francisco Franco, Warsaw Pact, Communist Poland, Solidarity, Soviet Union, and Collapse of the Soviet Union; USHMM Invasion of Poland.

## v127 Europe Territory-Semantics Fix
- Replaced broad Roman Republic / Roman Empire rectangles with regional fragments: Italian republican/imperial core, Roman Hispania, Roman Greece, Transalpine Gaul beside late Celtic Gaul, Caesar-era Roman Gaul, Roman Britain only after 43 CE, late Roman provincial lanes, and Western Roman Italy/Gaul/Hispania/Britain-withdrawal fragments.
- Moved `sub_roman` to begin after the final Roman Britain withdrawal fragment, so Western Rome no longer covers Britain after 410.
- Split modern France around World War II into pre-1940 France, `france_vichy`, German-occupied France, and postwar France.
- Narrowed `nazi_germany` to the German core and added adjacent `poland_resistance`, `nazi_poland_occupation`, `italy_cobelligerent`, and `nazi_italy_occupation` fragments.
- Kept `spain_restored` as its own lane through World War II with a territory note clarifying Francoist alignment/neutrality rather than Nazi occupation.
- Split Italy into liberal kingdom, Fascist Italy, co-belligerent Italy, German-occupied Italy, and postwar republic phases.
- Narrowed the postwar USSR to the Russia/Soviet core lane and added side-by-side `poland_people` and `ussr_warsaw_pact_poland` fragments for Polish state continuity plus Soviet-bloc influence.
- Extended `ussr_early` through World War II so Operation Barbarossa points to an active Soviet entity in 1941.
- Added eight Europe transition/conflict connections: Caesar's Gallic Wars, Claudius conquers Britain, Roman withdrawal from Britain, Invasion of Poland, Battle of France, German occupation of Italy, Italian Armistice, and Solidarity ending communist rule.
- Updated descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, and static asset references to `v127`.

## v127 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static stale-reference scan confirmed no `v120`/`v121`/`v122`/`v123`/`v124`/`v125`/`v126` references remain in `index.html`, `README.md`, `app.js`, or `task_plan.md` after the source update.
- Data integrity script: 621 unique entities, 91 connection records, 0 duplicate IDs, and 0 missing connection endpoints.
- Region overlap scan: Europe overlap count dropped from 8 to 0; Middle East, South Asia, Southeast Asia, Central Asia, Africa, and Americas remain 0. East Asia still has four pre-existing overlaps reserved for the next pass.
- Headless Chrome via CDP desktop verification: `?year=1940&x=0.35&zoom=8&cache=v127-europe-final` rendered 621 polity blocks and 91 event markers with `v127` assets and no console/runtime errors.
- Desktop geometry assertions passed for Roman Transalpine/Celtic/Caesar Gaul, Celtic/Roman/Sub-Roman Britain, Nazi Germany/Poland, Vichy/German-occupied France, Spain outside Nazi occupation, co-belligerent/German-occupied Italy, and Polish People's Republic / Soviet-bloc Poland / USSR core.
- Polygon assertions passed for the audited Roman, World War II, and Cold War fragments; tooltip verification passed for `nazi_poland_occupation`, including `aria-describedby` focus ownership, and detail-panel verification passed with `Territorial Reading` plus `Invasion of Poland`.
- Mobile 390x844 Chinese verification passed with 621/91 counts, `zh-CN`, document width equal to viewport width, v127 assets, collapsed Controls state, and no hidden focusable controls.
- Verifier-only issue: the first tooltip check dispatched `mouseover`, but polity blocks are bound to `mouseenter`; rerunning with the actual event contract passed.
- Temporary local server and headless Chrome validation session were stopped; ports 8765 and 9231 had no listeners and curl to 8765 exited 7.

## v128 East Asia Transition-Semantics Audit
- Session catchup surfaced only an older commit/push transcript; current authority remains the v127 uncommitted worktree and planning files.
- Current v127 data scan: 621 entities, 91 connection records, 0 duplicate IDs, 0 missing connection endpoints.
- Remaining East Asia slot overlaps are four transition pairs: `jin_west / shu_wu` in 266-280, `sui / s_dynasties` in 581-589, `n_song / ten_kingdoms` in 960-979, and `unified_silla / goryeo` in 918-935.
- Reference direction: Britannica's Jin dynasty and China/Six Dynasties material says Western Jin began under Sima Yan in 265/266 but Wu maintained itself until Jin armies conquered it in 280. Western Jin should therefore be a northern/Cao-Wei successor core before 280 plus a post-280 unified phase, rather than covering southern Wu from 266.
- Reference direction: Britannica's Sui page says Sui was established in 581 in North China and overwhelmed the last southern dynasty, Chen, in 589. The Sui block should not occupy the south before the Chen/Southern Dynasties endpoint.
- Reference direction: Britannica's Song and Ten Kingdoms pages say Song was founded in 960; Taizu began expansion into southern Ten Kingdoms before his death, and over the next two decades Song absorbed the southern kingdoms. Northern Song should be a northern/central core plus a dated southern consolidation fragment, not a 960 full-width rectangle over all Ten Kingdoms.
- Reference direction: Britannica's Unified Silla and Goryeo pages plus the Met chronology support Goryeo being formed in 918 while Unified Silla continued until its surrender in 935 and Later Baekje until 936. Korea should show the Later Three Kingdoms transition as side-by-side Silla/Goryeo fragments rather than full overlap.
- Source pages checked: Britannica Jin dynasty, Britannica History of China / Six Dynasties, Britannica Six Dynasties, Smithsonian Period of Division, Britannica Sui dynasty, Britannica Song dynasty, Britannica Ten Kingdoms, Britannica Unified Silla, Britannica Goryeo, and Met Korea 500-1000 chronology.

## v128 East Asia Transition-Semantics Fix
- Split Western Jin into `jin_west` north/Cao-Wei successor core for 266-280 plus `jin_west_unified` after the 280 conquest of Wu; kept `shu_wu` visible until 280.
- Split Sui into `sui` northern core for 581-589 plus `sui_unified` after the 589 conquest of Chen; kept `s_dynasties` visible until the actual Southern Dynasties endpoint.
- Narrowed `n_song` to the Kaifeng northern/central core from 960 and added `n_song_south` from 979, leaving `ten_kingdoms` visible during the early Song absorption period.
- Split Korea's Later Three Kingdoms transition into `unified_silla` through 918, half-lane `late_silla` through 935, half-lane early `goryeo` from 918-936, and `goryeo_unified` from 936.
- Added four transition/conquest connections: Western Jin conquers Wu, Sui conquers Chen, Song absorbs southern kingdoms, and Silla surrenders to Goryeo.
- Updated descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, and static asset references to `v128`.

## v128 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static stale-reference scan confirmed no stale asset references remain in `index.html`, `README.md`, or `app.js`; `index.html` uses `styles.css?v=128`, `print.css?v=128`, and `app.js?v=128`.
- Data integrity script: 626 unique entities, 95 connection records, 0 duplicate IDs, and 0 missing connection endpoints.
- Region overlap scan: East Asia overlap count dropped from 4 to 0; Middle East, South Asia, Southeast Asia, Central Asia, Africa, Americas, and Europe all remain at 0 sampled slot overlaps.
- Headless Chrome via CDP desktop verification: `?year=589&x=0.08&zoom=8&cache=v128-eastasia-pass` rendered 626 polity blocks, 91 world-event markers, and 95 connection paths with `v128` assets and no console/runtime errors.
- Desktop geometry assertions passed for Western Jin/Wu, Western Jin unified phase, Sui/Southern Dynasties, Sui unified phase, Song/Ten Kingdoms/southern consolidation, Late Silla/Early Goryeo, and unified Goryeo transitions.
- Polygon assertions passed for `jin_west_unified`, `sui_unified`, `n_song_south`, `late_silla`, and early `goryeo`; tooltip verification passed for `sui`, including `aria-describedby`, and detail-panel verification passed for `sui_unified` with `Territorial Reading` plus `Sui Conquers Chen`.
- Mobile 390x844 Chinese verification passed with 626/91 counts, `zh-CN`, v128 assets, no document-width overflow, no hidden focusable controls, and the early Goryeo Chinese territory note exposed through tooltip focus ownership.
- Temporary local server and headless Chrome validation session were stopped; ports 8765 and 9231 had no listeners, and curl to both ports exited 7.

## v129 East Asia Modern Territorial-Richness Audit
- Current v128 East Asia still has broad non-overlapping rectangles that overstate territorial uniformity: `qing` spans China North + China South + Mongolia from 1644-1912, `roc` spans North + South China from 1912-1949, and Taiwan is absent as its own lane even though it has Dutch, Zheng/Tungning, Qing, Japanese, and ROC phases.
- Reference direction: Britannica's Qing pages say Qing was established in Manchuria in 1636, seized Beijing in 1644, and expanded greatly later; after 1683 Taiwan became part of the empire, and frontier expansion continued into Mongolia/Dzungaria/Xinjiang. A 1644-1912 width-3 rectangle incorrectly backfills Taiwan and the Mongolian frontier into the first Beijing phase.
- Reference direction: Britannica's Mongolia material places northern Mongolia under Qing from 1691 and says widespread unrest in 1911 led the Bogd Khan to declare independence, while the Qing emperor abdicated in 1912. The Mongolia lane should separate early Inner/Chahar submission, Khalkha/Outer Mongol autonomy before 1691, Qing Mongolia, and the 1911/12 break.
- Reference direction: Britannica's Taiwan history places Dutch control in the 1620s-1662, Zheng/Koxinga control from 1662, Qing invasion and takeover in 1683, cession to Japan in the 1895 Treaty of Shimonoseki, handover to Chiang's Nationalist government in 1945, and the Nationalist flight to Taiwan in 1949. Taiwan needs its own island lane rather than being hidden inside Qing/ROC/PRC mainland rectangles.
- Reference direction: Britannica's warlord, Nationalist, Second Sino-Japanese War, and Chinese Civil War material says China fragmented after Yuan Shikai's 1916 death, the Nationalist government still faced separatist provincial power after 1928, the 1937-45 war left China effectively divided among Nationalist, Communist, and Japanese-occupied regions, and civil war resumed through 1949. The `roc` block should be split into early republic, warlord, Nationalist, wartime, and civil-war fragments instead of one uniform 1912-1949 rectangle.
- Source pages checked: Britannica Qing dynasty, Britannica China / Qing empire, Britannica China / early Qing, Britannica Mongolia, Britannica Mongolia independence/revolution, Britannica Taiwan history, Britannica Zheng Jing, Britannica Warlord, Britannica China / Nationalist government 1928-1937, Britannica Second Sino-Japanese War, Britannica Chinese Civil War, Britannica Nationalist Party, and Britannica Chiang Kai-shek.

## v129 East Asia Modern Territorial-Richness Fix
- Split Qing into `qing_beijing` for the 1644 Beijing core, `southern_ming` and `qing_south_campaigns` for the contested southern transition, and `qing` for post-1683 consolidated China proper; Mongolia and Taiwan are no longer hidden under the same Qing rectangle.
- Split the Mongolia lane into early `qing_mongolia`, autonomous `khalkha_mongols`, post-1691 `qing_mongolia_full`, `mongolia_bogd`, and post-1924 modern Mongolia.
- Added a Taiwan island lane with `taiwan_indigenous`, `dutch_taiwan`, `tungning`, `qing_taiwan`, `japanese_taiwan`, and `roc_taiwan` phases.
- Split ROC-era China into `roc`, `warlord_north`, `warlord_south`, `roc_nanjing`, `roc_wartime`, `japanese_occupied_china`, `roc_postwar`, `ccp_liberated_areas`, `prc`, and `roc_taiwan`, so warlord fragmentation, Japanese occupation, civil-war geography, mainland PRC, and Taiwan continuity are visually distinct.
- Added modern East Asia transition/conquest connections for Qing entering Beijing, Qing/Southern Ming, Koxinga/Dutch Taiwan, Qing/Tungning Taiwan, Khalkha submission, Shimonoseki/Taiwan, Mongolian independence, Xinhai Revolution, Northern Expedition consolidation, the Second Sino-Japanese War, Japanese invasion, Taiwan's 1945 transfer, PRC mainland founding, and Nationalist retreat to Taiwan.
- Updated descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, task plan notes, and static asset references to `v129`.

## v129 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static stale-reference scan confirmed no `v128` asset references remain in `index.html`, `README.md`, or `app.js`; `index.html` uses `styles.css?v=129`, `print.css?v=129`, and `app.js?v=129`.
- Data integrity script: 645 unique entities, 108 connection records, 0 duplicate IDs, 0 missing connection endpoints, all required v129 entities present, and East Asia `slotEnd` is 7.
- Region overlap scan: East Asia, Europe, Middle East, South Asia, Central Asia, Africa, Americas, and Southeast Asia all remain at 0 sampled slot overlaps.
- Headless Chrome via CDP desktop verification: `?year=1945&x=0.08&zoom=8&cache=v129-eastasia` rendered 645 polity blocks, 91 world-event markers, and 108 connection paths with `v129` assets and no console/runtime errors.
- Desktop geometry assertions passed for Qing Beijing/Southern Ming/Qing southern campaigns/consolidated Qing, Qing Mongolia/Khalkha/Bogd/modern Mongolia, early ROC/warlord/Nanjing/wartime/civil-war China, and the full Taiwan sequence.
- Polygon assertions passed for the new tapered Qing, Mongolia, ROC, wartime occupation, CCP liberated area, Tungning, Qing Taiwan, Japanese Taiwan, and ROC Taiwan fragments; tooltip verification passed for `roc_taiwan`, including `aria-describedby`, and detail-panel verification passed for `japanese_occupied_china` with `Territorial Reading` plus wartime connections.
- Mobile 390x844 Chinese verification passed with 645/91/108 counts, `zh-CN`, v129 assets, no document-width overflow, no hidden focusable controls, postwar ROC/CCP side-by-side geometry, Taiwan sequence geometry, and the ROC Taiwan Chinese territory note exposed through tooltip focus ownership.
- Temporary local server and headless Chrome validation session were stopped; ports 8765 and 9231 had no listeners, and curl to 8765 exited 7.

## v130 East Asia Japan-Manchuria-Korea Territorial-Richness Audit
- Current v129 data scan: 645 entities, 108 connection records, 0 missing connection endpoints. Modern East Asia still has a broad `taisho_showa` block from 1912-1989 marked as `empire`, which conflates Taisho Japan, militarist/imperial Showa Japan, the 1945 surrender, Allied occupation, and post-occupation constitutional Japan.
- The current East Asia layout has no Manchuria/Northeast lane. As a result, Qing Manchuria, Zhang/Fengtian rule, Japanese conquest of Manchuria, Manchukuo, Soviet entry, and the Communist/Nationalist race for Manchuria are partly hidden inside broad China or Japan fragments.
- Reference direction: Britannica says Qing was established by the Manchus in Manchuria in 1636 and became the imperial dynasty of all China only after 1644; the early Qing page places the Manchu homeland in southern Manchuria, has Nurhachi proclaim Later Jin in 1616, and says Abahai adopted the Qing dynastic name in 1636.
- Reference direction: Britannica's Zhang Zuolin and Zhang Xueliang pages support a Manchurian warlord/Northeast Army lane: Zhang Zuolin dominated Manchuria and parts of North China from 1913-1928; after his 1928 murder, Zhang Xueliang assumed control of Manchuria, aligned with the Nanjing Nationalist government, and was then driven out when Japan occupied the region.
- Reference direction: Britannica's Nationalist-government page says Japan's Kwantung Army used the Mukden Incident in September 1931 to compel Japanese power in Manchuria, leading to conquest and creation of Manchukuo; Britannica's Manchukuo page says Japan created an excuse in 1931 and proclaimed Manchukuo in 1932 as an "independent" state actually controlled by Japan.
- Reference direction: Britannica's Japan and Hirohito pages support splitting the Japan lane: Hirohito became emperor in 1926 and was associated with Japan's militaristic period until 1945; Japan surrendered in August/September 1945; Allied occupation lasted 1945-1952; the 1947 constitution made Japan a constitutional monarchy.
- Reference direction: Britannica and the U.S. Office of the Historian support splitting Korea after Japanese rule: Japan annexed Korea in 1910 and ruled until defeat in 1945; the United States and Soviet Union divided Korea at the 38th parallel to oversee removal of Japanese forces; the Republic of Korea and the DPRK were established in 1948.
- Source pages checked: Britannica Qing dynasty, Britannica History of China / early Qing, Britannica Zhang Zuolin, Britannica Zhang Xueliang, Britannica China / Nationalist government from 1928 to 1937, Britannica Manchukuo, U.S. Office of the Historian Mukden Incident, Britannica Hirohito, Britannica Japan / World War II and defeat, Britannica Occupation of Japan, Britannica Korea Under Japanese Rule, Britannica Korean War, Britannica history of South Korea, Britannica history of North Korea, and U.S. Office of the Historian Korean War and Japan's Recovery.

## v130 East Asia Japan-Manchuria-Korea Territorial-Richness Fix
- Added a dedicated Manchuria/Northeast slot and shifted Mongolia, Korea, Japan, Vietnam, and Taiwan right by one lane; East Asia `slotEnd` is now 8.
- Added `later_jin_manchu`, `qing_manchuria`, `roc_manchuria`, `fengtian_manchuria`, `northeast_army_manchuria`, `japanese_manchuria`, `manchukuo`, `soviet_manchuria`, and `northeast_liberated_area` so Manchuria is no longer hidden under broad China/Japan rectangles.
- Replaced the broad `taisho_showa` block with `taisho_japan`, `showa_imperial_japan`, `allied_occupation_japan`, and `postwar_showa_japan`; kept `heisei` as post-1989 constitutional Japan.
- Added `korea_liberation_occupation` between Japanese Korea and the 1948 South/North Korea split.
- Updated PRC width to include the Northeast lane while keeping Mongolia and Taiwan separate; updated ROC/Nanjing, Japanese-occupied China, and CCP liberated area notes to point readers to the separate Manchuria lane.
- Added 10 modern East Asia transition/conquest connections for Japan annexing Korea, the Mukden Incident, Manchukuo proclamation, Soviet invasion of Manchuria, Japan's surrender, Korea's liberation/division, Northeast base areas, ROK founding, DPRK founding, and the end of the Allied occupation; retargeted the existing Japan-invades-China connection from the old Taisho/Showa block to imperial Showa Japan.
- Updated descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, task plan notes, and static asset references to `v130`.

## v130 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static stale-reference scan confirmed no `v129` or `?v=129` references remain in `index.html`, `README.md`, or `app.js`; `index.html` uses `styles.css?v=130`, `print.css?v=130`, and `app.js?v=130`.
- Data integrity script: 658 unique entities, 118 connection records, 0 duplicate IDs, 0 missing connection endpoints, all required v130 entities present, no stale `taisho_showa` connections, East Asia `slotEnd` is 8, and all-region sampled slot-overlap scan is 0.
- Headless Chrome via CDP desktop verification: `?year=1945&x=0.08&zoom=8&cache=v130-eastasia` rendered 658 polity blocks, 91 world-event markers, and 118 connection paths with `v130` assets and no console/runtime errors.
- Desktop geometry assertions passed for the full Manchuria sequence, PRC stopping before the Mongolia lane, Japanese Korea -> liberation/occupation -> South/North Korea, and Taisho -> imperial Showa -> Allied occupation -> postwar Showa -> Heisei.
- Polygon assertions passed for Qing Manchuria, Japanese Manchuria, Manchukuo, Soviet Manchuria, Northeast Liberated Area, imperial Showa Japan, Allied occupation, postwar Showa, and Korea liberation/occupation; tooltip verification passed for `manchukuo`, including `aria-describedby`, and detail-panel verification passed for `allied_occupation_japan` with `Territorial Reading` plus Japan surrender / occupation-end connections.
- Mobile 390x844 Chinese verification passed with 658/91/118 counts, `zh-CN`, v130 assets, no document-width overflow, no hidden focusable controls, Korea split geometry, and the Korean liberation/occupation Chinese territory note exposed through tooltip focus ownership.
- Temporary local server and headless Chrome validation session were stopped; ports 8765 and 9231 had no listeners, and curl to both ports exited 7.

## v131 South Asia Colonial / Partition Audit
- Current v130 South Asia still has two broad non-overlapping rectangles that overstate territorial uniformity: `mughal_max` spans all mainland South Asia from 1687-1707, and `british_raj` spans all mainland South Asia from 1857-1947.
- Reference direction: Britannica's Aurangzeb material says Mughal territory reached its greatest extent under Aurangzeb, but that his Deccan wars and policies helped lead to dissolution. The peak should therefore be shown as a northern imperial core plus Deccan, Bengal, and northwest fragments, not as one uniform all-mainland block.
- Reference direction: Britannica's Maratha Wars page dates the third war to 1817-1818 and says defeat led to annexation of the peshwa's territories, completing British supremacy in India. This supports a dated British south/Deccan transition around 1818.
- Reference direction: Britannica's Sikh Wars page says the 1848-1849 second Sikh War led to British conquest and annexation of Punjab. This supports a dated British northwest transition in 1849.
- Reference direction: Britannica's Battle of Plassey page says the East India Company's 1757 victory over Bengal's nawab transformed it into a military and political power in India. The Plassey connection should target Bengal/Nawab and Company/British Bengal semantics rather than the nominal Mughal rump.
- Reference direction: Britannica's British Raj page dates direct British rule to 1858-1947, after the 1857 sepoy mutiny and East India Company rule. Britannica's princely-state page says British-controlled India was divided into directly administered provinces and nominally autonomous princely states under indirect rule; the Raj should be split into direct provinces and princely-state/paramountcy fragments.
- Reference direction: Britannica's Partition of India page says British India was divided into India and Pakistan under the Indian Independence Act in 1947. The South Asia grid should connect north/south India, Pakistan, and East Pakistan/Bangladesh to their separate colonial predecessor lanes rather than letting one Raj rectangle hide the partition geography.
- Reference direction: Britannica's Bangladesh material supports East Pakistan as the 1947-1971 Pakistani period before independent Bangladesh in 1971; Britannica's Sri Lanka history page dates actual Ceylon independence to February 4, 1948.
- Source pages checked: Britannica Aurangzeb, British Raj, Princely State, Battle of Plassey, Maratha Wars, Sikh Wars, Partition of India, Bangladesh Pakistani period, and Sri Lanka Independent Ceylon.

## v131 South Asia Colonial / Partition Fix
- Split `mughal_max` from a width-4 all-mainland block into a North Indian core plus `mughal_deccan`, `mughal_bengal_late`, and `mughal_nw_max`; the Deccan, Bengal, and northwest now remain readable at the 1687-1707 peak.
- Extended the Company-rule transition lanes to 1858 and split the British Raj from a width-4 block into `british_raj`, `raj_south_provinces`, `raj_princely_states`, `raj_bengal`, and `raj_punjab_nw`.
- Retargeted the Plassey connection to `british_bengal -> bengal_nawabs` and added dated transition edges for Aurangzeb's Deccan annexations, Mughal decline, Bengal nawab autonomy, Third Anglo-Maratha War, Sikh/Punjab annexation, Crown rule, partition, East Pakistan, Ceylon independence, and Bangladesh.
- Updated descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, task plan notes, and static asset references to `v131`.

## v131 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static asset scan confirmed no stale `?v=130` or `v=130` asset references remain in `index.html`, `README.md`, `app.js`, or `task_plan.md`; `index.html` uses `styles.css?v=131`, `print.css?v=131`, and `app.js?v=131`.
- Data integrity script: 665 unique entities, 133 connection records, 0 duplicate IDs, 0 missing connection endpoints, all required v131 entities present, and all-region sampled slot-overlap scan remains 0.
- Remaining broad-rectangle audit candidates are now `eastAsia.prc`, `middleEast.umayyad_west`, `middleEast.ottoman_west`, and `centralAsia.soviet_ca`.
- Headless Chrome via CDP desktop verification passed with 665 polity blocks, 91 world-event markers, 133 connection paths, v131 assets, and no page console/runtime errors.
- Desktop geometry assertions passed for the Mughal maximum core/Deccan/Bengal/NW split, British Raj core/south-province/princely-state/Bengal/Punjab split, and 1947 India/East Pakistan/Pakistan/Sri Lanka lanes.
- Tooltip and detail-panel verification passed for `raj_princely_states`, including the English territory note, keyboard-focus `aria-describedby`, `Territorial Reading`, and the `Crown Paramountcy over Princely States` connection.
- Mobile 390x844 Chinese verification passed with 665/91/133 counts, `zh-CN`, no document-width overflow, no hidden focusable controls, Raj fragment geometry intact, and the Chinese princely-state territory note exposed via keyboard focus.
- Temporary local server and headless Chrome validation sessions were stopped; ports 8765 and 9231 had no listeners, and curl to both ports exited 7.

## v132 Ottoman Western / Arabia Audit
- Current v131 Middle East still has a broad `ottoman_west` rectangle from 1517-1867 spanning Anatolia, Egypt, the Levant, and Arabia. It hides several different control types: direct Anatolian imperial core, Ottoman Egypt, Syria/Palestine, Ottoman suzerainty over the Hejaz, and Arabian interior polities.
- Reference direction: Britannica's Selim I and Egypt/Ottoman pages place Selim's defeat of the Mamluks at Marj Dabiq in 1516 and Raydaniyyah near Cairo in January 1517, bringing Syria, Palestine, and Egypt under Ottoman rule. These should be dated provincial fragments rather than one four-lane rectangle.
- Reference direction: Britannica's history of Arabia says Selim I proclaimed the Hejaz part of the Ottoman dominions in 1517, while the Sharif of Mecca was confirmed as lord of the Holy Cities subject to Ottoman overlordship. This supports drawing a narrowed Hejaz/suzerainty fragment rather than all-Arabia Ottoman direct control.
- Reference direction: Britannica's Egypt pages distinguish Ottoman Egypt from the 1798 French occupation, Muhammad Ali's 1805 viceroyalty, and the 1867 khedivate. Egypt should therefore break away from the old `ottoman_west` block before the existing `egypt_khedivate`.
- Reference direction: Britannica's Muhammad Ali page says the 1831-33 war gave him control of Syria as far north as Adana, and the 1840 intervention by European powers ended Egyptian rule in Syria. The Levant lane needs a short Egyptian occupation fragment instead of uninterrupted Ottoman Levant.
- Reference direction: Britannica's Battle of Al-Diriyyah page supports a First Saudi/Wahhabi state ending in 1818 under Egyptian forces of Muhammad Ali; Britannica's Ibn Saud page supports the 1932 unification of Najd and Hejaz into Saudi Arabia. The Arabia lane should show at least an interior Saudi trajectory beside Ottoman/Hashemite/Transjordan fragments.
- Source pages checked: Britannica Selim I, Britannica Egypt / The Ottomans 1517-1798, Britannica Egypt / Muhammad Ali and successors, Britannica Muhammad Ali, Britannica history of Arabia / Mamluk and Ottoman influence, Britannica Battle of Al-Diriyyah, Britannica Ibn Saud, and NZ History Arab Revolt 1916-18.

## v132 Ottoman Western / Arabia Fix
- Replaced the old broad `ottoman_west` rectangle with a one-lane Ottoman Anatolian/core block and separate Ottoman Egypt, French Egypt, restored Ottoman Egypt, Muhammad Ali Egypt, Ottoman Levant, Egyptian-occupied Levant, Ottoman Hejaz, Arabian interior, First/Second Saudi State, Rashidi Arabia, Saudi unification, and Hashemite Hejaz fragments.
- Narrowed the post-World War I mandate area into west-of-Jordan Palestine and east-of-Jordan Transjordan half-lanes so they no longer imply one undifferentiated mandate rectangle.
- Added 15 Middle East transition/conquest connections for the 1517 Ottoman conquest of Egypt/Syria/Hejaz overlordship, the Diriyah/Saudi sequence, French Egypt, Muhammad Ali, Egyptian Syria, restored Ottoman Syria, Egypt's khedivate transition, Rashidi dominance, Ibn Saud's Riyadh restoration, Arab Revolt/Hashemite Hejaz, and Saudi Arabia's 1932 proclamation.
- Updated descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, task plan notes, and static asset references to `v132`.

## v132 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static asset scan confirmed no stale `?v=131` or `v=131` asset references remain in `index.html`, `README.md`, `app.js`, or `task_plan.md`; `index.html` uses `styles.css?v=132`, `print.css?v=132`, and `app.js?v=132`.
- Data integrity script: 678 unique entities, 148 connection records, 0 duplicate IDs, 0 missing connection endpoints, all required v132 entities present, and all-region sampled slot-overlap scan remains 0.
- Remaining broad-rectangle audit candidates are now `eastAsia.prc`, `middleEast.umayyad_west`, and `centralAsia.soviet_ca`.
- Headless Chrome via CDP desktop verification passed with 678 blocks, 91 markers, 148 connection paths, v132 assets, Ottoman core/Egypt/Levant/Hejaz/Arabia split geometry, Egyptian Syria occupation geometry, mandate half-lanes, `egyptian_levant_occupation` tooltip territory note plus focus `aria-describedby`, and detail `Territorial Reading` plus Ottoman-Syria transition connections.
- Mobile 390x844 Chinese verification passed with 678/91/148 counts, `zh-CN`, no document-width overflow, no hidden focusable controls, v132 assets loaded, mandate / Hashemite / Saudi-unification geometry intact, and the Hashemite Hejaz Chinese territory note exposed via keyboard focus.
- Temporary local server and headless Chrome validation sessions were stopped; ports 8765 and 9231 had no listeners, and curl to both ports exited 7.

## v133 Umayyad West Audit
- Current v132 Middle East still has `umayyad_west` as one 661-750 width-3 rectangle spanning Egypt, the Levant, and Arabia, while `umayyad` is another 661-750 width-2 block spanning Iraq and Persia. This makes Damascus/Syria, Egypt, Iraq, Persia/Khorasan, and Arabia look like two uniform territorial slabs.
- Reference direction: Britannica's Umayyad dynasty page places the dynasty at Damascus from 661 until the Abbasid overthrow in 750, with Syrian army power and provincial administration central to the state. The Levant/Damascus core should therefore be explicit rather than hidden inside a western width-3 rectangle.
- Reference direction: Britannica's Umayyad material distinguishes expansion into Khorasan, Central Asia, Sindh, North Africa, and Spain. The Middle East chart should use separate provincial fragments for Iraq, Persia/Khorasan, Egypt, the Levant, and Arabia, while cross-region connections point to the dedicated Africa, Central Asia, and Europe lanes.
- Reference direction: Britannica's North Africa page says Egypt was conquered in 642, the Maghrib became a province of the Damascus-ruled Umayyad empire in 705, Carthage fell in 698, and Berber warriors participated in the 711 conquest of Spain. The 711 Iberia conquest should originate from the North Africa/Maghreb fragment, not from a generic Middle East block.
- Reference direction: Britannica's Spain / Al-Andalus pages and the Met Spanish Umayyads page describe 711-756 Muslim Spain as dependent on the Umayyad caliph in Damascus, then independent under Abd al-Rahman I in 756. The existing Europe `al_andalus` lane is acceptable as a broad European continuity block, but its first phase should be connected to Umayyad North Africa / Damascus dependency.
- Reference direction: Britannica's Abbasid caliphate page says the Abbasids overthrew the Umayyads in 750, drew support from Khorasan, moved the center east toward Baghdad, and were no longer coterminous with all Islam. This supports keeping Abbasid Baghdad/Persia/Egypt-Levant/Arabia as separate fragments instead of one successor rectangle.
- Source pages checked: Britannica Umayyad dynasty, Britannica Abd al-Malik, Britannica North Africa / Arab conquest to 1830, Britannica Spain / Muslim Spain, Britannica Al-Andalus, Britannica Battle of Tours, Britannica Abbasid caliphate, Britannica al-Mansur, and the Met Spanish Umayyads.

## v133 Umayyad West Fix
- Removed the old `umayyad_west` broad rectangle and repurposed `umayyad` as the Damascus / Syrian-Levantine core.
- Added Middle East fragments for `umayyad_iraq`, `umayyad_persia`, `umayyad_egypt`, and `umayyad_arabia`, all running 661-750 in their own territorial lanes.
- Enriched `umayyad_africa` as Umayyad Ifriqiya/Maghreb and documented `al_andalus` as dependent on the Damascus Umayyads before the 756 independent emirate phase.
- Retargeted the 720 Silk Road trade link to the Persian/Khorasan Umayyad fragment, retargeted the 711 Iberia conquest to `umayyad_africa -> visigothic`, and added key succession/conquest links for Umayyad provincial inheritance, Carthage, Al-Andalus dependency, and Abbasid replacement of the Umayyad provinces.
- Updated descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, task plan notes, and static asset references to `v133`.

## v133 Verification
- `node --check app.js`: passed.
- `git diff --check`: passed.
- Static asset scan confirmed no stale `?v=132` or `v=132` asset references remain in `index.html`, `README.md`, `app.js`, or `task_plan.md`; `index.html` uses `styles.css?v=133`, `print.css?v=133`, and `app.js?v=133`.
- Data integrity script: 681 unique entities, 157 connection records, 0 duplicate IDs, 0 missing connection endpoints, all required v133 entities present, no stale `umayyad_west` block or connection, and all-region sampled slot-overlap scan remains 0.
- Remaining broad-rectangle audit candidates are now `eastAsia.prc` and `centralAsia.soviet_ca`.
- Headless Chrome via CDP desktop verification passed with 681 blocks, 91 markers, 157 connection paths, v133 assets, side-by-side Umayyad Iraq / Persia-Khorasan / Egypt / Damascus / Arabia geometry, Umayyad Ifriqiya / Visigothic / Al-Andalus geometry, and the Carthage / Iberia / Al-Andalus dependency connections present.
- Tooltip and detail-panel verification passed for `umayyad_egypt`, including the English territory note, keyboard-focus `aria-describedby`, `Territorial Reading`, `Umayyad Egypt Province`, and `Abbasid Western Provinces`.
- Mobile 390x844 Chinese verification passed with 681/91/157 counts, `zh-CN`, no document-width overflow, no hidden focusable controls, v133 assets loaded, Umayyad split geometry intact, and the Chinese Umayyad Arabia territory note exposed via keyboard focus.
- Temporary local server and headless Chrome validation sessions were stopped; ports 8765 and 9231 had no listeners, and curl to both ports exited 7.

## v134 Soviet Central Asia Audit
- Current v133 Central Asia still has `soviet_ca` as one 1920-1991 width-4 rectangle spanning Transoxiana/Uzbekistan, Turkmenistan/Khiva, Kazakhstan steppe, and Tajikistan/Kyrgyzstan. This hides the 1920-24 revolutionary transition and the later five-republic Soviet national delimitation.
- Reference direction: Britannica's Central Asia Soviet-rule page says Red Army forces extinguished Khiva in 1919 and Bukhara in 1920, then fought Basmachi resistance until 1925. A short transition should be shown rather than immediately treating all four lanes as one stable Soviet republic system in 1920.
- Reference direction: Britannica states that the Soviets ultimately created five Central Asian socialist republics: Uzbek SSR and Turkmen SSR in 1924, Tajik SSR in 1929, and Kazakh SSR and Kirgiz SSR in 1936. The visualization should therefore replace the broad `soviet_ca` band with republic-level fragments.
- Reference direction: Britannica's Uzbekistan page says the 1924-25 map was redrawn on a monoethnic principle, Uzbekistan arose as an ethnically designated territory, and Uzbekistan became a formal constituent republic of the USSR. It also notes Bukhara and Khiva were deposed in 1920 and communist-dominated politicians held power by late 1921.
- Reference direction: Britannica's Kazakhstan history page dates the Soviet Kirgiz/Kazakh autonomous republic to August 26, 1920, the 1925 renaming to Kazakh ASSR, and full union-republic status to December 5, 1936, with collectivization and the Virgin Lands program as major Soviet-era transformations.
- Reference direction: Britannica's Kyrgyzstan history page dates the autonomous Kirgiz oblast to 1924, autonomous republic status to 1926, and full Kirgiz SSR union-republic status to 1936; Britannica's Tajikistan page dates Tajikistan as a union republic from 1929 to 1991; Britannica's Turkmenistan page dates the Turkmen SSR from 1925/1924-era Soviet formation to 1991 independence.
- Source pages checked: Britannica History of Central Asia / Soviet rule, Britannica Soviet Union role in modern Central Asia, Britannica Kazakhstan history, Britannica Uzbekistan / Russian and Soviet rule, Britannica Kyrgyzstan history, Britannica Tajikistan, Britannica Turkmenistan, and Britannica main countries of Central Asia.

## v134 Soviet Central Asia Fix
- Removed the broad `centralAsia.soviet_ca` 1920-1991 width-4 rectangle and the post-1991 `tajik_kyrgyz` combined lane.
- Added 1920-24 transitional fragments for the Bukharan PSR, Khorezm PSR, Kazakh ASSR early phase, and Turkestan Soviet transition; added separate Uzbek SSR, Turkmen SSR, Kazakh SSR, Tajik ASSR/SSR, and Kyrgyz Soviet/SSR lanes; split post-1991 Tajikistan and Kyrgyzstan into adjacent half-lanes.
- Added 16 transition/independence connections covering Bukhara/Khorezm overthrow, 1924 delimitation, Tajik 1929 elevation, Kazakh/Kirgiz 1936 union-republic elevation, and all five 1991 independence transitions.
- Added descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, task-plan notes, and static asset references to `v134`.

## v134 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and current-file stale scan found no `v=133`, `soviet_ca`, or `tajik_kyrgyz` in `app.js`, `index.html`, `README.md`, or `task_plan.md`.
- Data integrity script passed with 692 unique entities, 173 connection records, 0 duplicate IDs, 0 missing connection endpoints, all required v134 Central Asia entities present, all required metadata present, no stale runtime `soviet_ca` or `tajik_kyrgyz`, and 0 sampled slot overlaps across all regions.
- In-app Browser rejected the local URL under Browser Use policy, so no Chrome/CDP workaround was used. HTTP server availability was verified with `curl -I` returning 200 for `http://127.0.0.1:8765/index.html`.
- In-memory DOM execution of the app render path passed: `renderTimeline()` produced 692 dynasty blocks and 173 connection paths, all v134 Soviet Central Asia fragments were present, stale IDs were absent, Tajik/Kyrgyz half-lanes were side-by-side in 1924, 1936, and 1991 phases, and `showDetail(tajik_ssr)` produced `Territorial Reading`, `Tajik SSR Elevated`, `Tajikistan Independence`, and the Tajik SSR wiki link.
- Remaining broad-rectangle audit candidate is now `eastAsia.prc`.

## v135 Orthogonal Shape Semantics
- User feedback: clipped trapezoids and hourglass silhouettes imply sloping map boundaries and create blank cutouts, which can be misread as land with no owner.
- Design conclusion: the chart should not visually remove area from an entity block. Blank grid space should mean "not represented by this tracked polity/lane at this resolution," not a positive claim that land was ownerless.
- Fix direction: keep every polity block's full rectangular fill and move partial-control / transition semantics into internal orthogonal guide lines. The shape marker becomes an annotation, not a clipped territory silhouette.
- This supersedes earlier v118-v134 verification notes that treated active `clip-path: polygon(...)` as the desired state.

## v136 Tetris-Like Polygon Semantics
- User clarification: the desired form is not a rectangle and not a trapezoid; it should be a true polygon with only horizontal and vertical edges, like a Tetris piece or the shape of "凸".
- Revised design conclusion: area can be clipped, but only with orthogonal step geometry. This lets the silhouette itself show expansion/contraction/transition while avoiding diagonal borders that look like map slopes.
- Superseded v136 assumption: blank cutouts were treated as outside the modeled polity fragment rather than ownerless land. v137 replaces that with ownership-conserving notch filling or no clipping.
- v136 therefore replaces v135's internal guide-line compromise with `clip-path: polygon(...)` values whose consecutive points form only horizontal or vertical segments.

## v136 Verification
- CSS shape scan found 3 active polygon rules and 0 diagonal segments across `shape-taper-right`, `shape-taper-left`, and `shape-hourglass`.
- Active-source stale scan found no `clip-path: none` and no stale `v=135` asset reference in runtime source files.
- Data integrity remains stable at 692 unique entities, 173 connections, 0 duplicate IDs, 0 missing endpoints, and 0 sampled slot overlaps.

## v137 Ownership-Conserving Polygon Semantics
- User correction: the chart should not leave blank cutouts and explain them away. If one polity loses territory, another polity or force should occupy that piece, like interlocking Tetris shapes.
- Revised rule: a shape notch is not a standalone visual flourish. The renderer must find an adjacent same-region entity touching the missing side and overlapping the notch's time window. If it cannot, the original block remains whole.
- When the rule succeeds, the notch is filled with the adjacent owner's pale color, so the visible shape says "this piece changed hands" rather than "this piece became empty."
- This supersedes v136's statement that blank cutouts can mean outside the modeled polity fragment. The preferred representation is now ownership-conserving: missing pieces should be modeled or visually suppressed, not shown as empty land.

## v138 Remote / Non-Contiguous Notch Owners
- User refinement: because the chart is an abstraction, a real neighbor may not be visually adjacent in the simplified lane system. The model should allow a polity/force to occupy several non-contiguous pieces, similar to enclaves or remote fragments.
- Design rule: implicit owner filling still requires adjacent overlap, but explicit `notchOwners` can name same-region remote entities that fill a notch. This is used only for high-confidence cases; ambiguous cases remain unclipped.
- Explicit owners can be a single entity or a sequence. Sequences are rendered as stacked fill segments inside the same orthogonal notch, so a long missing side can show a succession of owners instead of one misleading color.
- Initial v138 annotations target clear high-value cases: Qing Beijing's unabsorbed Taiwan/Tungning endpoint, Nanjing government's Manchuria/Northeast exception, and Ottoman Hejaz versus the Arabian interior / Saudi / Rashidi sequence.
- Guardrail: explicit owner sequences must cover at least 82% of the notch window and represent at least 98% after closing only small modeling gaps; otherwise the notch is suppressed rather than leaving blank space or inventing ownership.

## v138 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active-source stale scan found no stale `v=135`/`v=137`, no obsolete blank-cutout wording, and no `clip-path: none` in runtime files.
- Data integrity remains stable at 692 entities, 173 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 slot overlaps, and 0 invalid `notchOwners` references.
- Ownership simulation: 164 raw shape markers produce 138 clipped interlocking shapes and 157 fill pieces. Of those, 9 fill pieces come from explicit remote owners; 26 ambiguous/orphan shapes remain safely suppressed.
- Required explicit remote cases passed: `qing_beijing` fills from `tungning`; `roc_nanjing` fills from `northeast_army_manchuria`, `japanese_manchuria`, and `manchukuo`; `ottoman_hejaz` fills from `arabia_interior`, `first_saudi_state`, `second_saudi_state`, `rashidi_arabia`, and `saudi_unification`.

## v139 East Asia PRC / Western Frontier Audit
- The remaining high-impact East Asia rectangle was `eastAsia.prc`: v138 still drew the post-1949 mainland PRC as one `width: 3` block that hid the Northeast/Manchuria continuation and omitted Tibet/Xinjiang as visible western frontier fragments.
- Source direction checked: Britannica supports the 1949 PRC foundation context, Tibet's pre-1951 government / 1965 autonomous-region designation, Xinjiang's Qing province in 1884 / 1949 transition / 1955 autonomous-region establishment, and the 1997/1999 Hong Kong/Macau handovers.
- Design conclusion: because the chart abstracts away many real neighboring entities, a broad owner-conserving model should allow non-contiguous same-owner fragments. This is better than either a single rectangle or a polygon notch whose owner is hidden by the simplified lane model.
- Implemented v139 data direction: `prc` now means PRC China Proper (`width: 2`), `prc_northeast` keeps the post-1949 Northeast visible, and a new western frontier slot carries Tibet and Xinjiang predecessor / transition / autonomous-region phases.
- Added western frontier predecessors to avoid an abrupt modern-only lane: Tibet under Manchu overlordship -> Lhasa Government -> PRC Tibet transition -> Tibet Autonomous Region; Dzungar Khanate -> Qing Xinjiang frontier -> Qing Xinjiang province -> Republican Xinjiang -> PRC Xinjiang province -> Xinjiang Uygur Autonomous Region.
- Added transition/conquest connections for Qing Xinjiang control, 1884 Xinjiang province creation, 1912 Tibet/Xinjiang succession, 1949 PRC China-proper / Northeast / Xinjiang transitions, 1951 Tibet transition, 1955 Xinjiang Uygur AR, and 1965 Tibet AR.
- Added explicit western-frontier notch owners for Qing Mongolia and Bogd Khanate Mongolia, so their left-side notches split across Dzungar / Qing Xinjiang and late-Qing / Republican Xinjiang segments rather than being filled by one over-broad adjacent owner.

## v139 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, asset-reference scan with `index.html` on `v139`, and CSS orthogonality scan with 3 active polygon rules and 0 diagonal segments.
- Data integrity passed with 703 entities, 182 connections, 0 duplicate IDs, 0 missing connection endpoints, all required v139 PRC/Tibet/Xinjiang fragments present, all required descriptions/details/capitals present, 0 invalid `notchOwners`, 0 sampled slot overlaps, and East Asia `slotEnd` / max-right both at 9.
- Ownership simulation passed with 164 raw shape markers, 137 clipped interlocking shapes, 158 owner fill pieces, 13 explicit remote/multi-owner fill pieces, and 27 ambiguous/orphan shapes safely suppressed.
- Required explicit owner cases now include `qing_beijing -> tungning`, `roc_nanjing -> northeast_army_manchuria / japanese_manchuria / manchukuo`, `qing_mongolia_full -> dzungar_khanate / qing_xinjiang_frontier`, `mongolia_bogd -> qing_xinjiang_province / xinjiang_republican_province`, and `ottoman_hejaz -> arabia_interior / first_saudi_state / second_saudi_state / rashidi_arabia / saudi_unification`.

## v140 Ancient / Medieval Central Asia Audit
- The next broad-block audit found Central Asia's early and medieval sequence still had many width-2 blocks with little territorial explanation: `bmac`, `sogdiana_early`, `persian_ca`, `persian_ca_south`, `greco_bactria`, `greco_bactria_south`, `kushan_ca`, `kushan_ca_south`, `abbasid_ca`, `seljuk_ca`, `seljuk_ca_south`, `chagatai`, and Timurid fragments.
- Source direction checked: BMAC/Oxus sources place the archaeological complex around southern Central Asia and Bactria-Margiana oases; Britannica places Sogdiana around the Zeravshan valley and notes Achaemenid rule, Alexander, and Saka/Yuezhi pressure; Britannica places Bactria between the Hindu Kush and Amu Darya/Oxus; Britannica describes the Kushans as Yuezhi-descended rulers over northern India, Afghanistan, and Central Asia; Britannica describes Chagatai dominance in the Syr Darya/Oxus/Kabul-mountain zone and the Golden Horde as a steppe power; Britannica Samarkand supports the Timurid/Samarkand cultural framing.
- Design conclusion: do not add more blank cutouts. These blocks should use the existing ownership-conserving notch model, with adjacent steppe/oasis owners or explicit multi-owner sequences when the simplified lane model hides a real succession.
- Implemented v140 data direction: early Central Asia now distinguishes Bronze Age oasis networks, Sogdian oasis corridors, Achaemenid northern/southern satrapal projections, Greco-Bactrian Oxus/southern routes, Kushan Bactria/Gandhara, Kidarite Bactria/Gandhara, Abbasid Transoxiana, Qara-Khanid Transoxiana, Seljuk Khorasan / Afghan routes, Mongol conquest shock, Chagatai Transoxiana/southern routes, Golden Horde steppe, and Timurid Transoxiana/Herat.
- Explicit notch-owner sequences were added for multi-phase edges: `sogdiana_early -> kazakh_bronze / scythians`, `greco_bactria -> scythians / yuezhi`, `greco_bactria_south -> scythians / yuezhi`, and `timurid -> golden_horde / kazakh_khanate`.
- Added 9 Central Asia transition/conquest links covering Achaemenid satrapies, Hellenistic Bactria, Yuezhi-Kushan transition, post-Kushan Kidarites, Abbasid Transoxiana, Seljuk Dandanaqan, Mongol invasion of Khwarazm, Chagatai ulus division, and Timur's takeover of Transoxiana.
- Added descriptions, detail metadata, capital coordinates, Wikipedia slug mappings, README territorial semantics copy, and asset references to `v140`.

## v140 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, active-source stale scan with no `v=139` runtime asset references, and CSS orthogonality scan with 3 active polygon rules and 0 diagonal segments.
- Data integrity passed with 703 entities, 191 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 sampled slot overlaps, all required v140 Central Asia entities present, all required descriptions/details/capitals/wiki mappings present, and 0 invalid `notchOwners`.
- Ownership simulation passed with 180 raw shape markers, 153 clipped interlocking shapes, 177 owner fill pieces, 20 explicit remote/multi-owner fill pieces, and the same 27 ambiguous shapes safely suppressed rather than clipped.
- Required v140 clipped-shape cases all passed: `bmac`, `sogdiana_early`, `persian_ca`, `persian_ca_south`, `greco_bactria`, `greco_bactria_south`, `kushan_ca`, `kidarites_south`, `abbasid_ca`, `qara_khanid`, `seljuk_ca`, `seljuk_ca_south`, `chagatai`, `chagatai_south`, `timurid`, and `timurid_south`.
- Headless Chrome `file://` DOM smoke check returned 703 rendered dynasty blocks and 177 territory fill pieces, with all sampled v140 Central Asia IDs present. The one-shot Chrome run had to be terminated after dumping DOM, so stderr included expected GPU/network termination noise; no matching Chrome process remained afterward.

## v141 Region Slot Boundary Audit
- Layout audit found that `slotEnd` is used as the region's right boundary / occupied slot count: render width uses `region.slotEnd * baseColumnWidth`, while region offsets add `slotEnd + 1` to leave an inter-region gap.
- Three regions still had entities extending beyond their declared right boundary: `africa.swahili_coast` at `slot 6 + width 1`, four Americas Caribbean entities at `slot 6 + width 1`, and Southeast Asia `champa` / `dai_viet` at `slot 6 / 6.5`.
- Design risk: those right-edge lanes could visually intrude into the gap or next region, and the region header width understated the actual visible data. This is a visual polish issue even when overlap checks are zero.
- Implemented v141 fix: added an explicit comment documenting the `slotEnd` invariant, set Africa / Americas / Southeast Asia `slotEnd` to 7, and kept Middle East at 6 after catching and correcting an initial broad replacement mistake.
- Static asset references were bumped to `v141`.

## v141 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan shows `index.html` loading `styles.css?v=141`, `print.css?v=141`, and `app.js?v=141`.
- Data layout integrity passed with 703 entities, 191 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 out-of-bounds entities, and 0 sampled slot overlaps.
- Region boundaries now match actual maxima: East Asia 9/9, Europe 8/8, Middle East 6/6, South Asia 5/5, Central Asia 5/5, Africa 7/7, Americas 7/7, and Southeast Asia 7/7.
- CSS polygon orthogonality still passes with 3 active polygon rules and 0 diagonal segments.
- Headless Chrome `file://` DOM smoke check loaded `v141` assets and rendered 703 dynasty blocks, 177 territory fill pieces, and 8 region headers; all affected right-edge entities (`swahili_coast`, Caribbean entities, `champa`, `dai_viet`) were present. The Chrome command timed out after producing DOM output, and cleanup confirmed no matching profile process remained.

## v142 Southeast Asia Funan / Early Mainland Audit
- User refinement accepted: because the simplified lane model hides many real neighbors, the same polity can be represented by several non-contiguous blocks when that improves territorial precision. This should be used sparingly for high-confidence cases rather than as a general excuse to fragment every state.
- Metadata audit found Southeast Asia still had high-value early gaps: `funan`, `chenla`, `dvaravati`, `pyu`, `tarumanagara`, and `barangays` had little or no detail compared with their historical importance.
- Source direction checked: Wikipedia describes Funan as an early Indianized / mandala-style Southeast Asian network; Britannica's Cambodia history notes Chenla and the Land/Water Chenla problem; Britannica's Thailand Mon-Khmer page identifies Dvaravati as Mon kingdoms known for Buddhist art; Britannica's Myanmar / Pyu pages place Pyu city-kingdoms in the 1st millennium on China-India routes; Britannica covers Champa's central/southern Vietnam coastal kingdom; Britannica describes barangays as datu-led early Filipino settlements and Tarumanegara as an early western Java kingdom.
- Implemented v142 data direction: `funan` is no longer one width-2 rectangle. It is split into `funan` (Funan Mekong Core, slot 2) and `funan_maritime` (Funan Maritime Network, slot 1), both same-color but separately labeled, described, and linked.
- Owner-conserving notch design: `funan` has a right notch explicitly filled by `thai_prehistoric`; `funan_maritime` has a left notch filled by a sequence of `indonesia_prehistoric` then `tarumanagara`. This applies the non-contiguous / multi-owner rule without producing blank cutouts.
- Added descriptions, detail metadata, capital coordinates, territory notes, and Wikipedia slugs for Funan core/network, Tarumanagara, Pyu, Chenla, Dvaravati, and Barangays; also added Funan network and Chenla succession links.
- Updated README territorial semantics copy and bumped active assets to `v142`.

## v142 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, active asset scan with `index.html` loading `styles.css?v=142`, `print.css?v=142`, and `app.js?v=142`, and CSS polygon orthogonality with 3 active polygon rules / 0 diagonal segments.
- Data integrity passed with 704 entities, 193 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 out-of-bounds entities, 0 slot overlaps, all v142 targets present, required descriptions/details/capitals present, and 0 invalid `notchOwners`.
- Ownership simulation passed with 182 raw shape markers, 155 clipped interlocking shapes, 180 owner fill pieces, 23 explicit owner fill pieces, and 27 ambiguous shapes still safely suppressed.
- Required v142 shape cases passed: `funan` renders as `shape-taper-right` with an explicit `thai_prehistoric` fill; `funan_maritime` renders as `shape-taper-left` with explicit `indonesia_prehistoric` and `tarumanagara` fill segments.
- Headless Chrome CDP `file://` smoke check loaded `v142`, rendered 704 dynasty blocks, 180 territory fill pieces, and 8 region headers; `funan` and `funan_maritime` were present with the expected shape classes, and Thai / Tarumanagara / Indonesian fill pieces were present. Cleanup confirmed no matching `history-visual-chrome-v142` process remained.

## v143 Africa Nile / Horn / Carthage Audit
- Post-v142 metadata audit showed Africa still had many high-value early and medieval gaps compared with recently enriched East Asia, Central Asia, and Southeast Asia regions.
- Selected target set: `kerma`, `egypt_nubia`, `dmt`, `pre_axum`, `meroe`, `carthage`, `roman_africa`, `bantu_expansion`, `nubia_christian`, `maghreb_sultanates`, and `ethiopia_sol`.
- Source direction checked: Britannica and ISAC support Kerma as early powerful Nubia around the third cataract; UNESCO supports Meroe as the later Kushite capital heartland; Britannica supports Carthage/Roman Africa succession and Ethiopian highland framing; Oxford Research Encyclopedia supports the Bantu expansion as migration/language-agriculture spread rather than a centralized state.
- Implemented v143 data direction: Nile, Horn, Carthage/Roman Africa, Maghreb, and Bantu-process lanes now have descriptions, detail metadata, centers, territory notes, Wikipedia slugs, and transition/conquest connections.
- Added seven owner-transition connections: Egyptian Nubia after Kerma, Pre-Axumite after D'mt, Meroe after Kush, Roman Africa after Carthage, Axum after Pre-Axumite, Christian Nubia after Meroe, and Solomonic Ethiopia after Zagwe.
- Updated README territorial semantics copy and bumped active assets to `v143`.

## v143 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=143`, `print.css?v=143`, and `app.js?v=143`.
- Data integrity passed with 704 entities, 200 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 out-of-bounds entities, 0 slot overlaps, all v143 target descriptions/details/capitals/territory notes present, and all seven v143 target connections present.
- CSS polygon orthogonality passed with 3 active polygon rules and 0 diagonal segments after correcting the checker to parse unitless `0` polygon coordinates.
- Ownership simulation passed with 182 raw shape markers, 155 clipped interlocking shapes, 180 owner fill pieces, 23 explicit owner fill pieces, and 27 ambiguous shapes still safely suppressed.
- Headless Chrome CDP `file://` smoke check loaded `v143`, rendered 704 dynasty blocks, 180 territory fill pieces, 8 region headers, and 201 connection paths; all 11 v143 Africa target blocks were present. Cleanup confirmed no matching `history-visual-chrome-v143` process remained.

## v144 Early Europe Audit
- Post-v143 metadata audit showed Europe had one of the largest remaining knowledge gaps: 62 missing descriptions, 67 missing detail entries, 74 missing capital/center entries, and 21 long-duration entities without descriptions.
- Selected target set: `aegean_early`, `minoan`, `mycenaean`, `greek_dark`, `greek_citystates`, `italic_early`, `etruscan`, `gallic_early`, `celtic_gaul`, `iberian_early`, `iberian_celtic`, `british_early`, and `celtic_britain`.
- Source direction checked: Britannica supports Minoan Crete / Knossos and Greek polis framing; Britannica / Met sources support Mycenaean Linear B and palace centers; Britannica and Met support Etruscan city-state civilization and Roman influence; Britannica supports Celtic / La Tene / Gaul framing and the Roman conquest of Gaul; Britannica supports Iberian and Celtiberian peninsula framing.
- Implemented v144 data direction: early Europe now distinguishes cultural horizons from polities. Cultural horizons are labeled as cultural owners, not states; Minoan, Mycenaean, Greek poleis, Etruscan city leagues, Celtic/Gallic polities, Celtiberian/Iberian polities, and Celtic Britain have richer details and transition lines.
- Added eight new transition/conquest links: Mycenaean Aegean ascendancy, Greek Bronze Age collapse, Etruscan urban Etruria, Archaic polis revival, Macedonian domination of Greece at Chaeronea, Roman Republic after Etruscan kings, Rome entering Iberia, and Roman foothold in southern Gaul.
- Updated README territorial semantics copy and bumped active assets to `v144`.

## v144 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=144`, `print.css?v=144`, and `app.js?v=144`.
- Data integrity passed with 704 entities, 208 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 out-of-bounds entities, 0 slot overlaps, all v144 target descriptions/details/capitals/territory notes present, and all v144 target connections present.
- CSS polygon orthogonality passed with 3 active polygon rules and 0 diagonal segments.
- Ownership simulation passed with 182 raw shape markers, 155 clipped interlocking shapes, 180 owner fill pieces, 23 explicit owner fill pieces, and 27 ambiguous shapes still safely suppressed.
- Headless Chrome CDP `file://` smoke check loaded `v144`, rendered 704 dynasty blocks, 180 territory fill pieces, 8 region headers, and 209 connection paths; all 13 v144 Europe target blocks were present. Cleanup confirmed no matching `history-visual-chrome-v144` process remained.

## v145 Early Americas / Polygon Audit
- Root cause of the user's "why is it rectangular now?" issue: the ownership-conserving renderer correctly suppressed some generic notches when their full time window could not be covered by an adjacent/explicit owner. That avoided blank land, but it also made valid partial transitions fall back to rectangles.
- Implemented renderer direction: entity-level `notches` can now specify side, y/height, width, and owner IDs directly. The renderer generates an inline orthogonal `clip-path` from those notches and still refuses to clip if no owner can fill the missing piece.
- Data direction: the Americas Maya/Central America lane had a real abstraction gap before and after Olmec influence. Instead of inventing a state, v145 adds cultural-owner blocks: `central_america_prehistoric`, `early_maya_formative`, and `zapotec_preclassic`.
- The high-confidence interlocking cases are now explicit: `olmec_maya_influence` right notch is filled by `early_maya_formative` then `maya_preclassic`; `maya_preclassic` left notch is filled by `olmec_maya_influence` then `zapotec_preclassic`; `preclassic`, `early_maya_formative`, and `zapotec_preclassic` use adjacent-owner fills.
- Knowledge-richness pass also added descriptions/details/centers/wiki slugs for early Americas cultural owners, Chavin, Early Intermediate, Mound Builders, Wari-Tiwanaku Middle Horizon, Late Intermediate Andes, Caribbean island cultures, precolonial Brazil, and northern Indigenous lanes.
- Added 15 transitions so early Americas reads as owner-to-owner history rather than isolated labels.

## v145 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=145`, `print.css?v=145`, and `app.js?v=145`.
- Data integrity passed with 707 entities, 223 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 out-of-bounds entities, all v145 target blocks present, and all v145 target connections present.
- Shape-plan audit passed for `olmec_maya_influence`, `early_maya_formative`, `maya_preclassic`, `preclassic`, and `zapotec_preclassic`; all five generate polygon clip paths, with explicit multi-owner fills on the two cases that need them.
- Headless Chrome CDP over `http://127.0.0.1:8765` loaded `v145`, rendered 707 dynasty blocks, 187 territory fill pieces, 8 region headers, and 223 connection paths. Computed styles confirmed non-rectangular `clip-path` on all five target transition blocks, and owner fill pieces included Early Maya, Maya Preclassic, Olmec Influence, and Zapotec/Isthmian.
- Mobile Chinese verification at 390px rendered 707 blocks and 187 fill pieces, loaded `app.js?v=145`, localized `玛雅前古典`, and had 0 horizontal overflow. Cleanup confirmed no listeners remained on ports 8765 or 9238.

## v146 South Asia Polygon / Knowledge Audit
- Post-v145 audit showed South Asia had exactly three remaining suppressed shapes: `indus_fringe`, `sangam_early`, and `pandya`. These aligned directly with the user's concern that a non-rectangular contraction should be filled by a neighboring owner rather than reverting to a plain rectangle.
- Source direction checked: Britannica supports Indus/Harappan extent toward Gujarat and the Yamuna, the Vedic shift from Sapta Sindhu toward the Ganges-Yamuna Doab, Sangam Tamil literary/political context, Anuradhapura's long capital role, Pallava southern power, Pala Bengal-Bihar rule, and Shahi Kabul-Gandhara frontier framing. Britannica West Bengal / Satavahana material supports treating Bengal and the Deccan as distinct regional lanes rather than empty gaps.
- Implemented data direction: added `ganges_chalcolithic` and `deccan_post_maurya` as cultural/regional owners, added owner-filled custom notches to Harappan Fringe, Sangam Kingdoms, and Pandya, and enriched South Asia descriptions, detail cards, centers, territory notes, wiki slugs, and 19 transition/trade/conquest links.
- Shape semantics result: `indus_fringe` now fills from `ganges_chalcolithic` and `south_prehistoric`; `sangam_early` fills from `maurya_deccan`, `deccan_post_maurya`, and `satavahana`; `pandya` fills from `delhi_deccan`.
- The global shape audit now reports 185 raw shape markers, 163 clipped owner-filled shapes, 193 fill pieces, and 22 still-suppressed ambiguous shapes. This reduces the suppressed list from 25 to 22 without introducing ownerless blank cuts.

## v146 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=146`, `print.css?v=146`, and `app.js?v=146`.
- Data integrity passed with 709 entities, 242 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 out-of-bounds entities, 0 sampled slot overlaps, all v146 targets present, required metadata present, 0 invalid notch owners, and all required v146 connections present.
- Shape-plan audit passed for `indus_fringe`, `sangam_early`, and `pandya`; all three now generate computed polygon clip paths and owner fill segments.
- Headless Chrome CDP over `http://127.0.0.1:8765` loaded `v146`, rendered 709 dynasty blocks, 193 territory fill pieces, 8 region headers, and 242 connection paths. Computed styles confirmed non-rectangular `clip-path` on all three South Asia target blocks, and owner fill pieces included Ganges-Yamuna, Southern Cultures, Mauryan Deccan, Early Deccan States, Satavahana, and Delhi Deccan.
- Mobile Chinese verification at 390px rendered 709 blocks, 193 fill pieces, and 242 connection paths, loaded `app.js?v=146`, localized `桑伽姆诸国`, kept the Sangam polygon clip, and had 0 horizontal overflow. Cleanup confirmed no listeners remained on ports 8765 or 9239.

## v147 Middle East Owner-Filled Polygon Audit
- Post-v146 audit showed Middle East still had six suppressed shapes: `old_babylon_elam_campaign`, `achaemenid_mesopotamia`, `parthia_mesopotamia`, `umayyad_arabia`, `crusader_states`, and `saudi_arabia`.
- Design decision: do not paint these as ownerless gaps. When the old side direction pointed outside the simplified region, flip the notch toward a meaningful owner: Old Babylonian campaign -> Babylonian core, Achaemenid Babylonia -> Persian core, Parthian Mesopotamia -> Parthian Iranian core, Umayyad Arabia -> Damascus core.
- Added `syria_muslim_polities` as a 1099-1187 half-lane for Seljuk / atabeg / Zangid Muslim Syria, so Crusader States interlock with a contemporaneous inland Muslim owner instead of blank land.
- Expanded `saudi_arabia` from the 1932-1946 half-lane to the full Arabia lane and let the left notch be filled by `transjordan_mandate`, matching the neighbor relationship without leaving the western half visually ownerless.
- Added descriptions, detail metadata, a center coordinate, wiki slug mappings, and two connections for `syria_muslim_polities`; updated the relevant Middle East descriptions/details to explain the owner-filled notches.

## v147 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=147`, `print.css?v=147`, and `app.js?v=147`.
- Data integrity passed with 710 entities, 244 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 out-of-bounds entities, 0 slot overlaps, 0 invalid notch owners, and required v147 metadata present.
- Shape-plan audit passed with 186 raw shape markers, 170 clipped owner-filled shapes, 200 fill pieces, and 16 still-suppressed ambiguous shapes; `middleSuppressed` is now empty.
- Headless Chrome CDP over `http://127.0.0.1:8765` loaded `v147`, rendered 710 dynasty blocks, 200 territory fill pieces, 8 region headers, and 244 connection paths. Computed styles confirmed non-rectangular `clip-path` on `syria_muslim_polities`, `crusader_states`, `old_babylon_elam_campaign`, `achaemenid_mesopotamia`, `parthia_mesopotamia`, `umayyad_arabia`, and `saudi_arabia`.
- Owner-fill verification found the expected fill owners: `syria_muslim_polities`, `crusader_states`, `old_babylon`, `achaemenid`, `parthia`, `umayyad`, and `transjordan_mandate`.
- Mobile Chinese verification at 390px rendered 710 blocks, 200 fill pieces, and 244 connection paths, loaded `app.js?v=147`, localized `穆斯林叙利亚`, kept the new entity polygon clip, and had 0 horizontal overflow. Cleanup confirmed no listeners remained on ports 8765 or 9239.

## v148 East Asia Owner-Filled / Full-Owner Audit
- Post-v147 audit showed East Asia had four remaining suppressed shapes: `jin_west_unified`, `sui_unified`, `qing`, and `later_jin_manchu`.
- Source direction checked: Britannica supports Western Jin reunification after the 280 conquest of Wu, Sui reunification after the Chen/Southern Dynasties endpoint in 589, Nurhaci's 1616 Later Jin frontier state, Qing establishment in Manchuria in 1636 and China-wide rule from 1644, and the 1683 elimination of the last Ming-loyalist Taiwan stronghold.
- Design decision: not every post-change block should be a polygon. Western Jin Unified and Sui Unified are full-owner phases after conquest, so a notch would falsely imply that Wu or Chen still owned a piece. Those two blocks now stay full-width, with notes explaining why no ownerless cutout is drawn.
- Design decision: Later Jin and Qing still have meaningful contemporaneous neighbors in the simplified lane model. Later Jin's left notch is filled by Ming, and Qing China Proper's right notch is filled by Qing Manchuria, using explicit `notchOwners`.
- Shape semantics result: all East Asia suppressed shapes are now resolved without inventing land without an owner. Global suppressed count drops from 16 to 12; East Asia suppressed count drops from 4 to 0.

## v148 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=148`, `print.css?v=148`, and `app.js?v=148`.
- Data integrity passed with 710 entities, 244 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 out-of-bounds entities, 0 slot overlaps, 0 invalid notch owners, and required v148 metadata present.
- Shape-plan audit passed with 184 raw shape markers, 172 clipped owner-filled shapes, 202 fill pieces, 37 explicit fill pieces, and 12 still-suppressed ambiguous shapes. `eastAsiaSuppressed` is now empty.
- Target verification confirmed `qing` renders as `shape-taper-right` filled by `qing_manchuria`, `later_jin_manchu` renders as `shape-taper-left` filled by `ming`, and `jin_west_unified` / `sui_unified` intentionally have no shape class or clip path.
- Headless Chrome CDP over `http://127.0.0.1:8765` loaded `v148`, rendered 710 dynasty blocks, 202 territory fill pieces, and 244 connection paths on desktop and mobile. Desktop and 390px Chinese mobile both found the Qing-Manchuria and Ming owner fill pieces, kept Qing / Later Jin polygon clips, and had 0 horizontal overflow.
- Cleanup confirmed no listeners remained on ports 8765 or 9239. One broad `lsof` invocation used incompatible syntax and was ignored; strict LISTEN queries and curl exit 7 confirmed cleanup.

## v149 Europe Owner-Filled Polygon Audit
- Post-v148 audit showed five remaining Europe suppressed shapes: `roman_republic_3`, `roman_empire_greece`, `roman_late_greece`, `napoleon_italy`, and `napoleon_rhine`.
- Source direction checked: Britannica supports Achaea / Greek League annexation to Rome after 146 BCE and Achaea's 27 BCE provincial framing; Britannica supports the Roman Empire as the 27 BCE imperial system and the later east-west division; Britannica supports the Confederation of the Rhine as an 1806-1813 Napoleonic German union; Britannica's Eugene de Beauharnais entry supports Napoleon proclaiming himself king of Italy in 1805 with Eugene as viceroy.
- Design decision: the old `taper-left` shapes on Roman Greece / Balkans cut toward the outside of the simplified Europe grid, which produced an unowned edge. They now cut rightward into explicit Roman core owners: `roman_republic_2`, `roman_empire_2`, and `roman_late`.
- Design decision: `napoleon_italy` should not be an hourglass because the left-side notch implied an ownerless or misleading Balkan/German side. It is now a right-edge client/satellite notch filled by the French imperial core.
- Design decision: `napoleon_rhine` should not taper to the east. It now tapers left and is filled by the French imperial core as remote protector power, preserving the German client-confederation status without drawing it as annexed France.
- Added two Napoleonic relationship links: Napoleon becoming king of Italy in 1805 and Napoleonic protectorate over the Rhine in 1806.
- Added Frankfurt metadata for the Confederation of the Rhine and normalized two legacy string `notchOwners` entries to array form for consistency.

## v149 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=149`, `print.css?v=149`, and `app.js?v=149`.
- Data integrity passed with 710 entities, 246 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing connection endpoints, 0 out-of-bounds entities, 0 slot overlaps, and 0 invalid notch owners.
- Shape-plan audit passed with 184 raw shape markers, 177 clipped owner-filled shapes, 207 fill pieces, 42 explicit fill pieces, and 7 still-suppressed ambiguous shapes. `europeSuppressed` is now empty.
- Target shape verification confirmed `roman_republic_3`, `roman_empire_greece`, `roman_late_greece`, `napoleon_italy`, and `napoleon_rhine` all compute polygon clip paths with explicit owner fills from `roman_republic_2`, `roman_empire_2`, `roman_late`, and `napoleon`.
- Headless Chrome CDP over a temporary local server loaded `v149`; desktop rendered 710 dynasty blocks, 207 territory fill pieces, and 246 connection paths with no console/page errors and 0 horizontal overflow. The five target blocks had computed non-rectangular `clip-path` values, and owner fill pieces included Roman core and Napoleon fills.
- 390px Chinese mobile loaded `v149`, rendered 710 blocks / 207 fill pieces / 246 connection paths, localized `拿破仑意大利` and `莱茵邦联`, kept all five target polygon clips, and had 0 horizontal overflow.
- Cleanup confirmed no validation port listeners remained; the temporary `history-visual-chrome-*` profile directories were removed after Chrome finished settling.

## v150 Final Suppressed-Shape / Owner-Filled Audit
- Post-v149 audit showed the final seven suppressed shapes were all outside Europe: `centralAsia.kangju`, `centralAsia.hephthalite`, `centralAsia.gokturk`, `centralAsia.samanid_south`, `centralAsia.bukharan_psr`, `africa.swahili_coast`, and `southeastAsia.kediri`.
- Root cause: these were mostly old generic `taper-*` or `hourglass` shapes whose notch windows covered too much time. The renderer correctly refused to clip them because a full generic notch would have created ownerless blank land.
- Design decision: real territorial loss should be drawn only for the precise years that another owner can carry. Kangju now cuts only its late 375-430 edge into `kidarites_steppe`; Hephthalite and Göktürk mutually interlock over the 552-565 transition; Samanid Khorasan cuts only its late 977-999 Ghazna-side edge into `ghaznavid_ca`.
- Design decision: Bukharan PSR stays full. Its left side is the chart boundary, and inventing a fake left-side owner before the 1924 Uzbek SSR would be less accurate than showing a short complete revolutionary transition block.
- Design decision: Swahili Coast should not be an hourglass with a coast-side blank. Its inland edge now interlocks with `mapungubwe`, `great_zimbabwe`, and `mutapa`, making the Indian Ocean coast / inland gold-trade hinterland relationship visible.
- Design decision: Kediri/Singhasari now has an early 929-1025 right-edge notch filled by `srivijaya`, then reads as a more independent Javanese lane after the Chola shock weakened Srivijaya's dominance.
- Added relationship links for Swahili Coast trade with Mapungubwe, Great Zimbabwe, and Mutapa, plus Kediri/Singhasari succession into Majapahit.

## v151 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=151`, `print.css?v=151`, and `app.js?v=151`.
- Data integrity passed with 710 entities, 250 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, 0 slot overlaps, and 0 invalid notch owners.
- Shape-plan audit passed with 183 raw shape markers, 183 clipped owner-filled shapes, 215 fill pieces, and 0 suppressed shapes. The known suppressed-shape queue is now empty.
- Target owner verification confirmed `kangju -> kidarites_steppe`, `hephthalite -> gokturk`, `gokturk -> hephthalite`, `samanid_south -> ghaznavid_ca`, `swahili_coast -> mapungubwe / great_zimbabwe / mutapa`, and `kediri -> srivijaya`; `bukharan_psr` intentionally has no shape or clip path.
- Headless Chrome/CDP over a temporary local server loaded `v151`; desktop rendered 710 dynasty blocks, 215 territory fill pieces, and 250 connection paths. Required owner fill pieces were present and Bukharan PSR computed `clip-path: none`.
- 390px Chinese mobile loaded `v151`, rendered 710 blocks / 215 fill pieces / 250 connection paths, localized `康居`, `嚈哒核心`, `斯瓦希里海岸`, and `谏义里/新柯沙里`, had 0 body-level horizontal overflow, and the first timeline header started 28px below the container instead of after a half-screen blank.

## v152 Early East Asia Cultural-Owner / Knowledge-Richness Pass
- Post-v151 audit showed East Asia still had high-visibility early cultural lanes with weak metadata: `china_neolithic`, `south_neolithic`, `steppe_bronze`, `steppe_nomads`, `korea_prehistoric`, `gojoseon`, `proto_3k`, `three_k_korea`, `jomon`, `yayoi`, `vn_prehistoric`, `van_lang`, `au_lac`, `nanyue`, and `chinese_vn`.
- Design decision: early cultural lanes may be visible owners, but their detail text must state when they are archaeological, cultural, legendary, or multi-polity abstractions rather than centralized states or modern borders.
- Design decision: non-rectangular shapes should remain orthogonal and ownership-conserving. Added owner-filled cutouts for China Neolithic -> Southern Cultures, Southern Cultures -> China/Xia/Shang/Zhou, Steppe Bronze / Early Nomads -> Gojoseon, Gojoseon -> Steppe/Xiongnu, late Jomon -> Gojoseon, Yayoi -> Gojoseon/Proto-Three-Kingdoms/Three-Kingdoms, and Chinese-rule Vietnam -> mainland Chinese dynasties.
- The Chinese-rule Vietnam cutout deliberately uses non-contiguous owner fills (`han_west`, `xin`, `han_east`, `cao_wei`, `jin_west`, `jin_west_unified`, `sixteen_k`) to model remote imperial administration without leaving blank space.
- Added descriptions, detail metadata, center coordinates, territory notes, wiki slug mappings, and 16 transition/conquest/cultural links for early East Asian and Vietnamese sequences.

## v152 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=152`, `print.css?v=152`, and `app.js?v=152`.
- Data integrity passed with 710 entities, 266 connections, 0 duplicate IDs, 0 missing endpoints, 0 out-of-bounds entities, all v152 target metadata present, and all required v152 connections present.
- Shape-plan audit passed with 191 raw shape markers, 191 clipped owner-filled shapes, 236 fill pieces, and 0 suppressed shapes.
- New shape verification confirmed all eight v152 target polygons render and fill from the expected owners: `south_neolithic`, `china_neolithic / xia / shang / zhou_west / zhou_east`, `gojoseon`, `steppe_nomads / xiongnu`, `proto_3k / three_k_korea`, and mainland Chinese dynastic owners for `chinese_vn`.
- Headless Chrome/CDP over a temporary local server loaded `v152`; desktop rendered 710 dynasty blocks, 236 territory fill pieces, and 266 connection paths. Computed styles confirmed non-rectangular `clip-path` for `china_neolithic`, `south_neolithic`, `steppe_bronze`, `steppe_nomads`, `gojoseon`, `jomon`, `yayoi`, and `chinese_vn`.
- Desktop detail-panel verification opened `chinese_vn` and confirmed the panel includes the non-contiguous remote-administration explanation, `Jiaozhi / Long Bien`, and the new Han-annexation / Bach Dang independence connections.
- 390px Chinese mobile loaded `v152`, rendered 710 blocks / 236 fill pieces / 266 connection paths, localized `新石器时代`, `南方文化`, `草原青铜时代`, `早期游牧`, `古朝鲜`, `绳文`, `弥生`, `文郎`, and `北属时期`, had 0 body-level horizontal overflow, and kept the first timeline gap at 28px.

## v153 Early Southeast Asia Cultural-Owner / Knowledge-Richness Pass
- Post-v152 audit showed Southeast Asia still had six long first-era lanes with weak metadata: `indonesia_prehistoric`, `malay_prehistoric`, `mekong_prehistoric`, `thai_prehistoric`, `myanmar_prehistoric`, and `philippines_prehistoric`.
- Design decision: these lanes should remain visible owners because the simplified chart cannot show every real neighbor, but their details must state that they are archaeological, cultural, maritime, or regional settlement networks rather than modern countries projected into prehistory.
- Design decision: no new polygon was added for clean same-lane succession. The correct v153 move is to make the existing owners legible and connect them to later named polities, rather than cutting artificial notches that would imply a territorial transfer where the abstraction is really chronological transformation.
- Added descriptions, detail metadata, center coordinates, territory notes, wiki slug mappings, and 8 continuity/trade links tying later Funan, Tarumanagara, Pyu, Dvaravati, Srivijaya, and Barangay lanes back to these cultural owners.

## v153 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=153`, `print.css?v=153`, and `app.js?v=153`.
- Data integrity passed with 710 entities, 274 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, all v153 target metadata present, and all required v153 connections present.
- Shape marker count remains 191 because v153 did not add geometry. Browser rendering confirmed the v152 fill baseline is preserved: 236 owner-fill pieces and Funan still computes an orthogonal polygon `clip-path`.
- Headless Chrome/CDP over a temporary local server loaded `v153`; desktop rendered 710 dynasty blocks, 236 territory fill pieces, and 274 connection paths, with no stale `v152` app/style resources.
- Desktop detail-panel verification opened `thai_prehistoric` and confirmed the panel includes `Ban Chiang`, the warning that the lane is not a modern Thai state projected backward, and the `https://en.wikipedia.org/wiki/Ban_Chiang` link.
- 390px Chinese mobile loaded `v153`, rendered 710 blocks / 236 fill pieces / 274 connection paths, localized `印尼文化`, `马来文化`, `湄公河文化`, `泰国盆地文化`, `缅甸文化`, and `菲律宾文化`, had 0 body-level horizontal overflow, and kept the first timeline gap at 28px.
- Cleanup confirmed no validation listeners remained on ports 8765 or 9231, and curl to 8765 failed with connection refused as expected.

## v154 Europe Migration-Era / Post-Roman Italy Pass
- Post-v153 audit showed Europe remained thin around migration-era and early medieval lanes: `germanic_early`, `germanic_tribes`, `lusatian`, `slavic_west`, `steppe_early`, `scythian`, `slavic_east`, `byzantine_early`, `odoacer`, `ostrogoth`, `byzantine_italy`, `lombard`, `anglo_saxon`, `poland_piast`, and `kievan_rus`.
- Source direction checked: Britannica and the British Museum support Germanic migration-period confederacies, Scythian/Pontic steppe context, Odoacer/Ostrogothic Italy, Justinianic reconquest, Anglo-Saxon England, East/West Slavic framing, and Kyivan Rus formation; the Met supports Justinian's campaign to recover Italy and Ravenna's restored role.
- Design decision: early Germanic, Lusatian, West Slavic, steppe, Scythian, and East Slavic lanes should be visible cultural or confederation owners. Their detail text now states when they are archaeological, cultural, tribal, or state-forming abstractions rather than centralized modern states.
- Design decision: the old 553-751 `byzantine_italy` full rectangle was too broad. It now becomes a short 553-568 Byzantine Italy Reconquest phase, then splits into 568-751 Byzantine Exarchate and Lombard Italy half-lanes, followed by 751-774 Late Lombard Kingdom and 774-800 Frankish Italy.
- Design decision: the 774-800 Italy gap should not be left blank after the Lombard conquest. `frankish_italy` explicitly carries the former Lombard kingdom before the 800 Carolingian imperial block.
- Added 20 net new relationship links for Germanic / Slavic / Scythian / Rus transitions and the post-Roman Italian chain from Odoacer through Ostrogothic, Byzantine, Lombard, Frankish, and Carolingian phases.

## v154 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=154`, `print.css?v=154`, and `app.js?v=154`.
- Data integrity passed with 713 entities, 294 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, 0 slot overlaps, all v154 target metadata present, and all required v154 connections present.
- Italy continuity check confirmed: 553-568 `byzantine_italy` full lane, 568-751 `byzantine_exarchate` left half plus `lombard_italy` right half, 751-774 `lombard` full lane, 774-800 `frankish_italy` full lane, and 800-843 `carolingian` over Italy/France.
- Browser rendering confirmed the existing owner-fill baseline is preserved: 236 territory fill pieces, no new suppressed-shape work, and 294 rendered connection paths.
- Headless Chrome/CDP over a temporary local server loaded `v154`; desktop rendered 713 dynasty blocks, 236 territory fill pieces, and 294 connection paths, with Byzantine Exarchate and Lombard Italy half-lanes aligned side by side and no document overflow.
- Desktop detail-panel verification opened `byzantine_exarchate` and confirmed the panel explains Ravenna/Rome/southern imperial enclaves, Lombard ownership of the other half, and the no-false-full-peninsula reading.
- 390px Chinese mobile loaded `v154`, rendered 713 blocks / 236 fill pieces / 294 connection paths, localized `拜占庭总督区`, `伦巴第意大利`, `法兰克意大利`, `日耳曼部落`, `西斯拉夫部落`, and `基辅罗斯`, opened `lombard_italy` with the `无主缺口` owner-language, and had 0 body-level horizontal overflow.
- Cleanup confirmed no validation listeners remained on ports 8765 or 9231, and curl to 8765 failed with connection refused as expected.

## v155 Source Notes
- Post-v154 data-thickness audit shows Middle East is still the largest weak region: 148 entities, 51 missing descriptions, 56 missing detail entries, 58 missing capital/center entries, 52 missing territory notes, 7 long broad blocks, and 67 entities with no relationship links.
- Highest-impact v155 targets are long early or Arabian-lane owners: `anatolia_early`, `hattians`, `egypt_early`, `canaanite`, `arabia_prehistoric`, `arabia_ancient`, `nabataean_early`, `nabataean`, `arabia_roman`, `arabia_late`, `arabia_abbasid`, and `arabia_fragmented`.
- Source direction checked: UNESCO and the Met support Çatalhöyük / Anatolia as a long Neolithic and early Bronze Age cultural horizon before Hittite state formation; Britannica supports Hittites appearing in Anatolia at the start of the 2nd millennium BCE and the Anatolian rise/fall sequence.
- Source direction checked: the Met's Old Kingdom and Middle Kingdom essays support treating `egypt_early` as a pharaonic state-building continuum, while the chart still needs a territory note clarifying that it is a compressed Old/Middle Kingdom Nile-lane owner.
- Source direction checked: Britannica defines Canaan as centered on Palestine / the southern Levant and identifies Canaanites as pre-Israelite inhabitants attested in cuneiform, Egyptian, Phoenician, and biblical traditions; this supports a Bronze Age southern-Levant cultural-owner lane rather than blank land before Egyptian/Hittite frontier fragments.
- Source direction checked: the Met and Britannica support an Arabian incense-route / Sabaean-Himyarite / Nabataean trade sequence, while UNESCO's Incense Route material supports long-distance frankincense and myrrh routes from Yemen/Oman toward the Mediterranean.

## v155 Early Middle East / Arabian Lane Pass
- Implemented v155 data edits for `anatolia_early`, `hattians`, `egypt_early`, `canaanite`, `arabia_prehistoric`, `arabia_ancient`, `nabataean_early`, `nabataean`, `arabia_roman`, `arabia_independent_late`, `arabia_late`, `arabia_abbasid`, and `arabia_fragmented`.
- Design decision: early Middle East cultural horizons should remain visible owners, but their descriptions and territory notes must say whether they are archaeological, cultural, city-network, caravan-route, or multi-polity abstractions rather than centralized modern states.
- Design decision: Roman annexation after 106 should not occupy the whole Arabia lane. `arabia_roman` is now `Arabia Petraea` at slot 5 / width 0.5, and the new `arabia_independent_late` occupies slot 5.5 / width 0.5 for southern, interior, oasis, and pastoral Arabian polities outside Roman rule.
- Added 16 relationship links so the early Anatolia, Egypt, Canaan/Levant, Arabia/Nabataean, Roman Arabia, late antique Arabia, Abbasid Arabia, fragmented Arabia, and Najd/Interior transitions read as owner-to-owner continuity instead of isolated labels.
- Updated descriptions, details, capital/center coordinates, territory notes, Wikipedia slug mappings, README territorial semantics copy, and active assets to `v155`.

## v155 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, active asset scan with `index.html` loading `styles.css?v=155`, `print.css?v=155`, and `app.js?v=155`, plus wiki-slug coverage for all v155 targets.
- Data integrity passed with 714 entities, 310 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, 0 slot overlaps, all v155 target descriptions/details/capitals/territory notes present, and all required v155 connections present.
- Arabia half-lane audit confirmed `arabia_roman` / Arabia Petraea runs 106-395 at slot 5 width 0.5 while `arabia_independent_late` / Independent Arabia runs 106-395 at slot 5.5 width 0.5.
- Headless Chrome/CDP over a temporary local server loaded `v155`; desktop rendered 714 dynasty blocks / 236 territory fill pieces / 310 connection paths, confirmed Arabia Petraea and Independent Arabia half-lanes align side by side, and opened the Arabia Petraea detail panel with explicit "not all Arabia" language.
- 390px Chinese mobile loaded `v155`, rendered 714 blocks / 236 territory fill pieces / 310 connection paths, localized `阿拉伯佩特拉`, `阿拉伯独立诸势力`, `晚期阿拉伯`, `迦南`, and `埃及(古-中王国)`, opened Independent Arabia with the non-Roman / simplified-gap owner language, and had 0 body-level horizontal overflow.
- Cleanup confirmed no listeners remained on ports 8765 or 9231, the temporary Chrome profile was removed, and curl to 8765 exited 7.

## v156 Source Notes
- Post-v155 data-thickness audit still ranks Middle East highest: 149 entities, 39 missing descriptions, 45 missing detail entries, 47 missing capital/center entries, 40 missing territory notes, 53 entities with no relationship links, 28 long broad blocks, and score 636.
- Highest v156 ancient Middle East targets are `neo_hittite`, `kassites`, `babylon_dark`, `elam_middle`, `sumer`, `egypt_3ip`, and `elam_neo`, plus adjacent transition owners `gutian`, `elam_gutian`, `ur_iii`, and `isin_larsa` where missing metadata breaks continuity.
- Source direction checked: Britannica supports Sumer as the earliest southern Mesopotamian civilization between the Tigris and Euphrates; this supports giving `sumer` city-state details and a note that it is not one unified all-Mesopotamian empire.
- Source direction checked: Britannica and the Met support Ur III, Isin-Larsa, and Old Babylonian sequence after the Ur III collapse; this supports adding transition links from Sumer/Akkad through Gutian, Ur III, Isin-Larsa, and Old Babylon.
- Source direction checked: The Met and Britannica support Kassite Babylonia from the Hittite sack of Babylon through the Middle Babylonian period, with Elamite raids ending Kassite suzerainty; this supports `kassites -> old_babylon` and `babylon_dark -> kassites` links plus a note that Babylonia remained a regional owner after Kassite collapse.
- Source direction checked: Britannica supports Elam as Susa/Anshan-centered southwestern Iran with Old, Middle, and Neo-Elamite phases closely entangled with Sumer, Babylonia, and Assyria; this supports richer `elam_middle` and `elam_neo` details and transitions.
- Source direction checked: Britannica supports Neo-Hittite states in Syria and Anatolia after the Hittite imperial collapse, including Carchemish, Malatya, Tabal, and Que; this supports separating `neo_hittite` Anatolian continuity from `neo_hittite_syria`.
- Source direction checked: the Met and Britannica support the Egyptian Third Intermediate Period as politically divided rule after Ramesses XI / New Kingdom, with Tanis, Thebes, Libyan and Kushite phases; this supports treating `egypt_3ip` as an Egyptian divided-owner lane rather than a blank post-New-Kingdom gap.

## v156 Ancient Middle East Continuity Pass
- Implemented v156 data edits for `sumer`, `gutian`, `elam_gutian`, `ur_iii`, `isin_larsa`, `kassites`, `elam_middle`, `neo_hittite`, `egypt_3ip`, `babylon_dark`, and `elam_neo`.
- Design decision: clean chronological succession inside the same simplified land lane should remain full-width and be explained through metadata plus relationship links; orthogonal notches are reserved for simultaneous partial control, frontier projection, non-contiguous occupation, or a real neighbor/remote owner that fills the missing piece.
- Renamed weak labels to historically legible owners: `Gutian Interlude`, `Elam Continuity`, `Kassite Babylonia`, `Neo-Hittite Anatolia`, `Third Intermediate Egypt`, and `Post-Kassite Babylonia`.
- Added descriptions, detail metadata, center coordinates, territory notes, English/Chinese Wikipedia slugs, and 14 continuity/conflict/conquest links through the Sumer -> Akkad -> Gutian -> Ur III -> Isin-Larsa -> Old Babylon -> Kassite -> Post-Kassite Babylonian chain, plus the Elamite and Egyptian side chains.
- Updated README territorial semantics copy, task-plan decisions, and active assets to `v156`.

## v156 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=156`, `print.css?v=156`, and `app.js?v=156`.
- Data integrity passed with 714 entities, 324 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, 0 slot overlaps, all v156 target descriptions/details/capitals/territory notes/categories present, and all required v156 connections present.
- Headless Chrome/CDP over a temporary local server loaded `v156`; desktop rendered 714 dynasty blocks / 236 territory fill pieces / 324 connection paths, localized the new labels, and opened the Kassite Babylonia detail panel with Middle Babylonian, Assyria, and Elam owner-language.
- 390px Chinese mobile loaded `v156`, rendered 714 blocks / 236 territory fill pieces / 324 connection paths, localized `喀西特巴比伦`, `中埃兰`, `后喀西特巴比伦`, and `埃及第三中间期`, opened the Egyptian detail panel with Tanis/Thebes/Kushite/Saite divided-owner language, and had 0 body-level horizontal overflow.
- Cleanup confirmed no validation listeners remained on ports 8765 or 9231 and the temporary Chrome profile directory was removed.

## v157 Source Notes
- Post-v156 data-thickness audit ranks Europe highest: 112 entities, 34 missing descriptions, 39 missing detail entries, 43 missing capital/center entries, 37 missing territory notes, 44 entities with no relationship links, 33 long broad blocks, and score 586.
- Highest v157 Europe targets selected for user-visible medieval/early-modern continuity are `frankish_gaul`, `france_cap`, `france_val`, `france_bour`, `hre_germany`, `poland_jagiellon`, `ottoman_balkans`, and `mongol_europe`.
- Source direction checked: Britannica's Frankish ascendancy / Treaty of Verdun material supports the Frankish -> Carolingian -> West/East Francia -> Capetian/Holy Roman chain and the 843 partition as the bridge toward later France and Germany.
- Source direction checked: Britannica's Capetian, Hugh Capet, Valois, Bourbon, and France-history pages support the French royal sequence from Hugh Capet's 987 election through Valois centralization and Bourbon absolutism to the 1792 revolutionary rupture.
- Source direction checked: Britannica's Holy Roman Empire page supports treating the empire as a shifting western/central European framework rather than a centralized German nation-state; the existing separate Italy/HRE and Germany/HRE lanes should explain the abstraction rather than merge into one rectangle.
- Source direction checked: Britannica's Jagiellon Dynasty, Union of Lublin, and Polish-Lithuanian Commonwealth pages support 1385 personal-union origins, the 1569 federated Commonwealth, elective monarchy, multiethnic scale, and 1795 partition endpoint.
- Source direction checked: Britannica's Balkans/Ottomans and Ottoman Empire pages support the Ottoman Balkan conquest sequence from Adrianople/Edirne in 1362 through Serbia, Bulgaria, Constantinople, Bosnia, and later Balkan independence pressures.
- Source direction checked: Britannica's Mongol Empire / Golden Horde / Battle of the Ugra material supports modeling `mongol_europe` as Golden Horde/Rus suzerainty rather than direct settlement, ending with the 1480 Ugra break in Muscovite tribute authority.

## v157 Medieval / Early Modern Europe Owner-Chain Pass
- Implemented v157 data edits for `frankish_gaul`, `france_cap`, `france_val`, `france_bour`, `hre_germany`, `poland_jagiellon`, `ottoman_balkans`, and `mongol_europe`, plus the partitioned-Poland follow-through.
- Design decision: clean same-lane succession remains full-width when no simultaneous owner exists, but metadata and connections must explain the owner chain. This is why Frankish -> Carolingian -> West Francia -> Capetian -> Valois -> Bourbon stays full while still avoiding anonymous rectangles.
- Design decision: partitioned Poland should not be a single ambiguous full-width block. The old `poland_partition` placeholder is now three simultaneous owner fragments: `poland_partition_prussian`, `poland_partition_austrian`, and `poland_partition_russian`, with the Russian fragment visually meeting the Russia lane and the Austrian fragment documented as a non-contiguous simplified-grid owner.
- Added descriptions, detail metadata, center coordinates, territory notes, English/Chinese Wikipedia slugs, and 26 relationship links for the Frankish/Verdun/French, HRE/German, Golden Horde/Rus/Russian, Ottoman Balkan/Greek, and Poland-Lithuania/partition/restoration chains.
- Added `shortName` / `shortNameCN` support for block-face labels, used by the three narrow Polish partition fragments so the visible text stays legible while aria labels and detail-panel titles keep the full names.
- Updated README territorial-semantics copy, task-plan decisions, and active assets to `v157`.

## v157 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, active asset scan with `index.html` loading `styles.css?v=157`, `print.css?v=157`, and `app.js?v=157`, and no validation listeners left on ports 8765 or 9231.
- Data integrity passed with 716 entities, 350 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, 0 slot overlaps, and all v157 target descriptions/details/capitals/territory notes/categories present.
- Headless Chrome/CDP over a temporary local server loaded `v157`; desktop rendered 716 dynasty blocks / 236 territory fill pieces / 350 connection paths, loaded only v157 app/style/print resources, and opened the Russian Partition detail panel with concrete foreign-owner language.
- Browser geometry verification confirmed the Prussian, Austrian, and Russian partition fragments are vertically aligned and contiguous with no blank gap; their visible labels are `Pr`, `Au`, and `Ru`, while aria labels preserve `Prussian Partition`, `Austrian Partition`, and `Russian Partition`.
- Short-label overflow verification passed: the partition labels' `scrollWidth` / `scrollHeight` stay within their content boxes after adding the `has-short-name` styling.
- 390px Chinese mobile loaded `v157`, rendered 716 blocks / 236 fill pieces / 350 connection paths, localized the partition labels as `普`, `奥`, and `俄`, opened `奥地利分割区` with non-contiguous owner language, and had 0 body-level horizontal overflow.

## v158 Audit Notes
- Post-v157 metadata-thickness audit now ranks East Asia highest: 131 entities, 29 missing descriptions, 44 missing detail entries, 41 missing capital/center entries, 53 missing territory notes, 47 entities with no relationship links, 28 long broad blocks, and score 566.
- Highest-impact East Asia targets are first-screen / foundational owner-chain blocks: `shang`, `zhou_west`, `zhou_east`, `chu_state`, and `xin`, plus adjacent continuity links to `xia`, `qin`, and `han_west`.
- Design direction: v158 should make the early Chinese dynastic lane knowledge-rich without adding fake polygon cuts. Shang -> Western Zhou -> Eastern Zhou -> Qin is clean chronological succession in the same simplified lane; Chu and other Warring States fragments can be explained as contemporaneous regional owners rather than blank land.

## v158 Source Notes
- Source direction checked: Britannica describes Shang as the first Chinese dynasty with historical records, roughly 1600-1046 BCE, and separately notes documentary and archaeological evidence; this supports enriching Shang as Anyang/Yin, oracle-bone, and bronze-culture owner rather than a thin label.
- Source direction checked: Britannica's Zhou and Warring States material supports Western/Eastern Zhou framing, the Spring-and-Autumn / Warring States fragmentation, Qin and Chu as major late contenders, and Qin's 221 BCE unification endpoint.
- Source direction checked: Wang Mang / Xin material in Britannica supports treating Xin as a short AD 9-23 interruption between Western and Eastern Han, not a blank gap.
- Source direction checked: Warring States timeline material supports the 223 BCE Qin absorption of Chu before the 221 BCE final Qin unification; this justifies a two-year `qin_chu_conquest` owner fragment in the southern lane.
- References used: Britannica Shang (`https://www.britannica.com/place/China/The-Shang-dynasty`, `https://www.britannica.com/topic/Shang-dynasty`), Britannica Zhou/Warring States (`https://www.britannica.com/topic/Zhou-dynasty`, `https://www.britannica.com/event/Warring-States`), Britannica Wang Mang (`https://www.britannica.com/biography/Wang-Mang`), and World History Encyclopedia Warring States timeline (`https://www.worldhistory.org/Warring_States_Period/`).

## v158 Early China Owner-Chain Pass
- Implemented v158 data edits for `xia`, `shang`, `zhou_west`, `zhou_east`, `chu_state`, `qin_chu_conquest`, `qin`, `han_west`, `xin`, and `han_east`.
- Added `qin_chu_conquest` as a short 223-221 BCE southern owner fragment so the lane moves from Chu to Qin to the full Qin Empire without a two-year blank.
- Added orthogonal owner-filled `taper-right` polygons to Xia, Shang, Western Zhou, and Eastern Zhou. Their notches are explicitly filled by Southern Cultures, Chu, and Qin Southern Conquest, so the visible shape is Tetris-like rather than trapezoidal or ownerless.
- Added descriptions, detail metadata, capitals/centers, territory notes, wiki slugs for Chu and the Qin conquest fragment, and 10 new early-China continuity/conquest/cultural links.
- Updated README owner-fragment semantics, task-plan decisions, and active assets to `v158`.

## v158 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, active asset scan with `index.html` loading `styles.css?v=158`, `print.css?v=158`, and `app.js?v=158`.
- Data integrity passed with 717 entities, 360 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, 0 slot overlaps, all v158 target metadata present, all required v158 connections present, and `qin_chu_conquest` exactly bridging `chu_state` to `qin`.
- Headless Chrome/CDP over a temporary local server loaded `v158`; desktop rendered 717 dynasty blocks / 242 territory fill pieces / 360 connection paths, confirmed Xia/Shang/Western Zhou/Eastern Zhou have polygon clips, confirmed Southern Cultures / Chu / Qin Southern Conquest fill owners exist, and confirmed Chu -> Qin Southern Conquest -> Qin is visually contiguous.
- 390px Chinese mobile loaded `v158`, rendered 717 blocks / 242 fill pieces / 360 connection paths, localized `夏`, `商`, `西周`, `东周`, `楚国`, `秦南方征服`, and `新`, opened detail panels with `疆域语义` and explicit owner/no-blank wording, had 0 body-level horizontal overflow, and cleanup left no listeners on ports 8765 or 9231.

## v159 Audit Notes
- Post-v158 metadata-thickness audit ranks South Asia highest-risk: 87 entities, 41 missing descriptions, 49 missing detail entries, 44 missing capital/center entries, 38 missing territory notes, 33 entities with no relationship links, 23 long broad blocks, and score 581.
- The most visible South Asia geometric problem was the -1900 to -1500 gap between Mature Harappan / Harappan Fringe and the Vedic lanes. In slot terms, `indus_valley -> vedic_nw` and `indus_fringe -> vedic` each left a 400-year gap.
- Design direction: do not treat that interval as no-owner land. Add post-urban Late Harappan successor owners, then connect them forward into the Vedic and Mahajanapada chains. Where the simplified grid cannot show every real neighbor, use cultural/regional owner fragments with explicit notes rather than blank space.

## v159 Source Notes
- Source direction checked: Harappa.com's chronology lists a Harappan/Late Harappan Transitional phase beginning around 1900 BCE and a Late Harappan (Cemetery H) phase after it; this supports a visible post-urban owner between Mature Harappan cities and Vedic lanes (`https://www.harappa.com/content/timeline`, `https://www.harappa.com/indus/indus1.html`).
- Source direction checked: World History Encyclopedia summarizes a Late Harappan phase around c.1900-c.1500 BCE and describes the decline of the urban Indus system; this supports the -1900 to -1500 bridge used in the chart (`https://www.worldhistory.org/Indus_Valley_Civilization/`).
- Source direction checked: Britannica's Early Vedic period material dates the Vedas generally to 1500-800 BCE, supporting the chart's Vedic start at -1500 and the Late Harappan -> Vedic connection (`https://www.britannica.com/place/India/Early-Vedic-period`).
- Source direction checked: Britannica describes Gandhara as a trade crossroads subject to Achaemenid Persia in the 6th/5th centuries BCE, conquered by Alexander in the 4th century BCE, and then ruled by the Mauryan dynasty; this supports the separate `gandhara` lane and `maurya_nw -> gandhara` connection (`https://www.britannica.com/place/Gandhara`).
- Source direction checked: Britannica describes Vanga/Banga as an ancient Bengal kingdom with early Sanskrit references and obscure early history until Mauryan incorporation in the 3rd century BCE; this supports keeping `bengal_mahaj` as a cautious eastern owner rather than a blank lane (`https://www.britannica.com/place/Vanga`, `https://www.britannica.com/place/West-Bengal/History`).
- Source direction checked: Britannica's Kosala / mahajanapada material supports the 6th-century BCE northern Indian great-state landscape, while Mauryan Empire material supports the c.321 BCE imperial consolidation from Pataliputra (`https://www.britannica.com/place/Kosala`, `https://www.britannica.com/topic/mahajanapada`, `https://www.britannica.com/place/Mauryan-Empire`).

## v159 Early South Asia Late Harappan Owner-Chain Pass
- Implemented v159 data edits for `late_harappan_nw`, `late_harappan_fringe`, `vedic`, `vedic_nw`, `mahajanapadas`, `gandhara`, and `bengal_mahaj`.
- Added `late_harappan_nw` as a 1900-1500 BCE northwest successor block between Mature Harappan core and Vedic Northwest. It is categorized as a confederated/regional archaeological owner, not a restored Harappan empire.
- Added `late_harappan_fringe` as a 1900-1500 BCE half-width fringe successor block. Its left and right orthogonal cutouts are filled by `ganges_chalcolithic` and `south_prehistoric`, so the Harappan contraction is owner-conserving rather than blank.
- Enriched Vedic, Mahajanapada, Gandhara, and Bengal-state lanes with descriptions, detail metadata, center coordinates, category assignments, territory notes, and English/Chinese wiki slugs.
- Added 9 South Asia relationship links: Mature Harappan -> Late Harappan NW, Harappan Fringe -> Late Harappan Fringe, Late Harappan Fringe contacts to Ganges-Yamuna and southern owners, Late Harappan -> Vedic lanes, Vedic -> Mahajanapadas, Vedic NW -> Gandhara, Mahajanapadas -> Maurya, and Gandhara -> Maurya NW.
- Updated README owner-fragment semantics and active assets to `v159`.

## v159 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=159`, `print.css?v=159`, and `app.js?v=159`.
- Data integrity passed with 719 entities, 369 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, 0 slot overlaps, 0 invalid notch owners, all v159 target metadata present, all required v159 links present, and no remaining South Asia gap over the Late Harappan -1900 to -1500 bridge.
- Headless Chrome/CDP over a temporary local server loaded `v159`; desktop rendered 719 dynasty blocks / 244 territory fill pieces / 369 connection paths, confirmed `late_harappan_fringe` computes an orthogonal polygon clip, confirmed Ganges-Yamuna and Southern Cultures owner fill pieces, and reported 0 runtime issues / 0 body-level horizontal overflow.
- 390px Chinese mobile loaded `v159`, rendered 719 blocks / 244 fill pieces / 369 connection paths, localized the new South Asia labels, confirmed `晚期哈拉帕边缘区` has the same polygon clip and owner fills, opened the Chinese detail panel with `疆域语义`, `主人`, `承接`, and `没有无主哈拉帕空档` language, and had 0 body-level horizontal overflow.
- Cleanup confirmed no listeners remained on ports 8765 or 9239.

## v160 Audit Notes
- Data already contained five `category: 'culture'` entities (`sumer`, `anatolia_early`, `hattians`, `canaanite`, `arabia_prehistoric`), but `ENTITY_CATEGORIES`, the top category toolbar, the legend, and CSS category accents did not expose culture as a reachable category.
- Several high-visibility cultural or archaeological owner lanes were forced into `confederation`, including `late_harappan_nw`, `late_harappan_fringe`, `vedic`, `vedic_nw`, and `bantu_expansion`; in Chinese detail panels this appeared as `联邦`, which overstates state structure and conflicts with their own territory notes.
- The remaining no-ownerless-gap work is no longer mainly about polygon suppression. A higher-value next layer is semantic labeling: when a lane is a cultural horizon, migration/process owner, or archaeological sequence, the UI category should say that directly instead of hiding the distinction.

## v160 Culture Category / Semantic Label Pass
- Added first-class `culture` category metadata with `Culture` / `文化圈` labels, aliases for cultural horizon / archaeological culture wording, a toolbar chip, a legend item, a CSS dot, and a block accent style.
- Broadened the old `confederation` visible category label to `League` / `联盟`, while preserving `Confederation`, `Federation`, `联邦`, and `邦联` as accepted URL aliases.
- Added category-alias parsing so restored category URLs match canonical keys, visible labels, English aliases, and Chinese aliases.
- Normalized category URLs after alias restoration, so legacy links such as `category=联邦` activate the `confederation` key and rewrite to canonical `category=confederation`.
- Reclassified 43 additional obvious cultural/process owner lanes to `category: 'culture'`, bringing total culture entities to 48. The pass covers early East Asia, early Europe, the South Asia Harappan-to-Vedic owner chain, BMAC/Yuezhi, Bantu/Nok, early Americas/Andes/Maya cultural lanes, and early Southeast Asian cultural baselines.
- Updated README category and owner-fragment semantics and bumped active assets to `v160`.

## v160 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=160`, `print.css?v=160`, and `app.js?v=160`.
- VM data integrity passed with 719 entities, 369 connections, category counts of `culture: 48`, `confederation: 24`, `empire: 187`, `kingdom: 149`, `republic: 81`, `colonial: 44`, `caliphate: 22`, `dynasty: 10`, `nomadic: 10`, and `none: 144`; there were 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, 0 unknown categories, and 0 category-alias failures.
- Headless Chrome/CDP desktop loaded `v160`, showed 10 category chips, restored `category=culture`, rendered exactly 48 culture blocks / stats `48`, applied `category-culture` to all rendered blocks, and confirmed `late_harappan_fringe` is now a culture block.
- Headless Chrome/CDP legacy-alias check loaded `?category=联邦&lang=cn`, activated the `联盟` chip, rendered 24 league/confederation blocks / stats `24`, and normalized the URL category to `confederation`.
- 390px Chinese mobile loaded `?lang=cn&category=culture`, rendered 48 culture blocks / stats `48`, localized the active chip and aria label to `文化圈`, opened `晚期哈拉帕边缘区` with `文化圈`, `主人`, and `没有无主哈拉帕空档` language, confirmed the panel no longer contains `联邦`, and had 0 body-level horizontal overflow.

## v161 Audit Notes
- Post-v160 metadata audit ranked Africa as the next highest-value target after South Asia: the long early `horn_prehistoric`, `nubia_prehistoric`, `maghreb_prehistoric`, `sahel_prehistoric`, `coast_prehistoric`, and `southern_prehistoric` lanes still lacked category, detail, center, territory-note, and relationship depth.
- Design direction: these early African lanes should not become fake kingdoms or blank land. Use first-class `culture` owners for inhabited archaeological, pastoral, settlement, rock-art, and migration/process horizons, and add explicit links to later named polities.
- Design direction: clean chronological succession in the same simplified lane should stay full-width unless a simultaneous adjacent or explicitly linked remote owner carries a missing piece. For v161, the stronger fix is owner labels, dates, metadata, and links; no new artificial polygon cutouts were added.

## v161 Source Notes
- Source direction checked: Britannica's Da'amat article supports treating D'mt as a northern Ethiopian/Eritrean highland polity tied to South Arabian trade, which justifies a Horn cultural owner before D'mt rather than a blank lane (`https://www.britannica.com/place/kingdom-of-Daamat`).
- Source direction checked: Britannica's Aksum article supports the Axumite rise around the 1st century CE in the Ethiopian/Eritrean and Red Sea trade world, preserving the Horn lane sequence from D'mt to Pre-Axumite to Axum (`https://www.britannica.com/place/Aksum-ancient-kingdom-Africa`).
- Source direction checked: the Institute for the Study of Ancient Cultures' Kerma page supports Kerma as an early powerful Nubian state centered near the third cataract, emerging after earlier Nubian cultural horizons (`https://isac.uchicago.edu/museum-exhibits/nubia/kerma-culture`).
- Source direction checked: UNESCO's Tassili n'Ajjer page supports a long Saharan rock-art and environmental-change cultural landscape, justifying the Maghreb/Sahara cultural-owner lane before Phoenician coastal ports (`https://whc.unesco.org/en/list/179/`).
- Source direction checked: Cambridge World History material on the Tichitt tradition supports early Sahelian complexity before medieval Ghana/Wagadu; Britannica Ghana supports Ghana/Wagadu as the first great medieval western African trading empire, especially visible by the 7th-9th centuries (`https://www.cambridge.org/core/books/abs/cambridge-world-history/tichitt-tradition-in-the-west-african-sahel/FA8A6F2725008517F6ABD93007B96405`, `https://www.britannica.com/place/Ghana-historical-West-African-empire`).
- Source direction checked: the Metropolitan Museum's Nok essay supports dating Nok terracotta and early ironworking to about 500 BCE-200 CE, so v161 moves `nok` from 300-500 CE to -500-200 and adds a cautious `coast_post_nok` bridge before Ife (`https://www.metmuseum.org/essays/nok-terracottas-500-b-c-200-a-d`).
- Source direction checked: Bostoen's Bantu Expansion overview and UNESCO's San Living Cultural Landscape tentative listing support treating southern Africa as a long hunter-gatherer / pastoral / rock-art lane before the Bantu-speaking farming and ironworking process becomes visible (`https://www.bantufirst.ugent.be/wp-content/uploads/2024/01/The-Encyclopedia-of-Ancient-History-2023-Bostoen-Bantu-Expansion.pdf`, `https://whc.unesco.org/en/tentativelists/6096/`).

## v161 Early Africa Cultural-Owner Pass
- Reclassified six early African predecessor lanes as `culture`: Horn Cultures, Nubian Cultures, Maghreb Cultures, Sahel Cultures, Coastal Cultures, and Southern Cultures.
- Corrected Nok Culture to -500 to 200 and added `coast_post_nok` for 200-500 so the Guinea Coast lane now runs Coastal Cultures -> Nok -> Post-Nok -> Ife without an ownerless gap.
- Marked Phoenician Colonies as `colonial` and added a territory note clarifying that it is a coastal Levantine port network, not all inland Maghreb.
- Added descriptions, detail metadata, representative centers, territory notes, Wikipedia mappings, and 9 relationship links tying D'mt, Kerma, Phoenician Africa, Carthage, Ghana/Wagadu, Nok, Post-Nok, Ife, and Bantu Expansion back to their predecessor owners.
- Updated README owner-fragment semantics and bumped active assets to `v161`.

## v161 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=161`, `print.css?v=161`, and `app.js?v=161`.
- VM data integrity passed with 720 entities, 378 connections, 0 duplicate IDs, 0 missing endpoints, 0 out-of-bounds connections, 0 unknown categories, 0 slot overlaps, all v161 target metadata present, and all 9 required v161 relationship links present.
- Category counts after v161: `culture: 55`, `colonial: 45`, `empire: 187`, `kingdom: 149`, `republic: 81`, `confederation: 24`, `caliphate: 22`, `dynasty: 10`, `nomadic: 10`, and `none: 137`.
- Headless Chrome/CDP over a temporary local server loaded `v161`; desktop rendered 720 dynasty blocks / 378 connection paths and loaded only v161 app/style/print resources.
- Browser regression confirmed `category=culture` renders 55 culture blocks and includes all eight v161 African culture targets; `search=Post-Nok` finds exactly one visible `coast_post_nok` block.
- 390px Chinese mobile loaded `?lang=cn&search=非洲之角文化`, opened `非洲之角文化` with `文化圈`, `非洲之角`, `达姆特`, and cultural-owner language, had 0 body-level horizontal overflow, and emitted no console/page errors. Cleanup confirmed no listeners remained on ports 8765 or 9239.
- Cleanup confirmed no listeners remained on ports 8765 or 9239.

## v162 Audit Notes
- The next highest-value South Asia issue was not a pure metadata gap but a semantic geometry gap: Sri Lanka/Ceylon was still drawn as a full-width Portuguese/Dutch/British island sequence, hiding the Kandyan interior and making colonial rule look like clean whole-island rectangles.
- Design direction: accept split/non-contiguous owner fragments where the simplified grid cannot show the real map. For Sri Lanka, the better abstraction is not "blank interior" or "all Portuguese/Dutch/British"; it is a coastal colonial owner beside an interior Kandyan owner, followed by a full-width British block only after 1815.
- This is a useful pattern for later passes: when a country loses territory, the chart should normally show which neighbor, colonial power, interior polity, cultural owner, or remote fragment receives that piece.

## v162 Source Notes
- Source direction checked: Britannica says Portuguese control covered a considerable part of Sri Lanka but excluded the Central Highlands and eastern coast, and that Kandy became the independent Sinhalese kingdom resisting Portuguese pressure (`https://www.britannica.com/place/Sri-Lanka/The-Portuguese-in-Sri-Lanka-1505-1658`).
- Source direction checked: Britannica's Dutch-rule section says the VOC first controlled coastal lands, later expanded through southern/western/eastern areas, and that the Dutch replaced the Portuguese as masters of coastal Sri Lanka (`https://www.britannica.com/topic/history-of-Sri-Lanka/Dutch-rule-in-Sri-Lanka-1658-1796`).
- Source direction checked: Britannica's Kandy article describes Kandy as an independent monarchy at the end of the 15th century, surviving Portuguese and Dutch attacks before British subjugation (`https://www.britannica.com/place/Kandy-historical-kingdom-Sri-Lanka`).
- Source direction checked: Britannica's British Ceylon article says the British took Dutch possessions in 1796, maritime Ceylon was confirmed in 1802, and Kandy was taken over in 1815 (`https://www.britannica.com/place/Sri-Lanka/British-Ceylon-1796-1900`).
- Source direction checked: Britannica's Kandyan Convention article says the 1815 agreement annexed Kandy to British holdings and gave Britain complete control of the island (`https://www.britannica.com/event/Kandyan-Convention`).
- Source direction checked: UNESCO's Polonnaruwa page supports Polonnaruwa as Sri Lanka's second capital after Anuradhapura's destruction and notes Chola monuments plus Parakramabahu I's 12th-century city (`https://whc.unesco.org/en/list/201/`).
- Source direction checked: Britannica's Sri Lanka page supports independence in 1948 and republic/name change in 1972 (`https://www.britannica.com/place/Sri-Lanka`).

## v162 Sri Lanka/Ceylon Split-Owner Pass
- Split the old full-width colonial Ceylon rectangles into Portuguese Coastal Ceylon (1505-1658), Dutch Ceylon (1658-1796), British Coastal Ceylon (1796-1815), Kandyan Kingdom (1505-1815), and full-width British Ceylon (1815-1948).
- Added owner-filled orthogonal polygons: the three coastal colonial blocks notch into the Kandyan interior, while the Kandyan block's left edge is filled by the Portuguese, Dutch, and early British coastal phases. This makes the island read as interlocking territory instead of a trapezoid, rectangle, or blank interior.
- Enriched `chola_lanka`, `polonnaruwa`, `lanka_transitional`, `portuguese_lanka`, `kandyan_kingdom`, `dutch_lanka`, `british_lanka`, `british_lanka_unified`, and `sri_lanka` with descriptions, details, centers, categories, territory notes, short labels for narrow blocks, and English/Chinese Wikipedia mappings.
- Added 9 new Sri Lanka/Ceylon relationship links plus updated Ceylon independence to connect from `british_lanka_unified`.
- Updated README split-owner semantics and active assets to `v162`.

## v162 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=162`, `print.css?v=162`, and `app.js?v=162`.
- VM data integrity passed with 722 entities, 387 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 out-of-bounds entities, 0 unknown categories, 0 slot overlaps, all v162 target metadata present, and all required v162 links present.
- Category counts after v162: `culture: 55`, `dynasty: 10`, `empire: 188`, `kingdom: 152`, `republic: 81`, `confederation: 24`, `colonial: 49`, `nomadic: 10`, `caliphate: 22`, and `none: 131`.
- Shape audit confirmed `portuguese_lanka`, `dutch_lanka`, and `british_lanka` clip into `kandyan_kingdom`, while `kandyan_kingdom` clips into `portuguese_lanka`, `dutch_lanka`, and `british_lanka`; no v162 shape was suppressed.
- Headless Chrome/CDP over a temporary local server loaded `v162`; desktop rendered 722 dynasty blocks / 387 connection paths / 250 territory fill pieces, loaded only v162 resources, and confirmed the four Sri Lanka/Ceylon split-owner clips and fill owners.
- Browser label QA confirmed narrow face labels `Port.`, `VOC`, `Brit.`, `Kdy`, and `Ceylon` had 0 label overflow and 0 block overflow.
- 390px Chinese mobile loaded `?lang=cn&search=康提王国`, opened `康提王国` with `疆域语义`, `内陆`, and `沿海` split-owner language, had 0 body-level horizontal overflow, and retained the Kandyan polygon clip. Cleanup confirmed no listeners remained on ports 8765 or 9239.

## v163 Audit Notes
- Post-v162 metadata audit found the highest-scoring individual weak blocks were all early Central Asia placeholders: `mountain_bronze`, `afghan_prehistoric`, and `kazakh_bronze`, each missing description, detail metadata, representative center, category, territory note, and relationship links.
- Region-level scoring still ranks Middle East and East Asia as broad next targets, but these three early Central Asian lanes are more directly aligned with the user's current concern: long rectangles must not read as ownerless land or fake unified states.
- Design direction: early Central Asian Steppe, Mountain, and Afghan lanes should become cultural / archaeological owner strips. They should remain full-width because they are parallel simplified ecological-cultural lanes, not a documented partial conquest where another visible owner carries a missing piece.

## v163 Source Notes
- Source direction checked: Britannica's Kazakhstan history page says modern Kazakhstan's varied landscape precluded a unified prehistoric culture across the whole area and that the Bronze Age Andronovo culture spread over much of Kazakhstan before Scythian-associated nomadic periods (`https://www.britannica.com/topic/history-of-Kazakhstan`).
- Source direction checked: Britannica's Central Asia history page emphasizes the steppe as a vast grassland zone essential to nomadic empires and cautions against overconfident ethnic/language attribution where evidence is insufficient (`https://www.britannica.com/place/history-of-Central-Asia-102306`).
- Source direction checked: Britannica's Afghanistan arts / archaeology section notes Paleolithic and Neolithic occupation, Bronze Age sites before and after the Indus civilization, lapis lazuli export from Badakhshan, and Shortughai near the Amu Darya with Indus links (`https://www.britannica.com/place/Afghanistan/The-arts-and-cultural-institutions`).
- Source direction checked: UNESCO Sarazm supports a 4th-to-late-3rd-millennium BCE proto-urban Central Asian settlement between mountain pastoralists and agrarian valleys, with metallurgy, handicrafts, and long-distance exchange linking steppe, Turkmenian, proto-Elamite, Mesopotamian, and Indus worlds (`https://whc.unesco.org/en/list/1141/`).
- Source direction checked: UNESCO Tanbaly supports Bronze Age to later pastoral occupation, petroglyphs, burial grounds, and social/ritual evidence in the Chu-Ili mountain landscape, making the steppe / mountain cultural-owner framing more honest than a blank lane (`https://whc.unesco.org/en/list/1145/`).
- Source direction checked: the British Museum describes BMAC / Oxus Civilization as a Bronze Age culture along the upper Amu Darya in Turkmenistan, Afghanistan, southern Uzbekistan, and western Tajikistan, with sites including Gonur, Dashly, and Mundigak (`https://www.britishmuseum.org/collection/object/A_1880-3710-a`).

## v163 Early Central Asia Cultural-Owner Pass
- Reclassified `kazakh_bronze`, `mountain_bronze`, and `afghan_prehistoric` as first-class `culture` entities with territory notes, descriptions, detail metadata, representative centers, short block-face labels, and English/Chinese Wikipedia mappings.
- Enriched `scythians` as the Saka / Scythian nomadic successor to the Bronze Age steppe lane, with its own description, detail metadata, center, short labels, territory note, and wiki mapping.
- Added 9 relationship links: BMAC to Afghan, mountain, and steppe cultural contacts; BMAC to early Sogdiana continuity; mountain cultures to Sogdian continuity; steppe cultures to Saka/Scythian succession; and mountain/Afghan/steppe edges into Achaemenid satrapal or frontier fragments.
- Updated README owner-fragment semantics and active assets to `v163`.

## v163 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=163`, `print.css?v=163`, and `app.js?v=163`.
- VM data integrity passed with 722 entities, 396 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 out-of-bounds entities, 0 slot overlaps, all v163 target metadata present, all required v163 links present, and target short labels present.
- Category counts after v163: `culture: 58`, `dynasty: 10`, `empire: 188`, `none: 128`, `kingdom: 152`, `republic: 81`, `confederation: 24`, `colonial: 49`, `nomadic: 10`, and `caliphate: 22`.
- Shape audit confirmed the v163 targets remain full-width owner strips (`clip-path: none`) by design; no decorative cutouts were added because these lanes are parallel cultural owners rather than simultaneous partial-control losses.
- Headless Chrome/CDP over a temporary local server loaded `v163`; desktop rendered 722 dynasty blocks / 396 connection paths / 250 territory fill pieces, loaded only v163 resources, and confirmed `Steppe`, `Mt.`, `Afghan`, and `Saka` short labels had 0 overflow.
- Browser category regression confirmed `?category=culture` renders 58 culture blocks, stats show `58`, and `kazakh_bronze`, `mountain_bronze`, and `afghan_prehistoric` are all included with no non-culture blocks visible.
- 390px Chinese mobile loaded `?lang=cn&search=山地文化`, opened `山地文化` with `疆域语义`, `文化圈`, and `萨拉兹姆` content, had 0 body-level horizontal overflow, and had no target-label overflow. Cleanup confirmed no listeners remained on ports 8765 or 9239 and the temporary Chrome profile was removed.

## v164 Audit Notes
- Post-v163 audit ranked Southeast Asia's late medieval / early modern placeholder blocks as a high-value target: `post_srivijaya`, `khmer_late`, `fragmented_burma`, `cambodia_post`, and `islamic_sultanates` were long, broad blocks with weak or missing descriptions, categories, centers, territory notes, and relationship links.
- Design direction: when the simplified Southeast Asia grid can identify a concrete receiving power, use owner-filled orthogonal notches; when it cannot honestly model all neighbors, use a plural `confederation` / league owner and explicit territory text rather than fake precision or blank space.
- Design direction applied: Late Khmer and Post-Angkor Cambodia use Siam-facing notches carried by Thai/Siamese phases; Post-Srivijaya uses a late Java-facing notch carried by Majapahit pressure. Fragmented Burma and Java's Islamic sultanates remain full-width plural-owner fields because their internal mosaics are not a single neighboring land transfer.

## v164 Source Notes
- Source direction checked: Britannica's Srivijaya article supports the 1025 Chola raid weakening Palembang and mentions Malayu/Jambi in the post-Srivijaya context (`https://www.britannica.com/place/Srivijaya-empire`).
- Source direction checked: Britannica's Palembang article supports Palembang as Srivijaya's capital, the shift toward Jambi, and later Majapahit domination/destruction pressure (`https://www.britannica.com/place/Palembang`).
- Source direction checked: Britannica's Malacca Sultanate article supports Paramesvara's founding, Malacca's command of the India-China sea route, and the 1511 Portuguese conquest (`https://www.britannica.com/place/sultanate-of-Malacca`).
- Source direction checked: Britannica's Khmer Empire and Cambodia decline pages support the 1431 sack of Angkor, move toward Lovek, and reduction of Cambodia under Tai pressure (`https://www.britannica.com/topic/Khmer-Empire`, `https://www.britannica.com/place/Cambodia/The-decline-of-Angkor`).
- Source direction checked: Britannica's Myanmar history says Pagan was no longer Myanmar's center of power by 1300; Britannica Ava and Mon kingdom entries support Ava, Shan, Mon/Hanthawaddy, Pegu, and Toungoo-era successor framing (`https://www.britannica.com/topic/history-of-Myanmar`, `https://www.britannica.com/place/Ava`, `https://www.britannica.com/place/Mon-kingdom`).
- Source direction checked: Britannica Toungoo supports treating Toungoo as the second Burmese empire / reunification successor (`https://www.britannica.com/topic/Toungoo-dynasty`).
- Source direction checked: Britannica Demak / Indonesia / Majapahit and Jakarta / VOC pages support a plural Java Islamic-sultanate field after Majapahit and the 1619 Batavia/VOC transition (`https://www.britannica.com/place/Demak`, `https://www.britannica.com/place/Majapahit-empire`, `https://www.britannica.com/place/Jakarta/History`, `https://www.britannica.com/topic/Dutch-East-India-Company`).
- Source direction checked: Britannica Philippines history and Spanish-period pages support Spanish colonization from 1565, Manila's colonial role, and persistence of local cultures under colonial rule (`https://www.britannica.com/topic/history-of-Philippines`, `https://www.britannica.com/place/Philippines/The-Spanish-period`).

## v164 Late Southeast Asia Owner-Semantics Pass
- Reclassified and enriched `post_srivijaya`, `khmer_late`, `fragmented_burma`, `malacca`, `cambodia_post`, `islamic_sultanates`, `spanish_phil`, and `pagan` with descriptions, detail metadata, representative centers, territory notes, short block-face labels, and English/Chinese Wikipedia mappings.
- Added orthogonal owner-filled notches: `post_srivijaya` late left edge is filled by `majapahit`; `khmer_late` right edge is filled by `sukhothai` and `ayutthaya_rise`; `cambodia_post` right edge is filled by `ayutthaya`, `toungoo_siam`, `ayutthaya_restored`, `thonburi`, and `rattanakosin`.
- Added 9 relationship links tying Srivijaya Strait -> Post-Srivijaya -> Malacca, Khmer -> Late Khmer -> Post-Angkor Cambodia, Pagan -> Fragmented Burma -> Toungoo, Majapahit -> Islamic Sultanates -> VOC Java, and Barangays -> Spanish Philippines.
- Updated README owner-fragment semantics and active assets to `v164`.

## v164 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=164`, `print.css?v=164`, and `app.js?v=164`.
- VM data integrity passed with 722 entities, 405 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 out-of-bounds entities, 0 slot overlaps, all v164 target metadata present, all required v164 relationship links present, and all expected notch owners resolved.
- Category counts after v164: `culture: 58`, `dynasty: 10`, `empire: 188`, `none: 124`, `kingdom: 153`, `republic: 81`, `confederation: 27`, `colonial: 49`, `nomadic: 10`, and `caliphate: 22`.
- Shape audit confirmed v164 target fill owners: `post_srivijaya` -> `majapahit`; `khmer_late` -> `sukhothai` / `ayutthaya_rise`; `cambodia_post` -> `ayutthaya` / `toungoo_siam` / `ayutthaya_restored` / `thonburi` / `rattanakosin`.
- Headless Chrome/CDP over a temporary local server loaded `v164`; desktop rendered 722 dynasty blocks / 405 connection paths / 258 territory fill pieces, loaded only v164 app/style/print resources, and confirmed all v164 short labels had 0 overflow.
- Browser detail checks opened `cambodia_post` and confirmed `Post-Angkor`, `Ayutthaya`, and `Territorial Reading` text. 390px Chinese mobile loaded `?lang=cn&search=后室利佛逝`, opened `后室利佛逝诸国` with `疆域语义` and `满者伯夷` owner-fill language, had 0 body-level horizontal overflow, and preserved the v164 fill-piece count.

## v165 Audit Notes
- Post-v164 metadata audit found the Americas still had high-value long broad placeholders: `epiclassic` and `postclassic` were missing descriptions, detail metadata, representative centers, categories, territory notes, links, and owner semantics.
- The weak area was specifically the Mesoamerican strip between central Mexico and the Maya lane. The old chart left 650-900 and 1168-1428 as visual gaps in the slot where southern / Gulf / Oaxaca / Cholula / Mixtec-Puebla networks should carry continuity.
- Design direction: replace the two old central rectangles with central plural-owner fields plus narrow corridor fragments. The central blocks should notch into corridor owners, and the corridor owners should notch into Maya continuities, making the simplified "lost width" visibly owned without pretending to draw a literal map.

## v165 Source Notes
- Source direction checked: UNESCO's Xochicalco page supports treating Xochicalco as a fortified political, religious, and commercial center in the 650-900 period after the breakup of major Mesoamerican states including Teotihuacan, Monte Alban, Palenque, and Tikal (`https://whc.unesco.org/en/list/939/`).
- Source direction checked: Britannica's Xochicalco page supports Xochicalco as an ancient fortified city near Cuernavaca / Morelos (`https://www.britannica.com/place/Xochicalco`).
- Source direction checked: Britannica's Toltec article supports the Toltecs of Tula in central Mexico as an Early Postclassic power from about 900 to 1200, with Chichimec disruption in the 12th century (`https://www.britannica.com/topic/Toltec`).
- Source direction checked: Britannica's Tula page supports Tula as the Toltec capital, primarily important from about 850 to 1150 (`https://www.britannica.com/place/Tula-ancient-city-Mexico`).
- Source direction checked: Britannica's Aztec establishment page supports 1428 as Itzcoatl's alliance with Texcoco and Tlacopan and the resulting Aztec dominance in central Mexico (`https://www.britannica.com/topic/Aztec/Establishment-of-the-Aztec-empire`).
- Source direction checked: Britannica's Texcoco page supports the 1428 destruction of Azcapotzalco and the Triple Alliance involving Texcoco, Tacuba, and Tenochtitlan (`https://www.britannica.com/place/Texcoco`).
- Source direction checked: Britannica's Cholula page supports Cholula as a long-important pre-Hispanic population center and notes its Late Postclassic context (`https://www.britannica.com/topic/pre-Columbian-civilizations/Cholula`).
- Source direction checked: Britannica's Postclassic archaeological-remains page supports the Mixteca-Puebla style in painting, ceramics, and metallurgy, probably evolving at Cholula in Puebla or western Oaxaca (`https://www.britannica.com/topic/pre-Columbian-civilizations/Archaeological-remains-of-Postclassic-civilization`).

## v165 Mesoamerica Owner-Semantics Pass
- Reclassified `epiclassic` and `postclassic` as plural `confederation` / league-style owner fields rather than uncategorized rectangles.
- Added `epiclassic_southern_mesoamerica` (650-900) as a Xochicalco / Gulf-Oaxaca corridor fragment between central Mexico and Maya Classic, and `postclassic_southern_mesoamerica` (1168-1428) as a Cholula / Mixtec-Puebla / Zapotec corridor fragment between central Mexican city-states and Maya Postclassic.
- Added four cascading orthogonal owner-filled notches: `epiclassic` -> `epiclassic_southern_mesoamerica`, `epiclassic_southern_mesoamerica` -> `maya_classic`, `postclassic` -> `postclassic_southern_mesoamerica`, and `postclassic_southern_mesoamerica` -> `maya_post`.
- Added 9 relationship links for Teotihuacan -> Epiclassic, Teotihuacan-Maya contact -> Xochicalco corridor, Epiclassic -> Toltec, Xochicalco corridor -> Toltec-Maya contact, Maya Classic -> Maya Postclassic, Toltec -> Postclassic states, Toltec-Maya contact -> Cholula/Mixtec corridor, Postclassic states -> Aztec, and southern polities -> Aztec tribute frontier.
- Updated README owner-fragment semantics and active assets to `v165`.

## v165 Verification
- Static checks passed: `node --check app.js` and active asset scan with `index.html` loading `styles.css?v=165`, `print.css?v=165`, and `app.js?v=165`.
- VM data integrity passed with 724 entities, 414 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 out-of-bounds entities, 0 slot overlaps, all v165 target metadata present, all required v165 relationship links present, and all v165 notch owners resolved.
- Category counts after v165: `culture: 58`, `dynasty: 10`, `empire: 188`, `none: 122`, `kingdom: 153`, `republic: 81`, `confederation: 31`, `colonial: 49`, `nomadic: 10`, and `caliphate: 22`.
- Shape audit confirmed v165 target fill owners: `epiclassic` -> `epiclassic_southern_mesoamerica`; `epiclassic_southern_mesoamerica` -> `maya_classic`; `postclassic` -> `postclassic_southern_mesoamerica`; `postclassic_southern_mesoamerica` -> `maya_post`.
- Headless Chrome/CDP over a temporary local server loaded `v165`; desktop rendered 724 dynasty blocks / 414 connection paths / 262 territory fill pieces, loaded only v165 app/style/print resources, and confirmed all four v165 target blocks have orthogonal polygon clips and 0 label overflow.
- Browser detail checks opened `postclassic_southern_mesoamerica` and confirmed `Territorial Reading`, `Mixtec`, and `Maya` text. 390px Chinese mobile loaded `?lang=cn&search=乔卢拉-米斯特克`, opened `乔卢拉-米斯特克走廊` with `疆域语义`, `米斯特克`, and `玛雅` owner-fill language, had 0 body-level horizontal overflow, and preserved the v165 fill-piece count.
- Encountered and resolved one browser-QA issue: the first CDP label pass caught overflow on the 0.45-width English face labels `Xoch.+` and `Chol.+`; the block-face labels were shortened to `Xc` and `Ch` while full names remain in the tooltip, aria label, search, and detail panel.

## v167 Sudan / Nile-Darfur Audit Notes
- Post-v165 metadata audit found Africa still had the highest-scoring individual weak row: `funj` was a 1504-1821 whole-lane rectangle with no category, description, detail metadata, representative center, territory note, or relationship links.
- The neighboring Sudan chain was also weak: `sudan_egyptian`, `mahdist`, `sudan_british`, and `sudan` lacked enough metadata to explain how the lane changed owners.
- Design direction: split the simplified Sudan slot into a Nile/Sennar owner and a western Darfur owner where the chart can support it. When the split disappears through incorporation or conquest, return to a full-width successor block rather than cutting decorative notches.

## v167 Source Notes
- Britannica's Sudan history page supports Alodia's collapse around 1500, the Funj move into the Blue Nile / Sennar order, Badi II's westward Kordofan reach, and the Egyptian advance on Sennar in 1821 (`https://www.britannica.com/topic/history-of-Sudan`).
- Britannica's Funj Dynasty page supports Sennar's founding under Amarah Dunqas, Funj expansion into Kordofan and Fazughli, and the Sennar-centered frame for the 16th-19th century Sudanese state (`https://www.britannica.com/topic/Funj-dynasty`).
- Britannica's Egyptian-Ottoman Sudan page supports Muhammad Ali's 1820-21 conquest and the Nile-to-Darfur extent of the Turco-Egyptian system after surrender of the Funj and Darfur rulers (`https://www.britannica.com/topic/history-of-Sudan/Egyptian-Ottoman-rule-over-the-Sudan`).
- Britannica's Darfur page supports Darfur's Egyptian incorporation in the 1870s, Mahdist takeover, Ali Dinar's restored sultanate after 1898, and final British incorporation in 1916 (`https://www.britannica.com/place/Darfur`).
- Britannica's Mahdists page supports the Mahdist theocratic regime from the 1881 revolt through Omdurman in 1898 and Abd Allah's death in 1899 (`https://www.britannica.com/topic/Mahdists`).
- Britannica's Anglo-Egyptian Condominium page supports the 1899 condominium form and the British-dominated reality of Anglo-Egyptian Sudan (`https://www.britannica.com/topic/history-of-Sudan/The-Sudan-under-the-Anglo-Egyptian-Condominium`).
- Britannica's Sudan summary supports the broad chain of Egyptian conquest, Mahdist capture of Khartoum in 1885, British/Egyptian rule until independence in 1956 (`https://www.britannica.com/summary/Sudan`).

## v167 Sudan Owner-Semantics Pass
- Added `funj_early` (1504-1603) as the full-width early Sennar/Funj successor to Christian Nubia after Alodia.
- Recast `funj` as `Funj / Sennar Core` (1603-1821), narrowed it to the Nile/Blue Nile heartland, and gave it an owner-filled Darfur notch for the later western contraction.
- Added `darfur_sultanate` (1603-1874) as the western Sudan owner beside Sennar and later Turco-Egyptian Nile Sudan, with left-edge cutouts filled first by `funj` and then by `sudan_egyptian_nile`.
- Added `sudan_egyptian_nile` (1821-1874) for Turco-Egyptian rule over the Nile/Sennar corridor before Darfur's incorporation; the Darfur-facing edge is filled by `darfur_sultanate`.
- Shortened `sudan_egyptian` to 1874-1885 full width, so Egyptian Sudan becomes visually full only after Darfur is incorporated. Enriched `mahdist`, `sudan_british`, and `sudan` as the successor chain.
- Added 9 relationship links: Christian Nubia -> early Funj, early Funj -> Sennar core / Darfur, Sennar -> Turco-Egyptian Nile Sudan, Darfur -> Egyptian Sudan, Egyptian Sudan -> Mahdist, Mahdist -> Anglo-Egyptian, and Anglo-Egyptian -> independent Sudan.
- Added `block-micro` rendering so ultra-short phases keep interaction and accessible names without illegible text inside a 3px-high block.
- Updated README owner-fragment semantics and active assets to `v167`.

## v167 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=167`, `print.css?v=167`, and `app.js?v=167`.
- VM data integrity passed with 727 entities, 423 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 out-of-bounds entities, 0 slot overlaps, all v167 target metadata present, all required v167 relationship links present, and all v167 notch owners resolved.
- Category counts after v167: `culture: 58`, `dynasty: 10`, `empire: 188`, `none: 119`, `kingdom: 156`, `republic: 81`, `confederation: 31`, `colonial: 51`, `nomadic: 10`, and `caliphate: 23`.
- Shape audit confirmed v167 target fill owners: `funj` -> `darfur_sultanate`; `darfur_sultanate` -> `funj` / `sudan_egyptian_nile`; `sudan_egyptian_nile` -> `darfur_sultanate`.
- Headless Chrome/CDP over a temporary local server loaded only `v167`; desktop rendered 727 dynasty blocks / 423 connection paths / 266 territory fill pieces, confirmed Sudan fill owners `darfur_sultanate`, `funj`, and `sudan_egyptian_nile`, and found no significant target label overflow after the micro-block CSS fix.
- Browser detail checks opened `darfur_sultanate` and confirmed `Territorial Reading`, `Sennar`, and `Egyptian` text. 390px Chinese mobile loaded `?lang=cn&search=达尔富尔`, opened `达尔富尔苏丹国` with `疆域语义`, `森纳尔`, and `土埃` language, had 0 body-level horizontal overflow, and captured no app console/runtime errors.
- Cleanup confirmed the temporary Chrome profile was removed and no validation listeners remained on ports 8765 or 9239.

## v168 Central Asia Khanate Audit Notes
- The post-v167 metadata audit found Central Asia still had several top-scoring weak rows: `kimek`, `kazakh_khanate`, `khiva`, and `kokand` lacked descriptions, detail metadata, centers, territory notes, and relationship links.
- `kokand` incorrectly began in 1507, creating a false full-lane Kokand rectangle more than two centuries before Kokand's city/capital and before the Ming Uzbek rise in Fergana.
- Design direction: treat the simplified khanate-era cross-section as an owner chain, not empty land. Bukhara, Khiva, Kazakh, Fergana/Kokand, Russian protectorate/colonial, and Afghan-route owners can fill each other's edge cutouts when the real map has more neighbors than the grid can show.

## v168 Source Notes
- Britannica's Kipchak page supports the Kimek/Kipchak steppe frame and Mongol incorporation into the Golden Horde world (`https://www.britannica.com/topic/Kipchak-people`).
- Britannica's Kazakh page supports the 1465 Kazakh emergence and the Russian abolition/incorporation sequence of the Kazakh hordes (`https://www.britannica.com/topic/Kazakh`).
- Britannica's Uzbek khanate page supports Bukhara and Khiva emerging from Shaybanid branches after the Timurid loss of Transoxiana, Kokand emerging later, and Russian control in the 1860s-70s (`https://www.britannica.com/place/Uzbek-khanate`).
- Britannica's Kokand page supports Kokand's Fergana location, fort/capital dates in the 1730s-1740s, 19th-century expansion, and Russian annexation in 1876 (`https://www.britannica.com/place/Kokand`).
- Britannica's Bukhara page and Mangit Dynasty page support Bukhara as a Shaybanid/Mangit center, Russian protectorate from 1868, and the 1920 overthrow (`https://www.britannica.com/place/Bukhara`, `https://www.britannica.com/topic/Mangit-dynasty`).
- Oxford Research Encyclopedia abstracts support Khiva/Khorezm as an early-16th-century to 1920 political entity and Bukhara as a Manghit emirate / Russian protectorate before Soviet conquest (`https://oxfordre.com/asianhistory/display/10.1093/acrefore/9780190277727.001.0001/acrefore-9780190277727-e-284`, `https://academic.oup.com/edited-volume/61799/chapter/546317702`).
- Hamilton College's Central Asian History teaching material supports the Fergana beks / Ming Uzbek Shahrukh around 1710, Kokand consolidation around 1740, and Russian annexation in 1876 (`https://academics.hamilton.edu/central-asian-history/keller-russia-expands-east`).

## v168 Central Asia Owner-Semantics Pass
- Added `fergana_begliks` (1507-1710) to carry the Fergana valley and mountain-owner field before Kokand, eliminating the false early Kokand rectangle.
- Changed `kokand` to begin in 1710 and renamed it `Kokand / Fergana Khanate`, with detail text explaining the Ming Uzbek rise, later Kokand capital, expansion, and Russian annexation.
- Enriched `kimek`, `kazakh_khanate`, `shaybanid`, `khiva`, `fergana_begliks`, `kokand`, `mughal_afghan`, `bukhara`, `russian_kazakh`, `russian_khiva`, and `russian_kokand` with categories where missing, descriptions, detail metadata, centers, territory notes, short labels, and wiki mappings.
- Added owner-filled orthogonal notches for the khanate-era chain: `shaybanid` -> `khiva`, `bukhara` -> `khiva` / `russian_khiva`, `khiva` -> `kazakh_khanate` / `russian_kazakh`, `kazakh_khanate` -> `fergana_begliks` / `kokand`, `fergana_begliks` -> `mughal_afghan`, `kokand` -> `mughal_afghan` / `durrani` / `afghanistan_early`, and `russian_kazakh` -> `kokand`.
- Added 14 relationship links from Kimek/Kipchak succession through Mongol / Golden Horde / Kazakh / Shaybanid / Khiva / Fergana / Kokand / Durrani / Bukhara / Russian conquest transitions.
- Updated README, task-plan decisions, and active assets to `v168`.

## v168 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=168`, `print.css?v=168`, and `app.js?v=168`.
- VM data integrity passed with 728 entities, 437 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 out-of-bounds entities, 0 slot overlaps, all v168 target metadata present, all required v168 relationship links present, and all v168 shape owners resolved.
- Category counts after v168: `culture: 58`, `dynasty: 10`, `empire: 189`, `none: 115`, `kingdom: 155`, `republic: 81`, `confederation: 32`, `colonial: 54`, `nomadic: 11`, and `caliphate: 23`.
- Shape audit confirmed v168 target fill owners: `shaybanid` -> `khiva`; `khiva` -> `kazakh_khanate` / `russian_kazakh`; `kazakh_khanate` -> `fergana_begliks` / `kokand`; `fergana_begliks` -> `mughal_afghan`; `kokand` -> `mughal_afghan` / `durrani` / `afghanistan_early`; `bukhara` -> `khiva` / `russian_khiva`; `russian_kazakh` -> `kokand`.
- Headless Chrome/CDP over a temporary local server loaded only `v168`; desktop rendered 728 dynasty blocks / 437 connection paths / 278 territory fill pieces, confirmed all v168 target polygons and fill owners, and found no target label overflow.
- Browser detail checks opened `kokand` and confirmed `Territorial Reading`, `Fergana`, `Afghan`, and `Russian` text. 390px Chinese mobile loaded `?lang=cn&search=浩罕`, opened `浩罕/费尔干纳汗国` with `疆域语义`, `费尔干纳`, `阿富汗`, and `俄` language, had 0 body-level horizontal overflow, and captured no app console/runtime errors.
- Cleanup confirmed the temporary Chrome profile was removed and no validation listeners remained on ports 8765 or 9239.

## v169 Post-Songhai Sahel Audit Notes
- `sahel_fragmented` was the highest-priority weak entity after v168: it was a full gray 1591-1800 rectangle with no category, detail metadata, center, territory note, or relationship links.
- The follow-on full-width Sokoto / French West Africa / modern Sahel blocks also overclaimed the lane: the simplified grid can represent a western/central Niger Bend chain beside an eastern Dendi/Hausaland/Northern Nigeria chain.
- Design decision: this pass intentionally does not model every real-world neighbor. It splits only the durable, source-backed owners needed to remove blank or false-width semantics: Arma/Timbuktu, Dendi, Bambara/Segu, Toucouleur, Sokoto, French West Africa, British Northern Nigeria, and modern successor fragments.

## v169 Source Notes
- Britannica supports Songhai's 1591 defeat by Moroccan firearm forces at Tondibi / Timbuktu / Gao and the failure to restore the empire (`https://www.britannica.com/place/Songhai-empire`).
- EBSCO supports the Arma military caste and Timbuktu-centered pashalik after the Moroccan expedition (`https://www.ebsco.com/research-starters/history/rise-arma-timbuktu`).
- Britannica's western Africa survey supports Dendi as the Songhai royal refuge, Bambara Segu/Kaarta as the Mande successor field, and Arma decline under Tuareg/desert pressure (`https://www.britannica.com/place/western-Africa/The-Islamic-revolution-in-the-western-Sudan`).
- Britannica supports Bambara/Segu under Mamari Kulibali around 1712 and Tukulor conquest/French conquest of the western Sudan chain after 1861/1890 (`https://www.britannica.com/place/Bambara-states`, `https://www.britannica.com/place/Tukulor-empire`).
- Britannica supports the 1804 Usman dan Fodio jihad, Sokoto/Gwandu capitals, British conquest of Sokoto in 1903, French West Africa's federation, Northern Nigeria's colonial frame, and 1960 independence transitions (`https://www.britannica.com/place/western-Africa/The-jihad-of-Usman-dan-Fodio`, `https://www.britannica.com/place/Nigeria/The-arrival-of-the-British`, `https://www.britannica.com/place/French-West-Africa`, `https://www.britannica.com/place/Nigeria/Nigeria-as-a-colony`).

## v169 Post-Songhai Sahel Owner-Semantics Pass
- Added `arma_timbuktu`, `songhai_dendi`, `bambara_states`, `toucouleur_empire`, `british_northern_nigeria`, and `nigeria_north_modern`.
- Removed the old `sahel_fragmented` placeholder and narrowed `sokoto`, `french_west`, and `sahel_modern` so each block represents a defensible sub-lane rather than the whole Sahel.
- Added v169 owner-filled shapes: `arma_timbuktu` -> `songhai_dendi`; `bambara_states` -> `songhai_dendi` / `sokoto`; `songhai_dendi` -> `arma_timbuktu` / `bambara_states`; `sokoto` -> `bambara_states` / `toucouleur_empire` / `french_west`; `toucouleur_empire` -> `sokoto`; `french_west` -> `sokoto` / `british_northern_nigeria`; `british_northern_nigeria` -> `french_west`; `sahel_modern` -> `nigeria_north_modern`; `nigeria_north_modern` -> `sahel_modern`.
- Added 12 relationship links from late Ghana through Mali, Songhai, Arma/Timbuktu, Dendi, Bambara/Segu, Sokoto, Toucouleur, French West Africa, British Northern Nigeria, and the 1960 successor fragments.

## v169 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and current asset scan with `index.html` loading `styles.css?v=169`, `print.css?v=169`, and `app.js?v=169`.
- VM data integrity passed with 733 entities, 449 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 out-of-bounds entities, 0 slot overlaps, all v169 target metadata present, all required v169 relationship links present, and all v169 shape owners resolved.
- Category counts after v169: `culture: 58`, `dynasty: 10`, `empire: 190`, `none: 113`, `kingdom: 158`, `republic: 82`, `confederation: 32`, `colonial: 56`, `nomadic: 11`, and `caliphate: 23`.
- Headless Chrome/CDP loaded only v169 resources; desktop rendered 733 blocks, 449 connection paths, and 292 territory fill pieces. The first browser pass caught `Dendi` overflowing by 10px and `Den` by 2px in the 0.28-width lane; the final pass uses `D` on the block face and preserves the full name in detail/search/aria.
- Browser detail checks opened `french_west` and confirmed `Territorial Reading`, `British Northern Nigeria`, and `Sokoto` text. 390px Chinese mobile opened `英属北尼日利亚` with `疆域语义`, `索科托`, and `法属西非`, had 0 body-level horizontal overflow, and captured no app console/runtime errors.
- Cleanup confirmed the temporary Chrome profile was removed and no validation listeners remained on ports 8765 or 9239.

## v170 Post-Maurya Northwest Audit Notes
- `indo_greek` was tied for the highest remaining weak-row score after v169 because it lacked category, description, detail metadata, center, territory note, and relationship links.
- The post-Maurya South Asia chain had a broader semantic weakness: Shunga, Kanva, Indo-Scythian, and Indo-Parthian lacked enough metadata to explain why the chart separates Magadha, the northwest frontier, and Saka/Parthian pressure.
- The v170 design keeps the existing lane count but uses non-contiguous owner-filled cuts for Saka pressure, matching the user's accepted rule that a power may appear as a non-adjacent owner fragment in this abstraction.

## v170 Source Notes
- Britannica supports Shunga as the post-Maurya Magadhan successor founded by Pushyamitra around 185 BCE and notes campaigns against Yavanas / Indo-Greeks (`https://www.britannica.com/topic/Shunga-dynasty`).
- Britannica supports Kanva as the Shunga successor in Magadha around 72-28 BCE and its end around the rise of Andhra/Satavahana power (`https://www.britannica.com/topic/Kanva-dynasty`).
- Britannica supports Indo-Greek scope around Afghanistan, Central Asia, Pakistan, and northwestern India, plus Hellenistic cultural influence and coinage evidence (`https://www.britannica.com/topic/Indo-Greek-kingdom`).
- Encyclopaedia Iranica supports Maues/Saka entry into northwestern India, Indo-Greek coinage inheritance, and Taxila/Kashmir/Hazara provincial evidence (`https://www.iranicaonline.org/articles/indo-scythian-dynasty-1/`).
- Britannica supports Gondophernes as Indo-Parthian ruler in Arachosia, Kabul, and Gandhara with inscriptional evidence near Peshawar (`https://www.britannica.com/biography/Gondophernes`).

## v170 Post-Maurya Northwest Owner-Semantics Pass
- Added metadata for `shunga`, `kanva`, `indo_greek`, `indo_scythian`, and `indo_parthian`: categories, descriptions, details, centers, territory notes, rulers, and wiki mappings.
- Added Saka-filled orthogonal notches: `indo_greek` -> `indo_scythian` for -30 to -10 BCE and `indo_parthian` -> `indo_scythian` for -10 to 30 CE.
- Added 7 relationship links across the chain from Maurya -> Shunga / Indo-Greek, Shunga -> Kanva, Indo-Greek -> Indo-Scythian -> Indo-Parthian -> Kushan, and Saka -> Kushan North India.

## v170 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=170`, `print.css?v=170`, and `app.js?v=170`.
- VM data integrity passed with 733 entities, 456 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 out-of-bounds entities, 0 slot overlaps, all v170 target metadata present, all required v170 relationship links present, and all v170 shape owners resolved.
- Category counts after v170: `culture: 58`, `dynasty: 12`, `empire: 190`, `none: 108`, `kingdom: 161`, `republic: 82`, `confederation: 32`, `colonial: 56`, `nomadic: 11`, and `caliphate: 23`.
- Headless Chrome/CDP over a temporary local server loaded only v170 resources; desktop rendered 733 blocks, 456 connection paths, and 294 territory fill pieces. Indo-Greek and Indo-Parthian used active orthogonal polygon clips, the Saka / Indo-Scythian owner rendered as two fill pieces, and target labels had no overflow.
- Browser detail checks opened `indo_greek`; 390px Chinese mobile confirmed `印度-希腊`, `疆域语义`, `塞人`, and `弥兰陀` text, had 0 body-level horizontal overflow, and captured no app console/runtime errors.
- Cleanup confirmed the temporary Chrome profile was removed and no validation listeners remained on ports 8765 or 9239.

## v171 East Asia / Vietnam Remote-Owner Audit Notes
- After v170, East Asia had the highest aggregate weak-metadata score. The highest-visibility weak blocks were early medieval China/Japan rows such as `asuka`, `sixteen_k`, `e_jin`, `n_wei`, `five_dyn`, `kofun`, and `nara`.
- `chinese_vn` exposed the most important shape-semantics issue: the prior cutout used the northern `sixteen_k` field as an owner, but the Red River commandery/protectorate chain should follow southern or unified Chinese dynasties.
- The correct visual tradeoff is not to add decorative polygons to every north/south Chinese lane. Those entities already sit side by side. The non-contiguous owner chain is needed specifically where the Vietnam lane lacks all real-world mainland administrative neighbors.

## v171 Source Notes
- Britannica's Six Dynasties article supports the Sixteen Kingdoms as northern regimes and Eastern Jin / Southern Dynasties as southern lower-Yangtze courts (`https://www.britannica.com/topic/history-of-China/The-Six-Dynasties`).
- Britannica supports Northern Wei unifying northern China by 439 (`https://www.britannica.com/summary/Wei-dynasty`) and the Three Kingdoms / Jin transition frame (`https://www.britannica.com/event/Three-Kingdoms-ancient-kingdoms-China`).
- Britannica supports Chinese rule in northern Vietnam / Red River delta administration through the Tang decline and independence around 939 (`https://www.britannica.com/place/Vietnam/Vietnam-under-Chinese-rule`).
- Britannica supports Five Dynasties as northern post-Tang regimes and Ten Kingdoms as southern post-Tang regimes (`https://www.britannica.com/event/Five-Dynasties`, `https://www.britannica.com/event/Ten-Kingdoms`).
- The Met and Britannica support the Kofun / Yamato, Asuka, Taika, and Nara transition chain (`https://www.metmuseum.org/essays/kofun-period-ca-3rd-century-538`, `https://www.britannica.com/art/Japanese-art/Asuka-period`, `https://www.britannica.com/place/Japan/The-Taika-reforms`, `https://www.britannica.com/event/Nara-period`).

## v171 East Asia / Vietnam Remote-Owner Pass
- Added metadata for `cao_wei`, `sixteen_k`, `e_jin`, `n_wei`, `five_dyn`, `kofun`, `asuka`, and `nara`, and strengthened categories/territory notes for the surrounding Jin, Shu-Wu, Tang, and Ten Kingdoms chain.
- Replaced the old `chinese_vn` owner list with a full-height cutout filled by Western Han -> Xin -> Eastern Han -> Shu/Wu -> unified Western Jin -> Eastern Jin -> Southern Dynasties -> unified Sui -> Tang -> Ten Kingdoms.
- Added a reusable detail-panel owner audit section: `Cutout Owners` / `缺口承接` lists the concrete owner names and periods from the same `getTerritoryShapePlan()` output used for visible fill pieces.
- Added 18 relationship/cultural links across early medieval China and Japan, including Jin reunification/collapse, Northern Wei, Sui/Tang, Five Dynasties/Ten Kingdoms/Song, Kofun -> Asuka -> Nara, and Baekje Buddhism reaching Japan.
- Shortened narrow English block-face labels caught by browser QA (`16K`, `E. Jin`, `N. Wei`, `5 Dyn.`, `C. Rule`) while preserving full data labels.

## v171 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=171`, `print.css?v=171`, and `app.js?v=171`.
- VM data integrity passed with 733 entities, 474 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 out-of-bounds entities, 0 slot overlaps, 0 invalid notch owners, all v171 target metadata present, all required v171 relationship links present, and all v171 shape owners resolved.
- Category counts after v171: `culture: 58`, `dynasty: 18`, `empire: 190`, `none: 96`, `kingdom: 165`, `republic: 82`, `confederation: 34`, `colonial: 56`, `nomadic: 11`, and `caliphate: 23`.
- Headless Chrome/CDP desktop rendered 733 blocks / 474 connection paths / 297 territory fill pieces, confirmed the `chinese_vn` polygon clip, confirmed the ten expected owner fill pieces in order, and found no target label overflow.
- 390px Chinese mobile opened `北属时期` and confirmed `疆域语义`, `缺口承接`, 西汉, 新, 东汉, 蜀/吴, 西晋统一, 东晋, 南朝, 隋统一, 唐, and 十国, with 0 body-level horizontal overflow and no app console/runtime errors.
- Cleanup confirmed the temporary Chrome profile was removed and no validation listeners remained on ports 8765 or 9239.

## v172 Middle East Persian/Iraq Audit Notes
- After v171, Middle East had the highest aggregate weak-metadata score. The highest-value cluster was the Iranian plateau / Iraq succession chain, where several entities lacked category, detail metadata, center, territory note, and relationship links.
- `timurid_persia` was historically over-broad because it began at 1335 instead of the Timurid conquest of Herat in 1383; `afsharid` was also over-broad because it hid the Zand dynasty and Afsharid Khorasan remnant under one 1736-1796 rectangle.
- The v172 design follows the user's no-ownerless-land rule but avoids fake ornament: add a cut only when another named owner receives the missing piece, including non-contiguous/split owners where the simplified grid lacks every real-world neighbor.

## v172 Source Notes
- Britannica supports the Tahirid, Saffarid, Samanid, Ghaznavid, Seljuk, Khwarazmian, Jalayirid, Timurid, Aq Qoyunlu, and Qajar frames used in v172 (`https://www.britannica.com/topic/Tahirid-dynasty-Muslim-dynasty-of-Khorasan`, `https://www.britannica.com/topic/Saffarid-dynasty`, `https://www.britannica.com/topic/Samanid-dynasty`, `https://www.britannica.com/topic/Ghaznavid-dynasty`, `https://www.britannica.com/event/Battle-of-Dandanqan`, `https://www.britannica.com/topic/Seljuq`, `https://www.britannica.com/topic/Khwarezm-Shah-dynasty`, `https://www.britannica.com/topic/Jalayirid`, `https://www.britannica.com/topic/Timurid-dynasty`, `https://www.britannica.com/biography/Uzun-Hasan`, `https://www.britannica.com/place/Iran/The-Qajar-dynasty-1796-1925`, `https://www.britannica.com/place/Iran/The-Timurids-and-Turkmen`).
- Encyclopaedia Iranica supports Safavid, Nader Shah / Afsharid, and Zand period details, including Zand Persia excluding Khorasan from Shiraz in 1751-94 (`https://www.iranicaonline.org/articles/safavids/`, `https://www.iranicaonline.org/articles/nader-shah/`, `https://www.iranicaonline.org/articles/zand-dynasty/`, `https://www.iranicaonline.org/articles/karim-khan-zand/`).
- The Met supports Seljuk Iranian art/geography, including Merv and Isfahan context (`https://www.metmuseum.org/essays/the-art-of-the-seljuqs-of-iran-ca-1040-1196`).

## v172 Middle East Persian/Iraq Owner-Semantics Pass
- Added `post_ilkhan_persia`, `afsharid_khorasan`, `zand`, and `qajar_rise`.
- Moved `timurid_persia` to 1383-1501 and shortened `afsharid` to 1736-1751; `qajar` now begins as a full-width block only after the 1794-1796 Qajar rise fragment.
- Added metadata, centers, territory notes, wiki mappings, short labels, and 21 relationship links across the Persian/Iraq succession chain.
- Added owner-filled orthogonal cuts for `saffarid`, `samanid_iran`, `post_ilkhan_persia`, `timurid_persia`, `safavid`, and `afsharid_khorasan`, with fill owners including Abbasid Baghdad, Jalayirid, Aq Qoyunlu, Safavid Iraq, and Zand Iran.

## v172 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=172`, `print.css?v=172`, and `app.js?v=172`.
- VM data integrity passed with 737 entities, 495 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 out-of-bounds entities, 0 slot overlaps, 0 invalid notch owners, all v172 target metadata present, all required v172 relationship links present, and all v172 shape owners resolved.
- Category counts after v172: `culture: 58`, `dynasty: 27`, `empire: 193`, `confederation: 36`, `kingdom: 165`, `republic: 82`, `none: 86`, `colonial: 56`, `nomadic: 11`, and `caliphate: 23`.
- Headless Chrome/CDP desktop loaded only v172 resources, rendered 737 blocks / 495 connection paths / 304 territory fill pieces, confirmed v172 target polygon clips and owner fills, and found no target label overflow after shortening `Afsharid Khorasan` to `Kh.`.
- 390px Chinese mobile opened `阿夫沙尔呼罗珊`, confirmed `疆域语义`, `缺口承接`, and `赞德伊朗`, had 0 horizontal overflow, and captured no app console/runtime errors.
- Cleanup confirmed no validation listeners remained on ports 8765 or 9239.

## v173 Europe Frankish/German Split-Owner Audit Notes
- After v172, Europe had the highest aggregate weak-metadata score in the audit. The clearest combined knowledge/visual issue was the German lane: Carolingian successor rows were thin, and `germany_divided` was one undifferentiated rectangle for 1945-1990.
- The v173 design follows the user's no-ownerless-land rule with one added refinement: when a historically meaningful enclave or detached fragment exists, it can appear as an additional same-owner block rather than forcing adjacency.
- West Berlin is therefore modeled as a narrow non-contiguous western-aligned fragment from 1949-1990, separated from West Germany by the East Germany block in the simplified grid.

## v173 Source Notes
- Britannica supports the 843 Treaty of Verdun partition into West Francia, Middle Francia, and East Francia, and frames it as a first stage in the dissolution of Charlemagne's empire (`https://www.britannica.com/event/Treaty-of-Verdun`).
- Britannica supports the German Confederation as 39 German states established by the Congress of Vienna in 1815 and dissolved with Prussia's defeat of Austria in 1866, plus the 1871 German Empire foundation (`https://www.britannica.com/topic/German-Confederation`, `https://www.britannica.com/place/Germany/Germany-from-1871-to-1918`).
- Britannica supports the North German Confederation as a Prussian-led union north of the Main formed in 1867 and merged with the German Empire in 1871; the U.S. Office of the Historian supports the excluded southern states list and the Confederation becoming obsolete in 1871 (`https://www.britannica.com/topic/North-German-Confederation`, `https://history.state.gov/countries/north-german-confederation`, `https://www.britannica.com/place/German-Empire/Establishment-of-the-North-German-Confederation`).
- Britannica and the U.S. Office of the Historian support Germany's four occupation zones, the FRG/GDR formations in 1949, and the 1990 absorption/accession of the GDR into the FRG (`https://www.britannica.com/place/Germany/The-era-of-partition`, `https://history.state.gov/countries/german-democratic-republic`, `https://www.britannica.com/topic/German-reunification`).
- Britannica supports West Berlin's special FRG-aligned status and its isolation as an island within the surrounding GDR (`https://www.britannica.com/place/West-Berlin`, `https://www.britannica.com/place/Berlin/Berlin-divided`, `https://www.britannica.com/topic/Berlin-Wall`).

## v173 Europe Frankish/German Owner-Semantics Pass
- Added rich metadata for the Carolingian split chain (`carolingian_germany`, `w_francia`, `e_francia`, `lotharingia`) and the German state chain (`german_confed`, `north_german_confed`, `south_german_states`, `german_empire`, `weimar`, `allied_occupied_germany`, `west_germany`, `east_germany`, `west_berlin`, `germany_unified`).
- Corrected the German Confederation from a broad 1815-1871 abstraction to an 1815-1866 block, followed by 1866-1871 North German Confederation and South German States fragments. This keeps the lane owner-filled while reflecting that not all German land was inside the Prussian-led northern federation before 1871.
- Replaced `germany_divided` with four source-backed owners: Allied occupation (1945-1949), West Germany / East Germany / West Berlin (1949-1990), and unified Germany (1990-2000).
- Added wiki mappings, representative centers, relationship links, and short face labels (`Conf.`, `NGC`, `Empire`, `Occ.`, `FRG`, `E`) while suppressing the West Berlin face label because the fragment is too narrow for even one Chinese character without overflow.

## v173 Verification
- Static checks passed: `node --check app.js` and `git diff --check`.
- Browser data integrity passed with 742 entities, 509 connections, 0 duplicate IDs, 0 missing endpoints, 0 category errors, 0 out-of-bounds entities, 0 slot overlaps, and all v173 target descriptions/details/capitals/required links present.
- Headless Chrome/CDP desktop rendered 742 blocks, 509 connection paths, and 304 territory fill pieces; loaded only `v173` assets; confirmed `germany_divided` is absent; and found no target label overflow.
- Chinese mobile detail checks passed for `西柏林` and `北德意志邦联`, including the non-contiguous/enclave language for West Berlin and the Prussian/southern-state/1871 empire language for the North German Confederation.

## v174 East Asia Vietnam Owner-Semantics Audit Notes
- After v173, East Asia again scored highest in the metadata-thickness audit. The weakest high-visibility cluster was Vietnam after independence: `le_dynasty` and `nguyen` still acted like broad rectangles where the history needs Mac, restored Le, Trinh, Nguyen Lords, Tay Son, and French colonial owner phases.
- Design decision: represent the most important owner transfers as adjacent rectangular/orthogonal fragments, not trapezoids. The 1545-1592 Le-Mac and 1620-1777 Trinh-Nguyen phases are now paired half-lanes, which answers the no-blank-space concern without pretending to model every real-map neighbor.
- The audit also found old metadata debt outside this pass: 127 entities still lack descriptions, 151 lack detail entries, 161 lack capitals/centers, and 147 lack territory notes. v174 closes the target Vietnam cluster only; the remaining debt should guide the next pass.

## v174 Source Notes
- Britannica supports the 939 independence break, Ly dynasty foundation in 1009, Thang Long, and Dai Viet bureaucratic centralization (`https://www.britannica.com/place/Vietnam/Vietnam-under-Chinese-rule`).
- Britannica supports the Tran, Ho/Ming, Later Le, Mac, Trinh/Nguyen, Tay Son, Nguyen, French, and 1945 transition frames used here (`https://www.britannica.com/place/Vietnam/The-Tran-dynasty`, `https://www.britannica.com/topic/Later-Le-dynasty`, `https://www.britannica.com/topic/Tay-Son-brothers`, `https://www.britannica.com/topic/Nguyen-dynasty`).
- Britannica's precolonial Vietnam overview supports the Dai Viet centralized state, Confucian mandarinate, civil examinations, and agrarian state context (`https://www.britannica.com/topic/history-of-Vietnam/State-and-society-in-precolonial-Vietnam`).

## v174 East Asia Vietnam Owner-Semantics Pass
- Added or enriched 16 target Vietnam entities from `vn_independence` through `vietnam_mod`, replacing the old `le_dynasty` block with a richer Dai Viet owner chain and adding `french_vietnam`.
- Added 17 relationship links across Ly -> Tran -> Ho/Ming -> Later Le -> Mac / restored Le -> Trinh / Nguyen Lords -> Tay Son -> Nguyen -> French Vietnam -> modern Vietnam.
- Added short face labels (`Lý`, `Trần`, `Ng.`, `Mac`, `Lê S.`, `Tay`) where full names were too wide, while preserving full names in detail panels, search, aria labels, and wiki mappings.

## v174 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and current asset scan for `v174`.
- Data integrity passed with 750 entities, 526 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 category errors, 0 out-of-bounds entities, 0 slot overlaps, 0 invalid notch owners, all v174 target descriptions/details/capitals/territory notes present, and all required v174 links present.
- Headless Chrome/CDP desktop rendered 750 blocks; confirmed Mac/restored Le and Trinh/Nguyen half-lanes are contiguous with 0px gaps; confirmed no target label overflow and no document-level horizontal overflow.
- 390px Chinese mobile detail checks passed for `阮主南方` and `法属越南`, including `疆域语义`, 顺化/富春, 郑阮语义, 阮朝宫廷, 东京/安南/交趾支那, 1945, 0 panel/body horizontal overflow, and no console/runtime errors.

## v175 South Asia Early-Medieval Owner-Semantics Audit Notes
- The strongest remaining mismatch with the user's no-blank-space/Tetris feedback was South Asia 543-1296: one Pallava rectangle and one Chola rectangle were doing the work of multiple Deccan and Tamil owners.
- The improved row now treats the southern lane as two adjacent owner lanes: Deccan and Tamil/southeastern. This is a deliberate simplification of real geography, but it prevents a single dynasty from visually absorbing its rivals.
- For periods where a direct neighbor is too complex for the current grid, `deccan_successors` is explicitly labeled as a compressed multi-owner field. This follows the user's suggestion that non-contiguous or composite blocks are preferable to unexplained blank areas.
- Old metadata debt is still present outside the target pass. v175 closes the selected South Asia early-medieval cluster only.

## v175 Source Notes
- Encyclopaedia Iranica supports Kidarite Tokharistan/Gandhara sequencing and the Hephthalite displacement frame (`https://www.iranicaonline.org/articles/kidarites/`, `https://www.iranicaonline.org/articles/hephthalites/`).
- Britannica supports Harsha's 606-647 northern empire and the transition into regional medieval competition (`https://www.britannica.com/biography/Harsha`).
- Britannica supports the Rashtrakuta/Chalukya/Western Chalukya Deccan framing, including the Chalukya 543-757 and later 975-1189 windows and Rashtrakuta replacement context (`https://www.britannica.com/topic/Rashtrakuta-dynasty`, `https://www.britannica.com/biography/Pulakeshin-II`).
- Britannica supports the Pala Bengal-Bihar frame and the Kannauj contest (`https://www.britannica.com/topic/Pala-dynasty`).
- Britannica supports the Ghaznavid, Ghurid, and Delhi Sultanate succession logic used for the northwest-to-Delhi chain (`https://www.britannica.com/topic/Ghaznavid-dynasty`, `https://www.britannica.com/place/Ghurid-sultanate`, `https://www.britannica.com/place/Delhi-sultanate`).

## v175 South Asia Early-Medieval Owner-Semantics Pass
- Added `chalukya_deccan`, `rashtrakuta_deccan`, `chola_rise`, `western_chalukya`, and `deccan_successors`; adjusted `pallava_early`, `pallava`, and `chola` so the south is now an interlocking Deccan/Tamil half-lane sequence.
- Enriched the weak South Asia owner chain: Kidarite, Hephthalite/Huna, Late Gupta, post-Gupta Bengal, Harsha, post-Harsha states, Gurjara-Pratihara, Rajputs, Ghaznavid India, Sena Bengal, and Ghurid India.
- Added metadata, capitals/centers, wiki mappings, territory notes, short labels, and relationship links so detail panels explain the abstraction instead of leaving the user to infer it from block geometry.

## v175 Verification
- Static checks passed: `node --check app.js`, `git diff --check`, and current asset scan for `v175`.
- Data integrity passed with 755 entities, 546 connections, 0 duplicate IDs, 0 duplicate connections, 0 missing endpoints, 0 unknown categories, 0 slot overlaps, 0 invalid notch owners, all v175 target descriptions/details/capitals/territory notes present, and all required v175 links present.
- Headless Chrome/CDP desktop rendered 755 blocks, loaded only `v175` resources, found no target label overflow after shortening `western_chalukya` and `deccan_successors` face labels, and confirmed all seven South Asia half-lane pairings have 0px horizontal gaps.
- 390px Chinese mobile detail checks passed for `罗湿陀罗拘陀德干`, `西遮娄其`, and `德干继承诸邦`, including `疆域语义`, Deccan/Tamil owner-chain wording, 0 body horizontal overflow, and no console/runtime errors.

## v176 Cutout-Owner Interaction Findings
- The chart had become semantically safer than the interface made visible: filled cutout pieces existed on the canvas but were passive and could not explain themselves.
- This created a UX gap exactly around the user's core concern: a clipped edge did have an owner, but the user had to open the clipped source block and read the detail panel to identify that owner.
- v176 makes the fill pieces part of the map grammar: hover/focus shows the receiving owner and years, click/Enter opens the owner, and the source plus owner blocks highlight together.
- The `Cutout Owners` detail-panel section now uses jump links instead of plain text so remote/composite ownership can be followed directly.
- Verification proved the new interactive pieces are present for all 304 owner-fill fragments, do not create body-level horizontal overflow, support mouse and keyboard paths, and do not emit app console/runtime errors in desktop or 390px Chinese mobile checks.

## v178 Mongolia / Steppe Owner-Chain Findings
- The post-v176 audit found East Asia still had the highest metadata debt, with the Mongolia / steppe lane especially weak: Xianbei, Rouran, Göktürk Mongolia, Uyghur Mongolia, Mongol tribes, Northern Yuan, and modern Mongolia were visually present but under-explained.
- The correct improvement was not to force every same-lane succession into a polygon. The user's Tetris-like owner-fill rule applies when a concrete lost strip is carried by another owner; for the continuous Mongolian Plateau lane, the richer fix is named succession, relationship links, centers, and territory semantics.
- v178 adds or enriches descriptions, details, capitals/centers, categories, territory notes, short labels, wiki targets, and 12 relationship links for the Xiongnu -> Xianbei -> Rouran -> Göktürk -> Uyghur -> Khitan -> Liao -> Mongol tribes -> Mongol Empire -> Northern Yuan -> modern Mongolia chain, plus the related `yuan_early` conquest phase.
- Source grounding used Britannica and University of Washington Silk Road references for Xiongnu scope, Tuoba/Xianbei and Northern Wei, Rouran/Juan-juan, Göktürk and Uyghur khaganates, Khitan/Liao, and modern Mongolia.
- Verification passed with 755 entities, 558 connections, all v178 target metadata present, all 12 required relationship links present, no duplicate IDs/connections, no missing endpoints, no unknown categories, no invalid notch owners, and no slot overlaps.
- Browser verification loaded only `v178` resources on desktop and 390px Chinese mobile, rendered 755 blocks and 304 fill pieces, confirmed the target detail text, had 0 horizontal overflow, and captured no console/runtime errors.

## v179 Middle East Late-Antique Owner-Chain Findings
- The post-v178 audit ranked the Middle East as the next high-value row. The weakest cluster was not a single bad trapezoid but an under-explained owner chain around Egypt, Anatolia, the Levant, Sasanian Iraq, Byzantine losses, and Rashidun gains.
- v179 treats the user's no-blank-space concern as a data design problem first: where land contracts, the detail layer should identify the receiving or successor owner. New relationship links now connect Roman Syria/Egypt/Anatolia into Byzantine fragments, then into Rashidun Egypt/Iraq and post-641 Byzantine Anatolia, and finally into Seljuk Rum after Manzikert.
- `byzantine_anatolia` now has its own name, short label, territory note, center, rulers, details, and wiki mapping, so the 641-1071 block reads as a reduced Anatolian heartland rather than a generic rectangle.
- `hittite_kingdom`, `egypt_new`, and `egypt_levant` now have details and centers that explain why early Hittite Anatolia, the Nile core, and Egyptian Levantine hegemony are split instead of drawn as one broad rectangle.
- Source grounding used Britannica for New Kingdom Egypt, Hittites/Kadesh, Ptolemaic Egypt, Roman/Byzantine Egypt, Parthian/Sasanian context, Roman/Byzantine/Seljuk Anatolia, the theme system, and Manzikert.
- Verification passed with 755 entities, 566 connections, all v179 target metadata present, all 8 required relationship links present, no duplicate IDs/connections, no missing endpoints, no unknown categories, no slot overlaps, and target wiki slugs verified.
- Browser verification loaded only `v179` resources on desktop and 390px Chinese mobile, rendered 755 blocks and 304 fill pieces, confirmed the target detail text, had 0 horizontal overflow, found no target label overflow after adding short face labels for `hittite_kingdom`, `egypt_new`, and `egypt_levant`, and captured no page console/runtime errors.

## v181 Britain / Ireland Split-Owner Findings
- The user's latest feedback identified a real abstraction issue: a simplified grid cannot always place every real-world neighbor adjacent to the contracting country, but leaving a blank cutout is still misleading.
- The v181 design accepts non-contiguous blocks as a first-class representation when they are historically meaningful and data-backed. The post-1922 UK is therefore split into a Great Britain core plus a very narrow Northern Ireland fragment, while the Irish Free State / Ireland blocks own the larger island share that left the UK.
- This is better than making one long UK rectangle to 2000 because it exposes three distinct facts: the 1801 union, the 1922 partition/Free State settlement, and the retained Northern Ireland fragment.
- It is also better than inventing a generic "lost land" cutout because the right-edge UK core cut is explicitly filled by `irish_free_state` and `ireland_republic`, with click-through detail and relationship links.
- Source grounding used Britannica and UK Parliament references for the 1707 and 1801 Acts of Union, Tudor/Stuart/British constitutional context, and the Irish Free State / Northern Ireland settlement.
- Early static verification passed with `node --check app.js`, `git diff --check`, and VM data integrity at 760 entities / 575 connections / 0 duplicate IDs / 0 duplicate links / 0 missing endpoints / 0 unknown categories / 0 slot overlaps / 0 invalid notch owners / all v181 target metadata and required links present.
- Browser verification confirmed the all-region page renders 760 blocks and 306 owner-fill pieces, with the UK core cutout filled by `irish_free_state` and `ireland_republic`, only `v181` resources loaded, no body/document overflow, and no page console/runtime errors.
- Europe desktop and 390px Chinese mobile checks confirmed the target labels do not overflow and that the detail panels explain the 1801 union, 1922 partition/Free State split, Northern Ireland as a retained non-contiguous fragment, and Ireland/Republic after 1937/1949.

## v187 Japan Muromachi / Sengoku Owner-Fill Source Notes
- Britannica supports the Heian 794 capital move to Heian-kyo / Kyoto and the court-order frame used for the Heian block (`https://www.britannica.com/place/Japan/The-Heian-period-794-1185`).
- Britannica supports Kamakura as the warrior government / bakufu era after Minamoto no Yoritomo's 1185 victory and 1192 shogunal sanction, with Hojo regency and Mongol-invasion context (`https://www.britannica.com/event/Kamakura-period`).
- Britannica supports Muromachi / Ashikaga as a Kyoto-centered shogunate whose complete control eluded it, with the 1467-77 Onin War leading into the Sengoku "country at war" century (`https://www.britannica.com/event/Muromachi-period`, `https://www.britannica.com/topic/Sengoku-period`).
- Britannica supports the 1573 expulsion of Ashikaga Yoshiaki by Oda Nobunaga and the Azuchi-Momoyama dating/unification frame (`https://www.britannica.com/biography/Ashikaga-Yoshiaki`, `https://www.britannica.com/art/Japanese-architecture/The-Azuchi-Momoyama-period`).
- Britannica supports the Tokugawa/Edo 1603-1867 stability frame and the 1868 Meiji Restoration as the end of Tokugawa rule and start of centralizing modernization (`https://www.britannica.com/event/Tokugawa-period`, `https://www.britannica.com/event/Meiji-Restoration`).

## v187 Japan Muromachi / Sengoku Owner-Fill Findings
- The current audit found that Japan's Heian -> Kamakura -> Muromachi -> Azuchi-Momoyama -> Edo -> Meiji chain existed visually but was under-explained: several blocks lacked details, centers, territory notes, categories, and relationship links.
- Design decision: do not force polygons into every same-lane succession. Heian, Kamakura, Edo, and Meiji are better represented as named political succession with rich details. The concrete owner-conservation problem is late Muromachi: after the Onin War, Ashikaga shogunal control shrank while regional daimyo domains carried the missing political space.
- v187 therefore keeps `muromachi` as the Ashikaga shogunate but gives its late right edge an orthogonal owner-filled cutout. The receiving owner is `sengoku_daimyo`, a composite / non-contiguous owner from 1467 to 1573, so the chart no longer reads the period as an empty strip or a full uniform Muromachi rectangle.
- Added `sengoku_daimyo`, 1467 and 1573 event markers, and 8 relationship links across Nara -> Heian -> Kamakura -> Muromachi -> Sengoku Daimyo / Azuchi-Momoyama -> Edo -> Meiji.
- Verification passed with 772 entities, 643 connections, no duplicate IDs, no missing endpoints, no unknown categories, no invalid notch owners, all v187 Japan target metadata present, all required relationship links present, and the Muromachi shape plan resolving to a Sengoku Daimyo fill from AD 1467 to AD 1573.
- In-app browser verification loaded only `v187` resources. Desktop confirmed the Muromachi custom clip path, the overlapping Sengoku Daimyo block / owner-fill piece, English detail `Territorial Reading`, `Cutout Owners`, and all target relationship links. Chinese detail confirmed `疆域语义`, `缺口承接`, `战国大名`, and "不是空白土地" wording.
- 390px mobile verification confirmed no body horizontal overflow, no target text overflow, visible Muromachi / Sengoku fill geometry, only `v187` resources, and no console/runtime errors.

## v189 Late Southeast Asia Owner-Fill Findings
- The user's refinement is correct: a simplified timeline cannot model every real-world neighbor, but a visible gap still needs a semantic owner wherever the historical record makes one defensible. Non-contiguous or composite owner fragments are preferable to blank land when adjacency cannot be drawn.
- The best v189 target was late Southeast Asia. Several existing blocks were historically meaningful but under-explained: Portuguese/Dutch/British Malacca and Malaysia, Restored Toungoo/Konbaung/British Burma/Myanmar, Rattanakosin/Siam-Thailand beside French Indochina, and the Spanish/American/independent Philippines sequence.
- v189 uses two different tools deliberately:
  - Metadata and relationship chains handle continuous same-lane successions where cutting the block would add noise rather than clarity.
  - Orthogonal owner-filled cutouts handle concrete loss/gain cases: Rattanakosin/Siam-Thailand's late eastern edge is filled by French Indochina and post-1954 Indochina states, while Konbaung's late right edge is filled by British Lower Burma.
- A browser pass exposed a subtle interaction defect: after closing a detail panel, the hidden `.panel-backdrop` could still sit above owner-fill strips in the hit-test stack. Adding `pointer-events: none` to the hidden backdrop and restoring `pointer-events: auto` only for `.visible` keeps fill strips clickable.
- The first British Lower Burma implementation had a counter-notch back into Konbaung. That was semantically defensible but visually too recursive for a narrow recipient strip, so v189 removes it. The main Konbaung cutout remains owner-filled, and the recipient strip stays readable.
- Source grounding used Britannica's Thailand, Malaysia, Straits Settlements, Toungoo, Myanmar, Indochina, Geneva Accords, and Philippines U.S. period pages:
  - `https://www.britannica.com/place/Thailand`
  - `https://www.britannica.com/place/Malaysia/History`
  - `https://www.britannica.com/place/Straits-Settlements`
  - `https://www.britannica.com/topic/Toungoo-dynasty`
  - `https://www.britannica.com/place/Myanmar/History`
  - `https://www.britannica.com/place/Indochina`
  - `https://www.britannica.com/event/Geneva-Accords`
  - `https://www.britannica.com/place/Philippines/The-period-of-U-S-influence`
- Verification passed with 773 entities, 658 connections, 105 events, no duplicate IDs, no missing endpoints, no invalid notch owners, no unresolved shape plans, and all v189 Southeast Asia relationship links present.
- In-app browser desktop loaded only `v189` resources, rendered 319 owner-fill pieces after removing the counter-notch, confirmed the Rattanakosin and Konbaung custom clip paths, opened fill-strip owner details for French Indochina and British Lower Burma, and verified the hidden backdrop no longer blocks clicks.
- 390px Chinese mobile loaded only `v189` resources, had no body horizontal overflow, opened `法属印度支那` from the Siam/Thailand fill strip, and opened `暹罗/泰国` with `缺口承接` links to `法属印度支那` and `印度支那诸国`.

## v190 South Asia Mughal-to-Bangladesh Findings
- The user's criticism of blank or rectangular territory changes applies especially well to South Asia after 1707: Mughal decline is not a simple rectangle shrinking into nothing; the missing political space is carried by Maratha expansion, Bengal/Company power, Durrani/Sikh frontier owners, and later British Raj fragments.
- The best visual improvement was not to cut every block. Same-lane successions such as British Bengal -> Raj Bengal or East Pakistan -> Bangladesh are already visible as owner blocks; extra notches there would create visual noise. The cuts should appear only when a contracting block needs an explicit receiving owner.
- v190 adds three high-signal orthogonal cuts: declining Mughal -> Maratha, nominal Mughal -> British Bengal, and Pakistan's post-1971 remote eastern-wing loss -> Bangladesh.
- The Pakistan/Bangladesh case validates the user's suggestion that non-contiguous blocks can improve precision. The fill piece is intentionally labeled remote/composite: it represents East Pakistan's secession, not literal adjacency to West Pakistan in the abstract row.
- Metadata thickness mattered as much as geometry. The pass added descriptions, details, centers, territory notes, wiki mappings, relationship links, and global events so users can inspect why the pieces exist instead of inferring everything from shape alone.
- Source grounding used Britannica pages for Mughals/Aurangzeb, Maratha Empire/confederacy/wars, Ahmad Shah Durrani, Sikh Wars, British Raj, Partition of India, East Pakistan, and Bangladesh Liberation War.
- Verification passed with 773 entities, 663 connections, 111 events, no duplicate IDs, no missing endpoints, no invalid notch owners, all v190 metadata present, and the three new shape plans resolving to `maratha`, `british_bengal`, and `bangladesh`.
- Browser verification loaded only v190 assets on desktop and 390px Chinese mobile. Desktop confirmed 322 owner-fill pieces and click-through owner details for Bangladesh, Maratha Empire, and British Bengal; mobile confirmed the Chinese remote/composite Pakistan -> Bangladesh label and no horizontal overflow.

## v191 Italy Risorgimento-to-Republic Findings
- The highest-value Europe target was the Italy lane because `italy_states` and `italy_republic` lacked metadata while the existing 1815-1946 chain had several concrete owner-conservation opportunities.
- The key correction is that 1815 Italy is not one restored-state rectangle. v191 keeps the central/southern restoration mosaic as `italy_states`, while `sardinia_piedmont` and `austrian_italy` visibly fill the left and right cutouts. This represents the Savoy unification engine and Austrian Lombardy-Venetia/hegemony without claiming every Italian state belonged to either.
- The 1861 Kingdom of Italy is now drawn with an early owner-filled bite rather than as a fully complete kingdom from day one. `italy_unincorporated` carries the composite Venetia + papal Rome share until the 1866-70 completion of unification.
- The old `fascist_italy` hourglass was removed because it had no receiving owner and therefore behaved like decorative geometry. The concrete territorial split appears only in 1943-45, where co-belligerent Italy and German-occupied / RSI Italy have reciprocal orthogonal cutouts.
- Added 3 new entities, 9 relationship links, 5 Europe event markers, descriptions/details/wiki mappings for 9 Italy targets, and active assets now load `v191`.
- Source grounding used Britannica for the Vienna settlement, Risorgimento, March on Rome, World War II / Italian republic context; the U.S. Office of the Historian for Piedmont-Sardinia; and the National WWII Museum for the 1943 armistice, co-belligerent status, German occupation, and Salò Republic.
- Static and VM verification passed with 776 entities, 672 connections, no duplicate IDs, no missing endpoints, no invalid notch owners, no missing v191 metadata/details/wiki entries, and all required v191 connection links present.
- Shape-plan verification confirmed the new owner-filled pieces: `italy_states` -> `sardinia_piedmont` + `austrian_italy`, `italy_kingdom` -> `italy_unincorporated`, `italy_cobelligerent` -> `nazi_italy_occupation`, and `nazi_italy_occupation` -> `italy_cobelligerent`; `fascist_italy` intentionally has no cutout.
- Browser verification after the final label adjustment passed on desktop and 390px Chinese mobile. The narrow Piedmont-Sardinia and Austrian Italy recipient strips suppress face labels to avoid mobile overflow, but their fill pieces retain Chinese/English owner labels and remain clickable; the Kingdom of Italy fill opens `威尼斯+教皇罗马` with `疆域语义`.

## v192 Label-Fitting Findings
- The leftover v191 mobile issue was not historical modeling but label ergonomics: three old Europe blocks had correct semantics and details but too-long face labels in narrow columns.
- `roman_transalpine_gaul`, `byzantine_exarchate`, and `lombard_italy` now use compact face labels while retaining complete names and historical explanations in the detail layer.
- The first desktop-English QA pass caught a broader weakness: many older narrow blocks had clipped English labels at 0.75 zoom. A render-time fitting pass is better than endless one-off short labels because it protects every redraw, language switch, zoom state, region filter, and future data addition.
- Final browser QA shows no visible face-label overflow on Europe desktop, Europe mobile Chinese, all-region desktop English, or all-region mobile Chinese. The full names remain accessible through search, hover/focus, click, keyboard activation, and detail panels.

## v193 Adaptive Label-Fitting Findings
- Hiding overflow labels is safe but too lossy for a knowledge-rich timeline. v193 improves the visual-information tradeoff by generating compact labels before hiding.
- The automatic labels are intentionally conservative: they are not stored as historical names, and they do not replace detail titles, search targets, wiki mappings, or accessibility labels. They are only face labels for narrow blocks.
- The all-region browser pass shows the payoff: hidden labels dropped from 245 to 2 on desktop English and from 42 to 2 on 390px Chinese mobile, while visible overflow stayed at 0.
- Click verification confirms generated labels do not break identity: `PPR`, `SBP`, and `CG` still open the full `Polish People's Republic`, `Soviet Bloc Poland`, and `Celtic Gaul` panels.
- Remaining hidden labels are only two very tight cases (`benin_early`, `ashanti`) where even the shortest fallback did not fit at the tested all-region scale. They are good candidates for a later data/layout micro-pass, but the v193 fitting behavior keeps them from rendering clipped text.

## v194 Korea Owner-Conservation Findings
- The important distinction is no longer just "does every cutout have an owner?" but "is the owner historically reasonable?" The old 1945-48 Korea block passed the first test but could fail the second because it relied on automatic adjacent-owner resolution.
- v194 replaces `korea_liberation_occupation` with two explicit fragments: `korea_us_occupation` for southern Korea under USAMGIK and `korea_soviet_occupation` for northern Korea under Soviet occupation/civil administration. Their reciprocal cutouts are explicit, full-period, and tied to the 38th-parallel division.
- The validation pass caught a second semantic issue after the split: Japan-proper postwar blocks with decorative left cutouts could accidentally treat the Korean lane as a recipient. Removing those cutouts is better than forcing a false owner just to preserve a polygon.
- The new rule for future passes: automatic adjacent owners are acceptable only when the adjacent lane is semantically intended. High-stakes occupation, partition, or border-transfer cases should use explicit `owners` / `notchOwners`, and purely decorative cutouts should be removed.
- v194 also closes the two remaining v193 hidden-label cases by adding curated face labels for early Benin and Ashanti.

## v194 Korea Source Notes
- U.S. Office of the Historian supports the U.S.-Soviet temporary division of Korea at the 38th parallel after Japanese surrender (`https://history.state.gov/milestones/1945-1952/korean-war`).
- Britannica supports the northern/southern occupation zones and the later separate Korean states (`https://www.britannica.com/place/Korea/Division-of-Korea`).
- U.S. National Archives supports the 38th-parallel division and the separate northern and southern governments under Kim Il Sung and Syngman Rhee (`https://www.archives.gov/education/lessons/korean-conflict`).

## v194 Verification Findings
- Static, VM, and browser checks agree on the new baseline: 777 entities, 673 connections, 320 owner-fill pieces, no duplicate IDs, no missing endpoints, no invalid owner references, no unresolved shape plans, and no old `korea_liberation_occupation` block.
- The browser confirms the intended semantic correction: Korea's only fill pieces are explicit reciprocal U.S./Soviet occupation-zone owners, while post-1926 Japan-proper phases have no accidental Korean owner-fill cutouts.
- All-region label fitting improved beyond v193: after adding curated Benin/Ashanti face labels, the desktop all-region pass found 0 hidden labels and 0 horizontal label overflow.

## v195 Automatic Adjacent-Fill Findings
- The audit found the next failure mode after v194: an automatic adjacent owner can be formally non-blank but historically wrong. In Soviet Central Asia, decorative hourglass/taper shapes made neighboring lanes look like they owned bites of Turkestan, Khorezm, Kazakhstan, Tajik, or Kyrgyz space; in East Asia, Japanese Korea could be misread as losing a cutout to Mongolia.
- `turkestan_transition` was the clearest problem because Afghanistan could be picked up as an adjacent owner even though the intended story is Soviet Turkestan and the Basmachi-era transition before national delimitation, not Afghan ownership of a cutout.
- `jp_korea` was the clearest verifier-discovered East Asia problem because the colonial Korean lane already carries the whole Japanese-annexation phase; a left-edge cut only manufactured a false Mongolian recipient.
- Removing shapes is sometimes the more truthful polygon decision. For the 1924 Central Asian split, successor lanes and half-width blocks already show the territorial reorganization; for Japanese Korea, the separate colonial lane already carries the territorial phase. Extra notches fabricate a more precise owner-transfer story than the abstraction can support.
- Future rule: use remote/split owners for real missing-control recipients, but remove decorative geometry when the only available receiver would be a coincidental neighbor.

## v195 Central Asia Source Notes
- Seventeen Moments in Soviet History hosts the VTsIK decree on delimiting the Autonomous Turkestan Socialist Soviet Republic, including the secession/formation language for Uzbek, Turkmen, Kirghiz/Kara-Kirghiz, and Tajik units (`https://soviethistory.msu.edu/1929/making-central-asia-soviet/making-central-asia-soviet-texts/delimitation-of-the-autonomous-turkestan-socialist-soviet-republic/`).
- Britannica summarizes that Soviet rule replaced tsarist rule in Central Asia and that the Soviet government created the five Central Asian Soviet socialist republics in the 1920s and 1930s (`https://www.britannica.com/place/Central-Asia`).

## v195 Verification Findings
- Static, VM, and browser checks agree on the new baseline: 777 entities, 673 connections, 243 shaped entities, 312 owner-fill pieces, no duplicate IDs, no missing endpoints, no invalid owner references, and no unresolved shape plans.
- The six v195 targets now behave as plain or half-width blocks: no `clip-path`, no owner-fill rows, and no detail-panel `Cutout Owners` / `缺口承接` section.
- The verifier caught and fixed a stale-cache issue in `index.html`: `styles.css` and `print.css` initially still loaded as `v194`; they now load as `v195` alongside `app.js`.
- Browser QA found 0 hidden labels, 0 visible label overflow, 0 page horizontal overflow, and 0 console/runtime errors on both all-region desktop and 390px Chinese mobile target views.

## v196 Mesoamerican Contact-vs-Ownership Findings
- The remaining automatic-adjacent audit shows a useful distinction: a contact or influence lane can be knowledge-rich without being a land owner. If the note says "not annexation", a polygon bite labelled as a cutout owner is the wrong visual grammar.
- v196 removes decorative shapes from `teotihuacan_maya_contact`, `maya_classic`, `toltec_maya_contact`, and `maya_post`. The entities remain visible as narrow lanes, so users still see the interaction and Maya continuity, but they no longer produce false owner-fill strips.
- This does not remove legitimate owner-conserving Mesoamerican corridors. `epiclassic_southern_mesoamerica` can still use `maya_classic` as a concrete recipient, and `postclassic_southern_mesoamerica` / `aztec_southern_tribute` can still resolve against `maya_post` where the surrounding notes describe surviving Maya polities rather than a mere contact strip.
- Future rule: contact/influence strips should normally be rectangular/narrow lanes. Use owner-filled notches only when the missing piece is a territorial recipient, tributary frontier, occupation zone, or explicitly modeled cultural owner.

## v196 Mesoamerica Source Notes
- Cambridge Core / Antiquity describes Teotihuacan-Maya relations as close economic and political ties whose nature and extent remain debated, with evidence for cultural influence and active Teotihuacan presence at Tikal (`https://www.cambridge.org/core/journals/antiquity/article/teotihuacan-altar-at-tikal-guatemala-central-mexican-ritual-and-elite-interaction-in-the-maya-lowlands/78F1EE665FD51C6B41457872CDA20A80`).
- INAH's Chichen Itza / Toltec Question article says the older conquest-and-invasion explanation has changed, and characterizes Chichen Itza as convergence of regional cultures rather than Toltec conquest of Maya lands (`https://lugares.inah.gob.mx/en/node/5518`).

## v196 Verification Findings
- Static, VM, and browser checks agree on the new baseline: 777 entities, 673 connections, 239 shaped entities, 306 owner-fill pieces, no duplicate IDs, no missing endpoints, no invalid owner references, and no unresolved shape plans.
- The four v196 targets now behave as plain narrow lanes: no `clip-path`, no owner-fill rows sourced from them, and no detail-panel `Cutout Owners` / `缺口承接` section.
- The two contact strips (`teotihuacan_maya_contact`, `toltec_maya_contact`) no longer appear as owners of any fill row. Maya Classic/Postclassic can still legitimately fill separate corridor/frontier notches where they represent surviving Maya polities.
- Browser QA found 0 hidden labels, 0 visible label overflow, 0 page horizontal overflow, and 0 console/runtime errors on both all-region desktop and 390px Chinese Americas views.

## v197 Administrative/Maritime Sphere Findings
- The audit exposed a second class of "not quite territorial" false cutout after v196's contact rows: administrative and maritime spheres. These can be historically important without behaving like land bites whose missing pieces need a neighboring owner.
- `new_spain_central_america` no longer draws an hourglass. Its old cutout could auto-fill with Viceroyalty of Peru and New Spain, even though the row represents the Captaincy General / Kingdom of Guatemala within New Spain, not a Central American land transfer to Peru.
- `srivijaya_malaya` no longer draws an hourglass. Srivijaya's strait power is better read as maritime-commercial hegemony than as a land empire with Khmer or Palembang core filling cutouts.
- Future rule: "sphere" and "maritime influence" labels should default to whole narrow lanes. Use a notch only when the detail text can name who actually received the missing territorial/control share.

## v197 Source Notes
- Britannica states that Central American regions plus Chiapas composed the Captaincy General of Guatemala, part of the Viceroyalty of New Spain (`https://www.britannica.com/place/United-Provinces-of-Central-America`).
- The Library of Congress law blog similarly describes the Captaincy General / Kingdom of Guatemala as subordinate to the Viceroyalty of New Spain and covering modern Central American states plus Chiapas (`https://blogs.loc.gov/law/2018/02/pyramidofniches/`).
- Britannica describes Srivijaya as a maritime and commercial kingdom centered at Palembang whose power was based on control of international sea trade and the Strait of Malacca (`https://www.britannica.com/place/Srivijaya-empire`).

## v197 Verification Findings
- Static, VM, and browser checks agree on the new baseline: 777 entities, 673 connections, 237 shaped entities, 302 owner-fill pieces, no duplicate IDs, no missing endpoints, no invalid owner references, and no unresolved shape plans.
- The two v197 targets now behave as whole lanes: no `clip-path`, no owner-fill rows sourced from them, no owner-fill rows targeting them, and no detail-panel `Cutout Owners` / `缺口承接` section.
- Regression checks kept the v194-v196 target sets intact while removing the two new false sphere cutouts.
- Browser QA found 0 hidden labels, 0 visible label overflow, 0 page horizontal overflow, and 0 console/runtime errors on all-region desktop, 390px Chinese Americas, and 390px Chinese Southeast Asia views.

## v198 Late Bronze Levant Transition Findings
- The next automatic-adjacent audit found 138 remaining adjacent fill rows after v197. The highest-risk row was `levant_transition`: its hourglass shape mechanically resolved against adjacent Middle Eastern lanes even though the note described collapse and transition, not a territorial recipient.
- Removing the shape is the more accurate visual decision. A short Late Bronze / early Iron Age transition should show that the southern Levant is occupied and historically active, but it should not imply that the missing pieces were returned to New Kingdom Egypt or filled by Syro-Hittite neighbors.
- v198 therefore keeps `Levant Collapse Transition` as a whole half-width `culture` block, adds compact face labels, and rewrites the English/Chinese description and territory note around fragmented Canaanite highland/coastal continuity plus Philistine and early Israelite emergence.

## v198 Source Notes
- Britannica's Sea Peoples article supports the eastern Mediterranean / Syria-Palestine / Egypt setting near the end of the Bronze Age and cautions that the collapse had multiple debated causes, not one simple invasion (`https://www.britannica.com/topic/Sea-People`).
- Britannica's Palestine Iron Age article supports the early-12th-century establishment context for Israelite tribes in Palestine and the broader early Iron Age transition (`https://www.britannica.com/place/Palestine/The-Iron-Age`).
- Britannica's Philistine article supports the 12th-century BCE settlement of Philistines on the southern coast of Palestine around the same transition period (`https://www.britannica.com/topic/Philistine-people`).

## v198 Verification Findings
- Static, VM, and browser checks agree on the new baseline: 777 entities, 673 connections, 236 shaped entities, 300 owner-fill pieces, no duplicate IDs, no missing endpoints, no invalid owner references, and no unresolved shape plans.
- `Levant Collapse Transition` now behaves as a whole half-width culture lane: no `clip-path`, no source fill rows, no target fill rows, compact `LBT` / `转型` face labels, and no detail-panel `Cutout Owners` / `缺口承接` section.
- Regression checks kept the v194 explicit Korea occupation fills and the v195-v197 false-adjacent/contact/sphere suppressions intact.
- Browser QA found 0 hidden labels, 0 visible label overflow, 0 page horizontal overflow, and 0 console/runtime errors on all-region desktop and 390px Chinese Middle East mobile views.

## v199 Western Roman Hispania Findings
- The next high-risk automatic-adjacent case was `w_roman_hispania`: its generic right taper could be filled by `sub_roman` because Britain sits in the next simplified Europe slot, even though post-Roman Britain is not a plausible owner of an Iberian cutout.
- The better fix is not to remove all geometry. The post-409 Iberian row has real local recipients and pressure fields, so v199 adds `hispania_successor_foederati` as a narrow local composite strip for Suebi, Vandal/Alan, and early Visigothic or federate successor pressure.
- `w_roman_hispania` now has a time-bounded orthogonal right notch from 409 to 475, explicitly filled by `hispania_successor_foederati`. The recipient strip stays whole, so it reads as the owner of the missing Iberian share rather than introducing a second unnecessary cutout.
- The Visigothic succession link now targets the new Iberian successor strip, while a 409 conflict/pressure link ties the successor strip back to late Roman Hispania.
- This is the precise use case for the user's non-contiguous/composite-owner rule: if the simplified grid cannot place every real neighbor, add a named local owner fragment rather than letting the renderer choose an accidental adjacent lane.

## v199 Source Notes
- Britannica supports the Suebi entering Spain in 409 and settling mainly in Gallaecia, then spreading over Lusitania and Baetica before later Visigothic defeat and annexation (`https://www.britannica.com/topic/Suebi`).
- Britannica supports Visigoths moving into Spain in 415, being settled as federates in Aquitaine in 418, and Euric declaring independence in 475 before Visigothic rule covered much of Spain (`https://www.britannica.com/topic/Visigoth`).
- Britannica Kids supports the Vandals crossing into Spain in 409, remaining about 20 years, then moving to Africa in 429 (`https://kids.britannica.com/students/article/Vandals/277543`).

## v199 Verification Findings
- Static and VM checks passed so far: `node --check app.js`, `git diff --check`, 8 regions, 778 entities, 674 connections, 236 shaped entities, 300 owner-fill pieces, 0 duplicate IDs, 0 missing endpoints, 0 unknown categories, 0 invalid owner references, and 0 unresolved shape plans.
- VM verification confirms `w_roman_hispania` has a custom orthogonal clip path and one explicit fill row to `hispania_successor_foederati` for 409-475, with no `w_roman_hispania` -> `sub_roman` fill row.
- Regression checks kept `Levant Collapse Transition` as an unshaped whole lane and preserved the explicit reciprocal v194 Korea occupation-zone fills.
- Headless Chrome/CDP browser verification passed on desktop all-region and 390px Chinese Europe target views. Desktop rendered 778 blocks / 300 owner-fill pieces using only `v199` assets; mobile Europe rendered 128 blocks / 32 owner-fill pieces.
- Browser DOM checks confirmed `W. Roman Hispania` has a custom orthogonal clip path, a single explicit owner-fill row to `hispania_successor_foederati`, no source fill to `sub_roman`, and no stale v198 assets.
- Detail checks confirmed the English `Cutout Owners` and Chinese `缺口承接` lists contain only `Iberian Successor Polities` / `伊比利亚继承诸政权`. Clicking the fill strip opens the recipient detail, which has no reverse `Cutout Owners` section.
- Browser QA found 0 hidden labels, 0 visible label overflow, 0 page horizontal overflow, 0 panel overflow, and 0 console/runtime errors.

## v200 Warsaw Pact Influence-vs-Ownership Findings
- The adjacent-fill audit's next high-risk Europe case was `poland_people` beside `ussr_warsaw_pact_poland`. Their opposing tapers created two tidy non-blank cutouts, but the history described by the rows is not a land exchange: communist Poland remained a Polish state lane, while the Soviet/Warsaw Pact row represents political-military dominance and alliance pressure.
- v200 removes both tapers. This preserves the user's "no blank land" rule by not cutting land at all where no territorial recipient exists. The Polish state lane stays the land owner; the Warsaw Pact strip stays visible as an influence layer.
- Added a `political` connection type so alliance, dominance, and reform links no longer have to masquerade as cultural exchange or succession. The 1955 Warsaw Pact link is political, the 1989 Polish state transition is succession, and the 1989 end of Soviet-bloc dominance is political.
- This pass sharpens the remote/split-owner rule: use non-contiguous fragments when they identify a concrete owner of a missing share; do not use them to turn influence, hegemony, or alliance membership into territorial ownership.

## v200 Source Notes
- Britannica's Communist Poland section describes the postwar Polish republic/Polish People's Republic, Sovietization, the Soviet-style 1952 constitution, Soviet military influence, and Warsaw Pact adherence (`https://www.britannica.com/place/Poland/Communist-Poland`).
- The U.S. Office of the Historian describes the Warsaw Pact as a political and military alliance established on May 14, 1955, notes that it tied Eastern European capitals more closely to Moscow, and says the Soviet Union controlled most Pact decisions (`https://history.state.gov/milestones/1953-1960/warsaw-treaty`).
- Britannica's Warsaw Pact article likewise frames it as a treaty/organization with unified military command and Soviet units in satellite territories, strengthening the Soviet hold over satellites rather than annexing them as Soviet territory (`https://www.britannica.com/event/Warsaw-Pact`).

## v200 Verification Findings
- Static, VM, and browser checks agree on the new baseline: 778 entities, 676 connections, 234 shaped entities, 298 owner-fill pieces, 133 automatic adjacent fill pieces, 165 explicit fill pieces, no duplicate IDs, no missing endpoints, no unknown categories, no invalid owner references, no bad connection types, and no unresolved shape plans.
- `poland_people` and `ussr_warsaw_pact_poland` now behave as whole half-lanes: no `shape`, no `clip-path`, no source owner-fill rows, no target owner-fill rows, and no detail-panel `Cutout Owners` / `缺口承接` section.
- The VM verifier caught one existing connection-type gap: a `colonial` relationship existed without a label or line style. v200 adds `colonial` to connection labels and rendering styles alongside the new `political` type.
- Regression checks kept the v199 explicit `w_roman_hispania` -> `hispania_successor_foederati` fill, the unshaped v198 `levant_transition`, and the explicit reciprocal v194 Korea occupation-zone fills intact.
- Browser QA found 0 hidden labels, 0 visible label overflow, 0 page horizontal overflow, and 0 console/runtime errors on all-region desktop and 390px Chinese Europe views. Desktop rendered 778 blocks / 298 fills; mobile Europe rendered 128 blocks / 30 fills, both using only `v200` CSS/print/JS assets.
- Detail checks confirmed `Polish People's Republic` / `波兰人民共和国` and `Soviet Bloc Poland` / `苏联阵营波兰` show territorial-reading text plus political relationship badges, while omitting cutout-owner sections.

## v201 Kadesh Frontier Findings
- The adjacent-fill audit's next high-risk pair was `egypt_levant` and `hittite_syria`. Their opposing tapers created two clean-looking filled bites, but both rows describe frontier hegemony, vassals, and influence rather than a direct land transfer.
- v201 removes both tapers. `Egyptian Levant` remains the New Kingdom southern Levant hegemony/garrison/tribute lane, while `Hittite Syria` remains the northern Syrian vassal/frontier sphere around Kadesh and allied city-states.
- The Kadesh story is now carried by explicit relationships: the existing conflict link for the battle and a new `political` link/event for the Egyptian-Hittite peace treaty after the stalemate.
- This is another limit case for the user's no-blank-land rule: there is no blank land because no cutout is drawn. Where the model is describing influence or contested hegemony rather than a recipient of lost territory, a whole narrow lane is more honest than an owner-filled bite.

## v201 Source Notes
- Britannica's Battle of Kadesh article places the battle in Syria, frames Ramses II's objective as wresting Canaan/Syria from Hittite hands and recapturing Kadesh, describes the outcome as not an outright victory, and notes the later peace treaty (`https://www.britannica.com/event/Battle-of-Kadesh`).
- Britannica's Hittite article describes Hittite control of much of Anatolia and northern Syria, Suppiluliuma's Syrian foothold, the struggle with Egypt under Seti/Ramesses, Kadesh as indecisive, and the later treaty / mutual-defense / dynastic marriage settlement (`https://www.britannica.com/topic/Hittite`).
- The Met's New Kingdom essay supports Dynasty 18 military campaigns extending Egypt's influence into the Near East rather than one simple uniform block (`https://www.metmuseum.org/essays/egypt-in-the-new-kingdom-ca-1550-1070-b-c`).
- ARCE's Kadesh event page similarly frames Kadesh as an Egyptian-Hittite battle in Syria involving Hittite allied/vassal states, with Ramses failing to recapture Kadesh as a clear objective (`https://arce.org/event/battle-kadesh/`).

## v201 Verification Findings
- Static and VM checks agree on the new baseline: 778 entities, 677 connections, 112 events, 232 shaped entities, 296 owner-fill pieces, 131 automatic adjacent fill pieces, 165 explicit fill pieces, no duplicate IDs, no missing endpoints, no unknown categories, no invalid owner references, no bad connection types, and no unresolved shape plans.
- `Egyptian Levant` and `Hittite Syria` now behave as whole parallel half-lanes: no `shape`, no `clip-path`, no source owner-fill rows, no target owner-fill rows, and no detail-panel `Cutout Owners` / `缺口承接` section.
- Regression checks kept the v200 Polish/Warsaw Pact no-shape state, the v199 explicit `w_roman_hispania` -> `hispania_successor_foederati` fill, the unshaped v198 `levant_transition`, and the v194 explicit Korea occupation-zone fills intact.
- Browser QA found 0 visible label overflow, 0 page horizontal overflow, and 0 console/runtime errors on all-region desktop and 390px Chinese Middle East views. Desktop rendered 778 blocks / 296 fills; mobile Middle East rendered 158 blocks / 70 fills, both using only `v201` CSS/print/JS assets.
- Detail checks confirmed `Egyptian Levant` / `埃及黎凡特` and `Hittite Syria` / `赫梯叙利亚` show territorial-reading text plus conflict and political relationship badges, including `Egyptian-Hittite Peace Treaty` / `埃及-赫梯和约`, while omitting cutout-owner sections.

## v202 Srivijaya / Mataram Findings
- The next high-value adjacent-fill risk was `srivijaya` <-> `mataram_hindu`. Their notes already said Palembang/Sumatran maritime core and Central Javanese court, but the opposing tapers made two coexisting cores appear to eat each other's land.
- v202 removes both tapers. `Srivijaya Core` remains a whole Palembang / Sumatran maritime-commercial half-lane, while `Mataram` remains a whole Central Javanese / Kedu court half-lane.
- A new `cultural` connection, `Shailendra-era Java-Srivijaya Links`, carries the real relationship without converting cultural, royal, or Buddhist connections into territorial ownership.
- The later `Kediri/Singhasari` explicit early edge filled by `Srivijaya Core` remains intact for 929-1025, because that cutout is a narrower, time-bounded later-pressure case rather than the early Srivijaya-Mataram coexistence problem.

## v202 Source Notes
- Britannica describes Srivijaya as a maritime and commercial kingdom originating in Palembang on Sumatra, controlling the Strait of Malacca, and later facing the 1025 Chola seizure of Palembang (`https://www.britannica.com/place/Srivijaya-empire`).
- Britannica's Central Java section links 8th-9th century Central Java with the Kedu Plain and Shailendra dynasty, notes a mid-9th-century Srivijaya-Palembang ruler with Javanese ancestry, and says there is no solid evidence that Central Javanese territories extended far beyond Central Java and its north coast (`https://www.britannica.com/place/Indonesia/Central-Java-from-c-700-to-c-1000`).

## v202 Verification Findings
- Static and VM checks agree on the new baseline: 778 entities, 678 connections, 112 events, 230 shaped entities, 294 owner-fill pieces, 129 automatic adjacent fill pieces, 165 explicit fill pieces, no duplicate IDs, no missing endpoints, no unknown categories, no invalid owner references, no bad connection types, and no unresolved shape plans.
- `Srivijaya Core` and `Mataram` now behave as whole neighboring half-lanes: no `shape`, no `clip-path`, no source owner-fill rows, and no detail-panel `Cutout Owners` / `缺口承接` section.
- Regression checks kept the later `Kediri/Singhasari` -> `Srivijaya Core` explicit fill intact, and kept the v201 Kadesh, v200 Polish/Warsaw Pact, v199 Western Roman Hispania, v198 Levant transition, and v194 Korea occupation-zone semantics intact.
- Browser QA found 0 visible label overflow, 0 page horizontal overflow, and 0 console/runtime errors on all-region desktop and 390px Chinese Southeast Asia views. Desktop rendered 778 blocks / 294 fills; mobile Southeast Asia rendered 56 blocks / 22 fills, both using only `v202` CSS/print/JS assets.
- Detail checks confirmed `Srivijaya Core` / `室利佛逝核心` and `Mataram` / `马打兰` show territorial-reading text plus the Shailendra-era Java-Srivijaya cultural relationship, while omitting cutout-owner sections. `Srivijaya Core` still appears as the explicit owner of the later `Kediri/Singhasari` edge, which is intended.

## v203 Seleucid Anatolia Findings
- The next worthwhile adjacent-fill risk is not the already documented Seleucid/Ptolemaic Syrian frontier, but `seleucid_anatolia`: its hourglass could be filled by adjacent `ptolemaic`, making Nile Egypt look like the owner of a missing Anatolian strip.
- v203 removes the hourglass and adds a concrete post-Apamea owner chain. `Seleucid Anatolia` remains whole until 188 BCE, then `Pergamon & Anatolian Kingdoms` carries the mixed Attalid / Rhodian / Galatian / Cappadocian field, and `Roman Asia Minor` carries the Attalid bequest / Asia province phase before `Roman East`.
- This is a better use of the user's remote/split-owner rule than another notch. The problem was not a missing polygon piece with a valid recipient; it was an absent named owner chain that made an accidental adjacent fill look plausible.

## v203 Source Notes
- Britannica's Treaty of Apamea entry says the Seleucid kingdom was limited to Asia east of the Taurus range after the 188 BCE treaty (`https://www.britannica.com/topic/Treaty-of-Apamea`).
- Britannica's Antiochus III article says Antiochus renounced claims in Europe and Asia Minor west of the Taurus at Apamea, reducing the kingdom to Syria, Mesopotamia, and western Iran (`https://www.britannica.com/biography/Antiochus-III-the-Great`).
- Britannica's Eumenes II article says Pergamon received control over most former Seleucid possessions in Asia Minor after Roman and Pergamene victory over Antiochus III (`https://www.britannica.com/biography/Eumenes-II`).
- Britannica's Attalus III article says he bequeathed Pergamon to Rome in 133 BCE and Rome organized the kingdom into the province of Asia in 129 BCE (`https://www.britannica.com/biography/Attalus-III-Philometor-Euergetes`).

## v203 Verification Findings
- Static and VM checks agree on the new baseline: 780 entities, 681 connections, 114 events, 229 shaped entities, 292 owner-fill pieces, 127 automatic adjacent fill pieces, 165 explicit fill pieces, no duplicate IDs, no missing endpoints, no unknown categories, no bad event or connection types, no invalid owner references, no unresolved shape plans, and no unexpected slot overlaps after allowing explicit owner-fill pairs.
- `Seleucid Anatolia` now behaves as a whole lane before Apamea: no `shape`, no `clip-path`, no source owner-fill rows, no `ptolemaic` owner row, and no detail-panel `Cutout Owners` / `缺口承接` section.
- The new owner chain is continuous in the Middle East slot-2 lane: `Seleucid Anatolia` (-301 to -188) -> `Pergamon & Anatolian Kingdoms` (-188 to -133) -> `Roman Asia Minor` (-133 to -64) -> `Roman East` (-64 onward).
- Browser QA found 0 visible label overflow, 0 page horizontal overflow, 0 panel overflow, and 0 console/runtime errors on all-region desktop and 390px Chinese Middle East views. Desktop rendered 780 blocks / 292 fills; mobile Middle East rendered 160 blocks / 68 fills, both using only `v203` CSS/print/JS assets.
- Detail checks confirmed `Seleucid Anatolia` / `塞琉古安纳托利亚` explains Apamea and the non-Ptolemaic handoff without cutout owners, while `Pergamon & Anatolian Kingdoms` / `帕加马/安纳托利亚诸国` and `Roman Asia Minor` / `罗马小亚细亚` open with bridge-owner details.

## v204 Mesoamerica Owner-Continuity Findings
- The adjacent-fill audit ranked `aztec_southern_tribute` -> `maya_post` as the next highest-risk case. The old taper let a tributary/contact frontier auto-fill into the Maya lane and also exposed a time mismatch because the old Maya Postclassic block ended before the Aztec block.
- v204 removes the Aztec southern taper. The row now stays a whole narrow tribute-frontier fragment, with relationship links carrying the contact/conquest story instead of implying that the Maya lane owned an Aztec land bite.
- The Maya / Central America lane is now closed by named owners rather than blanks: `Maya Postclassic` reaches the 1521 collapse boundary, `Maya Conquest Frontier` bridges 1521-1543, `New Spain: Central America` is narrowed from 1543-1697 beside `Independent Maya Holdouts`, `New Spain: Central America` returns full width after Nojpeten in 1697, and `Central America in Mexican Empire` bridges 1821-1823 before `Central America`.
- This is the strongest current example of the user's remote/split-owner rule: the Itza / Peten Maya holdout is not drawn as a direct neighbor on a literal map, but as a non-contiguous simplified owner fragment where the compressed grid would otherwise erase a real residual polity.

## v204 Source Notes
- Britannica's Maya article supports the 900-1519 Postclassic Maya frame and continued Yucatan city life into Spanish contact (`https://www.britannica.com/topic/Maya-people`).
- Britannica's Yucatan Peninsula article says Francisco de Montejo began the conquest in 1527, met stronger resistance than Cortes, and by 1549 Spanish rule covered barely half the peninsula (`https://www.britannica.com/place/Yucatan-Peninsula`).
- Britannica's Central America summary says Spain organized the region, except Panama, into the Captaincy General of Guatemala around 1543, and that independence came in 1821 followed by the United Provinces in 1823 (`https://www.britannica.com/summary/Central-America`).
- Stanford University Press's page for Grant D. Jones, The Conquest of the Last Maya Kingdom, says Spanish troops occupied Nojpeten on March 13, 1697 and identifies it as the capital of the last unconquered native New World kingdom (`https://www.sup.org/books/history/conquest-last-maya-kingdom`).
- Britannica's Aztec article supports the central/southern Mexico Aztec frame, while Smithsonian's Infinity of Nations Mesoamerica page supports the Triple Alliance's fast integration of conquered cities into trade and tribute flows rather than treating every southern contact as direct land ownership (`https://www.britannica.com/topic/Aztec`, `https://americanindian.si.edu/exhibitions/infinityofnations/mesoamerica-caribbean.html`).

## v204 Verification Findings
- Static and VM checks agree on the new baseline: 784 entities, 689 connections, 116 events, 228 shaped entities, 291 owner-fill pieces, 126 automatic adjacent fill pieces, 165 explicit fill pieces, no data failures, and no `aztec_southern_tribute` shape plan.
- VM target checks confirmed the closed slot sequence: at 1520 `aztec_southern_tribute` plus `maya_post` fill the lane; at 1522 `maya_conquest_transition` fills it; at 1544 `new_spain_central_america` plus `maya_late_independent` fill it; at 1698 `new_spain_central_america_late` fills it; at 1822 `central_america_mexican_interlude` fills it; and at 1824 `central_america` fills it.
- Browser QA found 0 visible label overflow, 0 page horizontal overflow, 0 panel overflow, and 0 console/runtime errors on all-region desktop and 390px Chinese Americas views. Desktop rendered 784 blocks / 291 fills; mobile Americas rendered 57 blocks / 15 fills, both using only `v204` CSS/print/JS assets.
- Detail checks confirmed `Aztec Tribute Frontier` explains tribute hegemony and says it is not the same as owning the Maya lane, while `玛雅独立残存` includes `诺赫佩滕`, `1697`, and `伊察`. Neither target shows `Cutout Owners` / `缺口承接`.

## v205 Champa / Đại Việt Findings
- The old Champa / Đại Việt pair was a high-salience semantic error: the opposing tapers created reciprocal automatic adjacent fills during a long coexistence period, so the display read as mutual land ownership rather than north-south Vietnamese expansion against Cham polities.
- v205 replaces the reciprocal tapers with one custom orthogonal `Đại Việt / Vietnam` polygon. Before 1471, the left half is explicitly filled by `Champa`; from 1471 to 1835, a narrow right strip is explicitly filled by `Panduranga Cham Remnant`; after the 1832-35 integration crisis, the Vietnamese lane becomes full before the French Indochina handoff.
- This is the clearest current example of the user's "凸 / Tetris" target: the expanding polity has horizontal/vertical edges, and every missing piece is a named owner. There is no ownerless blank and no reliance on accidental neighboring slots.
- The design intentionally treats `Đại Việt / Vietnam` as a Southeast Asia abstraction rather than a strict official-name block, because the East Asia region already carries granular Vietnamese dynastic phases. In this Southeast Asia lane, the point is territorial ownership and the Champa frontier sequence.

## v205 Source Notes
- Britannica's Le Thanh Tong article says he defeated Champa in 1471 and reduced it to a narrow remnant along the southern edge of the peninsula (`https://www.britannica.com/biography/Le-Thanh-Tong`).
- Britannica's Champa article describes Dai Viet pressure from the 10th century and the late-15th-century annexations that wiped out the Champa kingdom for practical purposes (`https://www.britannica.com/place/Champa-ancient-kingdom-Indochina`).
- Cambridge Core's chapter summary, `Việt Nam and the Genocide of Champa, 1470-1509`, supports the 1471 invasion and permanent reduction of Champa's realm (`https://www.cambridge.org/core/books/cambridge-world-history-of-genocide/viet-nam-and-the-genocide-of-champa-14701509/6E8490A4C5670883A94DAD24BF5C899A`).
- Cambridge Core's Journal of Southeast Asian Studies article, `The destruction and assimilation of Campā (1832-35) as seen from Cam sources`, supports treating the disappearance of the last Pāṇḍuraṅga principality as an 1832-35 integration and assimilation crisis (`https://www.cambridge.org/core/journals/journal-of-southeast-asian-studies/article/destruction-and-assimilation-of-campa-183235-as-seen-from-cam-sources/3BE62801898A772227D5E66235245065`).
- Kyoto Review of Southeast Asia supports the 1693-1835 Vietnam-Champa relationship, the occupied/tributary status of Panduranga after 1693, and the final breaking of Cham resistance in 1835 (`https://kyotoreview.org/issue-5/vietnam-champa-relations-and-the-malay-islam-regional-network-in-the-17th-19th-centuries/`).

## v205 Verification Findings
- Static and VM checks agree on the new baseline: 785 entities, 692 connections, 118 events, 291 owner-fill pieces, 124 automatic adjacent fill pieces, 167 explicit fill pieces, no duplicate IDs, no missing endpoints, no invalid owner references, and no unresolved shape plans.
- VM target checks confirm `dai_viet->champa` is explicit for 1009-1471 and `dai_viet->cham_panduranga` is explicit for 1471-1835. No Champa / Đại Việt / Panduranga row appears in the remaining automatic adjacent-fill audit.
- Browser QA found 0 visible label overflow, 0 page horizontal overflow, and 0 console/runtime errors on desktop Southeast Asia and 390px Chinese Southeast Asia views. Both loaded only `v205` CSS/print/JS assets.
- Runtime DOM checks confirmed `Đại Việt / Vietnam` has a custom orthogonal `clip-path`, while `Champa` and `Panduranga Cham Remnant` have `clip-path: none`. The two target fill pieces are explicit and labeled as remote/composite owners in both English and Chinese.
- Detail verification opened `宾童龙占婆残余` from the fill piece and found the expected 1471, 1832, and 1833-1835 context in the Chinese panel.

## v206 Taiwan Whole-Island Findings
- The post-v205 automatic-adjacent audit found 124 adjacent fill pieces and ranked Taiwan as the clearest false-owner cluster: `Qing Taiwan` and `Tungning / Zheng Taiwan` could resolve left cutouts into `Nguyễn Lords South`, and `Japanese Taiwan` could resolve into `French Vietnam`.
- This violated the owner-conserving rule in the opposite direction from a blank gap: the cutout was not blank, but the owner was unreasonable. Taiwan is already represented as its own island lane, so the more accurate visual is a full island block plus relationship/event transitions.
- v206 removes the left taper from `tungning`, `qing_taiwan`, `japanese_taiwan`, and `roc_taiwan`. The four island phases now stay whole, with territory notes explaining that Vietnam, French Vietnam, Japan proper, and mainland China are separate lanes rather than cutout owners.
- Added East Asia event markers for `Koxinga Takes Taiwan` (1662), `Qing Takes Taiwan` (1683), `Treaty of Shimonoseki` (1895), and `Nationalists Retreat to Taiwan` (1949), so the sequence remains knowledge-rich without false geometry.

## v206 Source Notes
- Britannica's Zheng Chenggong article supports the Taiwan Ming-loyalist base and the 1683 Qing invasion-fleet defeat of the Zheng kingdom (`https://www.britannica.com/biography/Zheng-Chenggong`).
- Britannica's Treaty of Shimonoseki article says China ceded Taiwan, the Pescadores, and the Liaodong Peninsula to Japan after the First Sino-Japanese War (`https://www.britannica.com/event/Treaty-of-Shimonoseki`).
- Britannica's Taiwan history page supports the 1945 handover of control to Chiang's side after Japanese surrender and the postwar uncertainty around the formal legal disposition (`https://www.britannica.com/topic/history-of-Taiwan`).
- Britannica's early Nationalist rule page supports Chiang Kai-shek and the Nationalist government retreating to Taiwan in late 1949 (`https://www.britannica.com/place/Taiwan/Early-Nationalist-rule`).

## v206 Verification Findings
- Static and VM checks agree on the new baseline: 785 entities, 692 connections, 122 events, 223 shaped entities, 287 owner-fill pieces, 120 automatic adjacent fill pieces, 167 explicit fill pieces, no duplicate IDs, no missing endpoints, no invalid owner references, and no unresolved shape plans.
- VM target checks confirm `tungning`, `qing_taiwan`, `japanese_taiwan`, and `roc_taiwan` have no shape, no normalized notches, no fill rows as source, and no bad Taiwan source-fill pairs. The intentional explicit `qing_beijing -> tungning` remote owner remains.
- Browser QA found 0 visible label overflow, 0 page horizontal overflow, and no stale assets on desktop East Asia and 390px Chinese East Asia views. Both loaded only `v206` CSS/print/JS assets.
- Runtime DOM checks confirmed all four Taiwan target blocks have `clip-path: none` and no shape classes; `Qing Taiwan` detail contains complete-island-lane wording and omits `Cutout Owners` / `缺口承接`.

## v207 Visual-Semantics Findings
- The same-color seam issue was a rendering problem, not necessarily a data-identity problem. Exact same base-color blocks in the same region now get `same-color-seam-*` classes only when their actual rendered edges touch; hover and focus restore an outline so separate entities remain discoverable.
- The upside-down Chinese labels came from the generic narrow-block rule rotating vertical content by 180 degrees. v207 adds a Chinese-specific override: transform `none`, `writing-mode: vertical-rl`, and `text-orientation: upright`.
- Connection labels were previously tied only to zoom. v207 adds `showConnectionLabels` and shareable `linkLabels=0|1`, allowing arrows to remain while text above arrows disappears.
- Dark mode's base variables were shifted from warm brown/cream toward a cooler neutral charcoal with muted coral, blue, and green accents, reducing the previous palette clash while keeping block colors readable.

## v207 Manchuria Owner-Continuity Findings
- The Manchuria / Northeast lane had a strong visible blank before `later_jin_manchu` in 1616, even though nearby notes already acknowledged Liao/Khitan, Jurchen, Mongol, and Ming/Jurchen histories. This was exactly the kind of gap the user's non-contiguous-owner rule can improve.
- v207 adds a continuous owner chain in East Asia slot 2: `manchuria_early_peoples` (-3000 to -200), `fuyu_manchuria` (-200 to 494), `goguryeo_manchuria` (494-668), `tang_mohe_manchuria` (668-698), `bohai_manchuria` (698-926), `liao_manchuria` (926-1115), `jurchen_jin_manchuria` (1115-1234), `yuan_liaoyang_manchuria` (1234-1368), and `ming_liaodong_jurchens` (1368-1616).
- The new chain intentionally mixes cultural, kingdom, empire, and confederation/composite owners. It is not a modern border claim; it prevents a simplified visual lane from implying ownerless land.
- Companion fragments are now used for broad powers whose real footprint crosses multiple simplified lanes: Liao remains in the steppe lane while `Liao Manchuria` fills the Northeast lane; Jurchen Jin appears in both Manchuria and north China; Yuan and Ming receive Northeast administrative/composite fragments.
- The column-order problem remains unsolved. The next pass should define an adjacency-cost function across each region's slot order instead of swapping individual slots by intuition; Taiwan's current distance from China relative to Japan is the motivating East Asia regression case.

## v207 Source Notes
- Britannica's Manchuria article supports the region's sequence of named peoples, the Mongols making Manchuria the Liaoyang province after Jin fell in 1234, Ming rule over Liaodong, and the 15th-17th century Jurchen rise before Later Jin (`https://www.britannica.com/place/Manchuria`).
- Britannica's Parhae article supports Parhae/Bohai as an 8th-century state in northern Manchuria and northern Korea, founded after Goguryeo by Dae Jo-yeong, and recognized by Tang (`https://www.britannica.com/place/Parhae`).
- Britannica's Jin dynasty article supports Jurchen Jin (1115-1234) as an empire formed by Tungus Jurchen tribes of Manchuria (`https://www.britannica.com/topic/Jin-dynasty-China-Mongolia-1115-1234`).
- Britannica's Korea article supports Buyeo rising in the Sungari River basin of Manchuria and the Korean-Manchurian ancient-state context (`https://www.britannica.com/place/Korea`).

## v207 Verification Findings
- Static checks passed: `node --check app.js` and `git diff --check`.
- VM integrity check passed for the nine new Manchuria IDs: no missing entities, no missing details, no missing capitals, and no bad connection endpoints. The slot-2 chain covers -3000 through 2000 continuously.
- Browser QA passed on desktop Chinese East Asia using only `v207` assets: all new Manchuria blocks rendered; no console/page errors; 0 page overflow; `文字` toggle exists and is checked; connection text nodes drop from 264 to 0 when toggled off while 132 connection paths remain; Chinese narrow labels compute to transform `none`, `vertical-rl`, and `upright`; 68 same-color seam markers are present; dark mode uses `#101213` / `#80A7C8` variables.
- Browser QA passed on 390px Chinese mobile East Asia: 151 blocks, 58 owner-fill pieces, 132 connection paths, 0 connection text nodes with `linkLabels=0`, `zh-CN`, 0 horizontal overflow, no console/page errors.

## v208 Slot-Group Layout Findings
- Current-state audit confirmed the concrete East Asia failure: `ROC Taiwan -> Postwar Nationalist China` had an eight-slot raw distance, making the ROC Taiwan connection the longest East Asia internal relationship and making Taiwan farther from China than Japan was.
- Raw `slot` has two meanings in the old code: data semantics for territory/fill ownership and render x-position. Changing raw slots would risk breaking verified owner-fill logic, so v208 adds render-only `layoutSlot` values.
- Slot groups are required because some entities span multiple slots. East Asia's China core/south slots are bound by two-slot unified blocks, so they must move together as `[0,1]` rather than being split by Taiwan or another lane.
- A pure connection-distance optimizer produced mathematically lower costs but cognitively odd orders, such as pushing China into the middle and moving Manchuria or Tibet too far. The safer design is a guided optimizer: relationship weights can influence order, but a reviewed region guide supplies the cartographic/cognitive prior.
- v208 activates the optimizer only for East Asia. Other regions are left in original order until they get their own review, because automatic global reshuffling would be a large semantic change.
- The East Asia guide order is `slot [3] -> [4] -> [2] -> [7] -> [0,1] -> [8] -> [5] -> [6]`, i.e. Tibet/Xinjiang, Steppe/Mongolia, Manchuria, Vietnam, China core/south, Taiwan, Korea, Japan. This gives China immediate neighbors Vietnam and Taiwan; Korea/Japan remain paired; Taiwan becomes closer to China than Japan.
- Territory cutout resolution still uses raw slots. This is intentional: visual reordering should improve cognition and connection distances but must not change which entity is considered the owner of a missing polygon piece.

## v208 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=208`, `print.css?v=208`, and `app.js?v=208`.
- The first VM layout verifier failed because the test harness stubbed only `document.addEventListener`; the app has a top-level beacon-style injection that also needs `document.getElementById`, `createElement`, and `document.head`. The corrected DOM stub passed.
- VM integrity passed with 8 regions, 794 entities, 698 connections, 0 duplicate IDs, 0 missing endpoints, 0 unknown categories, 0 invalid notch owners, 0 unresolved shapes, and 0 layout-coverage failures.
- East Asia VM layout passed with order `[3] [4] [2] [7] [0+1] [8] [5] [6]`. Raw `roc_taiwan.slot` remains `8`, rendered `roc_taiwan` layout slot is `6`, Taiwan-China distance is 2 layout slots, Japan-China distance is 4, and Korea-Japan distance is 1.
- Desktop browser QA loaded only `v208` assets and rendered East Asia with 151 blocks, 58 owner-fill pieces, 132 connection paths, 264 connection-label text nodes, 0 horizontal overflow, 0 console/runtime errors, and same-color seams still active.
- Desktop DOM positions confirm the motivating regression is fixed: `roc_postwar` center 380px, `roc_taiwan` center 492px, `showa_imperial_japan` center 604px. Taiwan is 112px from China; Japan is 224px from China.
- 390px Chinese mobile QA with `linkLabels=0` loaded only `v208` assets, rendered 151 blocks, 58 fills, 132 paths, 0 connection text nodes, no overflow, and the same corrected Taiwan/China/Japan distances.
- Visual screenshot `/tmp/history_visual_v208_eastasia_layout.png` was inspected; the modern East Asia columns read as Vietnam -> China core -> Taiwan -> Korea -> Japan in the focused segment, with no obvious overlap or blank-layout artifact.

## v209 Three Kingdoms Split Findings
- The previous `shu_wu` block was semantically too coarse. It preserved the fact that the southern lane was not empty before 280, but it hid the user's desired territory-change story: Shu Han fell in 263, while Eastern Wu survived until 280.
- v209 resolves this by splitting the southern lane into half-lane owners. `Shu Han` and `Eastern Wu` coexist; after 263, the former Shu half becomes `Wei-Held Shu`; after 266 it becomes `Jin-Held Shu`; after 280 the full-width `Western Jin Unified` block begins.
- The 220-221 / 220-222 bridge fragments are explicitly territorial-control bridges, not formal dynasty-date claims. They close tiny ownerless gaps after Eastern Han while preserving the formal source-backed dates for Shu-Han (221) and Wu (222).
- Same-color adjacency now carries historical interpretation: `Wei-Held Shu` shares Cao Wei's base color and touches it with no internal gap; `Jin-Held Shu` shares Western Jin's base color and touches the Jin core. Hover/focus still separates the entities.
- `chinese_vn` no longer references a coarse `shu_wu` owner. Its full-height remote-owner chain now goes through the Wu-side southern owners after Han, then unified Jin, Eastern Jin, Southern Dynasties, unified Sui, Tang, and Ten Kingdoms.

## v209 Source Notes
- Britannica's `Three Kingdoms` page supports the 220-280 period, the Wei/Shu-Han/Wu triad, Shu-Han in Sichuan from 221 to 263/264, Wu at Jianye from 222 to 280, Wei's conquest of Shu-Han, and Jin's conquest of Wu (`https://www.britannica.com/event/Three-Kingdoms-ancient-kingdoms-China`).
- Britannica's `Sun Quan` page supports Sun Quan as founder of Wu, Wu's eastern-China/Nanjing area, and Wu's 222-280 duration (`https://www.britannica.com/biography/Sun-Quan`).
- Britannica's `Shu-Han dynasty` and `Wu` topic pages provide additional cross-checks for Shu-Han 221-263/264 and Wu 222-280 (`https://www.britannica.com/topic/Shu-Han-dynasty`, `https://www.britannica.com/topic/Wu-ancient-kingdom-China-AD-222-280`).

## v209 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, app-source scan with no `shu_wu`, and active asset scan with `index.html` loading `styles.css?v=209`, `print.css?v=209`, and `app.js?v=209`.
- VM audit passed with 8 regions, 799 entities, 704 connections, 124 events, 223 shaped entities, 288 owner-fill pieces, no duplicate IDs, no missing connection endpoints, no invalid explicit notch owners, no unresolved shape plans, and no Three Kingdoms slot overlaps.
- VM target checks confirmed all six v209 entities exist with descriptions, details, and capitals: `liu_bei_shu_domain`, `shu_han`, `sun_quan_wu_domain`, `eastern_wu`, `wei_shu_commanderies`, and `jin_shu_commanderies`.
- VM owner-chain checks confirmed `chinese_vn` fills through `han_west`, `xin`, `han_east`, `sun_quan_wu_domain`, `eastern_wu`, `jin_west_unified`, `e_jin`, `s_dynasties`, `sui_unified`, `tang`, and `ten_kingdoms`.
- Headless Chrome/CDP desktop Chinese East Asia rendered 156 blocks, 59 owner-fill pieces, 138 connection paths, and 276 SVG connection text nodes with `linkLabels=1`; it had 0 horizontal overflow, 0 console/runtime errors, and 0px gaps across the Shu/Wu, Wei/Wu, Jin/Wu, and Jin-core/Jin-Shu seams.
- Headless Chrome/CDP 390px Chinese mobile East Asia rendered 156 blocks, 59 owner-fill pieces, 138 connection paths, and 0 SVG connection text nodes with `linkLabels=0`; it had 0 horizontal overflow, 0 console/runtime errors, and the same 0px seam-gap checks.
- Screenshots inspected: `/tmp/history_visual_v209_three_kingdoms_desktop.png` and `/tmp/history_visual_v209_three_kingdoms_mobile.png`.

## v210 Sixteen Kingdoms Split Findings
- The previous `sixteen_k` block was no longer adequate for the user's Tetris-like territory-change requirement. It was historically labeled as a composite northern field, but visually it was still a single 316-439 rectangle beside Eastern Jin.
- v210 replaces that rectangle with a source-backed owner sequence: `Early 16 Kingdoms` (316-351), a 351-376 split between `Former Qin Core` and `Rival Northern Kingdoms`, a short full-width `Former Qin North` peak (376-383), a tiny `Post-Fei River North` bridge (383-386), then a 386-439 split between `Northern Wei Rise` and `Later 16 Kingdoms`.
- The model keeps the "no ownerless land" rule without overclaiming precision. Former Qin and Northern Wei are concrete named recipients where the source-backed story is clear; the remaining simultaneous courts are composite owners because the one-dimensional grid cannot honestly show every neighboring state.
- Same-color and same-slot semantics now support the story: the grey composite field narrows when Former Qin rises, Former Qin briefly widens after 376, the grey field reopens after Fei River, and the blue Northern Wei half widens into full north in 439.
- The old `sixteen_k` ID is absent from live app sources; the split entities all have descriptions, detail panels, capitals, wiki mappings, relationship links, and local/global events.

## v210 Source Notes
- Britannica's China article describes the Sixteen Kingdoms as many short-lived northern dynasties after Western Jin collapse, including Xiongnu, Jie, Xianbei, Di, and Qiang regimes, and identifies Tuoba / Northern Wei as the eventual northern unifier (`https://www.britannica.com/place/China/The-Shiliuguo-Sixteen-Kingdoms-in-the-north-303-439`).
- Cambridge History of China's `The Sixteen Kingdoms` chapter describes the era as a complicated 304-439 northern field and notes that the traditional "sixteen" label compresses more than sixteen significant states (`https://www.cambridge.org/core/books/abs/cambridge-history-of-china/sixteen-kingdoms/EFA116423191EA9A0895B1BCEDD6B063`).
- Britannica's Northern Wei article supports the Tuoba/Xianbei dynasty and the 439 unification of northern China (`https://www.britannica.com/topic/Wei-dynasty`).
- Smithsonian's Period of Division overview supports Western Jin reunification in 280, collapse in 316, Eastern Jin in the south, and Northern Wei bringing all north China under rule in 439 (`https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/period-of-division/`).

## v210 Verification Findings
- Static checks passed: `node --check app.js`; app-source scan found no live `sixteen_k`; active asset scan loaded `styles.css?v=210`, `print.css?v=210`, and `app.js?v=210`.
- VM audit passed with 8 regions, 805 entities, 713 connections, 127 events, 0 duplicate IDs, 0 missing connection endpoints, all seven v210 targets present with descriptions/details/capitals, and 0 north-lane coverage gaps or overlaps across 316-351, 351-376, 376-383, 383-386, and 386-439.
- Headless Chrome/CDP desktop Chinese East Asia rendered 162 blocks, 59 owner-fill pieces, 147 connection paths, and 294 SVG connection text nodes with `linkLabels=1`; it had 0 horizontal overflow and no console/runtime errors.
- Headless Chrome/CDP 390px Chinese mobile East Asia rendered 162 blocks, 59 owner-fill pieces, 147 connection paths, and 0 SVG connection text nodes with `linkLabels=0`; it had 0 horizontal overflow and no console/runtime errors.
- DOM geometry measured 0px gaps for every new split/handoff: Former Qin Core to Rival Northern Kingdoms, Northern Wei Rise to Later 16 Kingdoms, Early 16 Kingdoms to the 351 split, the 351 split to Former Qin North, Former Qin North to Post-Fei River North, Post-Fei River North to the 386 split, and Later 16 Kingdoms to full Northern Wei.
- Screenshots inspected: `/tmp/history_visual_v210_sixteen_kingdoms_desktop.png` and `/tmp/history_visual_v210_sixteen_kingdoms_mobile.png`. Remaining visual risk is local text congestion around the 376/383 events when connection labels are enabled.

## v211 Visual Collision Findings
- The dense-label problem was a rendering-layer issue, not a data issue. The relationship graph should remain rich even when some labels are suppressed visually.
- v211 assigns metadata to connection-label groups and prunes overlaps after the SVG is in the DOM, because final label geometry depends on actual font metrics and zoom state.
- The pruning score favors relationship labels that carry structural history: conquest first, then succession, conflict, political, colonial, cultural, and trade. Shorter and closer labels also win ties, which keeps the focus band readable without deleting low-priority relationship paths.
- Global event markers need collision handling too. Close years such as 376 and 383 are now assigned separate horizontal lanes in the event rail instead of sharing the same vertical slot.
- The mobile tradeoff is visible: the event rail avoids marker-on-marker collisions, but its expanded lane width can still overlap the chart area. This is acceptable for v211 because it improves legibility without page overflow, but the next visual pass should test a reserved mobile gutter or focus-aware marker fade.

## v211 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=211`, `print.css?v=211`, and `app.js?v=211`.
- Headless Chrome/CDP desktop Chinese East Asia at the 360 CE focus rendered 162 blocks, 59 owner-fill pieces, and 147 connection paths. It produced 147 label candidates, kept 105 visible label groups, hid 42 colliding groups, and reported 0 visible connection-label overlaps.
- The same desktop pass rendered 9 visible global event markers with 0 visible marker overlaps; close markers 35 and 36 landed in separate lanes.
- Headless Chrome/CDP 390px Chinese mobile with `linkLabels=0` rendered the same 147 connection paths with 0 connection labels, 0 visible marker overlaps, 0 horizontal overflow, and no console/runtime errors.
- Screenshots inspected: `/tmp/history_visual_v211_collision_desktop_b.png` and `/tmp/history_visual_v211_collision_mobile_b.png`.

## v212 Northern/Southern Dynasties Split Findings
- The coarse Northern/Southern Dynasties blocks had the same weakness as the earlier `sixteen_k` and `shu_wu` composites: they avoided blank land, but visually hid the real transfer story. The north did not stay one owner after Northern Wei; the south was not one dynasty from 420 to 589.
- v212 splits the north into `Eastern Wei` + `Chang'an Wei Bridge` after 534, then `Western Wei` beside `Eastern Wei`, then `Northern Zhou` beside `Northern Qi`, then a short full-width `Northern Zhou Unified North` after the 577 conquest. The widening is explicit: the eastern half is not blank after Northern Qi falls, it is absorbed into the Northern Zhou full-north block.
- v212 splits the southern Jiankang lane into `Liu Song`, `Southern Qi`, `Liang`, and `Chen`. This makes the 589 Sui reunification read as a concrete conquest of Chen plus Sui-core expansion, not a disappearance of a generic southern placeholder.
- The one-year `western_wei_bridge` is a deliberate abstraction. It prevents the west from becoming visually ownerless during the 534-535 transition, while the formal `Western Wei` block still starts in 535.
- The Chinese-rule Vietnam remote-owner chain now references the specific Southern Dynasties after Eastern Jin. This follows the accepted non-contiguous-fragment rule: the simplified Vietnam lane can be filled by the relevant southern/unified Chinese owner chain rather than using a generic southern block or a northern successor.

## v212 Source Notes
- Britannica's Six Dynasties overview lists the southern dynasties Liu-Song, Southern Qi, Southern Liang, and Southern Chen, and the northern sequence Northern Wei, Eastern Wei, Western Wei, Northern Qi, and Northern Zhou (`https://www.britannica.com/event/Six-Dynasties`).
- Britannica's China / Six Dynasties history page says Northern Wei disintegrated into northeastern and northwestern successor states, Northern Zhou reunified the north in 577, Yang Jian founded Sui, and Sui overthrew the last Jiankang dynasty in 589 (`https://www.britannica.com/topic/history-of-China/The-Six-Dynasties`).
- Britannica's Southern Qi page cross-checks the Southern Dynasties dates: Liu-Song 420-479, Southern Qi 479-502, Southern Liang 502-557, and Southern Chen 557-589 (`https://www.britannica.com/topic/Southern-Qi-dynasty`).
- Cambridge History of China's Western Wei / Northern Zhou and Eastern Wei / Northern Qi chapter summaries support treating these as paired successor structures after the Northern Wei breakup (`https://www.cambridge.org/core/books/abs/cambridge-history-of-china/western-weinorthern-zhou/0E0549FA8294B31DEEA95BB796244EFA`, `https://www.cambridge.org/core/books/abs/cambridge-history-of-china/eastern-weinorthern-qi/ACA9DFF6C8EF6DC0B5CB7E89BEF2836E`).

## v212 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=212`, `print.css?v=212`, and `app.js?v=212`.
- VM audit passed with 8 regions, 813 entities, 722 connections, 130 events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, 0 invalid owner references, no live old Northern/Southern Dynasties IDs, and no 534-589 north or 420-589 south coverage failures.
- VM target checks confirmed all ten v212 IDs exist with descriptions, details, and capitals: `western_wei_bridge`, `western_wei`, `eastern_wei`, `northern_qi`, `northern_zhou`, `northern_zhou_unified`, `liu_song_south`, `southern_qi`, `liang_dynasty`, and `chen_dynasty`.
- Headless Chrome/CDP desktop Chinese East Asia at the 560 CE focus loaded only `v212` assets, rendered 170 blocks and 156 connection paths, pruned 156 connection-label candidates to 110 visible labels with 46 hidden and 0 visible label overlaps, had 0 horizontal overflow, and reported no console/runtime errors.
- Headless Chrome/CDP 390px Chinese mobile with `linkLabels=0` loaded only `v212` assets, rendered 170 blocks and 156 connection paths, showed 0 connection labels, had 0 horizontal overflow, and reported no console/runtime errors.
- DOM geometry measured 0px gaps for the Western Wei / Eastern Wei split, Northern Zhou / Northern Qi split, every northern vertical handoff from 534 through 581, and the Liu Song -> Southern Qi -> Liang -> Chen southern handoffs.
- Screenshots inspected: `/tmp/history_visual_v212_ns_dynasties_desktop.png` and `/tmp/history_visual_v212_ns_dynasties_mobile.png`.

## v213 Five Dynasties / Ten Kingdoms Split Findings
- The previous post-Tang model preserved a broad north/south distinction, but it still behaved like two large rectangles: one Five Dynasties block in the north, one Ten Kingdoms block in the south, and a late `n_song_south` jump. That hid exactly the territorial-transfer story the user asked to see.
- v213 splits the northern lane into `Later Liang`, `Later Tang`, `Later Jin`, `Later Han`, `Later Zhou`, and `Northern Han`. Northern Han is a narrow Taiyuan holdout, not blank land; Later Zhou narrows beside it, and early Northern Song keeps the same right-side cutout until the 979 conquest.
- v213 splits the southern lane into a Ten Kingdoms core, a Southern Han / Lingnan strip, staged Song absorption strips, and surviving southern holdouts. Song widens in 963, 965, 971, 976, and 978; the grey/brown holdout strips shrink in the complementary direction.
- The Southern Han / Lingnan strip is also the late remote owner for Chinese-rule Vietnam before 938. This is a better fit than a generic Ten Kingdoms owner because it keeps the Vietnam-facing southern polity explicit.
- The design deliberately suppresses face labels on the very short 963-978 micro-phases. The information is still present through hover/detail metadata and relationship links, while the face of the timeline stays readable on mobile.

## v213 Source Notes
- Britannica's Five Dynasties overview supports the 907 Tang collapse, the 960 Song founding, and the northern sequence from Later Liang through Later Zhou (`https://www.britannica.com/event/Five-Dynasties`).
- Britannica's Ten Kingdoms overview supports the Ten Kingdoms / Northern Han roster and dates, including Southern Han, Southern Tang, Wu-Yue, Later Shu, Nanping/Jingnan, and Northern Han, and describes Song absorbing the southern kingdoms over the next two decades (`https://www.britannica.com/event/Ten-Kingdoms`).
- Cambridge History of China's Five Dynasties chapter summary supports the distinction between the Yellow River core dynasties and regions outside that core under separate claimants (`https://www.cambridge.org/core/books/abs/cambridge-history-of-china/five-dynasties/BED8234EA917268392A83E07FFE08EE7`).
- The University of Toronto East Asian Library chronology cross-checks the five northern dynasties and dates: Later Liang 907-923, Later Tang 923-936, Later Jin 936-947, Later Han 947-950/951, and Later Zhou 951-960 (`https://east.library.utoronto.ca/resource/china-studies/sui-tangfive-dynasties-and-ten-kingdoms-ad581-979`).
- The fine-grained Song southern absorption order uses the common conquest sequence Jingnan/Wuping 963, Later Shu 965, Southern Han 971, Southern Tang 975/976, and Wu-Yue / Qingyuan 978; it is intentionally visualized as approximate width transfer rather than modern map precision.

## v213 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=213`, `print.css?v=213`, and `app.js?v=213`.
- Corrected VM audit passed with 8 regions, 829 entities, 743 connections, 136 events, 0 duplicate IDs, 0 missing connection endpoints, all v213 target descriptions/details/capitals/wiki links present, no live old `five_dyn` / `ten_kingdoms` IDs, no north/south coverage failures, and no missing Vietnam owner-chain references.
- The VM coverage check subtracts explicit notch fills from the source block before testing for overlaps. This matters for `n_song`: its early right-edge strip is intentionally filled by `northern_han_taiyuan`, so counting the unclipped rectangular bounds would produce a false overlap.
- Headless Chrome/CDP desktop Chinese East Asia at the 972 CE focus loaded only `v213` assets, rendered 186 blocks and 177 connection paths, pruned 177 connection-label candidates to 114 visible labels with 63 hidden and 0 visible label overlaps, had 0 event-marker overlaps, 0 horizontal overflow, and no console/runtime errors.
- Headless Chrome/CDP 390px Chinese mobile with `linkLabels=0` loaded only `v213` assets, rendered 186 blocks and 177 connection paths, showed 0 connection labels, had 0 event-marker overlaps, 0 horizontal overflow, and no console/runtime errors.
- DOM geometry measured 0px gaps for every target horizontal handoff in the late Tang / early Song focus. The Northern Song cutout fill has the same left and right pixels as the Northern Han strip.
- Screenshots inspected: `/tmp/history_visual_v213_five_ten_desktop.png` and `/tmp/history_visual_v213_five_ten_mobile.png`.

## v214 Raj Parallel-Lane Findings
- The current automatic-fill audit found 119 adjacent fills across the app. The most suspicious pair was `raj_south_provinces` <-> `raj_princely_states`, because both sides filled each other's taper in different portions of 1858-1947.
- That reciprocal taper conflicted with the existing text metadata: both blocks already described direct British provinces and princely states as parallel structures under the Raj. A Tetris bite is useful for territorial transfer, but here it implied a false conquest/occupation rhythm.
- v214 removes the two shapes and leaves both blocks as stable half-lanes. This is not less detailed; it is more precise. The detail lives in the administrative distinction, relationship links, and territory notes rather than in a misleading owner-fill cutout.
- Same-color seam behavior still helps: `British Raj Core` and `Raj South Provinces` share the direct British provincial color and can visually merge at their internal seam, while `Princely States` retains a darker red to signal indirect rule / paramountcy.

## v214 Source Notes
- Britannica's British Raj page supports the 1858-1947 Crown-rule frame (`https://www.britannica.com/event/British-raj`).
- Britannica's princely-state page states that colonial India was divided into directly administered provinces and nominally autonomous princely states under indirect rule, and that princely states occupied about two-fifths of the subcontinent (`https://www.britannica.com/topic/princely-state-colonial-India`).

## v214 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=214`, `print.css?v=214`, and `app.js?v=214`.
- VM audit passed with 8 regions, 829 entities, 743 connections, 0 duplicate IDs, 0 missing connection endpoints, automatic adjacent fills reduced from 119 to 117, no shape plan for `raj_south_provinces` / `raj_princely_states`, no Raj-related owner-fill rows, and no missing descriptions/details/capitals/wiki links for the Raj targets.
- Headless Chrome/CDP desktop Chinese South Asia at the 1900 CE focus loaded only `v214` assets, rendered 96 blocks and 85 connection paths, pruned 85 connection-label candidates to 64 visible labels with 21 hidden and 0 visible label overlaps, had 0 event-marker overlaps, 0 horizontal overflow, and no console/runtime errors.
- Headless Chrome/CDP 390px Chinese mobile with `linkLabels=0` loaded only `v214` assets, rendered 96 blocks and 85 connection paths, showed 0 connection labels, had 0 event-marker overlaps, 0 horizontal overflow, and no console/runtime errors.
- DOM geometry measured 0px gaps for `british_raj -> raj_south_provinces` and `raj_south_provinces -> raj_princely_states`; both Raj targets have `clip-path: none`, no shape classes, and no fill pieces.
- Detail-panel verification opened `印度土邦` / `Princely States` and confirmed the panel contains indirect-rule / paramountcy wording but no `Cutout Owners` / `缺口承接`.
- Screenshots inspected: `/tmp/history_visual_v214_raj_desktop.png` and `/tmp/history_visual_v214_raj_mobile.png`.

## v215 Early Caliphate Parallel-Lane Findings
- The remaining automatic-fill audit after v214 exposed a high-risk same-polity pattern: `umayyad_iraq` and `umayyad_persia` were same-color Umayyad administrative lanes but had reciprocal taper fills, making them look like territorial rivals.
- `rashidun` and `rashidun_persia` had the same visual problem after 651. Keeping Rashidun Persia's start at 651 still avoids backfilling the earlier conquest war; the correction only removes the false implication that Iraq and Persia were cutting territory out of each other once both were under the caliphate.
- v215 removes these four shape fields and updates the text. The detail is now carried by start dates, relationship links, capitals, achievements, and territory notes rather than a misleading notch.
- Same-color seam suppression is doing useful work here: `Rashidun Iraq` / `Rashidun Persia` and `Umayyad Iraq` / `Umayyad Persia-Khorasan` visibly touch as one political field, but each block remains individually hoverable/clickable.

## v215 Source Notes
- Britannica's Umayyad dynasty overview supports the 661-750 Umayyad frame, Damascus-centered government, centralization under Abd al-Malik, and expansion to Khorasan and other eastern provinces (`https://www.britannica.com/topic/Umayyad-dynasty-Islamic-history`).
- Britannica's al-Hajjaj page identifies al-Hajjaj ibn Yusuf as Umayyad governor of Iraq from 694 to 714 and frames Iraq as a major administrative post (`https://www.britannica.com/biography/al-Hajjaj`).
- Encyclopaedia Iranica's Khorasan article describes al-Hajjaj gaining authority over Khorasan from his Iraq base and appointing governors for the eastern campaigns, supporting a provincial/administrative reading rather than a reciprocal Iraq/Persia land bite (`https://www.iranicaonline.org/articles/khorasan-iv-the-arab-conquest-and-omayyad-period/`).

## v215 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=215`, `print.css?v=215`, and `app.js?v=215`.
- VM audit passed with 8 regions, 829 entities, 743 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 unknown categories, automatic adjacent fills reduced from 117 to 113, no shape plans for `rashidun`, `rashidun_persia`, `umayyad_iraq`, or `umayyad_persia`, no target fill rows, and all four targets having descriptions, details, and bilingual territory notes.
- VM temporal checks confirmed `rashidun` and `rashidun_persia` are adjacent same-color lanes in 655, while `umayyad_iraq` and `umayyad_persia` are adjacent same-color lanes in 704.
- Headless Chrome/CDP desktop Chinese Middle East at the 704 CE focus loaded only `v215` assets, rendered 160 blocks and 131 connection paths, rendered 100 visible connection labels with 0 visible label overlaps, had 0 event-marker overlaps, 0 horizontal overflow, 0 block-label overflow, and no console/runtime errors.
- Headless Chrome/CDP 390px Chinese mobile with `linkLabels=0` loaded only `v215` assets, rendered 160 blocks and 131 connection paths, showed 0 connection labels, had 0 event-marker overlaps, 0 horizontal overflow, 0 block-label overflow, and no console/runtime errors.
- DOM geometry measured 0px horizontal gaps for `rashidun -> rashidun_persia` and `umayyad_iraq -> umayyad_persia`, and 0px vertical handoff gaps from Rashidun to Umayyad at 661. All four targets have `clip-path: none`, no shape classes, no target fill pieces, and same-color seam classes on their internal border.
- Detail-panel verification opened `倭马亚波斯-呼罗珊` / `Umayyad Persia-Khorasan` and confirmed the panel contains provincial/parallel wording but no `Cutout Owners` / `缺口承接`.
- Screenshots inspected: `/tmp/history_visual_v215_caliphate_desktop.png` and `/tmp/history_visual_v215_caliphate_mobile.png`.

## v216 Roman Provincial Parallel-Lane Findings
- The remaining high-risk Europe cluster was not a lack of detail; it was too much geometry in the wrong place. Roman Republic/Empire/Late Roman provincial lanes were treating Greece/Balkans, Gaul, Hispania, and Britain as if adjacent Roman provinces were recipients of one another's cutouts.
- v216 removes those internal province-to-province shapes. Same-state Roman provincial administration now reads as side-by-side whole lanes with explanatory notes, while real frontier/successor pressure remains visually encoded.
- `roman_transalpine_gaul` / `celtic_gaul_late` remain a valid frontier edge before Caesar's conquest of Gaul. `w_roman_hispania` remains a valid post-409 successor cutout because the recipient is local Suebi/Vandal/Alan/early Visigothic or federate pressure inside Hispania, not another Roman province.
- `w_roman_gaul` is deliberately whole. Western Roman Gaul can still be described as fragile and successor-pressured, but in this simplified lane it should not donate a false strip to Hispania unless a named Gallic recipient fragment is introduced later.

## v216 Source Notes
- Britannica's Roman Britain page supports Britain as a Roman provincial field beginning with Claudius' conquest and ending before final Roman withdrawal (`https://www.britannica.com/place/Roman-Britain`).
- Britannica's Gallic Wars page supports Caesar's conquest of Gaul in 58-50 BCE (`https://www.britannica.com/event/Gallic-Wars`).
- Britannica's Gaul page supports Roman provincial organization in Gaul after the conquest, including Narbonensis and the later provincial division (`https://www.britannica.com/place/Gaul-ancient-region-Europe`).
- Britannica's Spain Romanization page supports Hispania as Roman provinces with colonies and Roman citizen communities (`https://www.britannica.com/place/Spain/Romanization`).
- Britannica's Roman Empire timeline supports Hadrianic consolidation and later Diocletianic administrative reorganization, which fits whole provincial lanes better than internal land-bite geometry (`https://www.britannica.com/place/Timeline-of-the-Roman-Empire`).

## v216 Verification Findings
- Static checks passed before documentation updates: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=216`, `print.css?v=216`, and `app.js?v=216`.
- VM audit passed with 8 regions, 829 entities, 743 connections, 0 duplicate IDs, 0 missing connection endpoints, 0 unknown categories, automatic adjacent fills reduced from 113 to 105, explicit fills reduced from 173 to 170, no shape plans for the eleven Roman provincial targets, and no target fill rows.
- VM preservation checks confirmed the frontier/successor exceptions remain: `roman_transalpine_gaul` and `celtic_gaul_late` still have adjacent frontier fills, and `w_roman_hispania` still has one explicit `hispania_successor_foederati` fill.
- Headless Chrome/CDP desktop Chinese Europe at 100 CE loaded only `v216` assets, rendered 128 blocks and 104 connection paths, had 65 visible connection labels with 0 overlaps, 0 event-marker overlaps, 0 horizontal overflow, 0 block-label overflow, and no console/runtime errors.
- Headless Chrome/CDP 390px Chinese mobile with `linkLabels=0` loaded only `v216` assets, rendered 128 blocks and 104 connection paths, showed 0 connection labels, had 0 horizontal overflow, 0 block-label overflow, and no console/runtime errors.
- Western Roman 430 CE QA confirmed `w_roman_gaul` has `clip-path: none`, while `w_roman_hispania` keeps the custom post-409 successor cutout and the `hispania_successor_foederati` fill piece.
- DOM geometry measured 0px horizontal gaps for `roman_empire_greece -> roman_empire`, `roman_empire -> roman_empire_gaul`, `roman_empire_gaul -> roman_empire_hispania`, `roman_empire_hispania -> roman_britain`, and `w_roman_gaul -> w_roman_hispania`.
- Detail-panel verification confirmed the whole-lane Roman targets do not show `Cutout Owners` / `缺口承接`; `w_roman_hispania` still does because that cutout is intentional.
- Screenshots inspected: `/tmp/history_visual_v216_roman_desktop.png`, `/tmp/history_visual_v216_roman_mobile.png`, and `/tmp/history_visual_v216_western_roman_desktop.png`.

## v217 User-Feedback Completion Audit
- User item 1 is materially improved but not philosophically finished: same-color seams are no longer based on color alone. `applySameColorSeams()` now requires an explicit semantic same-polity group, so accidental same-color adjacency such as PRC/Mongolia remains separated while real split fragments such as Dzungar north / Dzungar Tarim merge internally.
- User item 2 remains fixed: Chinese narrow labels no longer use the generic upside-down rotation. Browser verification found `upsideDownCn: []`.
- User item 3 is improved for a high-value blank zone: East Asia's western frontier no longer has long blank stretches in Tibet/Xinjiang lanes from 3000 BC to AD 2000. This does not mean every global blank is finished; Africa and parts of Southeast Asia still deserve future passes.
- User item 4 is done: the connection-label layer is independent from the arrow/path layer. Browser verification at `zoom=3` showed `linkLabels=1` -> 760 paths / 548 labels, and `linkLabels=0` -> 760 paths / 0 labels.
- User item 5 is partially done from earlier v208 work: East Asia has a render-only cognitive slot optimizer, and Taiwan now renders closer to China than Japan does. The algorithm is not yet global; future regions need their own calibrated guides.
- User item 6 is ongoing by design. This pass added 15 new western-frontier owner phases plus one split Dzungar Tarim fragment, but the broader world-history enrichment remains a large multi-pass project.
- User item 7 is improved from v207 and rechecked in v217. Dark mode currently renders pale tinted blocks on a charcoal UI with dark block text; no runtime errors or overflow were observed. The global visual polish standard still needs more screenshot-driven art direction.

## v217 Western Frontier Source Notes
- Britannica Tibet history supports treating the 7th-9th century Tibetan Empire as a major Central Asian power, followed by a post-imperial fragmentation field before Mongol/Yuan-backed order (`https://www.britannica.com/place/Tibet/History`).
- Britannica Xinjiang history supports Tang-era Chinese influence, including Anxi in 640 and Beiting in 702, and the long importance of local oasis and Uyghur/Turkic successor worlds (`https://www.britannica.com/place/Xinjiang/History`).
- Britannica Xinjiang overview supports the Dzungarian Basin, Tian Shan, Tarim Basin, and Kunlun framing used to split the simplified Xinjiang lane into northern and southern components (`https://www.britannica.com/place/Xinjiang`).
- Frontiers in Earth Science and Nature Scientific Data support early Qinghai-Tibetan Plateau habitation, exchange, and archaeological continuity, justifying a cultural-owner block rather than blank land before named states (`https://www.frontiersin.org/journals/earth-science/articles/10.3389/feart.2022.1079055/full`, `https://www.nature.com/articles/s41597-023-02858-w`).
- Penn Museum's Zhangzhung article supports treating Zhangzhung as a fragmentary but meaningful early western Tibetan highland tradition, with caveats against over-precision (`https://www.penn.museum/sites/expedition/in-the-valley-of-the-eagle/`).

## v217 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=217`, `print.css?v=217`, and `app.js?v=217`.
- VM data audit passed with 8 regions, 844 entities, 760 connections, 0 duplicate IDs, 0 missing connection endpoints, and all 16 v217 western-frontier target IDs having entity data, descriptions, details, and capitals/centers.
- VM western-frontier coverage audit found no gaps in the Tibetan half-lane, Xinjiang northern quarter, or Xinjiang southern quarter from 3000 BC to AD 2000.
- In-app browser Chinese East Asia audit rendered 844 blocks, 760 connection paths, 144 event markers, all 16 target blocks, 0 missing target blocks, 0 upside-down Chinese blocks, 0 body overflow, and 0 browser log entries.
- Dzungar north / Dzungar Tarim browser DOM check confirmed both blocks have `data-seam-group="dzungar"`, the same base color, and complementary `same-color-seam-right` / `same-color-seam-left` classes.
- Connection-label browser check at `zoom=3` confirmed the labels layer is independent: 548 labels when enabled and 0 labels when disabled, with all 760 paths preserved in both states.
- Dark-mode browser check found no console logs, no overflow, 548 labels at `zoom=3`, and dark block text on pale target blocks after inspecting `.dynasty-content` / `.dynasty-name`.

## v218 Blank-Lane Enrichment Findings
- The post-v217 half-slot coverage audit ranked the largest remaining ownerless-looking bands as Africa slot 6 and Southeast Asia slot 6. These were not real historical voids; they were missing simplified-lane owners for the East African Indian Ocean coast and the Vietnam/Champa regional lane.
- v218 fills Africa slot 6 from 3000 BC to AD 2000 with an East African coast chain: cultural littoral occupation, Azania/Rhapta trade, Zanj early ports, Swahili coast continuity, Portuguese coastal pressure, Omani/Zanzibar rule, colonial coastal administration, decolonization transition, and modern coastal states.
- v218 fills Southeast Asia slot 6 and its 6.0-6.5 / 6.5-7.0 half-lanes from 3000 BC to AD 2000 with Vietnam coastal cultures, Sa Huynh, Red River Viet polities, Jiaozhi under Chinese rule, early independent Viet, Dai Viet/Champa/Panduranga continuity, French pressure, French Vietnam, North/South Vietnam, and unified Vietnam.
- The modeling rule remains conservative: early blocks are cultural/process or regional-owner lanes, not modern Vietnam or a modern East African state projected backward. Later colonial and national blocks are split only where the historical owner trajectory justifies it.

## v218 Source Notes
- Britannica's Eastern Africa overview supports an early Indian Ocean coast frame including Rhapta/Azania references and later Swahili coastal urban/trade development (`https://www.britannica.com/place/eastern-Africa`).
- Britannica's Eastern Africa Shirazi/Omani section supports the late-17th-century Omani turn on the Swahili coast, including the 1698 fall of Fort Jesus (`https://www.britannica.com/place/eastern-Africa/The-Shirazi-migration`).
- Britannica's Sultanate of Zanzibar page supports Zanzibar's Omani connection, Said ibn Sultan's 1832 capital move, the 1861 independent sultanate, and the 1890 British protectorate (`https://www.britannica.com/place/Sultanate-of-Zanzibar`).
- Britannica's Vietnam history overview supports Red River origins, Nam Viet, Han conquest in 111 BCE, Chinese rule, independence in 939, and Ly/Dai Viet state formation (`https://www.britannica.com/topic/history-of-Vietnam`).
- Britannica's Dong Son culture page and Vietnam-conquest-by-France page support early northern Vietnamese cultural framing and the French conquest/protectorate sequence (`https://www.britannica.com/topic/Dong-Son-culture`, `https://www.britannica.com/place/Vietnam/The-conquest-of-Vietnam-by-France`).
- The U.S. Office of the Historian Dien Bien Phu page supports the 1954 French withdrawal context, and Britannica's Vietnam War page supports the 1954-75 North/South Vietnam conflict frame (`https://history.state.gov/milestones/1953-1960/dien-bien-phu`, `https://www.britannica.com/event/Vietnam-War`).

## v218 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=218`, `print.css?v=218`, and `app.js?v=218`.
- VM data audit passed with 8 regions, 862 entities, 781 connections, 0 duplicate IDs, 0 missing endpoints, and all 18 v218 target IDs having entity data, descriptions, details, capitals/centers, and English/Chinese wiki URLs.
- VM coverage audit found no gaps in Africa slot 6, Southeast Asia slot 6, Southeast Asia 6.0-6.5, or Southeast Asia 6.5-7.0 from 3000 BC to AD 2000.
- The post-v218 ranked gap audit confirms the prior top two gaps are gone. The largest remaining sampled gaps are Middle East 1-1.5 / 1.5-2, Africa 4.5-5, Central Asia 2.5-3, and early South Asia half-bands.
- Headless Chrome/CDP desktop Chinese Africa + Southeast Asia loaded only `v218` assets, rendered 149 blocks, 128 connection paths, 107 visible connection labels, 144 event markers, all 18 target blocks, 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, and no browser logs.
- Connection-label toggle verification in the combined view preserved all 128 connection paths while reducing visible connection labels from 107 to 0.
- Headless Chrome/CDP 390px Chinese dark-mode QA loaded only `v218` assets, rendered all targets, had 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, and dark text on pale tinted target blocks.
- Screenshots inspected: `/tmp/history_visual_v218_africa_sea_desktop.png` and `/tmp/history_visual_v218_africa_sea_mobile_dark.png`.

## v219 Middle East Early Iran / Elam Findings
- The post-v218 gap audit pointed to the Middle East early Iran / Elam lane as the next cleanest win: `slot 1-1.5` and `1.5-2` had avoidable blank-looking intervals before Akkadian pressure, during Hammurabi's short Elam campaign, and between Achaemenid and Seleucid rule.
- v219 adds `proto_elamite_susiana` and `early_elam_awan` as cultural-owner / early-polity horizons. This is intentionally cautious: the evidence supports Susa, Susiana, Anshan/Awan, writing, exchange, and early Elamite horizons, but not a modern-style precise state boundary.
- v219 changes `akkad_elam_pressure` to begin at 2334 BCE beside `elam_akkad`, matching the chart's own Akkadian horizon and removing the former 2334-2300 half-lane notch. The visual now reads as Akkadian pressure plus continued Elam, not Akkad replacing all of Elam.
- v219 adds `old_elam_east_continuity` beside `old_babylon_elam_campaign` from 1764 to 1749 BCE, so Hammurabi's pressure is a partial campaign while Susa/Anshan continuity remains visible.
- v219 adds `alexander_persia` from 330 to 312 BCE, so the Macedonian conquest and early Diadochi/satrapal bridge sits between Achaemenid and Seleucid rule instead of rendering as a blank pause.

## v219 Source Notes
- Britannica's Elam overview supports Elam as a southwestern Iranian country centered on Susa/Anshan/Awan traditions and culturally tied to Mesopotamia (`https://www.britannica.com/place/Elam`).
- Britannica's Ancient Iran overview supports the Achaemenid Persian frame and the 559-330 BCE Achaemenid political expansion (`https://www.britannica.com/place/ancient-Iran`).
- Britannica's Alexander the Great page supports the Macedonian conquest ending Persian imperial rule and creating the Hellenistic successor setting (`https://www.britannica.com/biography/Alexander-the-Great`).
- Britannica's Seleucid Empire page supports 312 BCE as Seleucus's seizure of Babylonia and the beginning of the Seleucid kingdom/empire (`https://www.britannica.com/place/Seleucid-Empire`).
- Britannica's Anshan and Susa pages support the Susa/Anshan geography and the Awan/Anshan framing used for early Elamite entries (`https://www.britannica.com/place/Anshan-ancient-territory-Iran`, `https://www.britannica.com/place/Susa`).
- Encyclopaedia Iranica's Elam article supports Proto-Elamite tablets around 3200-2700 BCE, the Old Elamite period, and Awan's partial contemporaneity with Akkad (`https://www.iranicaonline.org/articles/elam-i/`).

## v219 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=219`, `print.css?v=219`, and `app.js?v=219`.
- VM data audit passed with 8 regions, 866 entities, 788 connections, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and all v219 target IDs having entity data, descriptions, details, capitals/centers, and English/Chinese wiki URLs.
- VM two-dimensional coverage audit found no gaps in Middle East `slot 1-1.5` or `1.5-2` from 3000 BC to AD 2000. A first scratch audit falsely flagged 1751-1796 because it required one entity to cover an entire half-band; the corrected union-coverage audit recognized the Afsharid Khorasan / Zand split as filled and passed.
- Headless Chrome/CDP desktop Chinese Middle East loaded only `v219` assets, rendered 164 blocks, 138 connection paths, 104 visible connection labels from 138 candidates, all v219 target blocks, 0 upside-down Chinese labels, 0 visible label overflow after hidden-label filtering, 0 horizontal overflow, and no browser logs.
- Connection-label toggle verification preserved all 138 connection paths while reducing visible connection labels from 104 to 0.
- Headless Chrome/CDP 390px Chinese dark-mode QA loaded only `v219` assets, rendered all targets, had 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, and dark block text on pale tinted blocks.
- Screenshots inspected: `/tmp/history_visual_v219_middleeast_desktop.png` and `/tmp/history_visual_v219_middleeast_mobile_dark.png`.

## v220 Africa Guinea Coast / Forest Kingdoms Findings
- The corrected post-v219 coverage audit ranked Africa `slot 4-4.5` and `4.5-5` as the largest remaining ownerless-looking band. The issue was not that the Guinea Coast lacked history; the simplified grid lacked enough parallel forest/coastal owner lanes between Ife, Benin, Oyo, Akan/Gold Coast, Ashanti, Dahomey, and colonial transitions.
- v220 adds `igbo_ukwu_forest` from 500-1180 as a cultural-regional lower Niger / Guinea forest owner beside Ife. It is deliberately not a unified kingdom label.
- v220 widens `benin_early` and `benin` into the middle Edo forest sub-lane, adds `akan_volta_early` and `gold_coast_akan_states` for the Volta / Gold Coast side, and adds `dahomey_late` after Oyo's decline.
- v220 adds short `british_niger_coast_transition` and `french_dahomey` strips for 1897/1894-1902, then changes the visible `british_west` label to Colonial West Africa while preserving the stable ID. This avoids drawing the full-width 1902-1960 lane as if every compressed coastal context were British.
- The modeling rule remains conservative: when evidence is sparse, the block is a cultural/process or composite regional owner; when a named kingdom or colonial transition is source-backed, it gets its own narrower lane.

## v220 Source Notes
- Britannica's History of Nigeria supports Ife flourishing between the 11th and 15th centuries, Oyo's 14th-century foundation and later rise, and Benin as a complex monarchy encountered by the Portuguese in the 15th century (`https://www.britannica.com/topic/history-of-Nigeria`).
- Britannica's Benin historical kingdom page supports Benin as a western African forest kingdom flourishing from the 13th to 19th centuries, with Ewuare's 15th-century expansion (`https://www.britannica.com/place/Benin-historical-kingdom-West-Africa`).
- Britannica's Oyo Empire page supports Oyo's Yoruba location north of Lagos, 17th-18th century apogee, Dahomey subjugation, and decline after 1800 (`https://www.britannica.com/place/Oyo-empire`).
- Britannica's Ghana history and Gold Coast pages support early Akan / Gold Coast state formation, Bono/Banda and northern Ghana state contexts, Portuguese arrival in 1471, Elmina in 1482, and British Gold Coast colonial consolidation (`https://www.britannica.com/place/Ghana/History`, `https://www.britannica.com/place/Gold-Coast-historical-region-Africa`).
- The Metropolitan Museum's Igbo-Ukwu essay supports a 9th-century lower Niger bronze, bead, ritual, and trade horizon (`https://www.metmuseum.org/essays/igbo-ukwu-ca-9th-century`).
- Britannica's Dahomey and Benin City pages support the French conquest of Dahomey in the 1890s and the 1897 British destruction of Benin City (`https://www.britannica.com/place/Dahomey-historical-kingdom-Africa`, `https://www.britannica.com/place/Benin-City`).

## v220 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=220`, `print.css?v=220`, and `app.js?v=220`.
- VM data audit passed with 8 regions, 872 entities, 799 connections, 131 regional events, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and all v220 target IDs having entity data, descriptions, details, capitals/centers, and English/Chinese wiki URLs.
- VM two-dimensional coverage audit found no gaps in Africa `slot 4-4.5` or `4.5-5` from 3000 BC to AD 2000.
- Headless Chrome/CDP desktop Chinese Africa loaded only `v220` assets, rendered 88 blocks, 83 connection paths, 65 visible connection labels, all v220 target blocks, 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, and no browser logs.
- Connection-label toggle verification preserved all 83 connection paths while reducing visible connection labels from 65 to 0.
- Headless Chrome/CDP 390px Chinese dark-mode QA loaded only `v220` assets, rendered all targets, had 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, and dark block text on pale tinted blocks.
- Screenshots inspected: `/tmp/history_visual_v220_africa_forest_desktop.png`, `/tmp/history_visual_v220_africa_forest_mobile_dark.png`, `/tmp/history_visual_v220_africa_1200_viewport.png`, and `/tmp/history_visual_v220_africa_1880_dark_viewport.png`.

## v221 Central Asia Wusun / Ili Steppe Findings
- The corrected post-v220 coverage audit ranked Central Asia `slot 2.5-3` as the largest remaining ownerless-looking band. The main spans were `-130..375`, where the chart showed Kangju and Kushan but left the Ili / Semirechye side blank, and `465..552`, before the Göktürk takeover reached the lane.
- v221 adds `wusun_ili` from 130 BC to AD 375 as a narrow Wusun / Ili Steppe owner beside Kangju and Kushan Bactria. This follows the same conservative lane rule used in earlier cultural and nomadic-owner passes: do not widen a neighboring empire just to hide a gap.
- v221 adds `late_antique_ili_steppe` from AD 465 to 552 as a composite Ili-Chu / Jeti-Su steppe field before Göktürk takeover. The block names Rouran-linked, Tiele, and other nomadic fields in the notes, but its face label stays deliberately generic because the evidence is confederational and mobile.
- The new late-antique block uses width `1` from `slot 2.5` to `3.5`, so it closes both the previously ranked `2.5-3` gap and the adjacent AD 465-552 `3-3.5` band beside the Hephthalite core.

## v221 Source Notes
- Britannica's Zhang Qian page places the Wusun in the Ili River valley north of the Tarim Basin during Han diplomatic missions (`https://www.britannica.com/biography/Zhang-Qian`).
- University of Washington Silk Road notes describe Wusun as semi-nomadic horse and flock herders in the Ili, Naryn, and Chu basins / Semirechye, controlling northern Silk Road branches and acting as a Xiongnu buffer (`https://depts.washington.edu/silkroad/texts/hhshu/notes1.html`).
- Encyclopaedia Iranica's Sogdian Trade entry groups Yuezhi, Wusun, and Kangju as nomadic aristocracies dominating Central Asian political life in the Han period (`https://www.iranicaonline.org/articles/sogdian-trade/`).
- Encyclopaedia Iranica's Xiongnu entry supports the earlier Xiongnu tribute context over Wusun and Kangju and the Yuezhi movement through the Ili valley toward Sogdiana and Bactria (`https://www.iranicaonline.org/articles/xiongnu/`).
- Britannica's History of Central Asia / Middle Ages page states that the Juan-juan / Rouran empire emerged in Mongolia in the late 4th century and was overthrown by the Turks in 552; it also places the western Kök Türk seat possibly in the Ili or Chu valley (`https://www.britannica.com/place/history-of-Central-Asia-102306/The-Middle-Ages`).
- Britannica's Steppe page supports the 552 beginning of a powerful Turkic confederacy with a range from China to the Caspian Sea (`https://www.britannica.com/place/the-Steppe/The-era-of-Turkic-predominance-550-1200`).

## v221 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=221`, `print.css?v=221`, and `app.js?v=221`.
- VM data audit passed with 8 regions, 874 entities, 806 connections, 7 Central Asia events, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and both v221 target IDs having entity data, descriptions, details, capitals/centers, and English/Chinese wiki URLs.
- VM two-dimensional coverage audit found no gaps in Central Asia `slot 2.5-3` from 130 BC to AD 552 and no gaps in `slot 3-3.5` from AD 465 to 552.
- The post-v221 ranked gap audit confirms Central Asia `slot 2.5-3` is gone from the top list. The next largest candidates are early South Asia half-bands, Central Asia `3.5-4`, Europe `5-6`, Central Asia `0-2`, Southeast Asia `0.5-1`, and Middle East `4.5-5`.
- Headless Chrome/CDP desktop Chinese Central Asia loaded only `v221` assets, rendered 73 Central Asia blocks, 64 connection paths, 43 visible connection labels, both v221 targets, 0 upside-down Chinese labels, 0 geometric label overflow, 0 horizontal overflow, and no browser logs. The Wusun detail panel includes `疆域语义` and omits `缺口承接`.
- Connection-label toggle verification preserved all 64 Central Asia connection paths while reducing visible connection labels from 43 to 0.
- Headless Chrome/CDP 390px Chinese dark-mode QA loaded only `v221` assets, rendered both targets, kept `linkLabels=0` at 64 paths / 0 labels, had 0 upside-down Chinese labels, 0 geometric label overflow, 0 horizontal overflow, and dark block text on pale target blocks.
- Screenshots inspected: `/tmp/history_visual_v221_centralasia_desktop.png` and `/tmp/history_visual_v221_centralasia_mobile_dark.png`.

## v222 Central Asia Transoxiana / Sogdian-Oasis Findings
- A fresh VM union-coverage audit ranked Central Asia `slot 0-2` from AD 465 to 740 as the largest remaining ownerless-looking band. This span sits between Kidarite Bactria, Hephthalite/Tokharistan, Göktürk steppe power, and the existing Umayyad/Abbasid Transoxiana lane.
- v222 adds `hephthalite_transoxiana` from AD 465 to 560 as a Sogdiana / Margiana / Oxus oasis layer linked to Hephthalite power but kept separate from the Bactria-Tokharistan core. This avoids widening the existing `hephthalite` block across unrelated slots.
- v222 adds `sogdian_turkic_oases` from AD 560 to 705 as a composite city-principality layer for Samarkand, Bukhara, Panjikent, Chach, and neighboring Sogdian centers under Western Turkic / On Ok / Turgesh and intermittent Tang suzerainty.
- v222 adds `arab_sogdian_contest` from AD 705 to 740 for Qutayba-era conquest, tribute, garrisons, Sogdian/Turgesh resistance, and repeated rebellions before the stable caliphal provincial lane.

## v222 Source Notes
- Encyclopaedia Iranica's Sogdiana history article supports 5th-century Panjikent and Samarkand growth, Sogdiana's agricultural and population importance, and Sogdian expansion toward Chach and Semirechye (`https://www.iranicaonline.org/articles/sogdiana-iii-history-and-archaeology/`).
- The same Iranica article states that after the Hephthalite empire was partitioned around 560, Sogdiana passed under Turkic control and later describes Western Turkic / On Ok / Turgesh settlement, Tang suzerainty claims, Sogdo-Turkic elite fusion, and independent Sogdian principalities (`https://www.iranicaonline.org/articles/sogdiana-iii-history-and-archaeology/`).
- Iranica's Khorasan Arab-conquest article supports the unstable early Muslim frontier, local elites seeking help from Hephthalites, Western Turks / Turgesh, and Chinese claims, plus capture-rebellion-recapture patterns before stabilization (`https://www.iranicaonline.org/articles/khorasan-iv-the-arab-conquest-and-omayyad-period/`).
- Britannica's Qutaybah ibn Muslim page supports the 706-709 Bukhara campaigns, 710-712 Samarkand, Khwarezm, and nominal Arab rule farther north by 715 (`https://www.britannica.com/biography/Qutaybah-ibn-Muslim`).

## v222 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=222`, `print.css?v=222`, and `app.js?v=222`.
- VM data audit passed with 8 regions, 877 entities, 813 connections, 144 global/regional events, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and all v222 target IDs having entity data, descriptions, details, capitals/centers, and English/Chinese wiki URLs.
- VM two-dimensional coverage audit found no gaps in Central Asia `slot 0-2` from AD 465 to 740.
- The post-v222 ranked gap audit confirms Central Asia `slot 0-2` AD 465-740 is gone from the top list. The largest remaining candidates are early South Asia northwest/fringe half-bands, Europe 476-774, Southeast Asia 1025-1293 and 550-669 bands, Central Asia `slot 3.5-4`, and Middle East residuals.
- Headless Chrome/CDP desktop Chinese Central Asia loaded only `v222` assets, rendered 76 Central Asia blocks, 71 connection paths, 46 visible connection labels, all three v222 targets, 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, and no browser logs.
- Detail-panel verification opened `sogdian_turkic_oases` and confirmed Chinese `疆域语义` text, source-style wording about Western Turkic / On Ok / Turgesh suzerainty, and relationship links to Hephthalite Transoxiana, Göktürk, and Arab-Sogdian Contest.
- Connection-label toggle verification preserved all 71 Central Asia connection paths while reducing visible connection labels from 46 to 0.
- Headless Chrome/CDP 390px Chinese dark-mode QA loaded only `v222` assets, rendered all three v222 targets, had 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, and dark block text on pale target blocks.
- Screenshots inspected: `/tmp/history_visual_v222_centralasia_desktop.png` and `/tmp/history_visual_v222_centralasia_mobile_dark.png`.

## v223 South Asia Early Harappan / Regionalization Findings
- A current VM union-coverage audit ranked South Asia `slot 0.5-1` and `slot 3-4` from 3000 to 2600 BC as the largest remaining ownerless-looking bands. These spans precede the existing Mature Harappan core and Harappan fringe, so the right fix is an Early Harappan / Regionalization layer rather than a blank or a backward extension of Mature Harappan urban civilization.
- v223 adds `early_harappan_indus` from 3000 to 2600 BC for the Indus / Punjab-Sindh core lane. It names Ravi-Hakra, Kot Diji, Amri, Rehman Dheri, Kalibangan, and related village-to-town networks as a cultural-owner phase before mature urban integration.
- v223 adds `early_harappan_fringe` from 3000 to 2600 BC for the eastern / Ghaggar-Hakra / Rajasthan-Aravalli / Gujarat-facing half-lane. This makes the interaction and copper/exchange edge visible beside Ganges-Yamuna and southern cultural owners.
- The modeling rule is cautious: these are Regionalization / cultural-owner blocks, not clean bounded states. They should not be collapsed into the mature Indus Valley Civilization unless a better source-backed early/mature split replaces them.

## v223 Source Notes
- Britannica's Indus civilization page supports Harappa and Mohenjo-daro as the classic mature sites in Punjab and Sindh, anchoring the existing Mature Harappan core rather than the earlier regionalization phase (`https://www.britannica.com/topic/Indus-civilization`).
- Harappa.com's Kot Diji article supports a pre-2600 BCE "regionalization" frame in which distinct local cultures across the Indus system developed toward Mature Harappan urban integration (`https://www.harappa.com/blog/mohenjo-daro-new-light-beginnings-indus-valley-civilisation-recent-excavations-kot-diji`).
- Kenoyer's "Indus Valley Tradition of Pakistan and Western India" supports Regionalization / Early Harappan phases, including MRG V around 3200-3000 BC, pre-urban / pre-Harappan phases around 3200-2600 BC, Kot Diji / Hakra / Amri / Balakot contexts, and large inland settlements connected by trade networks before Harappa became a major center around 2600-2500 BC (`https://www.harappa.com/sites/default/files/pdf/Kenoyer1991%20Indus%20Valley%20Tradition.pdf`).
- Prasad and Singh's Ancient Asia paper supports Ganeshwar-Jodhpura as a northeast Rajasthan chalcolithic cultural complex with many copper objects and material links to Harappan, Ahar-Banas, and Kayatha contexts (`https://ancient-asia-journal.com/upload/1/volume/Vo.%2012%20%282021%29/Paper/238-1-2914-1-10-20210628.pdf`).

## v223 Verification Findings
- Static check passed: `node --check app.js`.
- VM data audit passed with 8 regions, 879 entities, 818 connections, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and both v223 target IDs having entity data, descriptions, details, capitals/centers, and English/Chinese wiki URLs.
- VM two-dimensional coverage audit found 0 remaining South Asia target gaps in `slot 0.5-1` or `slot 3-4` from 3000 to 2600 BC.
- The post-v223 ranked gap audit confirms early South Asia 3000-2600 BC half-bands are gone from the top list. The largest remaining candidates are Europe 476-774 `slot 5-6`, Southeast Asia 1025-1293 `slot 0.5-1`, Central Asia 565-821 `slot 3.5-4`, Middle East 1550-1350 BC `slot 4.5-5`, Central Asia 430-552 `slot 2-2.5`, and Southeast Asia 550-669 `slot 1-2`.
- Headless Chrome/CDP desktop Chinese South Asia loaded only `v223` assets, rendered 98 South Asia blocks, 90 connection paths, 67 visible connection labels, both v223 targets, 0 upside-down Chinese labels, 0 visible label overflow, 0 visible connection-label overlaps, 0 horizontal overflow, and no browser logs.
- Detail-panel verification opened `early_harappan_indus` and confirmed Chinese `疆域语义` text plus Regionalization / Ravi / Hakra / Kot Diji context.
- Connection-label toggle verification preserved all 90 South Asia connection paths while reducing visible connection labels from 67 to 0.
- Headless Chrome/CDP 390px Chinese dark-mode QA loaded only `v223` assets, rendered both v223 targets, kept `linkLabels=0` at 90 paths / 0 labels, had 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, no browser logs, and dark block text on pale target blocks.
- Screenshots inspected: `/tmp/history_visual_v223_southasia_desktop.png` and `/tmp/history_visual_v223_southasia_mobile_dark.png`.

## v224 Europe Post-Roman Germanic / Early Medieval Findings
- A current VM coverage audit ranked Europe `slot 5-6` from AD 476 to 774 as the next large ownerless-looking band. The old sequence jumped from `germanic_tribes` ending in 476 to `carolingian_germany` beginning in 774, even though the east-Rhine, Bavarian, Saxon, Frisian, and Frankish-Austrasian worlds were historically active throughout.
- v224 adds `post_roman_germanic_polities` and `early_saxon_bavarian_worlds` from 476 to 531. These show the immediate post-Western-Roman mosaic without inventing one early German state.
- v224 adds `merovingian_eastern_duchies` from 531 to 751 beside `saxon_frontier` from 531 to 772. This keeps Frankish-controlled eastern duchies and the independent Saxon / Frisian northern frontier visible at the same time.
- v224 adds `pippinid_carolingian_east` from 751 to 774 and `carolingian_saxon_frontier` from 772 to 774. These bridge the 751 Carolingian takeover and the opening Saxon Wars before the simplified full `carolingian_germany` lane begins.
- The modeling rule is conservative: the new blocks are post-Roman successor fields, duchy/frontier layers, and conflict transitions. They should not be collapsed into `frankish_gaul`, `carolingian_germany`, or a backward-projected modern Germany unless a better source-backed split replaces them.

## v224 Source Notes
- Britannica's history of Germany supports the western empire ending in 476, Germanic peoples west of the Rhine lacking political unity, Frankish expansion east of the Rhine, Merovingian control through local dukes, autonomous Bavarian Agilolfings, independent Frisians and Saxons into the eighth century, the 751 Carolingian takeover, and later Carolingian consolidation east of the Rhine (`https://www.britannica.com/topic/history-of-Germany`).
- Britannica's Clovis I page supports the Frankish expansion frame around Roman Gaul, Alemanni, Burgundians, and Visigoths under Clovis (`https://www.britannica.com/biography/Clovis-I`).
- Britannica's Bavaria page supports Bavarian settlement between 488 and 520 and later Carolingian incorporation in 788 (`https://www.britannica.com/place/Bavaria/History`).
- Britannica's Thuringia page supports the Frankish conquest of Thuringia in 531 and later Frankish ducal/countship control (`https://www.britannica.com/place/Thuringia/History`).
- Britannica's Saxony page supports Old Saxony / lower Elbe territory, Saxon expansion, and late-eighth-century conquest and Christianization by Charlemagne (`https://www.britannica.com/place/Saxony-historical-region-duchy-and-kingdom-Europe`).
- Britannica's Germany / Charlemagne page supports the Saxon Wars context and Charlemagne's campaigns against Saxon resistance (`https://www.britannica.com/place/Germany/Charlemagne`).

## v224 Verification Findings
- Static check passed: `node --check app.js`.
- VM data audit passed with 8 regions, 885 entities, 827 connections, 147 global events, 140 regional events, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and all six v224 target IDs having entity data, descriptions, details, capitals/centers, and English/Chinese wiki URLs through `getWikiUrl`.
- VM two-dimensional coverage audit found 0 remaining Europe target gaps in `slot 5-6` from AD 476 to 774.
- The post-v224 ranked gap audit confirms Europe 476-774 is gone from the top list. The largest remaining candidates are now Americas `slot 1-1.5` preclassic/classic/postclassic half-band gaps, Southeast Asia `slot 0.5-1` in 1025-1238, and Africa `slot 4-4.5` in 534-698 / 1270-1400.
- Static asset scan confirmed `index.html` loads `styles.css?v=224`, `print.css?v=224`, and `app.js?v=224`; `git diff --check` passed.
- Headless Chrome/CDP desktop Chinese Europe loaded only `v224` assets, rendered 134 Europe blocks, 113 SVG paths, 65 visible connection labels, all six v224 targets, 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, and no browser logs.
- Connection-label toggle verification preserved all 113 Europe SVG paths while reducing visible connection labels from 65 to 0.
- Headless Chrome/CDP 390px Chinese dark-mode QA loaded only `v224` assets, rendered all six v224 targets, kept `linkLabels=0` at 113 paths / 0 labels, had 0 upside-down Chinese labels, 0 visible label overflow, 0 horizontal overflow, and no browser logs.
- Screenshots inspected: `/tmp/history_visual_v224_europe_desktop.png` and `/tmp/history_visual_v224_europe_mobile_dark.png`.

## v225 Southeast Asia Malayu / Dharmasraya Findings
- A corrected VM union-coverage audit found that the prior Americas `slot 1-1.5` candidate was a coarse-audit false positive: true entity boundaries already cover the Central America / Maya half-lanes. The largest confirmed blank-looking band was instead Southeast Asia `slot 0.5-1` from AD 1025 to 1293.
- v225 adds `malayu_dharmasraya` from 1025 to 1293 as the Sumatran Jambi-Batang Hari successor field after the Chola shock weakened Palembang. It occupies the right half of the island lane beside `kediri`, rather than stretching Java, Majapahit, or the Malay strait mosaic over the gap.
- v225 rewrites `post_srivijaya` as Post-Srivijaya Strait States: Kedah, Temasek, Palembang-facing ports, and other strait polities remain visible, while the Sumatra core no longer has to be implied inside that broad strait block.
- The modeling rule is conservative: Malayu / Dharmasraya is a source-backed successor half-lane and the 1293 endpoint is a chart handoff to the existing Majapahit island lane, not a claim that the Malayu/Dharmasraya tradition vanished exactly then.

## v225 Source Notes
- Britannica describes Srivijaya as a maritime and commercial kingdom originating in Palembang on Sumatra, controlling the Strait of Malacca, and later facing Chola naval raids in 1025 that weakened Palembang and shifted the regional trading center toward Jambi / Malayu (`https://www.britannica.com/place/Srivijaya-empire`).
- Singapore NLB's "Sri Vijaya-Malayu" article records Rajendra Chola I's 1025 attack on Srivijaya and notes O. W. Wolters's argument that Palembang's late-11th-century role was usurped by Malayu in Jambi (`https://www.nlb.gov.sg/main/article-detail?cmsuuid=2683a39c-55bf-4627-8e95-2d6870e29478`).
- UNESCO's 2025 Muarajambi tentative-list entry identifies the compound as an inheritance of ancient Melayu and Sriwijaya and as a major Buddhist religious, scientific, cultural, political, and trade center from the 7th to 14th centuries (`https://whc.unesco.org/en/tentativelists/6827/`).
- Indonesia's National Museum Amoghapasa entry states that in 1286 an Amoghapasa statue with attendants was brought from Java to Sumatra and placed at Dharmasraya as a diplomatic gift connected to the Melayu ruler (`https://museumnasional.iheritage-virtual.id/collection/detail/4`).

## v225 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=225`, `print.css?v=225`, and `app.js?v=225`.
- VM data audit passed with 8 regions, 886 entities, 829 connections, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and both v225 target IDs having entity data, descriptions, details, capitals/centers, and English/Chinese wiki URLs through `getWikiUrl`.
- VM two-dimensional union coverage found 0 remaining Southeast Asia target gaps in `slot 0.5-1` from AD 1025 to 1293.
- The post-v225 ranked gap audit confirms the Southeast Asia 1025-1293 candidate is gone. The largest remaining candidates are Central Asia `slot 2-2.5` AD 465-552, Central Asia `slot 3.5-4` AD 565-651, Southeast Asia `slot 0-0.5` AD 669-750, Central Asia `slot 3-4` AD 750-821, and Southeast Asia `slot 1-2` AD 550-669.
- Headless Chrome/CDP desktop Chinese Southeast Asia loaded only `v225` assets, rendered 68 blocks, 58 connection paths, 46 visible connection labels, both v225 targets, 0 upside-down Chinese labels, 0 target label overflow, 0 connection-label overlaps, 0 horizontal overflow, and no browser logs.
- Detail-panel verification opened `malayu_dharmasraya` and confirmed Chinese `疆域语义`, 1183 Grahi inscription context, 1286 Amoghapasa diplomacy, relationship links to Srivijaya Core and Post-Srivijaya Strait States, and no `缺口承接` / `Cutout Owners` row.
- Headless Chrome/CDP 390px Chinese dark-mode QA loaded only `v225` assets, rendered both v225 targets, kept `linkLabels=0` at 58 paths / 0 labels, had 0 upside-down Chinese labels, 0 target label overflow, 0 horizontal overflow, and no browser logs.
- Screenshots inspected: `/tmp/history_visual_v225_sea_desktop.png` and `/tmp/history_visual_v225_sea_mobile_dark.png`.

## v226 Central Asia Rouran-Gaoche Steppe Findings
- A corrected Central Asia interval audit showed the real half-lane gap is `slot 2-2.5` from AD 430 to 552, not only AD 465-552. `kangju` covers the Syr Darya / northern steppe half-lane until AD 430, while `gokturk` begins at AD 552.
- v226 adds `rouran_gaoche_steppe` from AD 430 to 552 as the northern Syr Darya / Kazakh-Dzungarian transition field after Kangju and before the Göktürk takeover.
- The modeling rule is conservative: the new block is a Rouran-linked / Gaoche-Tiele western-steppe field, not a claim that one precisely bounded state ruled all northern Central Asia.
- The new block shares color `#8F8A62` and `seamGroup: late_antique_western_steppe` with `late_antique_ili_steppe`, so their internal seam disappears by default where they touch from AD 465 to 552, while hover/focus can still expose the boundary and details.

## v226 Source Notes
- University of Washington Silk Road notes identify Kangju with the Kirghiz/northern steppe north of the Syr Darya and describe its heartland along the middle Syr Darya, supporting why the former `kangju` lane is the predecessor for `slot 2-2.5` (`https://depts.washington.edu/silkroad/texts/weilue/notes11_30.html`).
- Britannica's Central Asia middle-ages overview places the Rouran/Juan-juan empire in the late fourth-to-mid-sixth-century steppe sequence and records its destruction by the Turks in AD 552 (`https://www.britannica.com/place/history-of-Central-Asia-102306/The-Middle-Ages`).
- Encyclopaedia Iranica treats the Hephthalites as a Bactria/Tokharistan-centered late-antique power and records the Turk-Sasanian defeat of the Hephthalites in AD 558-561, supporting the choice not to widen Hephthalite core over the northern steppe lane (`https://www.iranicaonline.org/articles/hephthalites/`).
- The History Files Rouran chronology records Rouran reach toward Xinjiang, the Ili basin, Lake Balkhash, Gaoche/Tiele pressure, and the pre-552 Bumin/Turkic consolidation, giving the cautious Rouran-Gaoche / Tiele label for the new half-lane (`https://www.historyfiles.co.uk/KingListsFarEast/AsiaRouran.htm`).

## v226 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=226`, `print.css?v=226`, and `app.js?v=226`.
- VM data audit passed with 8 regions, 887 entities, 832 connections, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and both v226 target IDs having entity data, descriptions, details, capitals/centers, same `seamGroup`, and English/Chinese wiki URLs through `getWikiUrl`.
- VM two-dimensional union coverage found 0 remaining Central Asia target gaps in `slot 2-2.5` from AD 430 to 552.
- The post-v226 ranked gap audit confirms the Central Asia AD 430-552 candidate is gone. The largest remaining candidates are Southeast Asia `slot 1-2` AD 600-669 and AD 550-600, Central Asia `slot 3.5-4` AD 565-651, Southeast Asia `slot 0-0.5` AD 669-750, Central Asia `slot 3-4` AD 750-821, and Middle East / South Asia residual half-bands.
- In-app browser desktop Chinese Central Asia loaded only `v226` assets, rendered 77 blocks, 74 connection paths, 45 visible connection labels, 0 connection-label overlaps, both v226 targets, 0 upside-down Chinese labels, a 0px seam between `rouran_gaoche_steppe` and `late_antique_ili_steppe`, 0 horizontal overflow, and no browser logs.
- Detail-panel verification opened `rouran_gaoche_steppe` and confirmed Chinese `疆域语义`, Kangju handoff context, Gaoche/Tiele wording, western-steppe semantics, relationship links to Kangju, Late Antique Ili Steppe, and Göktürk, and no `缺口承接` / `Cutout Owners` row.
- In-app browser 390px Chinese dark-mode QA loaded only `v226` assets, rendered both v226 targets, kept `linkLabels=0` at 74 paths / 0 labels, had 0 upside-down Chinese labels, 0 target label outside-block cases, 0 horizontal overflow, and no browser logs.

## v227 Southeast Asia Malay Peninsula Polities Findings
- A corrected Southeast Asia union-coverage audit showed a full-lane gap in `slot 1-2` from AD 550 to 669, after `funan_maritime` and before `srivijaya_malaya`.
- v227 adds `early_malay_peninsula_polities` from AD 550 to 669 as a conservative Malay Peninsula port-polity field, naming Langkasuka, Pan Pan, Chitu / Red Earth, Old Kedah, and linked trans-peninsular routes.
- The modeling rule is conservative: this is not a claim that one bounded kingdom controlled the full peninsula, and it is not a back-projection of Srivijaya before AD 669. It is a source-backed composite lane for documented peninsula polities and trade networks.
- Relationship links connect the block backward to Funan maritime routes, sideways to Chenla-era mainland context, and forward to Srivijaya's later organization of the strait sphere.

## v227 Source Notes
- Langkasuka source direction: the sixth-century resurgence and embassy sequence in 515, 523, 531, and 568 support keeping Langkasuka visible before Srivijaya rather than leaving the Malay Peninsula lane blank (`https://en.wikipedia.org/wiki/Langkasuka`).
- Chitu / Red Earth source direction: Sui-period embassy material and the trans-peninsular trade-route setting support a distinct peninsula polity/network around AD 607 (`https://en.wikipedia.org/wiki/Chi_Tu`).
- Bujang Valley / Old Kedah source direction: fifth-century Sungai Mas/Kataha material and museum interpretation support early trading-polity semantics while cautioning against treating every port as a clean kingdom (`https://museumvolunteersjmm.com/2021/01/13/was-bujang-valley-a-kingdom/`).
- The UBD working paper's route model supports showing linked east/west Malay Peninsula port networks rather than isolated dots, especially for Langkasuka / Chitu / Kedah contexts (`https://ias.ubd.edu.bn/wp-content/uploads/2023/06/working_paper_series_73.pdf`).

## v227 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=227`, `print.css?v=227`, and `app.js?v=227`.
- VM data audit passed with 8 regions, 888 entities, 835 connections, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and `early_malay_peninsula_polities` having entity data, descriptions, details, capitals/centers, territory notes, and English/Chinese wiki URLs through `getWikiUrl`.
- VM two-dimensional union coverage found 0 remaining Southeast Asia target gaps in `slot 1-2` from AD 550 to 669.
- The post-v227 ranked gap audit confirms the Southeast Asia AD 550-669 candidate is gone. The largest remaining candidates are Central Asia `slot 3.5-4` AD 565-651, Southeast Asia `slot 0-0.5` AD 669-750, Central Asia `slot 3-3.5` / `3.5-4` AD 750-821, Middle East `slot 4.67-5` around 1500-1400 BC, South Asia `slot 1-1.5` AD 220-275, and Central Asia `slot 3.5-4` AD 651-705.
- In-app browser desktop Chinese Southeast Asia loaded only `v227` assets, rendered 69 blocks, 61 connection paths, 46 visible connection-label groups, 0 connection-label overlaps, the v227 target, 0 upside-down Chinese labels, 0 target label outside-block cases, 0 horizontal overflow, and no browser logs.
- Detail-panel verification opened `early_malay_peninsula_polities` and confirmed Chinese `疆域语义`, Langkasuka / Chitu / Old Kedah wording, cross-peninsula semantics, relationship links to Funan maritime routes, Chenla, and Srivijaya, and no `缺口承接` / `Cutout Owners` row.
- In-app browser 390px Chinese dark-mode QA loaded only `v227` assets, rendered the v227 target, kept `linkLabels=0` at 61 paths / 0 labels, had 0 upside-down Chinese labels, 0 target label outside-block cases, 0 horizontal overflow, and no browser logs. The actual block name and year text remained dark on the pale target block despite dark-mode chrome.

## v228 Central Asia Post-Hephthalite Tokharistan / Tokhara Yabghus Findings
- A corrected Central Asia interval audit showed the real half-lane gap is `slot 3.5-4` from AD 565 to 651, not the whole steppe or Afghan-route lane. `hephthalite` ends at 565 in the Bactria/Tokharistan core, `gokturk` occupies the northern steppe / Ili-Chu axis, and `afghan_turkic` occupies Kabul / Kapisa / Zabul routes in `slot 4-5`.
- v228 adds `post_hephthalite_tokharistan` from AD 565 to 625 as a cautious Bactria / south-Oxus frontier mosaic after the Turk-Sasanian partition of Hephthalite power.
- v228 adds `tokhara_yabghus` from AD 625 to 651 as the Western Turkic Yabghu polity around Kunduz / Balkh after Tong Yabghu's expansion into Tokharistan.
- The modeling rule is conservative: this is not a full Göktürk widening, not a full Turk Shahi Afghanistan widening, and not a claim that the Tokhara Yabghu dynasty ended in 651. The 651 endpoint is a chart handoff to the existing Arab-pressure frontier sequence; AD 651-705 remains a separate refinement candidate.
- Relationship links connect the new blocks backward to the Hephthalite core, sideways to Western Turkic pressure and the Turk Shahi lane, and forward to the Kabul-Zabul / Arab-pressure frontier.

## v228 Source Notes
- Encyclopaedia Iranica's Hephthalites article records that between AD 558 and 561 the Persians and Turks crushed the Hephthalites near Bukhara and divided their territories along the Oxus, while Hephthalite kingdoms/principalities survived in Afghanistan (`https://www.iranicaonline.org/articles/hephthalites/`).
- Tokhara Yabghu source material records the south-Oxus principalities after the partition, Western Turkic offensives into Tokharistan in the late sixth century, and Tong Yabghu's AD 625 invasion that forced Hephthalite principalities to submit (`https://en.wikipedia.org/wiki/Tokhara_Yabghus`).
- UNESCO's Central Asia volume / chapter metadata for "Tokharistan and Gandhara under Western Türk rule" supports treating the 625 takeover and later Yabghu phase as a major south-Oxus / Hindu Kush political transition, but the live chart keeps the first pass to 625-651 until the later Arab-pressure interval is split (`https://unesdoc.unesco.org/ark%3A/48223/pf0000119011`).

## v228 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=228`, `print.css?v=228`, and `app.js?v=228`.
- VM data audit passed with 8 regions, 890 entities, 841 connections, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and both v228 target IDs having entity data, descriptions, details, capitals/centers, territory notes, and English/Chinese wiki URLs through `getWikiUrl`.
- VM two-dimensional union coverage found 0 remaining Central Asia target gaps in `slot 3.5-4` from AD 565 to 651.
- The post-v228 ranked gap audit confirms the Central Asia AD 565-651 candidate is gone. The largest remaining candidates are Central Asia `slot 3-4` AD 750-821, Middle East `slot 2-5` 330-312 BC, Middle East `slot 4-5` 1550-1500 BC / `slot 4.5-5` 1500-1400 BC, Central Asia `slot 3-4` AD 999-1040, Southeast Asia `slot 0-0.5` AD 669-750, South Asia `slot 1-1.5` AD 220-275, and Central Asia `slot 3.5-4` AD 651-705.
- In-app browser desktop Chinese Central Asia loaded only `v228` assets, rendered 79 Central Asia blocks, 80 SVG paths, 47 visible connection labels, both v228 target blocks, 0 upside-down Chinese labels, 0 target label outside-block cases, 0 connection-label overlaps, 0 horizontal overflow, and no browser logs.
- Detail-panel verification opened `tokhara_yabghus` and confirmed Chinese `疆域语义`, Kunduz / Balkh, Tong Yabghu, Western Turkic, Arab-pressure wording, relationship links, 7 panel links, and no `缺口承接` / `Cutout Owners` row.
- In-app browser 390px Chinese dark-mode QA loaded only `v228` assets, rendered both v228 targets in viewport, kept `linkLabels=0` at 80 paths / 0 labels, had 0 upside-down Chinese labels, 0 target label outside-block cases, 0 horizontal overflow, and no browser logs. The actual block name text remained dark on the pale target blocks despite dark-mode chrome.
- Screenshot inspected: `/tmp/history_visual_v228_centralasia_mobile_dark.png`.

## v229 Visual / Layout Correction Findings
- User clarification: same-color blocks should not be semantically merged; the change should hide visual border lines only where adjacent rendered pieces share an owner/color grouping. Hover/focus may still reveal boundaries and separate details.
- Implementation target: extend seam detection from `.dynasty-block` to both `.dynasty-block` and `.territory-fill-piece`, so explicit filled cutout pieces such as Golden Horde steppe fragments can merge visually with their owner block instead of showing an artificial internal border.
- Dark-mode issue confirmed from v228 QA: dynasty blocks stayed pale and text stayed dark while the surrounding chrome turned dark. v229 target is muted dark map fills with light block labels, and dark-mode toggling must rerender inline block backgrounds.
- East Asia layout issue confirmed: the v228 guide placed Taiwan immediately after the China core, which could make Ming Zheng / Taiwan read as pinned to the Beijing lane. v229 target order moves Taiwan after the Vietnam / South China Sea lane while keeping Taiwan closer to China than Japan.
- Remaining blank regions are not resolved by this visual pass. The latest ranked data-refinement queue remains Central Asia `slot 3-4` AD 750-821, Middle East `slot 2-5` 330-312 BC, Middle East `slot 4-5` 1550-1500 BC / `slot 4.5-5` 1500-1400 BC, Central Asia `slot 3-4` AD 999-1040, Southeast Asia `slot 0-0.5` AD 669-750, South Asia `slot 1-1.5` AD 220-275, and Central Asia `slot 3.5-4` AD 651-705.

## v229 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=229`, `print.css?v=229`, and `app.js?v=229`.
- VM data audit passed with 8 regions, 890 entities, 841 connections, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 bad categories.
- VM East Asia layout audit confirmed `qing` / China core renders at layout slot 3, `qing_taiwan` at slot 6, `nguyen_lords_south` at 5.5, `joseon` at 7, and `edo` at 8. Taiwan remains closer to China than Japan and is separated from the China core by the Vietnam / South China Sea lane.
- Playwright desktop Chinese all-region QA loaded only `v229` assets, rendered 890 blocks and 276 fill pieces, found no transformed Chinese content, no horizontal overflow, and no browser logs. The 1722 East Asia geometry measured a 56px gap from Qing China proper to Qing Taiwan, with Vietnam / South China Sea occupying the intervening lane.
- Playwright Central Asia Golden Horde QA found 4 Golden Horde owner-fill pieces, all carrying `data-seam-group="golden_horde"` and reciprocal same-color seam classes against the main Golden Horde block. Gaps to the main owner block were 0px to 0.015625px with vertical overlap.
- Playwright dark-mode QA confirmed muted dark block fills and light labels: Qing / Qing Taiwan backgrounds were `rgb(112, 107, 83)` with label text `rgb(242, 237, 228)`, while Edo background was `rgb(69, 86, 70)`.
- Playwright 390px Chinese dark-mode QA loaded `v229`, rendered 201 East Asia blocks, preserved 194 connection paths with `linkLabels=0`, showed 0 visible connection-label groups, had 0 transformed Chinese labels, 0 horizontal overflow, and no browser logs.
- Screenshots inspected: `/tmp/history_visual_v229_eastasia_light.png`, `/tmp/history_visual_v229_centralasia_golden.png`, `/tmp/history_visual_v229_eastasia_dark.png`, and `/tmp/history_visual_v229_mobile_dark.png`.

## v230 Dark Legend Polish Findings
- Screenshot review after v229 found a remaining dark-mode mismatch: the collapsed floating legend still read as a light-mode card in the lower-right corner, which pulled attention away from the chart and undercut the dark-mode palette.
- v230 adds explicit dark-mode legend styling: the legend panel background is `rgba(16, 18, 19, 0.96)`, the toggle background is `#1E2020`, the toggle text stays `var(--ink-1)`, and legend swatches use a softer light border.
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=230`, `print.css?v=230`, and `app.js?v=230`.
- Playwright desktop Chinese dark-mode QA loaded only `v230` assets, confirmed the collapsed legend background luminance was 17.647, toggle background luminance 31.5748, toggle text luminance 237.4132, with 0 horizontal overflow, 0 transformed Chinese labels, and no browser logs.
- Screenshot inspected: `/tmp/history_visual_v230_dark_legend.png`.

## v231 Current Coverage Audit Findings
- Session catchup noted an unsynced previous assistant/Claude context that reportedly committed and pushed `590abc0` to `origin/main`; the current dirty worktree remains authoritative for this continuation and must not be reverted.
- A fresh VM audit against the current `WORLD_HISTORY` data surfaced apparent full-span gaps such as East Asia `slot 9-10`, Europe `slot 8-9`, and similar outer rows from 3000 BC to AD 2000. These are boundary artifacts from probing one slot past each region's real configured lanes, not real content gaps.
- The tiny Africa `slot 3.7199999999999998-3.72` row from AD 1591 to 2000 is a floating-point precision artifact caused by a fractional-width boundary, not a meaningful historical blank.
- The highest real remaining candidate is Central Asia `slot 3.5-4` from AD 651 to 821, after the current `tokhara_yabghus` half-lane and before `samanid_south`.
- The adjacent real candidate is Central Asia `slot 3-3.5` from AD 744 to 821, after `gokturk` and before `samanid_south`.
- Existing surrounding blocks constrain the model: `uyghur` already covers the northern steppe half-lane from AD 744 to 840, `abbasid_ca` already covers Transoxiana from AD 750 to 821, and `kabul_zabul_frontier` covers the Afghan route lane from AD 651 to 867. The blank should therefore be filled with a cautious mountain / Upper Oxus / western Tian-Shan frontier model, not by widening those neighbors across unrelated terrain.

## v231 Preliminary Source Notes
- UNESCO's Central Asia volume 3 search metadata exposes a chapter titled "Tokharistan and Gandhara under Western Türk rule (650-750)", which supports treating the post-651 south-Oxus / Hindu Kush lane as a distinct Western Turkic / Tokharistan frontier rather than an empty band (`https://unesdoc.unesco.org/ark:/48223/pf0000104612`).
- Early Islamic conquest summaries consistently distinguish Tokharistan, Sogdia, Khwarazm, and lands north of the Hissar / Jaxartes. Tokharistan is described as an Upper Oxus valley zone with Badakhshan, Khuttal, Kubadhiyan, Chaghaniyan, Guzgan, Badghis, Herat, Bamiyan, and Kabul-related principalities, supporting a plural-principalities label for the mountain half-lane.
- The Badakhshan source snippet from Oxford scholarship places Badakhshan within the eastern reaches of historical Tukharistan and notes its peripheral position in the Muslim world down to the 12th century, supporting a cautious non-caliphal mountain-lane treatment for AD 651-821.
- The Kazakhstan History portal's Karluk Yabgu State article gives the needed western-Tian-Shan chronology: Karluks held a western Yabgu role after 744, supremacy in Zhetysu passed to the Karluk Yabgu in 766, Taraz and Suyab were Turgesh residences, Karluk authority expanded toward Fergana by the late eighth century, and Arab / Samanid pressure resumed in the early ninth century.
- Britannica's Qarluq confederation article independently supports a `c. 745-c. 1000` Karluk frame, rebellion against the Türküt, a confederation with Uyghur and Basmil tribes, a western paramount branch centered at Balasaghun, and later contact with the Samanids in the ninth century (`https://www.britannica.com/topic/Qarluq-confederation`).
- Britannica's Central Asia middle-ages overview supports the lane constraints: the western Kök Türk seat lay around the Ili or Chu valley; the Turks and Sasanians destroyed Hephthalite power in the 560s and controlled major Silk Road routes, but this does not justify extending later Göktürk / Uyghur blocks into all southern mountain lanes (`https://www.britannica.com/place/history-of-Central-Asia-102306/The-Middle-Ages`).
- The Kazakhstan History Turgesh article supports the pre-Karluk side of the western-Tian-Shan lane: Turgesh power centered on Suyab / Chu and Talas / Taraz, opposed Arab advances with Sogdian allies, suffered civil war after Suluk's death, and fell under Karluk pressure by the mid-eighth century (`https://e-history.kz/en/history-of-kazakhstan/show/9511`).
- A Leiden PDF on Bactrian local rulers and early Arab domination was discoverable but blocked by a 403 response through the browser fetch path. Do not use it as an implemented citation unless it is retrieved through another accessible route.

## v231 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=231`, `print.css?v=231`, and `app.js?v=231`.
- VM data audit passed with 8 regions, 892 entities, 848 connections, 148 events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, 0 bad categories, and both v231 targets having descriptions, details, capitals/centers, English wiki URLs, Chinese wiki URLs, no shape plans, and no notch plans.
- VM two-dimensional union coverage found 0 remaining target gaps in Central Asia `slot 3.5-4` from AD 651 to 821, 0 target gaps in `slot 3-3.5` from AD 744 to 821, and 0 combined target gaps in `slot 3-4` from AD 744 to 821.
- In-app Browser desktop Chinese Central Asia QA used a localhost server because direct `file://` navigation was blocked by Browser policy. It loaded only `v231` assets, rendered 81 Central Asia blocks, 41 fill pieces, 88 connection paths, both v231 target blocks, 0 transformed Chinese labels, 0 horizontal overflow, and no browser logs.
- Connection-label toggle check passed at `zoom=3`: `linkLabels=1` rendered 88 paths and 50 visible connection-label groups, while `linkLabels=0` kept 88 paths and rendered 0 labels.
- In-app Browser 390px Chinese dark-mode QA rendered both v231 targets with dark block fills and light labels: Upper Oxus background luminance 65.5062 / label luminance 237.4132, Karluk-Turgesh background luminance 68.375 / label luminance 237.4132. It also had 0 transformed Chinese labels, 0 horizontal overflow, 88 preserved paths, 0 visible labels with `linkLabels=0`, and a dark legend/toggle.
- Detail-panel verification opened both `upper_oxus_principalities` and `karluk_turgesh_frontier`; both panels include Chinese `疆域语义`, 7 relationship/wiki controls, and no `缺口承接` / `Cutout Owners` row.
- The post-v231 ranked coverage audit confirms the Central Asia AD 651-821 / AD 744-821 target is gone. After filtering true slot bounds and sub-0.01 floating slivers, the highest remaining candidates are Southeast Asia `slot 0-0.5` AD 669-750, Middle East `slot 4.67-5` 1500-1400 BC, South Asia `slot 1-1.5` AD 220-275, Central Asia `slot 3-4` AD 999-1040, and Middle East Alexander/Diadochi residual bands around 330-312 BC.

## v232 Current Coverage Audit Findings
- The highest remaining filtered gap after v231 is Southeast Asia `slot 0-0.5` from AD 669 to 750.
- This is a Java / island-Southeast-Asia half-lane gap. `tarumanagara` currently ends at AD 669 over `slot 0-1`; `srivijaya` begins at AD 669 but only occupies `slot 0.5-1` as the Sumatran / Palembang core; `mataram_hindu` begins at AD 750 in `slot 0-0.5`.
- The modeling constraint is clear: Srivijaya's early Palembang / Sumatran core should not be widened leftward over Java, and Chenla / Dvaravati / Malay Peninsula blocks are in different slots. A source-backed Java transition block is the likely fix.

## v232 Source Notes
- Britannica's Central Java section supports a Central Java focus from roughly AD 700 to 1000, with abundant Kedu Plain evidence in the 8th and 9th centuries, a 7th-century north-central Java Old Malay inscription tied to Indonesian Shailendra origins, and a caution that central Javanese rulers are not securely shown as extending far beyond central Java and its north coast (`https://www.britannica.com/place/Indonesia/Central-Java-from-c-700-to-c-1000`).
- GlobalSecurity's Kalingga summary places a Buddhist Kalingga kingdom in Central Java between the 7th century and the beginning of the 8th century, distinguishes it from Tarumanagara in West Java and Srivijaya in Sumatra, and notes a contested transition in which Sanjaya / early Mataram replaced or transformed the Kalingga setting around AD 732 (`https://www.globalsecurity.org/military/world/indonesia/history-kalingga.htm`).
- The source-backed model should be a plural Java transition lane: Kalingga / Ho-ling, north-central Java ports, early Shailendra-Sanjaya context, and the Canggal-era bridge into Mataram. It should not claim a fully mapped, stable Kalingga state through all AD 669-750.

## v232 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=232`, `print.css?v=232`, and `app.js?v=232`.
- VM data audit passed with 8 regions, 893 entities, 851 connections, 149 events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, and `kalingga_early_java` having description, details, capital/center, English wiki URL, Chinese wiki URL, no shape plan, and no notch plan.
- VM two-dimensional union coverage found 0 remaining Southeast Asia target gaps in `slot 0-0.5` from AD 669 to 750, and 0 combined island-lane gaps in `slot 0-1` from AD 669 to 750.
- In-app Browser desktop Chinese Southeast Asia QA loaded only `v232` assets, rendered 70 Southeast Asia blocks, 22 fill pieces, 65 connection paths, the v232 target beside Srivijaya and Mataram, 0 transformed Chinese labels, 0 horizontal overflow, and no browser logs.
- Connection-label toggle check passed at `zoom=3`: `linkLabels=1` rendered 65 paths with visible connection-label text, while `linkLabels=0` kept 65 paths and rendered 0 labels.
- In-app Browser 390px Chinese dark-mode QA rendered `kalingga_early_java` with dark fill `rgb(112, 85, 45)`, background luminance 87.8522, light label `rgb(242, 237, 228)`, label luminance 237.4132, 0 transformed Chinese labels, 0 horizontal overflow, 65 preserved paths, and 0 visible labels with `linkLabels=0`.
- Detail-panel verification opened `kalingga_early_java`; the panel includes Chinese `疆域语义`, 7 relationship/wiki controls, and no `缺口承接` / `Cutout Owners` row. The first read was too early while content was still populating; a short follow-up read confirmed the content was present.
- The post-v232 ranked coverage audit confirms the Southeast Asia AD 669-750 Java half-lane target is gone. The highest remaining filtered candidates are Middle East `slot 4.67-5` 1500-1400 BC, South Asia `slot 1-1.5` AD 220-275, Central Asia `slot 3-4` AD 999-1040, Middle East `slot 3-4` 330-312 BC, and related Middle East late Bronze Age / Diadochi residual bands.

## v233 Session / Audit Findings
- Session catchup repeated the older unsynced `590abc0` push context. No new planning-file updates were reported from that previous session. Current work continues from the dirty local worktree rather than reverting to any pushed state.
- Existing v232 findings and progress prove the latest completed enrichment removed Southeast Asia AD 669-750 `slot 0-0.5` from the filtered gap queue.
- The next ranked candidate to inspect is Middle East `slot 4.67-5` from 1500 to 1400 BC. Because neighboring late Bronze Age residuals also occur in adjacent fractional sub-lanes, v233 should first inspect the actual Middle East slot guide and entity geometry before choosing a label.

## v233 Current Regression Findings
- User clarified same-color adjacency is visual-only: hide seams for same-color adjacent blocks without treating them as one polity. Existing `applySameColorSeams()` groups by region + color + seamGroup, so many same-color adjacencies still keep borders unless manually grouped.
- Dark mode block tinting currently uses `darkTint(hex, 0.48)`, and labels are light, but some source colors can still read too pale against the dark paper; needs a lower color mix and stronger dark border rules.
- Need inspect East Asia render layout for Taiwan/Tungning placement and residual ownerless gaps with current DOM, because code already has a render-only East Asia slot guide but may not be enough for the current complaint.

## v233 Implementation Findings
- Same-color seam detection now groups rendered `.dynasty-block` and `.territory-fill-piece` elements by `region + color` only. This intentionally hides adjacent borders for same-color blocks without changing IDs, hover behavior, focus behavior, detail records, or relationship data.
- Dark-mode block fill now mixes source colors with the dark base at `0.36` instead of `0.48`, so map fills should be noticeably darker while `.dynasty-content`, names, years, and ruler text stay light.
- `qing_beijing` no longer carries the old `shape: 'taper-right'` / `notchOwners: { right: ['tungning'] }` plan. Its description and territory note now say Ming Zheng / Tungning Taiwan belongs in the Taiwan island lane and is connected by events/links, not a Beijing-core cutout.
- v233 adds `late_bronze_levant_city_states` and `mitanni_syria` to close the Middle East Late Bronze edge gap conservatively: local Levant city-state networks bridge 1550-1500 BC, while Mitanni/Hurrian northern Syria sits beside Egyptian southern-Levant hegemony from 1500-1350 BC.
- Source direction used for the Late Bronze split: the Met's Eastern Mediterranean/Syria chronology supports a Late Bronze city-state and Egyptian/Mitanni/Hittite frontier frame; the Met Ugarit essay supports Mitanni influence around 1500 and Hittite domination by around 1350; ISAC's Mitanni letter overview supports a 1500-1360 BC Mitanni state in northern Mesopotamia / northeast Syria.

## v233 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, active asset scan with `index.html` loading `styles.css?v=233`, `print.css?v=233`, and `app.js?v=233`, and a source grep found no old `qing_beijing -> tungning` notch/shape residue.
- VM data audit passed with 8 regions, 895 entities, 854 connections, 150 events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, 0 bad categories, complete target metadata for `late_bronze_levant_city_states`, `mitanni_syria`, `qing_beijing`, `tungning`, and `qing_taiwan`, no `qing_beijing` shape/notch owners, 0 Middle East target gaps in 1550-1350 BC `slot 4-5`, and 0 current-year gaps at AD 1722.
- Headless Chrome/CDP QA via local HTTP loaded only v233 assets across desktop and mobile checks, found 0 transformed Chinese labels, 0 horizontal overflow, and no browser errors.
- East Asia AD 1662 browser check confirmed `tungning` renders to the right of `qing_beijing`, with no `.territory-fill-piece` where `sourceId="qing_beijing"` and `ownerId="tungning"`.
- East Asia AD 1722 browser check confirmed `qing_taiwan` renders after the China core and before Edo Japan, separated from the China core by the Vietnam / South China Sea render lane.
- Dark-mode mobile browser check confirmed Qing Taiwan has a dark fill luminance below the threshold and light label luminance above the threshold, with dark legend chrome preserved.
- Central Asia / Europe AD 1300 browser check confirmed same-color seam classes are present around Golden Horde and related same-color adjacency; screenshots inspected at `/tmp/history_visual_v233_centralasia_golden_seams.png`.
- Screenshots inspected: `/tmp/history_visual_v233_eastasia_1662_tungning.png`, `/tmp/history_visual_v233_eastasia_dark_mobile.png`, `/tmp/history_visual_v233_centralasia_golden_seams.png`, and `/tmp/history_visual_v233_middleeast_1450bc.png`.

## v234 Current Coverage Audit Findings
- Fresh VM union-coverage audit after v233 shows the largest remaining real blank-looking band is Middle East `slot 2-5` from 330 to 305 BC, area 75. Related Hellenistic-transition residuals are Middle East `slot 0-1` from 330 to 312 BC and `slot 4-4.5` from 301 to 274 BC.
- Code inspection confirms `nabataean_early` already covers Arabia `slot 5-6` from 550 to 100 BC. The `slot 2-5` gap therefore means Anatolia, Egypt, and Levant, not Arabia.
- Surrounding model: Achaemenid Anatolia / Levant end in 330 BC, late Achaemenid Egypt ends in 332 BC, current `alexander_persia` only covers Persia/Iran `slot 1-2` from 330 to 312 BC, Ptolemaic Egypt begins in 305 BC, Seleucid Anatolia/Syria begin in 301 BC, and Ptolemaic Levant currently begins only in 274 BC.
- Source direction: Livius supports Alexander crossing into Asia Minor in 334, Granicus, Sardis surrender, and Greek cities including Ephesus, Priene, and Miletus coming under Macedonian control. Britannica's Egypt page supports Alexander's 332 BCE entry into Egypt and the later Macedonian/Ptolemaic frame. Britannica's Seleucid Empire page supports Seleucus seizing Babylonia in 312 and extending toward Syria and Anatolia after Ipsus in 301. Encyclopaedia Iranica supports the Seleucid state growing from the Babylonian satrapy and Babylonia remaining a core region. Cambridge / Livius snippets support the 301 BCE Ipsus settlement and Coele-Syria dispute between Ptolemies and Seleucids.
- Implementation should avoid making one over-wide Alexander rectangle across the entire Middle East. Better: separate transition fragments for Babylonia, Anatolia, Egypt, and Levant, all tied by color/seam/event relationships but still distinct detail records.

## v234 Implementation Findings
- Added `alexander_babylonia`, `alexander_anatolia`, `alexander_egypt`, and `alexander_levant` as separate transition fragments rather than widening `alexander_persia` into every Middle Eastern lane.
- The visual result should still read as a same-color Macedonian / Diadochi field because the fragments share `#7B68EE` and the v233 color-based seam rule hides internal borders, but hover/focus/detail metadata remains per fragment.
- Shifted `achaemenid_levant` to end in 332 BC so Alexander's Tyre / Gaza / Egypt event lines up with a real Levant transition owner.
- Moved `ptolemaic_levant` from 274 BC to 301 BC so the southern Coele-Syria / Phoenician half-lane is no longer blank between Ipsus and the First Syrian War label.
- Also added a `frontier` relationship label/badge because older Central Asia relationships already used that type; this keeps detail-panel relationship types localized instead of falling back to a raw key.

## v234 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=234`, `print.css?v=234`, and `app.js?v=234`.
- VM data audit passed with 8 regions, 899 entities, 863 connections, 152 events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, and 0 bad categories.
- Target metadata is complete for `alexander_babylonia`, `alexander_persia`, `alexander_anatolia`, `alexander_egypt`, `alexander_levant`, `ptolemaic_levant`, and `achaemenid_levant`: descriptions, detail records, centers/capitals, English and Chinese wiki links, and territorial notes are all present.
- VM two-dimensional union coverage found no Middle East gaps in `slot 0-5` from 330 to 301 BC, no Middle East gaps in `slot 3-5` from 332 to 301 BC, and no `slot 4-4.5` gap from 301 to 274 BC.
- Headless Chrome/CDP QA via local HTTP loaded only v234 assets on desktop and mobile. Desktop Middle East checks at 320 BC and 290 BC rendered 170 blocks, 64 fill pieces, and 150 connection paths with 0 upside-down Chinese labels, 0 horizontal overflow, and no target label overflow.
- Same-color seam geometry passed for the Alexander / Diadochi sequence: Babylonia -> Persia -> Anatolia -> Egypt -> Levant all measured 0px horizontal gaps with reciprocal seam classes where expected. `ptolemaic_levant` and `seleucid_syria` also measured 0px adjacency after the 301 BC split.
- `linkLabels=0` preserved 150 connection paths while reducing visible connection-label groups from 95 to 0.
- Mobile Chinese dark-mode QA at 390px rendered the v234 targets with dark block fills and light labels; Alexander fragments measured background luminance 56.5286 and label luminance 237.4132, with 0 upside-down Chinese labels and 0 horizontal overflow.
- Screenshots inspected: `/tmp/history_visual_v234_middleeast_320bc.png`, `/tmp/history_visual_v234_middleeast_290bc.png`, and `/tmp/history_visual_v234_middleeast_320bc_mobile_dark.png`.

## v235 Current Coverage / Source Findings
- Fresh VM union-coverage audit after v234 ranks the largest remaining real gap as South Asia `slot 1-1.5` from AD 220 to 275. The next largest candidates are Central Asia AD 999-1040 `slot 3-4`, Middle East AD 1260-1291 `slot 4-4.5`, South Asia 322-300 BC `slot 1.5-2`, and East Asia AD 1662-1683 `slot 1-1.5`.
- Code inspection shows this South Asia gap sits between `satavahana` ending at AD 220 and `pallava_early` beginning at AD 275 in the Deccan/southern lane. `sangam_early` continues in the adjacent Tamil half-lane, so the missing owner is the Deccan / Andhra successor field rather than Tamilakam.
- EBSCO's Satavahana research starter places the dynasty's decline around AD 225 and states that western provinces were taken by Abhiras and Taikutakas while Ikshvaku power in Andhradesha ended Satavahana rule around AD 225 (`https://www.ebsco.com/research-starters/history/satavahana-dynasty-rises-power-south-india`).
- Britannica's Vakataka article places the dynasty's origin in the central Deccan in the mid-third century CE and names Vindhyashakti around AD 250-270, supporting an early Vakataka component without starting a mature Vakataka-wide block too early (`https://www.britannica.com/topic/Vakataka-dynasty`).
- Andhra Ikshvaku reference material places Ikshvaku rule in the eastern Krishna River valley from Vijayapuri/Nagarjunakonda in the third and fourth centuries CE. It supports using Vijayapuri as the clearest center for the eastern side of the composite lane, while the entity label remains plural because Abhira, early Vakataka, Chutu, and other local owners also belong in the broader Deccan transition.
- Implementation should add a conservative `post_satavahana_deccan` block for AD 220-275 `slot 1-1.5`, not widen Satavahana past its decline or move Pallava before the chart's existing AD 275 southern bridge.

## v235 Implementation Findings
- Added `post_satavahana_deccan` as an AD 220-275 `slot 1` / `width 0.5` South Asia block with `category: 'confederation'`, a distinct related Deccan color, and plural successor wording.
- `sangam_early` now includes `post_satavahana_deccan` in its left-edge notch owners, so the Tamil/Deccan interlock stays owner-filled through the post-Satavahana interval.
- Added relationships `post_satavahana_deccan -> satavahana` at AD 220 and `pallava_early -> post_satavahana_deccan` at AD 275, plus a global and regional AD 225 event marker.
- Added missing Satavahana detail/capital metadata while adding the new post-Satavahana metadata, so the surrounding target chain now has complete detail-panel records.
- Active static assets now load `styles.css?v=235`, `print.css?v=235`, and `app.js?v=235`.

## v235 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only v235 app/style/print assets.
- VM data audit passed with 8 regions, 900 entities, 865 connections, 153 global events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, 0 bad categories, and 0 invalid notch owners.
- Target metadata is complete for `post_satavahana_deccan`, `satavahana`, `sangam_early`, and `pallava_early`: entity, description, detail record, capital/center, territory note, and wiki URL all resolve.
- VM union coverage found 0 South Asia gaps in `slot 1-1.5` from AD 220 to 275 and 0 combined southern-lane gaps in `slot 1-2` for the same window.
- Headless Chrome/CDP desktop Chinese QA at AD 240 loaded v235 assets, rendered `post_satavahana_deccan`, had 0 transformed/upside-down Chinese labels, 0 horizontal overflow, 92 connection paths, 68 visible connection labels after collision pruning, and content stayed inside the target block.
- Detail-panel QA opened the new block and confirmed title, `疆域语义`, Ikshvaku/Abhira successor wording, 9 panel controls/links, and a valid `缺口承接` row because the right taper is explicitly owner-filled by the adjacent Sangam lane.
- Mobile Chinese dark-mode QA at 390px rendered the new block with background `rgb(73, 52, 29)` / luminance 54.804 and label color `rgb(242, 237, 228)` / luminance 237.4132, with 0 transformed Chinese labels, 0 horizontal overflow, and `linkLabels=0` preserving 92 paths while rendering 0 connection labels.
- Screenshots inspected: `/tmp/history_visual_v235_southasia_240.png` and `/tmp/history_visual_v235_southasia_240_mobile_dark.png`.

## v236 Current Coverage / Source Findings
- Fresh post-v235 coverage audit ranks the largest remaining real gap as Central Asia `slot 3-4` from AD 999 to 1040, between the end of `samanid_south` and the start of `seljuk_ca_south`.
- Code inspection confirms this gap is the mountain / Khorasan corridor between the Qara-Khanid Transoxiana block (`slot 0-2`), the Kimek/Kipchak steppe (`slot 2-3`), and the Ghaznavid Afghanistan core (`slot 4-5`). It should not be solved by widening any one of those three whole cores across the entire corridor.
- Britannica's Qarakhanid article supports the AD 999 takeover of Bukhara and the split of former Samanid domains: Qarakhanids received Transoxiana, while Ghaznavids gained Khorasan and Afghanistan, with the Oxus as the boundary (`https://www.britannica.com/topic/Qarakhanid-dynasty`).
- The Humanities Institute Qarakhanid Government overview supports a Qarakhanid field in western Tarim, western Tien Shan, Semirechye, Fergana, and Transoxiana, and notes that Eastern/Western Qarakhanid boundaries met and were contested in Semirechye and Fergana (`https://humanitiesinstitute.org/__static/3729208acac742936c0d529b666dc03e/qarakhanid-government%283%29.pdf?dl=1`).
- Britannica's Dandanaqan article supports the 1040 handoff: Merv fell in 1037, Herat and Nishapur in 1038, and after the 1040 battle Khorasan passed to the Seljuqs (`https://www.britannica.com/event/Battle-of-Dandanqan`).
- Implementation should split the target gap into two half-lanes: a Qara-Khanid Fergana / Tien Shan edge in `slot 3-3.5`, and a Ghaznavid Khorasan / Upper Oxus edge in `slot 3.5-4`. This fills the blank while preserving separate Transoxiana, steppe, Khorasan, and Ghazna/Afghanistan semantics.

## v236 Implementation Findings
- Added `qara_khanid_fergana` from AD 999 to 1040 in Central Asia `slot 3-3.5` with a distinct green so it does not visually merge with the adjacent Kimek/Kipchak steppe lane.
- Added `ghaznavid_khorasan` from AD 999 to 1040 in Central Asia `slot 3.5-4` with the same color as `ghaznavid_ca`, so the Ghaznavid regional split hides its internal border while retaining separate hover/focus/detail records.
- Added descriptions, detail-panel metadata, center/capital metadata, wiki mappings, five relationship links, a global AD 999 event, a Central Asia regional AD 999 event, README / next-prompt notes, and active assets `v236`.

## v236 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=236`, `print.css?v=236`, and `app.js?v=236`.
- VM data audit passed with 8 regions, 902 entities, 870 connections, 154 events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, 0 bad categories, and 0 invalid notch owners.
- Target metadata is complete for `qara_khanid_fergana`, `ghaznavid_khorasan`, `qara_khanid`, `ghaznavid_ca`, and `seljuk_ca_south`; both new blocks resolve English and Chinese wiki URLs and have relationship links.
- VM union coverage found 0 Central Asia gaps in `slot 3-4` from AD 999 to 1040, and 0 combined corridor/core gaps in `slot 3-5` for the same window.
- Headless Chrome/CDP desktop Chinese QA at AD 1020 loaded v236 assets, rendered both new targets, found 0 upside-down Chinese labels, 0 horizontal overflow, 92 connection paths, 51 visible connection-label groups after pruning, and target content stayed inside both narrow blocks.
- Seam QA passed: `ghaznavid_khorasan` and `ghaznavid_ca` measured a 0px horizontal gap with reciprocal same-color seam classes; `qara_khanid_fergana` did not inherit a left seam from the adjacent Kimek lane.
- Detail-panel QA opened `ghaznavid_khorasan` and confirmed title, Chinese `疆域语义`, Dandanaqan context, 8 panel controls/links, and no `缺口承接` row because no cutout is drawn.
- Mobile Chinese dark-mode QA at 390px rendered the new targets with `ghaznavid_khorasan` background `rgb(47, 71, 72)` / luminance 65.9698 and label color `rgb(242, 237, 228)` / luminance 237.4132, with 0 upside-down Chinese labels, 0 horizontal overflow, and `linkLabels=0` preserving 92 paths while rendering 0 connection labels.
- Screenshots inspected: `/tmp/history_visual_v236_centralasia_1020.png` and `/tmp/history_visual_v236_centralasia_1020_mobile_dark.png`.
- Post-v236 ranked coverage audit shows Central Asia AD 999-1040 is resolved. The largest remaining real candidates are now South Asia `slot 1.5-2` from 322 to 300 BC and Middle East `slot 4-4.33` from AD 1260 to 1291.

## v237 Current Coverage / Source Findings
- Fresh post-v236 coverage audit ranks the largest remaining real gap as South Asia `slot 1.5-2` from 322 to 300 BC, between the end of broad `south_prehistoric` coverage and the start of `sangam_early`.
- Code inspection shows `maurya_deccan` starts in 322 BC but correctly occupies only `slot 1-1.5`, because the Tamil south remained outside direct Mauryan absorption. The gap is therefore the Tamil half-lane, not a Deccan gap.
- K. Rajan's "Iron Age-Early Historical transition in South India" notes the older chronology that fixed Tamil Nadu Iron Age around 700-300/100 BC and Early Historic around 300 BC-300 CE, while arguing for a more nuanced transition. This supports a transition owner rather than a precise state claim (`https://iks.iitgn.ac.in/wp-content/uploads/2017/01/Iron-Age%E2%80%93Early-Historical-transition-in-South-India-K-Rajan.pdf`).
- INFLIBNET's South India transition lesson places the Early Historic period generally from the third century BC to third century CE, notes megalithic continuity, emerging polities, script, trade, and Mauryan contact, and says Ashokan inscriptions mention Keralaputra, Satyaputra, Pandiya, and Chozha as independent political entities. This supports a cautious Pre-Sangam Tamilakam block outside direct Mauryan administration (`https://ebooks.inflibnet.ac.in/icp02/chapter/iron-age-early-historic-transition-in-south-india/`).
- Britannica's Sangam literature page dates surviving/compiled Sangam literature later, so v237 does not backdate the full `sangam_early` kingdom block to 322 BC (`https://www.britannica.com/art/Sangam-literature`).

## v237 Implementation Findings
- Added `pre_sangam_tamilakam` as a 322-300 BC South Asia `slot 1.5` / `width 0.5` block with `category: 'culture'`, a distinct transition color, short face labels, and territory notes that explicitly describe the chart-handoff semantics.
- Added description, detail metadata, center/capital metadata, English and Chinese wiki mappings, three relationship links, and global/regional 300 BC event markers.
- Updated README, next-prompt preservation/regression notes, task-plan notes, progress notes, and active static assets to `v237`.

## v237 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=237`, `print.css?v=237`, and `app.js?v=237`.
- VM data audit passed with 8 regions, 903 entities, 873 connections, 155 events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, 0 bad categories, and 0 invalid notch owners.
- Target metadata is complete for `pre_sangam_tamilakam`, `maurya_deccan`, `sangam_early`, and `south_prehistoric`; the new block resolves English and Chinese wiki URLs and has 3 relationship links.
- VM union coverage found 0 South Asia gaps in `slot 1.5-2` from 322 to 300 BC, and 0 combined southern-lane gaps in `slot 1-2` for the same window.
- Headless Chrome/CDP desktop Chinese QA at 310 BC loaded v237 assets, rendered the new target, verified it sits directly beside `maurya_deccan` and directly above `sangam_early`, found 0 upside-down Chinese labels, 0 document overflow, 95 connection paths, and 69 visible connection labels.
- Detail-panel QA opened `pre_sangam_tamilakam` and confirmed the Chinese title, `疆域语义`, Mauryan frontier wording, late Iron Age / early historic transition wording, 8 panel controls/links, and no label outside-block cases.
- 390px Chinese dark-mode QA loaded v237 assets, rendered `pre_sangam_tamilakam` with background `rgb(68, 49, 33)` / luminance 51.8842 and label color `rgb(242, 237, 228)` / luminance 237.4132, with 0 upside-down Chinese labels, 0 horizontal overflow, and `linkLabels=0` preserving 95 paths while rendering 0 connection labels.
- Screenshots inspected: `/tmp/history_visual_v237_southasia_310.png` and `/tmp/history_visual_v237_southasia_310_mobile_dark.png`.
- Post-v237 ranked coverage audit shows South Asia 322-300 BC is resolved. The largest remaining real candidate is Middle East `slot 4-4.33` from AD 1260 to 1291, with a related `slot 4.33-4.5` residual in the same transition.

## v238 Current Coverage / Source Findings
- Fresh post-v237 audit identifies the largest real blank-looking band as Middle East `slot 4-4.33` from AD 1260 to 1291, with a related `slot 4.33-4.5` residual. Code inspection shows `ayyubid_levant` ends in 1260, `crusader_coast` remains correctly visible in the coastal half-lane until 1291, and `mamluk_levant` currently begins only after Acre.
- Britannica's Mamluk dynasty article describes the dynasty as rulers of Egypt and Syria from 1250 to 1517, and notes both repelling Mongol invasions and driving Crusaders from the Levant (`https://www.britannica.com/topic/Mamluk-dynasty-Egypt-Syria`).
- Britannica's Battle of Ayn Jalut article places the decisive Mamluk victory on September 3, 1260, describes the Mongol move into Syria and Damascus before the battle, and states that after the Mamluk victory Egypt's power extended eastward while the Mongols were driven out of Syria (`https://www.britannica.com/event/Battle-of-Ayn-Jalut`).
- Britannica's Damascus history says Ayyubid successors ruled Damascus until 1260 and that, after the Mongol invasion of 1260, much of Syria became directly dependent on the Mamluk rulers in Egypt, with Damascus as the seat of the sultan's deputy in Syria (`https://www.britannica.com/place/Damascus/History`).
- Britannica's Crusades article states that the 1291 capture of Acre by Mamluk sultan al-Ashraf Khalil marked the end of Crusader rule in the Middle East (`https://www.britannica.com/event/Crusades`).
- Modeling decision: add an `mamluk_syria_early` half-lane from 1260 to 1291 for inland Syria / Damascus under Mamluk authority. Do not widen `mamluk_levant` backward to 1260, because that would hide the surviving Crusader coast before Acre fell.

## v238 Implementation Findings
- Added `mamluk_syria_early` as an AD 1260-1291 Middle East `slot 4` / `width 0.5` block with the Mamluk color, `category: 'kingdom'`, `shape: 'taper-right'`, and short Chinese/English labels.
- Updated `mamluk` and `mamluk_levant` descriptions/territory notes so Cairo, early inland Syria, and the post-1291 full Levant are distinguished rather than merged.
- Added detail metadata, Damascus center metadata, English/Chinese wiki mappings through the existing `getWikiUrl` slug tables, three relationship links, a global AD 1260 event, a Middle East regional AD 1260 event, README/next-prompt notes, and active assets `v238`.

## v238 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=238`, `print.css?v=238`, and `app.js?v=238`.
- Initial VM audit attempt failed because the verifier used an obsolete `WIKI_OVERRIDES_EN` variable name. The corrected verifier calls `getWikiUrl()` with `CONFIG.language`, and the clean audit passed with 8 regions, 904 entities, 876 connections, 156 events, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and 0 invalid notch owners.
- Target metadata is complete for `mamluk_syria_early`, `mamluk`, `mamluk_levant`, `crusader_coast`, and `ayyubid_levant`; `mamluk_syria_early` has 3 relationship links and resolves both English and Chinese wiki URLs.
- VM union coverage found 0 Middle East gaps in `slot 4-4.5` from AD 1260 to 1291, and 0 combined Levant gaps in `slot 4-5` for the same window.
- Headless Chrome/CDP desktop Chinese QA at AD 1275 loaded v238 assets, rendered `mamluk_syria_early` beside `crusader_coast`, directly above `mamluk_levant`, and beside `mamluk` with 0px gaps on all three shared boundaries. It found 153 connection paths, 108 visible labels, 0 upside-down Chinese labels, 0 visible label overflow, and 0 horizontal document overflow.
- Detail-panel QA opened `mamluk_syria_early` and confirmed title `早期马穆鲁克叙利亚`, `疆域语义`, Ayn Jalut, Damascus, Crusader coast wording, and 8 links/controls.
- 390px Chinese dark-mode QA loaded v238 assets, rendered the new Mamluk block with background `rgb(64, 82, 66)` / luminance 77.018 and label color `rgb(220, 212, 199)` / luminance 212.7622. `linkLabels=0` preserved 153 paths while rendering 0 connection labels.
- East Asia AD 1722 regression check still passes: Qing Taiwan is in the Taiwan lane, the old `qing_beijing -> tungning` fill is absent, Taiwan is closer to the China core than Edo Japan (168px vs 280px), and no Chinese labels are upside down.
- Screenshots inspected: `/tmp/history_visual_v238_middleeast_1275.png`, `/tmp/history_visual_v238_middleeast_1275_mobile_dark.png`, and `/tmp/history_visual_v238_eastasia_1722.png`.
- Post-v238 ranked coverage audit confirms the Middle East AD 1260-1291 candidate is resolved. The largest remaining candidates are now Southeast Asia `slot 4-4.72` AD 840-849, East Asia `slot 1-1.28` AD 1662-1680, Central Asia `slot 3-4` AD 1186-1194, and smaller Middle East / East Asia short residuals.

## v239 Current Coverage / Source Findings
- Session catchup repeated the older unsynced `590abc0` commit/push context and found no new planning-file updates. Current dirty worktree remains authoritative.
- Fresh post-v238 context identifies the largest real blank-looking band as Southeast Asia `slot 4-5` from AD 840 to 849, between the current `pyu` block and `pagan`.
- Code inspection confirms this is the Myanmar / Irrawaddy lane: `pyu` currently ends at AD 840, while `pagan` starts at AD 849 in the same full slot. It should not be solved by widening Khmer, Dvaravati, or any neighboring mainland lane.
- Britannica's Myanmar / Pyu-state history says Nanzhao raids hit mainland Southeast Asian cities in the early ninth century, the Pyu capital Halingyi fell, and the Burmans moved into that political vacuum, establishing Pagan as their capital city in 849 (`https://www.britannica.com/place/Myanmar/The-Pyu-state`).
- UNESCO's Pyu Ancient Cities listing says Halin, Beikthano, and Sri Ksetra represent Pyu kingdoms in the Ayeyarwady dry zone that flourished for more than 1,000 years between 200 BC and AD 900, supporting a residual/transition reading rather than an abrupt ownerless blank (`https://whc.unesco.org/en/list/1444/`).
- EBSCO's Nanzhao/Pyu overview places Nanzhao's decisive subjugation of Pyu in 832 and describes the decline of Pyu as contributing to the rise of the first Burmese empire centered at Pagan (`https://www.ebsco.com/research-starters/history/nanzhao-subjugates-pyu`).
- Modeling decision: extend the Pyu / Irrawaddy city-state lane to the AD 849 Pagan handoff, add explicit Nanzhao/Pagan event and succession relationship context, and avoid adding a tiny separate "new polity" block or backdating mature 11th-century Pagan power.

## v239 Implementation Findings
- Updated `pyu` descriptions, detail metadata, and territory note so the block explicitly represents the Irrawaddy Pyu city-state lane through the 849 Pagan handoff rather than a hard disappearance in 840.
- Kept `pagan` starting at AD 849 but rewrote its description/details to distinguish the 849 capital handoff from the mature 11th-century Pagan kingdom.
- Added a `pagan -> pyu` AD 849 succession relationship, a global AD 849 Pagan event, Southeast Asia regional AD 832 Nanzhao/Pyu and AD 849 Pagan markers, README and next-prompt notes, task-plan/progress notes, and active assets `v239`.

## v239 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=239`, `print.css?v=239`, and `app.js?v=239`.
- Initial VM audit attempts failed because the temporary DOM stub lacked `document.createElement`, then because the verifier used old table names (`HISTORICAL_CONNECTIONS`, `ENTITY_DESCRIPTIONS`, `DYNASTY_DETAILS`). The corrected verifier uses `CONNECTIONS`, `HISTORICAL_DESCRIPTIONS`, `ENTITY_DETAILS`, and passes an entity object to `getWikiUrl()`.
- VM data audit passed with 8 regions, 904 entities, 877 connections, 157 global events, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and 0 invalid notch owners.
- Target metadata is complete for `pyu` and `pagan`: descriptions, detail records, capital/center records, territory notes, and English/Chinese wiki URLs all resolve. `pyu` now ends at AD 849, `pagan` starts at AD 849, the `pagan -> pyu` succession link exists, and the 832/849 Southeast Asia regional markers plus global AD 849 event exist.
- VM union coverage found 0 Southeast Asia gaps in `slot 4-5` from AD 840 to 849.
- Headless Chrome/CDP desktop Chinese QA at AD 845 loaded v239 assets, rendered Pyu and Pagan in the same lane with a 0px handoff gap, opened the Pyu detail panel, and confirmed `疆域语义`, `南诏`, and 849/Pagan handoff wording. It found 65 connection paths, 50 visible connection labels, 0 upside-down Chinese labels, 0 Pyu label overflow, and 0 horizontal document overflow.
- 390px Chinese dark-mode QA loaded v239 assets, rendered Pyu with dark fill `rgb(53, 60, 66)` / luminance 58.945 and light label `rgb(242, 237, 228)` / luminance 237.4132. `linkLabels=0` preserved 65 paths while rendering 0 connection labels, with 0 upside-down labels and 0 horizontal overflow.
- Screenshots inspected: `/tmp/history_visual_v239_sea_845.png` and `/tmp/history_visual_v239_sea_845_mobile_dark.png`.
- Post-v239 ranked coverage audit confirms the Southeast Asia AD 840-849 candidate is resolved. The largest remaining candidates are East Asia `slot 1-1.28` AD 1662-1680, Central Asia `slot 3-3.5` / `3.5-4` AD 1186-1194, Middle East `slot 5-5.5` AD 1925-1932, Middle East `slot 5.5-6` AD 1818-1824, and smaller East Asia / Europe / Middle East short residuals.

## v240 Current Coverage / Source Findings
- Session continuation and code inspection confirm the next high-value blank-looking band is East Asia `slot 1-1.5` from AD 1662 to 1683, in the China South lane. It is not a Taiwan-lane problem: `tungning`, `qing_taiwan`, `japanese_taiwan`, and `roc_taiwan` remain explicit island-lane entities, and the old `qing_beijing -> tungning` cutout pattern is absent.
- Current East Asia slot semantics remain `0=China North`, `1=China South`, `2=Manchuria/Northeast`, `3=Western Frontier`, `4=Mongolia`, `5=Korea`, `6=Japan`, `7=Vietnam`, `8=Taiwan`. The user-visible Ming Zheng / Taiwan placement concern should therefore be handled by preserving the island lane and filling the mainland south gap with mainland south history, not by moving Taiwan into the Beijing core.
- Britannica's Zhu Youlang / Yongli article places the final Southern Ming claimant's death at Kunming in April 1662 after Qing capture, supporting Southern Ming's existing 1662 endpoint.
- Cambridge's Qing Unification chapter frames 1644 as shorthand for a long and complex process of Ming disintegration and Qing expansion, with Yunnan / southwest China central to the transition. This supports a split southern transition rather than a single national Qing rectangle from 1644.
- Britannica's Revolt of the Three Feudatories entry and EBSCO's Three Feudatories overview support AD 1673-1681 as a southern / southwestern China rebellion by semi-autonomous former Ming generals under Qing authority, suppressed by Kangxi before the 1683 Taiwan campaign.
- Modeling decision: add a mainland `three_feudatories_south` block from AD 1662 to 1681 in China South `slot 1-1.5`, add a short `qing_south_reconsolidation` bridge from AD 1681 to 1683, shift `qing_south_campaigns` to start in AD 1644 so its right half aligns with the post-Beijing conquest phase, and keep Ming Zheng / Tungning unchanged in Taiwan `slot 8`.

## v240 Implementation Findings
- Added `three_feudatories_south` and `qing_south_reconsolidation` to the East Asia China South lane, shifted `qing_south_campaigns.start` from AD 1645 to AD 1644, and kept `tungning` unchanged in Taiwan `slot 8`.
- Added descriptions, detail metadata, capital/center metadata, English/Chinese wiki mappings, four relationship links, global AD 1662/1673/1681 event markers, East Asia regional AD 1662/1673/1681/1683 event markers, README notes, next-prompt regression notes, and active assets `v240`.
- During browser QA, the general label-boundary scan found two pre-existing narrow-lane label escapes in the East Asia AD 1675 view (`yarkent_khanate` and `dzungar_khanate`). Added short labels for both so the western-frontier strip no longer overflows while preserving their full names in tooltips/details.

## v240 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=240`, `print.css?v=240`, and `app.js?v=240`.
- VM data audit passed with 8 regions, 906 entities, 881 connections, 160 global events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, 0 bad categories, and 0 invalid notch owners.
- Target metadata is complete for `three_feudatories_south`, `qing_south_reconsolidation`, `southern_ming`, `qing_south_campaigns`, `qing`, and `tungning`: descriptions, detail records, capital/center records, territory notes, English/Chinese wiki URLs, and relationship links all resolve.
- VM union coverage found 0 East Asia gaps for China South `slot 1-2` from AD 1644 to 1685, and 0 gaps for `slot 1-1.5` from AD 1662 to 1683.
- Headless Chrome/CDP desktop Chinese QA loaded v240 assets and rendered `three_feudatories_south` in the mainland China South lane beside `qing_south_campaigns`, with `tungning` still to the right in the Taiwan lane and no old `qing_beijing -> tungning` owner fill. It found 198 connection paths, 130 visible connection labels, 0 upside-down Chinese labels, 0 label boundary escapes, and 0 horizontal document overflow.
- Detail-panel QA opened `three_feudatories_south` and confirmed title `三藩南方`, `疆域语义`, Wu Sangui / Geng Jingzhong names, 1673 / 1681 context, and explicit Ming Zheng / Taiwan separation wording.
- 390px Chinese dark-mode QA loaded v240 assets, rendered the Three Feudatories block with dark fill `rgb(69, 54, 46)` / luminance 56.6114 and light label `rgb(242, 237, 228)` / luminance 237.4132. `linkLabels=0` preserved 198 paths while rendering 0 connection labels, with 0 upside-down labels, 0 label boundary escapes, and 0 horizontal overflow.
- Screenshots inspected: `/tmp/history_visual_v240_eastasia_1675.png` and `/tmp/history_visual_v240_eastasia_1675_mobile_dark.png`.
- Post-v240 ranked coverage audit confirms the East Asia AD 1662-1683 candidate is resolved. The largest remaining candidates are Central Asia `slot 3-3.5` / `3.5-4` AD 1186-1194, Middle East `slot 5-5.5` AD 1925-1932, Middle East `slot 5.5-6` AD 1818-1824, and Middle East `slot 2-3` AD 1918-1923.

## v241 Current Coverage / Source Findings
- Session catchup repeated the older unsynced commit/push context and found no new planning-file updates. Current dirty worktree remains authoritative.
- Fresh Central Asia audit confirms the target gap is exactly AD 1186-1194 `slot 3-4`, between `seljuk_ca_south` ending in 1186 and `khwarazm_south` starting in 1194. Nearby lanes are already occupied by `kimek` in the northern steppe, `seljuk_ca` in Transoxiana/Khorasan until 1194, and `ghurid_ca` in the Afghanistan/Ghur core from 1186.
- Code context means the missing strip is the Tajik/Kyrgyz / upper Oxus-Khorasan corridor, not a reason to widen the Kimek steppe or to move the Ghurid Afghanistan core out of `slot 4`.
- Encyclopaedia Iranica's Ghurids article says the two Ghurid brothers reached their apogee in 1163-1203; Ghiyath was concerned with westward expansion into Khorasan while Mu'izz al-Din led India campaigns; Turkish amirs in Herat and Balkh were humbled; and the western effort collided with Khwarazmian ambitions.
- The same Iranica Ghurids article says the 1190/1192 fighting in Khorasan ended with the Ghurids defeating Sultan Shah near Merv, capturing him, and taking over his territories; it also places the final Ghaznavid extinction at Lahore in 1186 and Mu'izz al-Din's return to Khorasan to aid Ghiyath.
- Encyclopaedia Iranica's Khwarazmshahs article says Tekish was involved in a long northern-Khorasan struggle with Sultan Shah and the Ghurids, then in 1194 defeated and killed the last Great Seljuk sultan Toghril III. This supports keeping full Khwarazmian Khorasan from 1194, not earlier.
- Modeling decision: add a short `ghurid_khorasan_contest` block from AD 1186 to 1194 in Central Asia `slot 3-4`, same Ghurid color as `ghurid_ca` but separate metadata. Name it as a contested Ghurid Khorasan / upper-Oxus bridge, not settled full Khorasan ownership from the first year.

## v241 Implementation Findings
- Added `ghurid_khorasan_contest` from AD 1186 to 1194 in Central Asia `slot 3-4`, using the Ghurid color but no shape on the new block. This hides the same-color border against `ghurid_ca` while keeping the new block's own detail panel free of a misleading `缺口承接` row.
- Added description text, detail metadata, center/capital metadata, English/Chinese wiki mappings, four relationship links, global AD 1186 / AD 1194 event markers, Central Asia regional AD 1186 / AD 1194 markers, README notes, next-prompt preservation notes, and active assets `v241`.
- Added a visual-interaction fix in `styles.css`: `.dynasty-block` now has `z-index: 100`, keeping connection paths from intercepting clicks on short blocks while leaving the connection SVG available behind blocks.

## v241 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=241`, `print.css?v=241`, and `app.js?v=241`.
- VM data audit passed with 8 regions, 907 entities, 885 connections, 162 global events, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and 0 invalid notch owners.
- VM metadata audit confirms `ghurid_khorasan_contest`, `ghurid_ca`, `seljuk_ca_south`, and `khwarazm_south` all have descriptions, detail records, capitals/centers, English and Chinese wiki URLs, and territory notes.
- VM coverage audit found 0 Central Asia gaps in AD 1186-1194 `slot 3-4` and 0 gaps in combined `slot 3-5` for the same window.
- Headless Chrome/CDP desktop Chinese QA loaded v241 assets, rendered `ghurid_khorasan_contest` beside `ghurid_ca` with a 0px same-color seam, confirmed the click target is the block rather than a connection path, opened the independent detail panel, and found no `缺口承接` row for the new block. It also found 96 connection paths, 54 visible connection labels, 0 upside-down Chinese labels, 0 label escapes, 0 horizontal overflow, and no browser logs.
- 390px Chinese dark-mode QA loaded v241 assets and rendered the target with dark fill `rgb(36, 52, 95)` / luminance 51.703 and light label `rgb(242, 237, 228)` / luminance 237.413. `linkLabels=0` preserved 96 connection paths while rendering 0 visible connection labels, with 0 upside-down labels, 0 label escapes, 0 horizontal overflow, and no browser logs.
- Screenshots inspected: `/tmp/history_visual_v241_centralasia_1190.png` and `/tmp/history_visual_v241_centralasia_1190_mobile_dark.png`.
- Post-v241 ranked coverage audit confirms Central Asia AD 1186-1194 is resolved. The largest remaining candidates are Middle East AD 1925-1932 `slot 5-5.5`, Middle East AD 1818-1824 `slot 5.5-6`, East Asia AD 1912-1916 residual China South half-lanes, and Middle East AD 1918-1922 `slot 2-3`.

## v242 Current Coverage / Code Findings
- Session catchup again reported only the older `590abc0` commit/push context; the current dirty worktree and local planning files remain authoritative.
- Fresh post-v241 coverage context identifies Middle East AD 1925-1932 `slot 5-5.5` as the largest remaining real blank-looking band.
- Code inspection shows this band is the western Arabia / Hejaz half-lane: `hashemite_hejaz` ends in 1925 at `slot 5-5.5`, `saudi_unification` continues in the Najd / interior half-lane at `slot 5.5-6` until 1932, and the full-lane `saudi_arabia` block starts only in 1932.
- Working modeling hypothesis: source-check a short Saudi-controlled Hejaz / Nejd bridge for 1925/1926-1932 in `slot 5-5.5`, with the same Saudi green as `saudi_unification` so the internal same-color border hides, but with separate hover/detail metadata. Do not widen `saudi_arabia` back to 1925, because the formal Kingdom of Saudi Arabia begins in 1932.
- Britannica's Ibn Saud article says Jeddah and Medina surrendered in 1925, Ibn Saud was proclaimed king of the Hejaz on January 8, 1926, and he then ruled Najd and the Hejaz as two separate administrative units until the September 23, 1932 decree unified Najd and the Hejaz as the Kingdom of Saudi Arabia (`https://www.britannica.com/biography/Ibn-Saud`).
- Britannica's Hejaz article likewise states that Ali abdicated and left the country in 1925, Ibn Saud assumed the title King of Hejaz in 1926, and Hejaz, Najd, and other districts were united into Saudi Arabia in 1932 (`https://www.britannica.com/place/Hejaz`).
- Saudipedia gives a Saudi institutional chronology: the Jeddah Agreement in 1925 completed Hejaz unification with the Saudi state, Abdulaziz became King of Hejaz and Sultan of Najd in 1926, the title became King of Hejaz and Najd in 1927, and the Kingdom of Saudi Arabia name began on September 23, 1932 (`https://saudipedia.com/en/unification-of-saudi-arabia`).
- Qatar Digital Library summarizes the same progression: Riyadh was restored in 1902, Hejaz was conquered by 1926, and the modern Saudi state was born by royal proclamation in September 1932 (`https://www.qdl.qa/en/historical-profile-saudi-arabia`).
- Modeling decision: add `saudi_hejaz_nejd` from AD 1925 to 1932 in the western Arabia / Hejaz half-lane. The 1925 start reflects the chart's yearly granularity and the end of Hashemite control; detail text will note the formal 1926 title and 1927 dual-kingdom administration.

## v242 Implementation Findings
- Added `saudi_hejaz_nejd` from AD 1925 to 1932 in Middle East `slot 5` / `width 0.5`, using the same Saudi green as `saudi_unification` but with its own entity ID, labels, metadata, and detail panel.
- Revised `saudi_unification` wording to clarify that it is the Najd / al-Hasa / interior half-lane before 1932, while post-1925 Hejaz is shown in the adjacent new Saudi-controlled lane.
- Added description text, detail metadata, Mecca/Riyadh center metadata, English/Chinese wiki mappings, three relationship links, global AD 1926 / AD 1932 event markers, Middle East regional AD 1926 / AD 1932 markers, README / next-prompt / planning notes, and active assets `v242`.

## v242 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=242`, `print.css?v=242`, and `app.js?v=242`.
- VM data audit passed with 8 regions, 908 entities, 888 connections, 164 global events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, 0 bad declared categories, and 0 invalid notch owners.
- Target metadata is complete for `saudi_hejaz_nejd`, `saudi_unification`, `hashemite_hejaz`, and `saudi_arabia`: descriptions, detail records, capital/center records, territory notes, English and Chinese wiki URLs, and relationship links all resolve.
- VM coverage audit found 0 Middle East gaps in AD 1925-1932 `slot 5-5.5`, and 0 gaps in the combined Arabia lane `slot 5-6` for the same interval.
- Headless Chrome/CDP desktop Chinese QA at AD 1928 loaded v242 assets, rendered `saudi_hejaz_nejd` beside `saudi_unification` with a 0px same-color seam, opened the independent detail panel, and confirmed `疆域语义`, 1925/1932 wording, Ibn Saud, Mecca/Riyadh center text, and no `缺口承接` row. It found 156 connection paths, 109 visible labels, 0 upside-down Chinese labels, 0 target label overflow, 0 horizontal overflow, and no browser errors.
- 390px Chinese dark-mode QA loaded v242 assets, rendered the new block with dark fill `rgb(25, 64, 26)` / luminance 52.965 and label color `rgb(242, 237, 228)` / luminance 237.413. `linkLabels=0` preserved 156 connection paths while rendering 0 visible connection labels, with 0 upside-down labels, 0 target label overflow, 0 horizontal overflow, and no browser errors.
- Screenshots inspected: `/tmp/history_visual_v242_middleeast_1928.png` and `/tmp/history_visual_v242_middleeast_1928_mobile_dark.png`.
- Post-v242 ranked coverage audit confirms Middle East AD 1925-1932 is resolved. The largest remaining multi-year real candidates are East Asia AD 1912-1916 `slot 1-2`, Middle East AD 1818-1824 `slot 5.5-6`, and Middle East AD 1918-1923 `slot 2-3`, after ignoring one-year Europe boundary artifacts.

## v243 Current Coverage / Source Findings
- Session catchup again reported only older commit/push context. The current dirty worktree and local planning files remain authoritative.
- Code inspection confirmed East Asia AD 1912-1916 `slot 1-2` is a real China South lane gap: `qing` covers China proper through 1912, `roc` covers only the early Republic / Beiyang north lane from 1912 to 1916, `roc_manchuria` covers the Northeast, and `warlord_south` begins only in 1916.
- The gap should not be solved by widening the early Beiyang north block into a uniform national rectangle. The early Republic had a Nanjing provisional origin, Yuan Shikai's Beijing-centered government, southern revolutionary/provincial struggles, and only later a full post-Yuan warlord split.
- Britannica's Chinese Revolution page says 14 provinces had declared against Qing by late 1911, a provisional republican government was set up at Nanjing, the Qing emperor abdicated on February 12, 1912, Sun Yat-sen resigned to Yuan Shikai, and the government transferred to Beijing in April 1912 (`https://www.britannica.com/event/Chinese-Revolution-1911-1912`).
- Britannica's early-republican China chapter frames the 1912 settlement as Qing abdication, Sun yielding the presidency to Yuan, and Yuan promising republican government; it also notes early contestation, the 1913 Second Revolution, and Yuan's 1914 dictatorship (`https://www.britannica.com/topic/history-of-China/The-early-republican-period`).
- Britannica's warlord entry says warlords ruled parts of China following Yuan Shikai's death in 1916 and that Sun's southern revolutionary regime later consolidated control in the South (`https://www.britannica.com/topic/warlord-Chinese-history`).
- Britannica's Yuan Shikai page supports Yuan as the first president of the Republic of China from 1912 to 1916 and his failed 1915-16 monarchy, with his death in June 1916 marking the post-Yuan rupture (`https://www.britannica.com/biography/Yuan-Shikai`).
- U.S. Office of the Historian's retired Milestones page supports the southern revolutionary origins, provincial allegiance to the Revolutionary Alliance, Sun's Nanjing provisional presidency, Yuan's 1912 succession, and the new government's failure to unify the country fully (`https://history.state.gov/milestones/1899-1913/chinese-rev`).
- Modeling decision: add `early_republic_south` from AD 1912 to 1916 in East Asia China South `slot 1`, same early ROC color as the Beiyang north and Manchuria blocks, but with a separate detail record noting nominal republic / provincial field rather than stable national control.

## v243 Implementation Findings
- Added `early_republic_south` from AD 1912 to 1916 in East Asia `slot 1`, using the early ROC color so the China North / South seam hides while preserving a separate hover/detail target.
- Added description text, detail metadata, Nanjing/provincial center metadata, English/Chinese wiki mappings, five relationship links across early Republic China proper / South / Northeast handoffs, a global AD 1912 event, README / next-prompt notes, and active assets `v243`.
- Fixed a visual seam bug: category accent bars are left-edge box-shadows and were declared after the same-color seam rule, so they could reintroduce a vertical line on same-color neighbors. v243 now removes the category accent when a rendered block has `same-color-seam-left`.
- Deepened dark-mode territory fills, switched connection strokes to a dark-canvas palette, and changed connection-label halos from white to dark in dark mode.

## v243 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `v243` sources.
- VM data integrity passed with 909 entities, 893 connections, no duplicate IDs, no missing endpoints, no bad connection types/categories, no invalid notch owners, and complete metadata for `early_republic_south`, `roc`, `warlord_south`, `qing`, `roc_manchuria`, and `fengtian_manchuria`.
- VM coverage checks found no East Asia AD 1912-1916 China South / China proper gaps after the Early ROC South insertion.
- Desktop Chinese browser QA confirmed `roc`, `early_republic_south`, and `roc_manchuria` render as separate records while exact same-color seams hide visually. The old category accent divider no longer reappears.
- East Asia layout QA confirmed Taiwan remains closer to the China core than Japan in the render-only guide, while Ming Zheng / Tungning stays in the Taiwan island lane rather than the Beijing-core lane.
- Mobile Chinese dark-mode QA confirmed territory fills are muted/dark, territory labels are light, `linkLabels=0` removes connection-label text while preserving paths, and no upside-down Chinese labels, horizontal overflow, or browser errors appeared.
- Screenshots inspected: `/tmp/history_visual_v243_eastasia_1913.png`, `/tmp/history_visual_v243_1913_viewport.png`, `/tmp/history_visual_v243_1722_dark_viewport.png`, and `/tmp/history_visual_v243_eastasia_1722_mobile_dark.png`.

## v244 Current Coverage / Source Findings
- A fresh post-v243 two-dimensional union-coverage audit found three remaining real multi-year / visible-width gaps above the current threshold: Middle East AD 1818-1824 `slot 5.5-6` in Najd / interior Arabia, Middle East AD 1918-1922 `slot 2-3` in Anatolia, and Middle East AD 1918-1922 `slot 4.67-5` in Transjordan.
- Britannica's Battle of Al-Diriyyah article supports the 1818 Egyptian-Ottoman destruction of the First Saudi State / Wahhabi empire in Najd; Saudipedia supports Turki bin Abdullah's 1824 restoration of Saudi rule at Riyadh. Modeling decision: add a cautious `post_diriyah_najd` transition rather than leaving the lane blank or extending the First Saudi State past defeat.
- Britannica's Turkey history and Ataturk pages support the 1919-1923 Turkish War of Independence, Ankara Grand National Assembly, abolition of the sultanate, Treaty of Lausanne, Ankara capital, and October 29 1923 republic. Modeling decision: add `anatolian_national_movement` as an Anatolia / Ankara-resistance transition block, not a premature Turkish Republic rectangle.
- Britannica's Jordan / Transjordan material and King Hussein official Transjordan summary support Abdullah's arrival in 1920, the 1921 British decision for Abdullah to take over Transjordan, and the 1923 recognition of the Emirate. Modeling decision: split the lane into `post_ottoman_transjordan` and `early_transjordan_emirate` rather than stretching the later mandate label backward.
- Britannica's French Mandate Syria material supports the 1920 French occupation / Faisal expulsion and 1922 League mandate context around the neighboring Levant lane.

## v244 Implementation Findings
- Added `post_diriyah_najd` from AD 1818 to 1824 in the Najd half-lane, with a transition description, center metadata, wiki mappings, and 1818 / 1824 handoff relationships.
- Added `anatolian_national_movement` from AD 1918 to 1923 in the Anatolia lane, connected from late Ottoman rule and into the Turkish Republic.
- Added `post_ottoman_transjordan` from AD 1918 to 1921 and `early_transjordan_emirate` from AD 1921 to 1923, then connected the recognized Transjordan mandate/emirate phase from the early emirate bridge rather than directly from the generic Levant mandate.
- Added global Middle East context events for 1818, 1920, 1921, and 1923; added descriptions, detail metadata, centers, wiki mappings, relationship links, README / planning notes, and active assets `v244`.

## v244 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `styles.css?v=244`, `print.css?v=244`, and `app.js?v=244`.
- VM data integrity passed with 913 entities, 898 connections, no duplicate IDs, no missing endpoints, no bad connection types/categories, no invalid notch owners, and complete metadata for `post_diriyah_najd`, `anatolian_national_movement`, `post_ottoman_transjordan`, `early_transjordan_emirate`, `transjordan_mandate`, and `turkey`.
- VM coverage checks found no remaining gaps above the current threshold of at least two years and at least 0.24 slot width. The previously ranked Middle East AD 1818-1824, AD 1918-1923 Anatolia, and AD 1918-1923 Transjordan targets are gone.
- Desktop Chinese browser QA at AD 1921 rendered the Anatolian National Movement and the two Transjordan transition blocks with continuous handoffs into later Turkey / Transjordan. The detail panel for the Anatolian movement includes `疆域语义`, Ataturk / Ankara context, and relationship links.
- Desktop Chinese browser QA at AD 1820 rendered `post_diriyah_najd` in the former Najd blank.
- 390px Chinese dark-mode QA at AD 1921 confirmed muted dark block fills, light territory labels, no transformed Chinese labels, no horizontal overflow, no browser errors, and `linkLabels=0` preserving 161 connection paths while rendering 0 connection-label groups.
- Screenshots inspected: `/tmp/history_visual_v244_middleeast_1921_viewport.png`, `/tmp/history_visual_v244_middleeast_1820_viewport.png`, `/tmp/history_visual_v244_middleeast_1921_mobile_dark_viewport.png`, `/tmp/history_visual_v244_middleeast_1921.png`, and `/tmp/history_visual_v244_middleeast_1820.png`.

## v245 Current Coverage / Source Findings
- The post-v244 VM audit found no remaining major union-coverage gaps above the current threshold, so v245 shifted from raw blank filling to qualitative correction of a historically over-compressed visible lane.
- The Southeast Asia Indonesia / Java-Sumatra lane was the highest-value target because `voc_java` and `dutch_indies` lacked full metadata and because the old `dutch_indies` 1800-1945 plus `indonesia` 1945-2000 sequence visually erased the 1942 Japanese occupation and 1945-1949 revolution.
- Britannica's Dutch East India Company article supports the 1602-1799 VOC date range, the 1619 capture/rebuilding of Jayakarta as Batavia, and the 1799 Dutch government takeover of VOC debts and possessions (`https://www.britannica.com/topic/Dutch-East-India-Company`).
- Britannica's Indonesia / VOC and Dutch-rule articles support the VOC's commercial-territorial power in Java and the 1870-1910 consolidation of the East Indies into a unified colonial dependency (`https://www.britannica.com/place/Indonesia/Growth-and-impact-of-the-Dutch-East-India-Company`, `https://www.britannica.com/topic/history-of-Indonesia/Dutch-rule-from-1815-to-c-1920`).
- Britannica's Dutch East Indies / Jakarta / Indonesia independence pages support Japanese occupation in 1942, the wartime rupture of Dutch rule, the 17 August 1945 proclamation, and Dutch recognition of Indonesian sovereignty in 1949 (`https://www.britannica.com/place/Dutch-East-Indies`, `https://www.britannica.com/place/Jakarta/History`, `https://www.britannica.com/place/Indonesia/Japanese-occupation`, `https://www.britannica.com/place/Indonesia`).
- The National Archives of Australia fact sheet supports the same independence chronology: proclamation on 17 August 1945, several years of revolution and hostilities, and sovereignty transfer on 27 December 1949 (`https://www.naa.gov.au/help-your-research/fact-sheets/indonesian-independence`).
- Modeling decision: use a five-step owner chain, not one long rectangle: `voc_java` 1619-1800, `dutch_indies` 1800-1942, `japanese_occupied_indonesia` 1942-1945, `indonesia_revolution` 1945-1949, and `indonesia` 1949-2000. The revolution and stable republic share the same red so the internal seam hides visually, but each remains a separate hover/detail record.

## v245 Implementation Findings
- Added full bilingual descriptions, detail records, capital/center records, wiki mappings, territory notes, and relationship links for VOC Batavia, Dutch East Indies, Japanese-Occupied Indonesia, Indonesian Revolution, and Indonesia.
- Changed `dutch_indies.end` from 1945 to 1942, added `japanese_occupied_indonesia`, added `indonesia_revolution`, and changed `indonesia.start` from 1945 to 1949.
- Added relationship links for Dutch state takeover of VOC possessions in 1800, Japanese conquest in 1942, Indonesian independence proclamation in 1945, and sovereignty recognition in 1949.
- Added global and Southeast Asia regional events for Japanese occupation, Indonesian proclamation, and sovereignty recognition, plus regional VOC Batavia / Dutch East Indies context markers.
- Deepened `darkTint()` from a 0.30 to 0.24 source-color mix against a darker base, lowered dark-mode seam border brightness, and removed the generic `transform: rotate(180deg)` from narrow block labels. Chinese and mixed narrow labels now retain `transform: none`.

## v245 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=245`, `print.css?v=245`, and `app.js?v=245`.
- VM data audit passed with 8 regions, 915 entities, 902 connections, 168 global events, 0 duplicate IDs, 0 missing connection endpoints, and 0 bad declared categories.
- Target metadata is complete for `voc_java`, `dutch_indies`, `japanese_occupied_indonesia`, `indonesia_revolution`, `indonesia`, `tungning`, and `qing_taiwan`: descriptions, detail records, capital/center records, and territory notes all resolve.
- VM coverage checks found 0 Southeast Asia gaps in the Indonesia / Java-Sumatra slot from AD 1527 to AD 2000. Point checks for AD 1668, 1722, 1943, and 1947 found no integer-lane owner gaps in visible regions.
- Desktop Chinese dark-mode QA at AD 1947 loaded v245 assets, rendered Dutch East Indies / Japanese-Occupied Indonesia / Indonesian Revolution / Indonesia, confirmed the Indonesian Revolution and Indonesia same-color seam hides, opened the Indonesian Revolution detail panel, and found no horizontal overflow or runtime errors. The dark target fill was `rgb(57, 21, 22)` with label `rgb(242, 237, 228)`.
- East Asia Chinese QA at AD 1668 confirmed `tungning` renders in raw slot 8 / layout slot 6, after the China core and before Japan; no `qing_beijing -> tungning` territory fill exists; no narrow label has a transform.
- 390px Chinese dark-mode QA at AD 1947 confirmed `linkLabels=0` hides connection text, the target labels stay light on dark fills, no narrow-label transform remains, and there is no horizontal overflow.
- Full 1722 all-region smoke test loaded v245 assets, rendered 915 blocks, kept `qing_taiwan` and `tungning` in layout slot 6 while `qing_beijing` stayed in layout slot 3, found no old false Taiwan fill, no upside-down labels, and no horizontal overflow.
- Screenshots inspected: `/tmp/history_visual_v245_sea_dark_1947.png`, `/tmp/history_visual_v245_eastasia_tungning_1668.png`, and `/tmp/history_visual_v245_mobile_sea_dark_1947.png`.

## v246 Current Coverage / Source Findings
- The post-v245 low-threshold VM audit found only small Napoleonic Europe residual bands: Italian `slot 1.85-2` in AD 1805-1815, German `slot 5.78-6` in AD 1806-1815, and German `slot 5-5.78` in AD 1813-1815. After adding the first three blocks, a final one-year Italian AD 1814-1815 `slot 1-1.85` bridge remained and was treated as a transition, not empty land.
- Britannica's Confederation of the Rhine article supports a German client union from 1806 to 1813 and states that Austria and Prussia were outside it (`https://www.britannica.com/topic/Confederation-of-the-Rhine`).
- Britannica's Italy / Napoleonic empire material supports the 1805 Kingdom of Italy, direct French annexations in Liguria, Tuscany, and Rome, and the 1814 collapse before the Vienna settlement (`https://www.britannica.com/place/Italy/The-Napoleonic-empire-1804-14`).
- Britannica's German history / 1760-1815 material supports Leipzig in 1813 ending French domination in central Europe, followed by the Vienna order (`https://www.britannica.com/topic/history-of-Germany/Germany-from-c-1760-to-1815`).
- Britannica's German Confederation article supports the 1815 Vienna settlement creating the German Confederation as the post-Napoleonic German framework (`https://www.britannica.com/topic/German-Confederation`).
- Modeling decision: add narrow, explicitly labeled bridge owners instead of widening the First French Empire, Napoleonic Italy, Rhine Confederation, or German Confederation. These bridge blocks are not claims of clean modern borders; they prevent the chart from showing ownerless slivers during well-known transition years.
- Visual bug found: same-color seam detection was grouping by region + color only. That made it possible for different polities with coincidentally identical colors to lose their boundary. The corrected semantics require region + color + seamGroup, while rendered owner-fill pieces still inherit the owner's seamGroup so true same-polity fragments hide internal seams.

## v246 Implementation Findings
- Added `french_annexed_italy` from AD 1805 to 1815 as the narrow French-annexed Italy strip beside the Napoleonic client kingdom.
- Added `italian_restoration_transition` from AD 1814 to 1815 as the short Austrian/coalition occupation and Vienna-negotiation bridge after Napoleonic Italy collapsed.
- Added `prussia_austria_german_powers` from AD 1806 to 1815 as the narrow Prussia/Austria/non-Rhine-Confederation German great-power strip.
- Added `german_liberation_wars` from AD 1813 to 1815 as the coalition / German-state transition after Leipzig and before the German Confederation.
- Added descriptions, detail metadata, center metadata, wiki mappings, relationship links, a global 1813 Leipzig event, a Europe regional 1813 event, and active assets `v246`.
- Added missing center metadata for `italy_states`, `sardinia_piedmont`, `austrian_italy`, and `italy_unincorporated` so the earlier Italian split blocks have complete map/detail context.
- Tightened `applySameColorSeams()` to group rendered seams by `region|color|seamGroup`, preserving the border-only affordance for true same-polity fragments without hiding coincidental same-color boundaries.

## v246 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=246`, `print.css?v=246`, and `app.js?v=246`.
- VM data audit passed with 8 regions, 919 entities, 909 connections, 169 global events, 0 duplicate IDs, and 0 missing connection endpoints.
- Target metadata is complete for `french_annexed_italy`, `italian_restoration_transition`, `prussia_austria_german_powers`, `german_liberation_wars`, `austrian_italy`, `italy_states`, `sardinia_piedmont`, and `italy_unincorporated`: descriptions, detail records, center records, territory notes, and relationships resolve.
- VM coverage checks found 0 Europe gaps in AD 1805-1815 `slot 1-6`; a broader scan found no high-luminance entity colors that would explain white-looking blocks as actual white fills.
- Desktop Chinese dark-mode browser QA at AD 1814 loaded v246 assets, rendered all four new Napoleonic Europe targets, used dark block fills such as `rgb(35, 40, 34)` / `rgb(54, 51, 38)`, rendered labels in light text, and found no upside-down Chinese labels, no horizontal overflow, and no browser errors.
- East Asia Chinese QA at AD 1665 confirmed `tungning` / 明郑台湾 remains in Taiwan `slot 8`, aligned with the Taiwan island chain rather than the Beijing core; no narrow Chinese label transform appeared.
- Golden Horde seam QA confirmed `golden_horde` and its owner-fill pieces share `seamGroup: golden_horde` and hide their internal seams, while neighboring Timurid blocks retain separate boundaries. This directly verifies the border-hiding-but-not-record-merging behavior.
- Screenshots inspected: `/tmp/history_visual_v246_europe_1814_dark.png`, `/tmp/history_visual_v246_eastasia_1665.png`, `/tmp/history_visual_v246_centralasia_1400_dark.png`, and `/tmp/history_visual_v246_golden_horde_seams.png`.

## v247 Current Coverage / Source Findings
- A fresh post-v246 VM audit found one remaining real multi-year / visible-width gap above the current practical threshold: Middle East AD 1918-1920 `slot 4.33-4.67`, the central Syria/Lebanon strip between late Ottoman Levant and the French Syria-Lebanon mandate.
- Britannica's Faisal I biography states that France invaded Faisal's kingdom and occupied Damascus in July 1920, forcing Faisal into exile (`https://www.britannica.com/biography/Faisal-I`).
- Britannica's Syria / French Mandate page states that a June 1920 French ultimatum was followed by French occupation and Faisal's July expulsion, with the League mandate texts approved in 1922 (`https://www.britannica.com/place/Syria/The-French-mandate`).
- Library of Congress Jordan Country Study describes the July 1919 / March 1920 Syrian Congress proclamations, San Remo's mandate decision, French occupation of Damascus in July 1920, and Faisal's exile (`https://tile.loc.gov/storage-services/master/frd/frdcstdy/jo/jordancountrystu00metz/jordancountrystu00metz_djvu.txt`).
- Library of Congress Iraq Country Study likewise notes that Syria was placed under French mandate at San Remo and that Faisal, proclaimed king of Syria in March 1920, was ejected by the French in July 1920 (`https://tile.loc.gov/storage-services/master/frd/frdcstdy/ir/iraqcountrystudy00metz_0/iraqcountrystudy00metz_0_djvu.txt`).
- Modeling decision: add a short `post_ottoman_syria` transition from AD 1918 to 1920 rather than backdating the French mandate to 1918 or widening British Palestine / Transjordan. The label covers Damascus / OETA North / Faisal's Arab government and the brief Syrian kingdom context, while staying separate from British Palestine and Transjordan.

## v247 Implementation Findings
- Added `post_ottoman_syria` in Middle East `slot 4.33`, `width 0.34`, AD 1918-1920, with a muted transition color and `confederation` / transition-field category.
- Added bilingual descriptions, detail metadata, Damascus center metadata, territory notes, English/Chinese wiki mappings, and three relationship links: Ottoman Levant to Damascus Arab government, Transjordan in Faisal's Syrian orbit, and French occupation after Maysalun.
- Added a global AD 1920 Maysalun / French Syria event and updated the Middle East regional AD 1920 marker to `Ankara Assembly / Maysalun`.
- Bumped active assets to `v247`.

## v247 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=247`, `print.css?v=247`, and `app.js?v=247`.
- VM data audit passed with 8 regions, 920 entities, 911 connections, 170 global events, 0 duplicate IDs, 0 missing connection endpoints, complete metadata for `post_ottoman_syria`, and no Middle East AD 1919 / AD 1920 union-coverage gaps.
- Desktop Chinese browser QA at AD 1919 loaded v247 assets and rendered `post_ottoman_syria` between `levant_mandate` and `post_ottoman_transjordan` with only a 0-0.02px measured horizontal tolerance gap. The block remains a separate focus/click target with its own detail record.
- Connection-label toggle QA at zoom 2 preserved 163 connection paths while reducing visible `.connection-label` groups from 102 to 0 when `linkLabels=0`.
- Dark-mode QA confirmed dark fills and light labels: sampled Middle East blocks had maximum background channel 71 and minimum contrast 10.31; `post_ottoman_syria` rendered as `rgb(40, 39, 33)` with label `rgb(242, 237, 228)` and contrast 12.84.
- East Asia layout regression QA confirmed `tungning` / 明郑台湾 remains raw slot 8 and render layout slot 6, after Vietnam / South China Sea and before Korea, while `qing_beijing` remains render layout slot 3.
- 390px Chinese dark-mode QA found no page horizontal overflow, no transformed narrow Chinese labels, and an accessible focus target for `post_ottoman_syria` with aria label `奥斯曼后叙利亚, 公元1918年 至 公元1920年`.
- Screenshot inspected: `/tmp/history-visual-v247-dark-middleeast.png`.

## v248 Current Coverage / Source Findings
- A fresh post-v247 VM audit found no multi-year coverage gaps above the current threshold. The remaining coverage artifacts are 91 one-year boundary cases, mostly exact handoff years or tiny Europe transition tolerances; this makes qualitative enrichment and metadata debt the better target than another coarse blank fill.
- Metadata debt audit ranked `assyria_levant` first and `neo_babylon_levant` as part of the same weak Middle East chain: both were visible blocks but lacked enough description, detail, center, wiki, and relationship context to justify their space.
- Britannica's Neo-Assyrian material supports Tiglath-pileser III's western expansion, campaigns in Syria and Palestine, the 732 BCE fall of Damascus, provincial replacement of local rulers, and tribute from the Gaza / Philistine edge (`https://www.britannica.com/place/Mesopotamia-historical-region-Asia/The-Neo-Assyrian-Empire-746-609`).
- The Met's Assyria essay supports Neo-Assyrian dominance across Babylonia, western Iran, Anatolia, and the Levant, with Sennacherib / Nineveh / Lachish context (`https://www.metmuseum.org/essays/assyria-1365-609-b-c`).
- Britannica's Neo-Babylonian Empire material supports Southwest Asian dominance from 626 to 539 BCE, Nineveh in 612 BCE, Assyria's end around Harran after 610 BCE, and Nebuchadnezzar's Levant campaign after Carchemish in 605 BCE (`https://www.britannica.com/place/Neo-Babylonian-Empire`).
- Britannica's Nebuchadnezzar II and Babylonian Captivity pages support the conquest of Syria / Palestine, Jerusalem and Temple destruction, Judah's fall, the Babylonian Captivity, and Cyrus ending Babylonian rule in 539 BCE (`https://www.britannica.com/biography/Nebuchadnezzar-II`, `https://www.britannica.com/event/Babylonian-Captivity`).
- The Met's Cyrus / Judean Diaspora article supports Samaria becoming an Assyrian province by 721 BCE, Carchemish sealing Judah's fate, Jerusalem's destruction, and Cyrus entering Babylon in 539 BCE (`https://www.metmuseum.org/perspectives/cyrus-and-the-judean-diaspora`).
- Modeling decision: keep Assyrian and Neo-Babylonian Levant blocks as western imperial lanes, not Mesopotamian core replacements. The sequence should show Assyrian western provinces / tribute, Babylonian takeover after Assyria and Carchemish, Judah's fall, and the Achaemenid handoff.

## v248 Implementation Findings
- Added full bilingual descriptions, details, center metadata, territory notes, and English/Chinese wiki mappings for `assyria_levant` and `neo_babylon_levant`.
- Added relationship links from Assyrian Levant into Iron Age Levant and Neo-Hittite Syria, from Assyrian domination into Babylonian vassal/revolt context, from Neo-Babylonian Levant into Assyrian Levant and the Neo-Babylonian core, and from Achaemenid Levant into the Neo-Babylonian Levant handoff.
- Added global events for 732 BCE Assyria taking Damascus and 586 BCE Jerusalem's destruction; added Middle East regional events for Assyrian Levant provinces, Assyria's fall / Babylon's rise, and Jerusalem's destruction.
- Bumped active assets to `v248`.

## v248 Verification Findings
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading only `styles.css?v=248`, `print.css?v=248`, and `app.js?v=248`.
- VM data audit passed with 8 regions, 920 entities, 918 connections, 172 global events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad categories, and complete metadata for `assyria_levant` and `neo_babylon_levant`.
- VM coverage checks found no Middle East gaps for `slot 4-5` across the Assyrian Levant and Neo-Babylonian Levant windows: 732-609 BCE and 609-539 BCE.
- Desktop Chinese dark-mode browser QA loaded v248 assets, rendered `assyria_levant` and `neo_babylon_levant` with dark muted fills and light labels, and sampled contrast of 11.54 and 11.48 respectively. Both labels reported `transform: none`.
- Detail-panel QA opened `assyria_levant` successfully; panel text resolved to 1208 characters and included the Chinese name, territory semantics, Damascus context, relationships, and wiki links.
- Connection-label toggle QA at zoom 2 preserved 170 connection paths while reducing `.connection-label` groups from 107 to 0 when `linkLabels=0`; target labels such as `亚述在南黎凡特设立行省`, `那波帕拉萨尔巴比伦起义`, and `居鲁士后阿契美尼德黎凡特` appeared when labels were enabled.
- Screenshot inspected: `/tmp/history_visual_v248_middleeast_dark_586.png`.

## v249-v251 Latest Review Findings
- Source direction for v249: Britannica, Discover Islamic Art, and related reference material support Tulunid autonomy in Egypt/Syria after AD 868, Abbasid restoration after 905, and Ikhshidid Egypt-Levant rule from 935 to 969 before Fatimid takeover. Modeling decision: add short named Egypt-Levant owners instead of leaving the lane blank or widening Abbasid/Fatimid blocks.
- Source direction for v250/v251: Britannica and Iranica support Mirwais Hotak's 1709 Kandahar revolt, Nadir Shah's Afghan route / imperial phase, Ahmad Shah Durrani's 1747 Kandahar election and Afghan imperial state, Dost Mohammad / Barakzai ascendancy from 1826, and the 1919 Afghan independence break in foreign-policy control. Modeling decision: split the Afghan-route lane into named phases rather than showing the 1720s as a quiet Mughal frontier or leaving a pause before Durrani.
- Implementation finding: same-color seam hiding remains a visual rule. The data keeps separate IDs, descriptions, details, relationships, hover targets, and detail panels; CSS now prevents same-color seam sides from reappearing on hover/focus.
- Implementation finding: dark mode now derives block fills by desaturating source colors before mixing them into a dark neutral base. This reduces bright cyan/yellow/pink artifacts while preserving enough hue to scan regions and polities. Labels remain `rgb(242, 237, 228)` in sampled QA.
- Implementation finding: Ming Zheng / Tungning Taiwan remains a Taiwan island-lane record (`slot 8`, render layout slot 6). No `qing_beijing -> tungning` fill piece is present in the tested East Asia 1675 page.
- Verification finding: corrected data audit passed with 923 entities, 927 connections, 176 global events, no duplicate IDs, and no missing `from`/`to` endpoints. The Afghan chain has no gaps at 1507, 1709, 1738, 1747, 1826, 1919, or 1999 point checks, and Kokand's right-edge owner list includes Hotak, Afsharid, Durrani, and Barakzai Afghan phases.
- Browser QA finding: Central Asia 1722 dark mode loaded `styles.css?v=251`, `app.js?v=251`, and `print.css?v=251`; Hotak, Kokand, Afsharid, Durrani, and Barakzai blocks render with dark desaturated fills and light labels; no white blocks were found in the sampled DOM; sampled Chinese labels had no upside-down transform.
- Browser QA finding: Golden Horde same-color seam sides were transparent before hover and remained transparent on hover (`left/right rgba(0, 0, 0, 0)`), while top/bottom hover affordance strengthened. This matches the user's "border hidden, records separate" requirement.
- Browser QA finding: `linkLabels=0` preserved 175 connection paths while reducing `.connection-label` groups from 110 to 0 in the Middle East 935 zoom-2 sample.
- Residual risk: the right-side numbered relationship/event marker rail still consumes a large amount of canvas space in dense views. That is a layout/readability issue for a future pass, not evidence of a remaining blank territory block.

## v252-v253 Event Rail / Narrow-View Findings
- Implementation finding: `renderGlobalEvents()` now renders only events whose `region` is currently visible, while preserving the original global event index in the marker text, tooltip title, keyboard activation, and detail panel. This avoids renumbering instability when a user toggles regions.
- Implementation finding: narrow timelines are centered by applying equal margins to `#timelineGrid` only when the rendered grid is narrower than `.timeline-wrapper`. Entity coordinates, connection SVG coordinates, event marker coordinates, raw `slot`, render `layoutSlot`, and all-region horizontal scrolling remain in the existing coordinate system.
- Audit finding: Central Asia half-slot coverage is continuous from 3000 BC to AD 2000, and the whole dataset has no 100-year-or-larger half-slot coverage gaps under the current union model. The remaining "blank" perception in single-region views was largely empty canvas around a narrow grid, not white or transparent polity blocks.
- Browser QA finding: Central Asia-only Chinese dark-mode v253 loaded `styles.css?v=253`, `app.js?v=253`, and `print.css?v=253`; rendered exactly 8 world-event markers; centered the 432px grid inside a 1288px wrapper with a 0px center delta; preserved document width at 1440px; and produced no browser warnings/errors.
- Browser QA finding: all-region Chinese dark-mode v253 rendered all 176 world-event markers, kept `#timelineGrid` left-aligned with no centering margin, and preserved a positive horizontal scroll range for the full 3568px grid.
- Browser QA finding: `events=0` still hides the event rail and renders 0 `.global-event-marker` nodes; clicking a visible filtered marker still opens the world-event detail panel with the stable original number.
- Screenshot inspected: `/tmp/history_visual_v253_centralasia_centered_dark.png`.

## v254 Latest User-Review Findings
- User clarification supersedes the v246/v251 seam-group restriction: same-color adjacency should hide the shared border visually, but it should not assert that two records are one polity. Hover, focus, click targets, details, and relationships must remain separate.
- Implementation finding: `applySameColorSeams()` now groups rendered blocks/fill pieces by `region|color`, not by `region|color|seamGroup`; `seamGroup` remains available as data documentation but no longer gates visual seam hiding.
- Implementation finding: hover/focus now restores the local outline on seam-marked sides. In CDP QA, `qing_beijing` seam sides were `rgba(0, 0, 0, 0)` at rest and changed to `rgba(246, 240, 232, 0.46)` on hover while remaining a separate block.
- Implementation finding: dark-mode territory fills are further muted/darkened by changing `darkTint()` to `colorMix 0.16` and `saturationMix 0.46`; dark-mode block names are explicitly `#F6F0E8`.
- Implementation finding: East Asia's render-only guide now orders China core -> Taiwan -> Vietnam -> Korea -> Japan. Raw Taiwan entities remain `slot 8`; no data moves Taiwan into the Beijing core.
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=254`, `print.css?v=254`, and `app.js?v=254`.
- Source layout audit measured `tungning` raw slot 8 / render layout slot 5, `qing_beijing` layout slot 3, Vietnam layout slot 6, Korea layout slot 7, and Japan layout slot 8.
- Desktop CDP QA at all-region Chinese AD 1722 dark mode loaded v254 assets, rendered 923 blocks / 280 fill pieces / 176 event markers, found max sampled fill luminance 45.34, min sampled text luminance 240.70, 0 too-light fills, 0 white/transparent block backgrounds, and 0 upside-down Chinese transforms.
- Golden Horde QA found `golden_horde` and four Golden Horde owner-fill pieces with same-color seam classes under the new color-only seam rule.
- 390px mobile Chinese dark-mode QA loaded v254 assets, kept document/body width at 390px, found no horizontal overflow, 0 white/transparent block backgrounds, max sampled fill luminance 45.34, 783 seam-marked pieces, and 0 upside-down Chinese transforms.
- Verification hiccups were script-only and resolved: the first CDP verifier mixed `require()` with top-level `await`, and the second passed unsupported `Target.createTarget` sizing parameters. Re-running with an async wrapper and viewport emulation completed successfully.
- Screenshot inspected: `/tmp/history_visual_v254_dark_1722.png`.

## v255 Dense Event-Rail Findings
- Implementation finding: `renderGlobalEvents()` now adds `dense-event-rail` when the active filtered event count reaches the dense threshold, while preserving original global event indexes in marker text, `data-event-number`, tooltip title, `aria-label`, keyboard activation, and the event detail panel.
- Implementation finding: dense event rails now render as muted micro-dots at rest. Hover/focus exposes the original event number through a pseudo-element without changing event data or requiring a new user-facing toggle.
- Implementation finding: mobile dense rails use a separate `dense-event-rail-compact` class with smaller dots and lane spacing, and viewport resize now re-renders the event rail so the compact/desktop state follows orientation changes.
- Read-only delegated audit finding: the old Ming Zheng / Beijing-core placement is not reproducible in current source. `qing_beijing` renders at layout slot 3, `tungning` and `qing_taiwan` render at layout slot 5, and Edo Japan renders at layout slot 8. The same audit found no large blank blocks above the current threshold, but ranked the Americas preclassic Mesoamerican influence-fill cluster as the next semantic risk.
- Static checks passed: `node --check app.js`, `git diff --check`, and active asset scan with `index.html` loading `styles.css?v=255`, `print.css?v=255`, and `app.js?v=255`.
- Desktop CDP QA at all-region Chinese AD 1722 dark mode loaded v255 assets, rendered 923 blocks / 280 fill pieces / 176 event markers, applied dense rail mode with 14 lanes, reduced the rail to 114px, found 0 marker overlaps, and opened the event detail panel from a marker click.
- Central Asia-only CDP QA stayed non-dense with 8 filtered numbered markers, 3 lanes, and 64px rail width, preserving the v253 region-filter behavior.
- 390px mobile CDP QA applied compact dense rail mode with 13 lanes and 80px width, found 0 marker overlaps, no document-level horizontal overflow, max sampled dark fill luminance 45.34, min sampled label luminance about 240.7, 0 white/transparent blocks, and 0 upside-down Chinese transforms.
- Clean screenshots inspected: `/tmp/history_visual_v255_dense_event_rail_dark_clean.png` and `/tmp/history_visual_v255_mobile_dense_event_rail_dark_clean.png`.

## v256-v257 Influence Cutout Cleanup Findings
- Source direction for the Americas cleanup: Britannica describes Olmec reach as exchange/influence across Mesoamerican cultural frontiers and later regionalism rather than one continuing territorial recipient; Britannica and the Met place the Olmec heartland in the Gulf Coast and describe exported/imitated styles and later legacy. Britannica and UNESCO support Zapotec / Monte Alban and Maya / Preclassic developments as distinct regional trajectories.
- Implementation finding: `olmec_maya_influence`, `early_maya_formative`, `maya_preclassic`, `preclassic`, and `zapotec_preclassic` no longer carry `shape`, `notches`, or `notchOwners`. Their descriptions/details now say influence, interaction, and parallel regional development rather than cut edges or owners.
- Browser QA finding: Americas Chinese dark-mode v257 loaded `styles.css?v=257`, `app.js?v=257`, and `print.css?v=257`; all five target blocks had `clip-path: none`, `shapePlan: false`, 0 target `territory-fill-piece` rows, and detail panels with `疆域语义` but no `缺口承接` / `Cutout Owners`.
- Source direction for the Southeast Asia cleanup: Britannica says Khmer domains reached much of modern Thailand and that Sukhothai began with a mid-13th-century revolt against Khmer rule at an outpost; UNESCO describes Sukhothai as absorbing numerous influences and local traditions. This supports a visible Khmer/Lopburi Thai-basin strip, but not an automatic cutout whose missing piece is owned by the Angkor core block.
- Implementation finding: `khmer_thai` is now `Khmer-Lopburi Sphere` / `高棉-罗斛势力`, with no `shape`, category `empire`, and territory text that keeps the Chao Phraya / Thai basin strip whole beside Angkor while relationship links carry Khmer influence.
- Browser QA finding: Southeast Asia Chinese dark-mode v257 rendered `khmer_thai` with `clip-path: none`, `shapePlan: null`, 0 target fill pieces, 0 upside-down labels, 0 horizontal overflow, and a detail panel containing `疆域语义` but no `缺口承接`.
- Full regression QA finding: all-region Chinese AD 1722 dark mode loaded only v257 assets, rendered 923 blocks / 272 fill pieces / 176 dense event markers, and found 0 marker overlaps, 0 white/transparent blocks, 0 upside-down Chinese labels, 0 horizontal overflow, 927 connection paths, and no browser warnings/errors.
- Data audit finding: v257 has 8 regions, 923 entities, 927 connections, 176 historical events, 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types after including the valid `frontier` type, 0 invalid notch owners, 0 unresolved shape plans, and 0 coverage gaps above the current 2-year / 0.24-slot threshold.
- Taiwan regression finding: `qing_beijing` remains raw slot 0 / layout slot 3; `tungning` and `qing_taiwan` remain raw slot 8 / layout slot 5; Edo Japan remains layout slot 8; and there are no old `qing_beijing` / `tungning` false owner-fill pieces.
- Screenshot inspected: `/tmp/history_visual_v257_khmer_lopburi_dark.png`.

## v258 Latest User-Review Visual Findings
- User clarification: same-color adjacency is not a semantic merge; it is only border hiding. The v254 dark-mode CSS still redrew seam-marked sides on hover/focus, which made same-color pieces look separated again in dark mode.
- Implementation finding: removed the final dark-mode same-color hover/focus border override and the older light-mode re-outline block. Seam-marked sides now remain transparent at rest and during hover/focus, while tooltips, focus outlines, click targets, and detail panels still expose separate records.
- Implementation finding: East Asia now keeps raw Taiwan records at `slot 8`, but inserts a narrow render-only layout gap after the China-core source group. This creates a visible strait/island separation before Taiwan without moving Ming Zheng / Tungning into the Beijing/core data lane or restoring any old Qing-Beijing cutout fill.
- Implementation finding: `paleTint()` now mixes less toward white, reducing near-white/light-mode block backgrounds; `darkTint()` mixes less source color into a darker base, lowering dark-mode block luminance while labels remain light.
- Coverage finding: the fresh union-coverage audit found 0 gaps at the current two-year / 0.24-slot threshold, and the AD 1722 point audit found 0 ownerless visible lane segments. A lower threshold still reports only one-year boundary artifacts, mostly in Europe.
- Browser QA finding: all-region Chinese AD 1722 dark-mode v258 loaded `styles.css?v=258`, `app.js?v=258`, and `print.css?v=258`; `tungning` and `qing_taiwan` render raw slot 8 / layout slot 5.34, with a 19px layout gap after the Qing China core. Edo Japan remains farther right at layout slot 8.34.
- Browser QA finding: Golden Horde same-color seams remained transparent after hover (`left/right rgba(0, 0, 0, 0)`), while the tooltip still opened for the Golden Horde block. This verifies border hiding without record merging.
- Browser QA finding: dark-mode max sampled block luminance dropped to 0.0188 relative luminance, no whiteish dark blocks were found, and all sampled block labels stayed light (`rgb(242, 237, 228)`). Light-mode max sampled luminance dropped below the previous whiteish threshold, with 0 blocks above luma 230.
- Mobile QA finding: 390px Chinese dark-mode v258 rendered 923 blocks / 272 fill pieces / 176 event markers, kept the 19px Taiwan strait gap, found 0 event-marker overlaps, 0 document-level horizontal overflow, and 0 upside-down Chinese transforms.
- Screenshots inspected: `/tmp/history_visual_v258_eastasia_1722_dark.png` and `/tmp/history_visual_v258_golden_horde_dark.png`.

## v259 Funan Maritime Cutout Findings
- Post-v258 semantic audit ranked `funan_maritime` as a high-risk false cutout: its own English/Chinese note said the block is a Malay Peninsula / Gulf of Thailand trade projection rather than direct land ownership, but the row still carried `shape: 'taper-left'` and `notchOwners.left = ['indonesia_prehistoric', 'tarumanagara']`.
- Britannica describes Funan as an early Southeast Asian state in Cambodia, Vietnam, Thailand, and Cambodia with trade relations to India and China (`https://www.britannica.com/place/Funan`). This supports keeping a Funan maritime/trade record, but it does not justify showing Java/Sumatra lanes as the owners of a missing Funan land bite.
- Kenneth Hall's Cambridge article on Funan's economic history discusses Oc Eo, Malay Peninsula entrepots, maritime channels, commercial revenue, and Funan's control of trade routes toward the peninsula (`https://www.cambridge.org/core/journals/journal-of-southeast-asian-studies/article/abs/indianization-of-funan-an-economic-history-of-southeast-asias-first-state/CC8FED02B6E2FC7C02980816D0476712`). This supports a whole maritime-route fragment plus relationship links rather than a clipped territorial polygon.
- Modeling decision: remove `shape` and `notchOwners` from `funan_maritime`; keep the same time span, slot, color, category, detail entry, wiki mapping, and trade/succession relationships. The island Southeast Asian lanes remain separate records next to it, not cutout recipients.
- Browser QA finding: Southeast Asia Chinese dark-mode v259 loaded `styles.css?v=259`, `print.css?v=259`, and `app.js?v=259`; `funan_maritime` rendered with `clip-path: none`, no shape class, `shapePlan: false`, and 0 `.territory-fill-piece[data-source-id="funan_maritime"]` rows.
- Detail-panel QA finding: opening `funan_maritime` showed `疆域语义`, `完整海贸片段`, and trade/succession relationships to Malay cultures, Funan Mekong core, and Malay Peninsula polities, while omitting `缺口承接` / `Cutout Owners`.
- Regression QA finding: all-region Chinese dark-mode v259 kept 923 blocks, 270 territory fill pieces, 176 event markers, dark-mode max sampled relative luminance 0.018821, 0 whiteish dark blocks, 0 upside-down Chinese transforms, no document-level horizontal overflow, and Taiwan raw `slot 8` at layout slot `5.34` with the 19.03px strait gap from Qing China. Golden Horde seam sides stayed transparent after hover.
- Data audit finding: v259 has 8 regions / 923 entities / 927 connections / 176 historical events, with 0 duplicate IDs, 0 missing connection endpoints, 0 invalid explicit notch owners, and 0 unresolved shape plans. A separate corrected selector check found 927 connection paths and 592 visible connection-label groups at all-region zoom 2.
- Delegated read-only audit finding: the broader next risk queue should include Jomon/Yayoi contact cutouts, Toungoo Siam / Ayutthaya vassal suzerainty cutouts, Akkad/Elam pressure cutouts, Coele-Syria automatic owner assumptions, Ayyubid/Crusader coast explicitness, Post-Angkor Cambodia pressure/vassalage geometry, and remaining Epiclassic/Postclassic Mesoamerican corridor cutouts. These need source checks before editing.

## v260 Jomon / Yayoi Contact-Cutout Findings
- Post-v259 semantic audit selected `jomon` and `yayoi` as the next high-confidence target: both local notes described Korean-peninsula contact, trade, transmission, or transformation, but the rendered geometry still used Gojoseon / Proto-Three-Kingdoms / Three-Kingdoms Korea as cutout owners.
- Britannica's Jomon article describes Jomon as prehistoric Japanese culture across the archipelago, ending around the rise of Yayoi, with evidence of trade/contact with the Korean peninsula (`https://www.britannica.com/topic/Jomon-culture`). The Met likewise describes Jomon archipelago societies and regular commerce with Korea-facing areas, which supports relationship links rather than a Korean-owned land bite (`https://www.metmuseum.org/essays/jomon-culture-ca-10500-ca-300-b-c`).
- Britannica's Yayoi section states that Yayoi involved rice cultivation, metal objects, continental/Korean cultural influx, and Korean-origin burial parallels, while also saying the migration was not of a magnitude to disrupt the Jomon-descended population (`https://www.britannica.com/place/Japan/The-Yayoi-period-c-300-bce-c-250-ce`). The Met describes wet-rice cultivation as introduced from Korea and southeastern China and notes Korean pottery resemblance and Asian-mainland metallurgy (`https://www.metmuseum.org/essays/yayoi-culture-ca-4th-century-b-c-3rd-century-a-d`).
- Modeling decision: remove `notches` from `jomon`; remove `shape` and `notches` from `yayoi`; keep both as whole Japanese archipelago cultural lanes. Preserve the Jomon peninsula contact relation and add a new `yayoi -> gojoseon` cultural relationship for peninsula routes into Yayoi Japan.
- Browser QA finding: East Asia Chinese dark-mode v260 loaded `styles.css?v=260`, `print.css?v=260`, and `app.js?v=260`; `jomon` and `yayoi` rendered with `clip-path: none`, no shape plan, and 0 target `.territory-fill-piece` rows.
- Detail-panel QA finding: opening `jomon` and `yayoi` showed `疆域语义` plus contact / peninsula-route wording, while omitting `缺口承接` / `Cutout Owners`; the new `yayoi -> gojoseon` relationship appears in Yayoi's detail panel.
- Connection-label QA finding: the new Yayoi peninsula-route connection is present in the relationship data and detail panel. At East Asia zoom 2, the text label itself was hidden by the existing collision-pruning pass, while related visible labels such as `列岛-半岛接触` and `弥生稻作转型` remained available.
- Regression QA finding: all-region Chinese dark-mode v260 kept 923 blocks, 266 territory fill pieces, 176 event markers, and 928 connection paths; dark-mode max sampled relative luminance remained 0.018821, labels stayed light, and the run found 0 whiteish dark blocks, 0 upside-down Chinese transforms, no document-level horizontal overflow, and preserved the 19.03px Taiwan strait gap plus Golden Horde transparent same-color seams.
- Mobile/data QA finding: 390px Chinese dark-mode v260 rendered 923 blocks / 266 fill pieces / 176 events with no horizontal overflow, no upside-down labels, no event-marker overlaps, 0 target Jomon/Yayoi fill rows, and preserved Taiwan layout. Data audit found 8 regions / 923 entities / 928 connections / 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 invalid explicit notch owners, and 0 unresolved shape plans.

## v261 Toungoo / Ayutthaya Suzerainty-Cutout Findings
- Post-v260 semantic audit selected `toungoo_siam` and `ayutthaya_vassal` from the delegated risk queue. Their local text already said Burmese suzerainty / vassalage rather than stable annexation, but both blocks still carried reciprocal `shape: 'taper-*'` geometry that could read as a hard territorial bite.
- Britannica's Bayinnaung article says the 1563 war began over Siam's refusal to acknowledge his suzerainty, that Ayutthaya was captured in 1569, and that a new vassal was installed on the throne (`https://www.britannica.com/biography/Bayinnaung`). This supports a visible Toungoo suzerainty record, but not a reciprocal polygon cutout between two Siam-lane records.
- Britannica's Battle of Nong Sa Rai article says Toungoo conquered Ayutthaya in 1569 and reduced it to a vassal state, then Naresuan renounced vassalage in 1584 (`https://www.britannica.com/event/Battle-of-Nong-Sa-Rai`). Britannica's Naresuan article likewise says Bayinnaung placed Naresuan's father on the throne as vassal and that Naresuan renounced allegiance in 1584 (`https://www.britannica.com/biography/Naresuan`).
- Pamaree Surakiat's Journal of the Siam Society article supports the military-route and siege context: Bayinnaung used the upper Chao Phraya / Rahaeng route and northern Ayutthayan principalities as logistical bases, then took Ayutthaya in the 1563 and 1568 campaigns (`https://thesiamsociety.org/wp-content/uploads/2005/03/JSS_093_0c_PamareeSurakiat_ThaiBurmeseWarfareDuring16thCentu.pdf`). This strengthens the conquest-pressure reading while keeping the relationship mandala-like rather than a clean land-transfer cutout.
- Modeling decision: remove `shape` from `toungoo_siam` and `ayutthaya_vassal`; keep both as separate half-lane records for 1569-1584. Add relationship links from `toungoo_siam` to the preceding `ayutthaya` conquest context and from `ayutthaya_restored` to `ayutthaya_vassal` for Naresuan's 1584 renunciation.

## v262 Post-Angkor Cambodia Pressure-Geometry Findings
- v261 browser QA exposed a related problem: even after `toungoo_siam` lost its own shape, its detail panel still showed `缺口承接` because `cambodia_post` used `toungoo_siam` as one segment of a full-period 1431-1863 Siam-facing owner chain. This confirmed the delegated `cambodia_post` pressure/vassalage risk.
- Britannica's Cambodia hegemony section describes uneasy Tai-Khmer relations, the 1590s sack of Lovek, weak Cambodian kings seeking Siamese or Vietnamese protection, and lost territory/sovereignty, but it gives a specific territorial event in 1794: Siam appropriated Battambang and Siem Reap, held until 1907 (`https://www.britannica.com/topic/history-of-Cambodia/Tai-and-Vietnamese-hegemony`).
- The Association for Asian Studies overview states that by the early 19th century Cambodia had become tributary to both Siam and Vietnam, and that the French protectorate began in 1863 (`https://www.asianstudies.org/publications/eaa/archives/the-rise-and-fall-of-democratic-kampuchea/`). This supports pressure/tributary text and relationship links, not a full 1431-1863 owner-fill bite.
- Modeling decision: keep `cambodia_post` as a mostly whole post-Angkor Cambodian court/kingdom lane; replace the old full-height right-edge owner chain with one time-bounded 1794-1863 Rattanakosin fill for Battambang / Siem Reap; add a `rattanakosin -> cambodia_post` 1794 conquest relationship.

## v263 Same-Color Seam / Regression Findings
- v262 browser QA found a real visual seam regression: `golden_horde` had `same-color-seam-left/right` classes, but the direct element `borderLeftColor` / `borderRightColor` still computed to the dark-mode text color because the CSS only hid the pseudo-element border. v263 adds direct border-side transparency for `.dynasty-block` and `.territory-fill-piece`, in addition to the existing `::before` rules.
- v262 QA also showed a wording false positive: `toungoo_siam` no longer had shape or fill rows, but the Chinese description still contained the phrase `缺口承接`. v263 rewrites that wording to avoid implying a live cutout-owner row.
- Data audit after v263 passed with 8 regions / 923 entities / 931 connections / 176 world events, 0 duplicate IDs, 0 missing endpoints, 0 invalid owner fills, and 0 target fill rows for `toungoo_siam` / `ayutthaya_vassal`. `cambodia_post` still has exactly one owner fill, owned by `rattanakosin`.
- Browser QA after v263 loaded only `styles.css?v=263`, `app.js?v=263`, and `print.css?v=263`. Southeast Asia AD 1570 dark mode showed `toungoo_siam` and `ayutthaya_vassal` with `clip-path: none`, no target fill rows, and no detail-panel `缺口承接`, while `cambodia_post` retained only the 1794-1863 Rattanakosin row.
- Golden Horde dark-mode QA confirmed the block's seam-side direct borders and pseudo borders are transparent before hover and after real CDP mouse hover. The block remains hoverable/clickable with its own tooltip, so this is still visual border hiding rather than semantic merging.
- All-region AD 1722 dark-mode QA rendered 923 blocks / 260 fill pieces / 176 world events / 931 connection paths, found 0 whiteish dark blocks, 0 upside-down Chinese transforms, light labels with minimum sampled RGB channel 232, and no document-level horizontal overflow. `tungning` and `qing_taiwan` remain raw `slot 8`, render at layout slot `5.34`, and keep the 19.03px strait gap after Qing China.
- Verification error log: the first v263 CDP script failed before page testing because Node could not infer module format when `require()` appeared with top-level `await`; it was rerun inside an async wrapper. A follow-up connection-count check first used the obsolete `.connection-path` selector; the correct selector is `.connection-line path`.

## v264 Akkad / Elam Pressure-Cutout Findings
- Post-v263 semantic audit selected `akkad_elam_pressure` / `elam_akkad` from the remaining high-risk queue. The old reciprocal taper geometry could make Akkadian campaigns toward Elam and Elamite continuity look like each side owned a missing land bite from the other.
- Britannica's Elam overview supports Elam as a southwestern Iranian country centered on Susa / Anshan / Awan / Simash traditions, culturally tied to Mesopotamia but not reducible to it (`https://www.britannica.com/place/Elam`). Britannica's Anshan article describes Anshan as an Elamite city/territory and enemy of Akkad around 2350 BC (`https://www.britannica.com/place/Anshan-ancient-territory-Iran`).
- The Met's Akkadian Period essay supports Sargon's southern Mesopotamian empire and eastward/northward expeditions, while Encyclopaedia Iranica's Anshan article supports Akkadian-era campaigns, revolt/resubjugation, Naram-Sin's treaty context, and variable Mesopotamian control (`https://www.metmuseum.org/essays/the-akkadian-period-ca-2350-2150-b-c`, `https://www.iranicaonline.org/articles/anshan-elamite-region/`).
- Modeling decision: remove `shape` / taper semantics from both `akkad_elam_pressure` and `elam_akkad`; keep them as side-by-side rectangular half-lanes. Akkadian pressure is carried by relationships and territory text, while Susa/Anshan-centered Elam remains visible as a neighboring civilization.
- Implementation finding: both details now explicitly say `No land-bite geometry` / `不画土地缺口`, and the old `Cutout Owners` wording is absent. `elam_akkad` is categorized as `kingdom`, and both records keep relationship links through early Elam / Akkadian pressure / Gutian-period continuity.
- Data audit after v264 passed with 8 regions / 923 entities / 931 connections / 176 world events, 0 duplicate IDs, 0 missing endpoints, 0 invalid owner fills, and 0 unresolved shape plans. Both `akkad_elam_pressure` and `elam_akkad` have `shape: null`, no notch owners, and 0 target owner-fill rows.
- Browser QA after v264 loaded only `styles.css?v=264`, `app.js?v=264`, and `print.css?v=264`. Middle East Akkadian-period dark-mode detail QA showed both target blocks with `clip-path: none`, no shape class, 0 target fill rows, `疆域语义`, and no `缺口承接` / `Cutout Owners`, while preserving the four required relationship links.
- Full regression QA after v264 found all-region AD 1722 dark mode still renders 923 blocks / 258 fill pieces / 176 world events / 931 connection paths, with 0 whiteish dark blocks, 0 upside-down Chinese transforms, light labels, no document-level horizontal overflow, Taiwan raw `slot 8` at layout slot `5.34`, and Golden Horde same-color seam borders transparent before and after hover.
- 390px mobile Chinese dark-mode QA loaded v264 assets, rendered 923 blocks / 258 fill pieces / 176 world events / 931 connection paths, found no horizontal overflow, no upside-down labels, and 0 target fill rows for `akkad_elam_pressure` / `elam_akkad`.
- Delegated read-only audit after v264 ranked the next risks as: first, `ayyubid_levant` / `crusader_coast` because any owner-fill across AD 1260-1291 must not imply Ayyubid inland control after Mamluk Syria begins; second, `ptolemaic_levant` / `seleucid_syria` because Coele-Syria contested-frontier geometry may still read as stable possession; third, the remaining Epiclassic / Postclassic Mesoamerican corridor rows, which currently look less urgent because prior findings support corridor/network semantics.

## v265 Ayyubid / Crusader / Early Mamluk Cutout Cleanup Findings
- Post-v264 audit selected `ayyubid_levant` / `crusader_coast` / `mamluk_syria_early` / `mamluk_levant`. Code inspection confirmed the risk: all four post-Hattin / early-Mamluk records still used `shape: 'taper-*'`, so the automatic adjacent-owner logic could display cutout-owner rows in a period where the intended meaning is inland/coastal parallel lanes and timed political handoffs.
- Britannica supports the current chronology: Ayyubid successors ruled Damascus until 1260; after the 1260 Mongol invasion and withdrawal, much of Syria became directly dependent on the Mamluks in Egypt, with Damascus as the sultan's deputy seat (`https://www.britannica.com/place/Damascus/History`). Britannica's Ayn Jalut article places the Mamluk victory on September 3, 1260, after Mongols had taken Damascus and Aleppo, and says Egypt's power extended eastward after the Mongols were driven from Syria (`https://www.britannica.com/event/Battle-of-Ayn-Jalut`).
- Britannica's Crusades article says Saladin's conquest of Jerusalem led to a Third Crusade outcome with Acre and coastal access, and that the 1291 Mamluk capture of Acre marked the end of Crusader rule in the Middle East (`https://www.britannica.com/event/Crusades`). Britannica's Mamluk dynasty page supports Mamluk rule over Egypt and Syria from 1250 to 1517 and notes their role in driving Crusaders from the Levant (`https://www.britannica.com/topic/Mamluk-dynasty-Egypt-Syria`).
- Modeling decision: remove `shape` from `ayyubid_levant`, `crusader_coast`, `mamluk_syria_early`, and `mamluk_levant`; keep them as rectangular lanes. The 1187 reduced-coast relationship and the 1260 inland-Syria handoff are now represented by explicit `frontier` relationship links rather than land-bite geometry.
- Implementation finding: `crusader_coast` and `crusader_states` now have `category: 'kingdom'`; details and territory notes for all four target records say rectangular / whole coastal lane semantics and avoid the `缺口承接` wording when no cutout is drawn.
- VM audit after v265 passed with 8 regions / 923 entities / 933 connections / 176 world events, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and all four targets showing `shape: null`, no `shapePlan`, 0 fill rows, and 0 detail owner rows.
- Browser detail QA at Middle East AD 1275 dark mode loaded `styles.css?v=265`, `print.css?v=265`, and `app.js?v=265`. `ayyubid_levant`, `crusader_coast`, `mamluk_syria_early`, and `mamluk_levant` all rendered with `clip-path: none`, 0 target fill rows, `疆域语义`, rectangular wording, and no `缺口承接` / `Cutout Owners`.
- Detail-panel QA specifically confirmed `crusader_coast` includes both the 1187 Ayyubid-frontier link and the 1260 Mamluk inland-Syria link, plus the 1291 Acre ending; `mamluk_syria_early` includes the 1260 Crusader-coast frontier link and the 1291 full-Mamluk-Levant handoff.
- All-region AD 1722 dark-mode regression loaded v265 assets, rendered 923 blocks / 254 territory fill pieces / 176 event markers / 933 connection paths, found 0 whiteish dark blocks, 0 upside-down Chinese transforms, no horizontal overflow, and preserved Taiwan raw `slot 8` / layout slot `5.34` with Edo Japan farther right.
- Golden Horde seam QA under v265 confirmed the block's direct and pseudo left/right seam borders remain transparent before and after real CDP mouse hover, while the tooltip becomes visible. Mobile 390px all-region dark-mode QA also kept v265 assets, 0 whiteish blocks, 0 upside-down labels, and no document-level horizontal overflow.

## v266 Coele-Syria Contested-Frontier Audit Findings
- Code inspection confirmed the next-risk item: `ptolemaic_levant` and `seleucid_syria` already describe Coele-Syria as a Syrian-Wars contest, but both still use reciprocal `shape: 'taper-*'` geometry. That geometry can read as a stable land-bite / cutout-owner relationship rather than a disputed frontier.
- Britannica's Syrian Wars article identifies the main Seleucid-Ptolemaic dispute as control of southern Syria, notes Coele Syria / southern Syria and Palestine changing hands in the Fourth War, and says the Fifth War was the permanently successful Seleucid effort to wrest Coele Syria from the Ptolemies (`https://www.britannica.com/topic/Syrian-Wars`).
- Britannica's Antiochus III article supports the same chronology: Antiochus held Coele Syria / Lebanon / Palestine / Phoenicia during the Fourth Syrian War but gave up most conquests after Raphia, then invaded Coele Syria again, defeated the Ptolemaic general Scopas at Panion in 200 BCE, and permanently gained southern Syria by the 195 BCE settlement (`https://www.britannica.com/biography/Antiochus-III-the-Great`).
- Modeling decision for v266: keep both records as narrow adjacent frontier fragments, but remove reciprocal taper geometry. The dispute and transfer should be carried by the existing Syrian-Wars / Fifth-Syrian-War relationship links, detail text, and territory notes, not by automatic cutout-owner fills.
- Implementation finding: removed `shape` from `ptolemaic_levant` and `seleucid_syria`; rewrote bilingual descriptions, achievements, and territory notes to say adjacent rectangular contested-frontier lanes and `不画土地缺口` / `No land-bite geometry`; bumped active assets to `v266`.
- VM audit after v266 passed with 8 regions / 923 entities / 933 connections / 176 world events, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. Both Coele-Syria targets have `shape: null`, no notches/notchOwners, no `缺口承接` / `Cutout Owners`, and the expected Syrian-Wars / Fifth-Syrian-War links.
- Browser QA after v266 loaded only `styles.css?v=266`, `print.css?v=266`, and `app.js?v=266`. Middle East AD 250 BCE Chinese dark-mode detail QA showed `ptolemaic_levant` and `seleucid_syria` with `clip-path: none`, no shape class, 0 target owner-fill rows, `疆域语义`, Syrian-Wars wording, and no `缺口承接`.
- Regression QA after v266 found all-region AD 1722 dark mode renders 923 blocks / 252 territory fill pieces / 176 world events / 933 connection paths, with 0 whiteish dark blocks, 0 upside-down Chinese labels, no document-level horizontal overflow, and Taiwan raw `slot 8` at layout slot `5.34`, still left of Edo Japan's layout slot `8.34`.
- Golden Horde same-color seam QA under v266 confirmed direct and pseudo left/right seam borders remain transparent before and after real CDP hover, while the tooltip becomes visible. Mobile 390px all-region dark-mode QA kept v266 assets, 923 blocks / 252 fills / 176 events / 933 paths, 0 upside-down labels, and no document-level horizontal overflow.
- Screenshots inspected: `/tmp/history_visual_v266_coele_syria_dark.png` and `/tmp/history_visual_v266_all_1722_dark.png`.

## v267 Mesoamerican Corridor / Network-Cutout Audit Findings
- Current code inspection confirmed the remaining Americas risk queue: `epiclassic`, `epiclassic_southern_mesoamerica`, `postclassic`, and `postclassic_southern_mesoamerica` still use explicit `notches`, producing `shape-custom` clips and owner-fill rows. The target notes also still say `fill`, `cut`, `缺口`, or `承接`, so details can read regional networks as land-bite ownership.
- UNESCO describes Xochicalco as a fortified political, religious, and commercial center from 650-900 after the breakup of Teotihuacan, Monte Albán, Palenque, and Tikal, and frames the period as new relationships among Central Highlands, Gulf Coast, Yucatan, Chiapas, and Guatemala regions rather than one clean successor territory (`https://whc.unesco.org/en/list/939/`).
- Britannica describes Xochicalco as a fortified city after Teotihuacan with multicultural influence and an important trading-center / entrepôt role (`https://www.britannica.com/place/Xochicalco`). Britannica's Postclassic overview describes Cholula, Xochicalco, and Tula as major centers with changing importance from 900-1200, not as a single corridor-state owning a neighboring cut edge (`https://www.britannica.com/topic/pre-Columbian-civilizations/Archaeological-remains-of-Postclassic-civilization`).
- Smarthistory / British Museum notes that Late Postclassic Cholula's Mixteca-Puebla ceramics show influence from Mixteca and Gulf Coast regions and that the style / religious symbols were shared widely across Mesoamerica; this supports a network/style/trade lane rather than a land-transfer polygon (`https://smarthistory.org/pottery-mixteca-puebla/`).
- Modeling decision for v267: keep all four records as visible adjacent lanes so the simplified chart still shows central-Mexican fields, southern Mesoamerican networks, and Maya continuities, but remove `notches` from all four. Relationships and territory notes should carry contact, trade, fortified-center, and regional-continuity semantics; no `Cutout Owners` / `缺口承接` should appear for these network rows.
- Implementation finding: `epiclassic`, `epiclassic_southern_mesoamerica`, `postclassic`, and `postclassic_southern_mesoamerica` now have no `shape`, no `notches`, and no `notchOwners`. The text now describes adjacent city-state / network lanes, and the detail achievements explicitly include `No land-bite geometry` / `不画土地缺口`.
- VM audit finding: v267 data has 8 regions, 923 entities, 933 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, and 0 invalid explicit notch owners. All four targets return `shapePlan: false`, 0 owner-fill rows, no `缺口承接` / `Cutout Owners`, and positive no-land-bite wording.
- Browser QA finding: Americas AD 800 and AD 1250 Chinese dark-mode pages loaded v267 assets. The four target blocks render with `clip-path: none`, no shape class, and 0 target `.territory-fill-piece` rows. Their detail panels show `疆域语义` plus adjacent/network/no-land-bite wording and omit `缺口承接`.
- Regression QA finding: all-region Chinese AD 1722 dark mode loads `styles.css?v=267`, `print.css?v=267`, and `app.js?v=267`, renders 923 blocks / 248 fill pieces / 176 event markers / 933 connection paths, finds 0 high-luminance or transparent dark block backgrounds, 0 low-luminance sampled labels, 0 upside-down Chinese transforms, and no body/page overflow. `tungning` and `qing_taiwan` remain raw `slot 8` at layout slot `5.34`; Edo Japan remains farther right at layout slot `8.34`.
- Mobile and seam QA finding: 390px all-region Chinese dark mode keeps 923 blocks / 248 fills / 176 events / 933 paths, no body overflow, and no transformed labels. Central Asia Golden Horde seam QA confirms seam-marked sides are transparent before and after real hover, while non-seam outside borders remain visible and the tooltip opens. Screenshots inspected: `/tmp/history_visual_v267_mesoamerica_dark.png`, `/tmp/history_visual_v267_postclassic_dark.png`, `/tmp/history_visual_v267_all_1722_dark.png`, and `/tmp/history_visual_v267_golden_horde_seams.png`.

## v268 Steppe / Gojoseon Frontier-Cutout Audit Findings
- Fresh post-v267 local audit found no new multi-year coverage gaps above the practical threshold, but it ranked `steppe_bronze`, `steppe_nomads`, and `gojoseon` as the highest remaining semantic-risk cluster because frontier/contact wording was still implemented as owner-fill cutouts.
- National Museum of Korea material supports Liaoning-type bronze dagger culture as a Korean Bronze Age / Gojoseon-associated horizon linked to Liaoning, while Britannica supports Wiman Gojoseon / Choson as a Korea-Manchuria border polity overthrown by Han in 108 BCE. Britannica and Met material support Xiongnu / early eastern steppe worlds as nomadic-pastoral networks and frontier interaction fields, not a clean reciprocal land-bite model (`https://www.museum.go.kr/JPN/contents/E0403000000.do?relicId=4379&schM=view&searchId=represent`, `https://www.britannica.com/biography/Wiman`, `https://www.britannica.com/topic/Xiongnu`, `https://www.metmuseum.org/met-publications/nomadic-art-of-the-eastern-eurasian-steppes-the-eugene-v-thaw-and-other-notable-new-york-collection`).
- Modeling decision for v268: keep `steppe_bronze`, `steppe_nomads`, `xiongnu`, and `gojoseon` as adjacent whole lanes. Remove `shape` / `notchOwners` from `steppe_bronze` and `steppe_nomads`, remove `notches` from `gojoseon`, and carry Liaoning-Korean Bronze Age contact, steppe-Gojoseon contact, and Xiongnu pressure through explicit cultural/frontier links and detail text.
- Implementation finding: `steppe_bronze`, `steppe_nomads`, and `gojoseon` now have no `shape`, no `notches`, and no `notchOwners`. The text now describes adjacent whole lanes, and detail achievements explicitly include `No land-bite geometry` / `不画土地缺口`.
- VM audit finding: v268 data has 8 regions, 923 entities, 936 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, and 0 invalid explicit notch owners. `steppe_bronze`, `steppe_nomads`, and `gojoseon` return `shapePlan: false`, 0 owner-fill rows, no `缺口承接` / `Cutout Owners`, and positive no-land-bite wording.
- Browser QA finding: East Asia Chinese dark-mode target QA loaded `styles.css?v=268`, `print.css?v=268`, and `app.js?v=268`. `steppe_bronze`, `steppe_nomads`, `xiongnu`, and `gojoseon` render with `clip-path: none` and no shape class; the three edited targets have 0 source fill rows. Detail panels show `疆域语义`, omit `缺口承接`, and expose the new `辽宁-朝鲜青铜剑视野`, `草原-古朝鲜边疆接触`, and `匈奴/古朝鲜边疆压力` relationship labels.
- Regression QA finding: all-region Chinese AD 1722 dark mode renders 923 blocks / 244 fill pieces / 176 world events / 936 connection paths, with 0 high-luminance or transparent dark block backgrounds, 0 low-luminance sampled labels, 0 upside-down Chinese transform candidates, and no body/page overflow. `tungning` and `qing_taiwan` remain left of Edo Japan. Mobile 390px all-region dark mode keeps the same counts and also has no body overflow, no whiteish blocks, no low-luminance labels, and no transformed labels.
- Seam and screenshot QA finding: Central Asia Golden Horde / Kipchak seam QA confirms seam-marked sides remain transparent before and after hover while the tooltip opens. Screenshots inspected: `/tmp/history_visual_v268_steppe_gojoseon_clean_dark.png`, `/tmp/history_visual_v268_all_1722_dark.png`, `/tmp/history_visual_v268_golden_horde_seams.png`, and `/tmp/history_visual_v268_mobile_all_1722_dark.png`.

## v269 South Asia Harappan Fringe-Cutout Audit Findings
- Fresh local post-v268 audit found no multi-year coverage gaps above the practical threshold, but ranked `indus_fringe` and `late_harappan_fringe` as the top semantic-risk cluster because both still used owner-filled cutouts even though their text described archaeological / contact horizons around Yamuna, Gujarat, and post-urban Harappan successor fields.
- Source finding: Britannica's Indus civilization article supports a mature Harappan horizon around 2600-1900 BCE with extensions toward Ropar, the Gulf of Khambhat, and the Yamuna basin; Britannica's India / Indus page lists Gujarat sites such as Dholavira and Surkotada among major Harappan sites; UNESCO's Dholavira listing describes Dholavira as a southern Harappan center in Gujarat occupied roughly 3000-1500 BCE; Kenoyer's Indus Tradition synthesis frames the late/post-urban phase as regional transformation, changed settlement networks, and overlapping Indo-Gangetic regionalization rather than a clean neighboring-culture land transfer.
- Modeling decision for v269: keep `indus_fringe` and `late_harappan_fringe` as whole adjacent cultural/contact-horizon lanes. Remove `shape`, `notches`, and any cutout-owner wording from the two targets; preserve Harappan-Yamuna, Harappan Gujarat / southern edge, post-urban eastward, and Gujarat-Deccan contact semantics through existing relationship links, territory notes, and details.
- VM audit finding: v269 data has 8 regions, 923 entities, 936 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, and 0 invalid explicit notch owners. `indus_fringe` and `late_harappan_fringe` return `shapePlan: false`, 0 source fill rows, no `缺口承接` / `Cutout Owners`, and positive whole-lane / no-land-bite wording.
- Browser QA finding: South Asia Chinese dark-mode target QA loaded `styles.css?v=269`, `print.css?v=269`, and `app.js?v=269`. Both Harappan fringe targets render with `clip-path: none`, no shape class, and 0 source owner-fill rows. Detail panels show `疆域语义`, omit `缺口承接`, and preserve `哈拉帕-亚穆纳东方边缘`, `哈拉帕古吉拉特 / 南方边缘`, `后城市化东方接触`, and `古吉拉特-德干接触视野`.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 923 blocks / 240 fill pieces / 176 event markers / 936 paths with no white/transparent dark blocks, no low-luminance labels, no upside-down Chinese, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains right of the Qing Beijing core and left of Edo Japan. Golden Horde hover QA confirms same-color seam borders remain transparent before and after hover and the tooltip appears. Screenshots inspected: `/tmp/history_visual_v269_harappan_fringe_dark.png`, `/tmp/history_visual_v269_all_1722_dark.png`, `/tmp/history_visual_v269_golden_horde_seams.png`, and `/tmp/history_visual_v269_mobile_all_1722_dark.png`.

## v270 Swahili Coast / Inland Gold-Trade Cutout Audit Findings
- Fresh local post-v269 semantic audit ranked `swahili_coast` as the highest remaining risk because its text described an Indian Ocean city-state / trade network while its geometry still cut three owner-filled inland bites for `mapungubwe`, `great_zimbabwe`, and `mutapa`.
- Source finding: UNESCO frames Kilwa Kisiwani and Songo Mnara as Swahili trading cities whose prosperity rested on Indian Ocean trade and hinterland gold/ivory exchange; UNESCO's Great Zimbabwe page records long-distance trade through gold, Kilwa coins, and imported Persian/Chinese goods; the Met describes Mapungubwe as an inland city/trading center linked to Kilwa and Indian Ocean ports; the Met's Kilwa essay frames Kilwa as connecting inland gold/ivory regions near Great Zimbabwe with Indian Ocean port cities.
- Modeling decision for v270: keep `swahili_coast`, `mapungubwe`, `great_zimbabwe`, and `mutapa` as adjacent whole lanes. Remove the Swahili Coast land-bite geometry and carry coast-hinterland meaning through existing trade relationships, territory notes, and detail text.
- Implementation finding: `swahili_coast` now has no `shape`, no `notches`, and no explicit cutout owners. Swahili Coast, Mapungubwe, Great Zimbabwe, and Mutapa text now describes adjacent coast / inland records and explicit trade links rather than fill pieces or notches.
- VM audit finding: v270 data has 8 regions, 923 entities, 936 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. `swahili_coast` returns `shapePlan: false`, 0 source fill rows, no `缺口承接` / `Cutout Owners`, positive `不画土地缺口` wording, and the three expected Chinese trade labels.
- Browser QA finding: Africa AD 1400 Chinese dark-mode target QA loaded `styles.css?v=270`, `print.css?v=270`, and `app.js?v=270`. `swahili_coast` renders with `clip-path: none`, no shape class, 0 source owner-fill rows, and detail text that shows `疆域语义` plus `印度洋黄金贸易`, `基尔瓦-大津巴布韦黄金贸易`, and `海岸-内陆黄金贸易`, with no `缺口承接`.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 923 blocks / 237 fill pieces / 176 event markers / 936 paths with no white/transparent dark blocks, no low-luminance labels, no upside-down Chinese, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains right of the Qing Beijing core and left of Edo Japan. Golden Horde hover QA confirms same-color seam borders remain transparent before and after hover and the tooltip appears. Screenshots inspected: `/tmp/history_visual_v270_swahili_coast_dark.png`, `/tmp/history_visual_v270_all_1722_dark.png`, `/tmp/history_visual_v270_mobile_all_1722_dark.png`, and `/tmp/history_visual_v270_golden_horde_seams.png`.

## v271 BMAC / Oxus Steppe-Contact Cutout Audit Findings
- Fresh local post-v270 semantic audit ranked `bmac` high because its text described a Bronze Age oasis / archaeological network while its `shape: 'taper-right'` still generated a steppe-facing land-bite geometry.
- Source finding: the British Museum describes BMAC / Oxus Civilization as the modern archaeological designation for a Bronze Age culture along the upper Amu Darya in present-day Turkmenistan, Afghanistan, southern Uzbekistan, and western Tajikistan, and notes BMAC seals in long-distance trade / production contexts. The Met describes Bactria-Margiana objects as evidence for a highly developed late third / early second millennium BCE western Central Asian civilization with contacts toward Iran.
- Modeling decision for v271: keep `bmac`, `kazakh_bronze`, `mountain_bronze`, and `afghan_prehistoric` as adjacent cultural / regional lanes. Steppe-oasis and Oxus-Afghan contacts should remain relationship/detail semantics, not owner-filled cutout geometry.
- Implementation finding: `bmac` now has no `shape`, no `notches`, and no explicit cutout owners. BMAC and Steppe Cultures text now describes adjacent cultural lanes and exchange links rather than fill pieces or notches.
- VM audit finding: v271 data has 8 regions, 923 entities, 936 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. `bmac` returns `shapePlan: false`, 0 source fill rows, no `缺口承接` / `Cutout Owners`, positive `不画土地缺口` wording, and the expected Oxus-Afghan / mountain-oasis / steppe-oasis labels.
- Browser QA finding: Central Asia 2000 BCE Chinese dark-mode target QA loaded `styles.css?v=271`, `print.css?v=271`, and `app.js?v=271`. `bmac` renders with `clip-path: none`, no shape class, 0 source owner-fill rows, and detail text that shows `疆域语义` plus `奥克苏斯-阿富汗青铜时代联系`, `萨拉兹姆/山地-绿洲交流`, and `草原-绿洲青铜时代联系`, with no `缺口承接`.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 923 blocks / 236 fill pieces / 176 event markers / 936 paths with no white/transparent dark blocks, no low-luminance labels, no upside-down Chinese, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains right of the Qing Beijing core and left of Edo Japan. Golden Horde hover QA confirms same-color seam borders remain transparent before and after hover and the tooltip appears. Screenshots inspected: `/tmp/history_visual_v271_bmac_dark.png`, `/tmp/history_visual_v271_all_1722_dark.png`, `/tmp/history_visual_v271_mobile_all_1722_dark.png`, and `/tmp/history_visual_v271_golden_horde_seams.png`.

## v272 Early East Asia North-South Cultural-Lane Audit Findings
- Fresh local post-v271 semantic audit found 179 shaped/notched records. The highest-risk cluster was early East Asia because `china_neolithic`, `south_neolithic`, `xia`, `shang`, `zhou_west`, and `zhou_east` used cutouts to express cultural coexistence or regional plurality rather than concrete land transfer.
- Source finding: the Met frames Neolithic China as settlement traditions along the Yellow River and Yangzi systems, with distinctive traditions plus communication and cultural exchange. UNESCO's Liangzhu page supports a lower-Yangtze rice-cultivating early regional state. Britannica supports Erlitou / Xia as a Central Plains state-level society, Shang as the first recorded dynasty with documentary and archaeological evidence centered in the North China Plain / Anyang, and Zhou as a Wei / Yellow River royal order that later fragmented into regional states.
- Modeling decision for v272: keep Yellow River / Central Plains and Yangtze lanes visible as whole adjacent records. Remove all target `shape`, `notches`, and `notchOwners`; use the new `黄河-长江新石器并行传统` link plus existing Xia, Shang, Zhou, Chu, and Qin relationships for historical reading.
- Implementation finding: the six target records now have no shape/notch geometry and their text says adjacent whole lanes / no land-bite geometry. `south_neolithic -> china_neolithic` was added as a cultural relationship, while `chu_state`, `qin_chu_conquest`, and later Qin semantics remain separate adjacent records.
- VM audit finding: v272 data has 8 regions, 923 entities, 937 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. All six early East Asia targets return `shapePlan: false`, 0 source fill rows, no `缺口承接` / `Cutout Owners`, and positive `不画土地缺口` wording.
- Browser QA finding: East Asia 2000 BCE Chinese dark-mode target QA loaded v272 assets. `china_neolithic`, `south_neolithic`, `xia`, `shang`, `zhou_west`, and `zhou_east` render with `clip-path: none`, no shape class, 0 source owner-fill rows, and detail text that shows `疆域语义` plus no-land-bite wording. The new `黄河-长江新石器并行传统` link appears for both Neolithic lanes, and `楚在周南方世界崛起` remains visible in Eastern Zhou detail.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 923 blocks / 224 fill pieces / 176 event markers / 937 paths with no white/transparent dark blocks, no low-luminance labels, no upside-down Chinese, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains right of the Qing Beijing core and left of Edo Japan. Golden Horde hover QA confirms same-color seam borders remain transparent before and after hover and the tooltip appears. Screenshots inspected: `/tmp/history_visual_v272_early_eastasia_dark.png`, `/tmp/history_visual_v272_all_1722_dark.png`, `/tmp/history_visual_v272_mobile_all_1722_dark.png`, and `/tmp/history_visual_v272_golden_horde_seams.png`.

## v273 Central Asia Bactria-Steppe Contact-Geometry Audit Findings
- Fresh local post-v272 audit found no multi-year coverage gaps above the practical threshold, but still found 173 shaped/notched records. The top actionable cluster is Central Asia's Bactria-steppe sequence: `greco_bactria`, `greco_bactria_south`, `yuezhi`, `kangju`, `kushan_ca`, `kidarites_steppe`, and `kidarites_south`.
- Current code finding: these seven records generate `shape-taper-*` / explicit fill rows. Examples include Greco-Bactria being filled by Saka/Yuezhi pressure, Yuezhi being filled by Greco-Bactrian South, Kangju being filled by Kidarite Steppe, Kushan Bactria being filled by Kangju, and Kidarite Steppe / Gandhara filling each other's edges. Their own descriptions use migration, route, contact, neighboring pressure, or parallel-fragment language rather than a concrete territorial cession.
- Source finding: Britannica's Bactria article supports Greco-Bactrian rule, Yuezhi challenge and occupation of Bactria, Kushan expansion into northwestern India, and Hephthalite / western Turk transition. Britannica and the Met support Kushan descent from the Yuezhi, Bactria-Gandhara / Afghanistan / northwest India centers, and extensive Silk Road trade. Iranica's Sogdian Trade article frames Yuezhi / Wusun / Kangju as nomadic aristocracies shaping Han-era Central Asian politics and trade. University of Washington Hou Hanshu notes place the Iron Gates as a frontier between Kangju and Yuezhi territory, supporting adjacency/border semantics rather than mutual land-bite ownership.
- Kidarite source finding: the University of Vienna Kidarite catalogue and Iranica Hephthalites article support Kidarite rule at Balkh / Bactria, movement across the Hindu Kush into Gandhara / Peshawar, and later displacement by Hephthalite / Sasanian pressure. This supports adjacent Bactria-Gandhara and steppe/Sogdiana fragments, not reciprocal decorative cutouts between pressure lanes.
- Modeling decision for v273: remove `shape`, `notches`, and `notchOwners` from the seven target records. Keep them as whole adjacent lanes and preserve historical nuance through descriptions, `疆域语义`, achievements, and existing relationship links. Add explicit `No land-bite geometry` / `不画土地缺口` achievements so detail panels communicate why no `Cutout Owners` row is shown.
- Implementation finding: the seven target records now have no `shape`, `notches`, or `notchOwners`. Their text describes adjacent Bactria / Hindu Kush / Syr Darya / steppe / Gandhara lanes, and their detail achievements explicitly include `No land-bite geometry` / `不画土地缺口`. Five relationship links now carry the removed geometric semantics: `巴克特里亚-兴都库什通道成对`, `月氏压力下的希腊-巴克特里亚`, `贵霜-康居草原绿洲边界`, `贵霜通道后的寄多罗犍陀罗`, and `寄多罗巴克特里亚-犍陀罗与草原片段`.
- VM audit finding: v273 data has 8 regions, 923 entities, 942 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing connection endpoints, 0 bad connection types, and 0 invalid explicit notch owners. The shaped/notched record count is now 166. All seven targets return `shapePlan: false`, 0 source fill rows, no `缺口承接` / `Cutout Owners`, and positive no-land-bite wording.
- Browser QA finding: Central Asia Chinese dark-mode target QA loaded `styles.css?v=273`, `print.css?v=273`, and `app.js?v=273`. All seven target blocks render with `clip-path: none`, no shape class, and 0 source owner-fill rows. Detail panels show `疆域语义`, `不画土地缺口`, and the five new relationship labels, with no `缺口承接`.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 923 blocks / 216 fill pieces / 176 event markers / 942 paths with no white/transparent dark blocks, no low-luminance labels, no upside-down Chinese, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains right of the Qing Beijing core and left of Edo Japan. Golden Horde hover QA confirms same-color seam borders remain transparent before and after hover and the tooltip appears. Screenshots inspected: `/tmp/history_visual_v273_centralasia_dark.png`, `/tmp/history_visual_v273_all_1722_dark.png`, `/tmp/history_visual_v273_mobile_all_1722_dark.png`, and `/tmp/history_visual_v273_golden_horde_seams.png`.

## v274 Visual Seam / Dark Mode / Taiwan Gap / Micro-Label Audit Findings
- User-review finding: the same-color rule should hide shared borders only; it must not imply that two adjacent blocks are one polity. v274 keeps records separate and changes the grouping key to actual rendered background color, so Golden Horde-style same-color fill pieces hide seams while hover/focus/click/detail targets remain separate.
- Dark-mode finding: the previous dark-mode fills still read too pale in the full AD 1722 view. v274 lowers the source-color mix and saturation mix in `darkTint()`, uses a darker base, and keeps label text light; browser QA found no white/transparent dark blocks and no low-contrast sampled labels.
- Blank-block finding: the VM coverage audit found 0 multi-year ownerless unit-slot gaps across all regions. The remaining "blank" cases were visual readability cases: suppressed labels on narrow blocks and a few very short micro blocks. v274 adds safe mini labels for fitting suppressed-label blocks and internal hairline markers for blocks too small to label without overflow.
- Taiwan-placement finding: Ming Zheng / Tungning remains raw Taiwan `slot 8`; no Beijing/core mainland data placement or `qing_beijing -> tungning` owner fill was introduced. The East Asia guide now widens the render-only strait gap after the China core, producing about 40.3px from Qing China to Tungning and about 112px from Tungning to Edo Japan in the all-region AD 1722 view.
- Verification finding: v274 desktop Chinese AD 1722 dark-mode QA loaded `styles.css?v=274`, `print.css?v=274`, and `app.js?v=274`, rendering 923 blocks / 216 fill pieces / 176 event markers / 942 paths with no upside-down Chinese, no body overflow, and no dark-mode pale/transparent block failures. Golden Horde seam sides stayed transparent before and after hover while tooltip behavior remained available.

## v275 South Asia Deccan / Tamilakam Land-Bite Audit Findings
- Fresh post-v274 semantic audit found 923 entities, 942 relationships, 166 shaped/notched records, and no major coverage gaps. The top actionable risk was the early South Asia Deccan / Tamilakam sequence, where `satavahana` and `sangam_early` especially made trade/frontier adjacency look like reciprocal land-bite ownership.
- Source finding: Britannica's Satavahana overview supports Deccan rule followed by Ikshvaku, Pallava, Vakataka, and other successor fields; National Geographic's Tamilakam overview supports distinct Chera-Chola-Pandya southern polities; Ashokan edict translations list Cholas, Pandyas, Satiyaputras, and Keralaputras outside Mauryan rule. The combined reading supports adjacent half-lanes plus relationships, not geometric owner fills.
- Modeling decision for v275: keep `maurya_deccan`, `deccan_post_maurya`, `satavahana`, and `post_satavahana_deccan` in the Deccan half-lane, and keep `sangam_early` as the whole Tamilakam half-lane. Replace false cutout semantics with relationships for Mauryan frontier contact, early Deccan-Tamilakam interface, Satavahana-Tamilakam trade, and post-Satavahana adjacency.
- Implementation finding: all five target records now have no `shape`, no `notches`, no `notchOwners`, and descriptions/details/territory notes explicitly say adjacent whole half-lanes or no land-bite geometry. Four new relationship labels carry the removed visual semantics: `孔雀德干-泰米尔地边疆`, `早期德干-泰米尔地接触`, `百乘-泰米尔地贸易边疆`, and `后百乘德干并列泰米尔地`.
- VM audit finding: v275 data has 8 regions, 923 entities, 946 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 162. The five target records return `shapePlan: false`, 0 source fill rows, no `缺口承接` / `Cutout Owners`, positive no-land-bite wording, and no South Asia -322 to 275 Deccan/Tamilakam half-lane coverage gaps.
- Browser QA finding: South Asia Chinese dark-mode target QA loaded `styles.css?v=275`, `print.css?v=275`, and `app.js?v=275`. All five targets render with `clip-path: none`, no shape class, 0 source `territory-fill-piece` rows, `疆域语义` in details, no `缺口承接`, and the expected relationship labels.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 923 blocks / 210 fill pieces / 176 event markers / 946 paths with no pale or transparent dark blocks, no low-light labels, no upside-down Chinese transforms, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains raw `slot 8`, render `layoutSlot 5.72`, 40.3px right of Qing China and 112px left of Edo Japan. Golden Horde hover QA confirms same-color seam borders remain transparent before and after hover and the tooltip appears. Screenshots inspected: `/tmp/history_visual_v275_southasia_dark.png`, `/tmp/history_visual_v275_all_1722_dark.png`, `/tmp/history_visual_v275_golden_horde_seams.png`, and `/tmp/history_visual_v275_mobile_all_1722_dark.png`.

## v276 Ottoman Hejaz / Arabian Interior Land-Bite Audit Findings
- Fresh post-v275 semantic audit found the Middle East still had a high concentration of false cutout risk. `ottoman_hejaz` used a right taper and explicit owners for adjacent Arabian / early Saudi records, while those adjacent records used left tapers; visually this made suzerainty, autonomy, challenge, and conflict read as territorial cutouts.
- Source finding: Britannica's Ottoman Arabia account supports Ottoman overlordship in the Hejaz through the Sharif of Mecca after 1517 rather than direct rule over all Arabia; Britannica's Saudi history supports the 1824 Riyadh restoration and nominal Ottoman suzerainty; Britannica's Ibn Saud biography supports the Hejaz conquest, separate Hejaz-Najd administration, and 1932 unification. This supports adjacent holy-cities and Najd / interior half-lanes with relationship links.
- Modeling decision for v276: keep `ottoman_hejaz` and `hashemite_hejaz` as holy-cities half-lanes and keep `arabia_interior`, `first_saudi_state`, `post_diriyah_najd`, `second_saudi_state`, `rashidi_arabia`, and `saudi_unification` as Najd / interior half-lanes. Replace false cutout semantics with relationships for Ottoman-Hejaz adjacency, Saudi-Wahhabi challenge, Egyptian-Ottoman pressure, nominal suzerainty, Rashidi alignment, and Saudi-Hashemite conflict.
- Implementation finding: all eight target records now have no `shape`, no `notches`, no `notchOwners`, and descriptions/details/territory notes explicitly say adjacent half-lane or no land-bite geometry. Six new relationship labels carry the removed visual semantics: `奥斯曼汉志并列阿拉伯内陆`, `沙特-瓦哈比挑战圣城`, `埃及-奥斯曼压力并列纳季德`, `名义奥斯曼宗主权与纳季德自治`, `拉希德-奥斯曼结盟`, and `沙特-哈希姆汉志战争`.
- VM audit finding: v276 data has 8 regions, 923 entities, 952 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 154. The eight target records return `shapePlan: false`, 0 source fill rows, no `缺口承接` / `Cutout Owners`, and positive no-land-bite wording.
- Browser QA finding: Middle East Chinese dark-mode target QA loaded `styles.css?v=276`, `print.css?v=276`, and `app.js?v=276`. All eight target blocks render with `clip-path: none`, no shape class, 0 source `territory-fill-piece` rows, dark muted fills, and light labels. Detail panels show `疆域语义`, `不画土地缺口`, the six new relationship labels across the target details, and no `缺口承接` / `Cutout Owners`.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 923 blocks / 198 fill pieces / 176 event markers / 952 connection paths with no pale or transparent dark blocks, no low-light labels, no upside-down Chinese transforms, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains raw island-lane data, render `layoutSlot 5.72`, 96.3px right of Qing Beijing core and 112px left of Edo Japan. Golden Horde hover QA confirms same-color seam borders remain transparent before and after hover and the tooltip appears. Screenshots inspected: `/tmp/history_visual_v276_middleeast_hejaz_dark.png`, `/tmp/history_visual_v276_all_1722_dark.png`, `/tmp/history_visual_v276_mobile_all_1722_dark.png`, and `/tmp/history_visual_v276_golden_horde_seams.png`.

## v277 Early Crusader / Muslim Syria Land-Bite Audit Findings
- Fresh post-v276 semantic audit found 923 entities, 952 relationships, and 154 shaped/notched records. `syria_muslim_polities` / `crusader_states` ranked as an actionable false-cutout case: their text said Zangid / atabeg Syrian field and Latin Crusader fragment coexisted, but reciprocal tapers made the frontier read as two blocks carving ownership bites out of each other.
- Source finding: Britannica's Kingdom of Jerusalem article places the Latin kingdom in Palestine, southern Lebanon, southwestern Jordan, with related Crusader states as neighboring vassals rather than a single all-Syria state. Britannica's Nur al-Din article supports Aleppo / Damascus / Syrian Muslim reorganization and campaigns against Crusader Edessa and Antioch. Britannica's Third Crusade and Saladin articles support 1187 Hattin / Jerusalem as the decisive transition, followed by reduced Crusader holdings.
- Modeling decision for v277: keep `syria_muslim_polities` and `crusader_states` as adjacent whole half-lanes. Replace reciprocal cutout semantics with relationship/detail text for the Zangid-Crusader frontier after Edessa, Saladin's Hattin victory, and the later reduced coastal Crusader lane.
- Implementation finding: both target records now have no `shape`, no `notches`, and no `notchOwners`; descriptions/details/territory notes explicitly say adjacent whole half-lanes or no land-bite geometry. The new relationship label `埃德萨之后的赞吉-十字军边疆` carries the removed visual frontier semantics.
- VM audit finding: v277 data has 8 regions, 923 entities, 953 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 152. Both target records return `shapePlan: false`, 0 source fill rows, no `缺口承接` / `Cutout Owners`, and positive no-land-bite wording.
- Browser target QA finding: Middle East AD 1144 Chinese dark-mode QA loaded v277 assets and rendered `syria_muslim_polities` / `crusader_states` with `clip-path: none`, no shape class, 0 source `territory-fill-piece` rows, light text on dark muted fills, and detail panels showing `疆域语义` / `不画土地缺口` without `缺口承接`. Relationship labels include `埃德萨之后的赞吉-十字军边疆` and the later `哈丁战役：阿尤布收复耶路撒冷`.
- Browser regression QA finding: all-region AD 1722 dark-mode desktop and mobile rendered 923 blocks / 196 fill pieces / 176 event markers / 953 relationship paths with no pale dark blocks, no low-light labels, no upside-down Chinese, and no horizontal overflow. The render-only Taiwan guide still places Ming Zheng / Qing Taiwan at layout slot 5.72 between Qing Beijing core and Edo Japan. Golden Horde same-color seam QA kept the internal borders transparent before and after hover while preserving separate hover/detail behavior.

## v278 Achaemenid Sogdiana / Saka Frontier-Cutout Audit Findings
- Fresh post-v277 semantic audit found 923 entities, 953 relationships, and 152 shaped/notched records. `persian_ca` ranked as the top actionable false-cutout case: its description already said Achaemenid administration met Saka / nomadic frontiers, but `shape: 'taper-right'` made the Saka steppe look like it owned a bite of the Achaemenid Sogdiana lane.
- Source finding: Encyclopaedia Iranica's Sogdiana article places Achaemenid Sogdiana as a distant frontier province reaching toward the Syr Darya and notes constant contact between sedentary Sogdiana and steppe nomads. The University of Washington Saka essay notes Sakas in Old Persian inscriptions and places pointed-cap Sakas between the Caspian and Jaxartes / Syr Darya. The Bibliographia Iranica summary of Ferrario 2023 frames the northeastern Achaemenid borderlands as negotiated steppe frontier interactions, not a clean land-transfer bite.
- Modeling decision for v278: keep `persian_ca` as a whole Sogdiana / Margiana / Transoxiana-facing oasis-satrapal frontier lane beside `scythians`. Preserve the existing `阿契美尼德-塞人边疆` conflict relationship and frontier wording, but remove Saka-as-cutout-owner geometry.
- Implementation finding: `persian_ca` now has no `shape`, `notches`, or `notchOwners`. Its description, detail achievements, and territory notes say whole frontier-oasis lane / no land-bite geometry; `scythians` detail text now says it is not an oasis cutout owner.
- VM audit finding: current data has 8 regions, 923 entities, 953 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 151. `persian_ca` and `scythians` both return `shapePlan: false`, 0 source fill rows, no owner-fill rows, and positive no-land-bite / not-cutout-owner wording.
- Browser target QA finding: Central Asia 550 BCE Chinese dark-mode QA loaded `styles.css?v=279`, `print.css?v=279`, and `app.js?v=279`. `persian_ca` renders with `clip-path: none`, no shape class, dark muted fill, light text, and 0 source `territory-fill-piece` rows. The detail panel shows `疆域语义` / `不画土地缺口`, no `缺口承接`, and preserves `阿契美尼德-塞人边疆`, `阿契美尼德中亚总督区`, and `亚历山大后希腊化巴克特里亚`.

## v279 Dark Legend Polish Findings
- Browser screenshot inspection during v278 QA showed the expanded lower-right legend could read as a pale gray slab in dark mode because the panel was translucent over dense timeline/footer content. Computed styles were technically dark, but the perceived result was not harmonious enough for the dark theme.
- Implementation finding: `body.dark-mode .legend` is now opaque dark with a stronger dark shadow; `.legend-content`, `.legend-item`, `.category-item`, `.legend-more`, `.legend-group-title`, and `.category-legend` have explicit dark-mode text/divider colors.
- Browser regression QA finding: desktop and mobile dark-mode legend checks loaded v279 assets and found collapsed and expanded legend backgrounds at `rgb(16, 18, 19)`, light legend item text, and no background-color transition. All-region AD 1722 desktop/mobile rendered 923 blocks / 195 fill pieces / 176 event markers / 953 paths with no pale dark blocks, no low-light labels, no upside-down Chinese, and no body horizontal overflow. Tungning remains at layout slot 5.72 between Qing Beijing core and Edo Japan. Golden Horde same-color seam QA kept seam-side borders transparent before and after hover while preserving tooltip/detail behavior. Screenshots inspected: `/tmp/history_visual_v279_persian_saka_dark.png`, `/tmp/history_visual_v279_legend_expanded_dark_final.png`, `/tmp/history_visual_v279_mobile_legend_dark_final.png`, and `/tmp/history_visual_v279_golden_horde_seams.png`.

## v280 Funan / Thai Basin Frontier-Cutout Findings
- Fresh code finding: `funan` still used `shape: 'taper-right'` and `notchOwners: { right: ['thai_prehistoric'] }`, even though its text already framed Funan as a lower-Mekong core with wider trade / influence. This made Thai Basin Cultures look like a concrete owner of a missing bite of Funan land.
- Source finding: Britannica places Funan as an early state in Cambodia with India / China trade and reach into what are now Vietnam, Thailand, and Cambodia. UNESCO treats Ban Chiang in northeast Thailand as a major prehistoric settlement with early farming and metal use, while the Met frames Mon-Dvaravati central Thailand as a later, distinct seventh-to-ninth-century cultural / political field. The combined reading supports adjacent lanes and contact labels, not a Thai-owned cutout inside Funan.
- Modeling decision for v280: keep `funan` as a whole lower-Mekong / southern Cambodian core lane beside `thai_prehistoric`. Carry Funan's Thai-basin contact and influence through detail wording and relationship labels such as `扶南湄公河-海贸网络`, not `缺口承接`.
- Implementation finding: `funan` now has no `shape`, `notches`, or `notchOwners`. `funan` and `thai_prehistoric` descriptions/details/territory notes explicitly say no land-bite geometry and not a Funan cutout owner. Active assets now load `styles.css?v=280`, `print.css?v=280`, and `app.js?v=280`.
- VM audit finding: v280 data has 8 regions, 923 entities, 953 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 150. `funan` and `thai_prehistoric` both return `shapePlan: false`, 0 source fill rows, no owner fill rows, no `缺口承接` / `Cutout Owners`, and positive no-land-bite / not-cutout-owner wording.
- Browser target QA finding: Southeast Asia AD 200 Chinese dark-mode QA loaded v280 assets. `funan` and `thai_prehistoric` render with `clip-path: none`, no shape class, dark muted fills, light labels, and 0 source `territory-fill-piece` rows. The Funan detail panel shows `疆域语义`, `不画土地缺口`, `扶南湄公河-海贸网络`, and `真腊承接扶南`, with no `缺口承接`.
- Browser regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 923 blocks / 194 fill pieces / 176 event markers / 953 relationship paths with no pale dark blocks, no low-light labels, no upside-down Chinese, and no horizontal overflow. Tungning / Ming Zheng Taiwan remains raw island-lane data at render layout slot 5.72, between Qing Beijing core and Edo Japan. Golden Horde same-color seam QA kept seam-side borders transparent before and after hover while preserving the tooltip/detail target. Screenshots inspected: `/tmp/history_visual_v280_funan_thai_dark.png`, `/tmp/history_visual_v280_all_1722_dark.png`, `/tmp/history_visual_v280_mobile_all_1722_dark.png`, and `/tmp/history_visual_v280_golden_horde_seams.png`.

## v281 Southern Africa Frontier-Strip / False-Fill Findings
- Fresh post-v280 audit finding: `mutapa`, `southern_fragmented`, and `zulu` still used explicit `notches` owned by `cape_boer_colonies`. This made Cape / Boer / British frontier pressure read as an owner-filled bite inside Mutapa, Southern Kingdoms, and Zulu land, matching the user's concern about strange fills.
- Source finding: Britannica places the Mwene Matapa / Mutapa domain between the Zambezi and Limpopo in present Zimbabwe and Mozambique; Britannica places the first European settlement in southern Africa at Table Bay in 1652; Britannica's Zululand entry supports a southeastern / Zululand context and later British / Boer penetration. Britannica's Southern Africa / Nguni / Sotho material supports a broader inhabited southern interior rather than a blank strip before the Cape frontier.
- Modeling decision for v281: keep Mutapa, Southern Kingdoms, and Zulu as whole adjacent main-lane records. Keep Cape / Boer / British Frontier as a separate narrow frontier strip starting in 1652. Add `southern_interior_cultures` from 1450 to 1652 to keep the neighboring southern-interior strip inhabited before the Cape colonial frontier begins, without making it a cutout owner.
- Implementation finding: removed the `cape_boer_colonies` owner notches from `mutapa`, `southern_fragmented`, and `zulu`; narrowed those records to the main southern Africa lane; added `southern_interior_cultures` with details, center metadata, wiki mappings, and two relationship links; rewrote bilingual descriptions/details/territory notes away from `Cutout Owners`; and bumped active assets to `v281`.
- VM audit finding: v281 data has 8 regions, 924 entities, 955 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 147 with 191 owner-fill pieces. `mutapa`, `southern_interior_cultures`, `southern_fragmented`, `cape_boer_colonies`, and `zulu` all return `shapePlan: false`, 0 source fill rows, 0 detail fill rows, and no target overlap at AD 1500 / 1700 / 1800 / 1850.
- Browser QA finding: Africa AD 1700 and AD 1800 Chinese dark-mode QA loaded v281 assets. The southern Africa target records render as adjacent rectangular lanes with `clip-path: none`, no source or owner `territory-fill-piece` rows, and the Mutapa detail panel shows `疆域语义`, `不画开普土地缺口`, `南部内陆文化`, and `高原以南的开普边疆`, with no `缺口承接`.
- Browser regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 924 blocks / 191 fill pieces / 176 event markers / 955 relationship paths with no pale dark blocks, no low-light labels, no upside-down Chinese, and no horizontal overflow. Tungning / Ming Zheng Taiwan remains between the Qing Beijing core and Edo Japan, and Golden Horde same-color seam QA kept seam-side borders transparent before and after hover while preserving the tooltip/detail target. Screenshots inspected: `/tmp/history_visual_v281_all_1722_dark.png`, `/tmp/history_visual_v281_africa_1700_dark.png`, `/tmp/history_visual_v281_africa_1800_dark.png`, and `/tmp/history_visual_v281_golden_horde_dark.png`.

## v282 Fergana / Kokand Afghan-Route False-Fill Findings
- Fresh post-v281 audit finding: `fergana_begliks` and `kokand` still used full-height right-edge notches owned by Mughal / Hotak / Afsharid / Durrani / Barakzai Afghan phases. This made the Fergana Valley / Kokand lane look as if Afghan-route powers owned a vertical bite of Fergana, even though the intended meaning was adjacent mountain-route contact.
- Source finding: Britannica places Kokand in the western Fergana Valley and describes the Khanate of Kokand as centered on the Fergana Valley; Britannica's Fergana Valley article places Kokand rule in the valley until Russian conquest in 1876. Britannica places Ahmad Shah Durrani's 1747 coronation and capital near Kandahar, while Britannica / Iranica material places Mir Wais Hotak's 1709 revolt and independent kingdom at Kandahar. This supports adjacent Fergana and Afghan-route lanes, not Afghan ownership of a Fergana cutout.
- Modeling decision for v282: keep `fergana_begliks` and `kokand` as whole slot-3 Fergana records. Keep `mughal_afghan`, `hotak_afghanistan`, `afsharid_afghan`, `durrani`, and `afghanistan_early` as the neighboring slot-4 Afghan-route chain. Replace cutout semantics with relationship links for Fergana-Kabul mountain routes, Kokand beside the Afghan route, and the Great Game Fergana-Afghan corridor.
- Implementation finding: removed the target notches, rewrote bilingual descriptions/details/territory notes to say adjacent lane / no Afghan cutout owner, added three frontier relationships, updated preservation notes so future passes do not restore Afghan phases as Kokand `Cutout Owners`, and bumped active assets to `v282`.
- VM audit finding: v282 data has 8 regions, 924 entities, 958 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 145 with 186 owner-fill pieces. `fergana_begliks`, `kokand`, `mughal_afghan`, `hotak_afghanistan`, `afsharid_afghan`, `durrani`, and `afghanistan_early` all have no raw geometry, no shape plan, and 0 source fill pieces.
- Key-year geometry finding: Central Asia snapshots at AD 1507, 1600, 1710, 1722, 1740, 1750, 1800, 1830, 1875, and 1876 show Fergana / Kokand / Russian Fergana in slot 3 and the Afghan-route phases in slot 4 with no target overlap. Removing the notches therefore did not create a blank or collision in the Fergana-Afghan adjacency.
- Browser QA finding: Central Asia AD 1722 and AD 1800 Chinese dark-mode QA loaded v282 assets. `fergana_begliks`, `kokand`, and the Afghan-route targets render with `clip-path: none`, 0 source `territory-fill-piece` rows, and no detail `缺口承接`. The Fergana detail shows `费尔干纳-喀布尔山地通道`; the Kokand detail shows `浩罕旁的阿富汗通道` / `大博弈中的费尔干纳-阿富汗通道`.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 924 blocks / 186 fill pieces / 176 event markers / 958 relationship paths with no pale dark blocks, no low-light labels, no upside-down Chinese, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains raw slot 8 and renders between Qing Beijing core and Edo Japan. Golden Horde same-color seam sides stayed transparent before and after hover while the tooltip appeared. Screenshots inspected: `/tmp/history_visual_v282_all_1722_dark.png`, `/tmp/history_visual_v282_centralasia_1722_dark.png`, `/tmp/history_visual_v282_centralasia_1800_dark.png`, `/tmp/history_visual_v282_golden_horde_dark.png`, and `/tmp/history_visual_v282_mobile_all_1722_dark.png`.

## v283 Early Sogdiana / Steppe False-Fill Findings
- Fresh post-v282 audit finding: `sogdiana_early` still used a right taper with `kazakh_bronze` and `scythians` as notch owners. This made late Bronze steppe and Saka / Scythian neighbors look like they filled a missing piece of the early Sogdian oasis corridor, even though the intended meaning was adjacent steppe-oasis contact.
- Source finding: British Museum describes Sogdia's oasis centers around the Zarafshan and Kashka-Darya valleys and notes that principalities such as Bukhara, Kesh, and Samarkand were not politically united. Smithsonian places Sogdiana in present Uzbekistan / Tajikistan as a patchwork of oasis towns and small principalities with fortified towns against steppe nomads. Encyclopaedia Iranica locates Sogdian geography in the Zarafshan and Kaška Daryā basins. This supports a whole oasis-corridor lane beside steppe neighbors, not steppe-owned cutout geometry.
- Modeling decision for v283: keep `sogdiana_early` as a whole slot-0/1 oasis-corridor record. Keep `kazakh_bronze` and `scythians` as adjacent steppe records in slot 2. Replace cutout semantics with relationship links for early Sogdiana-steppe contact and the Saka steppe frontier.
- Implementation finding: removed `shape` and `notchOwners` from `sogdiana_early`, added `category: 'culture'`, rewrote bilingual descriptions/details/territory notes to say whole oasis lane and no steppe cutout owner, added `早期粟特-草原绿洲接触` and `早期粟特-塞人草原边界`, updated preservation notes, and bumped active assets to `v283`.
- Wording polish finding: v284 keeps the v283 geometry and links but replaces user-facing "缺口主人" style phrasing in Early Sogdiana / Steppe Cultures / Scythians details with adjacency / no-land-bite language.
- VM audit finding: v284 data has 8 regions, 924 entities, 960 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 144 with 184 owner-fill pieces. `sogdiana_early`, `kazakh_bronze`, and `scythians` all have no raw shape / notches / notchOwners, no shape plan, 0 source fill rows, and no target detail `缺口承接` / `缺口主人` / `Cutout Owners`.
- Key-year geometry finding: Central Asia snapshots at 1500 BCE, 1000 BCE, and 900 BCE show `sogdiana_early` as slot 0-2 and `kazakh_bronze` / `scythians` as slot 2-3 with a 0-slot adjacency gap and no overlap. At 550/549 BCE the Achaemenid lane succeeds it cleanly beside the Scythian/Saka lane.
- Browser QA finding: Central Asia 900 BCE Chinese dark-mode target QA loaded `styles.css?v=284`, `print.css?v=284`, and `app.js?v=284`. `sogdiana_early`, `kazakh_bronze`, and `scythians` render with `clip-path: none`, no shape class, 0 source `territory-fill-piece` rows, and detail panels showing `疆域语义` plus `早期粟特-草原绿洲接触` / `早期粟特-塞人草原边界` where relevant, with no `缺口承接`, `缺口主人`, or `Cutout Owners`.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 924 blocks / 184 fill pieces / 176 event markers / 960 relationship paths with no pale dark blocks, no low-light labels, no upside-down Chinese, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains raw slot 8 and renders between Qing Beijing core and Edo Japan. Golden Horde same-color seam sides stayed transparent before and after hover while the tooltip appeared. Screenshots inspected: `/tmp/history_visual_v284_centralasia_900bce_dark.png`, `/tmp/history_visual_v284_all_1722_dark.png`, `/tmp/history_visual_v284_mobile_all_1722_dark.png`, and `/tmp/history_visual_v284_golden_horde_dark.png`.

## v285 Mughal Nominal / Company Bengal False-Fill Findings
- Fresh post-v284 audit finding: `mughal_rump` still had a full-height right-edge notch owned by `british_bengal`, but the records were not adjacent in the South Asia lane order. Visually this made Company Bengal look like it filled a missing piece of the Delhi-centered Mughal titular court, even though Maratha / Company South lanes sit between the two.
- Source finding: Britannica's Plassey and Shah Alam II entries support the East India Company turning Bengal into a territorial / revenue power after Plassey and the 1765 Diwani grant from Shah Alam II. Britannica's Mughal and Bahadur Shah II entries support the later Mughal court as much reduced, titular, and Delhi-centered; the National Army Museum notes that after 1857 the East India Company was abolished, Crown rule began, and the Mughal dynasty ended.
- Modeling decision for v285: keep `mughal_rump` as a whole Delhi-centered titular lane and keep `british_bengal` as a separate Company territorial lane. Carry Plassey, the 1765 Diwani grant, and 1858 abolition through relationship links and detail text, not a Bengal-filled Mughal cutout.
- Implementation finding: removed the `mughal_rump` `notches` array, rewrote British Bengal and Mughal nominal descriptions/details/territory notes away from cutout wording, and added `british_bengal -> mughal_rump` at AD 1765 with the label `沙阿拉姆二世授予公司迪瓦尼`.
- VM audit finding: v285 data has 8 regions, 924 entities, 961 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 143 with 183 owner-fill pieces. South Asia snapshots at AD 1757, 1765, 1800, 1830, 1857, and 1858 show no overlaps; `mughal_rump` has no raw notch geometry, no shape plan, and 0 source fill rows.
- Browser QA finding: South Asia AD 1765 Chinese dark-mode QA loaded `styles.css?v=285`, `print.css?v=285`, and `app.js?v=285`. `mughal_rump` and `british_bengal` both render with `clip-path: none`; `mughal_rump` has 0 source fill rows and no detail `缺口承接`. The new Diwani relationship is present in runtime data.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 924 blocks / 183 fill pieces / 176 event markers / 961 relationship paths with no pale dark blocks, no low-light labels, no upside-down Chinese, and no body horizontal overflow. Tungning / Ming Zheng Taiwan remains between Qing Beijing core and Edo Japan. Golden Horde same-color seams stay visually hidden while hover still shows separate owner-fill tooltip text. Screenshots inspected: `/tmp/history_visual_v285_southasia_1765_dark.png`, `/tmp/history_visual_v285_all_1722_dark.png`, `/tmp/history_visual_v285_mobile_all_1722_dark.png`, and `/tmp/history_visual_v285_golden_horde_dark.png`.

## v286 Central Asia Khanate Steppe/Valley False-Fill Findings
- Fresh post-v285 semantic-risk audit finding: `kazakh_khanate`, `khiva`, and `russian_kazakh` still used right-edge notches owned by adjacent valley / steppe records. This made Fergana / Kokand, Kazakh steppe power, and Russian steppe administration look like literal owners of missing bites inside neighboring khanate blocks.
- Source finding: Britannica places the Kazakh Khanate across the steppe east of the Caspian and north of the Aral, then describes Russian suppression of the three horde autonomies by the mid-19th century. Britannica places Khiva / Khorezm around the lower Amu Darya and notes the 1873 Russian protectorate. Britannica places Kokand in the western Fergana Valley and describes the Khanate of Kokand as Fergana-centered until Russian annexation in 1876. Oxford Research Encyclopedia likewise frames Khiva / Khorezm as a lower-Amu-Darya oasis society with major northern trade, not a steppe cutout.
- Modeling decision for v286: keep `kazakh_khanate`, `khiva`, and `russian_kazakh` as whole adjacent lanes. Carry steppe-oasis, steppe-valley, and Russian frontier adjacency through explicit `frontier` relationships and `疆域语义` text, not `Cutout Owners`.
- Implementation finding: removed the target `notches`, rewrote bilingual descriptions/details/territory notes away from filled-cut wording, added `希瓦-哈萨克草原边疆`, `费尔干纳并列哈萨克草原`, `浩罕-哈萨克草原边疆`, and `俄属草原毗邻浩罕` relationship links, and bumped active assets to `v286`.
- VM audit finding: v286 data has 8 regions, 924 entities, 965 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 140 with 178 owner-fill pieces. `kazakh_khanate`, `khiva`, and `russian_kazakh` have no raw geometry, no shape plan, and 0 source fill rows.
- Key-year geometry finding: Central Asia snapshots at AD 1507, 1511, 1600, 1710, 1722, 1847, 1873, 1876, and 1920 show the target steppe / oasis / valley records in separate slots with no overlaps.
- Browser QA finding: Central Asia AD 1722 Chinese dark-mode QA loaded `styles.css?v=286`, `print.css?v=286`, and `app.js?v=286`. The three targets render with `clip-path: none`, 0 source `territory-fill-piece` rows, light labels on dark muted fills, `疆域语义` in details, the new frontier labels, and no `缺口承接`.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 924 blocks / 178 fill pieces / 176 event markers / 965 relationship paths with no pale dark blocks, no low-light labels, no upside-down Chinese, no blank/transparent fill pieces, and no body horizontal overflow. Tungning / Qing Taiwan remains between Qing Beijing core and Edo Japan. Golden Horde same-color seam sides remain transparent before and after hover while the tooltip appears. Screenshots inspected: `/tmp/history_visual_v286_centralasia_khanates_dark.png`, `/tmp/history_visual_v286_all_1722_dark.png`, `/tmp/history_visual_v286_mobile_all_1722_dark.png`, and `/tmp/history_visual_v286_golden_horde_dark.png`.

## v287 Sudan Nile / Darfur False-Fill and Frontier-Line Findings
- Fresh post-v286 semantic-risk audit finding: `funj`, `darfur_sultanate`, and `sudan_egyptian_nile` still used reciprocal notches. This made Sennar / Funj, Darfur, and Turco-Egyptian Nile Sudan look like each owned carved pieces of the other, when the intended model is adjacent Nile / western Sudan lanes plus frontier and incorporation relationships.
- Source finding: Britannica places Funj / Sennar as a Nile / Blue Nile power whose authority reached toward Kordofan; Britannica's Kordofan entry notes both Funj Sennar and Darfur claimed Kordofan in the 18th century without durable control; Britannica's Egyptian-Ottoman Sudan account supports Muhammad Ali's 1820-1821 conquest of Sennar / the Nilotic Sudan; Britannica's Darfur entry supports Darfur coming under Egyptian rule in the 1870s. These sources support adjacent-lane and frontier semantics before the 1874 incorporation, not reciprocal owner-filled edge bites.
- Modeling decision for v287: keep `funj` and `sudan_egyptian_nile` as the Nile / Sennar corridor lane and keep `darfur_sultanate` as the adjacent western Sudan / Darfur lane until 1874. Carry Kordofan / Darfur pressure and Nile-Darfur adjacency through `frontier` relationships and detail text, then use the existing 1874 conquest / succession links for incorporation.
- Implementation finding: removed all target notches from `funj`, `darfur_sultanate`, and `sudan_egyptian_nile`; rewrote bilingual descriptions/details/territory notes away from owner-fill wording; added `达尔富尔-森纳尔科尔多凡边疆` and `尼罗河苏丹毗邻达尔富尔`; added explicit `frontier` line weights and SVG styles so frontier links no longer fall back to cultural-line rendering; and bumped active assets to `v287`.
- VM audit finding: v287 data has 8 regions, 924 entities, 967 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. The shaped/notched record count dropped to 137 with 174 owner-fill pieces. `funj`, `darfur_sultanate`, and `sudan_egyptian_nile` now have no raw notches, no shape plan, and 0 source fill rows.
- Browser QA finding: Africa AD 1850 Chinese dark-mode QA loaded `styles.css?v=287`, `print.css?v=287`, and `app.js?v=287`. The three targets render with `clip-path: none`, 0 target `territory-fill-piece` rows, very dark muted fills, light labels, and detail text that says adjacent whole lanes / no owner-filled cutouts.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages render 924 blocks / 174 fill pieces / 176 event markers / 967 relationship paths with no pale dark blocks, no low-light labels, no upside-down Chinese, no transparent blocks/fill pieces, and no body horizontal overflow. Ming Zheng / Qing Taiwan remains between Qing China and Edo Japan; Golden Horde same-color seam sides stay transparent before and after hover while preserving separate hover/detail behavior. Screenshots inspected: `/tmp/history_visual_v287_africa_sudan_dark.png`, `/tmp/history_visual_v287_all_1722_dark.png`, `/tmp/history_visual_v287_mobile_all_1722_dark.png`, and `/tmp/history_visual_v287_golden_horde_hover_dark.png`.

## v288 Seam / Taiwan Strait / West Sahel False-Fill Findings
- Fresh implementation finding: runtime DOM still wrote `data-seam-group` and the old `getSamePolitySeamGroup()` helper remained in source even though the current intended rule is same rendered color = hidden border only. v288 removes that legacy runtime path so same-color seam classes are no longer tied to a same-polity naming concept.
- Taiwan placement finding: `tungning` / Ming Zheng Taiwan remains raw Taiwan `slot 8`; the East Asia render layout places Qing North China Core at layout slot 3, Qing South Coast Campaigns at 4.5, Ming Zheng / Qing Taiwan at 5.72, Joseon at 7.72, and Edo Japan at 8.72. No `qing_beijing -> tungning` owner fill exists. The labels now say `清华北核心` and `清南`, and territory notes explicitly frame Taiwan through the Taiwan Strait / south-coast campaign lane, not a Beijing-core cutout.
- West Sahel finding: `arma_timbuktu`, `bambara_states`, `songhai_dendi`, `sokoto`, `toucouleur_empire`, `french_west`, `british_northern_nigeria`, `sahel_modern`, and `nigeria_north_modern` had been a high-risk false-fill cluster. v288 removes their raw notches and replaces the lost visual bite semantics with frontier relationships such as `登迪并列阿尔马廷巴克图`, `班巴拉-登迪尼日尔边疆`, `索科托毗邻西部萨赫勒诸国`, and `法英萨赫勒边界`.
- Category audit finding: a sidecar data-integrity pass found 27 entities with missing `category` fields, which could weaken category filtering and legend consistency. v288 fills those obvious categories without changing any time span, slot, width, color, or layout semantics.
- VM audit finding: v288 data has 8 regions, 924 entities, 975 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and 0 invalid explicit notch owners. The shaped/notched count dropped from 137 to 128 and fill pieces from 174 to 160. East Asia China South AD 1644-1685, Taiwan AD 1600-2000, and West Sahel AD 1591-1960 sampled coverage checks all found 0 gaps.
- Browser QA finding: East Asia AD 1668 Chinese dark mode loaded `styles.css?v=288`, `print.css?v=288`, and `app.js?v=288`. `qing_beijing` renders as `清华北核心`, `tungning` as `明郑台湾`, and Qing Taiwan / Tungning stay in the Taiwan lane between the China coast group and Japan. No old `清北京核心` text appears, and there are no upside-down Chinese transforms, low-light labels, pale dark fills, or horizontal overflow.
- Browser QA finding: Africa AD 1850 Chinese dark mode loads v288 assets and renders all West Sahel targets with `clip-path: none`, dark muted fills, light labels, and 0 source / owner `territory-fill-piece` rows. The target rows are adjacent rather than interlocking, matching the no-land-bite modeling decision.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode pages load v288 assets and render 924 blocks / 160 fill pieces / 176 event markers / 975 connection paths with max sampled block/fill luminance about 25.6 and min sampled label luminance about 242.7. There are no white/transparent dark blocks, low-light labels, upside-down Chinese transforms, or body horizontal overflow. Golden Horde main block plus four same-color fill pieces carry transparent same-color seam sides while remaining separate DOM targets. Screenshots inspected: `/tmp/history_visual_v288_all1722_dark.png` and `/tmp/history_visual_v288_africa1850_dark.png`.

## v289 Central Asia Auto-Fill Tightening Findings
- Audit finding: the remaining automatic adjacent-fill path could promote a neighbor that overlapped only 45% of a default taper notch into the owner of the full notch. That was too permissive and could make a discontinued or only-partly-overlapping neighbor look like it owned an entire missing edge.
- Source finding: Britannica defines Transoxania as the Amu Darya-to-Syr Darya historical region with Bukhara and Samarkand as major centers, while Britannica and Encyclopaedia Iranica frame Abbasid / Samanid / Qarakhanid / Seljuq Central Asia as oasis, Khorasan, Transoxianan, and steppe-frontier interaction rather than neat land-bite ownership. Britannica's Dandanaqan entry supports the 1040 Seljuq takeover of Khorasan from the Ghaznavids. Britannica's Timurid and Shah Rukh entries support treating Herat / Khorasan as a southern Timurid cultural-political center, not as a Golden Horde cutout.
- Implementation finding: v289 changes automatic adjacent fill to render only when the adjacent owner covers at least 98% of the missing time window, with tiny edge gaps snapped closed. Otherwise the block stays whole. This preserves complete same-period neighboring interlocks while suppressing partial-overlap false fills.
- Central Asia semantic finding: `abbasid_ca`, `qara_khanid`, `seljuk_ca`, `seljuk_ca_south`, and `timurid_south` no longer carry raw `shape` geometry, notches, notch owners, shape plans, source fill rows, or owner fill rows. Their steppe/oasis or north/south-pair semantics now use frontier/political connections: `阿拔斯河中毗邻葛逻禄-突骑施边疆`, `喀喇汗河中毗邻基马克-钦察草原`, `塞尔柱呼罗珊毗邻基马克-钦察草原`, `塞尔柱呼罗珊与阿富汗通道`, and `沙哈鲁赫拉特与帖木儿呼罗珊`.
- VM audit finding: v289 data has 8 regions, 924 entities, 980 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and 0 invalid explicit notch owners. Shaped/notched records dropped to 110 and rendered fill pieces to 141.
- Browser QA finding: Central Asia AD 1040 Chinese dark-mode QA loads `styles.css?v=289`, `print.css?v=289`, and `app.js?v=289`. All five v289 target records render with `clip-path: none`, 0 source fill rows, and 0 owner fill rows; the page has 86 blocks, 12 fill pieces, 8 event markers, 119 connection paths, 0 upside-down Chinese transforms, and 0 horizontal overflow.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark-mode QA loads v289 assets and renders 924 blocks / 141 fill pieces / 176 event markers / 980 connection paths. There are no pale or transparent dark blocks, no low-light labels, no upside-down Chinese transforms, no horizontal overflow, and mobile event markers have 0 overlaps. Taiwan remains raw `slot 8` at render layout slot 5.72 between Qing south-coast China and Edo Japan. Golden Horde same-color seams remain visually transparent while records stay separate.
- Verification caveat: Browser screenshot capture timed out twice on `Page.captureScreenshot`; the DOM, layout, color, mobile, and data checks all completed successfully, so this is recorded as a tool-level screenshot limitation rather than an application failure.

## v290 / v291 Central Asia Steppe-Frontier False-Fill Findings
- Fresh post-v289 audit finding: `khwarazm_afghan`, `chagatai`, `chagatai_south`, and `timurid` still rendered land-bite geometry. Together with adjacent `ghurid_ca`, `khwarazm_south`, and `golden_horde` wording, this made the Ghurid / Khwarazmian handoff and Chagatai / Golden Horde / Timurid frontier read as reciprocal cutout ownership rather than political handoff, route pairing, or steppe-frontier adjacency.
- Source finding: Britannica's Chagatai Khanate material places Chagatai authority around Syr Darya / Oxus / Kabul-facing domains, while Britannica and Encyclopaedia Iranica place the Golden Horde in the Jochid northern steppe / Volga-Qipchaq world. Encyclopaedia Iranica frames Chaghatayid power in Transoxiana until Timur. Britannica / Iranica Ghurid material supports the Khwarazmian takeover of the Ghurid sphere around 1215. These sources support adjacent whole-lane and handoff semantics, not owner-filled bites.
- Modeling decision for v290: keep `ghurid_ca`, `khwarazm_south`, `khwarazm_afghan`, `chagatai`, `chagatai_south`, `golden_horde`, and `timurid` whole. Use relationship links and bilingual territory notes for the 1215 Khwarazmian takeover/pairing, 1227 Chagatai-Golden Horde frontier, Chagatai north/south pairing, 1391 Timur-Golden Horde war, and 1465 Timurid-Kazakh frontier.
- Implementation finding: removed the target shape geometry and Timurid Golden Horde/Kazakh notch owners; rewrote bilingual descriptions/territory notes away from cutout-owner wording; added `花剌子模古尔与呼罗珊成对`, `察合台毗邻术赤草原兀鲁思`, `察合台南北通道成对`, `帖木儿-金帐草原战争`, and `帖木儿河中毗邻哈萨克草原`; and bumped active assets to `v290`.
- Visual polish finding: v291 adds `shortName: "Da"`, `shortNameCN: "达"`, and `suppressLabel: true` to `dahomey_late`, turning the last all-region hidden face label into a safe mini label without changing dates, slots, widths, colors, or relationships.
- VM audit finding: v291 data has 8 regions, 924 entities, 985 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, 0 invalid explicit notch owners, and 0 achievement-shape anomalies. The shaped/notched record count is 106 with 136 rendered fill pieces. All seven Central Asia targets have no raw shape, no shape plan, 0 source fill rows, and 0 owner fill rows.
- Blank-gap audit finding: raw integer-slot coverage currently has 27 uncovered seams, all exactly 1 year long and concentrated in precise European transition dates such as Roman / post-Roman and World War II handoffs. There are 0 raw slot gaps over 1 year and 0 raw slot gaps over 120 years, so no large data blank was found by this audit.
- Browser target QA finding: Central Asia AD 1300 Chinese dark mode loads `styles.css?v=291`, `print.css?v=291`, and `app.js?v=291`. The page renders 86 blocks / 7 fill pieces / 8 event markers / 124 connection paths; all seven Central Asia targets have `clip-path: none`, no source or owner fill rows, dark muted fills, light labels, no hidden labels, no pale fills, no low-light labels, no upside-down Chinese transforms, and no body overflow.
- Browser regression QA finding: all-region AD 1722 desktop and 390px mobile dark mode load v291 assets and render 924 blocks / 136 fill pieces / 176 event markers / 985 connection paths. Max sampled block/fill luminance is about 25.6 and min sampled label luminance is about 242.7; there are no pale/transparent blocks or fills, no low-light labels, no upside-down Chinese, no hidden face labels, no browser warnings/errors, and no body overflow. In the AD 1722 view, `tungning` / 明郑台湾 and `qing_taiwan` remain raw Taiwan `slot 8` and render at `left: 320`, between Qing south-coast China (`left: 252`) and Edo Japan (`left: 488`); 390px mobile has 0 visible event-marker overlaps.

## v292 Achaemenid Bactria / Saka False-Fill Findings
- Fresh post-v291 audit finding: `persian_ca_south` rendered as a default left taper and the automatic adjacent-fill fallback chose `scythians` as the owner. This made Achaemenid Bactria / Arachosia look like it had a Saka-filled bite even though the existing notes described it as a non-contiguous southern Achaemenid fragment.
- Source finding: Britannica's Achaemenid Empire material notes Bactria as a major Central Asian province/satrapal context; Encyclopaedia Iranica's Achaemenid satrapies article frames satrapies as the mechanism for ruling Achaemenid territory; Britannica's Arachosia entry describes Arachosia as an eastern Persian imperial province around southern Afghanistan / Kandahar; the Met's Achaemenid essay describes the empire as extending to northern India and Central Asia. These sources support Achaemenid satrapal lane semantics, not a Saka-owned cutout inside Bactria. Sources: https://www.britannica.com/topic/Achaemenian-Empire, https://www.iranicaonline.org/articles/achaemenid-satrapies/, https://www.britannica.com/place/Arachosia, https://www.metmuseum.org/essays/the-achaemenid-persian-empire-550-330-b-c.
- Modeling decision for v292: keep `persian_ca_south` whole and connect it to `persian_ca` as an Achaemenid Bactria / Sogdiana satrapal pair. Keep Saka / Scythian pressure as a frontier neighbor, not an automatic fill owner for the Bactria / Arachosia lane.
- Implementation finding: removed `shape: 'taper-left'` from `persian_ca_south`, rewrote bilingual description, detail achievement, and territory note to say whole satrapal fragment / no Saka-filled cutout, added `persian_ca_south -> persian_ca` at 550 BCE with `阿契美尼德巴克特里亚与粟特总督区成对`, and bumped active assets to `v292`.
- VM audit finding: v292 data has 8 regions, 924 entities, 986 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, 0 bad categories, and 0 invalid explicit notch owners. Rendered shape plans dropped to 105 and rendered fill pieces to 135. Central Asia fill pieces dropped to 6, with adjacent fills dropping to 56; `persian_ca_south` has no raw shape, no shape plan, and 0 source-or-owner fill rows.
- Blank-gap audit finding: a corrected real-slot-boundary coverage audit found 101 one-year seam gaps and 0 gaps over 1 year / 0 gaps over 120 years. A coarser integer-slot audit can falsely flag half-lane systems such as Tibet / Tarim as blank, so future blank checks should use entity slot boundaries rather than whole integer slots.
- Browser target QA finding: Central Asia 500 BCE Chinese dark mode loads `styles.css?v=292`, `print.css?v=292`, and `app.js?v=292`. The page renders 86 blocks / 6 fill pieces / 8 event markers / 125 connection paths; `persian_ca_south` has `clip-path: none`, 0 source fill rows, 0 owner fill rows, dark muted fill `rgb(26, 26, 20)`, light label `rgb(248, 242, 234)`, no pale fills, no low-light labels, no hidden labels, no upside-down Chinese, and no body overflow.
- Regression QA finding: all-region AD 1722 desktop and 390px mobile dark mode load v292 assets and render 924 blocks / 135 fill pieces / 176 event markers / 986 connection paths. There are no pale or transparent dark blocks/fills, no low-light labels, no upside-down Chinese, no hidden face labels, no body overflow, and 390px mobile has 0 visible event-marker overlaps. `tungning` / 明郑台湾 and `qing_taiwan` render in the Taiwan lane at `left: 448`, between Qing China proper / North China at `left: 296` and Edo Japan at `left: 616`.

## v293 Middle East Imperial-Core / Mesopotamia False-Fill Findings
- Fresh post-v292 audit finding: `achaemenid_mesopotamia`, `parthia_mesopotamia`, `sasanian_mesopotamia`, and `ilkhanate_iraq` still used taper geometry even though their notes described same-empire Mesopotamia/Iraq rows paired with Persian/Iranian cores. This created a false land-bite reading for provincial/core adjacency.
- Source finding: Britannica's Achaemenid Empire article frames the empire as Persian-ruled and including Babylon/Mesopotamia; Britannica's Mesopotamia / Parthian and Sasanian articles place Parthian and Sasanian power around Babylonia/Ctesiphon and describe Mesopotamia's Sasanian fall before the final collapse; Britannica's Il-Khanid article and Iraq / later Abbasids article support Hulegu's 1258 Baghdad conquest and Ilkhanid Iran/Iraq control. Sources: https://www.britannica.com/topic/Achaemenian-Empire, https://www.britannica.com/place/Mesopotamia-historical-region-Asia/The-Parthian-period, https://www.britannica.com/place/Mesopotamia-historical-region-Asia/The-Sasanian-period, https://www.britannica.com/topic/Il-Khanid-dynasty, https://www.britannica.com/place/Ctesiphon-ancient-city-Iraq, https://www.britannica.com/place/Iraq/The-later-Abbasids-1152-1258.
- Modeling decision for v293: keep Mesopotamia/Iraq whole and adjacent; use political relationships for the same-imperial attachment to the Persian/Iranian core. Same-color seams should hide only the internal visual border, not merge data records.
- Implementation finding: removed `shape: 'taper-right'` from `achaemenid_mesopotamia`, `parthia_mesopotamia`, `sasanian_mesopotamia`, and `ilkhanate_iraq`; rewrote bilingual descriptions/details/territory notes to say whole adjacent lane and no land-bite geometry; added four political links to `achaemenid`, `parthia`, `sasanian`, and `ilkhanate`; and bumped active assets to `v293`.
- VM audit finding: v293 data has 8 regions, 924 entities, 990 relationships, 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 invalid explicit notch owners. Rendered shape plans dropped to 101 and rendered fill pieces to 131. The four v293 target records, plus `tungning` and `qing_taiwan`, have no raw shape, no shape plan, 0 source fill rows, and 0 owner fill rows.
- Blank-gap audit finding: the corrected real-slot-boundary coverage audit found 98 one-year seam gaps and 0 gaps over 1 year / 0 gaps over 120 years. The earlier unrounded coverage probe falsely reported thin `1.819999...` slot slivers, which disappeared after normalizing slot boundaries.
- Browser QA finding: all-region AD 1722 desktop dark mode loads `styles.css?v=293`, `print.css?v=293`, and `app.js?v=293`. The page renders 924 blocks / 131 fill pieces / 176 event markers / 990 connection paths with no pale dark blocks, no low-light labels, and no upside-down Chinese. `tungning` / `qing_taiwan` remain raw Taiwan `slot 8` / layout slot 5.72 between Qing China proper (`left: 296`) and Edo Japan (`left: 616`). `sasanian_mesopotamia` / `sasanian` and `ilkhanate_iraq` / `ilkhanate` render as whole adjacent same-color blocks with seam-side classes and `clip-path: none`.
- Mobile QA finding: 390px all-region AD 1722 dark mode renders 924 blocks / 131 fill pieces / 176 event markers / 990 connection paths, with no pale dark blocks, no low-light labels, no upside-down Chinese, no body overflow, and 0 visible event-marker overlaps. Mobile Taiwan positions remain between Qing China proper and Edo Japan.

## v294 / v295 Middle East Province-Lane and Blank-Tail Findings
- Fresh post-v293 audit finding: the next visible false-fill cluster was broader Middle East province/campaign rows: `old_babylon_elam_campaign`, `achaemenid_anatolia`, `achaemenid_levant`, `achaemenid_egypt`, `achaemenid_egypt_late`, `byzantine_egypt`, `byzantine_levant`, `rashidun_levant`, `rashidun_egypt`, `umayyad_egypt`, `umayyad_arabia`, `abbasid_persia`, `ottoman_egypt`, and `ottoman_egypt_restored`. Their taper geometry made administrative or campaign pairings read as land-bite ownership.
- Source finding: the Met supports the Achaemenid imperial/satrapal reach into Anatolia, Babylon, and Egypt; Britannica supports Yarmouk and the Byzantine-to-Rashidun Levant/Egypt transitions, Umayyad Damascus rule, Abbasid eastern/Khorasan context, and Ottoman Egypt after Selim I's 1517 conquest. Latin Library / Britannica-derived Hammurabi notes support the Old Babylonian-Elam campaign as conflict pressure, not a stable owner-fill geometry. Sources: https://www.metmuseum.org/essays/the-achaemenid-persian-empire-550-330-b-c, https://www.britannica.com/topic/Battle-of-Yarmouk-636, https://www.britannica.com/summary/Umayyad-dynasty-Islamic-history, https://www.britannica.com/place/Iran/The-Abbasid-caliphate-750-821, https://www.britannica.com/place/Egypt/The-Ottomans-1517-1798, https://www.britannica.com/biography/Selim-I, https://www.thelatinlibrary.com/imperialism/notes/hammurabi.html.
- Implementation finding: v294 removes the target taper shapes, rewrites bilingual descriptions/details/territory notes to whole-lane / no-land-bite language, and adds 14 political/conflict relationship links tying those rows to their imperial or campaign cores. v295 adds `getRegionSlotSpan()` and removes the erroneous `slotEnd + 1` region-width/offset behavior that created a permanently empty tail column in every region.
- VM audit finding: v295 data has 8 regions, 924 entities, 1004 relationships, 0 duplicate IDs, 0 missing endpoints, and 0 bad connection types. Rendered shape plans are down to 89 and rendered fill pieces to 119. All 14 v294 targets have no raw shape, no shape plan, 0 source fill rows, and 0 owner fill rows.
- Blank-gap finding: the strict lane coverage audit now reports only 30 one-year seams and 0 gaps over 1 year. The previous eight 5000-year "empty-lane" gaps were not history gaps; they were layout tail columns caused by treating `slotEnd` as a last index instead of a right boundary.
- Browser QA finding: all-region AD 1722 Chinese dark mode loads `styles.css?v=295`, `print.css?v=295`, and `app.js?v=295`. It renders 924 blocks / 119 fill pieces / 1004 connection paths, has 583 same-color seam-marked elements, and shows 0 pale dark blocks, 0 low-contrast labels, 0 blank visible blocks, and no document-level horizontal overflow. `tungning` / `qing_taiwan` remain raw Taiwan `slot 8` and render at layout slot 5.72, between Qing China proper (`layoutSlot: 3`) and Edo Japan (`layoutSlot: 8.72`).
- Mobile QA finding: 390px all-region AD 1722 Chinese dark mode renders 924 blocks / 119 fill pieces / 1004 connection paths, with no body horizontal overflow and 0 visible interactive overlaps after filtering hidden controls. The first unfiltered overlap report came from the invisible full-page exit button retaining a layout box and was a verifier false positive.

## v296 / v297 Muhammad Ali Egypt / Egyptian Levant Findings
- Fresh post-v295 audit finding: `muhammad_ali_egypt` still had `shape: 'taper-left'`, and `egyptian_levant_occupation` still had `shape: 'hourglass'`. The automatic fill system therefore made Ottoman core suzerainty and Ottoman Hejaz adjacency look like owner-filled geography instead of relationship semantics.
- Source finding: Britannica supports Muhammad Ali's 1805 Ottoman viceroyalty and semiautonomous Egyptian province context, plus his 1831-1840 Syrian expansion and the 1841 settlement preserving Ottoman suzerain rights. The Office of the Historian's London Convention documents support evacuation of Syria, restored Ottoman authority, and Muhammad Ali's legal status as a delegated Ottoman governor. Sources: https://www.britannica.com/biography/Muhammad-Ali-pasha-and-viceroy-of-Egypt and https://history.state.gov/historicaldocuments/frus1879/d518.
- Modeling decision for v296: keep Muhammad Ali Egypt as a whole Nile lane and Egyptian Levant as a whole Syrian-Palestinian occupation lane. Ottoman suzerainty belongs in the `muhammad_ali_egypt -> ottoman_west` relationship; Syrian occupation governance belongs in the `egyptian_levant_occupation -> muhammad_ali_egypt` relationship; Ottoman Hejaz remains an adjacent holy-cities lane.
- Implementation finding: removed both target shape fields, rewrote target descriptions/details/territory notes away from implementation wording, added the two relationship links above, and bumped cache assets through v297. The detail panel now says the occupation is linked to Cairo and keeps Ottoman Hejaz as a neighboring holy-cities lane, with no target-panel `缺口` / `填补` wording.
- VM audit finding: v297 data has 8 regions, 924 entities, 1006 relationships, 0 missing endpoints, 87 rendered shape plans, and 116 rendered fill pieces. `muhammad_ali_egypt` and `egyptian_levant_occupation` both have raw shape `null`, 0 raw notches, no shape plan, 0 source fill rows, 0 owner fill rows, and no target implementation terms.
- Browser QA finding: all-region AD 1722 Chinese dark mode loads `styles.css?v=297`, `print.css?v=297`, and `app.js?v=297`. It renders 924 blocks / 116 fill pieces / 1006 connection paths, with 0 pale dark blocks, 0 low-contrast labels, 0 blank visible blocks, no body overflow, and 0 target fill pieces. The target blocks render with `clip-path: none`, dark backgrounds around `rgb(12, 9, 11)`, and light text `rgb(220, 212, 199)`.
- Target QA finding: Middle East AD 1835 Chinese dark mode at zoom 4 renders 178 blocks / 20 fill pieces / 204 connection paths with 121 visible connection labels. The Egyptian Levant detail panel opens correctly, shows Cairo governance, has no target-panel implementation wording, and the two target blocks still have `clip-path: none` plus 0 target fill pieces.
- Mobile QA finding: 390px all-region AD 1722 Chinese dark mode loads v297 assets and renders 924 blocks / 116 fill pieces / 1006 connection paths with no body horizontal overflow, no blank visible blocks, and no label-overflow rows. Dense compact event markers now have empty text nodes while preserving `data-event-number`, title text, and `aria-label` such as `#10 · 公元前776年: 第一届奥运会`.

## v298 Seam Hover / Taiwan Strait / Middle East Adjacency Findings
- Visual finding: same-color adjacency remains a render-only border-hiding rule. Normal seam-marked sides compute to transparent, while the loaded `v298` stylesheet now restores the hovered/focused seam side with `var(--ink-1)` in light mode and `rgba(255,255,255,0.32)` in dark mode. Hover/focus/detail records remain separate DOM targets.
- Dark-mode finding: `darkTint()` now uses a lower mix and saturation (`0.075`, `0.36`) against base `[4,6,8]`. Browser QA found 0 pale dark blocks, 0 transparent blocks, 0 low-contrast labels, and 0 upside-down Chinese transforms in the all-region AD 1722 dark page.
- Blank-block finding: the remaining 22 no-text blocks are ultra-short 3-5px records that intentionally suppress labels to avoid overlap. They now expose a 2px pseudo-element marker in both light and dark mode, and light-mode QA found 0 transparent blocks and 0 white no-text blocks.
- Taiwan layout finding: Tungning / Ming Zheng Taiwan and Qing Taiwan remain raw Taiwan `slot 8`, but render at layout slot 5.95 after a wider strait gap. In the all-region AD 1722 browser QA, `tungning` starts about 53px right of Qing south-coast China and about 19px before the Vietnam lane, keeping it near the China coast without attaching it to the mainland core.
- Semantic finding: `tahirid`, `mongol_me`, `seljuk_rum_late`, `ottoman_early`, and `saudi_arabia` all now have no raw `shape`, no raw `notches`, no shape plan, no source fill rows, and `clip-path: none`. Tahirid-Abbasid recognition and Saudi-Transjordan adjacency are preserved by explicit relationship links.
- Verification caveat: in-app Browser screenshot capture timed out twice on the large timeline, but VM, CSS, DOM, layout, color, and connection-label checks completed successfully.

## v299 Cross-Region Automatic-Fill Findings
- Fresh post-v298 audit finding: rendered shape plans were down to 82, but several high-risk automatic-adjacent readings remained. `mughal_deccan` used hourglass-like semantics against Mughal core / Bengal neighbors, `delhi_deccan` and `pandya` could read as mutual land bites, `umayyad_africa` could make Christian Nubia look like a North African cutout owner, and `ayutthaya_rise` / `sukhothai_late` used reciprocal transition geometry even though the intended history was consolidation and absorption.
- Source finding: Britannica's Aurangzeb material supports Mughal Deccan annexation under Aurangzeb and the costly Deccan wars leading into Maratha resistance; Britannica's Delhi Sultanate / Khalji / Tughluq material supports raids, tribute, and Deccan pressure rather than a stable Pandya land-bite geometry. Britannica's Sukhothai / Ayutthaya material supports Ayutthaya's Thai consolidation and later Sukhothai absorption. Britannica and UChicago Nubia material support Christian Nubia as a separate middle-Nile Christian kingdom field while Ifriqiya / Maghreb follows the North African conquest route after Carthage. Sources: https://www.britannica.com/biography/Aurangzeb, https://www.britannica.com/place/Delhi-sultanate, https://www.britannica.com/topic/Khalji-dynasty, https://www.britannica.com/place/India/The-Tughluqs, https://www.britannica.com/place/Sukhothai-kingdom, https://www.britannica.com/place/Ayutthaya-kingdom-Thailand, https://www.britannica.com/topic/history-of-Thailand, https://www.britannica.com/place/North-Africa/From-the-Arab-conquest-to-1830, https://www.britannica.com/place/Egypt/From-the-Islamic-conquest-to-1250, and https://isac.uchicago.edu/museum-exhibits/nubia/medieval-nubia.
- Modeling decision for v299: keep the six target records whole and adjacent. Carry conquest routes, raids, pressure, imperial-core pairing, absorption, and resistance through relationship links and bilingual territory/detail text rather than `shape`, `notches`, `notchOwners`, or automatic owner-fill rows.
- Implementation finding: removed shape geometry from `mughal_deccan`, `delhi_deccan`, `pandya`, `umayyad_africa`, `ayutthaya_rise`, and `sukhothai_late`; rewrote their descriptions, achievements, and territory notes; added `埃及至易弗里基叶征服通道`, `卡尔吉远征泰米尔南方`, `莫卧儿德干与帝国核心成对`, and `德干战争与马拉塔抵抗`; and bumped active assets to `v299`.
- VM audit finding: v299 data has 8 regions, 924 entities, 1012 relationships, and 176 historical events, with 0 duplicate IDs, 0 missing endpoints, 0 bad connection types, and 0 bad categories. Rendered shape plans dropped to 76 and rendered fill pieces to 104. All six v299 targets have no raw shape, no raw notches, no shape plan, and 0 source/owner fill rows. Corrected real-slot coverage reports 98 one-year seams and 0 gaps over 1 year / 0 gaps over 10 years.
- Browser QA finding: headless Chrome desktop and 390px mobile all-region AD 1722 Chinese dark mode loaded `styles.css?v=299`, `print.css?v=299`, and `app.js?v=299`. Both rendered 924 blocks / 104 fill pieces / 176 event markers / 1012 connection paths, with 578 same-color seam-marked elements, 22 no-text micro blocks all showing `::after` markers, and 0 pale dark blocks, transparent blocks, low-contrast labels, upside-down Chinese transforms, non-micro blank-text blocks, label-overflow-hidden blocks, dense event text overflows, console/log problems, or document-level horizontal overflow.
- Taiwan layout finding: v299 keeps Tungning / Ming Zheng Taiwan and Qing Taiwan at raw Taiwan `slot 8` and render layout slot `5.95`. In the desktop dark QA, `tungning` rendered to the right of Qing south-coast China (`layoutSlot 4.5`) and left of Edo Japan (`layoutSlot 9.29`), so it no longer reads as a Beijing-core mainland block while remaining geographically near the China coast.

## v300 Late Khmer / Tai-Polity Findings
- Fresh post-v299 audit finding: `khmer_late` was the remaining direct residue of the older v164 Late Khmer / Tai-owner model. It still generated a `shape-custom` plan and two explicit fill pieces owned by `sukhothai` and `ayutthaya_rise`, while the surrounding v299 records had already moved to whole adjacent lanes and relationship semantics.
- Source finding: Britannica's Khmer Empire and Cambodia decline material identify Tai attacks and the 1431 sack of Angkor as the endpoint of the Khmer empire; Britannica's Sukhothai material describes a mid-13th-century Tai revolt from Khmer rule; Britannica's Ayutthaya material describes Ayutthaya as the Chao Phraya successor and Tai consolidation center. Sources: https://www.britannica.com/topic/Khmer-Empire, https://www.britannica.com/place/Cambodia/The-decline-of-Angkor, https://www.britannica.com/place/Sukhothai-kingdom, https://www.britannica.com/place/Thailand/The-Ayutthayan-period-1351-1767, and https://www.britannica.com/topic/history-of-Thailand.
- Modeling decision for v300: keep Late Khmer as a whole reduced Angkor / Cambodian core lane. Carry Sukhothai breakaway, Ayutthaya pressure, and the 1431 sack of Angkor through political/conquest relationships and detail text rather than Tai-owned edge geometry.
- Implementation finding: removed `khmer_late` notches, rewrote its bilingual description, detail achievement, and territory note away from Tai cutout-owner wording, added `素可泰脱离高棉权威` and `阿瑜陀耶攻陷吴哥`, and bumped active assets to `v300`.
- Initial VM audit finding: v300 data has 924 entities, 1014 relationships, and 176 events, with 0 duplicate IDs, missing endpoints, bad categories, or bad connection types. Rendered shape plans dropped to 75 and rendered fill pieces to 102; Southeast Asia shape plans dropped to 6 and fill pieces to 8. `khmer_late`, `sukhothai`, `ayutthaya_rise`, and `sukhothai_late` all have no raw shape, no raw notches, no shape plan, and 0 fill rows.
- Browser QA finding: v300 all-region desktop/mobile dark-mode checks passed for assets, counts, color, contrast, upside-down Chinese, blank blocks, Taiwan placement, and document overflow. The target Southeast Asia view still hid `素可泰脱离高棉权威` because connection-label collision scoring preferred a same-year succession label. v301 supersedes v300 for the final verified page.

## v301 Late Khmer Breakaway Label Priority Findings
- Implementation finding: added optional `labelPriority` support to `scoreConnectionLabel()` and set the Sukhothai-to-Late-Khmer breakaway link to `labelPriority: 40`, so the relationship carrying the breakaway semantics can survive collision pruning without disabling pruning globally. Active assets now load `v301`.
- VM audit finding: v301 data has 8 regions, 924 entities, 1014 relationships, and 176 historical events, with 0 duplicate IDs, missing endpoints, bad connection types, missing categories, or target owner-fill rows. Rendered shape plans remain 75 and rendered fill pieces 102. The corrected real-slot coverage audit reports 98 one-year seams and 0 gaps over 1 year.
- Browser QA finding: desktop and 390px mobile all-region AD 1722 Chinese dark mode load `styles.css?v=301`, `print.css?v=301`, and `app.js?v=301`, rendering 924 blocks / 102 fill pieces / 176 event markers / 1014 connection paths. Both views have 0 pale or transparent dark blocks, low-contrast labels, upside-down Chinese transforms, non-micro blank-text blocks, label-overflow-hidden blocks, dense event text overflows, browser log problems, or document-level horizontal overflow. Tungning / Ming Zheng Taiwan and Qing Taiwan still render in the Taiwan lane between Qing North China Core and Edo Japan.
- Target QA finding: Southeast Asia AD 1431 Chinese dark mode loads v301 assets and renders `khmer_late`, `sukhothai`, `ayutthaya_rise`, and `sukhothai_late` with `clip-path: none`, no shape class, and 0 source/owner fill rows. The visible connection labels include `素可泰脱离高棉权威`, `阿瑜陀耶攻陷吴哥`, and `素可泰并入阿瑜陀耶`.

## v302 Chinese-Rule Vietnam Remote-Fill Findings
- Fresh post-v301 audit finding: `chinese_vn` was the highest remaining rendered-geometry risk. It had one full-height remote-owner cutout and 15 explicit owner-fill fragments from mainland Chinese dynasties, making the already named `Chinese Rule` / `北属时期` row read like a missing-land polygon rather than a whole foreign-administration lane.
- Source finding: Britannica supports Han conquest / annexation of Nam Viet in 111 BCE, Chinese military districts and increasingly direct administration around Jiaozhi / the Red River delta, Tang-era Chinese rule through the Annan protectorate context, Tang decline, and Vietnamese independence after Bach Dang in 938/939. Sources: https://www.britannica.com/place/Vietnam/Vietnam-under-Chinese-rule and https://www.britannica.com/topic/history-of-Vietnam.
- Modeling decision for v302: keep `chinese_vn` whole. Carry Han commanderies, the Tang Annan Protectorate, Southern Han / Lingnan context, and Bach Dang independence through relationships and detail text. Do not restore remote `notches`, `shape`, `notchOwners`, or Han/Wu/Jin/Southern-Dynasties/Sui/Tang/Southern-Han owner-fill geometry.
- Implementation finding: removed `chinese_vn` notches; rewrote its bilingual description, achievements, and territory note to say whole Red River commandery/protectorate lane / no remote cutout; added `汉设交趾郡县`, `唐安南都护府`, and `独立前南汉控制交趾` political links with label priorities 22 / 20 / 18; preserved `白藤江后越南独立`; and bumped active assets to `v302`.
- VM audit finding: v302 data has 8 regions, 924 entities, 1017 relationships, and 176 historical events, with 0 duplicate IDs, missing endpoints, bad connection types, bad categories, or invalid explicit notch owners. Rendered shape plans dropped to 74 and rendered fill pieces to 87, split as 61 explicit and 26 adjacent fills. `chinese_vn` has raw shape `null`, 0 raw notches, no `notchOwners`, no shape plan, 0 source fill rows, and 0 owner fill rows.
- Blank-gap audit finding: the corrected real-slot-boundary coverage audit reports 98 one-year seam gaps and 0 gaps over 1 year / 0 gaps over 10 years / 0 gaps over 120 years. A naive exact-slot audit still produces false positives on fractional lanes, so future blank checks should keep using true entity slot boundaries.
- Browser QA finding: all-region AD 1722 desktop and 390px mobile Chinese dark mode load `styles.css?v=302`, `print.css?v=302`, and `app.js?v=302`, rendering 924 blocks / 87 fill pieces / 176 event markers / 1017 connection paths. Both views have 0 pale or transparent dark blocks, 0 low-contrast labels, 0 upside-down Chinese transforms, 0 non-micro blank-text blocks, 0 label-overflow-hidden blocks, 0 dense event text overflows, 0 console/log issues, and no document-level horizontal overflow. Dark-mode max sampled block/fill luminance is about 20.7 and min sampled block-label luminance is about 242.7.
- Target QA finding: East Asia AD 679 Chinese dark mode renders `chinese_vn` with `clip-path: none`, no shape class, 0 source fill rows, and 0 owner fill rows. The detail panel includes `疆域语义`, omits `缺口承接`, and contains all four relationship labels: `汉设交趾郡县`, `唐安南都护府`, `独立前南汉控制交趾`, and `白藤江后越南独立`; three are visible as connection labels after collision pruning, while the Han commandery label remains present in the detail panel.
- Taiwan layout finding: v302 preserves the v298+ render-only East Asia ordering. Tungning / Ming Zheng Taiwan and Qing Taiwan remain raw Taiwan `slot 8` at render layout slot `5.95`; in desktop and mobile all-region QA they start about 53px right of Qing south-coast China, about 109px right of Qing North China Core, and about 131px before Edo Japan.

## v303 Visual Semantics / Dark Palette / Taiwan Layout Findings
- Visual finding: same-color seam suppression remains a render-only border rule. v303 adds optional `seamGroup` as an explicit seam key for split companion records such as Golden Horde / Jochid, Chagatai north/south, and Timurid companion lanes, but the DOM nodes, hover/focus targets, detail panels, IDs, and relationship records remain separate. Blocks without `seamGroup` still fall back to rendered color plus region.
- Dark-mode finding: `darkTint()` now uses a darker mix (`colorMix` 0.058, `saturationMix` 0.32, dark base `[3,5,7]`). All-region AD 1722 dark QA found max sampled territory luminance about 16.6, 0 pale dark blocks, 0 transparent blocks, and 0 low-light labels; dark labels remain light.
- Layout finding: the East Asia render-only guide now orders the China south-coast group, Vietnam / South China Sea, Taiwan, then Japan/Korea. In desktop AD 1722 QA, Qing south coast starts at `left=252`, Vietnam / Nguyen at `left=306.88`, Tungning / Qing Taiwan at `left=388.64`, and Edo Japan at `left=519.68`, while Qing Beijing core remains left at `left=168`.
- Source finding: Britannica describes the Saffarid dynasty as a Sistan / eastern-Iran power that displaced Tahirid Khorasan and received Abbasid recognition; Britannica describes the Samanids as a Bukhara-centered eastern Iranian / Transoxiana / Khorasan dynasty with Abbasid-recognized origins. Sources: https://www.britannica.com/topic/Saffarid-dynasty and https://www.britannica.com/topic/Samanid-dynasty.
- Modeling decision for v303: keep Saffarid and Samanid Iran whole. Abbasid recognition or caliphal context should be expressed through political relationships and detail text, not Baghdad-owned edge cutouts inside eastern Iranian lanes.
- Implementation finding: removed Saffarid / Samanid raw notch geometry, rewrote bilingual descriptions/details/territory notes away from Baghdad cutout wording, added `阿拔斯承认萨法尔呼罗珊` and `阿拔斯语境下的萨曼自治`, strengthened `.layout-gap` styling so spacing reads as intentional map/water/gap rather than blank white, lowered safe mini-label thresholds, and bumped active assets to `v303`.
- VM audit finding: v303 data has 8 regions, 924 entities, 1019 relationships, and 176 historical events, with 0 duplicate IDs, missing endpoints, bad connection types, bad categories, or invalid explicit notch owners. Rendered shape plans dropped to 72 and rendered fill pieces to 85, split as 59 explicit and 26 adjacent fills. `chinese_vn`, `tungning`, `qing_taiwan`, `saffarid`, `samanid_iran`, `golden_horde`, and `mongol_europe` all have no raw shape, no notches, no shape plan, and 0 fill rows.
- Blank-gap finding: corrected true-slot coverage now reports 17 one-year seams and 0 gaps over 1 year / 0 gaps over 10 years. Browser QA found 0 non-micro blank blocks and 0 hidden labels; formerly blank-looking tiny Middle East targets such as `jordan_independence` and `syria_lebanon_independence` now show safe mini labels.
- Browser QA finding: all-region AD 1722 desktop dark, desktop light, and 390px mobile dark views load `styles.css?v=303`, `print.css?v=303`, and `app.js?v=303`, rendering 924 blocks / 85 fill pieces / 176 event markers / 1019 connection paths. All three views have 0 transparent blocks, 0 upside-down Chinese transforms, 0 non-micro blank blocks, 0 hidden labels, 0 same-color seam problems, and no document overflow. Middle East AD 903 target QA renders Saffarid and Samanid Iran with `clip-path: none` and 0 source/owner fill rows.

## v304 Same-Polity Cutout / Text Contrast Findings
- Fresh post-v303 audit finding: `safavid` still rendered one explicit same-color fill owned by `safavid_iraq`, and `qing` still rendered one explicit same-color fill owned by `qing_manchuria`. This contradicted the current visual rule: same-color same-polity adjacency should hide only the border, not carve one record into another. `qing_south_campaigns` and `qing_manchuria` also retained stale `shape: 'taper-left'` fields that no longer produced valid shape plans but still polluted geometry audits.
- Source finding: Britannica describes the Qing name as established by the Manchus for the regime in Manchuria in 1636 and the Qing dynasty's rule over all China beginning in 1644. Britannica describes the Safavid dynasty as ruling Iran from 1501 to 1736, with Ismail annexing Iraqi provinces including Baghdad/Mosul early, and the 1534 Ottoman capture of Baghdad from the Safavids. Sources: https://www.britannica.com/question/When-was-the-Qing-dynasty-established, https://www.britannica.com/topic/Safavid-dynasty, and https://www.britannica.com/event/Battle-of-Baghdad-1534.
- Modeling decision for v304: keep Qing China proper, Qing Manchuria, Qing south-coast campaigns, Safavid Iran, and Safavid Iraq as separate data records with independent hover/detail/search targets. Remove their same-polity cutout geometry and express the pairings with political relationship links. Same-color seam hiding handles the normal border visually; hover/focus can still expose separate records.
- Implementation finding: removed the Safavid west-edge notch and Qing right-edge taper/notch owner, removed stale Qing south/manchuria shape fields, rewrote bilingual descriptions/details/territory notes away from `缺口` / cutout-owner wording, added `萨法维伊拉克并列伊朗核心` and `清满洲并列中国本部`, and bumped active assets to `v304`.
- Readability finding: the first v304 browser pass found light mode had 203 low-contrast block labels because secondary year/ruler text used a global muted ink color. Strengthening those labels reduced the count to 4, all on dark French blue blocks; dynamic per-block text color then reduced light-mode low-contrast labels to 0 while preserving dark-mode light labels.
- VM audit finding: v304 data has 8 regions, 924 entities, 1021 relationships, and 176 historical events, with 0 duplicate IDs, missing endpoints, bad connection types, bad categories, or invalid explicit notch owners. Rendered shape plans dropped to 70 and rendered fill pieces to 83, split as 57 explicit and 26 adjacent fills. The target Qing/Safavid records have no raw shape, no raw notches, no shape plan, and 0 fill rows.
- Blank-gap finding: corrected true-slot coverage reports 0 gaps over 1 year. The earlier raw one-year seam count can vary with fractional slot-boundary normalization, but no meaningful ownerless block interval remains from the v304 edit.
- Browser QA finding: headless Chrome desktop dark/light, 390px mobile dark, and Middle East AD 1534 dark target QA load `styles.css?v=304`, `print.css?v=304`, and `app.js?v=304`. All-region views render 924 blocks / 83 fill pieces / 176 event markers / 1021 connection paths with 0 pale/transparent dark blocks, 0 low-contrast labels, 0 upside-down Chinese transforms, 0 non-micro blank blocks, 0 hidden labels, and 0 label-overflow rows. Qing China proper, Qing Manchuria, Qing south coast, Qing Taiwan, Safavid Iran, and Safavid Iraq all show `clip-path: none`; Qing-Manchuria and Safavid-Iraq same-color seams are hidden normally. East Asia AD 1722 order remains Qing Manchuria (`left=240` desktop dark), Qing China proper (`296`), Nguyen/Vietnam (`462.88`), Qing Taiwan (`516.63`), and Edo Japan (`647.67`).

## v305 Column / Region Layout Findings
- Audit finding: the previous all-region render order was East Asia -> Europe -> Middle East -> South Asia -> Central Asia -> Africa -> Americas -> Southeast Asia because `getVisibleRegions()` used `CONFIG.visibleRegions` insertion order. Weighted cross-region relationship distance was 489 in the local audit.
- Modeling finding: pure shortest-path optimization was too aggressive for readable history geography, but the stable guide East Asia -> Southeast Asia -> South Asia -> Central Asia -> Middle East -> Europe -> Africa -> Americas reduces the same weighted distance to 433 while preserving a clear Old World chain and keeping the Americas as the least connected endpoint.
- East Asia finding: the previous East Asia guide scored 336 on same-region relationship distance; the new guide western frontier -> Northeast -> Mongolia -> China core -> Taiwan -> Korea -> Japan -> Vietnam scores 272. It keeps raw Taiwan `slot 8` and raw Vietnam `slot 7`, but moves Taiwan near China with a render gap and puts Vietnam on the Southeast Asia-facing edge.
- Southeast Asia finding: adding a guide Vietnam/Champa -> Cambodia/Mekong -> Thailand -> Myanmar -> Malaysia/Singapore -> Indonesia -> Philippines lowers the internal relationship score from 47 to 43 while keeping Cambodia/Thailand and Malaysia/Indonesia adjacent.
- South Asia finding: adding a guide Sri Lanka -> Bengal -> north+Deccan core -> Punjab/NW lowers the internal relationship score from 70 to 58 and places the northwest lane next to Central Asia in the global render.
- Safety finding: lane groups are still built from raw slot spans before ordering, so a multi-slot polity cannot be split by the guide. Entity positions, territory fill pieces, connection paths, same-color seams, and territorial ticks all use rendered positions after layout mapping; raw `slot` / `width` data remains unchanged.
- Verification finding: `node --check app.js`, `git diff --check`, active asset scan, VM data/layout audit, and headless Chrome desktop/mobile QA passed. Browser QA loaded only `v305` assets, rendered 924 blocks / 1021 connection paths / 176 event markers, and found 0 console/log issues, body overflow, or label-overflow-hidden blocks. Desktop and 390px mobile both confirmed the new region header order and Compare option order; a follow-up browser pass confirmed the toolbar region-toggle order matches them. Key block order checks passed for Qing Manchuria -> Qing China core -> Qing Taiwan -> Joseon -> Edo -> Nguyen / Vietnam edge, Southeast Asian Vietnam -> French Indochina -> Thailand -> Myanmar -> Malaysia -> Indonesia, and South Asian Sri Lanka -> Bengal -> Punjab/NW.

## v306 Event / Connection Regression and Modern Color Findings
- Reproduction finding: the reported high-zoom URL did not lose data in DOM; v305 still rendered 176 event markers and 1021 connection paths. The visible regression was display-layer behavior: all-region events stayed in dense micro-dot mode at `zoom=2`, and connection labels were pruned from 1021 candidates to 594 visible labels.
- Event finding: dense event mode now checks average event pixel spacing, so fit-all views remain compact while `zoom=2` restores normal numbered markers. Exact-URL v306 QA reports 176 events, dense mode `false`, track hidden `false`, and visible marker text such as `1`.
- Connection-label finding: collision handling now tries small vertical offsets at high zoom before removing labels. Exact-URL v306 QA reports 1021 label candidates, 893 visible labels, 335 nudged labels, and 128 hidden labels, compared with 594 visible / 427 hidden before the fix.
- Color finding: `roc_taiwan` already used the same source and rendered color as `roc_postwar` / ROC mainland (`#7B8EB9`, rendered `rgb(168, 180, 209)`). `mongolia_mod` now uses `#7FA68A`, rendered `rgb(171, 196, 178)`, distinct from PRC `#C49A9A`, rendered `rgb(216, 188, 188)`. A modern same-color adjacency filter found no remaining pair involving Mongolia/PRC.
- Additional color audit finding: the same modern-adjacency filter found a Saudi Arabia / modern Levant same-color seam risk, so `levant_modern` now uses `#5F82A6`, rendered `rgb(149, 173, 196)`, distinct from Saudi Arabia's green. The filtered high-risk modern pairs for `mongolia_mod`, `prc`, `saudi_arabia_full`, and `levant_modern` are now 0.
- Data-integrity finding: runtime audit reports 8 regions, 924 entities, 1021 connections, and 176 events, with 0 duplicate IDs, missing categories, bad categories, bad dates, bad slots, bad connection types, missing connection endpoints, bad event regions, invalid event dates, or unrendered connections. Browser QA loaded only `styles.css?v=306`, `print.css?v=306`, and `app.js?v=306`.

## v307 Bottom-Layering Findings
- Reproduction finding: the bottom all-region screenshot showed real coverage, not missing data. Hit testing found 26 of 27 bottom event markers and 25 of 25 bottom connection labels had centers covered by dynasty content, while the footer top was below the viewport.
- Layer finding: connection SVGs were rendered at z-index 35 and dynasty blocks at z-index 100, so labels and paths could disappear under blocks near the bottom. The event markers themselves had z-index 45, but their parent event rail had no stacking layer, allowing block stacking contexts to cover them.
- Legend finding: the fixed collapsed legend remained a wide black box in the lower-right corner and covered timeline content even when collapsed. v307 reduces the collapsed state to a 34px icon-only control while preserving the legend toggle.
- Implementation finding: v307 raises connection SVGs to z-index 140, raises the global event rail to z-index 220, keeps marker interaction intact, and updates `index.html` to load `styles.css?v=307`, `print.css?v=307`, and `app.js?v=307`.
- Verification caveat: `node --check app.js` and `git diff --check` passed. The in-app Browser plugin refused post-fix screenshot capture on the `file://` URL, so the recorded post-fix proof is static/code-level until the page is viewed through an allowed browser URL.

## v308 Overview Display Consistency Findings
- Connection-label finding: the missing arrow text at `zoom=0.1` was caused by a zoom gate, not by missing relationship data. v308 creates label nodes whenever `linkLabels=1`; the existing collision-pruning pass now decides how many remain readable, and low zoom uses a smaller label font.
- Global-event finding: event markers were positioned in the horizontal timeline wrapper, so the rail could visually attach to whatever part of the long chart occupied that x-position. v308 makes the rail `position: fixed` at the viewport right and stores each marker's content Y so scroll/resize can update its viewport Y without changing event data.
- Region-gap finding: East Asia had explicit render-only island/coast gaps, but other major regions only had hairline separators. v308 adds consistent render-only gaps after visible regions, with a larger Africa-to-Americas gap, so major land/ocean transitions no longer read as one continuous strip.
- Safety finding: the v308 changes are display-only. Raw `slot`, `width`, entity IDs, relationship endpoints, event records, and ownership semantics are unchanged; connection paths and region headers use the same rendered coordinate system after the gaps are inserted.
- Verification finding: `node --check app.js` and `git diff --check` passed, and active assets point to `v308`. Direct visual proof through the in-app Browser is still unavailable for `file://` because of the Browser tool policy.

## v311 Internal Geography and Event-Rail UX Findings
- Internal-gap finding: Europe has raw slot 4 for Britain, between Iberia and Germany. v311 adds preserve-order gaps after source slot 4 and 5, so Britain reads as an island lane rather than a mainland-contiguous column. The Americas have raw slots 0-1 for Mesoamerica/Central America, 2-3 for Andes/Brazil, 4-5 for USA/Canada, and 6 for the Caribbean; v311 adds preserve-order gaps after source slots 2, 4, and 6.
- Event-rail finding: the first v309 pass technically expanded but still left the collapsed dense rail 260px wide because 32 event lanes were spread at 8px each. v311 compresses collapsed dense lanes to 2.2px spacing, making the default rail 80px wide in the checked overview view.
- Header-hit finding: top event markers could fall under the sticky header and become unclickable; `elementFromPoint` hit `.header-toolbar` instead of the marker. v311 hides markers under the header from both visual and keyboard hit paths until they enter the actual timeline viewport.
- Browser QA finding: localhost Chrome loaded `styles.css?v=311`, `print.css?v=311`, and `app.js?v=311`. At `zoom=0.1`, connection-label pruning kept 267 visible labels from 1021 candidates, the fixed event rail rendered 176 dense markers in 32 lanes, the default track was `{left: 1188, right: 1268, width: 80}` in a 1280px viewport, and hover expanded it to 404px with visible number and event label.
- Screenshot finding: default and expanded-state browser screenshots were saved as `/tmp/history-visual-v311-default.png` and `/tmp/history-visual-v311-hover.png`. The default screenshot shows the compact edge rail and internal Europe/Americas gaps; the hover screenshot shows the expanded rail with the active event label.

## v312 Default Settings Findings
- Default-language finding: no-parameter startup now uses Chinese by default. `CONFIG.language` is `cn`, the document starts as `<html lang="zh-CN">`, the Chinese language button is active in the static HTML, and browser QA showed Chinese title/search placeholder after initialization.
- Default-label finding: no-parameter startup now keeps connection labels off while leaving the connection layer on. `CONFIG.showConnectionLabels` is `false`, the static Labels checkbox is unchecked, and browser QA rendered 1021 SVG connection paths with 0 `.connection-label` nodes.
- URL-override finding: the existing URL parser still honors explicit `lang=` and `linkLabels=` flags, so old shared URLs with `linkLabels=1` or `lang=en` remain restorable instead of being forced to the new defaults.
- Verification finding: `node --check app.js` and `git diff --check` passed. Localhost Chrome loaded `styles.css?v=312`, `print.css?v=312`, and `app.js?v=312` on `/index.html` with no query parameters.
