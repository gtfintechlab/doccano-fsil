# New Changes

Added new changes for Sequence Labelling include 

- **Selection Text Display:** Displaying the selected text for annotation.
- **Time Spent on Annotation:** Capturing the amount of time spent annotating the object.
- **Label Change Tracking:** Recording whether the annotation label was modified or remained unchanged.

## Code Modifications

### Restructuring and Enhancements

- Improved code readability through comments and restructuring.
- Added backend functionality for capturing and storing annotation statistics in the database.

### New Feature: Sliding Button for Statistics Display

A sliding button has been added to the user interface of the Sequence Labelling task page to enable and disable the viewing of these additional statistics. 

## Backend Database Changes

### Addition of Statistics Storage

The backend database has been modified to accommodate the storage of additional statistics. This will help in future implementation of exporting these statistics

## Future Implementations

### Exporting Annotation Statistics

A future plan includes the addition of an option to export these statistics when downloading annotated labels, and looking at other tasks for inclusion of these statistics and other useful metrics. 
