# Changelog

All notable changes to the GuestPix application will be documented in this file.

## [1.1.1] - 2025-03-28

### Fixed
- Removed Turbopack to resolve runtime error with module resolution
- Fixed issue with `_document.js` not properly loading

## [1.1.0] - 2025-03-28

### Added
- New DeleteButton component to replace the old EventActions component
- GuestBanner component for improved guest page UI
- Optimized image handling with the new OptimizedImage component
- Direct event deletion API endpoints for more reliable deletion

### Changed
- Improved photo upload experience with automatic uploads
- Enhanced photo deletion functionality
- Cleaned up the main page by removing Cloudinary test sections
- Optimized event page loading and rendering
- Fixed issue with params.id usage in dynamic routes with proper awaiting

### Fixed
- Fixed issues with passing functions to client components in GuestBanner
- Resolved image loading errors
- Fixed form submission for deletion actions
- Corrected UI styling inconsistencies

### Removed
- Removed EventActions.tsx component (replaced by DeleteButton)
- Removed Cloudinary test sections from the home page
- Cleaned up debug code and console logs