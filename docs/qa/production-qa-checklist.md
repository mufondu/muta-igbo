# Mụta Igbo Production QA Checklist

Owner: Michael Ufondu  
Release track: Free Beta  
Access mode: `free_beta`  
Product focus: Central Igbo  
Last updated: 2026-07-06

---

## QA Rules

- Test on at least one small phone and one tablet-sized layout.
- Mark every item as Pass, Fail, or Blocked.
- File bugs before adding new features.
- Do not ship beta if any P0 or P1 issue remains open.
- Keep all content unlocked during beta.
- Subscription UI may exist, but beta users must not be blocked from content.

Severity guide:

| Severity | Meaning | Ship impact |
|---|---|---|
| P0 | App crash, data loss, unusable app | Must fix |
| P1 | Core learning flow broken | Must fix |
| P2 | Visual/UX issue that hurts quality | Should fix |
| P3 | Minor polish | Can defer |

---

## 1. App Launch

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open app from fresh install | App loads without red screen | Not tested |  |
| Relaunch app after closing | App resumes cleanly | Not tested |  |
| Rotate or resize simulator if applicable | Layout remains usable | Not tested |  |
| No missing asset warnings visible to user | No broken images/placeholders | Not tested |  |

---

## 2. Onboarding

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Start onboarding as new user | Onboarding opens cleanly | Not tested |  |
| Create child profile | Profile is saved | Not tested |  |
| Select avatar/profile image | Avatar appears correctly | Not tested |  |
| Complete onboarding | User lands on Home | Not tested |  |
| Restart app after onboarding | Onboarding does not repeat unnecessarily | Not tested |  |

---

## 3. Home

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Home screen loads | No clipping or broken cards | Not tested |  |
| Profile switcher opens | Profiles display correctly | Not tested |  |
| Beta badge appears | Shows Beta Access or Free Beta state | Not tested |  |
| Lesson Path entry opens | Navigates to Lesson Path | Not tested |  |
| Playroom entry opens | Navigates to Playroom | Not tested |  |
| Parent tab opens | Navigates to Parent Center | Not tested |  |

---

## 4. Lesson Path

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Lesson Path opens | Levels are visible | Not tested |  |
| All levels are accessible in beta | No level is blocked by subscription | Not tested |  |
| Central Igbo copy is shown | No Enuani/Ogwashi references | Not tested |  |
| Level cards fit on small screen | No clipped text/buttons | Not tested |  |
| Back button returns correctly | Returns to prior screen | Not tested |  |

---

## 5. Lesson Detail

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open each lesson level | Detail screen loads | Not tested |  |
| Vocabulary cards render | Igbo, English, and visuals display | Not tested |  |
| Family visuals render cleanly | No white boxes/cropped faces | Not tested |  |
| Animal/body/home visuals render | Images appear correctly | Not tested |  |
| Mụta guide banner appears | Banner is readable and not distracting | Not tested |  |
| Progress updates after activity | XP/words learned update | Not tested |  |

---

## 6. Playroom

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open Playroom | Six game cards appear | Not tested |  |
| Igbo subtitles appear under card titles | All six cards show Igbo line | Not tested |  |
| Cards use consistent flat icons | No mismatched generated art | Not tested |  |
| Tap each card | Opens correct activity | Not tested |  |
| Back from each activity | Returns to Playroom when launched from Playroom | Not tested |  |

---

## 7. Picture Match

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open Picture Match | Game loads without crash | Not tested |  |
| Tap picture then matching word | Match locks and gives feedback | Not tested |  |
| Tap wrong word | Shows retry feedback, no crash | Not tested |  |
| Complete round | Next round button appears | Not tested |  |
| Next round | New items load | Not tested |  |
| Items are visual vocabulary only | No abstract words like Easy/Hard/numbers | Not tested |  |

---

## 8. Listen & Tap

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open Listen & Tap | Game loads | Not tested |  |
| Prompt is clear | User knows what to do | Not tested |  |
| Answer selection works | Correct/wrong feedback appears | Not tested |  |
| Beta access includes full pool | Not limited to free-only content | Not tested |  |
| Back returns correctly | Returns to Playroom or previous screen | Not tested |  |

---

## 9. Word Match

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open Word Match | Game loads | Not tested |  |
| Match interaction works | Correct pair locks | Not tested |  |
| Wrong match feedback works | No crash or stuck state | Not tested |  |
| Beta access includes full pool | Not limited to free-only content | Not tested |  |
| Back returns correctly | Returns to Playroom or previous screen | Not tested |  |

---

## 10. Quiz Sprint

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open Quiz Sprint from Playroom | Quiz opens | Not tested |  |
| Quiz uses full beta pool | Premium-only lessons appear during beta | Not tested |  |
| Correct answer updates score | Score/streak updates | Not tested |  |
| Wrong answer gives feedback | User can continue | Not tested |  |
| Upgrade prompt hidden during beta | No paywall nudge appears | Not tested |  |
| Back returns to Playroom | Does not jump to Home unexpectedly | Not tested |  |

---

## 11. Story Hut

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open Story Hut | Stories list appears | Not tested |  |
| Open each story | Story detail loads | Not tested |  |
| Story content is Central Igbo aligned | No removed dialect positioning | Not tested |  |
| Back behavior works | Returns correctly | Not tested |  |

---

## 12. Progress / XP

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open XP tab | Progress screen loads | Not tested |  |
| Plan label says Free Beta | Subscription not presented as required | Not tested |  |
| XP/words/streak display | Values are visible and plausible | Not tested |  |
| Progress changes after practice | Stats update after activity | Not tested |  |

---

## 13. Parent Center / Settings

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Open Parent tab | Parent Center loads | Not tested |  |
| Profile management works | Can view/edit profile as expected | Not tested |  |
| Sound/haptics toggles work | Settings persist | Not tested |  |
| Subscription/paywall entry does not block beta | Beta remains unlocked | Not tested |  |
| Legal links open | Privacy/Terms screens load | Not tested |  |

---

## 14. Legal / Subscription Readiness

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Privacy screen opens | Copy is readable | Not tested |  |
| Terms screen opens | Copy is readable | Not tested |  |
| Subscription terms do not mislead beta users | Beta is not charged | Not tested |  |
| No company claims that are not true yet | No false LLC/company language | Not tested |  |
| No GoodRx/internal references | No employer/internal copy appears | Not tested |  |

---

## 15. Recording Studio

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Start local recording studio server | Studio opens in browser | Not tested |  |
| Manifest loads | Shows Central Igbo item count | Not tested |  |
| Manifest has zero Enuani/Ogwashi items | No blocked dialect content | Not tested |  |
| Microphone permission works | Can record preview | Not tested |  |
| QA checkboxes gate approval | Cannot approve before QA | Not tested |  |
| Download raw webm | File downloads correctly | Not tested |  |
| Processing script runs with ffmpeg | m4a output is created | Not tested |  |

---

## 16. Small Phone Layout

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Home on small screen | No clipped primary cards | Not tested |  |
| Lesson Path on small screen | Cards readable | Not tested |  |
| Playroom on small screen | Six cards usable | Not tested |  |
| Game screens on small screen | Buttons reachable | Not tested |  |
| Parent Center on small screen | No overflow blocking actions | Not tested |  |

---

## 17. Tablet Layout

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Home on tablet | Content centered, not stretched awkwardly | Not tested |  |
| Lesson Path on tablet | Layout feels intentional | Not tested |  |
| Playroom on tablet | Cards scale appropriately | Not tested |  |
| Game screens on tablet | Tap targets remain comfortable | Not tested |  |

---

## 18. Accessibility / Kid Usability

| Test | Expected result | Status | Notes |
|---|---|---|---|
| Main tap targets are at least 44px | Easy for kids to tap | Not tested |  |
| Text contrast is readable | No low-contrast key text | Not tested |  |
| Back buttons are obvious | Child/parent can recover | Not tested |  |
| Instructions are simple | No adult-only jargon in kid screens | Not tested |  |
| App works with sound off | Visual feedback still clear | Not tested |  |

---

## 19. Regression Checks

| Test | Expected result | Status | Notes |
|---|---|---|---|
| `npx tsc --noEmit` | Passes | Not tested |  |
| `npx expo start -c` | Starts cleanly | Not tested |  |
| Git working tree before release | Clean | Not tested |  |
| No translator leftovers | No Enuani translator references | Not tested |  |
| No stale playroom generated asset refs | No custom/playroom references | Not tested |  |
| Access mode check | `ACCESS_MODE` is `free_beta` | Not tested |  |

---

## Release Exit Criteria

Beta release candidate is ready only when:

- All P0/P1 issues are fixed.
- TypeScript passes.
- App launches without runtime red screen.
- Lesson Path, Playroom, and Parent Center are usable.
- All beta content is unlocked.
- No removed dialect/translator references appear.
- Privacy/Terms screens are acceptable for beta.
- Branch is pushed and tagged for beta review.
