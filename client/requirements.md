## Packages
framer-motion | Smooth animations for page transitions and micro-interactions
date-fns | Formatting dates and times for prayer schedule
clsx | Utility for conditional class names (often used with tailwind-merge)
tailwind-merge | Merging tailwind classes effectively

## Notes
Prayer times will be fetched from external API (aladhan.com) on the client side to support local user location without backend proxy if possible, or via a simple wrapper if CORS is an issue (Aladhan supports CORS).
Tasbeeh count and Settings will be stored in localStorage.
