import students from './students.json';
import tutors from './tutors.json';

export async function mockLogin(email, password, userType) {
  const data = userType === "student" ? students : tutors;

  // simulate network delay
  await new Promise(res => setTimeout(res, 500));

  const user = data.find(u => u.email === email && u.password === password);

  if (user) {
    return { ok: true, data: { token: user.token, name: user.name } };
  } else {
    return { ok: false, data: { message: "Invalid email or password" } };
  }
}
