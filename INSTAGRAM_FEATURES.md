# MBM Connect - Instagram-Like Social Media Platform

## Dark Mode Implementation ✅

### Frontend Dark Mode Features:
1. **DarkModeContext** - Global dark mode state management
   - Saves user preference to localStorage
   - Respects system preference as fallback
   - Available via `useDarkMode()` hook

2. **Updated Tailwind Config**
   - `darkMode: 'class'` enabled for Tailwind CSS dark mode
   - Extended dark colors in secondary palette
   - Dark gradient backgrounds (`gradient-dark`)
   - Instagram gradient (`gradient-instagram`) for brand consistency

3. **Dark Mode Toggle**
   - Sun/Moon emoji toggle button in Navbar
   - Mobile responsive (appears on all screen sizes)
   - Smooth transitions with CSS `transition-colors duration-300`

4. **Updated Components with Dark Support**:
   - **Navbar.jsx** - Full dark mode support
     - Dark backgrounds, borders, and text colors
     - Dark dropdown menus
     - Toggle button in both desktop and mobile views
   - **HomePage.jsx** - Dark background gradients
     - Dark hero section with adjusted backdrop blurs
     - Dark feature cards
     - Dark dividers and text
   - **LoginPage.jsx** - Dark form styling (in progress)

## User Profile System ✅

### Backend Implementation:

1. **Enhanced User Model** (`models/user.models.js`)
   - `followers` - Array of user IDs following this user
   - `following` - Array of user IDs this user follows
   - `bio` - User biography/description
   - `website` - User's website URL
   - `postsCount` - Number of posts (default: 0)

2. **Profile Controller** (`controllers/user.controller.js`)
   - `getUserProfile(id)` - Fetch user profile with populated followers/following
   - `updateUserProfile(id)` - Update bio, website, avatar, cover image
   - `followUser(id)` - Add user to followers/following
   - `unfollowUser(id)` - Remove from followers/following

3. **Profile Routes** (`Routes/user.js`)
   - `GET /api/user/:id` - Public profile view
   - `PUT /api/user/:id/profile` - Update own profile (protected)
   - `POST /api/user/:id/follow` - Follow user (protected)
   - `POST /api/user/:id/unfollow` - Unfollow user (protected)

### Frontend Implementation:

1. **UserProfile Component** (`pages/UserProfile.jsx`)
   - Cover image section with Instagram-style layout
   - Profile header with avatar, name, username
   - Stats display: Posts, Followers, Following
   - Bio section with edit mode
   - Edit button for own profile
   - Follow/Unfollow button for other users
   - Dark mode support throughout
   - Posts grid section (placeholder for future content)

2. **Profile Integration**
   - Added `/profile/:userId` route in App.jsx
   - Navbar links to user profile
   - Click on profile avatar to view profile

## Features Added

### Dark Mode:
- Toggle button in Navbar
- Persistent preference (localStorage)
- System preference detection
- Smooth transitions on all pages
- Professional color scheme for dark mode

### Instagram-Like Profile:
- Cover image support
- Profile stats (posts, followers, following)
- Bio and website link
- Follow/Unfollow functionality
- Edit profile (for own profile)
- Profile avatar with hover effects
- Responsive design (mobile-friendly)

## Next Steps

To complete the Instagram-like transformation:

1. **Create Post Model** - Schema for user posts/stories
2. **Post Management** - Create, edit, delete posts
3. **Feed Component** - Display user posts and following feed
4. **Like & Comment** - Engagement features
5. **Post Grid** - Display user's posts on profile
6. **Search & Discovery** - Find users and posts
7. **Notifications** - Real-time notifications for follows, likes, comments

## Usage

### Toggle Dark Mode:
```javascript
import { useDarkMode } from '../context/DarkModeContext';

const { isDarkMode, toggleDarkMode } = useDarkMode();
```

### View User Profile:
Navigate to `/profile/:userId` to view any user's profile.

### Update Your Profile:
1. Click on your profile avatar in the Navbar
2. Click "My Profile"
3. Click "Edit Profile"
4. Update bio, website, and other details
5. Click "Save"

### Follow/Unfollow:
On any user's profile page, click the "Follow" or "Following" button to manage connections.

## Technical Details

### Dark Mode Implementation:
- Uses Tailwind CSS `dark:` prefix classes
- `isDarkMode` boolean from context
- Ternary operators for conditional styling
- Consistent color usage:
  - `secondary-900/800/700` for dark backgrounds
  - `gray-300/400` for dark text
  - `primary-400/500` for dark accents

### Profile Features:
- MongoDB references for followers/following relationships
- Protected routes for profile updates
- Soft authentication checks (non-authenticated users can view profiles)
- Full CRUD operations for profile data

