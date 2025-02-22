// create job
const insertCompany = `
    INSERT INTO companies (name, company_size, linkedin_followers, logo_url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (name) DO UPDATE SET
        company_size = EXCLUDED.company_size,
        linkedin_followers = EXCLUDED.linkedin_followers,
        logo_url = EXCLUDED.logo_url
    RETURNING company_id`;

const insertJob = `
    INSERT INTO jobs (
        job_id,
        company_id,
        title,
        location,
        posted_time,
        applicants_count,
        workplace_type,
        extracted_timestamp,
        source_url,
        full_description
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING job_id`;

const insertResponsibility = `
    INSERT INTO job_responsibilities (job_id, responsibility_text)
    VALUES ($1, $2)`;

const insertTechnology = `
    INSERT INTO technologies (name)
    VALUES ($1)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING technology_id`;

const insertJobTechnology = `
    INSERT INTO job_technologies (job_id, technology_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING`;

const insertSkill = `
    INSERT INTO skills (name)
    VALUES ($1)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING skill_id`;

const insertJobSkill = `
    INSERT INTO job_skills (job_id, skill_id, is_matched)
    VALUES ($1, $2, $3)
    ON CONFLICT DO NOTHING`;

const insertBenefit = `
    INSERT INTO benefits (job_id, benefit_text)
    VALUES ($1, $2)`;


// get Jobs
const getJobs = `
    SELECT 
        j.job_id,
        j.title,
        j.location,
        j.posted_time,
        j.applicants_count,
        j.workplace_type,
        j.extracted_timestamp,
        j.source_url,
        j.full_description,
        c.name as company_name,
        c.company_size,
        c.linkedin_followers,
        c.logo_url,
        ARRAY_AGG(DISTINCT r.responsibility_text) as responsibilities,
        ARRAY_AGG(DISTINCT t.name) as technologies,
        ARRAY_AGG(DISTINCT s.name) as skills,
        ARRAY_AGG(DISTINCT b.benefit_text) as benefits
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.company_id
    LEFT JOIN job_responsibilities r ON j.job_id = r.job_id
    LEFT JOIN job_technologies jt ON j.job_id = jt.job_id
    LEFT JOIN technologies t ON jt.technology_id = t.technology_id
    LEFT JOIN job_skills js ON j.job_id = js.job_id
    LEFT JOIN skills s ON js.skill_id = s.skill_id
    LEFT JOIN benefits b ON j.job_id = b.job_id
    GROUP BY 
        j.job_id,
        j.title,
        j.location,
        j.posted_time,
        j.applicants_count,
        j.workplace_type,
        j.extracted_timestamp,
        j.source_url,
        j.full_description,
        c.name,
        c.company_size,
        c.linkedin_followers,
        c.logo_url
    ORDER BY j.extracted_timestamp DESC
    LIMIT $1 OFFSET $2`;

module.exports = {
    // create job
    insertCompany,
    insertJob,
    insertResponsibility,
    insertTechnology,
    insertJobTechnology,
    insertSkill,
    insertJobSkill,
    insertBenefit,
    // get Jobs
    getJobs
};