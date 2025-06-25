# Events Components Guide

## Overview

This application has two distinct event components that serve different purposes:

## 1. Upcoming-Events Component (`/upcoming-events`)

### Purpose

- Shows **ALL upcoming events** across **ALL masjids** in the platform
- Global events listing page

### Route

```
/upcoming-events
```

### Data Source

- `eventService.getUpcomingEvents()` - fetches events from all masjids

### Use Cases

- User wants to see all events happening in the community
- "Browse All Events" functionality
- Global event discovery

### Navigation

- Accessible from Home page "View All Events" button
- Accessible from masjid-events page "View All Events" button

## 2. Masjid-Events Component (`/masjid-events/:id`)

### Purpose

- Shows events for a **SPECIFIC masjid only**
- Can be used as:
  1. **Standalone page**: `/masjid-events/:id` (where `:id` is masjid ID)
  2. **Embedded component**: Inside masjid details page

### Routes

```
/masjid-events/:id  (standalone page)
/masjid/:id         (embedded in masjid details)
```

### Data Source

- `eventService.getMasjidEvents(masjidId)` - fetches events for specific masjid

### Use Cases

- User wants to see events at a specific masjid
- Embedded in masjid details page
- Direct access to masjid-specific events

### Navigation

- Accessible from Home page masjid cards "View Events" button
- Embedded in Masjid Details page
- Has "View All Events" button to navigate to global events

## Key Differences

| Feature        | Upcoming-Events    | Masjid-Events             |
| -------------- | ------------------ | ------------------------- |
| **Scope**      | All masjids        | Single masjid             |
| **Route**      | `/upcoming-events` | `/masjid-events/:id`      |
| **Data**       | Global events      | Masjid-specific events    |
| **Usage**      | Standalone page    | Standalone + Embedded     |
| **Navigation** | From home page     | From masjid cards/details |

## Navigation Flow

```
Home Page
├── "View All Events" → /upcoming-events (all events)
└── Masjid Cards
    ├── Click card → /masjid/:id (masjid details + embedded events)
    └── "View Events" → /masjid-events/:id (standalone masjid events)

Masjid Details Page
└── Embedded masjid-events component

Masjid Events Page
└── "View All Events" → /upcoming-events (all events)
```

## When to Use Each

### Use Upcoming-Events when:

- User wants to discover all events
- User doesn't have a specific masjid in mind
- Global event browsing

### Use Masjid-Events when:

- User is interested in a specific masjid
- User wants to see events at their local masjid
- Embedded in masjid details for context
