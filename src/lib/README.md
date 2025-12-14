# Admin Dashboard Setup

## How to Access Admin Panel

Navigate to: `http://localhost:5173/admin`

## Features

### Voting Positions Management
- Add new voting positions (President, Vice President, etc.)
- Edit existing positions
- Delete positions
- Upload images from local device

### Leadership Management
- Add new leadership members
- Edit existing members
- Delete members
- Upload images from local device

## How It Works

1. **Database Connection**: All data is stored in Supabase and syncs in real-time
2. **Image Upload**: Images are uploaded to Supabase Storage bucket `candidate-images`
3. **Frontend Display**: Changes in admin panel automatically appear on the main website
4. **CRUD Operations**: Full Create, Read, Update, Delete functionality

## Usage

1. Go to `/admin` route
2. Switch between "Voting Positions" and "Leadership" tabs
3. Fill in the form (Name, Role, Image)
4. Click "Add" to create new entry or "Update" after editing
5. Use "Edit" button to modify existing entries
6. Use "Delete" button to remove entries

All changes are immediately saved to the database and reflected on the frontend.
