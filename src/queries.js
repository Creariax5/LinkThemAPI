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

module.exports = {
    insertCompany,
    insertJob,
    insertResponsibility,
    insertTechnology,
    insertJobTechnology,
    insertSkill,
    insertJobSkill,
    insertBenefit
};