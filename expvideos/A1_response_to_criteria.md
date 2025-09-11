Assignment 1 - REST API Project - Response to Criteria
================================================

Overview
------------------------------------------------

- **Name:** Jade Deegan
- **Student number:** n11022639
- **Application name:** YouTube Video Converter & Downloader
- **Two line description:** 
    This REST API provides endpoints to authenticate users and session management with JWT.
    Users can supply YouTube URLs to have the videos stored and downloaded in highest available resolution mp4 files.


Core criteria
------------------------------------------------

### Containerise the app

- **ECR Repository name:** 901444280953.dkr.ecr.ap-southeast-2.amazonaws.com/n11022639/assignments
- **Video timestamp:** N/A - despite receiving "Login Succeeded" for docker authentication, command "docker push 901444280953.dkr.ecr.ap-southeast-2.amazonaws.com/n11022639/assignments:asst1-expvideos" failed with error message "denied: User: arn:aws:sts::901444280953:assumed-role/CAB432-Instance-Role/i-03932db3e1114d21d is not authorized to perform: ecr:InitiateLayerUpload on resource: arn:aws:ecr:ap-southeast-2:901444280953:repository/n11022639/assignments because no identity-based policy allows the ecr:InitiateLayerUpload action"
- **Relevant files:**
    - /Dockerfile

### Deploy the container

- **EC2 instance ID:** i-03932db3e1114d21d
- **Video timestamp:**

### User login

- **One line description:** Requires user registration beforehand; if email/password match, old JWT are invalidated and new Bearer/Refresh tokens issued.
- **Video timestamp:**
- **Relevant files:**
    - middleware: postuserexists.js, invalidatetoken.js, generatetokens.js
    - routes/user.js

### REST API

- **One line description:** Authenticated users can supply youtube video URLs to download the videos, and view their previous downloads.
- **Video timestamp:**
- **Relevant files:**
    - middleware: getvideos.js, convertyoutubevideo.js, getconvertedvideo.js, hasbearertoken.js, authorisation.js, getuserid.js
    - routes/videos.js

### Data types

- **One line description:** unstructured video/audio .mp4 and structured tabular data for each video, sucha as associated userId and length.
- **Video timestamp:**
- **Relevant files:**
    - routes/videos.js
    - middleware/getvideos.js

#### First kind

- **One line description:**
- **Type:**
- **Rationale:**
- **Video timestamp:**
- **Relevant files:**
    - 

#### Second kind

- **One line description:**
- **Type:**
- **Rationale:**
- **Video timestamp:**
- **Relevant files:**
  - 

### CPU intensive task

 **One line description:** ffmpeg to convert and download videos from youtube URL.
- **Video timestamp:** 
- **Relevant files:**
    - middleware/convertyoutubevideo.js

### CPU load testing

 **One line description:** Permissions issues in AWS prevented appropriate testing.
    -  
- **Video timestamp:** 
- **Relevant files:**
    - testingdata.js