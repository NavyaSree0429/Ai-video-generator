# AI VIDEO STUDIO & INSTAGRAM AUTO PUBLISHER
## DATABASE DESIGN DOCUMENT (DBDD)

**Document Number:** 03  
**Version:** 1.0  
**Date:** November 15, 2026  
**Status:** Draft for Review  
**Database:** MongoDB  
**ODM:** Mongoose  
**Architecture:** MERN Stack + Python AI Service

---

# 1. Introduction

## 1.1 Purpose

This document describes the database structure for the AI Video Studio & Instagram Auto Publisher.

It defines:
- MongoDB collections.
- Document fields and data types.
- Relationships between collections.
- Required and optional fields.
- Validation rules.
- Database indexes.
- Sample MongoDB documents.
- Data security and storage considerations.

## 1.2 Database Objectives

The database must:

1. Store user account information securely.
2. Store multiple video projects.
3. Store generated and edited video details.
4. Track AI generation jobs.
5. Track AI provider availability and usage.
6. Store Instagram account connection information securely.
7. Manage scheduled and completed posts.
8. Store notifications and processing history.
9. Support future application improvements.

# 2. Database Technology

**Database:** MongoDB  
**ODM:** Mongoose  
**Database style:** NoSQL document database

MongoDB stores information in collections. Each collection contains documents.

Example:

```text
Database: ai_video_studio

Collections:
    users
    projects
    videos
    generationJobs
    aiProviders
    instagramAccounts
    publishJobs
    notifications
```

# 3. Database Architecture

## 3.1 Collection Relationship Diagram

```text
                    USERS
                      |
          +-----------+------------+
          |           |            |
          v           v            v
       PROJECTS     INSTAGRAM    NOTIFICATIONS
          |         ACCOUNTS
          |
          v
        VIDEOS
          |
          v
    GENERATION JOBS

    AI PROVIDERS
          |
          v
    GENERATION JOBS

    INSTAGRAM ACCOUNTS
          |
          v
      PUBLISH JOBS
          |
          v
        VIDEOS
```

## 3.2 Relationship Explanation

- One user can create multiple projects.
- One user can have multiple videos.
- One project can contain multiple videos.
- One video can have multiple generation or editing jobs.
- One generation job can reference an AI provider.
- One user can connect one Instagram Creator account.
- One Instagram account can have multiple publishing jobs.
- One video can have multiple publishing attempts or scheduled publishing records.
- One user can receive multiple notifications.

MongoDB ObjectIds will be used to connect related documents.

# 4. Collection Design

The application will initially contain eight main collections.

## 4.1 Users Collection

**Collection name:** `users`

### Purpose

Stores user registration, login, and account information.

### Fields

| Field | Data type | Required | Description |
|---|---|---|---|
| _id | ObjectId | Yes | Unique user ID |
| name | String | Yes | User name |
| email | String | Yes | Login email |
| password | String | Yes | Hashed password |
| role | String | Yes | User role |
| isActive | Boolean | Yes | Account status |
| createdAt | Date | Yes | Registration date |
| updatedAt | Date | Yes | Last update |

### Example document

```json
{
  "_id": "674a10000000000000000001",
  "name": "Studio User",
  "email": "user@example.com",
  "password": "BCRYPT_HASH_VALUE",
  "role": "user",
  "isActive": true,
  "createdAt": "2026-11-15T08:00:00.000Z",
  "updatedAt": "2026-11-15T08:00:00.000Z"
}
```

**Important:** The password must always be hashed using bcrypt. Never store a plain-text password.

### Validation rules

- Name is required.
- Email is required and must be unique.
- Email must have a valid format.
- Password must meet the application's password policy.
- Role must be an allowed value.
- Account status must be Boolean.

---

## 4.2 Projects Collection

**Collection name:** `projects`

### Purpose

Stores information about video projects created by the user.

A project can contain multiple generated videos and scenes.

### Fields

| Field | Data type | Required | Description |
|---|---|---|---|
| _id | ObjectId | Yes | Project ID |
| userId | ObjectId | Yes | Reference to users |
| title | String | Yes | Project title |
| description | String | No | Project description |
| language | String | Yes | Telugu or English |
| projectType | String | Yes | Text-to-video or image-to-video |
| status | String | Yes | Project status |
| createdAt | Date | Yes | Creation date |
| updatedAt | Date | Yes | Update date |

### Example document

```json
{
  "_id": "674a20000000000000000001",
  "userId": "674a10000000000000000001",
  "title": "Shiva Devotional Video",
  "description": "A devotional video about Lord Shiva",
  "language": "Telugu",
  "projectType": "text-to-video",
  "status": "active",
  "createdAt": "2026-11-15T08:30:00.000Z",
  "updatedAt": "2026-11-15T08:30:00.000Z"
}
```

### Allowed values

**language**
- Telugu
- English

**projectType**
- text-to-video
- image-to-video

**status**
- active
- completed
- archived

---

## 4.3 Videos Collection

**Collection name:** `videos`

### Purpose

Stores information about generated and edited videos.

This collection stores video metadata and storage references, not the actual video file contents.

### Fields

| Field | Data type | Required | Description |
|---|---|---|---|
| _id | ObjectId | Yes | Video ID |
| userId | ObjectId | Yes | Owner |
| projectId | ObjectId | Yes | Related project |
| title | String | Yes | Video title |
| prompt | String | No | Original generation prompt |
| videoType | String | Yes | Short or long |
| generationType | String | Yes | Text or image |
| language | String | Yes | Video language |
| duration | Number | Yes | Duration in seconds |
| aspectRatio | String | No | Video dimensions ratio |
| videoUrl | String | Yes | Storage reference or URL |
| thumbnailUrl | String | No | Thumbnail reference |
| status | String | Yes | Video status |
| captionsEnabled | Boolean | Yes | Captions enabled |
| voiceoverEnabled | Boolean | Yes | Voiceover enabled |
| createdAt | Date | Yes | Creation date |
| updatedAt | Date | Yes | Update date |

### Example document

```json
{
  "_id": "674a30000000000000000001",
  "userId": "674a10000000000000000001",
  "projectId": "674a20000000000000000001",
  "title": "Lord Shiva Story",
  "prompt": "Create a cinematic devotional video about Lord Shiva",
  "videoType": "short",
  "generationType": "text-to-video",
  "language": "Telugu",
  "duration": 45,
  "aspectRatio": "9:16",
  "videoUrl": "storage-reference/video-001",
  "thumbnailUrl": "storage-reference/thumb-001",
  "status": "completed",
  "captionsEnabled": true,
  "voiceoverEnabled": true,
  "createdAt": "2026-11-15T09:00:00.000Z",
  "updatedAt": "2026-11-15T09:00:00.000Z"
}
```

### Allowed values

**videoType**
- short
- long

**generationType**
- text-to-video
- image-to-video

**status**
- processing
- completed
- failed
- archived

### Important note

Short and long video durations will be validated against the application's configured limits and the selected AI model's capabilities.

For long videos, scene details can be stored in a separate scene structure or an embedded scenes array.

---

## 4.4 Generation Jobs Collection

**Collection name:** `generationJobs`

### Purpose

Tracks all AI video generation tasks.

This collection helps the application monitor progress, provider usage, failures, and retries.

### Fields

| Field | Data type | Required | Description |
|---|---|---|---|
| _id | ObjectId | Yes | Job ID |
| userId | ObjectId | Yes | User reference |
| projectId | ObjectId | Yes | Project reference |
| videoId | ObjectId | No | Generated video reference |
| providerId | ObjectId | No | AI provider reference |
| jobType | String | Yes | Generation type |
| prompt | String | No | Generation prompt |
| status | String | Yes | Job status |
| progress | Number | Yes | Progress percentage |
| attempts | Number | Yes | Retry count |
| errorMessage | String | No | Failure information |
| startedAt | Date | No | Start time |
| completedAt | Date | No | Completion time |
| createdAt | Date | Yes | Job creation time |

### Example document

```json
{
  "_id": "674a40000000000000000001",
  "userId": "674a10000000000000000001",
  "projectId": "674a20000000000000000001",
  "videoId": "674a30000000000000000001",
  "providerId": "674a50000000000000000001",
  "jobType": "text-to-video",
  "prompt": "A cinematic devotional scene of Lord Shiva",
  "status": "completed",
  "progress": 100,
  "attempts": 1,
  "errorMessage": null,
  "startedAt": "2026-11-15T09:00:00.000Z",
  "completedAt": "2026-11-15T09:05:00.000Z",
  "createdAt": "2026-11-15T08:59:00.000Z"
}
```

### Allowed job statuses

- pending
- queued
- processing
- completed
- failed
- paused
- cancelled

### Important rules

- Progress must be between 0 and 100.
- Failed jobs should store a useful error message.
- Retry count must have a configured maximum.
- Provider quota failures must not trigger endless retries.
- Job records must not store API keys or passwords.

---

## 4.5 AI Providers Collection

**Collection name:** `aiProviders`

### Purpose

Stores configuration and operational information about eligible AI providers.

It helps the application select an available provider without using paid services.

### Fields

| Field | Data type | Required | Description |
|---|---|---|---|
| _id | ObjectId | Yes | Provider ID |
| providerName | String | Yes | Provider name |
| providerType | String | Yes | AI service category |
| enabled | Boolean | Yes | Whether provider is enabled |
| freeTierEligible | Boolean | Yes | Verified free eligibility |
| supportedTasks | Array | Yes | Supported operations |
| availabilityStatus | String | Yes | Current operational status |
| quotaStatus | String | Yes | Free quota status |
| lastCheckedAt | Date | No | Last availability check |
| createdAt | Date | Yes | Creation date |
| updatedAt | Date | Yes | Update date |

### Example document

```json
{
  "_id": "674a50000000000000000001",
  "providerName": "Hugging Face",
  "providerType": "cloud-ai",
  "enabled": true,
  "freeTierEligible": true,
  "supportedTasks": [
    "text-to-video"
  ],
  "availabilityStatus": "available",
  "quotaStatus": "available",
  "lastCheckedAt": "2026-11-15T09:00:00.000Z",
  "createdAt": "2026-11-15T08:00:00.000Z",
  "updatedAt": "2026-11-15T09:00:00.000Z"
}
```

### Allowed availability statuses

- available
- unavailable
- maintenance
- disabled

### Allowed quota statuses

- available
- low
- exhausted
- unknown

### Security note

API credentials must be stored in environment variables or a secure secrets manager, not directly inside provider documents.

The `freeTierEligible` value must be based on verified current provider terms and account eligibility. It must not be permanently assumed true.

---

## 4.6 Instagram Accounts Collection

**Collection name:** `instagramAccounts`

### Purpose

Stores information about the user's connected Instagram Creator account.

Only one connected account is required for the initial version.

### Fields

| Field | Data type | Required | Description |
|---|---|---|---|
| _id | ObjectId | Yes | Account ID |
| userId | ObjectId | Yes | User reference |
| instagramUserId | String | Yes | Instagram account ID |
| username | String | Yes | Instagram username |
| accountType | String | Yes | Creator account |
| accessTokenEncrypted | String | Yes | Encrypted token |
| tokenExpiresAt | Date | No | Token expiry |
| isConnected | Boolean | Yes | Connection status |
| connectedAt | Date | Yes | Connection date |
| updatedAt | Date | Yes | Last update |

### Example document

```json
{
  "_id": "674a60000000000000000001",
  "userId": "674a10000000000000000001",
  "instagramUserId": "123456789012345",
  "username": "example_creator",
  "accountType": "CREATOR",
  "accessTokenEncrypted": "ENCRYPTED_TOKEN_PLACEHOLDER",
  "tokenExpiresAt": "2027-01-15T09:00:00.000Z",
  "isConnected": true,
  "connectedAt": "2026-11-15T09:00:00.000Z",
  "updatedAt": "2026-11-15T09:00:00.000Z"
}
```

### Important security rules

- Never store Instagram tokens as plain text.
- Never return tokens to the React frontend.
- Encrypt tokens before saving them.
- Restrict database access.
- Support token expiration and renewal.
- Allow account disconnection and token invalidation.

---

## 4.7 Publish Jobs Collection

**Collection name:** `publishJobs`

### Purpose

Manages manual publishing, automatic publishing, and scheduled Instagram posts.

### Fields

| Field | Data type | Required | Description |
|---|---|---|---|
| _id | ObjectId | Yes | Publishing job ID |
| userId | ObjectId | Yes | User reference |
| videoId | ObjectId | Yes | Video reference |
| instagramAccountId | ObjectId | Yes | Instagram account reference |
| caption | String | No | Post caption |
| hashtags | Array | No | Hashtags |
| publishType | String | Yes | Publishing method |
| scheduledAt | Date | No | Scheduled time |
| status | String | Yes | Publishing status |
| instagramMediaId | String | No | Published media ID |
| errorMessage | String | No | Failure details |
| attemptCount | Number | Yes | Publishing attempts |
| createdAt | Date | Yes | Creation time |
| publishedAt | Date | No | Actual publishing time |

### Example document

```json
{
  "_id": "674a70000000000000000001",
  "userId": "674a10000000000000000001",
  "videoId": "674a30000000000000000001",
  "instagramAccountId": "674a60000000000000000001",
  "caption": "A beautiful devotional video about Lord Shiva",
  "hashtags": [
    "#LordShiva",
    "#Shiva",
    "#Devotional"
  ],
  "publishType": "scheduled",
  "scheduledAt": "2026-11-16T10:00:00.000Z",
  "status": "scheduled",
  "instagramMediaId": null,
  "errorMessage": null,
  "attemptCount": 0,
  "createdAt": "2026-11-15T09:30:00.000Z",
  "publishedAt": null
}
```

### Allowed publishing types

- manual
- automatic
- scheduled

### Allowed publishing statuses

- draft
- scheduled
- processing
- published
- failed
- cancelled

### Important rules

- Scheduled dates must be valid future dates when a new schedule is created.
- The publishing worker must verify the job is due.
- A successful post must record the Instagram media ID.
- The same job must not publish the same video twice.
- Failed jobs must show a useful reason.
- Store times consistently in UTC and display them in the user's selected timezone.

---

## 4.8 Notifications Collection

**Collection name:** `notifications`

### Purpose

Stores application notifications for the user.

### Fields

| Field | Data type | Required | Description |
|---|---|---|---|
| _id | ObjectId | Yes | Notification ID |
| userId | ObjectId | Yes | User reference |
| title | String | Yes | Notification title |
| message | String | Yes | Notification content |
| type | String | Yes | Notification category |
| relatedJobId | ObjectId | No | Related job |
| isRead | Boolean | Yes | Read status |
| createdAt | Date | Yes | Creation date |

### Example document

```json
{
  "_id": "674a80000000000000000001",
  "userId": "674a10000000000000000001",
  "title": "Video Generated Successfully",
  "message": "Your devotional video is ready.",
  "type": "video-completed",
  "relatedJobId": "674a40000000000000000001",
  "isRead": false,
  "createdAt": "2026-11-15T09:05:00.000Z"
}
```

### Notification types

- video-started
- video-completed
- video-failed
- quota-exhausted
- provider-unavailable
- instagram-connected
- instagram-disconnected
- publish-success
- publish-failed
- scheduled-post

---

# 5. MongoDB Relationships

## 5.1 One-to-Many Relationships

| Parent | Child | Relationship |
|---|---|---|
| User | Projects | One-to-many |
| User | Videos | One-to-many |
| User | Generation Jobs | One-to-many |
| User | Notifications | One-to-many |
| Project | Videos | One-to-many |
| Project | Generation Jobs | One-to-many |
| Video | Generation Jobs | One-to-many |
| Video | Publish Jobs | One-to-many |
| Instagram Account | Publish Jobs | One-to-many |
| AI Provider | Generation Jobs | One-to-many |

## 5.2 One-to-One Relationship

| Parent | Child | Relationship |
|---|---|---|
| User | Instagram Account | One-to-one for the initial version |

Mongoose references will be used to connect these collections.

# 6. Database Indexing

Indexes improve database query performance.

The following indexes are recommended.

| Collection | Field | Index type | Purpose |
|---|---|---|---|
| users | email | Unique | Prevent duplicate accounts |
| projects | userId | Normal | Find user's projects |
| projects | createdAt | Descending | Sort recent projects |
| videos | userId | Normal | Find user's videos |
| videos | projectId | Normal | Find project videos |
| generationJobs | status | Normal | Find pending jobs |
| generationJobs | createdAt | Descending | View recent jobs |
| aiProviders | providerName | Unique | Prevent duplicate provider entries |
| instagramAccounts | userId | Unique | One account per user |
| publishJobs | scheduledAt | Normal | Find due posts |
| publishJobs | status | Normal | Find scheduled and failed posts |
| notifications | userId + isRead | Compound | Find unread notifications |

Additional indexes may be introduced after measuring real query patterns.

# 7. Mongoose Model Structure

The backend will use Mongoose schemas to validate and manage MongoDB documents.

Example: User model.

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user"],
      default: "user"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
```

Example: Project model.

```javascript
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    language: {
      type: String,
      enum: ["Telugu", "English"],
      required: true
    },

    projectType: {
      type: String,
      enum: ["text-to-video", "image-to-video"],
      required: true
    },

    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", projectSchema);
```

The remaining models will follow the same schema-validation approach.

# 8. Database Folder Structure

The backend database-related structure will be:

```text
server/
│
├── config/
│   └── db.js
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
├── seeders/
│   └── providerSeeder.js
│
├── utils/
│   └── encryptToken.js
│
├── app.js
└── server.js
```

# 9. Database Connection

MongoDB connection will be configured in `config/db.js`.

Example:

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

The MongoDB connection string must be stored in the backend `.env` file.

# 10. Data Security and Validation

## 10.1 Password Security

- Hash passwords using bcrypt.
- Never save plain-text passwords.
- Never return password hashes in API responses.

## 10.2 Instagram Token Security

- Encrypt access tokens before database storage.
- Store encryption keys outside the database.
- Restrict token access to backend services.
- Never expose access tokens in logs or frontend responses.

## 10.3 Ownership Validation

Every private project, video, job, and notification request must verify that the authenticated user owns the requested resource.

For example, a user must not be able to access another user's video by changing its MongoDB ObjectId.

## 10.4 File Storage

Video files must be stored in external storage, not directly inside MongoDB documents.

MongoDB will store their storage references, metadata, and processing status.

## 10.5 Data Retention

- Keep project and publishing history.
- Remove temporary files after successful processing when no longer required.
- Allow old projects to be archived.
- Apply a retention policy to temporary job logs and notifications.

# 11. Database Validation Rules

| Field | Validation |
|---|---|
| User email | Required, unique, valid format |
| User password | Required, securely hashed |
| Project title | Required |
| Project language | Telugu or English |
| Video duration | Positive number within configured limits |
| Video status | Must be an allowed status |
| Job progress | 0–100 |
| Provider eligibility | Must be verified before use |
| Instagram username | Required |
| Publishing date | Valid date |
| Publishing status | Must be an allowed status |
| Notification isRead | Boolean |

# 12. Database Workflow Examples

## 12.1 Creating a Video Project

1. User logs in.
2. Backend identifies the user.
3. User creates a new project.
4. Backend inserts a document into `projects`.
5. MongoDB generates a unique ObjectId.
6. Frontend receives the new project details.

## 12.2 Generating a Video

1. User selects a project.
2. User submits a prompt.
3. Backend creates a document in `generationJobs`.
4. The worker selects an eligible free AI provider.
5. AI service generates the video.
6. Final video metadata is saved in `videos`.
7. Generation job status changes to completed.
8. A notification is inserted.

## 12.3 Publishing a Scheduled Video

1. User selects a saved video.
2. User enters caption and hashtags.
3. User selects a publishing date and time.
4. Backend creates a `publishJobs` document.
5. Scheduler checks due jobs.
6. Publishing worker calls the official Instagram API.
7. Successful publishing details are saved.
8. A notification is created.

# 13. Database Performance and Reliability

The database should:

- Use indexes for frequently queried fields.
- Use pagination for project and video lists.
- Avoid storing large video files in MongoDB.
- Validate documents before saving.
- Handle duplicate requests.
- Use appropriate connection pooling.
- Keep database credentials secure.
- Back up important project metadata when the hosting plan supports it.

The application must also handle database connection interruptions gracefully.

# 14. Future Database Enhancements

The following collections may be introduced in future versions:

| Collection | Purpose |
|---|---|
| editingHistory | Track video editing operations |
| analytics | Store publishing performance data |
| providerUsage | Detailed AI provider usage history |
| templates | Store reusable video templates |
| userSettings | Store application preferences |
| auditLogs | Track important account and publishing actions |

These collections are not mandatory for the first version.

# 15. Final Database Summary

The initial MongoDB database will contain eight main collections:

1. `users`
2. `projects`
3. `videos`
4. `generationJobs`
5. `aiProviders`
6. `instagramAccounts`
7. `publishJobs`
8. `notifications`

Each collection has a clear responsibility, and ObjectId references connect related information.

The design supports:

- Text-to-video generation.
- Image-to-video generation.
- Telugu and English videos.
- Short and long videos.
- Video editing.
- Free AI provider monitoring.
- Instagram account connection.
- Manual and automatic publishing.
- Scheduled publishing.
- Notifications and history.

**End of Document 3 – Database Design Document.**