# AI VIDEO STUDIO & INSTAGRAM AUTO PUBLISHER
## System Architecture Design Document (SADD)

**Document Number:** 02  
**Version:** 1.0  
**Date:** November 15, 2026  
**Status:** Draft for Review  
**Architecture:** MERN Stack + Python AI Service + FFmpeg

---

# 1. Introduction

## 1.1 Purpose

This document describes the technical architecture of the AI Video Studio & Instagram Auto Publisher.

It explains the major system components, their responsibilities, communication methods, data flow, AI integration, video processing, Instagram integration, security, and deployment strategy.

## 1.2 Project Overview

The application will allow one personal user to:

- Generate videos from text prompts.
- Generate videos from uploaded images.
- Create short and long videos.
- Generate videos in Telugu and English.
- Add AI voiceovers, captions, and subtitles.
- Edit and preview generated videos.
- Generate thumbnails and hashtags.
- Save and manage video projects.
- Connect one Instagram Creator account.
- Publish videos manually or automatically.
- Schedule Instagram posts.
- Track publishing status and generation history.

## 1.3 Architecture Goals

1. Use the MERN stack for the main web application.
2. Integrate eligible free cloud AI services.
3. Avoid paid API usage and unexpected charges.
4. Support provider fallback when another eligible free provider is available.
5. Process long videos using individual scenes.
6. Keep video generation and publishing tasks separate from normal user requests.
7. Protect user information and Instagram access tokens.
8. Make the application modular and maintainable.

---

# 2. High-Level System Architecture

The application follows a modular architecture with five major layers:

1. Frontend Layer
2. Backend Layer
3. AI Service Layer
4. Video Processing Layer
5. Database and Storage Layer

## 2.1 Architecture Diagram

```text
                   USER
                    |
                    v
          +---------------------+
          |   React Frontend    |
          |   (Vite + CSS)      |
          +---------------------+
                    |
              REST API / HTTPS
                    |
                    v
          +---------------------+
          |  Node.js + Express  |
          |    Main Backend     |
          +---------------------+
                    |
       +------------+-------------+
       |            |             |
       v            v             v
 +-----------+ +-----------+ +------------+
 | Auth      | | Project   | | Instagram  |
 | Module    | | Module    | | Module     |
 +-----------+ +-----------+ +------------+
       |            |             |
       +------------+-------------+
                    |
                    v
          +---------------------+
          | Background Job     |
          | Queue (BullMQ)     |
          +---------------------+
                    |
          +---------+----------+
          |                    |
          v                    v
 +------------------+  +------------------+
 | Python AI Service|  | Video Processing |
 |                  |  | FFmpeg           |
 +------------------+  +------------------+
          |                    |
          v                    v
 +------------------+  +------------------+
 | Free Cloud AI    |  | Final Video      |
 | Providers        |  | Output           |
 +------------------+  +------------------+
          |                    |
          +---------+----------+
                    |
                    v
          +---------------------+
          | MongoDB + Storage   |
          +---------------------+
                    |
                    v
          +---------------------+
          | Instagram Graph API |
          +---------------------+
```

The diagram represents logical components. Some services may run in the same deployment or on separate free hosting services, depending on available free-tier limits.

---

# 3. Frontend Architecture

## 3.1 Technology

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Tailwind CSS (optional)
- Axios
- React Router

## 3.2 Frontend Responsibilities

The frontend provides the user interface for the entire application.

It communicates with the Node.js backend through REST APIs.

### Main frontend pages

| Page | Responsibility |
|---|---|
| Login | User authentication |
| Register | Account creation |
| Dashboard | Overview of projects and activity |
| AI Video Studio | Text-to-video and image-to-video |
| Video Editor | Editing generated videos |
| Project Library | Saved projects and videos |
| Instagram Settings | Connect Instagram account |
| Publishing | Manual publishing and scheduling |
| Publishing History | Track published and failed posts |
| Settings | Application configuration |

## 3.3 Frontend Folder Structure

```text
client/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── VideoCard.jsx
│   │   ├── VideoPlayer.jsx
│   │   ├── Loading.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── VideoStudio.jsx
│   │   ├── VideoEditor.jsx
│   │   ├── Projects.jsx
│   │   ├── Instagram.jsx
│   │   ├── Publishing.jsx
│   │   ├── History.jsx
│   │   └── Settings.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── videoService.js
│   │   └── instagramService.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

## 3.4 Frontend Workflow

1. User opens the application.
2. User logs in.
3. React validates the user's session.
4. User selects the video generation option.
5. User enters a prompt or uploads an image.
6. Frontend sends the request to the backend.
7. Backend creates a generation job.
8. Frontend displays the job status.
9. When processing finishes, the generated video is displayed.
10. User can edit, save, download, or publish it.

---

# 4. Backend Architecture

## 4.1 Technology

- Node.js
- Express.js
- JavaScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Axios

## 4.2 Backend Responsibilities

The backend acts as the central controller of the application.

It handles:

- Authentication and authorization.
- Project creation and management.
- Video generation requests.
- AI provider selection.
- Provider quota and availability checks.
- Job creation and tracking.
- Video editing requests.
- Instagram authentication.
- Publishing and scheduling.
- Notifications and error handling.

## 4.3 Backend Folder Structure

```text
server/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── videoController.js
│   ├── projectController.js
│   ├── instagramController.js
│   └── publishController.js
│
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── Video.js
│   ├── AIProvider.js
│   ├── PublishJob.js
│   └── InstagramAccount.js
│
├── routes/
│   ├── authRoutes.js
│   ├── videoRoutes.js
│   ├── projectRoutes.js
│   ├── instagramRoutes.js
│   └── publishRoutes.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── uploadMiddleware.js
│
├── services/
│   ├── aiProviderService.js
│   ├── videoService.js
│   ├── storageService.js
│   ├── instagramService.js
│   └── notificationService.js
│
├── jobs/
│   ├── videoQueue.js
│   ├── publishQueue.js
│   └── scheduler.js
│
├── utils/
│   ├── tokenUtils.js
│   └── freeTierGuard.js
│
├── app.js
├── server.js
└── package.json
```

## 4.4 Backend Request Flow

Example: Text-to-video request.

1. React sends the prompt to Express.
2. Express checks user authentication.
3. Backend validates the prompt and video settings.
4. Backend checks free-provider availability.
5. Backend creates a generation job.
6. Job is sent to the background queue.
7. Worker communicates with the AI service.
8. Generated video is passed to video processing.
9. Output is saved to configured storage.
10. Job status is updated in MongoDB.
11. Frontend displays the completed video.

---

# 5. AI Service Architecture

## 5.1 Purpose

The Python AI service manages communication with cloud-based AI models.

Python is used because many AI services provide Python SDKs and HTTP interfaces.

The AI service will not run large AI models locally. It will communicate with eligible free cloud providers.

## 5.2 Supported AI Operations

| Operation | Purpose |
|---|---|
| Text-to-video | Generate video from a text prompt |
| Image-to-video | Animate an uploaded image |
| Text-to-speech | Generate voiceovers |
| Speech/subtitle processing | Assist with captions |
| Translation | Translate prompts when required |
| Thumbnail assistance | Generate or prepare thumbnail assets |
| Hashtag generation | Suggest relevant hashtags |

The actual supported operations depend on the capabilities and current free-tier access of the selected models.

## 5.3 AI Provider Integration

Potential providers will be evaluated before integration.

Examples to investigate:

- Hugging Face Inference Providers
- Other cloud AI services with a genuinely free eligible tier
- Free open-source models exposed through eligible cloud endpoints

A provider will only be enabled if its pricing and usage rules satisfy the project's no-charge requirement.

## 5.4 Provider Selection Workflow

```text
        Generation Request
                |
                v
       Check Provider A
                |
        +-------+-------+
        |               |
      Available       Unavailable
        |               |
        v               v
    Generate       Check Provider B
        |               |
        v          +----+----+
     Success       |         |
                Available  Unavailable
                   |         |
                   v         v
                Generate   Pause Job
                   |         |
                   v         v
                Success   Notify User
```

## 5.5 Free-Tier Protection

The system must:

- Check provider eligibility before making requests.
- Track available free quota where the provider exposes it.
- Avoid providers requiring payment.
- Disable paid fallback.
- Never automatically upgrade an account.
- Stop requests when the free quota is exhausted.
- Notify the user when all eligible providers are unavailable.
- Record provider errors and usage information.

**Important:** Free quotas and model availability can change. The application must never assume that a provider will remain free or offer unlimited generation.

## 5.6 Python Service Structure

```text
ai-service/
│
├── app/
│   ├── main.py
│   ├── routes/
│   │   ├── text_to_video.py
│   │   ├── image_to_video.py
│   │   ├── voiceover.py
│   │   └── captions.py
│   │
│   ├── providers/
│   │   ├── base_provider.py
│   │   ├── huggingface_provider.py
│   │   └── provider_manager.py
│   │
│   ├── services/
│   │   ├── generation_service.py
│   │   ├── translation_service.py
│   │   └── quota_service.py
│   │
│   └── utils/
│       └── validation.py
│
└── requirements.txt
```

---

# 6. Video Processing Architecture

## 6.1 Technology

- FFmpeg
- Python
- Cloud storage
- Node.js job workers

## 6.2 Video Processing Responsibilities

FFmpeg will handle video operations such as:

- Combining scenes.
- Adding voiceovers.
- Adding background audio when available and authorized.
- Adding subtitles and captions.
- Resizing and converting video formats.
- Trimming and merging clips.
- Preparing supported Instagram video formats.
- Extracting thumbnails.

## 6.3 Short Video Workflow

```text
Prompt or Image
      |
      v
AI Generation
      |
      v
Generated Clip
      |
      v
FFmpeg Processing
      |
      v
Captions + Voiceover
      |
      v
Final Short Video
```

## 6.4 Long Video Workflow

Long videos will be generated scene by scene because a single AI request may not support the required duration.

```text
       User Prompt
            |
            v
     Generate Script
            |
            v
     Divide into Scenes
            |
            v
   Generate Each Scene
            |
            v
    Collect Scene Clips
            |
            v
      FFmpeg Merge
            |
            v
    Add Audio/Captions
            |
            v
     Final Long Video
```

The application must check actual model duration limits before generating each scene.

## 6.5 Video Editing

The video editor will initially support:

- Trimming.
- Clip merging.
- Captions and subtitles.
- Voiceover replacement.
- Basic audio adjustment.
- Aspect-ratio conversion.
- Thumbnail selection.

Advanced professional editing features are outside the initial project scope.

---

# 7. Background Job Architecture

## 7.1 Why Background Jobs Are Needed

Video generation can take a long time.

If all processing happens inside a normal HTTP request, the request may time out.

Therefore, the application will use background jobs.

## 7.2 Technology

- Redis
- BullMQ
- Node.js workers

These components will be used only if an eligible free hosting arrangement is available.

## 7.3 Job Types

1. Video generation job.
2. Image-to-video job.
3. Video editing job.
4. Thumbnail generation job.
5. Instagram publishing job.
6. Scheduled publishing job.

## 7.4 Job Status

Each job can have one of these statuses:

| Status | Meaning |
|---|---|
| Pending | Waiting to start |
| Queued | Added to processing queue |
| Processing | Currently running |
| Completed | Successfully finished |
| Failed | Processing failed |
| Paused | Waiting for provider or resource availability |
| Cancelled | Cancelled by the user |

## 7.5 Retry Strategy

- Retry temporary network failures within a configured limit.
- Do not repeatedly retry quota-exhausted providers.
- Do not retry invalid prompts indefinitely.
- Prevent duplicate Instagram publishing.
- Pause jobs when no eligible free provider is available.

---

# 8. Database Architecture

## 8.1 Database Technology

MongoDB with Mongoose.

## 8.2 Main Collections

| Collection | Responsibility |
|---|---|
| users | User account information |
| projects | Video project details |
| videos | Generated video information |
| aiProviders | Provider configuration and status |
| generationJobs | AI generation task history |
| instagramAccounts | Connected Instagram account details |
| publishJobs | Publishing and scheduling records |
| notifications | User notifications |

## 8.3 Database Relationships

- One user can own multiple projects.
- One project can contain multiple videos.
- One video can have multiple generation or editing records.
- One user can connect one Instagram Creator account.
- One Instagram account can have multiple publishing records.
- Each generation job references its project and output video where applicable.

The detailed collection fields, validation rules, indexes, and relationship design will be provided in **Document 3 – Database Design Document**.

---

# 9. Storage Architecture

## 9.1 Storage Requirements

The application needs storage for:

- Uploaded images.
- Generated videos.
- Edited videos.
- Thumbnails.
- Audio files.
- Temporary processing files.

## 9.2 Storage Strategy

Use a free cloud storage option only after checking:

- Free storage capacity.
- File size restrictions.
- Download and bandwidth limits.
- File retention rules.
- Public or temporary media URL support.
- Terms of service.

Temporary files should be removed after processing when they are no longer needed.

The application must not depend on temporary hosting URLs for permanent project storage.

## 9.3 Storage Flow

```text
User Upload
    |
    v
Backend Validation
    |
    v
Cloud Storage
    |
    v
AI / Video Processing
    |
    v
Final Video Storage
    |
    v
Video Library
```

---

# 10. Instagram Integration Architecture

## 10.1 Integration Technology

Official Meta Instagram Graph API.

The application will connect one eligible Instagram Creator account.

## 10.2 Instagram Responsibilities

- Connect the Instagram account.
- Manage authorization.
- Store access tokens securely.
- Prepare supported video media.
- Publish manually.
- Publish automatically.
- Schedule publishing.
- Track publishing status.

## 10.3 Instagram Connection Flow

```text
User Selects Connect Instagram
             |
             v
       Meta Authorization
             |
             v
       User Grants Access
             |
             v
      Backend Receives
      Authorization Result
             |
             v
      Secure Token Storage
             |
             v
       Account Connected
```

## 10.4 Publishing Flow

```text
       Final Video
            |
            v
      User Approves Post
            |
            v
    Validate Media Format
            |
            v
    Check Instagram Access
            |
            v
    Prepare Accessible URL
            |
            v
    Instagram Media Upload
            |
            v
    Publish Through API
            |
            v
    Save Publishing Result
```

## 10.5 Important Instagram Requirements

- The account must satisfy Meta's current API eligibility requirements.
- The user must authorize the required permissions.
- The Meta developer application must be configured correctly.
- The media must satisfy Instagram's current publishing requirements.
- The media URL must be accessible to Meta.
- Token expiration and renewal must be handled.
- Publishing must be recorded to prevent duplicate posts.

Instagram API access and permissions are subject to Meta approval and policy changes. Automatic publishing cannot be guaranteed until the account and application are successfully configured and tested.

---

# 11. Scheduling Architecture

The scheduler will manage future publishing tasks.

Example:

1. User selects a video.
2. User chooses a date and time.
3. Backend validates the schedule.
4. A publishing job is created.
5. The scheduler checks due jobs.
6. The publishing worker sends the video to Instagram.
7. The result is stored in MongoDB.
8. The user receives a success or failure notification.

The backend must remain available at the scheduled time. A hosting service that sleeps or stops background workers may not support reliable automatic publishing.

The system must show the configured timezone clearly.

---

# 12. Security Architecture

Security is important because the application stores user credentials and Instagram authorization data.

## 12.1 Authentication

- Use bcrypt for password hashing.
- Use JWT for authentication.
- Protect private routes with authentication middleware.
- Validate incoming requests.

## 12.2 API Security

- Use HTTPS in deployment.
- Validate and sanitize input.
- Configure CORS.
- Apply request rate limits.
- Keep secrets in environment variables.
- Never expose API keys in React frontend code.

## 12.3 Instagram Security

- Store access tokens on the backend only.
- Encrypt sensitive tokens where practical.
- Never expose tokens in API responses.
- Handle token expiration.
- Allow the user to disconnect the account.

## 12.4 File Security

- Validate file type and size.
- Restrict upload formats.
- Use unique file names.
- Avoid executing uploaded files.
- Protect access to private videos.

---

# 13. Notification Architecture

The system will notify the user about:

- Video generation started.
- Video generation completed.
- Video generation failed.
- Free quota exhausted.
- No free AI provider available.
- Instagram account disconnected.
- Publishing successful.
- Publishing failed.
- Scheduled post completed.

Initial notifications can appear inside the application. Email or browser notifications may be added if a suitable free service is available.

---

# 14. Deployment Architecture

## 14.1 Proposed Deployment

| Component | Technology | Deployment consideration |
|---|---|---|
| Frontend | React + Vite | Free static hosting |
| Backend | Node + Express | Free application hosting |
| AI service | Python | Free cloud hosting, if available |
| Database | MongoDB Atlas | Eligible free cluster |
| Queue | Redis + BullMQ | Free Redis service, if available |
| Video processing | FFmpeg | Hosting must support FFmpeg |
| Storage | Cloud storage | Eligible free storage |
| Instagram | Meta API | Official API access |

All hosting and provider choices must be checked against their current terms, quotas, and billing settings before deployment.

## 14.2 Environment Configuration

The application will use environment variables.

Example backend configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret

AI_PROVIDER_API_KEY=your_eligible_free_provider_key

REDIS_URL=your_redis_connection

META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=your_redirect_url

STORAGE_URL=your_storage_configuration
```

These are placeholders. Actual secrets must never be committed to GitHub.

## 14.3 Strict No-Charge Deployment Rules

The deployment must follow these rules:

1. Do not enable paid API plans.
2. Do not use pay-as-you-go services.
3. Do not automatically upgrade hosting plans.
4. Set billing alerts or spending controls wherever available.
5. Disable services that require payment.
6. Stop processing when free resources are exhausted.
7. Notify the user instead of silently switching to a paid provider.

A free hosting label does not guarantee that every feature, worker, storage operation, or bandwidth transfer is free.

---

# 15. Error Handling and Reliability

The system must handle:

- AI provider unavailable.
- AI quota exhausted.
- Invalid video prompts.
- Upload failures.
- Video processing errors.
- Storage failures.
- Redis connection failures.
- Instagram authorization errors.
- Instagram publishing failures.
- Expired access tokens.
- Scheduler downtime.

Errors should be logged with enough information for debugging, without exposing passwords, tokens, or API secrets.

---

# 16. Architecture Decisions

| Decision | Selected approach | Reason |
|---|---|---|
| Frontend | React + Vite | Component-based UI |
| Backend | Node + Express | REST API and business logic |
| Database | MongoDB | Flexible document storage |
| AI integration | Python service | AI provider integration |
| Video processing | FFmpeg | Video editing and merging |
| Background jobs | BullMQ | Long-running tasks |
| Queue storage | Redis | Job coordination |
| Authentication | JWT + bcrypt | User authentication |
| Instagram | Official Meta API | Supported publishing workflow |
| Storage | Eligible free cloud storage | Video and image storage |

---

# 17. Scalability and Future Improvements

The initial system is designed for personal use.

Future improvements may include:

- Multiple social media accounts.
- Additional social media platforms.
- More AI providers.
- Advanced video editing.
- More subtitle styles.
- Better Telugu voice generation.
- Advanced analytics.
- Improved project organization.
- More notification options.

These improvements are not required for the initial version.

---

# 18. Risks and Limitations

| Risk | Solution |
|---|---|
| Free AI quota exhausted | Pause and notify |
| AI provider unavailable | Try another eligible free provider |
| Long video takes too long | Process scene by scene |
| Free storage limit reached | Stop new uploads and notify |
| Hosting sleeps | Use a suitable always-available worker or explain scheduling limitations |
| Instagram permissions unavailable | Provide manual publishing workflow |
| Telugu output quality varies | Test Telugu models before selecting them |
| Video processing exceeds hosting resources | Limit video size and duration |

The project cannot promise unlimited AI generation, unlimited video storage, or uninterrupted automatic publishing under free-tier restrictions.

---

# 19. Final Architecture Summary

The application will use:

- React for the user interface.
- Node.js and Express for backend operations.
- MongoDB for application data.
- Python for cloud AI provider integration.
- FFmpeg for video processing.
- Redis and BullMQ for background tasks, if eligible free hosting is available.
- Cloud storage for video and image files.
- Official Meta Instagram Graph API for publishing.

The architecture separates the frontend, backend, AI integration, video processing, and publishing functions. This makes the application easier to develop, test, maintain, and expand.

**End of Document 2 – System Architecture Design Document.**