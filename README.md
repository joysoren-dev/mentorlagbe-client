# MentorLagbe — Smart Tuition & Mentorship Platform

MentorLagbe is a full-stack, role-based EdTech and tuition management platform built with Next.js, Express, MongoDB, BetterAuth, JWT, and Stripe. It connects qualified Tutors who offer subject-wise tuition batches or 1-on-1 mentorship with Students looking for personalized academic guidance, while Admins moderate listings, users, and subscription payments.

## Live Link & Repositories
- **Live Site:** https://mentorlagbe-client-eight-phi.vercel.app/
- **Client Repository:** https://github.com/joysoren-dev/mentorlagbe-client
- **Server Repository:** https://github.com/joysoren-dev/mentorlagbe-server

## Demo / Test Credentials
- **Admin Email:** `admin@mentorlagbe.com`
- **Admin Password:** `Admin1234`
- **Tutor Email:** `demo.tutor@mentorlagbe.com`
- **Tutor Password:** `Tutor@1234`
- **Student Email:** `demo.student@mentorlagbe.com`
- **Student Password:** `Student@1234`

> **Stripe Test Mode Note:** When testing Pro Plan checkout in test mode, use standard test card numbers from the [Stripe Testing Cards Guide](https://docs.stripe.com/testing?testing-method=card-numbers#visa).

## Key Features
- **Role-Based Access & Dashboards:** Dedicated workflows and dashboards for **Students**, **Tutors**, and **Admins** with persistent sessions across page reloads.
- **Tuition Discovery & Filtering:** Browse approved and active tuitions with search and filters (subject, class level, mode), view full tuition details, and apply as a Student (with duplicate application prevention and pending application cancellation).
- **Tutor Tuition & Applicant Management:** Create tuition posts (with Free vs. Pro plan limits), edit or delete listings, toggle active/closed status, and review or update student applications.
- **Admin Moderation & Insights:** Oversee platform stats, manage user roles, approve or reject tuition listings, and track Stripe subscription transactions.
- **Stripe Pro Plan Upgrades:** Subscription checkout flow for upgrading accounts with `/payment/success` and `/payment/cancel` handling and database synchronization.
- **Responsive UI & Feedback:** Built with Next.js App Router, Tailwind CSS, `lucide-react` icons, and `sonner` toast notifications across desktop, tablet, and mobile screens.

## npm Packages Used

### Dependencies
- `next` (`16.4.6`)
- `react` (`19.3.0`)
- `react-dom` (`19.3.0`)
- `lucide-react` (`^1.77.0`)
- `sonner` (`^2.0.8`)

### Dev Dependencies
- `typescript` (`^5`)
- `tailwindcss` (`4.3.3`)
- `@tailwindcss/turbopack` (`4.3.3`)
- `eslint` (`^9`)
- `eslint-config-next` (`16.4.6`)
- `@types/node` (`^20`)
- `@types/react` (`^19`)
- `@types/react-dom` (`^19`)

## Environment Variables (`.env.local`)
Create a `.env.local` file in the root of `mentorlagbe-client` and configure the backend API URL:

```env
NEXT_PUBLIC_API_URL=https://mentorlagbe-server-silk.vercel.app
```

## Local Development Setup
```bash
npm install
npm run dev
```