-- Get default category ID or create it if it doesn't exist
SET @categoryId = (SELECT id FROM program_categories WHERE name = 'General' LIMIT 1);

-- Create default category if none exists
INSERT INTO program_categories (id, name, description, color, isActive, createdAt, updatedAt)
SELECT 
    UUID(), 'General', 'General health programs', '#3B82F6', 1, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM program_categories WHERE name = 'General'
);

-- If category wasn't found before, get the ID we just created
SET @categoryId = COALESCE(@categoryId, (SELECT id FROM program_categories WHERE name = 'General' LIMIT 1));

-- Create Health Programs
-- 1. Weight Management Program
SET @weightProgramId = UUID();
INSERT INTO health_programs 
(id, name, description, categoryId, startDate, endDate, location, maxParticipants, status, createdAt, updatedAt)
VALUES 
(@weightProgramId, 'Weight Management Program', 'A comprehensive 12-week program designed to help participants achieve and maintain a healthy weight through balanced nutrition and regular physical activity.', 
@categoryId, DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'PHC Main Building, Floor 2', 30, 'active', NOW(), NOW());

-- 2. Diabetes Prevention Program
SET @diabetesProgramId = UUID();
INSERT INTO health_programs 
(id, name, description, categoryId, startDate, endDate, location, maxParticipants, status, createdAt, updatedAt)
VALUES 
(@diabetesProgramId, 'Diabetes Prevention Program', 'An evidence-based lifestyle change program focused on preventing type 2 diabetes through healthy eating habits, increased physical activity, and stress management techniques.', 
@categoryId, DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'PHC Diabetes Center', 25, 'active', NOW(), NOW());

-- 3. Heart Health Initiative
SET @heartProgramId = UUID();
INSERT INTO health_programs 
(id, name, description, categoryId, startDate, endDate, location, maxParticipants, status, createdAt, updatedAt)
VALUES 
(@heartProgramId, 'Heart Health Initiative', 'A program designed to promote cardiovascular wellness through education on heart-healthy nutrition, exercise, stress reduction, and regular health monitoring.', 
@categoryId, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 120 DAY), 'Cardiology Department', 20, 'active', NOW(), NOW());

-- 4. Mental Wellness Workshop
SET @mentalProgramId = UUID();
INSERT INTO health_programs 
(id, name, description, categoryId, startDate, endDate, location, maxParticipants, status, createdAt, updatedAt)
VALUES 
(@mentalProgramId, 'Mental Wellness Workshop', 'A supportive program providing strategies and tools for managing stress, anxiety, and depression while promoting mental wellbeing through mindfulness practices.', 
@categoryId, DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'PHC Community Room', 15, 'active', NOW(), NOW());

-- 5. Senior Fitness Program
SET @seniorProgramId = UUID();
INSERT INTO health_programs 
(id, name, description, categoryId, startDate, endDate, location, maxParticipants, status, createdAt, updatedAt)
VALUES 
(@seniorProgramId, 'Senior Fitness Program', 'A specialized program for older adults focusing on gentle exercises to improve balance, flexibility, and strength, reducing the risk of falls and enhancing quality of life.', 
@categoryId, DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'Senior Center', 20, 'active', NOW(), NOW());

-- 6. Smoking Cessation Support
SET @smokingProgramId = UUID();
INSERT INTO health_programs 
(id, name, description, categoryId, startDate, endDate, location, maxParticipants, status, createdAt, updatedAt)
VALUES 
(@smokingProgramId, 'Smoking Cessation Support', 'A structured program to help participants quit smoking through behavior modification techniques, support group sessions, and access to nicotine replacement therapies when appropriate.', 
@categoryId, DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'PHC Consultation Room', 15, 'active', NOW(), NOW());

-- Create Tasks for each Health Program
-- Tasks for Weight Management Program
INSERT INTO tasks (id, title, description, healthProgramId, priority, status, createdAt, updatedAt)
VALUES 
(UUID(), 'Initial Health Assessment', 'Complete the initial health assessment form and bring it to your first consultation.', @weightProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Attend Nutrition Workshop', 'Participate in the nutrition workshop to learn about balanced meal planning.', @weightProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Daily Food Journal', 'Maintain a daily food journal for at least 3 weeks.', @weightProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Weekly Exercise Plan', 'Complete the recommended exercise plan (3-4 sessions per week).', @weightProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Mid-program Assessment', 'Attend the mid-program assessment to track your progress.', @weightProgramId, 'high', 'active', NOW(), NOW());

-- Tasks for Diabetes Prevention Program
INSERT INTO tasks (id, title, description, healthProgramId, priority, status, createdAt, updatedAt)
VALUES 
(UUID(), 'Glucose Monitoring Training', 'Attend the session on how to monitor blood glucose levels.', @diabetesProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Diabetes Risk Assessment', 'Complete the diabetes risk assessment questionnaire.', @diabetesProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Healthy Cooking Class', 'Participate in the healthy cooking class focusing on low-glycemic index foods.', @diabetesProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Physical Activity Log', 'Maintain a physical activity log documenting at least 150 minutes of moderate activity per week.', @diabetesProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Follow-up Consultation', 'Attend the follow-up consultation to review your progress and adjust your plan.', @diabetesProgramId, 'high', 'active', NOW(), NOW());

-- Tasks for Heart Health Initiative
INSERT INTO tasks (id, title, description, healthProgramId, priority, status, createdAt, updatedAt)
VALUES 
(UUID(), 'Cardiovascular Assessment', 'Complete the initial cardiovascular health assessment.', @heartProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Heart-Healthy Diet Workshop', 'Attend the workshop on heart-healthy nutrition guidelines.', @heartProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Blood Pressure Monitoring', 'Learn to monitor and record your blood pressure regularly.', @heartProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Cardiac Exercise Program', 'Participate in the supervised cardiac-friendly exercise program.', @heartProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Stress Management Session', 'Attend the stress management and relaxation techniques session.', @heartProgramId, 'medium', 'active', NOW(), NOW());

-- Tasks for Mental Wellness Workshop
INSERT INTO tasks (id, title, description, healthProgramId, priority, status, createdAt, updatedAt)
VALUES 
(UUID(), 'Mental Health Screening', 'Complete the confidential mental health screening assessment.', @mentalProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Mindfulness Practice', 'Practice the daily mindfulness exercises for at least 10 minutes per day.', @mentalProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Stress Journal', 'Maintain a stress journal to identify triggers and patterns.', @mentalProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Group Support Session', 'Participate in at least 3 group support sessions.', @mentalProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Self-Care Plan Development', 'Develop a personalized self-care plan with your counselor.', @mentalProgramId, 'high', 'active', NOW(), NOW());

-- Tasks for Senior Fitness Program
INSERT INTO tasks (id, title, description, healthProgramId, priority, status, createdAt, updatedAt)
VALUES 
(UUID(), 'Mobility Assessment', 'Complete the initial mobility and balance assessment.', @seniorProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Chair Exercise Class', 'Attend at least 4 chair exercise classes.', @seniorProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Walking Program', 'Participate in the graduated walking program (start with 5 minutes and increase gradually).', @seniorProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Balance Training', 'Complete the recommended balance exercises at least 3 times per week.', @seniorProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Strength Building Workshop', 'Attend the gentle strength-building workshop.', @seniorProgramId, 'medium', 'active', NOW(), NOW());

-- Tasks for Smoking Cessation Support
INSERT INTO tasks (id, title, description, healthProgramId, priority, status, createdAt, updatedAt)
VALUES 
(UUID(), 'Smoking Habits Assessment', 'Complete the smoking habits and triggers assessment.', @smokingProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Set Quit Date', 'Work with your counselor to set a quit date and create a plan.', @smokingProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Nicotine Replacement Consultation', 'Consult with healthcare provider about nicotine replacement options if appropriate.', @smokingProgramId, 'medium', 'active', NOW(), NOW()),
(UUID(), 'Support Group Participation', 'Attend at least 4 smoking cessation support group meetings.', @smokingProgramId, 'high', 'active', NOW(), NOW()),
(UUID(), 'Coping Strategies Development', 'Develop and practice at least 3 coping strategies for managing cravings.', @smokingProgramId, 'medium', 'active', NOW(), NOW()); 