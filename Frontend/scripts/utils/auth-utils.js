// Get the logged-in user from localStorage
export function getUser() {
    const userStr = localStorage.getItem('user');
    try {
        const user = JSON.parse(userStr);
        if (!user?.id) throw new Error('No user found');
        return user;
    } catch (e) {
        return null;
    }
}

// Save user data to localStorage
export function saveUser(userData) {
    localStorage.setItem('user', JSON.stringify({
        id: userData.id,
        name: userData.name,
        email: userData.email
    }));
}

// Clear user data from localStorage
export function clearUser() {
    localStorage.removeItem('user');
}

// Check if user is logged in
export function isLoggedIn() {
    return getUser() !== null;
}

// Redirect to login if not authenticated
export function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Log out the user
export function logout() {
    clearUser();
    window.location.href = 'login.html';
}
