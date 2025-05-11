# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
# Notification System Setup Guide

## Backend Setup

1. **Install Required Packages**
   ```bash
   composer require beyondcode/laravel-websockets pusher/pusher-php-server
   ```

2. **Publish Configuration Files**
   ```bash
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
   php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Configure .env**
   Update your `.env` file with the following Pusher configuration:
   ```
   BROADCAST_DRIVER=pusher
   
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```

5. **Start WebSocket Server**
   ```bash
   php artisan websockets:serve
   ```

## Frontend Setup

1. **Install Required Packages**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Configure Environment**
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   REACT_APP_PUSHER_HOST=127.0.0.1
   REACT_APP_PUSHER_PORT=6001
   REACT_APP_PUSHER_SCHEME=http
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Testing the Notification System

1. **Send a Test Notification**
   You can use the following route to test the notification system:
   ```
   POST /api/notifications/test
   Headers: Authorization: Bearer YOUR_AUTH_TOKEN
   ```

2. **Check Real-time Updates**
   - Log in to the application
   - The notification bell should appear in the top-right corner
   - When a new notification is received, the badge should update automatically
   - Clicking the bell should show the notification dropdown

## Troubleshooting

- **WebSocket Connection Issues**
  - Make sure the WebSocket server is running
  - Check browser console for connection errors
  - Verify CORS and CSRF settings in your Laravel application

- **No Notifications Appearing**
  - Check the database notifications table for entries
  - Verify the user_id in the notifications table matches the logged-in user
  - Check Laravel logs for any errors

## Security Considerations

1. Always use HTTPS in production
2. Implement proper authentication for WebSocket connections
3. Validate all notification data on the server-side
4. Use proper authorization checks when sending notifications
5. Rate limit notification endpoints to prevent abuse
