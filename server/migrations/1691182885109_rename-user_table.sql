-- This migration renames the user table to be dp_user to avoid conflict with railway's default user

-- Delete the columns that are no longer needed
ALTER TABLE "user" RENAME TO dp_user;