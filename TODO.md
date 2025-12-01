# TODO: Fix Location-Based Toilet Display Issue

## Problem
- App only shows toilets in Delhi when using API
- When changing to other locations, no toilets are displayed
- No fallback to mock data when API fails or has no data for selected location

## Steps to Fix

- [x] Modify `loadInitialData` in `App.tsx` to fall back to mock data when API fails
- [ ] Update filtering logic to show mock data for selected locations when API data is unavailable
- [x] Import mock data in `App.tsx` for fallback
- [ ] Test the changes to ensure toilets show for all locations

## Files to Edit
- `project/src/App.tsx`: Update loadInitialData and filtering logic
