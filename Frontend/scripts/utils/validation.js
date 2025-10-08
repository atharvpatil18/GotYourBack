// Validate item data
export function validateItem(itemData) {
    const errors = [];

    if (!itemData.name || itemData.name.trim().length < 3) {
        errors.push('Item name must be at least 3 characters long');
    }

    if (!itemData.description || itemData.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
    }

    if (!itemData.category) {
        errors.push('Category is required');
    }

    if (!itemData.type) {
        errors.push('Item type is required');
    }

    return errors;
}

// Validate profile data
export function validateProfile(profileData) {
    const errors = [];

    if (!profileData.name || profileData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    if (profileData.department && profileData.department.trim().length < 2) {
        errors.push('Department must be at least 2 characters long');
    }

    if (profileData.registrationNumber && !/^\d{8,}$/.test(profileData.registrationNumber)) {
        errors.push('Registration number must be at least 8 digits');
    }

    if (profileData.yearOfStudy && (!Number.isInteger(profileData.yearOfStudy) || profileData.yearOfStudy < 1 || profileData.yearOfStudy > 5)) {
        errors.push('Year of study must be between 1 and 5');
    }

    return errors;
}

// Validate login data
export function validateLogin(loginData) {
    const errors = [];

    if (!loginData.email || !isValidEmail(loginData.email)) {
        errors.push('Please enter a valid email address');
    }

    if (!loginData.password || loginData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    return errors;
}

// Validate signup data
export function validateSignup(signupData) {
    const errors = [];

    if (!signupData.name || signupData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    if (!signupData.email || !isValidEmail(signupData.email)) {
        errors.push('Please enter a valid email address');
    }

    if (!signupData.password || signupData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (signupData.password !== signupData.confirmPassword) {
        errors.push('Passwords do not match');
    }

    return errors;
}

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
