# EasyFinance CRM - Final Functional Refinements

This plan outlines the steps to resolve the remaining functional issues and UI/UX polish requested by the user.

## User Review Required

> [!IMPORTANT]
> The "Mark Today's" button mentioned as unnecessary in the Admin module was not found in the current codebase. I will ensure no such redundant button exists in the final pass.
> 
> [!NOTE]
> The "Pull to Refresh" feature will be implemented as a global touch-handler in the `MainLayout` or specifically in the `Dashboard` for mobile users.

## Proposed Changes

### [HR Module]
- **Attendance**: Functional "Mark Attendance" button added to `HR.jsx` which redirects to the geofenced `MyAttendance.jsx` page.
- **Cleanup**: Verify and remove any "Mark Today's" bulk attendance buttons if they appear in Admin views.

### [Training & LMS]
#### [MODIFY] [LMS.jsx](file:///c:/Users/parma/Downloads/EasyFinanceCRM-Hostinger%20%281%29/EasyFinanceCRM/frontend/src/pages/LMS.jsx)
- **Search**: Integrated global search query context.
- **Materials**: Fixed file path resolution for storage-based downloads and viewing.
- **Quizzes**: 
    - Implement a robust quiz question loader that handles missing `questions` arrays.
    - Ensure "Start Quiz" button correctly transitions to the `QuizPlayer` with pre-loaded data.
- **Upload**: Ensure the upload material modal handles `FormData` correctly for the backend.

### [Franchise Module]
#### [MODIFY] [Franchise.jsx](file:///c:/Users/parma/Downloads/EasyFinanceCRM-Hostinger%20%281%29/EasyFinanceCRM/frontend/src/pages/Franchise.jsx)
#### [MODIFY] [FranchiseModal.jsx](file:///c:/Users/parma/Downloads/EasyFinanceCRM-Hostinger%20%281%29/EasyFinanceCRM/frontend/src/components/FranchiseModal.jsx)
- **Form**: Add a "Type" dropdown to the Franchise creation/edit form (Options: Standard, Master, Partner).
- **Payouts**: 
    - Add a new "Payouts" tab to the Franchise detail modal.
    - Display commission-based payouts fetched from `/franchises/{id}/payouts`.
- **Logic**: Ensure commission rate calculations are displayed clearly.

### [Reports & Analytics]
#### [MODIFY] [Reports.jsx](file:///c:/Users/parma/Downloads/EasyFinanceCRM-Hostinger%20%281%29/EasyFinanceCRM/frontend/src/pages/Reports.jsx)
- **Data Load**: Debug `fetchStats` to ensure all charts populate correctly even with minimal data.
- **Leads Analysis**: Enhance the lead funnel view with more granular stage data.
- **Financials**: 
    - Implement the "Financials" report view (Revenue, Expenses, Net Profit).
    - Map data from `/reports/revenue-trends`.
- **Cleanup**: Remove the "Export CSV" button as requested.

### [Announcements]
#### [MODIFY] [Announcements.jsx](file:///c:/Users/parma/Downloads/EasyFinanceCRM-Hostinger%20%281%29/EasyFinanceCRM/frontend/src/pages/Announcements.jsx)
- **Search**: Add a dropdown-style or inline search bar to filter the announcements feed by title or content.

### [ID Card Module]
#### [MODIFY] [IDCard.jsx](file:///c:/Users/parma/Downloads/EasyFinanceCRM-Hostinger%20%281%29/EasyFinanceCRM/frontend/src/pages/IDCard.jsx)
- **Selection**: Add a "User Selector" for Admin/Manager roles to generate ID cards for any employee.
- **Filtering**: Implement the user filter logic to fetch and display the selected user's data.
- **Print/PDF**: 
    - Fix the `@media print` styles to ensure only the card is printed.
    - Improve the "Download Card" logic to generate a high-quality image/PDF of the current view.

### [General & Dashboard]
#### [MODIFY] [MainLayout.jsx](file:///c:/Users/parma/Downloads/EasyFinanceCRM-Hostinger%20%281%29/EasyFinanceCRM/frontend/src/components/MainLayout.jsx)
#### [MODIFY] [Dashboard.jsx](file:///c:/Users/parma/Downloads/EasyFinanceCRM-Hostinger%20%281%29/EasyFinanceCRM/frontend/src/pages/Dashboard.jsx)
- **Pull to Refresh**: Implement a `touchmove` based refresh trigger for the Dashboard and main list views.
- **Follow-up**: Ensure Dashboard follow-up cards correctly link to the Leads page with the search query pre-filled (Done).

## Verification Plan

### Automated Tests
- Manual browser testing of the "Mark Attendance" flow.
- Verification of file downloads in the LMS module.
- Testing the ID card print functionality for different users.

### Manual Verification
- Verify that the "Export CSV" button is gone from the Reports page.
- Check that the global search filters the Announcements feed.
- Test the "Pull to Refresh" gesture on a mobile simulator/device.
