import { PrismaClient, Role, SessionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Create Admin User
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('AdminPass123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edumate.com' },
    update: {},
    create: {
      email: 'admin@edumate.com',
      name: 'System Administrator',
      passwordHash: adminPassword,
      role: Role.admin,
      phone: '+27 12 420 0000',
    },
  });

  // 2. Create 5 Tutors with different specialties
  console.log('Creating tutors...');
  const tutorData = [
    {
      email: 'tutor1@edumate.com',
      name: 'Dr. Sarah Mitchell',
      phone: '+27 83 111 2001',
      password: 'TutorPass123!',
      bio: 'Experienced Computer Science professor with 10+ years teaching software engineering and programming.',
      specialties: ['Software Engineering', 'Java Programming', 'Design Patterns', 'Object-Oriented Programming'],
      campusLocation: 'West Campus - Engineering Building',
      qualifications: [
        { degree: 'PhD in Computer Science', institution: 'University of Cape Town', year: '2012', status: 'Verified' },
        { degree: 'MSc in Software Engineering', institution: 'Stellenbosch University', year: '2008', status: 'Verified' }
      ]
    },
    {
      email: 'tutor2@edumate.com', 
      name: 'Prof. Michael Chen',
      phone: '+27 83 111 2002',
      password: 'TutorPass123!',
      bio: 'Mathematics and Statistics expert with research focus on data science and machine learning.',
      specialties: ['Mathematics', 'Statistics', 'Data Science', 'Machine Learning'],
      campusLocation: 'Main Campus - Science Building',
      qualifications: [
        { degree: 'PhD in Applied Mathematics', institution: 'University of the Witwatersrand', year: '2010', status: 'Verified' },
        { degree: 'MSc in Statistics', institution: 'University of Pretoria', year: '2006', status: 'Verified' }
      ]
    },
    {
      email: 'tutor3@edumate.com',
      name: 'Dr. Emma Thompson', 
      phone: '+27 83 111 2003',
      password: 'TutorPass123!',
      bio: 'Business and Economics lecturer specializing in financial accounting and management principles.',
      specialties: ['Accounting', 'Finance', 'Business Management', 'Economics'],
      campusLocation: 'South Campus - Business School',
      qualifications: [
        { degree: 'PhD in Business Administration', institution: 'University of Cape Town', year: '2014', status: 'Verified' },
        { degree: 'CA(SA) - Chartered Accountant', institution: 'SAICA', year: '2009', status: 'Verified' }
      ]
    },
    {
      email: 'tutor4@edumate.com',
      name: 'Mr. David Rodriguez',
      phone: '+27 83 111 2004', 
      password: 'TutorPass123!',
      bio: 'Physics and Chemistry tutor with passion for helping students understand complex scientific concepts.',
      specialties: ['Physics', 'Chemistry', 'Scientific Computing', 'Laboratory Techniques'],
      campusLocation: 'Main Campus - Natural Sciences Complex',
      qualifications: [
        { degree: 'MSc in Physics', institution: 'Rhodes University', year: '2016', status: 'Verified' },
        { degree: 'BSc Honours in Chemistry', institution: 'University of KwaZulu-Natal', year: '2013', status: 'Verified' }
      ]
    },
    {
      email: 'tutor5@edumate.com',
      name: 'Dr. Lisa van der Merwe',
      phone: '+27 83 111 2005',
      password: 'TutorPass123!',
      bio: 'Language and Communications expert helping students with academic writing and presentations.',
      specialties: ['Academic Writing', 'English Literature', 'Communication Skills', 'Research Methods'],
      campusLocation: 'East Campus - Humanities Building',
      qualifications: [
        { degree: 'PhD in English Literature', institution: 'University of the Witwatersrand', year: '2011', status: 'Verified' },
        { degree: 'MA in Applied Linguistics', institution: 'Stellenbosch University', year: '2007', status: 'Verified' }
      ]
    }
  ];

  const tutors = [];
  for (const tutorInfo of tutorData) {
    const hashedPassword = await bcrypt.hash(tutorInfo.password, 10);
    const tutor = await prisma.user.upsert({
      where: { email: tutorInfo.email },
      update: {},
      create: {
        email: tutorInfo.email,
        name: tutorInfo.name,
        passwordHash: hashedPassword,
        role: Role.tutor,
        phone: tutorInfo.phone,
        campusLocation: tutorInfo.campusLocation,
        qualifications: tutorInfo.qualifications,
      },
    });
    tutors.push({ ...tutor, bio: tutorInfo.bio, specialties: tutorInfo.specialties });
  }

  // 3. Create 5 Students with diverse backgrounds
  console.log('Creating students...');
  const studentData = [
    {
      email: 'student1@edumate.com',
      name: 'John Smith',
      phone: '+27 83 222 3001',
      password: 'StudentPass123!',
      bio: 'Computer Science major interested in software development and artificial intelligence.',
      favoriteSubjects: ['Programming', 'Software Engineering', 'AI', 'Data Structures'],
      studentId: 'ST2024001',
      program: 'Bachelor of Science in Computer Science',
      academicYear: '3rd Year',
      faculty: 'Faculty of Natural and Agricultural Sciences'
    },
    {
      email: 'student2@edumate.com',
      name: 'Alice Johnson',
      phone: '+27 83 222 3002',
      password: 'StudentPass123!',
      bio: 'Business Administration student with focus on digital marketing and entrepreneurship.',
      favoriteSubjects: ['Business Management', 'Marketing', 'Economics', 'Accounting'],
      studentId: 'ST2024002',
      program: 'Bachelor of Commerce in Business Administration',
      academicYear: '2nd Year',
      faculty: 'Faculty of Economic and Management Sciences'
    },
    {
      email: 'student3@edumate.com',
      name: 'Mohammed Al-Hassan',
      phone: '+27 83 222 3003', 
      password: 'StudentPass123!',
      bio: 'Engineering student specializing in mechanical systems and renewable energy.',
      favoriteSubjects: ['Mathematics', 'Physics', 'Engineering', 'Environmental Science'],
      studentId: 'ST2024003',
      program: 'Bachelor of Engineering in Mechanical Engineering',
      academicYear: '3rd Year',
      faculty: 'Faculty of Engineering, Built Environment and Information Technology'
    },
    {
      email: 'student4@edumate.com',
      name: 'Priya Patel',
      phone: '+27 83 222 3004',
      password: 'StudentPass123!',
      bio: 'Pre-med student excelling in biological sciences and chemistry.',
      favoriteSubjects: ['Biology', 'Chemistry', 'Mathematics', 'Research Methods'],
      studentId: 'ST2024004',
      program: 'Bachelor of Science in Life Sciences',
      academicYear: '2nd Year',
      faculty: 'Faculty of Natural and Agricultural Sciences'
    },
    {
      email: 'student5@edumate.com',
      name: 'James Wilson',
      phone: '+27 83 222 3005',
      password: 'StudentPass123!',
      bio: 'Communications major with interests in journalism and digital media production.',
      favoriteSubjects: ['English Literature', 'Media Studies', 'Writing', 'Communications'],
      studentId: 'ST2024005',
      program: 'Bachelor of Arts in Communication and Media Studies',
      academicYear: '4th Year',
      faculty: 'Faculty of Humanities'
    }
  ];

  const students = [];
  for (const studentInfo of studentData) {
    const hashedPassword = await bcrypt.hash(studentInfo.password, 10);
    const student = await prisma.user.upsert({
      where: { email: studentInfo.email },
      update: {},
      create: {
        email: studentInfo.email,
        name: studentInfo.name,
        passwordHash: hashedPassword,
        role: Role.student,
        phone: studentInfo.phone,
        studentId: studentInfo.studentId,
        program: studentInfo.program,
        academicYear: studentInfo.academicYear,
        faculty: studentInfo.faculty,
      },
    });
    students.push({ ...student, bio: studentInfo.bio, favoriteSubjects: studentInfo.favoriteSubjects });
  }

  // 4. Create diverse modules for different subjects
  console.log('Creating modules...');
  const moduleData = [
    { code: 'CMPG-321', name: 'Software Engineering', faculty: 'Faculty of Natural and Agricultural Sciences' },
    { code: 'STAT-244', name: 'Statistical Methods', faculty: 'Faculty of Natural and Agricultural Sciences' },
    { code: 'ACCF-111', name: 'Financial Accounting', faculty: 'Faculty of Economic and Management Sciences' },
    { code: 'PHYS-144', name: 'General Physics', faculty: 'Faculty of Natural and Agricultural Sciences' },
    { code: 'ENGL-178', name: 'Academic Literacy', faculty: 'Faculty of Humanities' },
    { code: 'MATH-114', name: 'Mathematics for Scientists', faculty: 'Faculty of Natural and Agricultural Sciences' },
    { code: 'CHEM-154', name: 'General Chemistry', faculty: 'Faculty of Natural and Agricultural Sciences' },
    { code: 'ECON-214', name: 'Microeconomics', faculty: 'Faculty of Economic and Management Sciences' },
    { code: 'BIOL-144', name: 'General Biology', faculty: 'Faculty of Natural and Agricultural Sciences' },
    { code: 'COMM-278', name: 'Media and Society', faculty: 'Faculty of Humanities' }
  ];

  const modules = [];
  for (const moduleInfo of moduleData) {
    const module = await prisma.module.upsert({
      where: { code: moduleInfo.code },
      update: {},
      create: moduleInfo,
    });
    modules.push(module);
  }

  // 5. Link tutors to appropriate modules based on their specialties
  console.log('Linking tutors to modules...');
  const tutorModuleAssignments = [
    { tutorIndex: 0, moduleIndexes: [0, 5] }, // Dr. Sarah Mitchell -> Software Engineering, Math
    { tutorIndex: 1, moduleIndexes: [1, 5] }, // Prof. Michael Chen -> Statistics, Math
    { tutorIndex: 2, moduleIndexes: [2, 7] }, // Dr. Emma Thompson -> Accounting, Economics
    { tutorIndex: 3, moduleIndexes: [3, 6] }, // Mr. David Rodriguez -> Physics, Chemistry
    { tutorIndex: 4, moduleIndexes: [4, 9] }, // Dr. Lisa van der Merwe -> Academic Literacy, Communications
  ];

  for (const assignment of tutorModuleAssignments) {
    for (const moduleIndex of assignment.moduleIndexes) {
      await prisma.tutorModule.upsert({
        where: { 
          tutorId_moduleId: { 
            tutorId: tutors[assignment.tutorIndex].id, 
            moduleId: modules[moduleIndex].id 
          } 
        },
        update: {},
        create: {
          tutorId: tutors[assignment.tutorIndex].id,
          moduleId: modules[moduleIndex].id,
          approvedByAdmin: true,
        },
      });
    }
  }

  // 6. Create user profiles for all users
  console.log('Creating user profiles...');
  
  // Admin profile
  await prisma.userProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      bio: 'System administrator managing the EduMate platform and ensuring smooth operations.',
      specialties: ['System Administration', 'User Management', 'Platform Oversight'],
      totalSessions: 0,
      completedSessions: 0,
      averageRating: 0,
      isOnline: true
    }
  });

  // Tutor profiles
  for (let i = 0; i < tutors.length; i++) {
    await prisma.userProfile.upsert({
      where: { userId: tutors[i].id },
      update: {},
      create: {
        userId: tutors[i].id,
        bio: tutors[i].bio,
        specialties: tutors[i].specialties,
        totalSessions: Math.floor(Math.random() * 50) + 20, // 20-70 sessions
        completedSessions: Math.floor(Math.random() * 45) + 18, // 18-63 sessions
        averageRating: 4.0 + Math.random() * 0.9, // 4.0-4.9 rating
        isOnline: Math.random() > 0.3, // 70% chance of being online
      }
    });
  }

  // Create student profiles with placeholder statistics
  console.log('Creating student profiles...');
  for (let i = 0; i < students.length; i++) {
    // Use placeholder values since we'll only have future sessions without attendance records
    await prisma.userProfile.upsert({
      where: { userId: students[i].id },
      update: {},
      create: {
        userId: students[i].id,
        bio: students[i].bio,
        favoriteSubjects: students[i].favoriteSubjects,
        totalSessions: 0, // Will be updated as they attend sessions
        completedSessions: 0, // Will be updated as they complete sessions
        averageRating: 0, // Will be calculated from future reviews
        isOnline: Math.random() > 0.4, // 60% chance of being online
      }
    });
  }

  // 7. Create some sample sessions (both past and future)
  console.log('Creating sample sessions...');
  const sampleSessions = [];
  
  // Create additional future sessions (spread over next 3 months)
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    for (let i = 0; i < 5; i++) {
      const tutorIndex = Math.floor(Math.random() * tutors.length);
      const tutor = tutors[tutorIndex];
      
      // Get modules this tutor teaches
      const tutorModules = await prisma.tutorModule.findMany({
        where: { tutorId: tutor.id },
        include: { module: true }
      });
      
      if (tutorModules.length > 0) {
        const randomModule = tutorModules[Math.floor(Math.random() * tutorModules.length)];
        
        // Create sessions in the future
        const baseDate = new Date();
        baseDate.setMonth(baseDate.getMonth() + monthOffset);
        const startTime = new Date(baseDate.getTime() + (i + 7) * 24 * 60 * 60 * 1000 + Math.random() * 6 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000); // 9am-3pm, starting from next week
        const endTime = new Date(startTime.getTime() + (1 + Math.random() * 0.5) * 60 * 60 * 1000); // 1-1.5 hour sessions
        
        const session = await prisma.session.create({
          data: {
            tutorId: tutor.id,
            moduleId: randomModule.module.id,
            startTime,
            endTime,
            location: `Building E${Math.floor(Math.random() * 9) + 1}, Room ${Math.floor(Math.random() * 300) + 101}`,
            capacity: Math.floor(Math.random() * 15) + 8, // 8-23 capacity
            status: SessionStatus.published,
          },
        });
        sampleSessions.push(session);
      }
    }
  }
  
  // Create immediate upcoming sessions
  for (let i = 0; i < 10; i++) {
    const tutorIndex = Math.floor(Math.random() * tutors.length);
    const tutor = tutors[tutorIndex];
    
    // Get modules this tutor teaches
    const tutorModules = await prisma.tutorModule.findMany({
      where: { tutorId: tutor.id },
      include: { module: true }
    });
    
    if (tutorModules.length > 0) {
      const randomModule = tutorModules[Math.floor(Math.random() * tutorModules.length)];
      
      const startTime = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000 + Math.random() * 8 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + (1 + Math.random()) * 60 * 60 * 1000); // 1-2 hour sessions
      
      const session = await prisma.session.create({
        data: {
          tutorId: tutor.id,
          moduleId: randomModule.module.id,
          startTime,
          endTime,
          location: `Building E${Math.floor(Math.random() * 9) + 1}, Room ${Math.floor(Math.random() * 300) + 101}`,
          capacity: Math.floor(Math.random() * 20) + 5, // 5-25 capacity
          status: SessionStatus.published,
        },
      });
      sampleSessions.push(session);
    }
  }

  // 8. Enroll students in some future sessions
  console.log('Enrolling students in sessions...');
  for (const session of sampleSessions) {
    const numberOfStudents = Math.floor(Math.random() * Math.min(students.length, 3)) + 1; // 1-3 students per session
    const enrolledStudents = students.slice(0, numberOfStudents);
    
    for (const student of enrolledStudents) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          sessionId: session.id,
          status: 'joined',
        },
      });

      // Note: No attendance records or reviews for future sessions
      // These will be created after the sessions actually occur
    }
  }

  // 9. Create group chat conversations for sessions
  console.log('Creating group chat conversations...');
  const groupChats = [];
  
  // Create group chats for the first few sessions
  for (let i = 0; i < Math.min(sampleSessions.length, 4); i++) {
    const session = sampleSessions[i];
    
    // Find the tutor and get their module info
    const sessionWithDetails = await prisma.session.findUnique({
      where: { id: session.id },
      include: {
        tutor: true,
        module: true,
        enrollments: {
          include: {
            student: true
          }
        }
      }
    });

    if (sessionWithDetails && sessionWithDetails.enrollments.length > 0) {
      // Create group conversation with session-specific name
      const groupChat = await prisma.conversation.create({
        data: {
          name: `${sessionWithDetails.module.code} - ${sessionWithDetails.module.name} Session ${session.id}`,
          type: 'session_chat',
          isGroup: true,
          createdBy: sessionWithDetails.tutor.id,
        }
      });

      // Add participants (tutor + enrolled students)
      const participantsToAdd = [
        {
          userId: sessionWithDetails.tutor.id,
          joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Joined 7 days ago
          unreadCount: 0
        },
        ...sessionWithDetails.enrollments.map((enrollment, index) => ({
          userId: enrollment.student.id,
          joinedAt: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000), // Joined 6-1 days ago
          unreadCount: Math.floor(Math.random() * 3)
        }))
      ];

      await prisma.conversationParticipant.createMany({
        data: participantsToAdd.map(participant => ({
          conversationId: groupChat.id,
          ...participant
        }))
      });

      groupChats.push({ ...groupChat, session: sessionWithDetails });
    }
  }

  // 10. Add sample messages to group chats
  console.log('Adding sample messages to group chats...');
  for (const groupChat of groupChats) {
    const messageTemplates = [
      {
        content: `Welcome everyone to our ${groupChat.session.module.name} study group! I'm excited to help you all succeed in this module.`,
        senderId: groupChat.session.tutor.id,
        hoursAgo: 72
      },
      {
        content: 'Thank you! Looking forward to learning with everyone.',
        senderId: groupChat.session.enrollments[0]?.student.id,
        hoursAgo: 70
      },
      {
        content: `I have some questions about the topics we'll be covering. Can't wait for the session!`,
        senderId: groupChat.session.enrollments[1]?.student.id,
        hoursAgo: 68
      },
      {
        content: `Great questions! I've prepared some practice problems that will help. Feel free to ask anything here.`,
        senderId: groupChat.session.tutor.id,
        hoursAgo: 48
      },
      {
        content: `Don't forget our session is scheduled for ${groupChat.session.startTime.toLocaleDateString()} at ${groupChat.session.location}. Bring your textbooks!`,
        senderId: groupChat.session.tutor.id,
        hoursAgo: 12
      }
    ];

    for (const template of messageTemplates) {
      if (template.senderId) {
        await prisma.conversationMessage.create({
          data: {
            conversationId: groupChat.id,
            senderId: template.senderId,
            content: template.content,
            sentAt: new Date(Date.now() - template.hoursAgo * 60 * 60 * 1000)
          }
        });
      }
    }
  }

  // 11. Create additional direct conversations for testing private messaging
  console.log('Creating direct conversations...');
  const directConversations = [];
  
  // Create some direct conversations between students and tutors
  const conversationPairs = [
    { studentIndex: 0, tutorIndex: 0 }, // John Smith <-> Dr. Sarah Mitchell
    { studentIndex: 1, tutorIndex: 2 }, // Alice Johnson <-> Dr. Emma Thompson
    { studentIndex: 2, tutorIndex: 3 }, // Mohammed Al-Hassan <-> Mr. David Rodriguez
    { studentIndex: 3, tutorIndex: 1 }, // Priya Patel <-> Prof. Michael Chen
    { studentIndex: 4, tutorIndex: 4 }  // James Wilson <-> Dr. Lisa van der Merwe
  ];
  
  for (const pair of conversationPairs) {
    const student = students[pair.studentIndex];
    const tutor = tutors[pair.tutorIndex];
    
    const directConv = await prisma.conversation.create({
      data: {
        type: 'direct',
        isGroup: false,
        createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Created 0-5 days ago
      }
    });
    
    // Add participants
    await prisma.conversationParticipant.createMany({
      data: [
        {
          conversationId: directConv.id,
          userId: student.id,
          joinedAt: directConv.createdAt,
          unreadCount: Math.floor(Math.random() * 3)
        },
        {
          conversationId: directConv.id,
          userId: tutor.id,
          joinedAt: directConv.createdAt,
          unreadCount: Math.floor(Math.random() * 2)
        }
      ]
    });
    
    directConversations.push({ ...directConv, student, tutor });
  }
  
  // 12. Add sample messages to direct conversations
  console.log('Adding messages to direct conversations...');
  for (const directConv of directConversations) {
    const messages = [
      {
        content: `Hi ${directConv.tutor.name}, I have a question about the assignment.`,
        senderId: directConv.student.id,
        hoursAgo: 24
      },
      {
        content: `Hello ${directConv.student.name}! I'd be happy to help. What specific part are you struggling with?`,
        senderId: directConv.tutor.id,
        hoursAgo: 23.5
      },
      {
        content: "I'm having trouble understanding the concept we covered in the last session. Could you explain it again?",
        senderId: directConv.student.id,
        hoursAgo: 23
      },
      {
        content: "Of course! Let me break it down step by step. First, let's look at the fundamental principles...",
        senderId: directConv.tutor.id,
        hoursAgo: 22.5
      },
      {
        content: "That makes so much more sense now! Thank you for the detailed explanation.",
        senderId: directConv.student.id,
        hoursAgo: 22
      }
    ];
    
    for (const msg of messages) {
      await prisma.conversationMessage.create({
        data: {
          conversationId: directConv.id,
          senderId: msg.senderId,
          content: msg.content,
          sentAt: new Date(Date.now() - msg.hoursAgo * 60 * 60 * 1000)
        }
      });
    }
    
    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: directConv.id },
      data: { updatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000) }
    });
  }
  
  // 13. Create additional general study groups (not session-specific)
  console.log('Creating general study groups...');
  const generalGroups = [
    {
      name: 'Computer Science Study Group',
      participants: [tutors[0].id, students[0].id, students[2].id], // Dr. Sarah, John, Mohammed
      createdBy: tutors[0].id
    },
    {
      name: 'Math Help Circle',
      participants: [tutors[1].id, students[0].id, students[2].id, students[3].id], // Prof. Chen, John, Mohammed, Priya
      createdBy: tutors[1].id
    },
    {
      name: 'Business Students Network',
      participants: [tutors[2].id, students[1].id, students[4].id], // Dr. Emma, Alice, James
      createdBy: tutors[2].id
    }
  ];
  
  const createdGeneralGroups = [];
  for (const group of generalGroups) {
    const generalGroup = await prisma.conversation.create({
      data: {
        name: group.name,
        type: 'group',
        isGroup: true,
        createdBy: group.createdBy,
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000) // Created 0-10 days ago
      }
    });
    
    // Add participants
    await prisma.conversationParticipant.createMany({
      data: group.participants.map((userId, index) => ({
        conversationId: generalGroup.id,
        userId,
        joinedAt: new Date(generalGroup.createdAt.getTime() + index * 60 * 60 * 1000), // Joined at different times
        unreadCount: Math.floor(Math.random() * 5)
      }))
    });
    
    createdGeneralGroups.push({ ...generalGroup, participants: group.participants });
  }
  
  // 14. Add messages to general study groups
  console.log('Adding messages to general study groups...');
  for (let i = 0; i < createdGeneralGroups.length; i++) {
    const group = createdGeneralGroups[i];
    const messagesByGroup = [
      // Computer Science Study Group messages
      [
        { content: 'Welcome to our Computer Science study group! Let\'s help each other succeed.', senderId: group.participants[0], hoursAgo: 120 },
        { content: 'Thanks for creating this group! I\'m excited to collaborate.', senderId: group.participants[1], hoursAgo: 118 },
        { content: 'This is great! I have some questions about data structures.', senderId: group.participants[2], hoursAgo: 115 },
        { content: 'Perfect timing! I just finished reviewing that topic. Happy to help.', senderId: group.participants[0], hoursAgo: 110 },
        { content: 'Could someone explain the difference between stacks and queues?', senderId: group.participants[1], hoursAgo: 8 },
      ],
      // Math Help Circle messages
      [
        { content: 'Welcome to our Math Help Circle! No question is too basic here.', senderId: group.participants[0], hoursAgo: 96 },
        { content: 'Thank you! I really need help with calculus.', senderId: group.participants[1], hoursAgo: 94 },
        { content: 'I can help with calculus! What specific topics?', senderId: group.participants[2], hoursAgo: 92 },
        { content: 'I\'m also struggling with derivatives. Can we work through some examples?', senderId: group.participants[3], hoursAgo: 90 },
        { content: 'Absolutely! Let\'s schedule a group study session this week.', senderId: group.participants[0], hoursAgo: 6 },
      ],
      // Business Students Network messages
      [
        { content: 'Welcome to the Business Students Network! Let\'s share resources and insights.', senderId: group.participants[0], hoursAgo: 72 },
        { content: 'This is perfect! I\'m working on a marketing project and could use some feedback.', senderId: group.participants[1], hoursAgo: 70 },
        { content: 'I\'d be happy to look at it! I\'m focusing on digital marketing this semester.', senderId: group.participants[2], hoursAgo: 68 },
        { content: 'Great! I\'ll share the draft with you both tomorrow.', senderId: group.participants[1], hoursAgo: 4 },
      ]
    ];
    
    for (const msg of messagesByGroup[i] || []) {
      await prisma.conversationMessage.create({
        data: {
          conversationId: group.id,
          senderId: msg.senderId,
          content: msg.content,
          sentAt: new Date(Date.now() - msg.hoursAgo * 60 * 60 * 1000)
        }
      });
    }
    
    // Update conversation timestamp
    const lastMessage = messagesByGroup[i]?.slice(-1)[0];
    if (lastMessage) {
      await prisma.conversation.update({
        where: { id: group.id },
        data: { updatedAt: new Date(Date.now() - lastMessage.hoursAgo * 60 * 60 * 1000) }
      });
    }
  }
  
  // 15. Create dashboard stats for users
  for (const tutor of tutors) {
    await prisma.dashboardStats.upsert({
      where: { userId: tutor.id },
      update: {},
      create: {
        userId: tutor.id,
        activeTutors: 0, // Not applicable for tutors
        sessionsThisMonth: Math.floor(Math.random() * 15) + 5,
        upcomingSessions: Math.floor(Math.random() * 8) + 2,
        averageRating: 4.0 + Math.random() * 0.9,
        totalSessions: Math.floor(Math.random() * 50) + 20,
        completedSessions: Math.floor(Math.random() * 45) + 18,
      }
    });
  }

  for (const student of students) {
    await prisma.dashboardStats.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        activeTutors: Math.floor(Math.random() * 5) + 1,
        sessionsThisMonth: Math.floor(Math.random() * 10) + 2,
        upcomingSessions: Math.floor(Math.random() * 5) + 1,
        averageRating: 0, // Students don't have ratings
        totalSessions: Math.floor(Math.random() * 20) + 5,
        completedSessions: Math.floor(Math.random() * 18) + 3,
      }
    });
  }
  console.log('\n🎉 Database seeding completed successfully!');
  
  console.log('\n=== 📊 SEED DATA SUMMARY ===');
  console.log(`👥 Total Users: ${1 + tutors.length + students.length} (1 Admin, ${tutors.length} Tutors, ${students.length} Students)`);
  console.log(`📚 Modules: ${modules.length}`);
  console.log(`🎓 Sample Sessions: ${sampleSessions.length}`);
  console.log(`🔗 Tutor-Module Links: ${tutorModuleAssignments.reduce((sum, assignment) => sum + assignment.moduleIndexes.length, 0)}`);
  console.log(`👤 User Profiles: ${1 + tutors.length + students.length}`);
  console.log(`💬 Session Group Chats: ${groupChats.length}`);
  console.log(`💬 General Study Groups: ${createdGeneralGroups.length}`);
  console.log(`💬 Direct Conversations: ${directConversations.length}`);
  console.log(`💬 Total Conversations: ${groupChats.length + createdGeneralGroups.length + directConversations.length}`);
  console.log(`📝 Total Messages: ${(groupChats.length + createdGeneralGroups.length) * 5 + directConversations.length * 5}`);
  
  console.log('\n=== 🔐 TEST ACCOUNTS ===');
  console.log('\n🔧 ADMIN:');
  console.log('   Email: admin@edumate.com');
  console.log('   Password: AdminPass123!');
  
  console.log('\n👨‍🏫 TUTORS:');
  tutorData.forEach((tutor, index) => {
    console.log(`   ${index + 1}. ${tutor.name}`);
    console.log(`      Email: ${tutor.email}`);
    console.log(`      Password: ${tutor.password}`);
    console.log(`      Specialties: ${tutor.specialties.join(', ')}`);
  });
  
  console.log('\n👨‍🎓 STUDENTS:');
  studentData.forEach((student, index) => {
    console.log(`   ${index + 1}. ${student.name}`);
    console.log(`      Email: ${student.email}`);
    console.log(`      Password: ${student.password}`);
    console.log(`      Interests: ${student.favoriteSubjects.join(', ')}`);
  });
  
  console.log('\n=== 📚 AVAILABLE MODULES ===');
  moduleData.forEach((module, index) => {
    console.log(`   ${index + 1}. ${module.code} - ${module.name}`);
    console.log(`      Faculty: ${module.faculty}`);
  });
  
  console.log('\n✅ All users have been created with proper password hashing!');
  console.log('✅ User profiles and relationships have been established!');
  console.log('✅ Sample sessions and enrollments have been created!');
  console.log('\n🚀 Your EduMate application is ready for testing!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });