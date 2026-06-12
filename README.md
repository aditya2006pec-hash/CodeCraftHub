
# CodeCraftHub 🚀

A simple personal learning goal tracker API built with Node.js and Express. Track your development courses, set completion goals, and monitor your learning progress without the complexity of databases or authentication.

---

## 📋 Project Overview

CodeCraftHub is a RESTful API designed for developers who want to organize and track their learning journey. Whether you're learning React, Python, or any other technology, this platform helps you stay organized and motivated.

---

## ✨ Features

- Simple Course Management: Add, view, update, and delete courses
- Progress Tracking: Track course status (`Not Started`, `In Progress`, `Completed`)
- Goal Setting: Set target completion dates for your courses
- No Database Required: Uses simple JSON file storage
- RESTful API: Clean and intuitive API endpoints
- Auto-generated Data: Automatic ID assignment and timestamps
- Input Validation: Comprehensive error handling and validation
- Beginner Friendly: No complex setup or authentication

---

## 🛠️ Installation Instructions

### Prerequisites

- Node.js (version 14.0.0 or higher)
- npm (comes with Node.js)

### Step 1: Create the Project Directory

```bash
mkdir codecrafthub
cd codecrafthub
````

### Step 2: Initialize the Project

```bash
npm init -y
```

### Step 3: Install Dependencies

```bash
npm install express
```

### Step 4: Create the Main Application File

Create an `app.js` file and copy the application code into it.

### Step 5: Verify Installation

```bash
npm start
```

---

## 🚀 How to Run the Application

### Start the Server

Using npm script:

```bash
npm start
```

Or directly with Node.js:

```bash
node app.js
```

### Expected Output

```text
Server running on http://localhost:5000
courses.json not found. Creating new file...
Ready to track your learning goals! 🚀
```

The server will run at:

```text
http://localhost:5000
```

and will automatically create a `courses.json` file if it does not already exist.

---

## 📚 API Documentation

### Base URL

```text
http://localhost:5000/api/courses
```

---

## Course Object Structure

```json
{
  "id": 1,
  "name": "React Fundamentals",
  "description": "Learn the basics of React including components, props, and state",
  "target_date": "2024-03-15",
  "status": "In Progress",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

---

## 1. Get All Courses

### Endpoint

```http
GET /api/courses
```

### Description

Retrieve all courses in your learning tracker.

### Example Request

```bash
curl -X GET http://localhost:5000/api/courses
```

### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "React Fundamentals",
      "description": "Learn the basics of React including components, props, and state",
      "target_date": "2024-03-15",
      "status": "In Progress",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 2. Get a Specific Course

### Endpoint

```http
GET /api/courses/:id
```

### Description

Retrieve a single course by its ID.

### Example Request

```bash
curl -X GET http://localhost:5000/api/courses/1
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "React Fundamentals",
    "description": "Learn the basics of React including components, props, and state",
    "target_date": "2024-03-15",
    "status": "In Progress",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (Course Not Found)

```json
{
  "success": false,
  "error": "Course not found"
}
