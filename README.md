
# ReadOn 📰

**Stay Informed. Instantly.**

ReadOn is a modern, intelligent news aggregator PWA built with Next.js, Firebase, and Genkit. It provides a personalized, clean, and fast reading experience, with a strong emphasis on performance and offline-first capabilities.

![ReadOn App Showcase](https://storage.googleapis.com/project-idx-assets/readon-cover.png)

## ✨ Key Features

- **Personalized News Feed**: Browse news from various categories like Technology, Sports, and Health, tailored to your interests.
- **Offline-First Experience**: Thanks to IndexedDB caching and a robust Service Worker, you can read articles even when you're offline.
- **Intelligent Article Search**: Find articles based on keywords with a powerful AI-assisted search functionality.
- **Advanced Filtering**: Narrow down your news feed by country, language, date range, and multiple categories.
- **Bookmark Management**: Save articles for later with notes and tags. Your bookmarks are available across sessions.
- **Responsive & Installable PWA**: Enjoy a seamless experience on any device. Install ReadOn to your home screen for app-like access.
- **User Authentication**: Securely sign up and log in to manage your bookmarks and preferences.

---

## 🚀 Technology Stack

ReadOn is built with a modern, scalable, and performant tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **AI/Generative**: [Google AI & Genkit](https://firebase.google.com/docs/genkit)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (for server-side cache) & [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (for client-side offline cache)
- **News API**: [Newsdata.io](https://newsdata.io/)
- **Deployment & Scheduling**: [Netlify](https://www.netlify.com/) & [Netlify Functions](https://www.netlify.com/products/functions/)

---

## 🌊 Data Flow Architecture

The application employs a sophisticated "stale-while-revalidate" data flow to ensure a fast and reliable user experience.

1.  **Scheduled Fetching**: A Netlify scheduled function runs every 2 hours, triggering an API route in the Next.js app.
2.  **Firestore Caching**: This route fetches the latest news from the Newsdata.io API for all predefined categories. The articles are then processed, normalized, and stored in a shared **Firestore** database. This acts as our central, server-side cache.
3.  **Client-Side Caching**: When a user opens the app, it first attempts to load articles from the local **IndexedDB** cache.
4.  **Offline-First Logic**:
    - If fresh data (fetched < 2 hours ago) exists in IndexedDB, it is displayed instantly.
    - If the local data is stale or missing, the app fetches the latest articles from the Firestore cache.
    - This newly fetched data is then used to update the UI and is saved back to IndexedDB to keep the local cache fresh.
5.  **PWA & Service Worker**: A Service Worker caches the application shell (the core HTML, CSS, and JS), allowing the app to load instantly and function offline. It also includes logic to automatically handle updates, ensuring users always have the latest version.
6.  **Cache Cleanup**: To manage device storage, articles stored in IndexedDB are automatically deleted after 30 days.

---

## 🔧 Getting Started

To run this project locally, you'll need to set up the necessary environment variables.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Firebase project
- A Newsdata.io API key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/readon.git
    cd readon
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the following keys. You can get these from your Firebase project settings and Newsdata.io dashboard.

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

    # Newsdata.io API Key
    NEWSDATA_API_KEY=your_newsdata_api_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.

### Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase for errors.
