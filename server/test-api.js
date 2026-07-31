const http = require('http');

function testEndpoint(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`${method} ${path} => ${res.statusCode}:`, JSON.stringify(parsed).substring(0, 200));
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          console.log(`${method} ${path} => ${res.statusCode}:`, data.substring(0, 200));
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log(`${method} ${path} => Error:`, e.message);
      reject(e);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Testing API ===\n');
  
  // Test 1: GET / (root)
  await testEndpoint('GET', '/');
  
  // Test 2: GET /tutors
  const tutorsResult = await testEndpoint('GET', '/tutors');
  
  let tutorId = null;
  if (tutorsResult.status === 200 && tutorsResult.data.length > 0) {
    tutorId = tutorsResult.data[0]._id;
    console.log(`\nFirst tutor ID: ${tutorId}`);
    
    // Test 3: GET /tutors/:id
    await testEndpoint('GET', `/tutors/${tutorId}`);
  }
  
  // Test 4: POST /tutors (create tutor)
  const newTutor = {
    name: 'Test Tutor',
    email: 'test@example.com',
    subject: 'Testing',
    bio: 'A test tutor',
    price: 100,
    education: 'PhD in Testing',
    experience: '5 years',
    languages: ['English'],
    availability: ['Monday'],
    totalSlots: 10,
    availableSlots: 10
  };
  const createResult = await testEndpoint('POST', '/tutors', newTutor);
  
  // Test 5: POST /bookings (create booking)
  if (tutorId) {
    const booking = {
      tutorId: tutorId,
      studentEmail: 'student@example.com',
      studentName: 'Test Student',
      date: '2026-08-15',
      timeSlot: '10:00',
      subject: 'Mathematics'
    };
    await testEndpoint('POST', '/bookings', booking);
    
    // Test 6: GET /bookings
    await testEndpoint('GET', '/bookings?email=student@example.com');
  }
  
  console.log('\n=== All tests completed ===');
}

runTests().catch(console.error);