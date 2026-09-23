# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by the project brief: a single Node.js/Express application serving a modern same-origin frontend, backed by PostgreSQL. The implementation should remain simple to operate on Render and portable to a VPS.

## Users

- Visitors use the public catalog to discover active books, inspect availability, and decide what to request in person at reception.
- Up to two library administrators maintain books and internal user records, register physical loans and returns, and review operational history.

## Product Purpose

Translate the Biblioteca Pública Municipal into a welcoming digital catalog and a dependable, low-complexity circulation tool for a single physical library. Success means visitors can find useful catalog information quickly and administrators can keep availability and loan history correct without specialist training.

## Positioning

This is not a generic online bookstore or reservation platform. It joins a public discovery experience rooted in the real Santa Cruz municipal library with a deliberately small internal workflow for loans made face-to-face.

## Operating Context

- Borrowing and returning happen physically at the library reception.
- Public visitors do not create accounts, log in, reserve books, or request loans online.
- Administrators commonly search people by name or CI and books by title or author while serving someone at the desk.
- The catalog is expected to hold roughly 1,000 titles with low daily activity.
- Neon PostgreSQL is authoritative; a process-local cache serves public catalog reads.

## Capabilities and Constraints

- One book row represents a title and its total/available copy counts; there is no per-copy inventory.
- Books have controlled multiple genres, optional ISBNs, soft deletion, and optional Cloudinary cover images.
- Internal library users have no passwords; CI is required and unique, and inactive users cannot receive new loans.
- Loan creation and return are transactional and update only the affected cached book after commit.
- Sessions use same-origin, HTTP-only cookies in one Express process.
- No reservations, payments, notifications, public authentication, microservices, Redis, queues, or multi-branch support.
- Deployment target is Render; secrets remain in environment variables.

## Brand Commitments

The experience must feel warm, welcoming, contemporary, and unmistakably connected to the physical municipal library. The supplied banner and building photograph are visual references, not claims that an exact font has been identified.

## Evidence on Hand

- Authoritative product specification: `CODEX.md`.
- Municipal banner: `references/banner.jpg`.
- Physical library photograph: `references/frontis.jpg`.
- Initial representative records and two local covers: `seed/`.
- No testimonials, usage metrics, opening hours, contact details, or other public claims are supplied and none should be fabricated.

## Product Principles

1. Keep PostgreSQL authoritative and circulation changes transactionally correct.
2. Make public discovery inviting while keeping in-person borrowing explicit.
3. Optimize the administration area for quick, clear reception-desk work.
4. Prefer maintainable, proportionate architecture over infrastructure complexity.
5. Preserve historical records through deactivation rather than deletion.

## Accessibility & Inclusion

Use semantic HTML, keyboard-accessible interactions, visible focus, properly labelled forms, useful cover alternatives, responsive layouts, and readable contrast on desktop, tablet, and mobile.
