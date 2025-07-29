import React, { useState, useEffect } from 'react';
import './Edura.css';

const API_BASE_URL = '/api';

function Edura() {
  // Initialize state from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(
    JSON.parse(localStorage.getItem('isLoggedIn')) || false
  );
  const [loggedInUser, setLoggedInUser] = useState(
    JSON.parse(localStorage.getItem('loggedInUser')) || null
  );

  const [showRegister, setShowRegister] = useState(false);
  // If user is logged in on load, default to 'home', otherwise stay on default (which will render auth-container)
  const [currentPage, setCurrentPage] = useState(isLoggedIn ? 'home' : 'login');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form states (rest of these are unchanged)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDob, setRegDob] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchCourses();
    }
  }, [isLoggedIn]); // fetchCourses will run whenever isLoggedIn changes

  // New useEffect to handle initial page load after refresh
  useEffect(() => {
    // If the page was reloaded and user is logged in, ensure we are on 'home'
    if (isLoggedIn && currentPage === 'login') {
      setCurrentPage('home');
    }
  }, []); // Run only once on component mount

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedCourses = data.map(course => ({
        id: course.id,
        name: course.name,
        progress: course.progress,
        exams: {
          mid: course.mid_score,
          end: course.end_score
        }
      }));
      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // alert('Failed to load courses.'); // You might want to remove this alert for a smoother UX
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      setIsLoggedIn(true);
      setLoggedInUser(data.user);

      // Save login state and user info to localStorage
      localStorage.setItem('isLoggedIn', JSON.stringify(true));
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));

      setCurrentPage('home');
      setLoginUsername('');
      setLoginPassword('');
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          username: regUsername,
          password: regPassword,
          email: regEmail,
          dob: regDob,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      alert('Registration successful! Please log in.');
      setShowRegister(false);
      setRegName('');
      setRegUsername('');
      setRegPassword('');
      setRegEmail('');
      setRegDob('');
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const courseName = e.target.elements.courseName.value;
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: courseName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newCourse = await response.json();
      setCourses([...courses, {
        id: newCourse.id,
        name: newCourse.name,
        progress: newCourse.progress,
        exams: {
          mid: newCourse.mid_score,
          end: newCourse.end_score
        }
      }]);
      setCurrentPage('home'); // This correctly brings you back to home
      e.target.reset();
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course.');
    }
  };

  const handleOpenCourse = (course) => {
    setSelectedCourse(course);
    setCurrentPage('viewCourse');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedCourse(null);
  };

  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    localStorage.removeItem('isLoggedIn'); // Remove from localStorage
    localStorage.removeItem('loggedInUser'); // Remove from localStorage
    setCurrentPage('login'); // Go back to login screen
    setCourses([]); // Clear courses on logout
  };


  return (
    <div id="root">
      {!isLoggedIn ? (
        <div className="auth-container">
          <h1>Edura</h1>
          {showRegister ? (
            <form className="register-form" onSubmit={handleRegister}>
              <h2>Register</h2>
              <input type="text" placeholder="Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
              <input type="text" placeholder="Username" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
              <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
              <input type="email" placeholder="Email ID" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              <input type="date" placeholder="D.O.B" value={regDob} onChange={(e) => setRegDob(e.target.value)} required />
              <button type="submit">Register</button>
              <p>
                Already have an account?{' '}
                <span className="link" onClick={() => setShowRegister(false)}>
                  Login
                </span>
              </p>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleLogin}>
              <h2>Login</h2>
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
              <p>
                Don't have an account?{' '}
                <span className="link" onClick={() => setShowRegister(true)}>
                  Register
                </span>
              </p>
            </form>
          )}
        </div>
      ) : (
        <div className="main-app-container">
          <div className="header">
            <h1>Edura</h1>
            <div className="profile-section">
              <p>Welcome, {loggedInUser ? loggedInUser.name || loggedInUser.username : 'User'}</p>
              <button onClick={handleLogout}>Logout</button> {/* Use the new handleLogout function */}
            </div>
          </div>

          {currentPage === 'home' && (
            <div className="home-screen">
              <h2>Current Courses</h2>
              <button className="add-course-button" onClick={() => setCurrentPage('addCourse')}>
                + Add/Open Course
              </button>

              <div className="course-list">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className={`course-item ${selectedCourse && selectedCourse.id === course.id ? 'selected' : ''}`}
                      onClick={() => handleOpenCourse(course)}
                    >
                      <h3>{course.name}</h3>
                      <p>Progress: {course.progress}%</p>
                    </div>
                  ))
                ) : (
                  <p>No courses added yet. Add a new course!</p>
                )}
              </div>
            </div>
          )}

          {currentPage === 'addCourse' && (
            <div className="add-course-screen">
              <h2>Add Course</h2>
              <form onSubmit={handleAddCourse}>
                <input type="text" name="courseName" placeholder="Course Name" required />
                <button type="submit">Add Course</button>
                <button type="button" onClick={handleBackToHome}>
                  Back
                </button>
              </form>
            </div>
          )}

          {currentPage === 'viewCourse' && selectedCourse && (
            <div className="view-course-screen">
              <h2>{selectedCourse.name}</h2>
              <div className="progress-details">
                <p>Progress: {selectedCourse.progress}%</p>
                <h3>Exams Score:</h3>
                <ul>
                  <li>Mid: {selectedCourse.exams.mid}</li>
                  <li>End: {selectedCourse.exams.end}</li>
                </ul>
              </div>
              <button onClick={handleBackToHome}>Back to Courses</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Edura;