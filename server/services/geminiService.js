const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


/*
|--------------------------------------------------------------------------
| Wait Helper
|--------------------------------------------------------------------------
*/

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


/*
|--------------------------------------------------------------------------
| Check Whether Error Is Temporary
|--------------------------------------------------------------------------
*/

const isRetryableError = (error) => {

  const message = error?.message || "";

  const statusCode =
    error?.status ||
    error?.statusCode ||
    error?.code;


  /*
  |--------------------------------------------------------------------------
  | Temporary Gemini / Server Errors
  |--------------------------------------------------------------------------
  */

  if (
    statusCode === 429 ||
    statusCode === 500 ||
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504
  ) {
    return true;
  }


  /*
  |--------------------------------------------------------------------------
  | Sometimes SDK puts status inside error message
  |--------------------------------------------------------------------------
  */

  if (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("504")
  ) {
    return true;
  }


  return false;
};


/*
|--------------------------------------------------------------------------
| Gemini Models
|--------------------------------------------------------------------------
|
| We try the models in this order.
|
| If one model is temporarily unavailable,
| we automatically try the next model.
|
*/

const GEMINI_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite"
];


/*
|--------------------------------------------------------------------------
| Resume Analysis
|--------------------------------------------------------------------------
*/

const analyzeResume = async (resumeText) => {

  /*
  |--------------------------------------------------------------------------
  | AI Prompt
  |--------------------------------------------------------------------------
  */

  const prompt = `
You are an expert AI career advisor and professional resume reviewer.

Analyze the following resume carefully.

Return the analysis in this exact JSON structure:

{
  "score": 0,
  "summary": "",
  "skills": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "recommendedSkills": []
}

Rules:

1. score must be a number from 0 to 100.
2. summary should briefly describe the candidate's profile.
3. skills should contain technical and professional skills found in the resume.
4. strengths should identify the strongest parts of the resume.
5. weaknesses should identify areas that could be improved.
6. suggestions should give practical resume/career improvement suggestions.
7. recommendedSkills should contain useful skills the candidate should learn next.
8. Do not invent experience that is not present in the resume.
9. Keep the analysis useful for a software engineering student.
10. Return ONLY valid JSON.
11. Do not use markdown code blocks.

Resume:

${resumeText}
`;


  /*
  |--------------------------------------------------------------------------
  | Try Each Gemini Model
  |--------------------------------------------------------------------------
  */

  for (
    let modelIndex = 0;
    modelIndex < GEMINI_MODELS.length;
    modelIndex++
  ) {

    const model =
      GEMINI_MODELS[modelIndex];


    console.log(
      "================================="
    );

    console.log(
      `Trying Gemini model: ${model}`
    );

    console.log(
      "================================="
    );


    /*
    |--------------------------------------------------------------------------
    | Retry Current Model
    |--------------------------------------------------------------------------
    |
    | We give each model two attempts.
    |
    */

    const maxRetries = 1;


    for (
      let attempt = 0;
      attempt <= maxRetries;
      attempt++
    ) {

      try {

        console.log(
          `Gemini request: ${model} - Attempt ${
            attempt + 1
          }/${maxRetries + 1}`
        );


        /*
        |--------------------------------------------------------------------------
        | Gemini API Request
        |--------------------------------------------------------------------------
        */

        const response =
          await ai.models.generateContent({

            model: model,

            contents: prompt,

            config: {
              responseMimeType:
                "application/json"
            }

          });


        /*
        |--------------------------------------------------------------------------
        | Get Gemini Response
        |--------------------------------------------------------------------------
        */

        const text =
          response.text;


        if (!text) {

          throw new Error(
            "Gemini returned an empty response"
          );

        }


        console.log(
          `Gemini analysis received from ${model}`
        );


        /*
        |--------------------------------------------------------------------------
        | Parse JSON
        |--------------------------------------------------------------------------
        */

        try {

          const parsedResult =
            JSON.parse(text);


          console.log(
            "Gemini JSON parsed successfully"
          );


          console.log(
            `Successful Gemini model: ${model}`
          );


          return parsedResult;

        } catch (jsonError) {

          console.error(
            "Gemini returned invalid JSON:"
          );

          console.error(text);


          throw new Error(
            "Gemini returned invalid JSON"
          );

        }

      } catch (error) {

        console.error(
          `Gemini API error (${model}):`,
          error.message
        );


        /*
        |--------------------------------------------------------------------------
        | Retry Temporary Error
        |--------------------------------------------------------------------------
        */

        if (
          isRetryableError(error) &&
          attempt < maxRetries
        ) {

          const delay =
            1000 * Math.pow(2, attempt);


          console.log(
            `Temporary Gemini error. Retrying ${model} in ${delay}ms...`
          );


          await wait(delay);

          continue;

        }


        /*
        |--------------------------------------------------------------------------
        | Move To Next Model
        |--------------------------------------------------------------------------
        */

        if (
          isRetryableError(error) &&
          modelIndex <
            GEMINI_MODELS.length - 1
        ) {

          console.log(
            `Model ${model} unavailable. Trying next Gemini model...`
          );


          break;

        }


        /*
        |--------------------------------------------------------------------------
        | Permanent Error
        |--------------------------------------------------------------------------
        */

        if (!isRetryableError(error)) {

          console.error(
            "Gemini returned a non-retryable error."
          );

          throw new Error(
            "Failed to analyze resume with AI"
          );

        }

      }

    }

  }


  /*
  |--------------------------------------------------------------------------
  | All Models Failed
  |--------------------------------------------------------------------------
  */

  console.error(
    "================================="
  );

  console.error(
    "ALL GEMINI MODELS FAILED"
  );

  console.error(
    "================================="
  );


  throw new Error(
    "Failed to analyze resume with AI. Gemini models are temporarily unavailable."
  );
};


/*
|--------------------------------------------------------------------------
| Job Matching Analysis
|--------------------------------------------------------------------------
*/

const analyzeJobMatch = async (
  resumeText,
  jobDescription
) => {

  /*
  |--------------------------------------------------------------------------
  | AI Prompt
  |--------------------------------------------------------------------------
  */

  const prompt = `
You are an expert AI career assistant and job matching system.

Compare the candidate's resume with the provided job description.

Your goal is to determine how closely the candidate's existing skills,
experience, projects, and qualifications match the requirements of the job.

Do not assume or invent experience that is not present in the resume.

Return the analysis in this exact JSON structure:

{
  "score": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "suggestions": []
}

Rules:

1. score must be a number from 0 to 100.
2. matchedSkills should contain skills or technologies that are clearly present in both the resume and job description.
3. missingSkills should contain important skills or requirements mentioned in the job description that are missing or not clearly demonstrated in the resume.
4. strengths should explain the strongest parts of the candidate's profile for this specific job.
5. suggestions should provide practical and specific ways the candidate can improve their resume or skills for this job.
6. Do not invent skills, projects, experience, education, or achievements.
7. Only use information supported by the resume and job description.
8. Focus on the actual requirements of the job.
9. The score should represent overall resume-to-job compatibility.
10. Return ONLY valid JSON.
11. Do not use markdown code blocks.

Candidate Resume:

${resumeText}


Job Description:

${jobDescription}
`;


  /*
  |--------------------------------------------------------------------------
  | Try Each Gemini Model
  |--------------------------------------------------------------------------
  */

  for (
    let modelIndex = 0;
    modelIndex < GEMINI_MODELS.length;
    modelIndex++
  ) {

    const model =
      GEMINI_MODELS[modelIndex];


    console.log(
      "================================="
    );

    console.log(
      `Trying Gemini job matching model: ${model}`
    );

    console.log(
      "================================="
    );


    /*
    |--------------------------------------------------------------------------
    | Retry Current Model
    |--------------------------------------------------------------------------
    */

    const maxRetries = 1;


    for (
      let attempt = 0;
      attempt <= maxRetries;
      attempt++
    ) {

      try {

        console.log(
          `Gemini job matching request: ${model} - Attempt ${
            attempt + 1
          }/${maxRetries + 1}`
        );


        /*
        |--------------------------------------------------------------------------
        | Gemini API Request
        |--------------------------------------------------------------------------
        */

        const response =
          await ai.models.generateContent({

            model: model,

            contents: prompt,

            config: {
              responseMimeType:
                "application/json"
            }

          });


        /*
        |--------------------------------------------------------------------------
        | Get Gemini Response
        |--------------------------------------------------------------------------
        */

        const text =
          response.text;


        if (!text) {

          throw new Error(
            "Gemini returned an empty response"
          );

        }


        console.log(
          `Gemini job matching response received from ${model}`
        );


        /*
        |--------------------------------------------------------------------------
        | Parse JSON
        |--------------------------------------------------------------------------
        */

        try {

          const parsedResult =
            JSON.parse(text);


          console.log(
            "Gemini job matching JSON parsed successfully"
          );


          console.log(
            `Successful Gemini job matching model: ${model}`
          );


          return parsedResult;

        } catch (jsonError) {

          console.error(
            "Gemini job matching returned invalid JSON:"
          );

          console.error(text);


          throw new Error(
            "Gemini job matching returned invalid JSON"
          );

        }

      } catch (error) {

        console.error(
          `Gemini job matching API error (${model}):`,
          error.message
        );


        /*
        |--------------------------------------------------------------------------
        | Retry Temporary Error
        |--------------------------------------------------------------------------
        */

        if (
          isRetryableError(error) &&
          attempt < maxRetries
        ) {

          const delay =
            1000 * Math.pow(2, attempt);


          console.log(
            `Temporary Gemini error. Retrying ${model} in ${delay}ms...`
          );


          await wait(delay);

          continue;

        }


        /*
        |--------------------------------------------------------------------------
        | Move To Next Model
        |--------------------------------------------------------------------------
        */

        if (
          isRetryableError(error) &&
          modelIndex <
            GEMINI_MODELS.length - 1
        ) {

          console.log(
            `Model ${model} unavailable. Trying next Gemini model...`
          );


          break;

        }


        /*
        |--------------------------------------------------------------------------
        | Permanent Error
        |--------------------------------------------------------------------------
        */

        if (!isRetryableError(error)) {

          console.error(
            "Gemini job matching returned a non-retryable error."
          );

          throw new Error(
            "Failed to match resume with job using AI"
          );

        }

      }

    }

  }


  /*
  |--------------------------------------------------------------------------
  | All Models Failed
  |--------------------------------------------------------------------------
  */

  console.error(
    "================================="
  );

  console.error(
    "ALL GEMINI JOB MATCHING MODELS FAILED"
  );

  console.error(
    "================================="
  );


  throw new Error(
    "Failed to match resume with job using AI. Gemini models are temporarily unavailable."
  );
};


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  analyzeResume,
  analyzeJobMatch
};

const analyzeCareerRoadmap = async (
  resumeText,
  recommendedSkills = [],
  missingSkills = []
) => {
  const prompt = `
You are an expert career mentor and technical learning planner.

Create a personalized 4-week software development learning roadmap
for a candidate based on their resume and identified skill gaps.

RESUME:
${resumeText}

SKILLS RECOMMENDED FROM RESUME ANALYSIS:
${recommendedSkills.join(", ")}

SKILLS MISSING FROM JOB MATCHING:
${missingSkills.join(", ")}

IMPORTANT RULES:

1. Focus mainly on the missing and recommended skills.
2. Do not invent experience that is not present in the resume.
3. Build a realistic roadmap for a college student preparing for software jobs.
4. Start with the most important skill gaps.
5. Each week should contain practical learning and coding tasks.
6. Include one practical mini-project or project milestone every week.
7. The final week should focus on integrating the learned skills into a project.
8. Keep the roadmap achievable within 4 weeks.
9. Use technologies relevant to the candidate's existing skills.
10. Return ONLY valid JSON.
11. Do not use markdown.
12. Do not include explanations outside the JSON.

Return exactly this structure:

{
  "title": "string",
  "goal": "string",
  "summary": "string",
  "totalWeeks": 4,
  "weeks": [
    {
      "week": 1,
      "title": "string",
      "objective": "string",
      "skills": ["string"],
      "topics": ["string"],
      "tasks": ["string"],
      "project": "string"
    },
    {
      "week": 2,
      "title": "string",
      "objective": "string",
      "skills": ["string"],
      "topics": ["string"],
      "tasks": ["string"],
      "project": "string"
    },
    {
      "week": 3,
      "title": "string",
      "objective": "string",
      "skills": ["string"],
      "topics": ["string"],
      "tasks": ["string"],
      "project": "string"
    },
    {
      "week": 4,
      "title": "string",
      "objective": "string",
      "skills": ["string"],
      "topics": ["string"],
      "tasks": ["string"],
      "project": "string"
    }
  ]
}
`;

  const result = await generateWithFallback(prompt);

  let cleanedText = result.text.trim();

  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const roadmap = JSON.parse(cleanedText);

  return roadmap;
};