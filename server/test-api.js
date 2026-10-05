require('dotenv').config({ quiet: true });

const port = Number(process.env.PORT) || 5101;
const baseUrl = `http://localhost:${port}`;

async function check(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${body.message || 'Request failed'}`);
  }

  return body;
}

async function runChecks() {
  const health = await check('/');
  const tutors = await check('/tutors');

  console.log(JSON.stringify({
    health: health.message,
    tutorsEndpoint: 'ok',
    tutorCount: tutors.length,
  }, null, 2));
}

runChecks().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
