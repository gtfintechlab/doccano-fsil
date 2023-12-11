# New Changes

Added new changes for Sequence Labelling include 

- **Selection Text Display:** Displaying the selected text for annotation.
- **Time Spent on Annotation:** Capturing the amount of time spent annotating the object.
- **Label Change Tracking:** Recording whether the annotation label was modified or remained unchanged.

## Code Modifications

### Restructuring and Enhancements

The code has been restructured for better clarity and ease of modification. This includes:

- Improved code readability by restructuring and organizing the annotation statistics display.
- Improved backend functionality for capturing and storing annotation statistics in the database.

### New Feature: Sliding Button for Statistics Display

A sliding button has been added to the user interface to enable and disable the viewing of these additional statistics in the Sequence Labelling task page. 

## Backend Database Changes

### Addition of Statistics Storage

The backend database has been modified to accommodate the storage of additional statistics. This will help in future implementation of exporting these statistics

## Future Implementations

### Exporting Annotation Statistics

A future plan includes the addition of an option to export these statistics when downloading annotated labels, and looking at other tasks for inclusion of these statistics. 
