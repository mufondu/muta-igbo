# Mụta Friends Avatar System

This patch replaces the two-avatar model with a small cast of reusable child-friendly Igbo characters.

## Goals

- Give siblings different profile identities.
- Keep every child avatar Igbo-themed and kid-friendly.
- Use one avatar renderer across onboarding, home, games, and settings.
- Preserve backward compatibility with old saved emoji avatars.

## Included Friends

Girls: Ada, Amara, Chioma, Ifeoma

Boys: Chinedu, Obinna, Kelechi, Ebuka

## Implementation

- Avatar metadata lives in `src/data/avatars.ts`.
- Profile avatar values now use stable IDs such as `ada`, `amara`, and `chinedu`.
- Legacy emoji avatar values are normalized so existing local profiles still render correctly.
- `ProfileImage` is reused across onboarding, settings, and the home/game shell.

## Product Rule

Add new characters slowly. Prefer 8 to 12 polished recurring characters over dozens of inconsistent one-off avatars.
