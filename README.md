# Ninja Notes

A note-taking app with end-to-end encryption that allows for storing notes online. Bult with **NextJS** and utilizes **TailwindCSS** for clean, modern, and responsive user interfaces.

## Features

- Create, edit, and delete notes
- Save notes online
- End-to-End encryption for all notes
- Responsive and modern UI
- Smooth animations with Framer Motion

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- [Tailwind CSS](https://tailwindcss.com) (styling)
- [HeroIcons](https://heroicons.com) (icons)

## Getting started

1. Enter the [website](https://stealthnotes.netlify.app)
2. Create an account or login
3. Add notes

## User Guide

### Adding a note

1. Click on the 'Add Note' button
2. Choose a collection, or create a new one
3. Add a title
4. Add content
5. Click 'Add Note'

### Viewing notes

1. Click on the 'View Notes' button
2. View your notes

#### Features

- All notes are sorted from most recent to least recent
- There's an option to reverse the order
- There's an option to filter by collection
- Every note comes open, but that can be toggled via the toolbar
- An open note shows its content, no matter how long, a closed one doesn't show any content at all; just the title and options for the note
- Each note has the ability to be edited via the 'Edit' button
- Each note can be deleted via the 'Delete' button, and will require a second confirmation
- Each note displays the following metadata: Date created, date edited (if edited), and the collection that it belongs to
- Upon hovering a note, a copy-to-clipbaord button will appear on the other end of the note (on mobile devices it always appears)

### Editing a note

1. Navigate to the note viewer
2. Click 'Edit' under the desired note
3. After finishing the edit, click on the 'Edit Note' button

### Collections

_Note: in the project's code, collections are referred to as lists. This is done in order to avoid any confusion regarding Firebase collections and note collections_

### Creating a collection

1.  Click on the 'Add Note' button
2.  Click the plus (+) button adjacent to the collection selector
3.  Enter a name for the collection

### Collections are derived from notes. Here's what this means:

- Collections _cannot_ be empty
- Deleting a note when it is the last of its collection will delete the collection

### The default collection

- Is generated upon creating an account
- _Can_ be empty
- Deleting the last note inside the default collection _will not_ delete the collection
- Cannot be renamed

### Renaming a collection

1.  Click on the 'View Notes' button
2.  Select the desired collection
3.  Click on the pencil button
4.  Enter a new name for that collection

### Deleting a collection

#### Deleting the full collection

Will delete the entire collection and _all_ notes under that collection

##### Steps

1.  Click on the 'View Notes' button
2.  Select the desired collection
3.  Click the trash can button
4.  Confirm delete

#### Deleting the last note in a collection

- As mentioned before, since collections cannot be empty, deleting the last note in a collection will delete the collection automatically

## Security and end-to-end encryption

### Account recovery

- Accounts _cannot_ be recovered
- This is due to how end-to-end encryption works. Only the user is the one able to decrypt his notes. If account recovery was possible, then the notes wouldn't be truly secure, as an admin would be able to recover them.

### Flow

1.  User creates an account
2.  A secret crypto key is randomly generated
3.  Using the user's password, the secret key is then encrypted and sent to Firebase
4.  Upon login, the user's password is used to decrypt the secret key from Firebase
5.  The secret key is then saved _locally_ via indexDB
6.  When creating a new note/collection, _most_ of the metadata is encrypted using the secret key (see information below)
7.  Once the user wishes to retrieve his data, the data is then decrypted using the secret key

### What data is encrypted, and what data isn't?

- The following data is encrypted, meaning no one except the user, not even the owner of the Firebase project, is able to see the data
  - The user's secret key
  - The name of a collection
  - The title of a note
  - The content of a note
  - The ID of the collection that belongs to a note
- The following data _is not_ encrypted

  - The date a note was created
  - The date a note was edited, if at all
  - The user that a collection/note belongs to

  _Note: although some data isn't encrypted, it's still guarded using [Firestore rules](https://firebase.google.com/docs/firestore/security/get-started). This means that no other user can see the data that isn't encrypted, however an admin can. Local projects may have different Firestore rules._

### Disclaimer

While this app uses end-to-end encryption to help ensure that data remains private and accessible only to the user, I am a solo developer who is constantly learning. Therefore, I cannot make any legal guarantees about the security or reliability of this app. Please use it at your own risk.

## Running locally

1. **Install dependencies:**

```sh
npm install
```

2. **Get project configuration**

   1. Go to your [Firebase console](https://console.firebase.google.com)
   2. Under settings > General - find project configuration

3. **Create .env file**

- Insert the following variables:

```ini
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN_HERE
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID_HERE
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET_HERE
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID_HERE
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID_HERE
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID_HERE
```

4. **Create build:**

```sh
npm run build
```

5. **Run production server:**

```sh
npm run start
```

6. Open <http://localhost:3000> in your browser.

## Codebase

- `src`

  - `lib`
    - [`constants.ts`](src/lib/constants.ts) - Store basic constants used throughout the project
    - [`firebase.ts`](src/lib/firebase.ts) - Initialize Firebase app and export important constants
    - [`helpers.ts`](src/lib/helpers.ts) - Helper functions used throughout the project
    - [`indexDB.ts`](src/lib/indexDB.ts) - IndexDB worker
    - [`typeguards.ts`](src/lib/typeguards.ts) - Typeguards to ensure correct data comes through
    - [`types.ts`](src/lib/types.ts) - Types used throughout the project
    - `stores`
      - Stores utilizing [Zustand](https://zustand-demo.pmnd.rs) for state management
      - [`confirmStore.ts`](src/lib/stores/confirmStore.ts) - Open confirmation modal before executing dangerous functions
      - [`contentStore.ts`](src/lib/stores/contentStore.ts) - Store notes and collections locally
      - [`editStore.ts`](src/lib/stores/editStore.ts) - Stores the note currently being edited
      - [`inputStore.ts`](src/lib/stores/inputStore.ts) - Open input modal before executing functions that require an input
      - [`toastStore`](src/lib/stores/toastStore.ts) - Handle toasts
      - [`userStore.ts`](src/lib/stores/userStore.ts) - Store user data locally

## License

View [LICENSE](LICENSE)
