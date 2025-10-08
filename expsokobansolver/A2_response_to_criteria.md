Assignment 2 - Cloud Services Exercises - Response to Criteria
================================================

Instructions
------------------------------------------------
- Keep this file named A2_response_to_criteria.md, do not change the name
- Upload this file along with your code in the root directory of your project
- Upload this file in the current Markdown format (.md extension)
- Do not delete or rearrange sections.  If you did not attempt a criterion, leave it blank
- Text inside [ ] like [eg. S3 ] are examples and should be removed


Overview
------------------------------------------------

- **Name:** Jade Deegan
- **Student number:** n11022639
- **Partner name (if applicable):** NA
- **Application name:** Sokoban Solver
- **Two line description:** I implemented an app that takes Sokoban Warehouse style-puzzles (in text format) and executes a search algorithm to find the optimal solution, and generate a list of moves in the solution and a gif of the solution being executed.
- **EC2 instance name or ID:** i-090e8ae5f04679257

------------------------------------------------

### Core - First data persistence service

- **AWS service name:**  S3
- **What data is being stored?:** Stores unstructured sokoban puzzle text files, json documents of the solution moves, and image/gif files of the solution gifs. 
- **Why is this service suited to this data?:** Unstructured file types, like the document/text and image/gif files, are suitable for blob storage. 
- **Why are the other services used not suitable for this data?:** The unstructured file types are not suitable for relational database like in RDs, and storing the moves lists as JSON documents made them easier to consumer downstream.
- **Bucket/instance/table name:** n11022639-a2
- **Video timestamp:** 0:00-0:51
- **Relevant files:**
    - expsokobansolver/middleware/solvepuzzle.js
    - expsokobansolver/middleware/visualizesolution.js
    - expsokobansolver/routes/puzzles.js
    - expsokobansolver/services/aws.js

### Core - Second data persistence service

- **AWS service name:**  RDS - PostGres
- **What data is being stored?:** User data and Sokoban puzzles metadata. 
- **Why is this service suited to this data?:** The user and puzzles metadata have relations that are best captured in a relational database, and are required to be well-formed, follow a consistent structure, and be easily query-able.
- **Why is are the other services used not suitable for this data?:** S3 blob storage cannot describe/query the relations between datatypes/objects.  
- **Bucket/instance/table name:** namespace=s100, table=puzzles
- **Video timestamp:** 0:51-1:08
- **Relevant files:**
    - expsokobansolver/middleware/authorisation.js
    - expsokobansolver/middleware/getuserid.js
    - expsokobansolver/middleware/updatemetadata.js
    - expsokobansolver/routes/user.js

### Third data service

- **AWS service name:**  [eg. RDS]
- **What data is being stored?:** [eg video metadata]
- **Why is this service suited to this data?:** [eg. ]
- **Why is are the other services used not suitable for this data?:** [eg. Advanced video search requires complex querries which are not available on S3 and inefficient on DynamoDB]
- **Bucket/instance/table name:**
- **Video timestamp:** 
- **Relevant files:**
    -

### S3 Pre-signed URLs

- **S3 Bucket names:** n11022639-a2
- **Video timestamp:** 1:08-1:51
- **Relevant files:**
    - client/src/components/FeaturePuzzle.jsx
    - middleware/downloadpuzzle.js

### In-memory cache

- **ElastiCache instance name:** n11022639-a2
- **What data is being cached?:** RDS PostGres database query results.
- **Why is this data likely to be accessed frequently?:** Users are likely to hit this endpoint frequently while waiting for complex puzzles (long solve time > 5min) to become available, and admin users with elevated privileges would all see the results, regardless of which specific admin user it is. 
- **Video timestamp:** 1:51-2:24
- **Relevant files:**
    - middleware/getpuzzles.js

### Core - Statelessness

- **What data is stored within your application that is not stored in cloud data services?:** In progress puzzle solutions and gif files are stored in application whilst in complete, then uploaded to persistent storage from a temp directory once complete solutions/gifs are generated. 
- **Why is this data not considered persistent state?:** Incomplete solutions and static image frames can be reproduced from the source sokoban warehouse puzzle as necessary.
- **How does your application ensure data consistency if the app suddenly stops?:** A record of the metadata of the uploaded warehouse puzzle is added to the RDS PostGres db prior to attempting to loading any files to S3, and it includes a "status" column that is updated as required. Failure at any point in the process triggers a delete of the metadata and created S3 objects; a cleanup function *could* be executed once per day, deleting S3 objects / db records where `status != solved && CURRENT_TIMESTAMP - ts > 24hrs` (Note: not implemented, as Lambdas/Async comms will be implemented for later assessment items... *theoretically* **I** could execute this "cleanup function" manually each day).
- **Relevant files:**
    - expsokobansolver/middleware/solvepuzzle.js
    - expsokobansolver/middleware/visualizepuzzle.js
    - expsokobansolver/middleware/updatemetadata.js
    - expsokobansolver/routes/puzzle.js

### Graceful handling of persistent connections

- **Type of persistent connection and use:** [eg. server-side-events for progress reporting]
- **Method for handling lost connections:** [eg. client responds to lost connection by reconnecting and indicating loss of connection to user until connection is re-established ]
- **Relevant files:**
    -


### Core - Authentication with Cognito

- **User pool name:** n11022639-assessment2
- **How are authentication tokens handled by the client?:** They are stored in localStorage.
- **Video timestamp:** 2:24-2:57
- **Relevant files:**
    - client/src/pages/Login.jsx

### Cognito multi-factor authentication

- **What factors are used for authentication:** Password and E-mail MFA (AWS calls it OTP)
- **Video timestamp:** 2:57-3:36
- **Relevant files:**
    - client/src/pages/Login.jsx
    - expsokobansolver/routes/user.js
    - expsokobansolver/middleware/hasbearertoken.js
    - expsokobansolver/middleware/usertokens.js

### Cognito federated identities

- **Identity providers used:**
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito groups

- **How are groups used to set permissions?:** Admins can view and download puzzles from any user. 
- **Video timestamp:** 3:36-4:59
- **Relevant files:**
    - expsokobansolver/middleware/getpuzzles.js

### Core - DNS with Route53

- **Subdomain**:  api.sokobansolver.cab432.com
- **Video timestamp:** 4:59-5:47

### Parameter store

- **Parameter names:** /n11022639/asst2/[ dbclient, memcache, port, bucket_name ]
- **Video timestamp:** 5:47-7:15
- **Relevant files:**
    - expsokobansolver/services/loadEnv.js

### Secrets manager

- **Secrets names:** n11022639-asst2
- **Video timestamp:** 6:10-7:15
- **Relevant files:**
    - expsokobansolver/services/loadEnv.js

### Infrastructure as code

- **Technology used:**
- **Services deployed:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior approval only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior permission only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -
