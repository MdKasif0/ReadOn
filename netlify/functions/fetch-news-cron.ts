// This is the scheduled function that Netlify will run.
// The schedule is configured in netlify.toml
export default async () => {
  // Netlify provides the production URL in an environment variable.
  // We fall back to a local URL for testing.
  const siteUrl = process.env.URL || "http://localhost:9002";
  const cronEndpoint = `${siteUrl}/api/cron/fetch-news`;

  try {
    console.log(`Pinging cron endpoint: ${cronEndpoint}`);
    const response = await fetch(cronEndpoint);
    
    if (!response.ok) {
        throw new Error(`Failed to ping cron endpoint: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Cron job executed successfully:", data);

  } catch (error) {
    console.error("Error executing cron job:", error);
  }
};
