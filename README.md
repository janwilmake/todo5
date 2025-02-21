# IP-Based Todo List

This is a simple todo list application built with Cloudflare Workers that stores todos per IP address using Durable Objects. Each user (identified by their IP address) gets their own isolated todo list state.

## Features

- Create, read, update, and delete todos
- State is maintained per IP address
- Beautiful rainbow-themed UI using Tailwind CSS
- Real-time updates
- Persistent storage using Durable Objects

## Technical Details

The application uses:
- Cloudflare Workers for the API
- Durable Objects for state management
- Tailwind CSS for styling
- A responsive and modern UI
- CORS support for API access

## API Endpoints

- `GET /` - Retrieve all todos for the current IP
- `POST /` - Create a new todo
- `PUT /` - Toggle todo completion status
- `DELETE /` - Delete a todo

## Development

1. Install dependencies:
```bash
npm install