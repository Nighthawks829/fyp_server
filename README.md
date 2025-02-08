# IoT Monitoring and Control Ecosystem - Backend API

## Overview

This project is the backend API for the IoT Monitoring and Control Ecosystem, which integrates an MQTT server for real-time communication and web technologies for sensor and device management. The backend is built using Node.js, Express, Sequelize, and Mosquitto MQTT Broker, supporting functionalities such as device registration, real-time data monitoring, remote control nad user authentication.

## Features

- User Authentication (JWT-based)
- Board & Sensor Management
- Real-time MQTT Communication
- RESTful API for Web and Mobile Clients
- Notification & Alerts Handling
- Database Management with Sequelize (MySQL)
- Error handling and logging

## Tech Steck

- Backend: Node.js, Express.js
- Database: MySQL (managed with Sequelize ORM)
- Authentication: JWT-based authentication
- Messaging Protocol: MQTT (Mosquitto Broker)

## Installation

#### Prequisites

Ensuring you have the following installed:

- Node.js (v16+ recommended)
- Mosquitto MQTT Broker
- MySQL Database
- npm ot yarn

#### Setup Steps

1. Clone the repository:

```sh
git clone https://github.com/Nighthawks829/fyp_server.git
```

2. Navigate to the project directory

```sh
cd fyp_server
```

2. Install dependencies

```sh
npm install
```

#### Configuration

1. Create a [`.env`](.env) file in the root directory and add the following environment variables:

```env
# Database Configuration
DATABASE_HOST=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=

# Server Configuration
PORT=

# JWT Authentication
JWT_SECRET=
JWT_LIFETIME=

# API Rate Limiting
RATE_WINDOWMS=
RATE_MAX=

# MQTT Broker Configuration
MQTT_PROTOCOL=
MQTT_HOST=
MQTT_PORT=
MQTT_ClientID=
MQTT_USERNAME=
MQTT_PASSWORD=

# Admin Email Configuration
ADMIN_EMAIL_ADDRESS=
ADMIN_EMAIL_PASSWORD=

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=

# WhatsApp Bot API
WHATSAPPBOT_API=

# Twilio SMS Service
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

| Variable Name          | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `DATABASE_HOST`        | Database server hostname or IP address                  |
| `DATABASE_USERNAME`    | Username for the database                               |
| `DATABASE_PASSWORD`    | Password for the database                               |
| `DATABASE_NAME`        | Name of the database used by the backend                |
| `PORT`                 | Port on which the backend server will run               |
| `JWT_SECRET`           | Secret key for signing JWT tokens                       |
| `JWT_LIFETIME`         | Expiration time for JWT tokens (e.g., 30 days)          |
| `RATE_WINDOWMS`        | Time window (in milliseconds) for rate limiting         |
| `RATE_MAX`             | Maximum requests allowed per rate window                |
| `MQTT_PROTOCOL`        | Protocol for MQTT communication (e.g., `mqtt`, `mqtts`) |
| `MQTT_HOST`            | MQTT broker hostname or IP address                      |
| `MQTT_PORT`            | Port number for the MQTT broker (default: `1883`)       |
| `MQTT_ClientID`        | Client ID used to connect to the MQTT broker            |
| `MQTT_USERNAME`        | Username for MQTT authentication                        |
| `MQTT_PASSWORD`        | Password for MQTT authentication                        |
| `ADMIN_EMAIL_ADDRESS`  | Email address for system notifications                  |
| `ADMIN_EMAIL_PASSWORD` | Email password for system notifications                 |
| `TELEGRAM_BOT_TOKEN`   | API token for integrating Telegram bot notifications    |
| `WHATSAPPBOT_API`      | API key for WhatsApp bot integration                    |
| `TWILIO_ACCOUNT_SID`   | Twilio account SID for SMS services                     |
| `TWILIO_AUTH_TOKEN`    | Twilio authentication token                             |
| `TWILIO_PHONE_NUMBER`  | Twilio phone number used for sending SMS alerts         |

#### Running the Application

1. Start the MySQL server
2. Start the backend server

```sh
npm start
```

#### Running Tests

(Optional) Run unit tests using:

```sh
npm test
```

## API Endpoints

### Authentication API

The authentication API provides endpoints for user login and logout. This API uses JWT (JSON Web Tokens) for authentication and cookies for session management.
| Method | Endpoint | Description |
|--------|---------------------|------------------------------------------------------|
| POST | `/api/v1/auth/login` | Authenticate user and return JWT |
| POST | `/api/v1/auth/logout` | Clears authentication cookies and logs out the user. |

### User Management API

The User Management API provides endpoints for adding, retrieving, updating, and deleting user accounts.

| Method | Endpoint           | Description                                  |
| ------ | ------------------ | -------------------------------------------- |
| POST   | `/api/v1/user`     | Creates a new user                           |
| GET    | `/api/v1/user`     | Retrieves a list of all users                |
| GET    | `/api/v1/user/:id` | Retrieves details of a specific user by ID   |
| PATCH  | `/api/v1/user/:id` | Updates the details of a specific user by ID |
| DELETE | `/api/v1/user/:id` | Deletes a specific user by ID                |

### Board Management API

The Board Management API provides endpoints for adding, retrieving, updating, and deleting IoT board.

| Method | Endpoint            | Description                                   |
| ------ | ------------------- | --------------------------------------------- |
| POST   | `/api/v1/board`     | Creates a new board                           |
| GET    | `/api/v1/board`     | Retrieves a list of all board                 |
| GET    | `/api/v1/board/:id` | Retrieves details of a specific board by ID   |
| PATCH  | `/api/v1/board/:id` | Updates the details of a specific board by ID |
| DELETE | `/api/v1/board/:id` | Deletes a specific board by ID                |

### Sensor Management API

The Senspr Management API provides endpoints for adding, retrieving, updating, and deleting IoT sensor.

| Method | Endpoint            | Description                                    |
| ------ | ------------------- | ---------------------------------------------- |
| POST   | `/api/v1/board`     | Creates a new sensor                           |
| GET    | `/api/v1/board`     | Retrieves a list of all sensor                 |
| GET    | `/api/v1/board/:id` | Retrieves details of a specific sensor by ID   |
| PATCH  | `/api/v1/board/:id` | Updates the details of a specific sensor by ID |
| DELETE | `/api/v1/board/:id` | Deletes a specific sensor by ID                |

### Alert Notification Management API

The Alert Notification Management API provides endpoints for adding, retrieving, updating, and deleting notification.

| Method | Endpoint                   | Description                                          |
| ------ | -------------------------- | ---------------------------------------------------- |
| POST   | `/api/v1/notification`     | Creates a new notification                           |
| GET    | `/api/v1/notification`     | Retrieves a list of all notification                 |
| GET    | `/api/v1/notification/:id` | Retrieves details of a specific notification by ID   |
| PATCH  | `/api/v1/notification/:id` | Updates the details of a specific notification by ID |
| DELETE | `/api/v1/notification/:id` | Deletes a specific notification by ID                |

### Dashboard Management

The Dahsboard Management API provides endpoints for adding, retrieving, updating, and deleting dashboard component.

| Method | Endpoint                | Description                                       |
| ------ | ----------------------- | ------------------------------------------------- |
| POST   | `/api/v1/dashboard`     | Creates a new dashboard                           |
| GET    | `/api/v1/dashboard`     | Retrieves a list of all dashboard                 |
| GET    | `/api/v1/dashboard/:id` | Retrieves details of a specific dashboard by ID   |
| PATCH  | `/api/v1/dashboard/:id` | Updates the details of a specific dashboard by ID |
| DELETE | `/api/v1/dashboard/:id` | Deletes a specific dashboard by ID                |

### Sensor Data API

The Sensor Data Management API provides endpoints for retrieving all and latest sensor data.

| Method | Endpoint                        | Description                                      |
| ------ | ------------------------------- | ------------------------------------------------ |
| GET    | `/api/v1/sensorData`            | Retrieves a list of all sensor data              |
| GET    | `/api/v1/sensorData/:id`        | Retrieves a list of all sensor data by sensor ID |
| GET    | `/api/v1/sensorData/latest/:id` | Retrieves lastest sensor data by sensor ID       |

### Sensor Control API

The Sensor Control API provides endpoints for managing sensor controls, including retrieving all sensor controls, adding new ones, and retrieving details of a specific sensor control.

| Method | Endpoint                    | Description                                                  |
| ------ | --------------------------- | ------------------------------------------------------------ |
| GET    | `/api/v1/sensorControl`     | Retrieves a list of all sensor controls                      |
| POST   | `/api/v1/sensorControl`     | Creates a new sensor control.D                               |
| GET    | `/api/v1/sensorControl/:id` | Retrieves details of a specific sensor control by sensor ID. |

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the repository
2. Create a new branch

```sh
git checkout -b feature-branch
```

3. Make your changes

4. Commit your change:

```sh
git commit -m 'Add some feature'
```

5. Push to the branch

```sh
git push origin feature-branch
```

6. Open a pull request

## License

This project is licensed under the MIT License.

## Contact
Liew Shai Sam - liew_shai_bi21@iluv.ums.edu.my

## Acknowledgements

I would like to express our gratitude to the following individuals and organizations for their support and contributions to this project:

- PM. Dr. Chin Kin On, Dr. James Mountstephens, and Dr. Azali Saudi – For their invaluable guidance and feedback throughout the development of this IoT Monitoring and Control Ecosystem.
- Open-Source Communities – Special thanks to the contributors behind open-source technologies like Node.js, Express.js, Sequelize, Mosquitto MQTT, React.js, and Chart.js, which made this project possible.
- Friends & Family – For their unwavering support, encouragement, and patience throughout the project.
