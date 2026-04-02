# EasyFinanceCRM PRD V3 - Comprehensive Verification Plan

This document outlines the step-by-step verification process to ensure all implemented features from PRD V3 (HR & Operations Focused) are functioning correctly in the live Vercel/Render environments.

## 1. HR & Employee Flow (4.6)

### Leave Management (The "Full-Proof" Loop)
1. **Apply for Leave**: Log in as `staff@easyfinancewale.in`. Navigate to the **HR & Operations** page. In the `Leave Requests` tab, apply for a 2-day Sick Leave.
2. **Review & Action**: Open an incognito window and log in as `admin@easyfinancewale.in`. Go to `HR & Operations -> Leave Requests`. Verify the staff's request appears as `Pending`. Click to `Approve` it.
3. **Notify & Announcement**: Return to the staff account. Verify that navigating back to the `HR` page shows the leave as `Approved`. Check the `Announcements` broadcast module or the top notification area to confirm an automatic notification was triggered for "Staff is on Sick Leave today".

### Employee CRUD & Virtual ID
1. Log in as an Admin. Navigate to the **Employees** directory.
2. Click **+ Add Employee**. Fill out the required details (Name, Valid Indian Phone #, Email, Password).
3. On save, verify that the new user is listed and that the backend has automatically assigned them an ID matching the format `EF-2026-###` instead of relying on manual input.

## 2. Franchise Operations (4.7)

### Support Issue Wiring
1. Log in as a Franchise user: `mumbaidsa@easyfinancewale.in` (password: `password`).
2. Navigate to the **Franchise** dashboard. Click the newly added **Raise Issue** button in the header.
3. Verify that you are rerouted to the Tickets page.
4. Create a new ticket, ensuring you select **"Franchise Issue"** from the Category dropdown.

## 3. Support Ticket Admin System (4.8)

### Threaded Replies & Transitions
1. Log in as an Admin (`admin@easyfinancewale...`). Navigate to **Support Tickets**.
2. Locate the "Franchise Issue" ticket you just created in the prior step and open it.
3. In the conversation view header, verify that the Admin controls (dropdowns) appear.
4. **Assignee Test**: Select your own name from the **Unassigned** dropdown to assign it to yourself. Verify the success toast appears.
5. **State Transition Test**: Change the status dropdown from `Open` to `In Progress`, then to `Resolved`. Reply to the ticket to ensure threaded messaging works alongside state changes.

## 4. LMS Knowledge Base (4.9)

### Content Uploads
1. Ensure you are logged in as an Admin/Manager. Navigate to the **Knowledge Base (LMS)**.
2. In the `Courses` tab, click **+ Add Course**. Fill out a test course called "New Employee Onboarding" and hit submit. Verify it appears in the grid.
3. Go to the `Study Resources` tab. Click **+ Upload Material**. Fill out a mock title ("Testing PDF Upload"), select the `Loans` category, and attach a small PDF file from your computer.
4. Verify the file uploads correctly and appears in the table with a functioning "View/Download" link pointing correctly to the backend's `/storage/lms-materials/` route.

