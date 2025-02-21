// utils/dataValidator.js

/**
 * Safely truncates strings to specified length while preserving words
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length allowed
 * @param {boolean} preserveWords - Whether to preserve whole words
 * @returns {string} Truncated string
 */
const safelyTruncateString = (str, maxLength = 100, preserveWords = true) => {
    if (!str) return str;
    if (str.length <= maxLength) return str;
    
    if (preserveWords) {
        // Truncate at last space before maxLength
        const truncated = str.substr(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        return lastSpace > 0 ? truncated.substr(0, lastSpace) : truncated;
    }
    
    return str.substr(0, maxLength);
};

/**
 * Validates and sanitizes job posting data
 * @param {Object} jobData - Job posting data
 * @returns {Object} Sanitized job data
 */
const sanitizeJobData = (jobData) => {
    const sanitized = { ...jobData };

    // Sanitize basic info
    if (sanitized.basicInfo) {
        sanitized.basicInfo.company = safelyTruncateString(sanitized.basicInfo.company, 100);
        sanitized.basicInfo.title = safelyTruncateString(sanitized.basicInfo.title, 100);
        sanitized.basicInfo.location = safelyTruncateString(sanitized.basicInfo.location, 100);
        sanitized.basicInfo.workplaceType = safelyTruncateString(sanitized.basicInfo.workplaceType, 50);
    }

    // Sanitize company info
    if (sanitized.companyInfo) {
        sanitized.companyInfo.logo = safelyTruncateString(sanitized.companyInfo.logo, 255);
    }

    // Sanitize arrays
    if (sanitized.jobDescription?.responsibilities) {
        sanitized.jobDescription.responsibilities = sanitized.jobDescription.responsibilities
            .map(resp => safelyTruncateString(resp, 500))
            .filter(Boolean);
    }

    if (sanitized.jobDescription?.technologies) {
        sanitized.jobDescription.technologies = sanitized.jobDescription.technologies
            .map(tech => safelyTruncateString(tech, 100))
            .filter(Boolean);
    }

    if (sanitized.skillsAndRequirements?.matched) {
        sanitized.skillsAndRequirements.matched = sanitized.skillsAndRequirements.matched
            .map(skill => safelyTruncateString(skill, 100))
            .filter(Boolean);
    }

    if (sanitized.benefitsAndPerks) {
        sanitized.benefitsAndPerks = sanitized.benefitsAndPerks
            .map(benefit => safelyTruncateString(benefit, 500))
            .filter(Boolean);
    }

    // Sanitize full description
    if (sanitized.fullDescription) {
        sanitized.fullDescription = safelyTruncateString(sanitized.fullDescription, 5000);
    }

    return sanitized;
};

module.exports = {
    safelyTruncateString,
    sanitizeJobData
};
