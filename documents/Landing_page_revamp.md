Vestis – Frontend Product & UX Specification

Audience: Frontend Developer
Purpose: Build a clear, conversion-focused landing page + basic app surfaces
Status: V1 (Source of Truth)

1. Product Overview (Read This First)
What Vestis Is

Vestis is a B2B SaaS tool for fashion sellers that helps them create realistic clothing try-on visuals and simple mini stores to sell better on Instagram and WhatsApp.

Vestis replaces photoshoots, not sellers, not checkout, not conversations.

What Vestis Is NOT

Not an e-commerce marketplace

Not a payment processor

Not a creative design studio

Not a consumer app

Do not design it like Shopify, Canva, or a fashion brand website.

2. Target User (Critical for UX Decisions)
Primary User

Fashion sellers

Sell via Instagram & WhatsApp

Often low-tech

Cost-sensitive

Care about trust, speed, and sales, not tools

Geography

Tanzania (initially Dar es Salaam & Arusha)

User Mindset

“Will this help my customers trust me?”

“Is this simple?”

“Can I use this without learning tech?”

Design must feel:

Simple

Obvious

Non-technical

Mobile-first

3. Core Problem We Are Solving

Customers don’t trust flat-lay or mannequin photos.

Because of this:

Buyers hesitate

Ask many questions

Delay or don’t buy

Photoshoots are:

Expensive

Slow

Inaccessible to most sellers

Frontend must communicate trust visually, not verbally.

4. Core Value Proposition (Do Not Deviate)

Upload clothing photos → show them on real models → customers trust → sellers sell more

That’s the entire product logic.

5. Primary User Flow (High Level)
Seller Flow

Seller lands on website

Instantly understands:

What Vestis does

Who it’s for

Clicks “Try It” / “Create Try-On”

Signs up

Uploads clothing photo

Receives try-on images

Shares images or mini store link

Buyer Flow (Indirect)

Buyer sees shared image or store link

Browses visuals

Contacts seller directly (WhatsApp / Instagram)

Frontend should never imply checkout or payments.

6. Landing Page Goals
Primary Goal

Get the right sellers to click “Try It”

Secondary Goals

Remove confusion

Build trust

Show proof visually

What the Landing Page Is NOT

A long explanation

A feature list

A technical breakdown

7. Landing Page Structure (Exact Order)
1. Hero Section

Purpose: 7-second understanding

Must communicate:

Visual try-on

No photoshoot

For selling clothes online

Elements:

Headline (short, bold)

1 supporting line

Primary CTA

No long paragraphs.

2. Visual Proof Section

Purpose: Trust without words

Elements:

Before → After visuals

Real outputs (not stock)

Minimal or no text

Images do the selling.

3. How It Works

Purpose: Remove friction

Structure:

3 steps

Icons + short labels only

Example:

Upload clothes

Get try-on images

Share & sell

No explanations.

4. Who It’s For

Purpose: Self-qualification

Short bullet list:

Instagram sellers

WhatsApp businesses

Boutiques / tailors

Avoid corporate language.

5. Mini Store Explanation

Purpose: Clarify without overpromising

Must show:

Seller gets a simple catalog

Buyers browse

Buyers contact seller directly

No checkout UI.
No “Buy Now” language.

6. Trust Clarifier

Purpose: Reduce fear

Clear statements:

No commissions

No payment handling

Seller owns customers

This section is important for adoption.

7. CTA (Repeat)

Purpose: Action

Same CTA as hero.
Do not invent new actions.

8. Tone & Language Rules (Very Important)
Use

Simple English

Short sentences

Everyday words

Avoid

“AI studio”

“All-in-one”

“Enterprise”

“Revolutionary”

“Next-gen”

If a fashion seller wouldn’t say it, don’t use it.

9. Visual Design Guidelines
Overall Feel

Clean

Trustworthy

Minimal

Human

Avoid

Fashion-editorial luxury look

Tech-heavy dashboards on landing

Over-animation

Priorities

Images

Spacing

Readability

Mobile usability

Mobile experience is not optional.

10. Technical Notes for Frontend
Performance

Landing page must load fast on mobile networks

Optimize images heavily

Responsiveness

Mobile first

Desktop secondary

Accessibility

Large tap targets

Readable fonts

High contrast

11. Things Frontend Developer Should NOT Decide Alone

Do not:

Add new features

Add checkout flows

Add pricing logic to landing page

Reword value proposition creatively

When unsure → ask product owner.

12. Success Criteria (How We Know It’s Working)

Landing page is successful if:

Users understand product without explanation

Fewer “What does this do?” questions

More sellers reach signup

Less bounce from first screen

Clarity > beauty.

Final Note (Important)

This product wins by being:

Obvious

Focused

Trust-first

If the UI starts to feel “clever,” it’s wrong.