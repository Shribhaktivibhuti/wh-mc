const express = require("express");
const app = express();
const PORT = 9000;
const linkedIn = require("linkedin-jobs-api");

app.use(express.static(__dirname));
app.use(express.json());

// Initialize OpenAI client properly
function p(lol) {
  let arr = [];
  for (let i = 0; i < lol.length; i++) {
    let c = lol.charAt(i);
    if (c >= "0" && c <= "9") {
      arr.push(c - "0"); // Convert character to number and push it directly
    }
    // Ignore all non-numeric characters
  }
  return arr;
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "\\public\\front3.html");
});

app.get("/api/jobs", async (req, res) => {
  const { keyword, minSalary, experienceLevel, ageRange, extraPrompt } =
    req.query;
  const linkedIn = require("linkedin-jobs-api");

  const queryOptions = {
    keyword: keyword || "software engineer",
    location: "India",
    dateSincePosted: "past Week",
    jobType: "full time",
    remoteFilter: "remote",
    salary: minSalary || "100000",
    experienceLevel: experienceLevel || "entry level",
    limit: "10",
    page: "0",
  };

  try {
    const linkedInJobs = await linkedIn.query(queryOptions);

    const validJobs = linkedInJobs.filter(
      (job) => job && job.position && job.company
    );
    console.log(`Fetched ${validJobs.length} valid jobs`);

    const newArray = validJobs.map((item, index) => ({
      position: item.position,
      index,
      salary: item.salary || "Not specified",
      company: item.company || "Unknown company",
    }));

    const [minAge, maxAge] = (ageRange || "").split("-").map(Number);

    const messages = `Here is a list of job opportunities: ${JSON.stringify(
      newArray
    )}.
                         Your task is to filter these jobs based on the following criteria:
                         - Age range: ${minAge || 0}-${maxAge || 100}
                         - Experience level: ${experienceLevel || "entry level"}
                         - Additional requirements: ${extraPrompt || "None"}
                         Return a comma-separated list of the job indices that match these criteria. 
                         If no jobs match, return an empty list.`;

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(
      "AIzaSyD5woig1WEBRf6LGiufK1CBDd9KG-nLI6w"
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(messages);

    const responseText = result?.response?.text();
    if (!responseText) {
      throw new Error("Gemini API returned an empty response");
    }

    let arr = responseText
      .replace(/\s+/g, "") // Remove all whitespace
      .split(",") // Split by comma
      .map((num) => parseInt(num, 10)) // Convert to numbers
      .filter((item) => !Number.isNaN(item)); // Filter out invalid numbers

    console.log("Filtered indices:", arr);

    const filteredArray = arr
      .map((index) => validJobs[index])
      .filter((job) => job);

    if (filteredArray.length === 0) {
      console.log(
        "No jobs matc, hed the criteria. Returning all jobs as fallback."
      );
      res.json([validJobs[0], validJobs[2], validJobs[5]]); // Fallback: Return all jobs
    } else {
      res.json(filteredArray);
    }
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch jobs. Please try again later." });
  }
});

// Helper function to map experience levels
function mapExperienceLevel(level) {
  const mapping = {
    entry: "internship,entry_level",
    mid: "mid_senior_level,associate",
    senior: "director,executive",
  };
  return mapping[level] || "entry_level";
}

app.get("/homepage", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/homepage`);
});