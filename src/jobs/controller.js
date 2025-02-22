const pool = require('../../db');
const queries = require('./queries');
const { sanitizeJobData } = require('../../utils/dataValidator');

const createJobPosting = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        const sanitizedData = sanitizeJobData(req.body);

        // 1. Insert company
        const companyResult = await client.query(queries.insertCompany, [
            sanitizedData.basicInfo.company,
            sanitizedData.companyInfo.size,
            sanitizedData.companyInfo.linkedInFollowers,
            sanitizedData.companyInfo.logo
        ]);
        const companyId = companyResult.rows[0].company_id;

        // 2. Insert job
        const jobId = Math.random().toString(36).substring(2, 15);
        const jobResult = await client.query(queries.insertJob, [
            jobId,
            companyId,
            sanitizedData.basicInfo.title || 'Not specified',
            sanitizedData.basicInfo.location,
            sanitizedData.basicInfo.postedTime,
            sanitizedData.basicInfo.applicants,
            sanitizedData.basicInfo.workplaceType,
            sanitizedData.metadata.extracted_timestamp,
            sanitizedData.metadata.source_url,
            sanitizedData.fullDescription
        ]);

        // 3. Insert responsibilities
        if (sanitizedData.jobDescription?.responsibilities) {
            for (const resp of sanitizedData.jobDescription.responsibilities) {
                await client.query(queries.insertResponsibility, [jobId, resp]);
            }
        }

        // 4. Insert technologies
        if (sanitizedData.jobDescription?.technologies) {
            for (const tech of sanitizedData.jobDescription.technologies) {
                const techResult = await client.query(queries.insertTechnology, [tech]);
                const techId = techResult.rows[0].technology_id;
                await client.query(queries.insertJobTechnology, [jobId, techId]);
            }
        }

        // 5. Insert skills
        if (sanitizedData.skillsAndRequirements?.matched) {
            for (const skill of sanitizedData.skillsAndRequirements.matched) {
                const skillResult = await client.query(queries.insertSkill, [skill]);
                const skillId = skillResult.rows[0].skill_id;
                await client.query(queries.insertJobSkill, [jobId, skillId, true]);
            }
        }

        // 6. Insert benefits
        if (sanitizedData.benefitsAndPerks) {
            for (const benefit of sanitizedData.benefitsAndPerks) {
                await client.query(queries.insertBenefit, [jobId, benefit]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({
            message: 'Job posting created successfully',
            jobId: jobId
        });

    } catch (error) {
        console.error('Error details:', error);
        await client.query('ROLLBACK');
        res.status(500).json({
            error: 'Error creating job posting',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });

    } finally {
        client.release();
    }
};

const getJobListings = async (req, res) => {
    const client = await pool.connect();
    try {
        // Parse pagination parameters
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        // Execute query with pagination
        const result = await client.query(queries.getJobs, [limit, offset]);

        // Transform the raw data into a more structured format
        const jobs = result.rows.map(row => ({
            jobId: row.job_id,
            basicInfo: {
                title: row.title,
                company: row.company_name,
                location: row.location,
                postedTime: row.posted_time,
                applicants: row.applicants_count,
                workplaceType: row.workplace_type
            },
            companyInfo: {
                size: row.company_size,
                linkedInFollowers: row.linkedin_followers,
                logo: row.logo_url
            },
            jobDescription: {
                responsibilities: row.responsibilities.filter(r => r !== null),
                technologies: row.technologies.filter(t => t !== null)
            },
            skillsAndRequirements: {
                matched: row.skills.filter(s => s !== null)
            },
            benefitsAndPerks: row.benefits.filter(b => b !== null),
            metadata: {
                extracted_timestamp: row.extracted_timestamp,
                source_url: row.source_url
            },
            fullDescription: row.full_description
        }));

        res.status(200).json({
            status: 'success',
            data: {
                jobs,
                pagination: {
                    page,
                    limit,
                    total: result.rowCount // Note: This is just the current page count
                }
            }
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching job listings',
            details: error.message
        });

    } finally {
        client.release();
    }
};

module.exports = {
    createJobPosting,
    getJobListings
};
