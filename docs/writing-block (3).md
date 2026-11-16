# AI VIDEO STUDIO & INSTAGRAM AUTO PUBLISHER

# API DESIGN DOCUMENT (ADD)

**Document Number:** 04  
**Version:** 1.0  
**Date:** November 16, 2026  
**Status:** Draft for Review  
**Project Type:** Web Application  
**API Architecture:** REST API  
**Backend:** Node.js + Express.js  
**Database:** MongoDB + Mongoose  
**AI Service:** Python  
**Background Processing:** Redis + BullMQ  
**Video Processing:** FFmpeg  
**Frontend:** React + Vite  

---

# 1. INTRODUCTION

## 1.1 Purpose

This API Design Document describes the REST APIs required for the AI Video Studio & Instagram Auto Publisher application.

It defines how the frontend communicates with the backend and how the backend coordinates with the database, AI service, video-processing system, background workers, cloud storage and Instagram API.

This document includes:

- API endpoints and HTTP methods.
- Request and response formats.
- Authentication and authorization.
- Project and video management APIs.
- AI video-generation APIs.
- Video editing APIs.
- Caption and hashtag APIs.
- Instagram integration APIs.
- Publishing and scheduling APIs.
- Notifications and dashboard APIs.
- Error handling and validation.
- API security and testing requirements.

## 1.2 API Objectives

The APIs must allow users to:

1. Register and log in.
2. Create and manage video projects.
3. Generate videos from text prompts.
4. Generate videos from uploaded images.
5. Track video-generation progress.
6. Edit and export videos.
7. Generate captions, hashtags and thumbnails.
8. Connect an Instagram Creator account.
9. Publish videos manually.
10. Schedule Instagram posts.
11. Track publishing history.
12. Receive application notifications.

## 1.3 API Architecture

The application will use REST APIs.

The React frontend communicates with the Node.js Express backend. The Express backend handles authentication, validation, business logic and database operations.

Long-running tasks are processed asynchronously using BullMQ and Redis.

```text
              REACT + VITE
                   |
                   |
                Axios
                   |
                   v
          NODE.JS + EXPRESS
                   |
       +-----------+------------+
       |           |            |
       v           v            v
    MongoDB     BullMQ       Storage
               + Redis       Service
                  |
          +-------+--------+
          |                |
          v                v
      Python AI         FFmpeg
       Service        Processing
          |
          v
    Free AI Providers


          EXPRESS BACKEND
                 |
                 v
       Instagram Graph API
                 |
                 v
          INSTAGRAM
```

**Important:** The frontend communicates only with the Express backend. It must not directly communicate with AI providers using secret API keys or access Instagram using stored backend tokens.

---

# 2. API GENERAL STANDARDS

## 2.1 Base URL

During local development:

```text
http://localhost:5000/api/v1
```

Production:

```text
https://your-domain.com/api/v1
```

The actual production domain will be configured during deployment.

## 2.2 API Versioning

All public APIs will use versioning.

```text
/api/v1/
```

Example:

```text
GET /api/v1/projects
```

If breaking API changes are required in the future, a new version such as `/api/v2` can be introduced.

## 2.3 HTTP Methods

| Method | Purpose | Example |
|---|---|---|
| GET | Retrieve information | Get projects |
| POST | Create or initiate an operation | Create project |
| PUT | Replace a resource | Replace settings |
| PATCH | Partially update a resource | Update project title |
| DELETE | Delete a resource | Delete project |

## 2.4 Request Headers

Every authenticated API request must include an access token.

Example:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

For file uploads, the frontend must use:

```http
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

The browser or HTTP client should generate the multipart boundary automatically.

## 2.5 Standard Response Format

Successful API responses should follow a consistent structure.

Example:

```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": []
  }
}
```

For an asynchronous operation:

```json
{
  "success": true,
  "message": "Video generation job created successfully",
  "data": {
    "jobId": "674a40000000000000000001",
    "status": "queued"
  }
}
```

## 2.6 Date and Time Format

- Store timestamps in UTC.
- Return timestamps in ISO 8601 format.
- Display dates and times according to the user's selected timezone.
- Scheduled publishing requests must clearly identify the timezone used to interpret the requested time.

Example:

```text
2026-11-20T10:30:00.000Z
```

## 2.7 Pagination

Project, video, publishing-history and notification listing APIs should support pagination.

Example:

```http
GET /api/v1/projects?page=1&limit=10
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3
    }
  }
}
```

The backend must validate page numbers and enforce a maximum page size.

---

# 3. AUTHENTICATION APIs

Authentication APIs manage user registration, login, logout and profile information.

Passwords will be hashed using bcrypt. Authentication will use JWT.

## 3.1 User Registration

**Endpoint:**

```http
POST /api/v1/auth/register
```

**Purpose:**

Creates a new user account.

**Request Body:**

```json
{
  "name": "Saribala",
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

**Backend Workflow:**

1. Receive registration details.
2. Validate name, email and password.
3. Check whether the email already exists.
4. Hash the password using bcrypt.
5. Create a user document in MongoDB.
6. Return the registered user information.

**Success Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "674a10000000000000000001",
      "name": "Saribala",
      "email": "user@example.com"
    }
  }
}
```

**Possible Status Codes:**

- `201` – User created.
- `400` – Invalid input.
- `409` – Email already registered.
- `500` – Internal server error.

## 3.2 User Login

**Endpoint:**

```http
POST /api/v1/auth/login
```

**Purpose:**

Authenticates an existing user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

**Backend Workflow:**

1. Find the user using the email address.
2. Verify the password using bcrypt.
3. Check whether the account is active.
4. Generate an access JWT.
5. Return the authenticated user information.

**Success Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "674a10000000000000000001",
      "name": "Saribala",
      "email": "user@example.com"
    },
    "accessToken": "<jwt_access_token>",
    "expiresIn": 3600
  }
}
```

The example uses a one-hour access-token lifetime. The actual lifetime will be configurable.

A refresh-token mechanism may be implemented using a secure HttpOnly cookie to maintain sessions safely.

## 3.3 User Logout

**Endpoint:**

```http
POST /api/v1/auth/logout
```

**Purpose:**

Ends the user's authenticated session.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Backend Workflow:**

1. Validate the authenticated session.
2. Revoke or invalidate the refresh-token session, if implemented.
3. Clear the refresh-token cookie, if used.
4. Return a logout confirmation.

**Success Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

If access-token revocation is required before its expiry, the implementation must use an appropriate revocation strategy.

## 3.4 Get User Profile

**Endpoint:**

```http
GET /api/v1/auth/me
```

**Purpose:**

Returns the currently authenticated user's profile.

**Success Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "674a10000000000000000001",
      "name": "Saribala",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

## 3.5 Update User Profile

**Endpoint:**

```http
PATCH /api/v1/auth/me
```

**Request Body:**

```json
{
  "name": "Updated Name"
}
```

Only permitted profile fields can be updated through this endpoint.

---

# 4. PROJECT MANAGEMENT APIs

Project APIs allow users to create, retrieve, update and delete video projects.

Each project belongs to one authenticated user.

## 4.1 Create Project

**Endpoint:**

```http
POST /api/v1/projects
```

**Request Body:**

```json
{
  "title": "Lord Shiva Video Collection",
  "description": "Devotional video collection",
  "language": "Telugu",
  "projectType": "text-to-video"
}
```

**Backend Workflow:**

1. Authenticate the user.
2. Validate project information.
3. Create a project document.
4. Associate the project with the authenticated user's ID.
5. Return the created project.

**Success Response:**

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": "674a20000000000000000001",
      "title": "Lord Shiva Video Collection",
      "language": "Telugu",
      "projectType": "text-to-video",
      "status": "active"
    }
  }
}
```

## 4.2 Get All Projects

**Endpoint:**

```http
GET /api/v1/projects?page=1&limit=10
```

**Purpose:**

Retrieves projects belonging to the authenticated user.

**Success Response:**

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "674a20000000000000000001",
        "title": "Lord Shiva Video Collection",
        "language": "Telugu",
        "status": "active"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

## 4.3 Get Project by ID

**Endpoint:**

```http
GET /api/v1/projects/:projectId
```

Example:

```http
GET /api/v1/projects/674a20000000000000000001
```

The backend must verify project ownership before returning the project.

## 4.4 Update Project

**Endpoint:**

```http
PATCH /api/v1/projects/:projectId
```

**Request Body:**

```json
{
  "title": "Updated Devotional Video Collection",
  "description": "Updated project description"
}
```

## 4.5 Delete Project

**Endpoint:**

```http
DELETE /api/v1/projects/:projectId
```

**Purpose:**

Deletes or archives the selected project according to the application's deletion policy.

The backend must verify ownership and handle related media and job records safely.

**Success Response:**

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

# 5. MEDIA UPLOAD APIs

Media upload APIs handle images required for image-to-video generation and other supported media operations.

Video and image files must be stored in external cloud storage, not directly inside MongoDB documents.

MongoDB stores media metadata and storage references.

## 5.1 Upload Image

**Endpoint:**

```http
POST /api/v1/media/images
```

**Content Type:**

```http
multipart/form-data
```

**Form Fields:**

```text
file: image.jpg
projectId: 674a20000000000000000001
```

**Backend Workflow:**

1. Authenticate the user.
2. Validate the image file.
3. Check file size and supported format.
4. Verify project ownership.
5. Upload the image to configured cloud storage.
6. Store the media reference and metadata.
7. Return the uploaded image information.

**Success Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "mediaId": "674a90000000000000000001",
    "fileName": "image.jpg",
    "mediaType": "image",
    "storageReference": "storage-reference/image-001"
  }
}
```

The actual storage provider and upload limits will be configured according to the selected free storage service.

## 5.2 Delete Uploaded Media

**Endpoint:**

```http
DELETE /api/v1/media/:mediaId
```

The backend must verify ownership and ensure the media is not currently required by an active processing job.

---

# 6. AI VIDEO GENERATION APIs

This is one of the most important modules of the application.

The system supports:

- Text-to-video generation.
- Image-to-video generation.
- Short video generation.
- Long video generation through scene-based processing.
- Telugu and English content.
- Automatic fallback between compatible free AI providers.

Video generation must run asynchronously because AI generation can take a long time.

## 6.1 Generate Video from Text

**Endpoint:**

```http
POST /api/v1/videos/generate/text
```

**Request Body:**

```json
{
  "projectId": "674a20000000000000000001",
  "title": "Lord Shiva Meditation",
  "prompt": "Create a cinematic video of Lord Shiva meditating in the Himalayas.",
  "language": "Telugu",
  "videoType": "short",
  "duration": 45,
  "aspectRatio": "9:16"
}
```

**Backend Workflow:**

1. Authenticate the user.
2. Validate the project ID.
3. Verify project ownership.
4. Validate prompt, language, duration and aspect ratio.
5. Check available free AI providers.
6. Confirm provider eligibility and quota.
7. Create a generation job in MongoDB.
8. Add the task to BullMQ.
9. Return the job ID immediately.
10. A worker processes the job asynchronously.

**Success Response:**

HTTP status: `202 Accepted`

```json
{
  "success": true,
  "message": "Video generation started",
  "data": {
    "jobId": "674a40000000000000000001",
    "status": "queued",
    "progress": 0
  }
}
```

## 6.2 Generate Video from Image

**Endpoint:**

```http
POST /api/v1/videos/generate/image
```

**Request Body:**

```json
{
  "projectId": "674a20000000000000000001",
  "mediaId": "674a90000000000000000001",
  "title": "Mountain Animation",
  "prompt": "Animate the mountains with moving clouds and cinematic camera movement.",
  "language": "English",
  "videoType": "short",
  "duration": 30,
  "aspectRatio": "9:16"
}
```

**Backend Workflow:**

1. Authenticate the user.
2. Validate project ownership.
3. Validate uploaded media ownership.
4. Check whether an eligible image-to-video provider exists.
5. Create a generation job.
6. Add the task to BullMQ.
7. Return the job ID.
8. Worker processes the image-to-video request.

**Success Response:**

```json
{
  "success": true,
  "message": "Image-to-video generation started",
  "data": {
    "jobId": "674a40000000000000000002",
    "status": "queued",
    "progress": 0
  }
}
```

## 6.3 Generate Long Videos

Long videos may require multiple AI generation requests.

For example, a five-minute video may be divided into multiple scenes.

**Endpoint:**

```http
POST /api/v1/videos/generate/long
```

**Request Body:**

```json
{
  "projectId": "674a20000000000000000001",
  "title": "Complete Lord Shiva Story",
  "prompt": "Create a complete cinematic story about Lord Shiva.",
  "language": "Telugu",
  "duration": 300,
  "aspectRatio": "16:9"
}
```

**Backend Workflow:**

1. Validate the requested duration.
2. Divide the video into scenes.
3. Create a generation job.
4. Generate individual scenes using compatible free providers.
5. Store completed scene references.
6. Merge the scenes using FFmpeg.
7. Save the final video to cloud storage.
8. Update the video and job records.
9. Create a notification.

**Important:** Actual duration depends on available AI model capabilities and free-service limits.

## 6.4 Get Generation Job Status

**Endpoint:**

```http
GET /api/v1/generation-jobs/:jobId
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "674a40000000000000000001",
      "status": "processing",
      "progress": 65,
      "jobType": "text-to-video",
      "attempts": 1,
      "errorMessage": null
    }
  }
}
```

Possible job statuses:

- `pending`
- `queued`
- `processing`
- `completed`
- `failed`
- `paused`
- `cancelled`

Progress must remain between 0 and 100.

## 6.5 Get Generation Job History

**Endpoint:**

```http
GET /api/v1/generation-jobs?page=1&limit=10
```

Returns generation jobs belonging to the authenticated user.

## 6.6 Cancel Generation Job

**Endpoint:**

```http
POST /api/v1/generation-jobs/:jobId/cancel
```

The backend should cancel the queued or active task when supported.

If the external AI provider cannot cancel an already submitted request, the backend must prevent its result from being incorrectly attached to a cancelled job.

**Success Response:**

```json
{
  "success": true,
  "message": "Generation cancellation requested"
}
```

## 6.7 Retry Failed Generation

**Endpoint:**

```http
POST /api/v1/generation-jobs/:jobId/retry
```

The backend must check:

- Whether the original job failed.
- Whether retry limits permit another attempt.
- Whether an eligible free provider is available.
- Whether the user still owns the job.

The system must not retry indefinitely when provider quotas are exhausted.

---

# 7. VIDEO MANAGEMENT APIs

Video APIs manage generated videos and saved media.

## 7.1 Get All Videos

**Endpoint:**

```http
GET /api/v1/videos?page=1&limit=10
```

Optional filters may include:

```http
GET /api/v1/videos?projectId=674a20000000000000000001&status=completed
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "674a30000000000000000001",
        "title": "Lord Shiva Meditation",
        "videoType": "short",
        "generationType": "text-to-video",
        "language": "Telugu",
        "duration": 45,
        "aspectRatio": "9:16",
        "status": "completed",
        "videoUrl": "storage-reference/video-001",
        "thumbnailUrl": "storage-reference/thumb-001"
      }
    ]
  }
}
```

## 7.2 Get Video by ID

**Endpoint:**

```http
GET /api/v1/videos/:videoId
```

Returns video details after ownership validation.

## 7.3 Update Video Details

**Endpoint:**

```http
PATCH /api/v1/videos/:videoId
```

**Request Body:**

```json
{
  "title": "Updated Video Title"
}
```

## 7.4 Delete Video

**Endpoint:**

```http
DELETE /api/v1/videos/:videoId
```

The backend must check whether the video is being used by an active publishing job before deleting its media.

---

# 8. VIDEO EDITING APIs

The video-editing module uses FFmpeg for supported operations.

Heavy editing operations must execute through background workers.

## 8.1 Trim Video

**Endpoint:**

```http
POST /api/v1/videos/:videoId/edit/trim
```

**Request Body:**

```json
{
  "startTime": 5,
  "endTime": 35
}
```

**Purpose:**

Creates a trimmed version of the selected video.

## 8.2 Crop Video

**Endpoint:**

```http
POST /api/v1/videos/:videoId/edit/crop
```

**Request Body:**

```json
{
  "aspectRatio": "9:16"
}
```

## 8.3 Add Text to Video

**Endpoint:**

```http
POST /api/v1/videos/:videoId/edit/text
```

**Request Body:**

```json
{
  "text": "Welcome to my channel",
  "position": "bottom",
  "fontSize": 32
}
```

## 8.4 Add Subtitles

**Endpoint:**

```http
POST /api/v1/videos/:videoId/edit/subtitles
```

**Request Body:**

```json
{
  "language": "Telugu",
  "subtitleFileId": "674a90000000000000000002",
  "burnIntoVideo": true
}
```

The subtitle file must be validated before processing.

## 8.5 Add Voiceover or Background Audio

**Endpoint:**

```http
POST /api/v1/videos/:videoId/edit/audio
```

**Request Body:**

```json
{
  "audioMediaId": "674a90000000000000000003",
  "audioType": "voiceover",
  "volume": 0.8
}
```

## 8.6 Merge Video Scenes

**Endpoint:**

```http
POST /api/v1/videos/:videoId/edit/merge
```

**Request Body:**

```json
{
  "sceneVideoIds": [
    "674a30000000000000000001",
    "674a30000000000000000002"
  ]
}
```

The backend must verify that all referenced videos belong to the same authenticated user and are eligible for merging.

## 8.7 Export Edited Video

**Endpoint:**

```http
POST /api/v1/videos/:videoId/export
```

**Request Body:**

```json
{
  "format": "mp4",
  "resolution": "1080p",
  "aspectRatio": "9:16"
}
```

**Response:**

HTTP status: `202 Accepted`

```json
{
  "success": true,
  "message": "Video export started",
  "data": {
    "jobId": "674a40000000000000000003",
    "status": "queued"
  }
}
```

The frontend can use the job-status API to track export progress.

---

# 9. AI CONTENT ASSISTANCE APIs

These APIs provide additional content-generation functionality.

They will use only compatible and verified free services.

## 9.1 Generate Video Script

**Endpoint:**

```http
POST /api/v1/ai/scripts/generate
```

**Request Body:**

```json
{
  "topic": "Lord Shiva",
  "language": "Telugu",
  "duration": 60,
  "style": "storytelling"
}
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "script": "Generated video script..."
  }
}
```

## 9.2 Generate Caption

**Endpoint:**

```http
POST /api/v1/ai/captions/generate
```

**Request Body:**

```json
{
  "videoId": "674a30000000000000000001",
  "language": "Telugu",
  "description": "A devotional video about Lord Shiva."
}
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "caption": "శివుని అనుగ్రహం మనందరిపై ఉండాలి..."
  }
}
```

The user must be able to edit the generated caption before publishing.

## 9.3 Generate Hashtags

**Endpoint:**

```http
POST /api/v1/ai/hashtags/generate
```

**Request Body:**

```json
{
  "topic": "Lord Shiva",
  "language": "English",
  "count": 10
}
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "hashtags": [
      "#LordShiva",
      "#Mahadev",
      "#Shiva",
      "#Devotional",
      "#Spirituality"
    ]
  }
}
```

## 9.4 Translate Caption

**Endpoint:**

```http
POST /api/v1/ai/translate
```

**Request Body:**

```json
{
  "text": "Lord Shiva is the symbol of peace.",
  "sourceLanguage": "English",
  "targetLanguage": "Telugu"
}
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "translatedText": "శివుడు శాంతికి ప్రతీక."
  }
}
```

## 9.5 Generate Thumbnail

**Endpoint:**

```http
POST /api/v1/ai/thumbnails/generate
```

**Request Body:**

```json
{
  "videoId": "674a30000000000000000001",
  "prompt": "Create a cinematic devotional thumbnail.",
  "language": "English"
}
```

The system may use a compatible free image-generation service or extract a frame from the video using FFmpeg.

---

# 10. AI PROVIDER MANAGEMENT APIs

The AI provider module checks provider availability, free-tier eligibility and quota status.

The backend is responsible for selecting the provider.

The React frontend must never select or directly call a provider using private credentials.

## 10.1 Get Available AI Providers

**Endpoint:**

```http
GET /api/v1/ai/providers
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "674a50000000000000000001",
        "providerName": "Hugging Face",
        "providerType": "cloud-ai",
        "enabled": true,
        "freeTierEligible": true,
        "supportedTasks": [
          "text-to-video"
        ],
        "availabilityStatus": "available",
        "quotaStatus": "available"
      }
    ]
  }
}
```

Provider credentials must never appear in this response.

## 10.2 Check Provider Availability

**Endpoint:**

```http
GET /api/v1/ai/providers/status
```

Returns the latest known provider availability and quota information.

The backend may refresh provider information through scheduled health checks.

## 10.3 Provider Selection Workflow

Provider selection happens internally.

```text
       Generation Request
               |
               v
      Check Provider List
               |
               v
     Verify Free Eligibility
               |
               v
        Check Quota
               |
        +------+------+
        |             |
      Available     Unavailable
        |             |
        v             v
   Select Provider  Try Another
        |             |
        v             v
   Submit Request  Check Remaining
        |           Providers
        v
   Process Result
```

**Important rules:**

1. Only verified free-eligible providers can be selected.
2. Provider credentials remain on the backend.
3. Paid providers must never be selected automatically.
4. If all eligible providers are unavailable, stop generation.
5. Notify the user when free quota is exhausted.
6. Provider fallback must be limited to compatible tasks.
7. Provider errors and retry attempts must be recorded.

Provider configuration and administrative changes will be managed internally in the initial personal-use version. Public APIs must not expose secret configuration controls.

---

# 11. INSTAGRAM INTEGRATION APIs

The application will use the official Meta Instagram Graph API.

Only one eligible Instagram Creator account is required for the initial version.

Instagram authorization tokens must be encrypted before storage and must never be returned to the frontend.

## 11.1 Connect Instagram Account

**Endpoint:**

```http
GET /api/v1/instagram/connect
```

**Purpose:**

Starts the Meta authorization flow.

**Backend Workflow:**

1. Authenticate the application user.
2. Generate a secure OAuth state value.
3. Store the state temporarily.
4. Construct the Meta authorization URL.
5. Redirect the user to Meta authorization.

The backend must validate the OAuth state during the callback to prevent CSRF attacks.

## 11.2 Instagram OAuth Callback

**Endpoint:**

```http
GET /api/v1/instagram/callback
```

**Purpose:**

Receives the authorization result from Meta.

**Backend Workflow:**

1. Receive the authorization code and state.
2. Validate the state.
3. Exchange the authorization code using the configured Meta OAuth flow.
4. Retrieve the authorized Instagram account information.
5. Encrypt the access token.
6. Store the account details in MongoDB.
7. Mark the account as connected.
8. Redirect the user back to the frontend.

The precise OAuth parameters, token exchange and required permissions must follow the supported Meta API configuration at implementation time.

**Example Frontend Result:**

```text
/settings/instagram?connection=success
```

Tokens must not be placed in the redirect URL.

## 11.3 Get Connected Instagram Account

**Endpoint:**

```http
GET /api/v1/instagram/account
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "account": {
      "id": "674a60000000000000000001",
      "username": "example_creator",
      "accountType": "CREATOR",
      "isConnected": true,
      "connectedAt": "2026-11-15T09:00:00.000Z"
    }
  }
}
```

## 11.4 Disconnect Instagram Account

**Endpoint:**

```http
DELETE /api/v1/instagram/account
```

**Backend Workflow:**

1. Identify the authenticated user.
2. Find the connected Instagram account.
3. Revoke or invalidate authorization where supported.
4. Remove or invalidate stored credentials.
5. Mark the account as disconnected.
6. Return confirmation.

**Success Response:**

```json
{
  "success": true,
  "message": "Instagram account disconnected successfully"
}
```

## 11.5 Check Instagram Connection

**Endpoint:**

```http
GET /api/v1/instagram/status
```

Returns whether the account is connected and whether its authorization is still valid.

---

# 12. INSTAGRAM PUBLISHING APIs

Publishing APIs handle manual publishing, automatic publishing and scheduled publishing.

The backend must validate video readiness, Instagram account authorization and media requirements before submitting a post.

## 12.1 Publish Video Manually

**Endpoint:**

```http
POST /api/v1/instagram/publish
```

**Request Body:**

```json
{
  "videoId": "674a30000000000000000001",
  "caption": "A beautiful devotional video about Lord Shiva.",
  "hashtags": [
    "#LordShiva",
    "#Mahadev",
    "#Devotional"
  ],
  "publishType": "manual"
}
```

**Backend Workflow:**

1. Authenticate the user.
2. Verify video ownership.
3. Verify video completion.
4. Verify Instagram account connection.
5. Validate caption and media.
6. Create a publish job.
7. Add the publishing task to BullMQ.
8. Return the job information.
9. Publishing worker communicates with Meta.
10. Save the publishing result.

**Success Response:**

HTTP status: `202 Accepted`

```json
{
  "success": true,
  "message": "Publishing request accepted",
  "data": {
    "publishJobId": "674a70000000000000000001",
    "status": "processing"
  }
}
```

## 12.2 Schedule Instagram Post

**Endpoint:**

```http
POST /api/v1/instagram/schedule
```

**Request Body:**

```json
{
  "videoId": "674a30000000000000000001",
  "caption": "A beautiful devotional video.",
  "hashtags": [
    "#LordShiva",
    "#Devotional"
  ],
  "publishType": "scheduled",
  "scheduledAt": "2026-11-20T10:30:00.000Z",
  "timezone": "Asia/Kolkata"
}
```

**Backend Workflow:**

1. Authenticate the user.
2. Verify video ownership.
3. Validate the video.
4. Verify Instagram account connection.
5. Validate the future publishing time.
6. Store the scheduled publishing job.
7. Schedule the task using BullMQ.
8. Return the scheduled job information.

**Success Response:**

```json
{
  "success": true,
  "message": "Instagram post scheduled successfully",
  "data": {
    "publishJobId": "674a70000000000000000002",
    "status": "scheduled",
    "scheduledAt": "2026-11-20T10:30:00.000Z",
    "timezone": "Asia/Kolkata"
  }
}
```

The backend must remain available at the scheduled time for reliable automatic execution.

## 12.3 Automatic Publishing

Automatic publishing must only be enabled after explicit user consent and configuration.

**Endpoint:**

```http
POST /api/v1/instagram/automatic-publishing
```

**Request Body:**

```json
{
  "enabled": true
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Automatic publishing preference updated",
  "data": {
    "enabled": true
  }
}
```

The automatic-publishing preference must be persisted. The implementation must add the required setting to the user data model or introduce a dedicated settings collection before this endpoint is implemented.

Automatic publishing must not bypass user approval requirements or configured publishing rules.

## 12.4 Get Publishing History

**Endpoint:**

```http
GET /api/v1/instagram/publishing-history?page=1&limit=10
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "publishJobs": [
      {
        "id": "674a70000000000000000001",
        "videoId": "674a30000000000000000001",
        "publishType": "manual",
        "status": "published",
        "publishedAt": "2026-11-16T09:00:00.000Z",
        "instagramMediaId": "123456789"
      }
    ]
  }
}
```

## 12.5 Get Publishing Job Status

**Endpoint:**

```http
GET /api/v1/instagram/publish-jobs/:jobId
```

Returns the status of an individual publishing job.

Possible statuses:

- `draft`
- `scheduled`
- `processing`
- `published`
- `failed`
- `cancelled`

## 12.6 Cancel Scheduled Post

**Endpoint:**

```http
POST /api/v1/instagram/publish-jobs/:jobId/cancel
```

The backend must verify that the publishing job is owned by the user and has not already been published.

## 12.7 Retry Failed Publishing Job

**Endpoint:**

```http
POST /api/v1/instagram/publish-jobs/:jobId/retry
```

The backend must check the previous failure, account authorization, retry limits and duplicate-publishing safeguards before retrying.

## 12.8 Instagram Publishing Rules

- Use only the official Meta API.
- Validate media against current Instagram requirements.
- Use an accessible media URL as required by Meta.
- Check token validity before publishing.
- Record the Instagram media ID after successful publication.
- Prevent duplicate submissions.
- Store useful failure information.
- Follow Meta API rate limits and permissions.

Publishing availability is subject to Meta's current API eligibility, account configuration and permissions.

---

# 13. DASHBOARD APIs

The dashboard displays a summary of the user's application activity.

## 13.1 Get Dashboard Statistics

**Endpoint:**

```http
GET /api/v1/dashboard/stats
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "totalProjects": 10,
    "totalVideos": 25,
    "completedVideos": 18,
    "processingVideos": 2,
    "draftVideos": 3,
    "publishedVideos": 5,
    "scheduledVideos": 2
  }
}
```

Statistics must be calculated using records belonging to the authenticated user.

## 13.2 Get Recent Activities

**Endpoint:**

```http
GET /api/v1/dashboard/recent-activities
```

Returns recent project, generation and publishing activity.

---

# 14. NOTIFICATION APIs

Notifications inform the user about generation and publishing events.

## 14.1 Get Notifications

**Endpoint:**

```http
GET /api/v1/notifications?page=1&limit=10
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "674a80000000000000000001",
        "title": "Video Generated Successfully",
        "message": "Your devotional video is ready.",
        "type": "video-completed",
        "isRead": false,
        "createdAt": "2026-11-16T09:00:00.000Z"
      }
    ]
  }
}
```

## 14.2 Mark Notification as Read

**Endpoint:**

```http
PATCH /api/v1/notifications/:notificationId/read
```

**Success Response:**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## 14.3 Mark All Notifications as Read

**Endpoint:**

```http
PATCH /api/v1/notifications/read-all
```

## 14.4 Delete Notification

**Endpoint:**

```http
DELETE /api/v1/notifications/:notificationId
```

Every notification operation must verify ownership.

---

# 15. INTERNAL PYTHON AI SERVICE APIs

The Python service is responsible for integrating cloud AI providers.

It is an internal service and must not be exposed as a public frontend API.

The Node.js backend communicates with it through internal HTTP requests.

The internal endpoints below represent the proposed service contract.

## 15.1 Generate Video

```http
POST /internal/v1/generate/video
```

Example request:

```json
{
  "jobId": "674a40000000000000000001",
  "generationType": "text-to-video",
  "prompt": "A cinematic video of mountains",
  "language": "English",
  "duration": 30,
  "aspectRatio": "9:16"
}
```

## 15.2 Generate Image-to-Video

```http
POST /internal/v1/generate/image-to-video
```

Example request:

```json
{
  "jobId": "674a40000000000000000002",
  "imageReference": "storage-reference/image-001",
  "prompt": "Animate the clouds and mountains"
}
```

## 15.3 Generate Text Content

```http
POST /internal/v1/generate/text
```

This endpoint can support script, caption, hashtag and translation operations through an operation type and validated input.

## 15.4 Check Provider Health

```http
GET /internal/v1/providers/health
```

Returns provider availability information.

## 15.5 Internal Service Responsibilities

The Python service must:

1. Receive validated generation requests.
2. Select a compatible eligible free provider.
3. Check current provider availability and quota.
4. Generate video or text content.
5. Handle provider failures.
6. Return results or structured errors.
7. Never switch automatically to paid providers.
8. Avoid exposing provider credentials.

Internal service communication must be authenticated and restricted to trusted backend components.

---

# 16. API ERROR HANDLING

The application must return consistent error responses.

## 16.1 Standard Error Response

```json
{
  "success": false,
  "message": "Project not found",
  "error": {
    "code": "PROJECT_NOT_FOUND"
  }
}
```

For validation errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  }
}
```

## 16.2 HTTP Status Codes

| Status Code | Meaning | Example |
|---|---|---|
| 200 | OK | Data retrieved or updated |
| 201 | Created | Project created |
| 202 | Accepted | Video generation started |
| 204 | No Content | Successful deletion without response body |
| 400 | Bad Request | Invalid request |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Project or video not found |
| 409 | Conflict | Duplicate resource or conflicting operation |
| 413 | Payload Too Large | Uploaded file exceeds limit |
| 415 | Unsupported Media Type | Unsupported file format |
| 422 | Unprocessable Entity | Valid request structure but invalid operation data |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected backend error |
| 502 | Bad Gateway | External service failure |
| 503 | Service Unavailable | Provider or service unavailable |
| 504 | Gateway Timeout | External service timeout |

## 16.3 Application Error Codes

| Error Code | Meaning |
|---|---|
| AUTH_INVALID_CREDENTIALS | Incorrect login details |
| AUTH_TOKEN_EXPIRED | JWT expired |
| USER_ALREADY_EXISTS | Email already registered |
| PROJECT_NOT_FOUND | Project not found |
| VIDEO_NOT_FOUND | Video not found |
| JOB_NOT_FOUND | Job not found |
| PROVIDER_UNAVAILABLE | No compatible provider available |
| FREE_QUOTA_EXHAUSTED | Free quota exhausted |
| GENERATION_FAILED | Video generation failed |
| STORAGE_LIMIT_REACHED | Storage capacity exhausted |
| INSTAGRAM_NOT_CONNECTED | Instagram account not connected |
| INSTAGRAM_TOKEN_EXPIRED | Instagram authorization expired |
| INSTAGRAM_PUBLISH_FAILED | Publishing operation failed |
| DUPLICATE_PUBLISH_REQUEST | Duplicate publishing request |
| VALIDATION_ERROR | Request validation failed |

The API must not expose internal stack traces, secrets, provider credentials or sensitive third-party error details to the frontend.

---

# 17. API SECURITY

Security must be applied consistently across all API modules.

## 17.1 Authentication Middleware

All protected routes must use authentication middleware.

Example:

```javascript
router.get(
  "/projects",
  authenticateUser,
  getProjects
);
```

The middleware must:

1. Read the JWT from the Authorization header.
2. Verify the token.
3. Identify the authenticated user.
4. Attach the user information to the request.
5. Reject invalid or expired tokens.

## 17.2 Authorization and Ownership

Every private resource must be checked against the authenticated user's ID.

Example:

```javascript
const project = await Project.findOne({
  _id: projectId,
  userId: req.user.id
});
```

This prevents a user from accessing another user's projects by changing an ObjectId.

Ownership checks are required for:

- Projects.
- Videos.
- Generation jobs.
- Uploaded media.
- Publishing jobs.
- Notifications.

## 17.3 Password Security

- Use bcrypt for password hashing.
- Never store plain-text passwords.
- Never return password hashes.
- Validate password strength.
- Avoid revealing whether an email exists during sensitive authentication errors where appropriate.

## 17.4 Instagram Token Security

- Encrypt Instagram access tokens before storing them.
- Keep encryption keys outside MongoDB.
- Never return tokens to React.
- Never log tokens.
- Handle token expiration and invalidation.
- Restrict token access to trusted backend components.

## 17.5 API Rate Limiting

Apply rate limits to sensitive and resource-intensive endpoints.

Examples:

- Login.
- Registration.
- File uploads.
- Video generation.
- AI content generation.
- Instagram publishing.

Rate limits must protect the application and avoid accidental exhaustion of free service quotas.

## 17.6 File Upload Security

- Validate MIME type and file extension.
- Check actual file content where possible.
- Enforce file-size limits.
- Reject unsupported formats.
- Generate safe storage names.
- Prevent path traversal.
- Verify ownership before using uploaded files.

## 17.7 CORS

Configure CORS to allow only the frontend origins required by the application.

## 17.8 HTTPS

All production API communication must use HTTPS.

## 17.9 Secret Management

The following values must remain in backend environment variables or an appropriate secret store:

- MongoDB connection string.
- JWT secret.
- AI provider API keys.
- Instagram application credentials.
- Instagram token encryption key.
- Internal service authentication secrets.
- Storage credentials.

They must never be committed to Git or included in frontend builds.

---

# 18. API VALIDATION RULES

The backend must validate all incoming requests.

| Field | Validation |
|---|---|
| Name | Required, non-empty string |
| Email | Valid email format |
| Password | Required, minimum configured strength |
| Project title | Required |
| Project language | Telugu or English |
| Project type | text-to-video or image-to-video |
| Prompt | Required for text-to-video |
| Media ID | Must reference valid owned media |
| Video duration | Positive and within configured limits |
| Aspect ratio | Supported configured value |
| Job progress | 0–100 |
| Publish type | manual, automatic or scheduled |
| Scheduled date | Valid future date when scheduling |
| Caption | Valid text within configured limits |
| Hashtags | Valid array of strings |
| Notification isRead | Boolean |

Validation limits must be configurable and must respect the selected AI model, storage service and Instagram publishing requirements.

---

# 19. API WORKFLOW SUMMARY

## 19.1 Complete Video Generation Workflow

```text
             USER
               |
               v
         Create Project
               |
               v
        Enter Text Prompt
               |
               v
       React Calls Express API
               |
               v
       Validate User + Input
               |
               v
      Create Generation Job
               |
               v
       Add Job to BullMQ
               |
               v
       Background Worker
               |
               v
        Python AI Service
               |
               v
       Check Free Providers
               |
               v
        Generate Video
               |
               v
       Store Video in Cloud
               |
               v
       Save Video in MongoDB
               |
               v
       Update Job to Completed
               |
               v
       Create Notification
               |
               v
       Frontend Displays Video
```

## 19.2 Complete Instagram Publishing Workflow

```text
            USER
              |
              v
        Select Final Video
              |
              v
       Add Caption + Hashtags
              |
              v
       Select Publishing Type
              |
       +------+------+
       |      |      |
       v      v      v
     Manual  Auto  Schedule
       |      |      |
       +------+------+
              |
              v
      Express Validates Request
              |
              v
      Check Instagram Connection
              |
              v
       Create Publish Job
              |
              v
       Add Job to BullMQ
              |
              v
      Publishing Background Worker
              |
              v
       Instagram Graph API
              |
        +-----+------+
        |            |
        v            v
      Success      Failure
        |            |
        v            v
    Save Media ID  Save Error
        |            |
        +-----+------+
              |
              v
        Create Notification
              |
              v
       Update Publishing Status
```

---

# 20. API ENDPOINT SUMMARY

The following table provides a quick reference for the planned public API endpoints.

| Module | Method | Endpoint |
|---|---|---|
| Authentication | POST | `/auth/register` |
| Authentication | POST | `/auth/login` |
| Authentication | POST | `/auth/logout` |
| Authentication | GET | `/auth/me` |
| Authentication | PATCH | `/auth/me` |
| Projects | POST | `/projects` |
| Projects | GET | `/projects` |
| Projects | GET | `/projects/:projectId` |
| Projects | PATCH | `/projects/:projectId` |
| Projects | DELETE | `/projects/:projectId` |
| Media | POST | `/media/images` |
| Media | DELETE | `/media/:mediaId` |
| Generation | POST | `/videos/generate/text` |
| Generation | POST | `/videos/generate/image` |
| Generation | POST | `/videos/generate/long` |
| Generation Jobs | GET | `/generation-jobs` |
| Generation Jobs | GET | `/generation-jobs/:jobId` |
| Generation Jobs | POST | `/generation-jobs/:jobId/cancel` |
| Generation Jobs | POST | `/generation-jobs/:jobId/retry` |
| Videos | GET | `/videos` |
| Videos | GET | `/videos/:videoId` |
| Videos | PATCH | `/videos/:videoId` |
| Videos | DELETE | `/videos/:videoId` |
| Editing | POST | `/videos/:videoId/edit/trim` |
| Editing | POST | `/videos/:videoId/edit/crop` |
| Editing | POST | `/videos/:videoId/edit/text` |
| Editing | POST | `/videos/:videoId/edit/subtitles` |
| Editing | POST | `/videos/:videoId/edit/audio` |
| Editing | POST | `/videos/:videoId/edit/merge` |
| Editing | POST | `/videos/:videoId/export` |
| AI Content | POST | `/ai/scripts/generate` |
| AI Content | POST | `/ai/captions/generate` |
| AI Content | POST | `/ai/hashtags/generate` |
| AI Content | POST | `/ai/translate` |
| AI Content | POST | `/ai/thumbnails/generate` |
| AI Providers | GET | `/ai/providers` |
| AI Providers | GET | `/ai/providers/status` |
| Instagram | GET | `/instagram/connect` |
| Instagram | GET | `/instagram/callback` |
| Instagram | GET | `/instagram/account` |
| Instagram | GET | `/instagram/status` |
| Instagram | DELETE | `/instagram/account` |
| Publishing | POST | `/instagram/publish` |
| Publishing | POST | `/instagram/schedule` |
| Publishing | POST | `/instagram/automatic-publishing` |
| Publishing | GET | `/instagram/publishing-history` |
| Publishing | GET | `/instagram/publish-jobs/:jobId` |
| Publishing | POST | `/instagram/publish-jobs/:jobId/cancel` |
| Publishing | POST | `/instagram/publish-jobs/:jobId/retry` |
| Dashboard | GET | `/dashboard/stats` |
| Dashboard | GET | `/dashboard/recent-activities` |
| Notifications | GET | `/notifications` |
| Notifications | PATCH | `/notifications/:notificationId/read` |
| Notifications | PATCH | `/notifications/read-all` |
| Notifications | DELETE | `/notifications/:notificationId` |

Internal Python service endpoints are documented separately in Section 15 and are not public frontend APIs.

---

# 21. API TESTING STRATEGY

All APIs must be tested before integration with the React frontend.

## 21.1 Testing Tools

Suggested tools:

- Postman.
- Thunder Client.
- Jest.
- Supertest.
- MongoDB test database.

## 21.2 Authentication Testing

Test cases:

1. Register a new user.
2. Register using an existing email.
3. Login with valid credentials.
4. Login with invalid credentials.
5. Access a protected API without a token.
6. Access a protected API with an invalid token.
7. Logout and verify session behavior.

## 21.3 Project Testing

Test cases:

1. Create a project.
2. Retrieve all projects.
3. Retrieve a project by ID.
4. Update project details.
5. Delete a project.
6. Attempt to access another user's project.

## 21.4 Video Generation Testing

Test cases:

1. Generate a video using a text prompt.
2. Generate a video using an uploaded image.
3. Submit an invalid prompt.
4. Submit an unsupported image.
5. Track generation progress.
6. Cancel a generation job.
7. Retry a failed generation.
8. Test provider unavailability.
9. Test free quota exhaustion.
10. Confirm that no paid provider is selected automatically.

## 21.5 Video Editing Testing

Test cases:

1. Trim a video.
2. Crop a video.
3. Add text.
4. Add subtitles.
5. Add voiceover.
6. Merge scenes.
7. Export an edited video.
8. Handle FFmpeg failures.

## 21.6 Instagram Testing

Test cases:

1. Connect an eligible Instagram Creator account.
2. Complete OAuth authorization.
3. Retrieve connected account information.
4. Disconnect the account.
5. Publish a supported video manually.
6. Schedule a future post.
7. Cancel a scheduled post.
8. Handle expired authorization.
9. Handle Meta API failures.
10. Prevent duplicate publishing.

Testing must distinguish mock responses from real AI generation and real Instagram publishing.

## 21.7 Notification Testing

Test cases:

1. Generate a video successfully and create a notification.
2. Fail a generation job and create a notification.
3. Publish successfully and create a notification.
4. Fail publishing and create a notification.
5. Mark a notification as read.
6. Retrieve notifications belonging to the authenticated user only.

---

# 22. API IMPLEMENTATION FOLDER STRUCTURE

The proposed Express backend structure is:

```text
server/
│
├── config/
│   ├── db.js
│   ├── redis.js
│   └── storage.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── project.controller.js
│   ├── media.controller.js
│   ├── video.controller.js
│   ├── generation.controller.js
│   ├── editing.controller.js
│   ├── ai.controller.js
│   ├── instagram.controller.js
│   ├── publish.controller.js
│   ├── dashboard.controller.js
│   └── notification.controller.js
│
├── services/
│   ├── auth.service.js
│   ├── project.service.js
│   ├── media.service.js
│   ├── video.service.js
│   ├── generation.service.js
│   ├── editing.service.js
│   ├── ai.service.js
│   ├── instagram.service.js
│   ├── publish.service.js
│   └── notification.service.js
│
├── routes/
│   ├── auth.routes.js
│   ├── project.routes.js
│   ├── media.routes.js
│   ├── video.routes.js
│   ├── generation.routes.js
│   ├── editing.routes.js
│   ├── ai.routes.js
│   ├── instagram.routes.js
│   ├── publish.routes.js
│   ├── dashboard.routes.js
│   └── notification.routes.js
│
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── Video.js
│   ├── GenerationJob.js
│   ├── AIProvider.js
│   ├── InstagramAccount.js
│   ├── PublishJob.js
│   └── Notification.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── upload.middleware.js
│   ├── validation.middleware.js
│   └── rateLimit.middleware.js
│
├── queues/
│   ├── generation.queue.js
│   ├── editing.queue.js
│   └── publishing.queue.js
│
├── workers/
│   ├── generation.worker.js
│   ├── editing.worker.js
│   └── publishing.worker.js
│
├── integrations/
│   ├── ai/
│   │   └── pythonClient.js
│   ├── instagram/
│   │   └── metaClient.js
│   └── storage/
│       └── storageClient.js
│
├── validators/
│   ├── auth.validator.js
│   ├── project.validator.js
│   ├── video.validator.js
│   └── publish.validator.js
│
├── utils/
│   ├── generateToken.js
│   ├── encryptToken.js
│   └── apiResponse.js
│
├── tests/
│
├── app.js
└── server.js
```

The Python AI service will maintain its own separate project structure.

---

# 23. DESIGN DECISIONS AND IMPORTANT NOTES

## 23.1 Asynchronous Processing

Video generation, video editing, exporting and publishing are background operations.

The Express API should not wait for these operations to finish.

Instead:

1. Create a job.
2. Add it to BullMQ.
3. Return a job ID.
4. Process it through a worker.
5. Update MongoDB with the result.
6. Allow the frontend to check the job status.

## 23.2 Duplicate Request Prevention

The application must avoid duplicate video-generation and Instagram-publishing operations.

Use an idempotency mechanism for operations where retrying the same request could create duplicate work.

For publishing, enforce a unique operation identity and check the publishing job state before sending another request to Meta.

## 23.3 Storage Strategy

- Store video and image files in external cloud storage.
- Store only media references and metadata in MongoDB.
- Use temporary files during FFmpeg processing.
- Remove temporary files when no longer needed.
- Verify storage capacity and free-tier limits.

## 23.4 Free AI Provider Policy

The backend must never silently switch to a paid AI provider.

When all eligible free providers are unavailable or their quotas are exhausted, the application must stop generation and notify the user.

## 23.5 Instagram Publishing Reliability

A successful API request does not necessarily mean a post has been published.

The publishing worker must follow the supported Meta publishing workflow, verify completion and record the returned Instagram media ID.

The application must not report a post as published until successful publication is confirmed.

## 23.6 API Documentation

The APIs should eventually be documented using OpenAPI/Swagger.

This will provide:

- Endpoint descriptions.
- Request schemas.
- Response schemas.
- Authentication requirements.
- Example requests.
- Error responses.

---

# 24. FUTURE API ENHANCEMENTS

The following APIs may be introduced in future versions:

| Module | Future API |
|---|---|
| Analytics | Instagram performance analytics |
| Templates | Reusable video templates |
| Accounts | Multiple Instagram accounts |
| Social Media | YouTube and Facebook publishing |
| Editing | Advanced timeline editing |
| Notifications | Real-time WebSocket notifications |
| User Settings | Advanced user preferences |
| History | Detailed editing history |

These are not mandatory for the initial MVP.

---

# 25. FINAL API DESIGN SUMMARY

The API layer will connect all the major modules of the AI Video Studio & Instagram Auto Publisher application.

The Express backend will expose REST APIs to the React frontend.

The backend will communicate with:

- MongoDB for application data.
- Redis and BullMQ for background jobs.
- Python for AI provider integration.
- FFmpeg for video processing.
- Cloud storage for media files.
- Meta Instagram Graph API for publishing.

The API design supports:

1. User authentication.
2. Project management.
3. Image uploads.
4. Text-to-video generation.
5. Image-to-video generation.
6. Long-video scene generation.
7. Generation progress tracking.
8. Video editing and exporting.
9. Captions and hashtags.
10. Telugu and English content.
11. Free AI provider selection and fallback.
12. Instagram account connection.
13. Manual publishing.
14. Automatic publishing.
15. Scheduled publishing.
16. Publishing history.
17. Notifications.
18. Dashboard statistics.

The API design follows the requirements established in the SRS, the architecture defined in the SADD and the data structure defined in the DBDD.

**END OF DOCUMENT 04 — API DESIGN DOCUMENT (ADD)**

**Version:** 1.0  
**Status:** Draft for Review