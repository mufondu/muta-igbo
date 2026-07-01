# Muta Igbo Central Igbo Content Rules

Primary path: Central Igbo.

Dialect support: Ogwashi-Ukwu or Enuani forms should be stored as variants, not shown as the default lesson answer unless a lesson is explicitly marked as dialect practice.

Content rules:

1. Do not add a new Igbo word directly into a screen component.
2. Add or correct vocabulary in the lesson data first.
3. Add questionable words to `content/central_igbo_vocabulary_audit.json` with a confidence level.
4. Words marked `medium` or `low` confidence need native review before audio generation.
5. Audio files should be generated only after the word is approved.

MVP policy: keep corrections small and safe. Do not attempt to standardize the whole language in one pass.
