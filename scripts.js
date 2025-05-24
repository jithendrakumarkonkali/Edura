document.addEventListener('DOMContentLoaded', () => {
    // --- REGISTRATION & LOGIN ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');
    const welcomeMessage = document.getElementById('welcomeMessage');

    // Simulated Email Verification Message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('unverified_email')) {
        alert(`Account created for ${urlParams.get('unverified_email')}. A confirmation email has been "sent". Please check your email to "verify" your account before logging in. (This is a demo simulation).`);
    }
    if (urlParams.has('verified_email')) {
        alert(`Email ${urlParams.get('verified_email')} "verified"! You can now log in.`);
    }


    if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html')) {
        if (localStorage.getItem('loggedInUser')) {
            window.location.href = 'dashboard.html';
        }
    }

    if (window.location.pathname.endsWith('dashboard.html')) {
        const currentUser = localStorage.getItem('loggedInUser');
        if (!currentUser) {
            window.location.href = 'login.html';
        } else {
            // Check if user is verified (simplified for demo)
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userData = users.find(u => u.username === currentUser);
            if (userData && !userData.isVerified) {
                // In a real app, you might have a grace period or redirect to a 'please verify' page.
                // For this demo, we'll allow access but could show a banner.
                // Or, strictly:
                // alert('Please verify your email before accessing the dashboard.');
                // handleLogout(); // Force logout
                // return;
                console.warn("User email not verified (demo).");
            }
            displayUserData();
            initializeDashboard();
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    function handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value; // Get password

        if (username && password) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === username && u.password === password); // Check password

            if (user) {
                if (!user.isVerified) {
                    // Simulate a "Verify Email" button or link for the demo
                    // In a real app, this flow would be different (e.g., resend email option)
                    const simulateVerification = confirm(`User ${username} is not verified. For demo purposes, do you want to simulate email verification now?`);
                    if (simulateVerification) {
                        user.isVerified = true;
                        localStorage.setItem('users', JSON.stringify(users));
                        alert(`Email for ${user.email} "verified"! You can now log in.`);
                        // Optionally, auto-login or redirect to login again
                        window.location.href = `login.html?verified_email=${encodeURIComponent(user.email)}`;
                        return;
                    } else {
                        alert('Please verify your email to login. A confirmation link was "sent" during registration.');
                        return;
                    }
                }
                localStorage.setItem('loggedInUser', username);
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid username or password.');
            }
        } else {
            alert('Please enter username and password.');
        }
    }

    function handleRegister(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const dob = document.getElementById('dob').value;
        const password = document.getElementById('password').value;

        if (username && email && dob && password) {
            let users = JSON.parse(localStorage.getItem('users')) || [];

            if (users.find(user => user.username === username)) {
                alert('Username already exists!');
                return;
            }
            if (users.find(user => user.email === email)) {
                alert('Email address already registered! Please use a different email or login.');
                return;
            }

            users.push({ username, email, dob, password, isVerified: false }); // Store password (hashed in real app!), set isVerified to false
            localStorage.setItem('users', JSON.stringify(users));

            // Simulate sending confirmation email
            console.log(`SIMULATING: Sending confirmation email to ${email}`);
            // alert('Registration successful! A confirmation email has been "sent". Please check your email to "verify" your account. (This is a demo simulation).');
            // Redirect to login page with a message
            window.location.href = `login.html?unverified_email=${encodeURIComponent(email)}`;

        } else {
            alert('Please fill in all fields.');
        }
    }

    function handleLogout() {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }

    function displayUserData() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser && welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${loggedInUser}!`;
        }
    }

    // --- DASHBOARD & COURSE MANAGEMENT ---
    // (Will be heavily modified below)

    function getCoursesKey() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        return loggedInUser ? `${loggedInUser}_courses_v2` : 'guest_courses_v2'; // Versioned key for new structure
    }

    function getCourses() {
        return JSON.parse(localStorage.getItem(getCoursesKey())) || [];
    }

    function saveCourses(courses) {
        localStorage.setItem(getCoursesKey(), JSON.stringify(courses));
    }

    function initializeDashboard() {
        // --- MODAL ELEMENTS ---
        const addCourseModal = document.getElementById('addCourseModal');
        const openAddCourseModalButton = document.getElementById('openAddCourseModalButton'); // New button to open modal
        const closeCourseModalButton = document.getElementById('closeCourseModalButton');
        const courseConfigForm = document.getElementById('courseConfigForm');
        const quizzesConfigContainer = document.getElementById('quizzesConfigContainer');
        const addQuizConfigButton = document.getElementById('addQuizConfigButton');
        const courseConfigTitle = document.getElementById('courseConfigTitle');
        const courseIdInput = document.getElementById('courseId'); // Hidden input for editing

        // --- COURSE DETAIL VIEW ELEMENTS (some are new/modified) ---
        const courseDetailView = document.getElementById('courseDetailView');
        const closeDetailViewButton = document.getElementById('closeDetailViewButton');
        const updateScoresButton = document.getElementById('updateScoresButton'); // Replaces updateProgressButton
        const detailCourseName = document.getElementById('detailCourseName');
        const detailCourseProgress = document.getElementById('detailCourseProgress');
        const detailProgressBar = document.getElementById('detailProgressBar');
        const courseConfigDisplay = document.getElementById('courseConfigDisplay'); // To show weightages
        const scoresInputContainer = document.getElementById('scoresInputContainer'); // For dynamic score fields
        const editConfigButton = document.getElementById('editConfigButton'); // New button in detail view

        // --- WEEKLY PROGRESS ELEMENTS (Placeholder) ---
        const weeklyProgressSection = document.getElementById('weeklyProgressSection');
        const addWeeklyTaskForm = document.getElementById('addWeeklyTaskForm');
        const weeklyTasksList = document.getElementById('weeklyTasksList');
        const currentWeekDisplay = document.getElementById('currentWeekDisplay'); // To show which week's tasks
        const weeklyProgressBar = document.getElementById('weeklyProgressBar'); // Specific for weekly tasks


        // --- Event Listeners ---
        if (openAddCourseModalButton) {
            openAddCourseModalButton.addEventListener('click', () => {
                courseConfigTitle.textContent = "Add New Course";
                courseConfigForm.reset();
                quizzesConfigContainer.innerHTML = ''; // Clear previous dynamic quizzes
                courseIdInput.value = ''; // Ensure no ID for new course
                addCourseModal.style.display = 'block';
            });
        }

        if (closeCourseModalButton) {
            closeCourseModalButton.addEventListener('click', () => {
                addCourseModal.style.display = 'none';
            });
        }
        
        if (window) { // Close modal if clicked outside
            window.onclick = function(event) {
                if (event.target == addCourseModal) {
                    addCourseModal.style.display = "none";
                }
            }
        }

        if (addQuizConfigButton) {
            addQuizConfigButton.addEventListener('click', () => addQuizConfigField());
        }

        if (courseConfigForm) {
            courseConfigForm.addEventListener('submit', handleSaveCourseConfiguration);
        }
        
        if (editConfigButton) {
            editConfigButton.addEventListener('click', () => {
                const courseId = courseDetailView.dataset.currentCourseId;
                const courses = getCourses();
                const courseToEdit = courses.find(c => c.id === courseId);
                if (courseToEdit) {
                    populateCourseConfigModal(courseToEdit);
                    addCourseModal.style.display = 'block';
                }
            });
        }

        if (closeDetailViewButton) {
            closeDetailViewButton.addEventListener('click', () => {
                courseDetailView.style.display = 'none';
                document.querySelectorAll('.course-item.selected').forEach(item => item.classList.remove('selected'));
            });
        }
        
        if (updateScoresButton) {
            updateScoresButton.addEventListener('click', handleUpdateScoresAndProgress);
        }

        // --- WEEKLY TASK LISTENERS (Basic) ---
        if (addWeeklyTaskForm) {
            addWeeklyTaskForm.addEventListener('submit', handleAddWeeklyTask);
        }


        loadCourses(); // Initial load of courses onto the dashboard
    }
    
    function addQuizConfigField(quiz = null) {
        const quizzesConfigContainer = document.getElementById('quizzesConfigContainer');
        const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`; // Unique ID for the quiz field
        
        const quizDiv = document.createElement('div');
        quizDiv.classList.add('quiz-config-item');
        quizDiv.innerHTML = `
            <input type="text" name="quizName_${quizId}" placeholder="Quiz Name (e.g., Quiz 1)" value="${quiz ? quiz.name : ''}" required>
            <input type="number" name="quizWeightage_${quizId}" placeholder="Weightage (%)" min="0" max="100" value="${quiz ? quiz.weightage : ''}" required>
            <button type="button" class="remove-quiz-btn_modal">Remove</button>
        `;
        quizzesConfigContainer.appendChild(quizDiv);
        quizDiv.querySelector('.remove-quiz-btn_modal').addEventListener('click', () => quizDiv.remove());
    }

    function handleSaveCourseConfiguration(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const courseId = formData.get('courseId'); // Will be empty for new, populated for edit
        const courseName = formData.get('courseName');

        let totalWeightage = 0;
        const config = {
            weightages: {
                midTerm: parseInt(formData.get('midTermWeightage')) || 0,
                endTerm: parseInt(formData.get('endTermWeightage')) || 0,
                project: parseInt(formData.get('projectWeightage')) || 0,
                quizzes: []
            }
        };
        totalWeightage += config.weightages.midTerm + config.weightages.endTerm + config.weightages.project;

        // Collect quiz configurations
        const quizItems = document.querySelectorAll('#quizzesConfigContainer .quiz-config-item');
        quizItems.forEach(item => {
            const nameInput = item.querySelector('input[type="text"]');
            const weightageInput = item.querySelector('input[type="number"]');
            const quizName = nameInput.value.trim();
            const quizWeightage = parseInt(weightageInput.value) || 0;
            if (quizName && quizWeightage > 0) {
                config.weightages.quizzes.push({ 
                    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`, // Unique ID for the actual quiz
                    name: quizName, 
                    weightage: quizWeightage 
                });
                totalWeightage += quizWeightage;
            }
        });
        
        if (totalWeightage !== 100) {
            alert(`Total weightage must be 100%. Current total is ${totalWeightage}%. Please adjust.`);
            return;
        }

        let courses = getCourses();
        if (courseId) { // Editing existing course
            const courseIndex = courses.findIndex(c => c.id === courseId);
            if (courseIndex > -1) {
                courses[courseIndex].name = courseName;
                courses[courseIndex].config = config;
                // Note: Scores for quizzes might need re-mapping if quiz structure changes significantly.
                // For simplicity, we'll assume users manage this or we reset quiz scores on major config change.
                // Let's ensure scores.quizzes array matches the new config.quizzes structure.
                courses[courseIndex].scores.quizzes = config.weightages.quizzes.map(qConf => {
                    const existingScore = courses[courseIndex].scores.quizzes.find(qs => qs.id === qConf.id);
                    return { id: qConf.id, name: qConf.name, score: existingScore ? existingScore.score : null };
                });

            }
        } else { // Adding new course
            const newCourse = {
                id: `course_${Date.now()}`,
                name: courseName,
                config: config,
                scores: { // Initialize scores structure
                    midTerm: null,
                    endTerm: null,
                    project: null,
                    quizzes: config.weightages.quizzes.map(q => ({ id: q.id, name: q.name, score: null }))
                },
                overallProgress: 0,
                weeklyLogs: [] // Initialize weekly logs
            };
            courses.push(newCourse);
        }

        saveCourses(courses);
        loadCourses(); // Reload course list on dashboard
        document.getElementById('addCourseModal').style.display = 'none'; // Close modal
        if(courseId && document.getElementById('courseDetailView').dataset.currentCourseId === courseId){
             openCourseDetails(courseId); // Refresh detail view if it was the edited course
        }
    }
    
    function populateCourseConfigModal(course) {
        document.getElementById('courseConfigTitle').textContent = `Edit Configuration for ${course.name}`;
        document.getElementById('courseId').value = course.id;
        document.getElementById('modalCourseName').value = course.name;
        document.getElementById('modalMidTermWeightage').value = course.config.weightages.midTerm;
        document.getElementById('modalEndTermWeightage').value = course.config.weightages.endTerm;
        document.getElementById('modalProjectWeightage').value = course.config.weightages.project;
        
        const quizzesContainer = document.getElementById('quizzesConfigContainer');
        quizzesContainer.innerHTML = ''; // Clear existing
        course.config.weightages.quizzes.forEach(quiz => {
            addQuizConfigField(quiz); // Pass existing quiz data to prefill
        });
    }


    function calculateOverallProgress(course) {
        let calculatedProgress = 0;
        const { weightages } = course.config;
        const { scores } = course;

        if (weightages.midTerm > 0 && scores.midTerm !== null) {
            calculatedProgress += (scores.midTerm / 100) * weightages.midTerm; // Assuming scores are out of 100
        }
        if (weightages.endTerm > 0 && scores.endTerm !== null) {
            calculatedProgress += (scores.endTerm / 100) * weightages.endTerm;
        }
        if (weightages.project > 0 && scores.project !== null) {
            calculatedProgress += (scores.project / 100) * weightages.project;
        }

        weightages.quizzes.forEach(quizConfig => {
            const quizScoreEntry = scores.quizzes.find(qs => qs.id === quizConfig.id);
            if (quizConfig.weightage > 0 && quizScoreEntry && quizScoreEntry.score !== null) {
                calculatedProgress += (quizScoreEntry.score / 100) * quizConfig.weightage;
            }
        });
        
        return Math.round(calculatedProgress);
    }

    function renderCourse(course) {
        const courseListDiv = document.getElementById('courseList');
        if (!courseListDiv) return;

        const courseItem = document.createElement('div');
        courseItem.classList.add('course-item');
        courseItem.dataset.courseId = course.id;
        
        // Recalculate progress before rendering, in case scores were updated elsewhere or on load
        course.overallProgress = calculateOverallProgress(course);

        courseItem.innerHTML = `
            <h3>${course.name}</h3>
            <p>Progress: <span class="progress-value">${course.overallProgress}</span>%</p>
            <div class="progress-bar-container-list">
                <div class="progress-bar-list" style="width: ${course.overallProgress}%;"></div>
            </div>
            <button class="open-course-btn">Open Details</button>
            <button class="delete-course-btn">Delete</button>
        `;
        courseListDiv.appendChild(courseItem);

        courseItem.querySelector('.open-course-btn').addEventListener('click', () => openCourseDetails(course.id));
        courseItem.querySelector('.delete-course-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCourse(course.id, courseItem);
        });
    }

    function deleteCourse(courseId, courseItemElement) {
        if (confirm('Are you sure you want to delete this course and all its data?')) {
            let courses = getCourses();
            courses = courses.filter(c => c.id !== courseId);
            saveCourses(courses);
            courseItemElement.remove();
            const courseDetailView = document.getElementById('courseDetailView');
            if (courseDetailView.dataset.currentCourseId === courseId) {
                 courseDetailView.style.display = 'none';
            }
        }
    }

    function loadCourses() {
        const courses = getCourses();
        const courseListDiv = document.getElementById('courseList');
        if (courseListDiv) {
            courseListDiv.innerHTML = '';
            courses.forEach(course => renderCourse(course));
        }
    }

    function openCourseDetails(courseId) {
        const courses = getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        document.querySelectorAll('.course-item').forEach(item => item.classList.remove('selected'));
        const courseItemElement = document.querySelector(`.course-item[data-course-id="${courseId}"]`);
        if (courseItemElement) courseItemElement.classList.add('selected');

        const courseDetailView = document.getElementById('courseDetailView');
        courseDetailView.style.display = 'block';
        courseDetailView.dataset.currentCourseId = courseId;

        detailCourseName.textContent = course.name;
        
        // Recalculate and display overall progress
        course.overallProgress = calculateOverallProgress(course);
        detailCourseProgress.textContent = course.overallProgress;
        detailProgressBar.style.width = `${course.overallProgress}%`;
        detailProgressBar.textContent = `${course.overallProgress}%`;
        
        // Display Configuration
        const configDisplay = document.getElementById('courseConfigDisplay');
        let configHtml = '<h4>Weightages:</h4><ul>';
        configHtml += `<li>Mid-Term: ${course.config.weightages.midTerm}%</li>`;
        configHtml += `<li>End-Term: ${course.config.weightages.endTerm}%</li>`;
        configHtml += `<li>Project: ${course.config.weightages.project}%</li>`;
        course.config.weightages.quizzes.forEach(q => {
            configHtml += `<li>${q.name}: ${q.weightage}%</li>`;
        });
        configHtml += '</ul>';
        configDisplay.innerHTML = configHtml;

        // Populate Score Inputs
        const scoresContainer = document.getElementById('scoresInputContainer');
        scoresContainer.innerHTML = ''; // Clear previous

        // Mid-Term Score
        scoresContainer.innerHTML += `
            <div class="score-input-group">
                <label for="score_midTerm">Mid-Term Score (out of 100):</label>
                <input type="number" id="score_midTerm" data-score-type="midTerm" value="${course.scores.midTerm !== null ? course.scores.midTerm : ''}" min="0" max="100">
            </div>`;
        // End-Term Score
        scoresContainer.innerHTML += `
            <div class="score-input-group">
                <label for="score_endTerm">End-Term Score (out of 100):</label>
                <input type="number" id="score_endTerm" data-score-type="endTerm" value="${course.scores.endTerm !== null ? course.scores.endTerm : ''}" min="0" max="100">
            </div>`;
        // Project Score
        if (course.config.weightages.project > 0) { // Only show if project has weightage
            scoresContainer.innerHTML += `
                <div class="score-input-group">
                    <label for="score_project">Project Score (out of 100):</label>
                    <input type="number" id="score_project" data-score-type="project" value="${course.scores.project !== null ? course.scores.project : ''}" min="0" max="100">
                </div>`;
        }
        // Quiz Scores
        course.config.weightages.quizzes.forEach(quizConfig => {
            const quizScoreEntry = course.scores.quizzes.find(qs => qs.id === quizConfig.id);
            scoresContainer.innerHTML += `
                <div class="score-input-group">
                    <label for="score_quiz_${quizConfig.id}">${quizConfig.name} Score (out of 100):</label>
                    <input type="number" id="score_quiz_${quizConfig.id}" data-score-type="quiz" data-quiz-id="${quizConfig.id}" value="${quizScoreEntry && quizScoreEntry.score !== null ? quizScoreEntry.score : ''}" min="0" max="100">
                </div>`;
        });
        
        // --- WEEKLY PROGRESS UI (Basic setup) ---
        document.getElementById('weeklyProgressCourseTitle').textContent = course.name;
        loadWeeklyTasksForCourse(courseId); // Function to implement
    }

    function handleUpdateScoresAndProgress() {
        const courseDetailView = document.getElementById('courseDetailView');
        const courseId = courseDetailView.dataset.currentCourseId;
        if (!courseId) return;

        let courses = getCourses();
        const courseIndex = courses.findIndex(c => c.id === courseId);
        if (courseIndex === -1) return;

        const course = courses[courseIndex];

        // Update scores from inputs
        const midTermScoreInput = document.getElementById('score_midTerm');
        if (midTermScoreInput) course.scores.midTerm = midTermScoreInput.value !== '' ? parseInt(midTermScoreInput.value) : null;

        const endTermScoreInput = document.getElementById('score_endTerm');
        if (endTermScoreInput) course.scores.endTerm = endTermScoreInput.value !== '' ? parseInt(endTermScoreInput.value) : null;
        
        const projectScoreInput = document.getElementById('score_project');
        if (projectScoreInput) course.scores.project = projectScoreInput.value !== '' ? parseInt(projectScoreInput.value) : null;

        course.config.weightages.quizzes.forEach(quizConfig => {
            const quizScoreInput = document.getElementById(`score_quiz_${quizConfig.id}`);
            if (quizScoreInput) {
                const scoreVal = quizScoreInput.value !== '' ? parseInt(quizScoreInput.value) : null;
                let quizScoreEntry = course.scores.quizzes.find(qs => qs.id === quizConfig.id);
                if (quizScoreEntry) {
                    quizScoreEntry.score = scoreVal;
                } else { // Should not happen if initialized correctly
                    course.scores.quizzes.push({ id: quizConfig.id, name: quizConfig.name, score: scoreVal });
                }
            }
        });
        
        // Recalculate overall progress
        course.overallProgress = calculateOverallProgress(course);
        
        saveCourses(courses);
        openCourseDetails(courseId); // Refresh the detail view
        loadCourses(); // Refresh course list on dashboard (to update progress there)
        alert('Scores and progress updated!');
    }


    // --- WEEKLY TASK FUNCTIONS (Basic Implementation) ---
    function loadWeeklyTasksForCourse(courseId) {
        const courses = getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
    
        const weeklyTasksListEl = document.getElementById('weeklyTasksList');
        weeklyTasksListEl.innerHTML = ''; // Clear old tasks
        document.getElementById('currentWeekInput').value = (course.weeklyLogs.length > 0 ? Math.max(...course.weeklyLogs.map(wl => wl.weekNumber)) : 1); // Default to last week or 1
    
        displayTasksForWeek(courseId, parseInt(document.getElementById('currentWeekInput').value));
        updateWeeklyProgressBar(courseId, parseInt(document.getElementById('currentWeekInput').value));
    }
    
    document.getElementById('currentWeekInput')?.addEventListener('change', (e) => {
        const courseId = document.getElementById('courseDetailView').dataset.currentCourseId;
        if(courseId) displayTasksForWeek(courseId, parseInt(e.target.value));
    });

    function displayTasksForWeek(courseId, weekNumber) {
        const courses = getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        const weeklyTasksListEl = document.getElementById('weeklyTasksList');
        weeklyTasksListEl.innerHTML = ''; // Clear tasks from other weeks

        const weekLog = course.weeklyLogs.find(wl => wl.weekNumber === weekNumber);
        if (weekLog && weekLog.tasks) {
            weekLog.tasks.forEach(task => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox" id="task_${task.id}" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    <label for="task_${task.id}" class="${task.completed ? 'completed-task' : ''}">${task.description}</label>
                    <button class="delete-task-btn" data-task-id="${task.id}">×</button>
                `;
                li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => toggleWeeklyTask(courseId, weekNumber, task.id, e.target.checked));
                li.querySelector('.delete-task-btn').addEventListener('click', () => deleteWeeklyTask(courseId, weekNumber, task.id));
                weeklyTasksListEl.appendChild(li);
            });
        }
        updateWeeklyProgressBar(courseId, weekNumber);
    }

    function handleAddWeeklyTask(event) {
        event.preventDefault();
        const courseId = document.getElementById('courseDetailView').dataset.currentCourseId;
        const weekNumber = parseInt(document.getElementById('currentWeekInput').value);
        const taskDescription = document.getElementById('newTaskDescription').value.trim();

        if (!courseId || !taskDescription || isNaN(weekNumber) || weekNumber < 1) {
            alert("Please select a valid week and enter task description.");
            return;
        }

        let courses = getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        let weekLog = course.weeklyLogs.find(wl => wl.weekNumber === weekNumber);
        if (!weekLog) {
            weekLog = { weekNumber: weekNumber, tasks: [], progress: 0 };
            course.weeklyLogs.push(weekLog);
            course.weeklyLogs.sort((a,b) => a.weekNumber - b.weekNumber); // Keep sorted
        }

        weekLog.tasks.push({ id: `task_${Date.now()}`, description: taskDescription, completed: false });
        
        saveCourses(courses);
        displayTasksForWeek(courseId, weekNumber); // Refresh task list
        document.getElementById('newTaskDescription').value = ''; // Clear input
    }

    function toggleWeeklyTask(courseId, weekNumber, taskId, isCompleted) {
        let courses = getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
        const weekLog = course.weeklyLogs.find(wl => wl.weekNumber === weekNumber);
        if (!weekLog) return;
        const task = weekLog.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = isCompleted;
        saveCourses(courses);
        displayTasksForWeek(courseId, weekNumber); // Refresh to update style and progress bar
    }
    
    function deleteWeeklyTask(courseId, weekNumber, taskId) {
        if (!confirm("Delete this task?")) return;
        let courses = getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
        const weekLog = course.weeklyLogs.find(wl => wl.weekNumber === weekNumber);
        if (!weekLog) return;
        
        weekLog.tasks = weekLog.tasks.filter(t => t.id !== taskId);
        
        // If weekLog has no tasks left, optionally remove the weekLog entry
        if (weekLog.tasks.length === 0) {
            course.weeklyLogs = course.weeklyLogs.filter(wl => wl.weekNumber !== weekNumber);
        }

        saveCourses(courses);
        displayTasksForWeek(courseId, weekNumber);
    }


    function updateWeeklyProgressBar(courseId, weekNumber) {
        const courses = getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
        const weekLog = course.weeklyLogs.find(wl => wl.weekNumber === weekNumber);
        
        const progressBarEl = document.getElementById('weeklyProgressBar');
        const progressTextEl = document.getElementById('weeklyProgressText');


        if (weekLog && weekLog.tasks && weekLog.tasks.length > 0) {
            const completedTasks = weekLog.tasks.filter(t => t.completed).length;
            const totalTasks = weekLog.tasks.length;
            const progress = Math.round((completedTasks / totalTasks) * 100);
            weekLog.progress = progress; // Save it to the log
            
            progressBarEl.style.width = `${progress}%`;
            progressTextEl.textContent = `${progress}% Completed (Week ${weekNumber})`;
        } else {
            progressBarEl.style.width = '0%';
            progressTextEl.textContent = `No tasks for Week ${weekNumber}`;
            if(weekLog) weekLog.progress = 0;
        }
        // No need to call saveCourses here if only reading, but if weekLog.progress is updated, then yes.
        // The toggle/add/delete functions already save.
    }

});