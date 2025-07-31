# Admin Page Implementation Plan

## Requirements

- Display all photos from the API
- Show approve and reject buttons for each photo
- Modern, clean UI design
- Responsive layout

## Data Structure

Based on the schema, each photo has:

- id: string
- title: string
- slug: string
- url: string (required)
- tags: JSON
- height: number
- width: number
- approved: boolean (default: false)
- rejected: boolean (default: false)
- featured: boolean (default: false)
- userId: string (reference to users)
- createdAt: timestamp
- updatedAt: timestamp

## Implementation Approach

### 1. Data Fetching

- Use `useFetch` to get photos from `/api/photo/get-all`
- Transform data to match the MasonryComp interface if needed

### 2. UI Components

- Create custom card component for each photo with:
  - Photo image
  - Title (if available)
  - User information
  - Approve/Reject buttons
  - Status indicators (approved/rejected)

### 3. Button Functionality

- Approve button (primary style)
- Reject button (destructive style)
- Pending status indicator

### 4. Styling

- Use Tailwind CSS for modern design
- Consistent with existing UI components
- Responsive grid layout

## Component Structure

```vue
<template>
  <div class="admin-page">
    <h1 class="text-3xl font-bold mb-6">Photo Approval Dashboard</h1>

    <!-- Loading state -->
    <MasonryLoadingComp v-if="status === 'pending'" />

    <!-- Error state -->
    <div v-if="status === 'error'" class="text-red-500">
      {{ error }}
    </div>

    <!-- Photo grid -->
    <div v-if="status === 'success'" class="photo-grid"></div>
  </div>
</template>
```

## Photo Item Structure

Each photo item should have:

- id: string
- img: string (photo URL)
- url: string (link to photo page)
- height: number
- width: number (optional)
- title: string (optional)
- user: { username: string, picture: string }
- approved: boolean
- rejected: boolean

## Button Actions

- Approve: Set approved=true, rejected=false
- Reject: Set rejected=true, approved=false

## API Endpoints Needed

- GET `/api/photo/get-all` (already exists)
- POST `/api/photo/{id}/approve` (needs to be created)
- POST `/api/photo/{id}/reject` (needs to be created)
