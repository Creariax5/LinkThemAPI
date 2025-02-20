const pool = require('../db');
const queries = require('./queries');

const createJobPosting = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        const jobData = req.body;

        // 1. Insert company
        const companyResult = await client.query(queries.insertCompany, [
            jobData.basicInfo.company,
            jobData.companyInfo.size,
            jobData.companyInfo.linkedInFollowers,
            jobData.companyInfo.logo
        ]);
        const companyId = companyResult.rows[0].company_id;

        // 2. Insert job
        const jobId = Math.random().toString(36).substring(2, 15); // Generate a unique ID
        const jobResult = await client.query(queries.insertJob, [
            jobId,
            companyId,
            jobData.basicInfo.title || 'Not specified',
            jobData.basicInfo.location,
            jobData.basicInfo.postedTime,
            jobData.basicInfo.applicants,
            jobData.basicInfo.workplaceType,
            jobData.metadata.extracted_timestamp,
            jobData.metadata.source_url,
            jobData.fullDescription
        ]);

        // 3. Insert responsibilities
        if (jobData.jobDescription.responsibilities) {
            for (const resp of jobData.jobDescription.responsibilities) {
                await client.query(queries.insertResponsibility, [jobId, resp]);
            }
        }

        // 4. Insert technologies
        if (jobData.jobDescription.technologies) {
            for (const tech of jobData.jobDescription.technologies) {
                const techResult = await client.query(queries.insertTechnology, [tech]);
                const techId = techResult.rows[0].technology_id;
                await client.query(queries.insertJobTechnology, [jobId, techId]);
            }
        }

        // 5. Insert skills
        if (jobData.skillsAndRequirements.matched) {
            for (const skill of jobData.skillsAndRequirements.matched) {
                const skillResult = await client.query(queries.insertSkill, [skill]);
                const skillId = skillResult.rows[0].skill_id;
                await client.query(queries.insertJobSkill, [jobId, skillId, true]);
            }
        }

        // 6. Insert benefits
        if (jobData.benefitsAndPerks) {
            for (const benefit of jobData.benefitsAndPerks) {
                await client.query(queries.insertBenefit, [jobId, benefit]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({
            message: 'Job posting created successfully',
            jobId: jobId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({
            error: 'Error creating job posting',
            details: error.message
        });
    } finally {
        client.release();
    }
};

module.exports = {
    createJobPosting
};