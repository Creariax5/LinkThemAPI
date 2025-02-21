const pool = require('../db');
const queries = require('./queries');
const { sanitizeJobData } = require('../utils/dataValidator');

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

const testApi = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is working correctly',
        timestamp: new Date().toISOString()
    });
};

const testDbConnection = async (req, res) => {
    const client = await pool.connect();
    
    try {
        // Try to execute a simple query
        const result = await client.query('SELECT NOW()');
        
        res.status(200).json({
            status: 'success',
            message: 'Database connection successful',
            timestamp: result.rows[0].now,
            database: {
                host: process.env.DATABASE_URL ? 'Connected via URL' : 'Connected via local config',
                ssl: pool.options.ssl ? 'Enabled' : 'Disabled'
            }
        });

    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message
        });

    } finally {
        client.release();
    }
};

module.exports = {
    createJobPosting,
    testApi,
    testDbConnection
};
